import { provider } from "../config/provider";
import { glacier } from "../config/glacier";
import { env } from "../config/env";
import { logger } from "../config/logger";

export interface TransactionDetails {
  tx: any;
  receipt: any;
  enriched?: any;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  confirmations?: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

export async function getTx(hash: string): Promise<TransactionDetails> {
  try {
    const [tx, receipt] = await Promise.all([
      provider.getTransaction(hash),
      provider.getTransactionReceipt(hash)
    ]);

    let enriched;
    try {
      // Optional: enriched data from Glacier (transfers, logs decoded)
      const chain = env.AVAX_CHAIN_ID;
      const enrichedResponse = await glacier.get(`/chains/${chain}/transactions/${hash}`);
      enriched = enrichedResponse.data;
    } catch (glacierError) {
      logger.warn(`Failed to get enriched data for tx ${hash}:`, glacierError);
    }

    logger.debug(`Retrieved transaction details for: ${hash}`);
    return { tx, receipt, enriched };
  } catch (error) {
    logger.error(`Error getting transaction ${hash}:`, error);
    throw new Error('Failed to retrieve transaction details');
  }
}

export async function getTransactionStatus(hash: string): Promise<TransactionStatus> {
  try {
    const receipt = await provider.getTransactionReceipt(hash);
    
    if (!receipt) {
      return {
        hash,
        status: 'pending'
      };
    }

    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;

    return {
      hash,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      blockNumber: receipt.blockNumber,
      confirmations,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.gasPrice?.toString()
    };
  } catch (error) {
    logger.error(`Error getting transaction status for ${hash}:`, error);
    throw new Error('Failed to get transaction status');
  }
}

export async function waitForTransaction(
  hash: string, 
  confirmations: number = 1,
  timeout: number = 300000 // 5 minutes
): Promise<any> {
  try {
    logger.info(`Waiting for transaction ${hash} with ${confirmations} confirmations`);
    
    const receipt = await provider.waitForTransaction(hash, confirmations, timeout);
    
    if (!receipt) {
      throw new Error('Transaction was not mined within timeout period');
    }

    logger.info(`Transaction ${hash} confirmed with ${confirmations} confirmations`);
    return receipt;
  } catch (error) {
    logger.error(`Error waiting for transaction ${hash}:`, error);
    throw new Error('Transaction confirmation failed');
  }
}

export async function getTransactionLogs(hash: string): Promise<any[]> {
  try {
    const receipt = await provider.getTransactionReceipt(hash);
    
    if (!receipt) {
      throw new Error('Transaction not found or not mined yet');
    }

    logger.debug(`Retrieved ${receipt.logs.length} logs for transaction: ${hash}`);
    // Convert readonly Log[] to a mutable array
    return [...receipt.logs];
  } catch (error) {
    logger.error(`Error getting transaction logs for ${hash}:`, error);
    throw new Error('Failed to retrieve transaction logs');
  }
}
