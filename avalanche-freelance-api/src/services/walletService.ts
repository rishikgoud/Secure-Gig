import { glacier } from "../config/glacier";
import { env } from "../config/env";
import { logger } from "../config/logger";

export interface NativeBalance {
  balance: string;
  balanceValue: {
    value: string;
    valueDisplayText: string;
  };
}

export interface Erc20Balance {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri?: string;
  balance: string;
  balanceValue: {
    value: string;
    valueDisplayText: string;
  };
}

export interface BalanceResponse {
  native: NativeBalance;
  erc20: Erc20Balance[];
}

export interface Transaction {
  txHash: string;
  blockNumber: string;
  blockTimestamp: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: string;
  methodId?: string;
  transfers?: any[];
}

export async function getBalances(address: string): Promise<BalanceResponse> {
  try {
    const chain = env.AVAX_CHAIN_ID;
    
    const [nativeResponse, erc20Response] = await Promise.all([
      glacier.get(`/chains/${chain}/addresses/${address}/balances:native`),
      glacier.get(`/chains/${chain}/addresses/${address}/balances:listErc20`, {
        params: {
          filterSpamTokens: true
        }
      })
    ]);

    logger.debug(`Retrieved balances for address: ${address}`);
    
    return {
      native: nativeResponse.data,
      erc20: erc20Response.data.erc20TokenBalances || []
    };
  } catch (error) {
    logger.error('Error getting balances:', error);
    throw new Error('Failed to retrieve balances');
  }
}

export async function getLatestTransactions(
  address: string, 
  limit: number = 20
): Promise<Transaction[]> {
  try {
    const chain = env.AVAX_CHAIN_ID;
    
    const response = await glacier.get(`/chains/${chain}/addresses/${address}/transactions:latest`, {
      params: {
        pageSize: limit
      }
    });

    logger.debug(`Retrieved ${response.data.transactions?.length || 0} transactions for address: ${address}`);
    
    return response.data.transactions || [];
  } catch (error) {
    logger.error('Error getting latest transactions:', error);
    throw new Error('Failed to retrieve transaction history');
  }
}

export async function getTokenBalance(
  address: string, 
  tokenAddress: string
): Promise<Erc20Balance | null> {
  try {
    const chain = env.AVAX_CHAIN_ID;
    
    const response = await glacier.get(
      `/chains/${chain}/addresses/${address}/balances:listErc20`,
      {
        params: {
          tokenAddress,
          filterSpamTokens: true
        }
      }
    );

    const tokenBalances = response.data.erc20TokenBalances || [];
    const tokenBalance = tokenBalances.find(
      (balance: Erc20Balance) => balance.address.toLowerCase() === tokenAddress.toLowerCase()
    );

    logger.debug(`Retrieved token balance for ${tokenAddress}: ${tokenBalance?.balance || '0'}`);
    
    return tokenBalance || null;
  } catch (error) {
    logger.error('Error getting token balance:', error);
    throw new Error('Failed to retrieve token balance');
  }
}

export async function getTransactionsByContract(
  contractAddress: string,
  limit: number = 50
): Promise<Transaction[]> {
  try {
    const chain = env.AVAX_CHAIN_ID;
    
    const response = await glacier.get(
      `/chains/${chain}/addresses/${contractAddress}/transactions:latest`,
      {
        params: {
          pageSize: limit
        }
      }
    );

    logger.debug(`Retrieved ${response.data.transactions?.length || 0} transactions for contract: ${contractAddress}`);
    
    return response.data.transactions || [];
  } catch (error) {
    logger.error('Error getting contract transactions:', error);
    throw new Error('Failed to retrieve contract transactions');
  }
}
