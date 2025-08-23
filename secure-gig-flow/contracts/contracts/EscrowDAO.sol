// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Escrow.sol";
import "./DAOToken.sol";

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
    Escrow public escrowContract;
    
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
        Vote storage vote = votes[escrowId];
        require(block.timestamp >= vote.startTime, "Voting not started");
        require(block.timestamp <= vote.endTime, "Voting period ended");
        require(!vote.finalized, "Vote already finalized");
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
        escrowContract = Escrow(_escrowContract);
    }
    
    /**
     * @dev Open a vote for an escrow dispute
     * @param escrowId ID of the disputed escrow
     */
    function openVote(uint256 escrowId) external onlyOwner {
        require(!disputeExists[escrowId], "Vote already exists for this escrow");
        
        // Verify escrow exists and is disputed
        Escrow.EscrowData memory escrowData = escrowContract.getEscrow(escrowId);
        require(escrowData.status == Escrow.EscrowStatus.Disputed, "Escrow not disputed");
        
        disputeExists[escrowId] = true;
        
        Vote storage vote = votes[escrowId];
        vote.escrowId = escrowId;
        vote.startTime = block.timestamp;
        vote.endTime = block.timestamp + VOTING_PERIOD;
        vote.finalized = false;
        
        emit VoteOpened(escrowId, vote.startTime, vote.endTime);
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
        Vote storage vote = votes[escrowId];
        return (
            vote.startTime,
            vote.endTime,
            vote.votesForFreelancer,
            vote.votesForClient,
            vote.totalVotes,
            vote.finalized,
            vote.winner
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
        
        Vote storage vote = votes[escrowId];
        return (
            block.timestamp >= vote.startTime &&
            block.timestamp <= vote.endTime &&
            !vote.finalized
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
    function updateMinTokenBalance(uint256 newMinBalance) external onlyOwner {
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
        escrowContract = Escrow(newEscrowContract);
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
