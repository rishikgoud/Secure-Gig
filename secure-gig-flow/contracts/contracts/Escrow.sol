// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Escrow
 * @dev Secure escrow contract for freelance payments with dispute resolution
 * @notice Handles escrow creation, work approval, and dispute management
 */
contract Escrow is ReentrancyGuard, Ownable, Pausable {
    
    enum EscrowStatus {
        Active,      // Funds deposited, work in progress
        Completed,   // Work approved, funds released
        Disputed,    // Dispute raised, funds locked
        Resolved     // Dispute resolved by DAO
    }
    
    struct EscrowData {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 deadline;
        string description;
        bool clientApproved;
        bool disputeRaised;
        address disputeRaisedBy;
        uint256 disputeRaisedAt;
    }
    
    // State variables
    uint256 private _escrowCounter;
    mapping(uint256 => EscrowData) public escrows;
    mapping(address => uint256[]) public clientEscrows;
    mapping(address => uint256[]) public freelancerEscrows;
    
    // DAO contract address for dispute resolution
    address public daoContract;
    
    // Fee configuration (in basis points, 100 = 1%)
    uint256 public platformFee = 250; // 2.5%
    address public feeRecipient;
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        uint256 deadline
    );
    
    event WorkApproved(uint256 indexed escrowId, address indexed client);
    event FundsReleased(uint256 indexed escrowId, address indexed recipient, uint256 amount);
    event DisputeRaised(uint256 indexed escrowId, address indexed raisedBy);
    event DisputeResolved(uint256 indexed escrowId, address indexed winner, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, uint256 amount);
    
    // Modifiers
    modifier onlyParticipant(uint256 escrowId) {
        require(
            msg.sender == escrows[escrowId].client || 
            msg.sender == escrows[escrowId].freelancer,
            "Not authorized"
        );
        _;
    }
    
    modifier onlyDAO() {
        require(msg.sender == daoContract, "Only DAO can call this");
        _;
    }
    
    modifier validEscrow(uint256 escrowId) {
        require(escrowId > 0 && escrowId <= _escrowCounter, "Invalid escrow ID");
        _;
    }
    
    constructor(address initialOwner, address _feeRecipient) Ownable(initialOwner) {
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Set the DAO contract address
     * @param _daoContract Address of the DAO contract
     */
    function setDAOContract(address _daoContract) external onlyOwner {
        require(_daoContract != address(0), "Invalid DAO address");
        daoContract = _daoContract;
    }
    
    /**
     * @dev Create a new escrow
     * @param freelancer Address of the freelancer
     * @param deadline Deadline for work completion (timestamp)
     * @param description Description of the work
     */
    function createEscrow(
        address freelancer,
        uint256 deadline,
        string calldata description
    ) external payable nonReentrant whenNotPaused {
        require(freelancer != address(0), "Invalid freelancer address");
        require(freelancer != msg.sender, "Client and freelancer cannot be the same");
        require(msg.value > 0, "Amount must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        _escrowCounter++;
        uint256 escrowId = _escrowCounter;
        
        escrows[escrowId] = EscrowData({
            id: escrowId,
            client: msg.sender,
            freelancer: freelancer,
            amount: msg.value,
            status: EscrowStatus.Active,
            createdAt: block.timestamp,
            deadline: deadline,
            description: description,
            clientApproved: false,
            disputeRaised: false,
            disputeRaisedBy: address(0),
            disputeRaisedAt: 0
        });
        
        clientEscrows[msg.sender].push(escrowId);
        freelancerEscrows[freelancer].push(escrowId);
        
        emit EscrowCreated(escrowId, msg.sender, freelancer, msg.value, deadline);
    }
    
    /**
     * @dev Client approves the work and releases funds
     * @param escrowId ID of the escrow
     */
    function approveWork(uint256 escrowId) external validEscrow(escrowId) nonReentrant {
        EscrowData storage escrow = escrows[escrowId];
        
        require(msg.sender == escrow.client, "Only client can approve work");
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(!escrow.disputeRaised, "Cannot approve during dispute");
        
        escrow.clientApproved = true;
        escrow.status = EscrowStatus.Completed;
        
        _releaseFunds(escrowId, escrow.freelancer);
        
        emit WorkApproved(escrowId, msg.sender);
    }
    
    /**
     * @dev Raise a dispute (can be called by client or freelancer)
     * @param escrowId ID of the escrow
     */
    function raiseDispute(uint256 escrowId) external validEscrow(escrowId) onlyParticipant(escrowId) {
        EscrowData storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(!escrow.disputeRaised, "Dispute already raised");
        require(daoContract != address(0), "DAO contract not set");
        
        escrow.disputeRaised = true;
        escrow.disputeRaisedBy = msg.sender;
        escrow.disputeRaisedAt = block.timestamp;
        escrow.status = EscrowStatus.Disputed;
        
        emit DisputeRaised(escrowId, msg.sender);
    }
    
    /**
     * @dev Release funds to specified recipient (only callable by DAO)
     * @param escrowId ID of the escrow
     * @param recipient Address to receive the funds
     */
    function releaseTo(uint256 escrowId, address recipient) external validEscrow(escrowId) onlyDAO nonReentrant {
        EscrowData storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Disputed, "Escrow not disputed");
        require(
            recipient == escrow.client || recipient == escrow.freelancer,
            "Invalid recipient"
        );
        
        escrow.status = EscrowStatus.Resolved;
        
        _releaseFunds(escrowId, recipient);
        
        emit DisputeResolved(escrowId, recipient, escrow.amount);
    }
    
    /**
     * @dev Emergency refund (only owner, for emergencies)
     * @param escrowId ID of the escrow
     */
    function emergencyRefund(uint256 escrowId) external validEscrow(escrowId) onlyOwner nonReentrant {
        EscrowData storage escrow = escrows[escrowId];
        
        require(
            escrow.status == EscrowStatus.Active || escrow.status == EscrowStatus.Disputed,
            "Cannot refund completed escrow"
        );
        
        escrow.status = EscrowStatus.Resolved;
        
        uint256 amount = escrow.amount;
        escrow.amount = 0;
        
        (bool success, ) = escrow.client.call{value: amount}("");
        require(success, "Refund failed");
        
        emit EscrowRefunded(escrowId, amount);
    }
    
    /**
     * @dev Internal function to release funds with fee deduction
     * @param escrowId ID of the escrow
     * @param recipient Address to receive the funds
     */
    function _releaseFunds(uint256 escrowId, address recipient) internal {
        EscrowData storage escrow = escrows[escrowId];
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
        
        // Transfer remaining amount to recipient
        (bool success, ) = recipient.call{value: payout}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(escrowId, recipient, payout);
    }
    
    /**
     * @dev Get escrow details
     * @param escrowId ID of the escrow
     */
    function getEscrow(uint256 escrowId) external view validEscrow(escrowId) returns (EscrowData memory) {
        return escrows[escrowId];
    }
    
    /**
     * @dev Get client's escrows
     * @param client Address of the client
     */
    function getClientEscrows(address client) external view returns (uint256[] memory) {
        return clientEscrows[client];
    }
    
    /**
     * @dev Get freelancer's escrows
     * @param freelancer Address of the freelancer
     */
    function getFreelancerEscrows(address freelancer) external view returns (uint256[] memory) {
        return freelancerEscrows[freelancer];
    }
    
    /**
     * @dev Get total number of escrows
     */
    function getTotalEscrows() external view returns (uint256) {
        return _escrowCounter;
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
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
