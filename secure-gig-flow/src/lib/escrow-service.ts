import { ethers } from 'ethers';

// Types
export interface EscrowData {
  gigId: string;
  client: string;
  freelancer: string;
  amount: string;
  status: EscrowStatus;
  createdAt: string;
  gigTitle: string;
  exists: boolean;
}

export enum EscrowStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
  Disputed = 4
}

export interface CreateEscrowParams {
  gigId: string;
  freelancerAddress: string;
  amount: string;
  gigTitle: string;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  receipt?: ethers.TransactionReceipt;
  error?: string;
  errorCode?: string;
}

export interface EscrowResult {
  success: boolean;
  data?: EscrowData;
  error?: string;
  errorCode?: string;
}

// Contract ABI - Essential functions only
const ESCROW_ABI = [
  "function createEscrow(uint256 gigId, address freelancer, string calldata gigTitle) external payable",
  "function getEscrow(uint256 gigId) external view returns (tuple(uint256 gigId, address client, address freelancer, uint256 amount, uint8 status, uint256 createdAt, string gigTitle, bool exists))",
  "function releaseEscrow(uint256 gigId) external",
  "function refundEscrow(uint256 gigId) external",
  "function startWork(uint256 gigId) external",
  "function escrowExists(uint256 gigId) external view returns (bool)",
  "function getClientEscrows(address client) external view returns (uint256[])",
  "function getFreelancerEscrows(address freelancer) external view returns (uint256[])",
  "event EscrowCreated(uint256 indexed gigId, address indexed client, address indexed freelancer, uint256 amount, string gigTitle)",
  "event EscrowReleased(uint256 indexed gigId, address indexed freelancer, uint256 amount)",
  "event EscrowRefunded(uint256 indexed gigId, address indexed client, uint256 amount)"
];

// Environment variables - Single contract address now
const ESCROW_CONTRACT_ADDRESS = import.meta.env.VITE_GIG_ESCROW_ADDRESS;
const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '43113');
const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME || 'Avalanche Fuji Testnet';

/**
 * Production-level Escrow Service with comprehensive error handling
 */
