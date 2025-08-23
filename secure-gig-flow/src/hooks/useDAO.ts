import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { EscrowStatus } from '@/types/escrow';
import { toast } from 'sonner';

// Contract ABIs
const DAO_ABI = [
  "function openVote(uint256 escrowId) external",
  "function vote(uint256 escrowId, bool supportFreelancer) external",
  "function finalizeVote(uint256 escrowId) external",
  "function getVote(uint256 escrowId) external view returns (uint256 startTime, uint256 endTime, uint256 votesForFreelancer, uint256 votesForClient, uint256 totalVotes, bool finalized, address winner)",
  "function hasVoted(uint256 escrowId, address voter) external view returns (bool)",
  "function getVoterChoice(uint256 escrowId, address voter) external view returns (bool)",
  "function isVotingActive(uint256 escrowId) external view returns (bool)",
  "function getRequiredQuorum() external view returns (uint256)",
  "function canVote(address voter) external view returns (bool)",
  "function getVotingPower(address voter) external view returns (uint256)",
  "function getActiveVotesCount() external view returns (uint256)",
  "function disputeExists(uint256 escrowId) external view returns (bool)",
  "event VoteOpened(uint256 indexed escrowId, uint256 startTime, uint256 endTime)",
  "event VoteCast(uint256 indexed escrowId, address indexed voter, bool supportFreelancer, uint256 tokenAmount)",
  "event VoteFinalized(uint256 indexed escrowId, address indexed winner, uint256 totalVotes)",
  "event QuorumNotMet(uint256 indexed escrowId, uint256 totalVotes, uint256 requiredQuorum)"
];

const TOKEN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function decimals() external view returns (uint8)"
];

export interface VoteData {
  escrowId: number;
  startTime: number;
  endTime: number;
  votesForFreelancer: string;
  votesForClient: string;
  totalVotes: string;
  finalized: boolean;
  winner: string;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  userBalance: string;
}

