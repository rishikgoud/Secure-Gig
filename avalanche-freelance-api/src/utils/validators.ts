import { z } from 'zod';

// Address validation
export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// Transaction hash validation
export const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash');

// Job ID validation
export const jobIdSchema = z.number().int().min(0, 'Job ID must be a non-negative integer');

// Amount validation (string representation of BigInt)
export const amountSchema = z.string().regex(/^\d+$/, 'Amount must be a positive integer string');

// Token decimals validation
export const decimalsSchema = z.number().int().min(0).max(18).default(6);

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// Deposit request validation
export const depositRequestSchema = z.object({
  from: addressSchema,
  jobId: jobIdSchema,
  token: addressSchema,
  amount: amountSchema,
  decimals: decimalsSchema.optional()
});

// Release request validation
export const releaseRequestSchema = z.object({
  from: addressSchema,
  jobId: jobIdSchema
});

// Dispute request validation
export const disputeRequestSchema = z.object({
  from: addressSchema,
  jobId: jobIdSchema,
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000, 'Reason too long')
});

// Job creation validation
export const createJobSchema = z.object({
  client: addressSchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  token: addressSchema,
  amount: amountSchema,
  deadline: z.string().datetime().optional(),
  skills: z.array(z.string().max(50)).max(10).default([])
});

// User creation/update validation
export const userSchema = z.object({
  address: addressSchema,
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['CLIENT', 'FREELANCER', 'BOTH']).default('BOTH')
});

// Dispute evidence validation
export const disputeEvidenceSchema = z.object({
  submittedBy: addressSchema,
  content: z.string().min(1).max(2000),
  ipfsHash: z.string().optional()
});

// Query parameters validation
export const addressParamSchema = z.object({
  address: addressSchema
});

export const txHashParamSchema = z.object({
  hash: txHashSchema
});

export const jobIdParamSchema = z.object({
  jobId: z.string().transform(Number).pipe(jobIdSchema)
});

export const tokenAddressParamSchema = z.object({
  tokenAddress: addressSchema
});
