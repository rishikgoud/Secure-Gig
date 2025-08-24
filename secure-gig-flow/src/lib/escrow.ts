import { ethers } from 'ethers';
import { toast } from 'sonner';

// GigEscrow contract ABI - Updated for combined contract structure
const GIG_ESCROW_ABI = [
  "function createEscrow(uint256 gigId, address freelancer, string calldata gigTitle) external payable",
  "function releaseEscrow(uint256 gigId) external",
  "function refundEscrow(uint256 gigId) external",
  "function startWork(uint256 gigId) external",
  "function getEscrow(uint256 gigId) external view returns (tuple(uint256 gigId, address client, address freelancer, uint256 amount, uint8 status, uint256 createdAt, string gigTitle, bool exists))",
  "function escrowExists(uint256 gigId) external view returns (bool)",
  "function getClientEscrows(address client) external view returns (uint256[])",
  "function getFreelancerEscrows(address freelancer) external view returns (uint256[])",
  "event EscrowCreated(uint256 indexed gigId, address indexed client, address indexed freelancer, uint256 amount, string gigTitle)",
  "event EscrowReleased(uint256 indexed gigId, address indexed freelancer, uint256 amount)",
  "event EscrowRefunded(uint256 indexed gigId, address indexed client, uint256 amount)"
];

// Contract address - using single GigEscrow address from combined contracts
const GIG_ESCROW_ADDRESS = import.meta.env.VITE_GIG_ESCROW_ADDRESS || '';

export enum EscrowStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3
}

export interface EscrowData {
  gigId: number;
  client: string;
  freelancer: string;
  amount: string;
  status: EscrowStatus;
  createdAt: number;
  gigTitle: string;
  exists: boolean;
}

export class EscrowService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  async initialize() {
    if (!window.ethereum) {
      throw new Error('Wallet not found. Please install Core Wallet or MetaMask to use escrow features.');
    }

    if (!GIG_ESCROW_ADDRESS) {
      throw new Error('Escrow contract address not configured. Please check environment variables.');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(GIG_ESCROW_ADDRESS, GIG_ESCROW_ABI, this.signer);

    // Check if we're on the correct network (Avalanche C-Chain)
    const network = await this.provider.getNetwork();
    const expectedChainId = import.meta.env.VITE_CHAIN_ID || '43113'; // Fuji testnet
    
    if (network.chainId.toString() !== expectedChainId) {
      throw new Error(`Please switch to Avalanche ${expectedChainId === '43113' ? 'Fuji Testnet' : 'Mainnet'}`);
    }
  }

