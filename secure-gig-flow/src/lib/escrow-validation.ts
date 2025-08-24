import { ethers } from 'ethers';
import { 
  EscrowParams, 
  EscrowValidationResult, 
  TokenInfo, 
  SUPPORTED_TOKENS,
  JobPost 
} from '../api/types';

/**
 * Production-level escrow validation and utility functions
 */
export class EscrowValidator {
  
  /**
   * Validates and sanitizes escrow parameters
   */
  static validateEscrowParams(params: Partial<EscrowParams>): EscrowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate required fields
    if (!params.jobId) {
      errors.push('Job ID is required');
    }
    
    if (!params.clientAddress) {
      errors.push('Client address is required');
    } else if (!ethers.isAddress(params.clientAddress)) {
      errors.push('Invalid client address format');
    }
    
    if (!params.freelancerAddress) {
      errors.push('Freelancer address is required');
    } else if (!ethers.isAddress(params.freelancerAddress)) {
      errors.push('Invalid freelancer address format');
    }
    
    if (!params.jobTitle || typeof params.jobTitle !== 'string') {
      errors.push('Job title is required and must be a string');
    }
    
    // Validate amount - this is the critical fix for the FixedNumber error
    const amountValidation = this.validateAmount(params.amount);
    if (!amountValidation.isValid) {
      errors.push(...amountValidation.errors);
    }
    
    // Validate deadline
    if (!params.deadline) {
      errors.push('Deadline is required');
    } else if (new Date(params.deadline) <= new Date()) {
      errors.push('Deadline must be in the future');
    }
    
    // Validate token address if provided
    if (params.tokenAddress && !ethers.isAddress(params.tokenAddress)) {
      errors.push('Invalid token address format');
    }
    
    // Security checks
    if (params.clientAddress === params.freelancerAddress) {
      errors.push('Client and freelancer addresses cannot be the same');
    }
    
    // Amount range validation
    if (amountValidation.isValid) {
      const numericAmount = parseFloat(amountValidation.sanitizedAmount!);
      if (numericAmount <= 0) {
        errors.push('Amount must be greater than 0');
      }
      if (numericAmount > 1000000) { // 1M limit
        warnings.push('Large amount detected - consider multi-signature approval');
      }
    }
    
    const isValid = errors.length === 0;
    
    const result: EscrowValidationResult = {
      isValid,
      errors,
      warnings
    };
    
    if (isValid) {
      result.sanitizedParams = {
        jobId: params.jobId!,
        clientAddress: params.clientAddress!,
        freelancerAddress: params.freelancerAddress!,
        amount: amountValidation.sanitizedAmount!,
        deadline: new Date(params.deadline!),
        jobTitle: params.jobTitle!.trim(),
        tokenAddress: params.tokenAddress || SUPPORTED_TOKENS.AVAX.address,
        description: params.description?.trim()
      };
    }
    
