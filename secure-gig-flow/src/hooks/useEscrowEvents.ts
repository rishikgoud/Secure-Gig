import { useEffect, useState, useCallback } from 'react';
import { EscrowService, EscrowData } from '../lib/escrow';
import { toast } from 'sonner';

const escrowService = new EscrowService();

interface UseEscrowEventsProps {
  userAddress?: string;
  userRole?: 'client' | 'freelancer';
  onEscrowUpdate?: () => void;
}

export function useEscrowEvents({ userAddress, userRole, onEscrowUpdate }: UseEscrowEventsProps = {}) {
  
  const handleEscrowCreated = useCallback((gigId: number, client: string, freelancer: string, amount: string, gigTitle: string) => {
    if (!userAddress) return;
    
    const isUserInvolved = client.toLowerCase() === userAddress.toLowerCase() || 
                          freelancer.toLowerCase() === userAddress.toLowerCase();
    
    if (isUserInvolved) {
      if (client.toLowerCase() === userAddress.toLowerCase()) {
        toast.success(`🔒 Escrow created for "${gigTitle}"`, {
          description: `${amount} AVAX secured for freelancer payment`,
          duration: 5000,
        });
      } else {
        toast.success(`💰 You've been hired for "${gigTitle}"!`, {
          description: `${amount} AVAX secured in escrow. Start working to earn payment.`,
          duration: 5000,
        });
      }
      onEscrowUpdate?.();
    }
  }, [userAddress, onEscrowUpdate]);

  const handleEscrowReleased = useCallback((gigId: number, freelancer: string, amount: string) => {
    if (!userAddress) return;
    
    if (freelancer.toLowerCase() === userAddress.toLowerCase()) {
      toast.success(`🎉 Payment received!`, {
        description: `${amount} AVAX has been released to your wallet`,
        duration: 5000,
      });
    } else {
      // Could be the client who released it
      toast.success(`✅ Funds released successfully`, {
        description: `${amount} AVAX transferred to freelancer`,
        duration: 5000,
      });
    }
    onEscrowUpdate?.();
  }, [userAddress, onEscrowUpdate]);

  const handleEscrowRefunded = useCallback((gigId: number, client: string, amount: string) => {
    if (!userAddress) return;
    
    if (client.toLowerCase() === userAddress.toLowerCase()) {
      toast.info(`💸 Escrow refunded`, {
        description: `${amount} AVAX has been refunded to your wallet`,
        duration: 5000,
      });
    } else {
      toast.info(`❌ Gig cancelled`, {
        description: `Escrow has been cancelled and funds refunded to client`,
        duration: 5000,
      });
    }
    onEscrowUpdate?.();
  }, [userAddress, onEscrowUpdate]);

  useEffect(() => {
    // Set up event listeners
    escrowService.onEscrowCreated(handleEscrowCreated);
    escrowService.onEscrowReleased(handleEscrowReleased);
    escrowService.onEscrowRefunded(handleEscrowRefunded);

    // Cleanup function
    return () => {
      escrowService.removeAllListeners();
    };
  }, [handleEscrowCreated, handleEscrowReleased, handleEscrowRefunded]);

  return {
    // Return any additional functionality if needed
  };
}
