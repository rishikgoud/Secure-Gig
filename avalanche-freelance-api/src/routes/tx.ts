import { Router } from "express";
import { getTx, getTransactionStatus, waitForTransaction } from "../services/txService";
import { txHashParamSchema } from "../utils/validators";
import { logger } from "../config/logger";

export const tx = Router();

tx.get("/:hash", async (req, res, next) => {
  try {
    const { hash } = txHashParamSchema.parse(req.params);
    const transactionDetails = await getTx(hash);
    res.json(transactionDetails);
  } catch (error: unknown) {
    logger.error('Error getting transaction:', error as Record<string, any>);
    next(error);
  }
});

tx.get("/:hash/status", async (req, res, next) => {
  try {
    const { hash } = txHashParamSchema.parse(req.params);
    const status = await getTransactionStatus(hash);
    res.json(status);
  } catch (error: unknown) {
    logger.error('Error getting transaction status:', error as Record<string, any>);
    next(error);
  }
});

tx.post("/:hash/wait", async (req, res, next) => {
  try {
    const { hash } = txHashParamSchema.parse(req.params);
    const confirmations = req.body.confirmations || 1;
    const timeout = req.body.timeout || 300000; // 5 minutes default
    
    const receipt = await waitForTransaction(hash, confirmations, timeout);
    res.json(receipt);
  } catch (error: unknown) {
    logger.error('Error waiting for transaction:', error as Record<string, any>);
    next(error);
  }
});
