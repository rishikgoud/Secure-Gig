const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EscrowDAO Contract", function () {
  let escrow, daoToken, escrowDAO;
  let owner, client, freelancer, voter1, voter2, voter3;
  let escrowAddress, daoTokenAddress, escrowDAOAddress;

  const ESCROW_AMOUNT = ethers.parseEther("1.0");
  const TOKEN_AMOUNT = ethers.parseEther("1000"); // 1000 tokens per voter
  const MIN_TOKEN_BALANCE = ethers.parseEther("100"); // 100 tokens minimum

  beforeEach(async function () {
    [owner, client, freelancer, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy DAO Token
    const DAOToken = await ethers.getContractFactory("DAOToken");
    daoToken = await DAOToken.deploy(owner.address);
    await daoToken.waitForDeployment();
    daoTokenAddress = await daoToken.getAddress();

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(owner.address, owner.address);
    await escrow.waitForDeployment();
    escrowAddress = await escrow.getAddress();

    // Deploy DAO
    const EscrowDAO = await ethers.getContractFactory("EscrowDAO");
    escrowDAO = await EscrowDAO.deploy(owner.address, daoTokenAddress, escrowAddress);
    await escrowDAO.waitForDeployment();
    escrowDAOAddress = await escrowDAO.getAddress();

    // Set DAO contract in Escrow
    await escrow.setDAOContract(escrowDAOAddress);

    // Distribute tokens to voters
    await daoToken.mint(voter1.address, TOKEN_AMOUNT);
    await daoToken.mint(voter2.address, TOKEN_AMOUNT);
    await daoToken.mint(voter3.address, TOKEN_AMOUNT);
    await daoToken.mint(client.address, TOKEN_AMOUNT);
    await daoToken.mint(freelancer.address, TOKEN_AMOUNT);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await escrowDAO.owner()).to.equal(owner.address);
    });

    it("Should set the correct DAO token", async function () {
      expect(await escrowDAO.daoToken()).to.equal(daoTokenAddress);
    });

    it("Should set the correct escrow contract", async function () {
      expect(await escrowDAO.escrowContract()).to.equal(escrowAddress);
    });

    it("Should have correct voting parameters", async function () {
      expect(await escrowDAO.VOTING_PERIOD()).to.equal(3 * 24 * 60 * 60); // 3 days
      expect(await escrowDAO.QUORUM_PERCENTAGE()).to.equal(10); // 10%
      expect(await escrowDAO.MIN_TOKEN_BALANCE()).to.equal(MIN_TOKEN_BALANCE);
    });
  });

  describe("Vote Opening", function () {
    let escrowId;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      escrowId = 1;
      await escrow.connect(client).raiseDispute(escrowId);
    });

    it("Should allow owner to open a vote", async function () {
      await expect(escrowDAO.connect(owner).openVote(escrowId))
        .to.emit(escrowDAO, "VoteOpened");

      expect(await escrowDAO.disputeExists(escrowId)).to.be.true;
      expect(await escrowDAO.isVotingActive(escrowId)).to.be.true;
    });

    it("Should fail if vote already exists", async function () {
      await escrowDAO.connect(owner).openVote(escrowId);
      
      await expect(
        escrowDAO.connect(owner).openVote(escrowId)
      ).to.be.revertedWith("Vote already exists for this escrow");
    });

    it("Should fail if escrow is not disputed", async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work 2", {
        value: ESCROW_AMOUNT
      });
      
      await expect(
        escrowDAO.connect(owner).openVote(2)
      ).to.be.revertedWith("Escrow not disputed");
    });

    it("Should fail if non-owner tries to open vote", async function () {
      await expect(
        escrowDAO.connect(voter1).openVote(escrowId)
      ).to.be.revertedWithCustomError(escrowDAO, "OwnableUnauthorizedAccount");
    });
  });

  describe("Voting", function () {
    let escrowId;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      escrowId = 1;
      await escrow.connect(client).raiseDispute(escrowId);
      await escrowDAO.connect(owner).openVote(escrowId);
    });

    it("Should allow token holders to vote for freelancer", async function () {
      await expect(escrowDAO.connect(voter1).vote(escrowId, true))
        .to.emit(escrowDAO, "VoteCast")
        .withArgs(escrowId, voter1.address, true, TOKEN_AMOUNT);

      expect(await escrowDAO.hasVoted(escrowId, voter1.address)).to.be.true;
      expect(await escrowDAO.getVoterChoice(escrowId, voter1.address)).to.be.true;
    });

    it("Should allow token holders to vote for client", async function () {
      await expect(escrowDAO.connect(voter1).vote(escrowId, false))
        .to.emit(escrowDAO, "VoteCast")
        .withArgs(escrowId, voter1.address, false, TOKEN_AMOUNT);

      expect(await escrowDAO.hasVoted(escrowId, voter1.address)).to.be.true;
      expect(await escrowDAO.getVoterChoice(escrowId, voter1.address)).to.be.false;
    });

    it("Should fail if voter has insufficient tokens", async function () {
      // Transfer tokens away to make balance insufficient
      await daoToken.connect(voter1).transfer(owner.address, TOKEN_AMOUNT - MIN_TOKEN_BALANCE + ethers.parseEther("1"));
      
      await expect(
        escrowDAO.connect(voter1).vote(escrowId, true)
      ).to.be.revertedWith("Insufficient token balance");
    });

    it("Should fail if voter already voted", async function () {
      await escrowDAO.connect(voter1).vote(escrowId, true);
      
      await expect(
        escrowDAO.connect(voter1).vote(escrowId, false)
      ).to.be.revertedWith("Already voted");
    });

    it("Should fail if voting period ended", async function () {
      // Fast forward past voting period
      await time.increase(3 * 24 * 60 * 60 + 1); // 3 days + 1 second
      
      await expect(
        escrowDAO.connect(voter1).vote(escrowId, true)
      ).to.be.revertedWith("Voting period ended");
    });

    it("Should fail if no dispute exists", async function () {
      await expect(
        escrowDAO.connect(voter1).vote(999, true)
      ).to.be.revertedWith("No dispute for this escrow");
    });
  });

  describe("Vote Finalization", function () {
    let escrowId;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      escrowId = 1;
      await escrow.connect(client).raiseDispute(escrowId);
      await escrowDAO.connect(owner).openVote(escrowId);
    });

    it("Should finalize vote with freelancer winning", async function () {
      // Vote for freelancer with majority
      await escrowDAO.connect(voter1).vote(escrowId, true);
      await escrowDAO.connect(voter2).vote(escrowId, true);
      await escrowDAO.connect(voter3).vote(escrowId, false);

      // Fast forward past voting period
      await time.increase(3 * 24 * 60 * 60 + 1);

      const initialBalance = await ethers.provider.getBalance(freelancer.address);

      await expect(escrowDAO.connect(owner).finalizeVote(escrowId))
        .to.emit(escrowDAO, "VoteFinalized");

      const voteData = await escrowDAO.getVote(escrowId);
      expect(voteData.finalized).to.be.true;
      expect(voteData.winner).to.equal(freelancer.address);

      // Check that funds were released
      const finalBalance = await ethers.provider.getBalance(freelancer.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should finalize vote with client winning", async function () {
      // Vote for client with majority
      await escrowDAO.connect(voter1).vote(escrowId, false);
      await escrowDAO.connect(voter2).vote(escrowId, false);
      await escrowDAO.connect(voter3).vote(escrowId, true);

      // Fast forward past voting period
      await time.increase(3 * 24 * 60 * 60 + 1);

      const initialBalance = await ethers.provider.getBalance(client.address);

      await escrowDAO.connect(owner).finalizeVote(escrowId);

      const voteData = await escrowDAO.getVote(escrowId);
      expect(voteData.winner).to.equal(client.address);

      // Check that funds were released
      const finalBalance = await ethers.provider.getBalance(client.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should handle quorum not met", async function () {
      // Only one small vote (not enough for quorum)
      await daoToken.mint(voter1.address, ethers.parseEther("50")); // Small amount
      await escrowDAO.connect(voter1).vote(escrowId, true);

      // Fast forward past voting period
      await time.increase(3 * 24 * 60 * 60 + 1);

      await expect(escrowDAO.connect(owner).finalizeVote(escrowId))
        .to.emit(escrowDAO, "QuorumNotMet");

      const voteData = await escrowDAO.getVote(escrowId);
      expect(voteData.finalized).to.be.true;
      expect(voteData.winner).to.equal(client.address); // Default to client
    });

    it("Should fail if voting period not ended", async function () {
      await escrowDAO.connect(voter1).vote(escrowId, true);
      
      await expect(
        escrowDAO.connect(owner).finalizeVote(escrowId)
      ).to.be.revertedWith("Voting period not ended");
    });

    it("Should fail if vote already finalized", async function () {
      await escrowDAO.connect(voter1).vote(escrowId, true);
      
      // Fast forward and finalize
      await time.increase(3 * 24 * 60 * 60 + 1);
      await escrowDAO.connect(owner).finalizeVote(escrowId);
      
      await expect(
        escrowDAO.connect(owner).finalizeVote(escrowId)
      ).to.be.revertedWith("Vote already finalized");
    });
  });

  describe("View Functions", function () {
    let escrowId;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      escrowId = 1;
      await escrow.connect(client).raiseDispute(escrowId);
      await escrowDAO.connect(owner).openVote(escrowId);
    });

    it("Should return correct vote details", async function () {
      await escrowDAO.connect(voter1).vote(escrowId, true);
      await escrowDAO.connect(voter2).vote(escrowId, false);

      const voteData = await escrowDAO.getVote(escrowId);
      expect(voteData.votesForFreelancer).to.equal(TOKEN_AMOUNT);
      expect(voteData.votesForClient).to.equal(TOKEN_AMOUNT);
      expect(voteData.totalVotes).to.equal(TOKEN_AMOUNT * BigInt(2));
      expect(voteData.finalized).to.be.false;
    });

    it("Should return correct voting power", async function () {
      expect(await escrowDAO.getVotingPower(voter1.address)).to.equal(TOKEN_AMOUNT);
    });

    it("Should return correct can vote status", async function () {
      expect(await escrowDAO.canVote(voter1.address)).to.be.true;
      
      // Transfer tokens to make balance insufficient
      await daoToken.connect(voter1).transfer(owner.address, TOKEN_AMOUNT - MIN_TOKEN_BALANCE + ethers.parseEther("1"));
      expect(await escrowDAO.canVote(voter1.address)).to.be.false;
    });

    it("Should return correct required quorum", async function () {
      const totalSupply = await daoToken.totalSupply();
      const expectedQuorum = (totalSupply * BigInt(10)) / BigInt(100); // 10%
      expect(await escrowDAO.getRequiredQuorum()).to.equal(expectedQuorum);
    });

    it("Should return correct voting active status", async function () {
      expect(await escrowDAO.isVotingActive(escrowId)).to.be.true;
      
      // Fast forward past voting period
      await time.increase(3 * 24 * 60 * 60 + 1);
      expect(await escrowDAO.isVotingActive(escrowId)).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle tie votes correctly", async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      const escrowId = 1;
      await escrow.connect(client).raiseDispute(escrowId);
      await escrowDAO.connect(owner).openVote(escrowId);

      // Equal votes
      await escrowDAO.connect(voter1).vote(escrowId, true);  // For freelancer
      await escrowDAO.connect(voter2).vote(escrowId, false); // For client

      // Fast forward and finalize
      await time.increase(3 * 24 * 60 * 60 + 1);
      await escrowDAO.connect(owner).finalizeVote(escrowId);

      const voteData = await escrowDAO.getVote(escrowId);
      // In case of tie, client wins (votesForFreelancer > votesForClient is false)
      expect(voteData.winner).to.equal(client.address);
    });

    it("Should handle zero votes correctly", async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      const escrowId = 1;
      await escrow.connect(client).raiseDispute(escrowId);
      await escrowDAO.connect(owner).openVote(escrowId);

      // No votes cast
      await time.increase(3 * 24 * 60 * 60 + 1);
      
      await expect(escrowDAO.connect(owner).finalizeVote(escrowId))
        .to.emit(escrowDAO, "QuorumNotMet");

      const voteData = await escrowDAO.getVote(escrowId);
      expect(voteData.winner).to.equal(client.address); // Default to client
    });
  });
});
