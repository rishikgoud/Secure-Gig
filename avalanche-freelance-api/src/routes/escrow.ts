import { Router } from "express";
import { z } from "zod";
import { 
  estimateDepositGas, 
  estimateReleaseGas, 
  estimateDisputeGas,
  relayDeposit,
  relayRelease,
  relayDispute,
  getJobState,
  encodeRelease,
  encodeRaiseDispute
} from "../services/escrowService";
import { 
  depositRequestSchema, 
  releaseRequestSchema, 
  disputeRequestSchema,
  jobIdParamSchema 
} from "../utils/validators";
import { logger } from "../config/logger";

export const escrow = Router();

// Get calldata and gas estimate for deposit
escrow.post("/quote/deposit", async (req, res, next) => {
  try {
    const body = depositRequestSchema.parse(req.body);
    const estimate = await estimateDepositGas(
      body.from, 
      body.jobId, 
      body.token, 
      body.amount, 
      body.decimals
    );
    res.json(estimate);
  } catch (error) {
    logger.error('Error getting deposit quote:', error);
    next(error);
  }
});

// Get calldata and gas estimate for release
escrow.post("/quote/release", async (req, res, next) => {
  try {
    const body = releaseRequestSchema.parse(req.body);
    const estimate = await estimateReleaseGas(body.from, body.jobId);
    res.json(estimate);
  } catch (error) {
    logger.error('Error getting release quote:', error);
    next(error);
  }
});

// Get calldata and gas estimate for dispute
escrow.post("/quote/dispute", async (req, res, next) => {
  try {
    const body = disputeRequestSchema.parse(req.body);
    const estimate = await estimateDisputeGas(body.from, body.jobId, body.reason);
    res.json(estimate);
  } catch (error) {
    logger.error('Error getting dispute quote:', error);
    next(error);
  }
});

// Optional meta-tx relay endpoints (only if relayer is configured)
escrow.post("/relay/deposit", async (req, res, next) => {
  try {
    const body = z.object({ 
      jobId: z.number().int(), 
      token: z.string(), 
      amount: z.string(),
      decimals: z.number().int().min(0).max(18).default(6)
    }).parse(req.body);
    
    const txHash = await relayDeposit(body.jobId, body.token, body.amount, body.decimals);
    res.json({ txHash });
  } catch (error) {
    logger.error('Error relaying deposit:', error);
    next(error);
  }
});

escrow.post("/relay/release", async (req, res, next) => {
  try {
    const body = z.object({ jobId: z.number().int() }).parse(req.body);
    const txHash = await relayRelease(body.jobId);
    res.json({ txHash });
  } catch (error) {
    logger.error('Error relaying release:', error);
    next(error);
  }
});

escrow.post("/relay/dispute", async (req, res, next) => {
  try {
    const body = z.object({ 
      jobId: z.number().int(), 
      reason: z.string().min(3) 
    }).parse(req.body);
    
    const txHash = await relayDispute(body.jobId, body.reason);
    res.json({ txHash });
  } catch (error) {
    logger.error('Error relaying dispute:', error);
    next(error);
  }
});

// Get job state from contract
escrow.get("/job/:jobId", async (req, res, next) => {
  try {
    const { jobId } = jobIdParamSchema.parse(req.params);
    const jobState = await getJobState(jobId);
    res.json(jobState);
  } catch (error) {
    logger.error('Error getting job state:', error);
    next(error);
  }
});