    return result;
  }
  
  /**
   * Validates amount field - prevents FixedNumber errors
   */
  static validateAmount(amount: any): { isValid: boolean; errors: string[]; sanitizedAmount?: string } {
    const errors: string[] = [];
    
    if (amount === undefined || amount === null) {
      errors.push('Amount is required');
      return { isValid: false, errors };
    }
    
    // Check if it's a string that looks like a job title (common error source)
    if (typeof amount === 'string') {
      // If it contains letters or is longer than reasonable for a number, it's likely a title
      if (/[a-zA-Z]/.test(amount) || amount.length > 20) {
        errors.push(`Invalid amount format: "${amount}" appears to be text, not a number`);
        return { isValid: false, errors };
      }
      
      // Try to parse as number
      const parsed = parseFloat(amount);
      if (isNaN(parsed)) {
        errors.push(`Cannot parse amount "${amount}" as a number`);
        return { isValid: false, errors };
      }
      
      return { isValid: true, errors: [], sanitizedAmount: parsed.toString() };
    }
    
    if (typeof amount === 'number') {
      if (isNaN(amount) || !isFinite(amount)) {
        errors.push('Amount must be a valid finite number');
        return { isValid: false, errors };
      }
      
      return { isValid: true, errors: [], sanitizedAmount: amount.toString() };
    }
    
    errors.push(`Amount must be a number or numeric string, received: ${typeof amount}`);
    return { isValid: false, errors };
  }
  
  /**
   * Extracts budget amount from JobPost data structure
   */
  static extractBudgetFromJob(job: JobPost): { amount: string; currency: string } | null {
    try {
      if (!job.budget || typeof job.budget.amount !== 'number') {
        return null;
      }
      
      return {
        amount: job.budget.amount.toString(),
        currency: job.budget.currency || 'USD'
      };
    } catch (error) {
      console.error('Error extracting budget from job:', error);
      return null;
    }
  }
  
  /**
   * Converts amount to proper blockchain format with decimal handling
   */
  static formatAmountForBlockchain(amount: string, tokenSymbol: string = 'AVAX'): string {
    const token = SUPPORTED_TOKENS[tokenSymbol] || SUPPORTED_TOKENS.AVAX;
    
    try {
      // Parse the amount and convert to wei/smallest unit
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid amount for blockchain formatting');
      }
      
      // Use ethers to handle decimal conversion properly
      return ethers.parseUnits(amount, token.decimals).toString();
    } catch (error) {
      throw new Error(`Failed to format amount for blockchain: ${error}`);
    }
  }
  
  /**
   * Converts blockchain amount back to human readable format
   */
  static formatAmountFromBlockchain(amount: string, tokenSymbol: string = 'AVAX'): string {
    const token = SUPPORTED_TOKENS[tokenSymbol] || SUPPORTED_TOKENS.AVAX;
    
    try {
      return ethers.formatUnits(amount, token.decimals);
    } catch (error) {
      throw new Error(`Failed to format amount from blockchain: ${error}`);
    }
  }
  
  /**
   * Gets token info by symbol or address
   */
  static getTokenInfo(symbolOrAddress: string): TokenInfo | null {
    // Check by symbol first
    const bySymbol = SUPPORTED_TOKENS[symbolOrAddress.toUpperCase()];
    if (bySymbol) return bySymbol;
    
    // Check by address
    for (const token of Object.values(SUPPORTED_TOKENS)) {
      if (token.address.toLowerCase() === symbolOrAddress.toLowerCase()) {
        return token;
      }
    }
    
    return null;
  }
  
  /**
   * Estimates gas costs for escrow operations
   */
  static async estimateGasCosts(
    provider: ethers.Provider,
    operation: 'create' | 'release' | 'dispute',
    amount?: string
  ): Promise<{ gasLimit: string; gasPrice: string; totalCost: string }> {
    try {
      const gasPrice = (await provider.getFeeData()).gasPrice || ethers.parseUnits('20', 'gwei');
      
      // Estimated gas limits for different operations
      const gasLimits = {
        create: '150000',
        release: '100000',
        dispute: '120000'
      };
      
      const gasLimit = gasLimits[operation];
      const totalCost = (BigInt(gasLimit) * gasPrice).toString();
      
      return {
        gasLimit,
        gasPrice: gasPrice.toString(),
        totalCost
      };
    } catch (error) {
      throw new Error(`Failed to estimate gas costs: ${error}`);
    }
  }
}

/**
 * Escrow error handling utilities
 */
export class EscrowErrorHandler {
  
  static createEscrowError(code: string, message: string, details?: any): Error {
    const error = new Error(message);
    (error as any).code = code;
    (error as any).details = details;
    return error;
  }
  
  static handleBlockchainError(error: any): { userMessage: string; code: string } {
    console.error('Blockchain error:', error);
    
    if (error.code === 'INVALID_ARGUMENT') {
      if (error.message.includes('FixedNumber')) {
        return {
          code: 'INVALID_AMOUNT_FORMAT',
          userMessage: 'Invalid amount format. Please enter a valid numeric value.'
        };
      }
      return {
        code: 'INVALID_ARGUMENT',
        userMessage: 'Invalid parameters provided. Please check your input.'
      };
    }
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return {
        code: 'INSUFFICIENT_FUNDS',
        userMessage: 'Insufficient funds to complete this transaction.'
      };
    }
    
    if (error.code === 'USER_REJECTED') {
      return {
        code: 'USER_REJECTED',
        userMessage: 'Transaction was rejected by user.'
      };
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return {
        code: 'NETWORK_ERROR',
        userMessage: 'Network error. Please check your connection and try again.'
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      userMessage: 'An unexpected error occurred. Please try again.'
    };
  }
}