  async createEscrow(gigId: number, freelancerAddress: string, gigTitle: string, amountInAvax: string): Promise<string> {
    if (!this.contract) {
      await this.initialize();
    }

    try {
      // Validate and ensure proper address checksum
      if (!freelancerAddress || freelancerAddress.length !== 42 || !freelancerAddress.startsWith('0x')) {
        throw new Error('Invalid freelancer address format');
      }
      
      let checksummedAddress: string;
      try {
        // Try to get the checksummed address, handling invalid checksum
        checksummedAddress = ethers.getAddress(freelancerAddress);
      } catch (checksumError) {
        // If checksum is invalid, normalize to lowercase and try again
        checksummedAddress = ethers.getAddress(freelancerAddress.toLowerCase());
      }
      
      const amountWei = ethers.parseEther(amountInAvax);
      
      const tx = await this.contract!.createEscrow(gigId, checksummedAddress, gigTitle, {
        value: amountWei,
        gasLimit: 300000
      });

      toast.success('Escrow transaction submitted! Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      toast.success(`Escrow created successfully! Funds secured for gig: ${gigTitle}`);
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Error creating escrow:', error);
      const errorMessage = this.parseErrorMessage(error);
      toast.error(`Failed to create escrow: ${errorMessage}`);
      throw error;
    }
  }

  async releaseEscrow(gigId: number): Promise<string> {
    if (!this.contract) {
      await this.initialize();
    }

    try {
      const tx = await this.contract!.releaseEscrow(gigId, {
        gasLimit: 200000
      });

      toast.success('Release transaction submitted! Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      toast.success('Escrow released successfully! Funds transferred to freelancer.');
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      const errorMessage = this.parseErrorMessage(error);
      toast.error(`Failed to release escrow: ${errorMessage}`);
      throw error;
    }
  }

  async refundEscrow(gigId: number): Promise<string> {
    if (!this.contract) {
      await this.initialize();
    }

    try {
      const tx = await this.contract!.refundEscrow(gigId, {
        gasLimit: 200000
      });

      toast.success('Refund transaction submitted! Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      toast.success('Escrow refunded successfully! Funds returned to client.');
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Error refunding escrow:', error);
      const errorMessage = this.parseErrorMessage(error);
      toast.error(`Failed to refund escrow: ${errorMessage}`);
      throw error;
    }
  }

  async startWork(gigId: number): Promise<string> {
    if (!this.contract) {
      await this.initialize();
    }

    try {
      const tx = await this.contract!.startWork(gigId, {
        gasLimit: 100000
      });

      toast.success('Start work transaction submitted! Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      toast.success('Work started! Escrow status updated to Active.');
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Error starting work:', error);
      const errorMessage = this.parseErrorMessage(error);
      toast.error(`Failed to start work: ${errorMessage}`);
      throw error;
    }
  }

  async getEscrow(gigId: number): Promise<EscrowData | null> {
    if (!this.contract) {
      await this.initialize();
    }

    try {
      // First check if escrow exists to avoid revert
      const exists = await this.contract!.escrowExists(gigId);
      if (!exists) {
        return null;
      }
      
      const escrowData = await this.contract!.getEscrow(gigId);
      
      if (!escrowData.exists) {
        return null;
      }

      return {
        gigId: Number(escrowData.gigId),
        client: escrowData.client,
        freelancer: escrowData.freelancer,
        amount: ethers.formatEther(escrowData.amount),
        status: Number(escrowData.status) as EscrowStatus,
        createdAt: Number(escrowData.createdAt),
        gigTitle: escrowData.gigTitle,
        exists: escrowData.exists
      };
    } catch (error: any) {
      console.error('Error getting escrow:', error);
      return null;
    }
  }

  async getClientEscrows(clientAddress: string): Promise<number[]> {
    if (!this.contract) {
      await this.initialize();
    }

    try {
      const gigIds = await this.contract!.getClientEscrows(clientAddress);
      return gigIds.map((id: any) => Number(id));
    } catch (error: any) {
      console.error('Error getting client escrows:', error);
      return [];
    }
  }

  async getFreelancerEscrows(freelancerAddress: string): Promise<number[]> {
    if (!this.contract) {
      await this.initialize();
    }

    try {
      const gigIds = await this.contract!.getFreelancerEscrows(freelancerAddress);
      return gigIds.map((id: any) => Number(id));
    } catch (error: any) {
      console.error('Error getting freelancer escrows:', error);
      return [];
    }
  }

  async escrowExists(gigId: number): Promise<boolean> {
    if (!this.contract) {
      await this.initialize();
    }

    try {
      return await this.contract!.escrowExists(gigId);
    } catch (error: any) {
      console.error('Error checking escrow existence:', error);
      return false;
    }
  }

  // Event listeners for real-time updates
  onEscrowCreated(callback: (gigId: number, client: string, freelancer: string, amount: string, gigTitle: string) => void) {
    if (!this.contract) return;

    this.contract.on('EscrowCreated', (gigId, client, freelancer, amount, gigTitle) => {
      callback(Number(gigId), client, freelancer, ethers.formatEther(amount), gigTitle);
    });
  }

  onEscrowReleased(callback: (gigId: number, freelancer: string, amount: string) => void) {
    if (!this.contract) return;

    this.contract.on('EscrowReleased', (gigId, freelancer, amount) => {
      callback(Number(gigId), freelancer, ethers.formatEther(amount));
    });
  }

  onEscrowRefunded(callback: (gigId: number, client: string, amount: string) => void) {
    if (!this.contract) return;

    this.contract.on('EscrowRefunded', (gigId, client, amount) => {
      callback(Number(gigId), client, ethers.formatEther(amount));
    });
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  private parseErrorMessage(error: any): string {
    if (error.reason) {
      return error.reason;
    }
    if (error.message) {
      if (error.message.includes('user rejected')) {
        return 'Transaction was rejected by user';
      }
      if (error.message.includes('insufficient funds')) {
        return 'Insufficient funds for transaction';
      }
      if (error.message.includes('execution reverted')) {
        return 'Transaction failed - contract requirements not met';
      }
      return error.message;
    }
    return 'Unknown error occurred';
  }

  getStatusText(status: EscrowStatus): string {
    switch (status) {
      case EscrowStatus.Pending:
        return 'Pending';
      case EscrowStatus.Active:
        return 'Active';
      case EscrowStatus.Completed:
        return 'Completed';
      case EscrowStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getStatusColor(status: EscrowStatus): string {
    switch (status) {
      case EscrowStatus.Pending:
        return 'text-yellow-600';
      case EscrowStatus.Active:
        return 'text-blue-600';
      case EscrowStatus.Completed:
        return 'text-green-600';
      case EscrowStatus.Cancelled:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}

// Export singleton instance
export const escrowService = new EscrowService();
