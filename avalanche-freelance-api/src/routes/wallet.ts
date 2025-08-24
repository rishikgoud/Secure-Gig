import { Router } from "express";
import { getBalances, getLatestTransactions, getTokenBalance } from "../services/walletService";
import { addressParamSchema, tokenAddressParamSchema } from "../utils/validators";
import { logger } from "../config/logger";

export const wallet = Router();

wallet.get("/:address/balances", async (req, res, next) => {
  try {
    const { address } = addressParamSchema.parse(req.params);
    const balances = await getBalances(address);
    res.json(balances);
  } catch (error: unknown) {
    logger.error('Error getting balances:', error as Record<string, any>);
    next(error);
  }
});

wallet.get("/:address/activity", async (req, res, next) => {
  try {
    const { address } = addressParamSchema.parse(req.params);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const transactions = await getLatestTransactions(address, limit);
    res.json({ transactions });
  } catch (error: unknown) {
    logger.error('Error getting activity:', error as Record<string, any>);
    next(error);
  }
});

wallet.get("/:address/tokens/:tokenAddress", async (req, res, next) => {
  try {
    const { address } = addressParamSchema.parse(req.params);
    const { tokenAddress } = tokenAddressParamSchema.parse(req.params);
    const tokenBalance = await getTokenBalance(address, tokenAddress);
    res.json(tokenBalance);
  } catch (error: unknown) {
    logger.error('Error getting token balance:', error as Record<string, any>);
    next(error);
  }
});
