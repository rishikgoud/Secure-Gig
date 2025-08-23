import { provider } from "../config/provider";
import { logger } from "../config/logger";

export interface GasSuggestion {
  chainId: number;
  baseFeePerGas: string;
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
  human: {
    baseGwei: number;
    prioGwei: number;
    maxGwei: number;
  };
}

export async function getGasSuggestion(): Promise<GasSuggestion> {
  try {
    // Get priority fee and fee history
    const [priorityHex, feeHistory] = await Promise.all([
      provider.send("eth_maxPriorityFeePerGas", []),
      provider.send("eth_feeHistory", [5, "latest", []])
    ]);

    // Extract base fee from fee history (latest block)
    const baseFeeHex = feeHistory.baseFeePerGas?.at(-1) ?? feeHistory.baseFeePerGas?.[0];
    
    if (!baseFeeHex || !priorityHex) {
      // Fallback to legacy gas price
      const gasPriceHex = await provider.send("eth_gasPrice", []);
      const gasPrice = BigInt(gasPriceHex);
      
      return {
        chainId: await provider.getNetwork().then(n => Number(n.chainId)),
        baseFeePerGas: gasPrice.toString(),
        maxPriorityFeePerGas: "0",
        maxFeePerGas: gasPrice.toString(),
        human: {
          baseGwei: Number(gasPrice) / 1e9,
          prioGwei: 0,
          maxGwei: Number(gasPrice) / 1e9
        }
      };
    }

    const base = BigInt(baseFeeHex);
    const prio = BigInt(priorityHex);
    const maxFee = base + prio * 2n; // Conservative multiplier

    const result: GasSuggestion = {
      chainId: await provider.getNetwork().then(n => Number(n.chainId)),
      baseFeePerGas: base.toString(),
      maxPriorityFeePerGas: prio.toString(),
      maxFeePerGas: maxFee.toString(),
      human: {
        baseGwei: Number(base) / 1e9,
        prioGwei: Number(prio) / 1e9,
        maxGwei: Number(maxFee) / 1e9
      }
    };

    logger.debug('Gas suggestion calculated:', result);
    return result;

  } catch (error) {
    logger.error('Error getting gas suggestion:', error);
    throw new Error('Failed to get gas suggestion');
  }
}

export async function estimateGasForTransaction(
  from: string,
  to: string,
  data: string,
  value: string = "0x0"
): Promise<string> {
  try {
    const gasEstimate = await provider.estimateGas({
      from,
      to,
      data,
      value
    });
    
    logger.debug(`Gas estimate for transaction: ${gasEstimate.toString()}`);
    return gasEstimate.toString();
  } catch (error) {
    logger.error('Error estimating gas:', error);
    throw new Error('Failed to estimate gas');
  }
}
