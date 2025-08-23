/**
 * Test utility to verify EscrowStatus enum is properly defined
 * Run this to ensure the enum is not undefined
 */

import { EscrowStatus } from '@/types/escrow';

// Test function to verify EscrowStatus is properly defined
export const testEscrowStatus = () => {
  console.log('EscrowStatus enum:', EscrowStatus);
  console.log('EscrowStatus.Active:', EscrowStatus.Active);
  console.log('EscrowStatus.Completed:', EscrowStatus.Completed);
  console.log('EscrowStatus.Disputed:', EscrowStatus.Disputed);
  console.log('EscrowStatus.Resolved:', EscrowStatus.Resolved);
  
  // Verify enum values
  console.log('Active === 0:', EscrowStatus.Active === 0);
  console.log('Completed === 1:', EscrowStatus.Completed === 1);
  console.log('Disputed === 2:', EscrowStatus.Disputed === 2);
  console.log('Resolved === 3:', EscrowStatus.Resolved === 3);
  
  return EscrowStatus;
};

// Auto-run test when module is imported
console.log('=== EscrowStatus Test ===');
testEscrowStatus();
console.log('=== Test Complete ===');
