// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecureGig Smart Contracts
 * @dev Complete smart contract suite for SecureGig freelance platform
 * @notice Contains DAOToken, GigEscrow, and EscrowDAO contracts for secure freelance payments
 * @custom:dev-run-script scripts/deploy.js
 */

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DAOToken
 * @dev ERC20 governance token for SecureGig DAO voting
 * @notice This token is used for voting on escrow disputes
 */
contract DAOToken is ERC20, ERC20Votes, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1M tokens
    uint256 public constant MAX_SUPPLY = 10000000 * 10**18; // 10M max supply
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    constructor(
        address initialOwner
    ) ERC20("SecureGig DAO Token", "SGDT") Ownable(initialOwner) EIP712("SecureGig DAO Token", "1") {
        _mint(initialOwner, INITIAL_SUPPLY);
        minters[initialOwner] = true;
    }
    
    /**
     * @dev Mint new tokens (only by authorized minters)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyMinter {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Add a new minter
     * @param minter Address to add as minter
     */
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter
     * @param minter Address to remove as minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Distribute tokens to multiple addresses (for testing/airdrops)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to distribute
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyMinter {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
    
    // Override required by Solidity for multiple inheritance
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }
    
    function nonces(address owner) public view override(Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}

/**
 * @title GigEscrow
 * @dev Secure escrow contract for freelance gig payments with gig-based mapping
 * @notice Handles escrow creation, work approval, and refunds for specific gigs
 */
