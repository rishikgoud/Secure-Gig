import { Router } from "express";
import { z } from "zod";
import { 
  estimateDepositGas, 
  estimateReleaseGas, 
  estimateDisputeGas,
  relayDeposit,
  relayRelease,
  relayDispute,
  getJobState
} from "../services/escrowService";
import { logger } from "../config/logger";

const router = Router();

// Validation schemas
const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");
const amountSchema = z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount format");

const depositSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  freelancerAddress: addressSchema,
  amount: amountSchema,
  clientAddress: addressSchema
});

const releaseSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  clientAddress: addressSchema
});

const disputeSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  disputeReason: z.string().min(10, "Dispute reason must be at least 10 characters"),
  initiatorAddress: addressSchema
});

// Error handling middleware
const handleRouteError = (error: any, req: any, res: any, operation: string) => {
  logger.error(`${operation} failed`, {
    error: error.message,
    stack: error.stack,
    body: req.body,
    params: req.params
  });

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: error.errors
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || `${operation} failed`;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * POST /api/escrow/estimate-deposit
 * Estimate gas for deposit transaction
 */
router.post("/estimate-deposit", async (req, res) => {
  try {
    const validatedData = depositSchema.parse(req.body);
    
    logger.info("Estimating deposit gas", { 
      jobId: validatedData.jobId,
      amount: validatedData.amount 
    });

    const gasEstimate = await estimateDepositGas(
      validatedData.clientAddress,
      parseInt(validatedData.jobId),
      validatedData.freelancerAddress,
      validatedData.amount
    );

    res.json({
      success: true,
      data: {
        gasEstimate: gasEstimate.toString(),
        estimatedCost: gasEstimate.toString() // In wei
      }
    });

  } catch (error) {
    handleRouteError(error, req, res, "Gas estimation for deposit");
  }
});

/**
 * POST /api/escrow/deposit
 * Create escrow deposit
 */
router.post("/deposit", async (req, res) => {
  try {
    const validatedData = depositSchema.parse(req.body);
    
    logger.info("Processing escrow deposit", { 
      jobId: validatedData.jobId,
      amount: validatedData.amount 
    });

    const result = await relayDeposit(
      parseInt(validatedData.jobId),
      validatedData.freelancerAddress,
      validatedData.amount
    );

    res.json({
      success: true,
      data: {
        transactionHash: result,
        jobId: validatedData.jobId,
        status: "pending"
      }
    });

  } catch (error) {
    handleRouteError(error, req, res, "Escrow deposit");
  }
});

/**
 * POST /api/escrow/estimate-release
 * Estimate gas for release transaction
 */
router.post("/estimate-release", async (req, res) => {
  try {
    const validatedData = releaseSchema.parse(req.body);
    
    logger.info("Estimating release gas", { 
      jobId: validatedData.jobId 
    });

    const gasEstimate = await estimateReleaseGas(
      validatedData.clientAddress,
      parseInt(validatedData.jobId)
    );

    res.json({
      success: true,
      data: {
        gasEstimate: gasEstimate.toString(),
        estimatedCost: gasEstimate.toString()
      }
    });

  } catch (error) {
    handleRouteError(error, req, res, "Gas estimation for release");
  }
});

/**
 * POST /api/escrow/release
 * Release escrow funds to freelancer
 */
router.post("/release", async (req, res) => {
  try {
    const validatedData = releaseSchema.parse(req.body);
    
    logger.info("Processing escrow release", { 
      jobId: validatedData.jobId 
    });

    const result = await relayRelease(
      parseInt(validatedData.jobId)
    );

    res.json({
      success: true,
      data: {
        transactionHash: result,
        jobId: validatedData.jobId,
        status: "released"
      }
    });

  } catch (error) {
    handleRouteError(error, req, res, "Escrow release");
  }
});

/**
 * POST /api/escrow/estimate-dispute
 * Estimate gas for dispute transaction
 */
router.post("/estimate-dispute", async (req, res) => {
  try {
    const validatedData = disputeSchema.parse(req.body);
    
    logger.info("Estimating dispute gas", { 
      jobId: validatedData.jobId 
    });

    const gasEstimate = await estimateDisputeGas(
      validatedData.initiatorAddress,
      parseInt(validatedData.jobId),
      validatedData.disputeReason
    );

    res.json({
      success: true,
      data: {
        gasEstimate: gasEstimate.toString(),
        estimatedCost: gasEstimate.toString()
      }
    });

  } catch (error) {
    handleRouteError(error, req, res, "Gas estimation for dispute");
  }
});

/**
 * POST /api/escrow/dispute
 * Raise a dispute for escrow
 */
router.post("/dispute", async (req, res) => {
  try {
    const validatedData = disputeSchema.parse(req.body);
    
    logger.info("Processing escrow dispute", { 
      jobId: validatedData.jobId,
      reason: validatedData.disputeReason 
    });

    const result = await relayDispute(
      parseInt(validatedData.jobId),
      validatedData.disputeReason
    );

    res.json({
      success: true,
      data: {
        transactionHash: result,
        jobId: validatedData.jobId,
        status: "disputed"
      }
    });

  } catch (error) {
    handleRouteError(error, req, res, "Escrow dispute");
  }
});

/**
 * GET /api/escrow/job/:jobId
 * Get job state and escrow details
 */
router.get("/job/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId || jobId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Job ID is required"
      });
    }

    logger.info("Fetching job state", { jobId });

    const jobState = await getJobState(parseInt(jobId));

    res.json({
      success: true,
      data: jobState
    });

  } catch (error) {
    handleRouteError(error, req, res, "Fetch job state");
  }
  return;
});

/**
 * GET /api/escrow/jobs
 * Get all jobs with pagination
 */
router.get("/jobs", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    logger.info("Fetching all jobs", { page, limit, status });

    // Mock response since getAllJobs doesn't exist
    const jobs = {
      data: [],
      total: 0,
      page,
      limit
    };

    res.json({
      success: true,
      data: jobs
    });

  } catch (error) {
    handleRouteError(error, req, res, "Fetch all jobs");
  }
});

/**
 * GET /api/escrow/health
 * Health check endpoint
 */
router.get("/health", async (req, res) => {
  try {
    // Basic health check - could be expanded to check contract connectivity
    res.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "escrow-api"
      }
    });
  } catch (error) {
    handleRouteError(error, req, res, "Health check");
  }
});

export default router;
