/**
 * Escrow system type definitions
 * Core types for escrow contracts and DAO voting
 */

export enum EscrowStatus {
  Active = 0,
  Completed = 1,
  Disputed = 2,
  Resolved = 3
}

export interface EscrowData {
  id: string;
  title: string;
  description: string;
  client: string;
  freelancer: string;
  amount: string;
  currency: string;
  status: EscrowStatus;
  createdAt: number;
  deadline: number;
  milestones: {
    id: string;
    title: string;
    amount: string;
    completed: boolean;
    approvedByClient: boolean;
  }[];
  disputeReason?: string;
  disputeRaisedAt?: number;
  disputeRaisedBy?: 'client' | 'freelancer';
  clientApproved: boolean;
  workSubmitted: boolean;
  workSubmittedAt?: number;
  completedAt?: number;
  resolvedAt?: number;
}

export interface CreateEscrowParams {
  title: string;
  description: string;
  freelancer: string;
  amount: string;
  currency: string;
  deadline: number;
  milestones: {
    title: string;
    amount: string;
  }[];
}

export interface DAOVote {
  id: string;
  escrowId: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  deadline: number;
  status: 'active' | 'passed' | 'failed' | 'executed';
  createdAt: number;
  voters: {
    address: string;
    vote: 'for' | 'against';
    votingPower: number;
    timestamp: number;
  }[];
}

export interface EscrowStats {
  totalEscrows: number;
  totalValueLocked: string;
  activeEscrows: number;
  completedEscrows: number;
  disputedEscrows: number;
}