contract GigEscrow is ReentrancyGuard, Ownable, Pausable {
    
    enum EscrowStatus {
        Pending,     // Escrow created, funds locked
        Active,      // Freelancer working, funds secured
        Completed,   // Work approved, funds released
        Cancelled,   // Gig cancelled, funds refunded
        Disputed     // Dispute raised, requires DAO voting
    }
    
    struct EscrowData {
        uint256 gigId;
        address client;
        address freelancer;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        string gigTitle;
        bool exists;
    }
    
    // State variables
    mapping(uint256 => EscrowData) public escrows;
    mapping(address => uint256[]) public clientEscrows;
    mapping(address => uint256[]) public freelancerEscrows;
    
    // Platform fee configuration (in basis points, 100 = 1%)
    uint256 public platformFee = 250; // 2.5%
    address public feeRecipient;
    
    // Events
    event EscrowCreated(
        uint256 indexed gigId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        string gigTitle
    );
    
    event EscrowFunded(
        uint256 indexed gigId,
        address indexed client,
        uint256 amount
    );
    
    event EscrowReleased(
        uint256 indexed gigId,
        address indexed freelancer,
        uint256 amount
    );
    
    event EscrowRefunded(
        uint256 indexed gigId,
        address indexed client,
        uint256 amount
    );
    
    // Modifiers
    modifier validGig(uint256 gigId) {
        require(escrows[gigId].exists, "Gig escrow does not exist");
        _;
    }
    
    modifier onlyClient(uint256 gigId) {
        require(msg.sender == escrows[gigId].client, "Only client can call this");
        _;
    }
    
    modifier onlyFreelancer(uint256 gigId) {
        require(msg.sender == escrows[gigId].freelancer, "Only freelancer can call this");
        _;
    }
    
    constructor(address initialOwner, address _feeRecipient) Ownable(initialOwner) {
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create escrow for a gig and lock funds
     * @param gigId Unique identifier for the gig
     * @param freelancer Address of the freelancer
     * @param gigTitle Title of the gig
     */
    function createEscrow(
        uint256 gigId,
        address freelancer,
        string calldata gigTitle
    ) external payable nonReentrant whenNotPaused {
        require(freelancer != address(0), "Invalid freelancer address");
        require(freelancer != msg.sender, "Client and freelancer cannot be the same");
        require(msg.value > 0, "Amount must be greater than 0");
        require(!escrows[gigId].exists, "Escrow already exists for this gig");
        require(bytes(gigTitle).length > 0, "Gig title cannot be empty");
        
        escrows[gigId] = EscrowData({
            gigId: gigId,
            client: msg.sender,
            freelancer: freelancer,
            amount: msg.value,
            status: EscrowStatus.Pending,
            createdAt: block.timestamp,
            gigTitle: gigTitle,
            exists: true
        });
        
        clientEscrows[msg.sender].push(gigId);
        freelancerEscrows[freelancer].push(gigId);
        
        emit EscrowCreated(gigId, msg.sender, freelancer, msg.value, gigTitle);
        emit EscrowFunded(gigId, msg.sender, msg.value);
    }
    
    /**
     * @dev Release escrow funds to freelancer (only callable by client)
     * @param gigId ID of the gig
     */
    function releaseEscrow(uint256 gigId) external validGig(gigId) onlyClient(gigId) nonReentrant {
        EscrowData storage escrow = escrows[gigId];
        
        require(
            escrow.status == EscrowStatus.Pending || escrow.status == EscrowStatus.Active,
            "Escrow cannot be released"
        );
        
        escrow.status = EscrowStatus.Completed;
        
        uint256 amount = escrow.amount;
        escrow.amount = 0;
        
        // Calculate platform fee
        uint256 fee = (amount * platformFee) / 10000;
        uint256 payout = amount - fee;
        
        // Transfer fee to platform
        if (fee > 0 && feeRecipient != address(0)) {
            (bool feeSuccess, ) = feeRecipient.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // Transfer remaining amount to freelancer
        (bool success, ) = escrow.freelancer.call{value: payout}("");
        require(success, "Transfer to freelancer failed");
        
        emit EscrowReleased(gigId, escrow.freelancer, payout);
    }
    
    /**
     * @dev Refund escrow to client (only callable by client)
     * @param gigId ID of the gig
     */
    function refundEscrow(uint256 gigId) external validGig(gigId) onlyClient(gigId) nonReentrant {
        EscrowData storage escrow = escrows[gigId];
        
        require(
            escrow.status == EscrowStatus.Pending || escrow.status == EscrowStatus.Active,
            "Escrow cannot be refunded"
        );
        
        escrow.status = EscrowStatus.Cancelled;
        
        uint256 amount = escrow.amount;
        escrow.amount = 0;
        
        // Refund full amount to client (no fee deduction for cancellations)
        (bool success, ) = escrow.client.call{value: amount}("");
        require(success, "Refund to client failed");
        
        emit EscrowRefunded(gigId, escrow.client, amount);
    }
    
    /**
     * @dev Mark escrow as active (freelancer starts working)
     * @param gigId ID of the gig
     */
    function startWork(uint256 gigId) external validGig(gigId) onlyFreelancer(gigId) {
        EscrowData storage escrow = escrows[gigId];
        require(escrow.status == EscrowStatus.Pending, "Work already started or completed");
        
        escrow.status = EscrowStatus.Active;
    }
    
    /**
     * @dev Get escrow details for a gig
     * @param gigId ID of the gig
     */
    function getEscrow(uint256 gigId) external view validGig(gigId) returns (EscrowData memory) {
        return escrows[gigId];
    }
    
    /**
     * @dev Get client's escrow gig IDs
     * @param client Address of the client
     */
    function getClientEscrows(address client) external view returns (uint256[] memory) {
        return clientEscrows[client];
    }
    
    /**
     * @dev Get freelancer's escrow gig IDs
     * @param freelancer Address of the freelancer
     */
    function getFreelancerEscrows(address freelancer) external view returns (uint256[] memory) {
        return freelancerEscrows[freelancer];
    }
    
    /**
     * @dev Check if escrow exists for a gig
     * @param gigId ID of the gig
     */
    function escrowExists(uint256 gigId) external view returns (bool) {
        return escrows[gigId].exists;
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFee New fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }
    
    /**
     * @dev Update fee recipient (only owner)
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        feeRecipient = newRecipient;
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal (only owner, for emergencies)
     * @param gigId ID of the gig
     */
    function emergencyWithdraw(uint256 gigId) external validGig(gigId) onlyOwner nonReentrant {
        EscrowData storage escrow = escrows[gigId];
        require(escrow.amount > 0, "No funds to withdraw");
        
        uint256 amount = escrow.amount;
        escrow.amount = 0;
        escrow.status = EscrowStatus.Cancelled;
        
        (bool success, ) = escrow.client.call{value: amount}("");
        require(success, "Emergency withdrawal failed");
        
        emit EscrowRefunded(gigId, escrow.client, amount);
    }
    
    /**
     * @dev Release escrow to specified address (only callable by DAO for dispute resolution)
     * @param gigId ID of the gig
     * @param recipient Address to receive the funds (client or freelancer)
     */
    function releaseTo(uint256 gigId, address recipient) external validGig(gigId) onlyOwner nonReentrant {
        EscrowData storage escrow = escrows[gigId];
        require(escrow.status == EscrowStatus.Disputed, "Escrow not in disputed state");
        require(escrow.amount > 0, "No funds to release");
        require(recipient == escrow.client || recipient == escrow.freelancer, "Invalid recipient");
        
        uint256 totalAmount = escrow.amount;
        uint256 feeAmount = (totalAmount * platformFee) / 10000;
        uint256 releaseAmount = totalAmount - feeAmount;
        
        escrow.amount = 0;
        escrow.status = EscrowStatus.Completed;
        
        // Transfer fee to platform
        if (feeAmount > 0 && feeRecipient != address(0)) {
            (bool feeSuccess, ) = feeRecipient.call{value: feeAmount}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // Transfer remaining amount to recipient
        (bool success, ) = recipient.call{value: releaseAmount}("");
        require(success, "Release transfer failed");
        
        if (recipient == escrow.freelancer) {
            emit EscrowReleased(gigId, escrow.freelancer, releaseAmount);
        } else {
            emit EscrowRefunded(gigId, escrow.client, releaseAmount);
        }
    }

    /**
     * @dev Get total number of escrows created
     */
    function getTotalEscrows() external pure returns (uint256) {
        // Since we don't track total count, we'll return a reasonable estimate
        // In production, you might want to add a counter state variable
        return 1000; // Placeholder - adjust based on your needs
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

/**
 * @title EscrowDAO
 * @dev DAO contract for resolving escrow disputes through token-based voting
 * @notice Handles dispute voting with quorum requirements and time limits
 */
contract EscrowDAO is Ownable, ReentrancyGuard {
    
    struct Vote {
        uint256 escrowId;
        uint256 startTime;
        uint256 endTime;
        uint256 votesForFreelancer;
        uint256 votesForClient;
        uint256 totalVotes;
        bool finalized;
        address winner;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice; // true = freelancer, false = client
    }
    
    // State variables
    DAOToken public daoToken;
    GigEscrow public escrowContract;
    
    mapping(uint256 => Vote) public votes;
    mapping(uint256 => bool) public disputeExists;
    
    // Voting parameters
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant QUORUM_PERCENTAGE = 10; // 10% of total supply
    uint256 public constant MIN_TOKEN_BALANCE = 100 * 10**18; // 100 tokens minimum to vote
    
    // Events
    event VoteOpened(uint256 indexed escrowId, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed escrowId, address indexed voter, bool supportFreelancer, uint256 tokenAmount);
    event VoteFinalized(uint256 indexed escrowId, address indexed winner, uint256 totalVotes);
    event QuorumNotMet(uint256 indexed escrowId, uint256 totalVotes, uint256 requiredQuorum);
    
    // Modifiers
    modifier onlyTokenHolder() {
        require(daoToken.balanceOf(msg.sender) >= MIN_TOKEN_BALANCE, "Insufficient token balance");
        _;
    }
    
    modifier validEscrow(uint256 escrowId) {
        require(disputeExists[escrowId], "No dispute for this escrow");
        _;
    }
    
    modifier votingActive(uint256 escrowId) {
        Vote storage voteData = votes[escrowId];
        require(block.timestamp >= voteData.startTime, "Voting not started");
        require(block.timestamp <= voteData.endTime, "Voting period ended");
        require(!voteData.finalized, "Vote already finalized");
        _;
    }
    
    constructor(
        address initialOwner,
        address _daoToken,
        address _escrowContract
    ) Ownable(initialOwner) {
        require(_daoToken != address(0), "Invalid DAO token address");
        require(_escrowContract != address(0), "Invalid escrow contract address");
        
        daoToken = DAOToken(_daoToken);
        escrowContract = GigEscrow(_escrowContract);
    }
    
    /**
     * @dev Open a vote for an escrow dispute
     * @param escrowId ID of the disputed escrow
     */
    function openVote(uint256 escrowId) external onlyOwner {
        require(!disputeExists[escrowId], "Vote already exists for this escrow");
        
        // Verify escrow exists and is disputed
        GigEscrow.EscrowData memory escrowData = escrowContract.getEscrow(escrowId);
        require(escrowData.status == GigEscrow.EscrowStatus.Disputed, "Escrow not disputed");
        
        disputeExists[escrowId] = true;
        
        Vote storage voteData = votes[escrowId];
        voteData.escrowId = escrowId;
        voteData.startTime = block.timestamp;
        voteData.endTime = block.timestamp + VOTING_PERIOD;
        voteData.finalized = false;
        
        emit VoteOpened(escrowId, voteData.startTime, voteData.endTime);
    }
    
    /**
     * @dev Cast a vote on an escrow dispute
     * @param escrowId ID of the disputed escrow
     * @param supportFreelancer true to support freelancer, false to support client
     */
    function vote(
        uint256 escrowId,
        bool supportFreelancer
    ) external validEscrow(escrowId) votingActive(escrowId) onlyTokenHolder nonReentrant {
        Vote storage voteData = votes[escrowId];
        
        require(!voteData.hasVoted[msg.sender], "Already voted");
        
        uint256 voterBalance = daoToken.balanceOf(msg.sender);
        require(voterBalance >= MIN_TOKEN_BALANCE, "Insufficient tokens to vote");
        
        voteData.hasVoted[msg.sender] = true;
        voteData.voteChoice[msg.sender] = supportFreelancer;
        
        if (supportFreelancer) {
            voteData.votesForFreelancer += voterBalance;
        } else {
            voteData.votesForClient += voterBalance;
        }
        
        voteData.totalVotes += voterBalance;
        
        emit VoteCast(escrowId, msg.sender, supportFreelancer, voterBalance);
    }
    
    /**
     * @dev Finalize a vote and execute the result
     * @param escrowId ID of the disputed escrow
     */
    function finalizeVote(uint256 escrowId) external validEscrow(escrowId) nonReentrant {
        Vote storage voteData = votes[escrowId];
        
        require(block.timestamp > voteData.endTime, "Voting period not ended");
        require(!voteData.finalized, "Vote already finalized");
        
        voteData.finalized = true;
        
        // Check if quorum is met
        uint256 totalSupply = daoToken.totalSupply();
        uint256 requiredQuorum = (totalSupply * QUORUM_PERCENTAGE) / 100;
        
        if (voteData.totalVotes < requiredQuorum) {
            emit QuorumNotMet(escrowId, voteData.totalVotes, requiredQuorum);
            // In case of no quorum, refund to client (conservative approach)
            voteData.winner = escrowContract.getEscrow(escrowId).client;
        } else {
            // Determine winner based on votes
            if (voteData.votesForFreelancer > voteData.votesForClient) {
                voteData.winner = escrowContract.getEscrow(escrowId).freelancer;
            } else {
                voteData.winner = escrowContract.getEscrow(escrowId).client;
            }
        }
        
        // Execute the decision by calling escrow contract
        escrowContract.releaseTo(escrowId, voteData.winner);
        
        emit VoteFinalized(escrowId, voteData.winner, voteData.totalVotes);
    }
    
    /**
     * @dev Get vote details
     * @param escrowId ID of the disputed escrow
     */
    function getVote(uint256 escrowId) external view validEscrow(escrowId) returns (
        uint256 startTime,
        uint256 endTime,
        uint256 votesForFreelancer,
        uint256 votesForClient,
        uint256 totalVotes,
        bool finalized,
        address winner
    ) {
        Vote storage voteData = votes[escrowId];
        return (
            voteData.startTime,
            voteData.endTime,
            voteData.votesForFreelancer,
            voteData.votesForClient,
            voteData.totalVotes,
            voteData.finalized,
            voteData.winner
        );
    }
    
    /**
     * @dev Check if an address has voted on a specific escrow
     * @param escrowId ID of the disputed escrow
     * @param voter Address to check
     */
    function hasVoted(uint256 escrowId, address voter) external view validEscrow(escrowId) returns (bool) {
        return votes[escrowId].hasVoted[voter];
    }
    
    /**
     * @dev Get voter's choice on a specific escrow
     * @param escrowId ID of the disputed escrow
     * @param voter Address to check
     */
    function getVoterChoice(uint256 escrowId, address voter) external view validEscrow(escrowId) returns (bool) {
        require(votes[escrowId].hasVoted[voter], "Voter has not voted");
        return votes[escrowId].voteChoice[voter];
    }
    
    /**
     * @dev Check if voting is currently active for an escrow
     * @param escrowId ID of the disputed escrow
     */
    function isVotingActive(uint256 escrowId) external view returns (bool) {
        if (!disputeExists[escrowId]) return false;
        
        Vote storage voteData = votes[escrowId];
        return (
            block.timestamp >= voteData.startTime &&
            block.timestamp <= voteData.endTime &&
            !voteData.finalized
        );
    }
    
    /**
     * @dev Get required quorum for voting
     */
    function getRequiredQuorum() external view returns (uint256) {
        uint256 totalSupply = daoToken.totalSupply();
        return (totalSupply * QUORUM_PERCENTAGE) / 100;
    }
    
    /**
     * @dev Check if an address can vote (has minimum token balance)
     * @param voter Address to check
     */
    function canVote(address voter) external view returns (bool) {
        return daoToken.balanceOf(voter) >= MIN_TOKEN_BALANCE;
    }
    
    /**
     * @dev Get voting power of an address
     * @param voter Address to check
     */
    function getVotingPower(address voter) external view returns (uint256) {
        return daoToken.balanceOf(voter);
    }
    
    /**
     * @dev Update minimum token balance required to vote (only owner)
     * @param newMinBalance New minimum balance
     */
    function updateMinTokenBalance(uint256 newMinBalance) external view onlyOwner {
        require(newMinBalance > 0, "Minimum balance must be greater than 0");
        // Note: This would require a state variable to be added if we want to make it configurable
        // For now, it's a constant for security
    }
    
    /**
     * @dev Emergency function to update escrow contract address (only owner)
     * @param newEscrowContract New escrow contract address
     */
    function updateEscrowContract(address newEscrowContract) external onlyOwner {
        require(newEscrowContract != address(0), "Invalid address");
        escrowContract = GigEscrow(newEscrowContract);
    }
    
    /**
     * @dev Get all active votes count
     */
    function getActiveVotesCount() external view returns (uint256 count) {
        // This is a simple implementation - in production, you might want to track this more efficiently
        for (uint256 i = 1; i <= escrowContract.getTotalEscrows(); i++) {
            if (disputeExists[i] && !votes[i].finalized) {
                if (block.timestamp >= votes[i].startTime && block.timestamp <= votes[i].endTime) {
                    count++;
                }
            }
        }
        return count;
    }
}
