const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Escrow Contract", function () {
  let escrow, daoToken, escrowDAO;
  let owner, client, freelancer, feeRecipient, addr1;
  let escrowAddress, daoTokenAddress, escrowDAOAddress;

  const ESCROW_AMOUNT = ethers.parseEther("1.0");
  const PLATFORM_FEE = 250; // 2.5%

  beforeEach(async function () {
    [owner, client, freelancer, feeRecipient, addr1] = await ethers.getSigners();

    // Deploy DAO Token
    const DAOToken = await ethers.getContractFactory("DAOToken");
    daoToken = await DAOToken.deploy(owner.address);
    await daoToken.waitForDeployment();
    daoTokenAddress = await daoToken.getAddress();

    // Deploy GigEscrow
    const GigEscrow = await ethers.getContractFactory("GigEscrow");
    escrow = await GigEscrow.deploy(owner.address, feeRecipient.address);
    await escrow.waitForDeployment();
    escrowAddress = await escrow.getAddress();

    // Deploy DAO
    const EscrowDAO = await ethers.getContractFactory("EscrowDAO");
    escrowDAO = await EscrowDAO.deploy(owner.address, daoTokenAddress, escrowAddress);
    await escrowDAO.waitForDeployment();
    escrowDAOAddress = await escrowDAO.getAddress();

    // Set DAO contract in GigEscrow
    await escrow.setDAOContract(escrowDAOAddress);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await escrow.owner()).to.equal(owner.address);
    });

    it("Should set the right fee recipient", async function () {
      expect(await escrow.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set the correct platform fee", async function () {
      expect(await escrow.platformFee()).to.equal(PLATFORM_FEE);
    });
  });

  describe("Escrow Creation", function () {
    it("Should create an escrow successfully", async function () {
      const deadline = (await time.latest()) + 86400; // 1 day from now
      const description = "Build a website";

      await expect(
        escrow.connect(client).createEscrow(freelancer.address, deadline, description, {
          value: ESCROW_AMOUNT
        })
      ).to.emit(escrow, "EscrowCreated")
        .withArgs(1, client.address, freelancer.address, ESCROW_AMOUNT, deadline);

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.client).to.equal(client.address);
      expect(escrowData.freelancer).to.equal(freelancer.address);
      expect(escrowData.amount).to.equal(ESCROW_AMOUNT);
      expect(escrowData.description).to.equal(description);
    });

    it("Should fail if freelancer is zero address", async function () {
      const deadline = (await time.latest()) + 86400;
      
      await expect(
        escrow.connect(client).createEscrow(ethers.ZeroAddress, deadline, "Test", {
          value: ESCROW_AMOUNT
        })
      ).to.be.revertedWith("Invalid freelancer address");
    });

    it("Should fail if client and freelancer are the same", async function () {
      const deadline = (await time.latest()) + 86400;
      
      await expect(
        escrow.connect(client).createEscrow(client.address, deadline, "Test", {
          value: ESCROW_AMOUNT
        })
      ).to.be.revertedWith("Client and freelancer cannot be the same");
    });

    it("Should fail if amount is zero", async function () {
      const deadline = (await time.latest()) + 86400;
      
      await expect(
        escrow.connect(client).createEscrow(freelancer.address, deadline, "Test", {
          value: 0
        })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should fail if deadline is in the past", async function () {
      const pastDeadline = (await time.latest()) - 3600; // 1 hour ago
      
      await expect(
        escrow.connect(client).createEscrow(freelancer.address, pastDeadline, "Test", {
          value: ESCROW_AMOUNT
        })
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("Work Approval", function () {
    let escrowId;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      escrowId = 1;
    });

    it("Should allow client to approve work", async function () {
      const initialFreelancerBalance = await ethers.provider.getBalance(freelancer.address);
      const initialFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);

      await expect(escrow.connect(client).approveWork(escrowId))
        .to.emit(escrow, "WorkApproved")
        .withArgs(escrowId, client.address);

      const escrowData = await escrow.getEscrow(escrowId);
      expect(escrowData.status).to.equal(1); // Completed
      expect(escrowData.clientApproved).to.be.true;

      // Check balances
      const finalFreelancerBalance = await ethers.provider.getBalance(freelancer.address);
      const finalFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);

      const expectedFee = (ESCROW_AMOUNT * BigInt(PLATFORM_FEE)) / BigInt(10000);
      const expectedPayout = ESCROW_AMOUNT - expectedFee;

      expect(finalFreelancerBalance - initialFreelancerBalance).to.equal(expectedPayout);
      expect(finalFeeRecipientBalance - initialFeeRecipientBalance).to.equal(expectedFee);
    });

    it("Should fail if non-client tries to approve", async function () {
      await expect(
        escrow.connect(freelancer).approveWork(escrowId)
      ).to.be.revertedWith("Only client can approve work");
    });

    it("Should fail if escrow is not active", async function () {
      await escrow.connect(client).approveWork(escrowId); // Complete it first
      
      await expect(
        escrow.connect(client).approveWork(escrowId)
      ).to.be.revertedWith("Escrow not active");
    });
  });

  describe("Dispute Handling", function () {
    let escrowId;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      escrowId = 1;
    });

    it("Should allow client to raise dispute", async function () {
      await expect(escrow.connect(client).raiseDispute(escrowId))
        .to.emit(escrow, "DisputeRaised")
        .withArgs(escrowId, client.address);

      const escrowData = await escrow.getEscrow(escrowId);
      expect(escrowData.status).to.equal(2); // Disputed
      expect(escrowData.disputeRaised).to.be.true;
      expect(escrowData.disputeRaisedBy).to.equal(client.address);
    });

    it("Should allow freelancer to raise dispute", async function () {
      await expect(escrow.connect(freelancer).raiseDispute(escrowId))
        .to.emit(escrow, "DisputeRaised")
        .withArgs(escrowId, freelancer.address);

      const escrowData = await escrow.getEscrow(escrowId);
      expect(escrowData.disputeRaisedBy).to.equal(freelancer.address);
    });

    it("Should fail if non-participant tries to raise dispute", async function () {
      await expect(
        escrow.connect(addr1).raiseDispute(escrowId)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should fail if dispute already raised", async function () {
      await escrow.connect(client).raiseDispute(escrowId);
      
      await expect(
        escrow.connect(freelancer).raiseDispute(escrowId)
      ).to.be.revertedWith("Dispute already raised");
    });
  });

  describe("DAO Resolution", function () {
    let escrowId;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      escrowId = 1;
      await escrow.connect(client).raiseDispute(escrowId);
    });

    it("Should allow DAO to release funds to freelancer", async function () {
      const initialBalance = await ethers.provider.getBalance(freelancer.address);

      await expect(escrow.connect(escrowDAO).releaseTo(escrowId, freelancer.address))
        .to.emit(escrow, "DisputeResolved")
        .withArgs(escrowId, freelancer.address, ESCROW_AMOUNT);

      const escrowData = await escrow.getEscrow(escrowId);
      expect(escrowData.status).to.equal(3); // Resolved

      const finalBalance = await ethers.provider.getBalance(freelancer.address);
      const expectedFee = (ESCROW_AMOUNT * BigInt(PLATFORM_FEE)) / BigInt(10000);
      const expectedPayout = ESCROW_AMOUNT - expectedFee;
      
      expect(finalBalance - initialBalance).to.equal(expectedPayout);
    });

    it("Should allow DAO to release funds to client", async function () {
      const initialBalance = await ethers.provider.getBalance(client.address);

      await escrow.connect(escrowDAO).releaseTo(escrowId, client.address);

      const finalBalance = await ethers.provider.getBalance(client.address);
      const expectedFee = (ESCROW_AMOUNT * BigInt(PLATFORM_FEE)) / BigInt(10000);
      const expectedPayout = ESCROW_AMOUNT - expectedFee;
      
      expect(finalBalance - initialBalance).to.equal(expectedPayout);
    });

    it("Should fail if non-DAO tries to release funds", async function () {
      await expect(
        escrow.connect(client).releaseTo(escrowId, freelancer.address)
      ).to.be.revertedWith("Only DAO can call this");
    });

    it("Should fail if escrow is not disputed", async function () {
      // Create a new escrow that's not disputed
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work 2", {
        value: ESCROW_AMOUNT
      });
      
      await expect(
        escrow.connect(escrowDAO).releaseTo(2, freelancer.address)
      ).to.be.revertedWith("Escrow not disputed");
    });
  });

  describe("Emergency Functions", function () {
    let escrowId;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Test work", {
        value: ESCROW_AMOUNT
      });
      escrowId = 1;
    });

    it("Should allow owner to emergency refund", async function () {
      const initialBalance = await ethers.provider.getBalance(client.address);

      await expect(escrow.connect(owner).emergencyRefund(escrowId))
        .to.emit(escrow, "EscrowRefunded")
        .withArgs(escrowId, ESCROW_AMOUNT);

      const finalBalance = await ethers.provider.getBalance(client.address);
      expect(finalBalance - initialBalance).to.equal(ESCROW_AMOUNT);
    });

    it("Should fail if non-owner tries emergency refund", async function () {
      await expect(
        escrow.connect(client).emergencyRefund(escrowId)
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return correct client escrows", async function () {
      const deadline = (await time.latest()) + 86400;
      
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Work 1", {
        value: ESCROW_AMOUNT
      });
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Work 2", {
        value: ESCROW_AMOUNT
      });

      const clientEscrows = await escrow.getClientEscrows(client.address);
      expect(clientEscrows.length).to.equal(2);
      expect(clientEscrows[0]).to.equal(1);
      expect(clientEscrows[1]).to.equal(2);
    });

    it("Should return correct freelancer escrows", async function () {
      const deadline = (await time.latest()) + 86400;
      
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Work 1", {
        value: ESCROW_AMOUNT
      });
      await escrow.connect(addr1).createEscrow(freelancer.address, deadline, "Work 2", {
        value: ESCROW_AMOUNT
      });

      const freelancerEscrows = await escrow.getFreelancerEscrows(freelancer.address);
      expect(freelancerEscrows.length).to.equal(2);
      expect(freelancerEscrows[0]).to.equal(1);
      expect(freelancerEscrows[1]).to.equal(2);
    });

    it("Should return correct total escrows count", async function () {
      expect(await escrow.getTotalEscrows()).to.equal(0);

      const deadline = (await time.latest()) + 86400;
      await escrow.connect(client).createEscrow(freelancer.address, deadline, "Work 1", {
        value: ESCROW_AMOUNT
      });

      expect(await escrow.getTotalEscrows()).to.equal(1);
    });
  });
});