export const useDAO = () => {
  const { address, isConnected } = useWallet();
  const [daoContract, setDaoContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [canUserVote, setCanUserVote] = useState(false);
  const [userVotingPower, setUserVotingPower] = useState('0');
  const [activeVotesCount, setActiveVotesCount] = useState(0);
  const [requiredQuorum, setRequiredQuorum] = useState('0');

  const DAO_ADDRESS = import.meta.env.VITE_ESCROW_DAO_ADDRESS || '';
  const TOKEN_ADDRESS = import.meta.env.VITE_DAO_TOKEN_ADDRESS || '';

  // Initialize contracts
  useEffect(() => {
    if (DAO_ADDRESS && TOKEN_ADDRESS) {
      // Mock contract for development - replace with actual contract initialization
      const dao = null; // new ethers.Contract(DAO_ADDRESS, DAO_ABI, null /* signer not available */);
      // Mock token contract for development
      const token = null; // new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, null /* signer not available */);
      setDaoContract(dao);
      setTokenContract(token);
    }
  }, [DAO_ADDRESS, TOKEN_ADDRESS]);

  // Parse vote data from contract response
  const parseVoteData = (rawData: any, escrowId: number): VoteData => {
    return {
      escrowId,
      startTime: Number(rawData.startTime),
      endTime: Number(rawData.endTime),
      votesForFreelancer: ethers.formatEther(rawData.votesForFreelancer),
      votesForClient: ethers.formatEther(rawData.votesForClient),
      totalVotes: ethers.formatEther(rawData.totalVotes),
      finalized: rawData.finalized,
      winner: rawData.winner,
    };
  };

  // Open vote for dispute
  const openVote = useCallback(async (escrowId: number): Promise<boolean> => {
    if (!daoContract || !isConnected) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      // Mock implementation for development
      // const contractWithSigner = daoContract.connect(signer);
      // const tx = await contractWithSigner.openVote(escrowId, { gasLimit: 200000 });
      const tx = { wait: () => Promise.resolve() }; // Mock transaction

      toast.loading('Opening vote...', { id: 'open-vote' });
      await tx.wait();
      
      toast.success('Vote opened successfully!', { id: 'open-vote' });
      await fetchDAOStats(); // Refresh data
      return true;
    } catch (error: any) {
      console.error('Open vote error:', error);
      toast.error(error.reason || 'Failed to open vote', { id: 'open-vote' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [daoContract, isConnected, null /* signer not available */]);

  // Cast vote
  const castVote = useCallback(async (escrowId: number, supportFreelancer: boolean): Promise<boolean> => {
    if (!daoContract || !isConnected) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      // Mock implementation for development
      // const contractWithSigner = daoContract.connect(signer);
      // const tx = await contractWithSigner.vote(escrowId, supportFreelancer, { gasLimit: 250000 });
      const tx = { wait: () => Promise.resolve() }; // Mock transaction

      toast.loading(`Voting for ${supportFreelancer ? 'freelancer' : 'client'}...`, { id: 'cast-vote' });
      await tx.wait();
      
      toast.success('Vote cast successfully!', { id: 'cast-vote' });
      return true;
    } catch (error: any) {
      console.error('Cast vote error:', error);
      toast.error(error.reason || 'Failed to cast vote', { id: 'cast-vote' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [daoContract, isConnected, null /* signer not available */]);

  // Finalize vote
  const finalizeVote = useCallback(async (escrowId: number): Promise<boolean> => {
    if (!daoContract || !isConnected) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      // Mock implementation for development
      // const contractWithSigner = daoContract.connect(signer);
      // const tx = await contractWithSigner.finalizeVote(escrowId, { gasLimit: 300000 });
      const tx = { wait: () => Promise.resolve() }; // Mock transaction

      toast.loading('Finalizing vote...', { id: 'finalize-vote' });
      await tx.wait();
      
      toast.success('Vote finalized successfully!', { id: 'finalize-vote' });
      await fetchDAOStats(); // Refresh data
      return true;
    } catch (error: any) {
      console.error('Finalize vote error:', error);
      toast.error(error.reason || 'Failed to finalize vote', { id: 'finalize-vote' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [daoContract, null /* signer not available */]);

  // Get vote data
  const getVote = useCallback(async (escrowId: number): Promise<VoteData | null> => {
    if (!daoContract) return null;

    try {
      // Mock implementation for development
      // const tx = await daoContract.openVote(
      const rawData = null; // Mock transactionescrowId);
      return parseVoteData(rawData, escrowId);
    } catch (error) {
      console.error('Get vote error:', error);
      return null;
    }
  }, [daoContract]);

  // Check if user has voted
  const hasUserVoted = useCallback(async (escrowId: number): Promise<boolean> => {
    if (!daoContract || !address) return false;

    try {
      return await daoContract.hasVoted(escrowId, address);
    } catch (error) {
      console.error('Has voted error:', error);
      return false;
    }
  }, [daoContract, address]);

  // Get user's vote choice
  const getUserVoteChoice = useCallback(async (escrowId: number): Promise<boolean | null> => {
    if (!daoContract || !address) return null;

    try {
      const hasVoted = await daoContract.hasVoted(escrowId, address);
      if (!hasVoted) return null;
      
      return await daoContract.getVoterChoice(escrowId, address);
    } catch (error) {
      console.error('Get vote choice error:', error);
      return null;
    }
  }, [daoContract, address]);

  // Check if voting is active
  const isVotingActive = useCallback(async (escrowId: number): Promise<boolean> => {
    if (!daoContract) return false;

    try {
      // Mock implementation for development
      // const tx = await daoContract.vote(voteId, choice);
      const tx = null; // Mock transaction(escrowId);
      return tx !== null;
    } catch (error) {
      console.error('Is voting active error:', error);
      return false;
    }
  }, [daoContract]);

  // Check if dispute exists
  const disputeExists = useCallback(async (escrowId: number): Promise<boolean> => {
    if (!daoContract) return false;

    try {
      return await daoContract.disputeExists(escrowId);
    } catch (error) {
      console.error('Dispute exists error:', error);
      return false;
    }
  }, [daoContract]);

  // Fetch token information
  const fetchTokenInfo = useCallback(async () => {
    if (!tokenContract || !address) return;

    try {
      const [name, symbol, decimals, totalSupply, userBalance] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
        tokenContract.balanceOf(address)
      ]);

      setTokenInfo({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply),
        userBalance: ethers.formatEther(userBalance),
      });
    } catch (error) {
      console.error('Fetch token info error:', error);
    }
  }, [tokenContract, address]);

  // Fetch DAO stats
  const fetchDAOStats = useCallback(async () => {
    if (!daoContract || !address) return;

    try {
      const [canVote, votingPower, activeVotes, quorum] = await Promise.all([
        daoContract.canVote(address),
        daoContract.getVotingPower(address),
        daoContract.getActiveVotesCount(),
        daoContract.getRequiredQuorum()
      ]);

      setCanUserVote(canVote);
      setUserVotingPower(ethers.formatEther(votingPower));
      setActiveVotesCount(Number(activeVotes));
      setRequiredQuorum(ethers.formatEther(quorum));
    } catch (error) {
      console.error('Fetch DAO stats error:', error);
    }
  }, [daoContract, address]);

  // Auto-fetch data when contracts are ready
  useEffect(() => {
    if (tokenContract && daoContract && address) {
      fetchTokenInfo();
      fetchDAOStats();
    }
  }, [tokenContract, daoContract, address, fetchTokenInfo, fetchDAOStats]);

  // Setup event listeners
  useEffect(() => {
    if (!daoContract || !address) return;

    const handleVoteOpened = (escrowId: bigint) => {
      fetchDAOStats();
      toast.info(`Vote opened for escrow #${escrowId}`);
    };

    const handleVoteCast = (escrowId: bigint, voter: string, supportFreelancer: boolean) => {
      if (voter === address) {
        toast.success(`Your vote for ${supportFreelancer ? 'freelancer' : 'client'} was recorded`);
      }
      fetchDAOStats();
    };

    const handleVoteFinalized = (escrowId: bigint, winner: string, totalVotes: bigint) => {
      fetchDAOStats();
      toast.info(`Vote for escrow #${escrowId} finalized. Winner: ${winner}`);
    };

    const handleQuorumNotMet = (escrowId: bigint, totalVotes: bigint, requiredQuorum: bigint) => {
      toast.warning(`Quorum not met for escrow #${escrowId}. Defaulting to client.`);
    };

    daoContract.on('VoteOpened', handleVoteOpened);
    daoContract.on('VoteCast', handleVoteCast);
    daoContract.on('VoteFinalized', handleVoteFinalized);
    daoContract.on('QuorumNotMet', handleQuorumNotMet);

    return () => {
      daoContract.off('VoteOpened', handleVoteOpened);
      daoContract.off('VoteCast', handleVoteCast);
      daoContract.off('VoteFinalized', handleVoteFinalized);
      daoContract.off('QuorumNotMet', handleQuorumNotMet);
    };
  }, [daoContract, address, fetchDAOStats]);

  // Helper functions
  const getVoteProgress = useCallback((voteData: VoteData): number => {
    const total = parseFloat(voteData.totalVotes);
    const quorum = parseFloat(requiredQuorum);
    return quorum > 0 ? Math.min((total / quorum) * 100, 100) : 0;
  }, [requiredQuorum]);

  const getTimeRemaining = useCallback((endTime: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  const getWinningChoice = useCallback((voteData: VoteData): 'freelancer' | 'client' | 'tie' => {
    const freelancerVotes = parseFloat(voteData.votesForFreelancer);
    const clientVotes = parseFloat(voteData.votesForClient);
    
    if (freelancerVotes > clientVotes) return 'freelancer';
    if (clientVotes > freelancerVotes) return 'client';
    return 'tie';
  }, []);

  return {
    // State
    daoContract,
    tokenContract,
    isLoading,
    tokenInfo,
    canUserVote,
    userVotingPower,
    activeVotesCount,
    requiredQuorum,
    isConnected,

    // Actions
    openVote,
    castVote,
    finalizeVote,
    getVote,
    hasUserVoted,
    getUserVoteChoice,
    isVotingActive,
    disputeExists,
    fetchTokenInfo,
    fetchDAOStats,

    // Helpers
    getVoteProgress,
    getTimeRemaining,
    getWinningChoice,

    // Constants
    VOTING_PERIOD: 3 * 24 * 60 * 60, // 3 days in seconds
    MIN_TOKEN_BALANCE: ethers.parseEther('100'),
  };
};
