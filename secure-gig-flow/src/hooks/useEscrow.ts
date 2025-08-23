import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { toast } from 'sonner';
import { EscrowData, EscrowStatus, CreateEscrowParams } from '@/types/escrow';
import { mockEscrows, getEscrowsForUser, getEscrowsByRole as getMockEscrowsByRole, getTotalValueLocked, getActiveEscrowsCount } from '@/data/mockEscrows';

// Contract ABI (simplified for key functions)
const ESCROW_ABI = [
  "function createEscrow(address freelancer, uint256 deadline, string calldata description) external payable",
  "function approveWork(uint256 escrowId) external",
  "function raiseDispute(uint256 escrowId) external",
  "function getEscrow(uint256 escrowId) external view returns (tuple(uint256 id, address client, address freelancer, uint256 amount, uint8 status, uint256 createdAt, uint256 deadline, string description, bool clientApproved, bool disputeRaised, address disputeRaisedBy, uint256 disputeRaisedAt))",
  "function getClientEscrows(address client) external view returns (uint256[])",
  "function getFreelancerEscrows(address freelancer) external view returns (uint256[])",
  "function getTotalEscrows() external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  "event EscrowCreated(uint256 indexed escrowId, address indexed client, address indexed freelancer, uint256 amount, uint256 deadline)",
  "event WorkApproved(uint256 indexed escrowId, address indexed client)",
  "event DisputeRaised(uint256 indexed escrowId, address indexed raisedBy)",
  "event FundsReleased(uint256 indexed escrowId, address indexed recipient, uint256 amount)"
];


export const useEscrow = () => {
  const { address, isConnected } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [totalEscrows, setTotalEscrows] = useState(0);
  const [contractBalance, setContractBalance] = useState('0');

  const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_ADDRESS || '';

  // Initialize with mock data for development
  useEffect(() => {
    if (address) {
      const userEscrows = getEscrowsForUser(address);
      setEscrows(userEscrows);
      setTotalEscrows(mockEscrows.length);
      setContractBalance(getTotalValueLocked());
    }
  }, [address]);

  // Parse escrow data from contract response
  const parseEscrowData = (rawData: any): EscrowData => {
    return {
      id: String(rawData.id),
      title: rawData.title || 'Untitled Project',
      client: rawData.client,
      freelancer: rawData.freelancer,
      amount: ethers.formatEther(rawData.amount),
      currency: 'AVAX',
      status: Number(rawData.status) as EscrowStatus,
      createdAt: Number(rawData.createdAt),
      deadline: Number(rawData.deadline),
      description: rawData.description,
      clientApproved: rawData.clientApproved,
      workSubmitted: rawData.workSubmitted || false,
      disputeRaisedBy: rawData.disputeRaisedBy,
      disputeRaisedAt: Number(rawData.disputeRaisedAt),
      milestones: rawData.milestones || [],
    };
  };

  // Create escrow (mock implementation)
  const createEscrow = useCallback(async (params: CreateEscrowParams): Promise<boolean> => {
    if (!address) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new mock escrow
      const newEscrow: EscrowData = {
        id: String(mockEscrows.length + 1),
        title: params.title || 'New Project',
        client: address,
        freelancer: params.freelancer,
        amount: params.amount,
        currency: 'AVAX',
        deadline: params.deadline,
        description: params.description,
        status: EscrowStatus.Active,
        createdAt: Math.floor(Date.now() / 1000),
        clientApproved: false,
        workSubmitted: false,
        milestones: [],
      };
      
      // Add to mock data
      mockEscrows.push(newEscrow);
      
      // Update state
      const userEscrows = getEscrowsForUser(address);
      setEscrows(userEscrows);
      setTotalEscrows(mockEscrows.length);
      setContractBalance(getTotalValueLocked());
      
      toast.success('Escrow created successfully!');
      return true;
    } catch (error: any) {
      console.error('Create escrow error:', error);
      toast.error('Failed to create escrow');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Approve work (mock implementation)
  const approveWork = useCallback(async (escrowId: number): Promise<boolean> => {
    if (!address) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find and update escrow
      const escrowIndex = mockEscrows.findIndex(e => Number(e.id) === Number(escrowId));
      if (escrowIndex !== -1) {
        mockEscrows[escrowIndex].status = EscrowStatus.Completed;
        mockEscrows[escrowIndex].clientApproved = true;
        
        // Update state
        const userEscrows = getEscrowsForUser(address);
        setEscrows(userEscrows);
        setContractBalance(getTotalValueLocked());
      }
      
      toast.success('Work approved successfully!');
      return true;
    } catch (error: any) {
      console.error('Approve work error:', error);
      toast.error('Failed to approve work');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Raise dispute (mock implementation)
  const raiseDispute = useCallback(async (escrowId: number, reason?: string): Promise<boolean> => {
    if (!address) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find and update escrow
      const escrowIndex = mockEscrows.findIndex(e => Number(e.id) === Number(escrowId));
      if (escrowIndex !== -1) {
        mockEscrows[escrowIndex].status = EscrowStatus.Disputed;
        mockEscrows[escrowIndex].disputeRaisedBy = 'client'; // Determine based on user role
        mockEscrows[escrowIndex].disputeRaisedAt = Math.floor(Date.now() / 1000);
        
        // Update state
        const userEscrows = getEscrowsForUser(address);
        setEscrows(userEscrows);
        setContractBalance(getTotalValueLocked());
      }
      
      toast.success('Dispute raised successfully!');
      return true;
    } catch (error: any) {
      console.error('Raise dispute error:', error);
      toast.error('Failed to raise dispute');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Get single escrow (mock implementation)
  const getEscrow = useCallback(async (escrowId: number): Promise<EscrowData | null> => {
    try {
      const escrow = mockEscrows.find(e => e.id === String(escrowId));
      return escrow || null;
    } catch (error) {
      console.error('Get escrow error:', error);
      return null;
    }
  }, []);

  // Fetch escrows (mock implementation)
  const fetchEscrows = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userEscrows = getEscrowsForUser(address);
      setEscrows(userEscrows);
      setTotalEscrows(mockEscrows.length);
      setContractBalance(getTotalValueLocked());
    } catch (error) {
      console.error('Fetch escrows error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Get escrows by role
  const getEscrowsByRole = useCallback((role: 'client' | 'freelancer'): EscrowData[] => {
    if (!address) return [];
    
    return getMockEscrowsByRole(role, address);
  }, [address]);

  const getEscrowsByStatus = useCallback((status: EscrowStatus) => {
    return escrows.filter(escrow => escrow.status === status);
  }, [escrows]);

  return {
    // State
    contract,
    isLoading,
    escrows,
    totalEscrows,
    contractBalance,
    isConnected,

    // Actions
    createEscrow,
    approveWork,
    raiseDispute,
    getEscrow,
    fetchEscrows,
    getEscrowsByRole,
    getEscrowsByStatus,

    // Constants
    EscrowStatus,
  };
};
