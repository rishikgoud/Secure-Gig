import { JsonRpcProvider, Wallet } from "ethers";
import { env } from "./env";
import { logger } from "./logger";

export const provider = new JsonRpcProvider(env.AVAX_RPC_HTTP, Number(env.AVAX_CHAIN_ID));
export const wsUrl = env.AVAX_RPC_WS;

export const relayer = env.RELAYER_PK ? new Wallet(env.RELAYER_PK, provider) : null;

// Test provider connection (called lazily)
export async function testProviderConnection() {
  try {
    const payload = { jsonrpc: '2.0', method: 'net_version', params: [], id: 1 };
    const response = await fetch(env.AVAX_RPC_HTTP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload as Record<string, any>)
    });
    const network = await provider.getNetwork();
    logger.info(`Connected to Avalanche network: ${network.name} (Chain ID: ${network.chainId})`);
    return network;
  } catch (error) {
    logger.error('Failed to connect to Avalanche network:', error as Record<string, any>);
    throw error;
  }
}