export class EscrowService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private isInitialized = false;

  constructor() {
    this.validateEnvironment();
  }

  /**
   * Validate environment configuration
   */
  private validateEnvironment(): void {
    if (!ESCROW_CONTRACT_ADDRESS) {
      throw new Error('VITE_GIG_ESCROW_ADDRESS environment variable is not set');
    }
    
    if (!this.isValidAddress(ESCROW_CONTRACT_ADDRESS)) {
      throw new Error(`Invalid escrow contract address: ${ESCROW_CONTRACT_ADDRESS}`);
    }
  }

  /**
   * Utility: Check if address is valid
   */
  public isValidAddress(address: string): boolean {
    try {
      ethers.getAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Utility: Normalize address with checksum
   */
  public normalizeAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch (error) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }
  }

  /**
   * Detailed logging utility
   */
  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      network: NETWORK_NAME,
      chainId: CHAIN_ID,
      contractAddress: ESCROW_CONTRACT_ADDRESS,
      ...data
    };
    
    console[level](`[EscrowService] ${message}`, logData);
  }

  /**
   * Initialize the service with wallet connection
   */
  public async initialize(): Promise<void> {
    try {
      this.log('info', 'Initializing EscrowService');

      if (!window.ethereum) {
        throw new Error('No Web3 wallet detected. Please install Core Wallet or MetaMask.');
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== CHAIN_ID) {
        throw new Error(`Wrong network. Please switch to ${NETWORK_NAME} (Chain ID: ${CHAIN_ID})`);
      }

      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        this.signer
      );

      this.isInitialized = true;
      this.log('info', 'EscrowService initialized successfully', {
        signerAddress: await this.signer.getAddress(),
        networkChainId: Number(network.chainId)
      });

    } catch (error) {
      this.log('error', 'Failed to initialize EscrowService', { error });
      throw error;
    }
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.contract || !this.signer) {
      throw new Error('EscrowService not initialized. Call initialize() first.');
    }
  }

  /**
   * Create escrow with comprehensive validation and error handling
   */
  public async createEscrow(params: CreateEscrowParams): Promise<TransactionResult> {
    try {
      this.ensureInitialized();
      
      const { gigId, freelancerAddress, amount, gigTitle } = params;
      
      this.log('info', 'Creating escrow', { params });

      // Validate inputs
      if (!gigId || gigId.trim() === '') {
        throw new Error('Gig ID is required');
      }

      if (!gigTitle || gigTitle.trim() === '') {
        throw new Error('Gig title is required');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Validate and normalize addresses
      let normalizedFreelancer: string;
      try {
        normalizedFreelancer = this.normalizeAddress(freelancerAddress);
      } catch (error) {
        throw new Error(`Invalid freelancer address: ${freelancerAddress}`);
      }

      // Convert amount to Wei
      let amountWei: bigint;
      try {
        amountWei = ethers.parseEther(amount);
      } catch (error) {
        throw new Error(`Invalid amount format: ${amount}`);
      }

      // Convert gigId to number for contract call
      const gigIdNum = parseInt(gigId);
      if (isNaN(gigIdNum)) {
        throw new Error(`Invalid gig ID format: ${gigId}`);
      }

      // Check if escrow already exists
      try {
        const exists = await this.contract!.escrowExists(gigIdNum);
        if (exists) {
          throw new Error(`Escrow already exists for gig ID: ${gigId}`);
        }
      } catch (error: any) {
        if (!error.message.includes('already exists')) {
          this.log('warn', 'Could not check escrow existence', { error, gigId });
        } else {
          throw error;
        }
      }

      // Check signer balance
      const signerAddress = await this.signer!.getAddress();
      const balance = await this.provider!.getBalance(signerAddress);
      
      if (balance < amountWei) {
        throw new Error(`Insufficient balance. Required: ${amount} AVAX, Available: ${ethers.formatEther(balance)} AVAX`);
      }

      // Estimate gas
      let gasEstimate: bigint;
      try {
        gasEstimate = await this.contract!.createEscrow.estimateGas(
          gigIdNum,
          normalizedFreelancer,
          gigTitle,
          { value: amountWei }
        );
      } catch (error: any) {
        this.log('error', 'Gas estimation failed', { error, params });
        throw new Error('Transaction would fail. Please check your inputs and try again.');
      }

      // Send transaction with 20% gas buffer
      const gasLimit = (gasEstimate * 120n) / 100n;
      
      this.log('info', 'Sending createEscrow transaction', {
        gigId: gigIdNum,
        freelancer: normalizedFreelancer,
        amount,
        gasLimit: gasLimit.toString()
      });

      const tx = await this.contract!.createEscrow(
        gigIdNum,
        normalizedFreelancer,
        gigTitle,
        { 
          value: amountWei,
          gasLimit
        }
      );

      this.log('info', 'Transaction sent', { transactionHash: tx.hash });
      
      // Show pending notification
      console.log('Creating escrow...');

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        this.log('info', 'Escrow created successfully', { 
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        });
        
        console.log('Escrow created successfully!');
        
        return {
          success: true,
          transactionHash: receipt.hash,
          receipt
        };
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      this.log('error', 'createEscrow failed', { error, params });
      
      let errorMessage = 'Failed to create escrow';
      let errorCode = 'UNKNOWN_ERROR';

      if (error.code === 'CALL_EXCEPTION') {
        errorMessage = 'Contract call failed. Please check your inputs and try again.';
        errorCode = 'CALL_EXCEPTION';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for transaction';
        errorCode = 'INSUFFICIENT_FUNDS';
      } else if (error.code === 'USER_REJECTED') {
        errorMessage = 'Transaction rejected by user';
        errorCode = 'USER_REJECTED';
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error(errorMessage);

      return {
        success: false,
        error: errorMessage,
        errorCode
      };
    }
  }

  /**
   * Get escrow details with graceful error handling
   */
  public async getEscrow(gigId: string): Promise<EscrowResult> {
    try {
      this.ensureInitialized();
      
      this.log('info', 'Fetching escrow details', { gigId });

      if (!gigId || gigId.trim() === '') {
        throw new Error('Gig ID is required');
      }

      // First check if escrow exists
      let exists: boolean;
      try {
        exists = await this.contract!.escrowExists(gigId);
      } catch (error: any) {
        this.log('warn', 'Could not check escrow existence, proceeding with getEscrow', { error, gigId });
        exists = true; // Assume it exists and let getEscrow handle it
      }

      if (!exists) {
        this.log('info', 'Escrow does not exist', { gigId });
        return {
          success: false,
          error: `No escrow found for gig ID: ${gigId}`,
          errorCode: 'ESCROW_NOT_FOUND'
        };
      }

      // Fetch escrow data
      const escrowData = await this.contract!.getEscrow(gigId);
      
      const result: EscrowData = {
        gigId: escrowData.gigId.toString(),
        client: escrowData.client,
        freelancer: escrowData.freelancer,
        amount: ethers.formatEther(escrowData.amount),
        status: Number(escrowData.status) as EscrowStatus,
        createdAt: new Date(Number(escrowData.createdAt) * 1000).toISOString(),
        gigTitle: escrowData.gigTitle,
        exists: escrowData.exists
      };

      this.log('info', 'Escrow details fetched successfully', { gigId, result });

      return {
        success: true,
        data: result
      };

    } catch (error: any) {
      this.log('error', 'getEscrow failed', { error, gigId });
      
      let errorMessage = 'Failed to fetch escrow details';
      let errorCode = 'UNKNOWN_ERROR';

      if (error.code === 'CALL_EXCEPTION') {
        // Handle missing revert data
        if (error.message.includes('missing revert data')) {
          errorMessage = `Escrow not found for gig ID: ${gigId}`;
          errorCode = 'ESCROW_NOT_FOUND';
        } else {
          errorMessage = 'Contract call failed. The escrow may not exist.';
          errorCode = 'CALL_EXCEPTION';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        errorCode
      };
    }
  }

  /**
   * Release escrow funds to freelancer
   */
  public async releaseEscrow(gigId: string): Promise<TransactionResult> {
    try {
      this.ensureInitialized();
      
      this.log('info', 'Releasing escrow', { gigId });

      if (!gigId || gigId.trim() === '') {
        throw new Error('Gig ID is required');
      }

      // Convert gigId to number for contract call
      const gigIdNum = parseInt(gigId);
      if (isNaN(gigIdNum)) {
        throw new Error(`Invalid gig ID format: ${gigId}`);
      }

      // Estimate gas
      const gasEstimate = await this.contract!.releaseEscrow.estimateGas(gigIdNum);
      const gasLimit = (gasEstimate * 120n) / 100n;

      const tx = await this.contract!.releaseEscrow(gigIdNum, { gasLimit });
      
      console.log('Releasing escrow...');
      
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        this.log('info', 'Escrow released successfully', { 
          gigId,
          transactionHash: receipt.hash 
        });
        
        console.log('Escrow released successfully!');
        
        return {
          success: true,
          transactionHash: receipt.hash,
          receipt
        };
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      this.log('error', 'releaseEscrow failed', { error, gigId });
      
      const errorMessage = error.message || 'Failed to release escrow';
      console.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Refund escrow to client
   */
  public async refundEscrow(gigId: string): Promise<TransactionResult> {
    try {
      this.ensureInitialized();
      
      this.log('info', 'Refunding escrow', { gigId });

      if (!gigId || gigId.trim() === '') {
        throw new Error('Gig ID is required');
      }

      // Convert gigId to number for contract call
      const gigIdNum = parseInt(gigId);
      if (isNaN(gigIdNum)) {
        throw new Error(`Invalid gig ID format: ${gigId}`);
      }

      const gasEstimate = await this.contract!.refundEscrow.estimateGas(gigIdNum);
      const gasLimit = (gasEstimate * 120n) / 100n;

      const tx = await this.contract!.refundEscrow(gigIdNum, { gasLimit });
      
      console.log('Processing refund...');
      
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        this.log('info', 'Escrow refunded successfully', { 
          gigId,
          transactionHash: receipt.hash 
        });
        
        console.log('Escrow refunded successfully!');
        
        return {
          success: true,
          transactionHash: receipt.hash,
          receipt
        };
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      this.log('error', 'refundEscrow failed', { error, gigId });
      
      const errorMessage = error.message || 'Failed to refund escrow';
      console.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Get current signer address
   */
  public async getSignerAddress(): Promise<string | null> {
    try {
      if (!this.signer) return null;
      return await this.signer.getAddress();
    } catch (error) {
      this.log('error', 'Failed to get signer address', { error });
      return null;
    }
  }

  /**
   * Check if wallet is connected and on correct network
   */
  public async isConnectedAndOnCorrectNetwork(): Promise<boolean> {
    try {
      if (!this.provider) return false;
      
      const network = await this.provider.getNetwork();
      return Number(network.chainId) === CHAIN_ID;
    } catch (error) {
      this.log('error', 'Failed to check network', { error });
      return false;
    }
  }

  /**
   * Switch to correct network
   */
  public async switchToCorrectNetwork(): Promise<boolean> {
    try {
      if (!window.ethereum) return false;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      });
      
      return true;
    } catch (error: any) {
      this.log('error', 'Failed to switch network', { error });
      
      if (error.code === 4902) {
        console.error(`Please add ${NETWORK_NAME} to your wallet`);
      } else {
        console.error('Failed to switch network');
      }
      
      return false;
    }
  }
}

// Export singleton instance
export const escrowService = new EscrowService();

// Utility functions for React components
export const useEscrowService = () => {
  return {
    escrowService,
    isValidAddress: (address: string) => escrowService.isValidAddress(address),
    normalizeAddress: (address: string) => escrowService.normalizeAddress(address)
  };
};
