import { Contract, Interface, parseUnits, formatUnits } from "ethers";
import escrowAbi from "../contracts/escrow.abi.json";
import { provider, relayer } from "../config/provider";
import { getGasSuggestion, estimateGasForTransaction } from "./gasService";
import { env } from "../config/env";
import { logger } from "../config/logger";

const iface = new Interface(escrowAbi as any);

export interface CallDataResponse {
  to: string;
  data: string;
  value: string;
}

export interface GasEstimate {
  gas: string;
  fees: any;
  tx: CallDataResponse;
}

export interface JobState {
  client: string;
  freelancer: string;
  token: string;
  amount: string;
  state: number;
}

export function encodeDeposit(jobId: number, token: string, amount: string, decimals: number = 6): CallDataResponse {
  const data = iface.encodeFunctionData("deposit", [
    BigInt(jobId),
    token,
    parseUnits(amount, decimals)
  ]);
  
  return { 
    to: env.ESCROW_ADDRESS, 
    data, 
    value: "0x0" 
  };
}

export function encodeRelease(jobId: number): CallDataResponse {
  return {
    to: env.ESCROW_ADDRESS,
    data: iface.encodeFunctionData("release", [BigInt(jobId)]),
    value: "0x0"
  };
}

export function encodeRaiseDispute(jobId: number, reason: string): CallDataResponse {
  return {
    to: env.ESCROW_ADDRESS,
    data: iface.encodeFunctionData("raiseDispute", [BigInt(jobId), reason]),
    value: "0x0"
  };
}

export async function estimateDepositGas(
  from: string, 
  jobId: number, 
  token: string, 
  amount: string, 
  decimals: number = 6
): Promise<GasEstimate> {
  try {
    const tx = encodeDeposit(jobId, token, amount, decimals);
    
    const [gas, fees] = await Promise.all([
      estimateGasForTransaction(from, tx.to, tx.data, tx.value),
      getGasSuggestion()
    ]);

    logger.debug(`Estimated gas for deposit: ${gas}`);
    
    return { gas, fees, tx };
  } catch (error) {
    logger.error('Error estimating deposit gas:', error as Record<string, any>);
    throw new Error('Failed to estimate deposit gas');
  }
}

export async function estimateReleaseGas(from: string, jobId: number): Promise<GasEstimate> {
  try {
    const tx = encodeRelease(jobId);
    
    const [gas, fees] = await Promise.all([
      estimateGasForTransaction(from, tx.to, tx.data, tx.value),
      getGasSuggestion()
    ]);

    logger.debug(`Estimated gas for release: ${gas}`);
    
    return { gas, fees, tx };
  } catch (error) {
    logger.error('Error estimating release gas:', error as Record<string, any>);
    throw new Error('Failed to estimate release gas');
  }
}

export async function estimateDisputeGas(
  from: string, 
  jobId: number, 
  reason: string
): Promise<GasEstimate> {
  try {
    const tx = encodeRaiseDispute(jobId, reason);
    
    const [gas, fees] = await Promise.all([
      estimateGasForTransaction(from, tx.to, tx.data, tx.value),
      getGasSuggestion()
    ]);

    logger.debug(`Estimated gas for dispute: ${gas}`);
    
    return { gas, fees, tx };
  } catch (error) {
    logger.error('Error estimating dispute gas:', error as Record<string, any>);
    throw new Error('Failed to estimate dispute gas');
  }
}

// Optional meta-tx relay functions (only if RELAYER_PK is configured)
export async function relayDeposit(
  jobId: number, 
  token: string, 
  amount: string, 
  decimals: number = 6
): Promise<string> {
  if (!relayer) {
    throw new Error("Relayer not configured");
  }

  try {
    const contract = new Contract(env.ESCROW_ADDRESS, escrowAbi as any, relayer);
    const fees = await getGasSuggestion();
    
    const tx = await contract.deposit(jobId, token, parseUnits(amount, decimals), {
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      maxFeePerGas: fees.maxFeePerGas
    });

    logger.info(`Relayed deposit transaction: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    logger.error('Error relaying deposit:', error as Record<string, any>);
    throw new Error('Failed to relay deposit transaction');
  }
}

export async function relayRelease(jobId: number): Promise<string> {
  if (!relayer) {
    throw new Error("Relayer not configured");
  }

  try {
    const contract = new Contract(env.ESCROW_ADDRESS, escrowAbi as any, relayer);
    const fees = await getGasSuggestion();
    
    const tx = await contract.release(jobId, {
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      maxFeePerGas: fees.maxFeePerGas
    });

    logger.info(`Relayed release transaction: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    logger.error('Error relaying release:', error as Record<string, any>);
    throw new Error('Failed to relay release transaction');
  }
}

export async function relayDispute(jobId: number, reason: string): Promise<string> {
  if (!relayer) {
    throw new Error("Relayer not configured");
  }

  try {
    const contract = new Contract(env.ESCROW_ADDRESS, escrowAbi as any, relayer);
    const fees = await getGasSuggestion();
    
    const tx = await contract.raiseDispute(jobId, reason, {
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      maxFeePerGas: fees.maxFeePerGas
    });

    logger.info(`Relayed dispute transaction: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    logger.error('Error relaying dispute:', error as Record<string, any>);
    throw new Error('Failed to relay dispute transaction');
  }
}

// Read contract state
export async function getJobState(jobId: number): Promise<JobState> {
  try {
    const contract = new Contract(env.ESCROW_ADDRESS, escrowAbi as any, provider);
    const [client, freelancer, token, amount, state] = await contract.job(jobId);
    
    const response = await fetch(env.AVAX_RPC_HTTP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionCount', params: [client, 'latest'], id: 1 } as Record<string, any>)
    });

    const result = {
      client,
      freelancer,
      token,
      amount: amount.toString(),
      state: Number(state)
    };

    logger.debug(`Retrieved job state for job ${jobId}:`, result);
    return result;
  } catch (error) {
    logger.error(`Error getting job state for job ${jobId}:`, error as Record<string, any>);
    throw new Error('Failed to get job state');
  }
}

// Utility function to decode escrow events
export function decodeEscrowEvent(log: any): any {
  try {
    return iface.parseLog(log);
  } catch (error) {
    logger.warn('Failed to decode escrow event:', error as Record<string, any>);
    return null;
  }
}
