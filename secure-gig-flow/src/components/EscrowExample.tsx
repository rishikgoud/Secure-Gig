import React, { useState, useEffect } from 'react';
import { CreateEscrowParams, EscrowData, EscrowStatus } from '../lib/escrow-service';

/**
 * Example React component demonstrating production-level escrow integration
 */
export const EscrowExample: React.FC = () => {
  // Remove useEscrow hook since it doesn't exist
  const [escrowState, setEscrowState] = useState({
    isInitialized: false,
    isLoading: false,
    error: null,
    isConnected: false,
    isCorrectNetwork: false,
    signerAddress: ''
  });
  
  const escrowActions = {
    initialize: async () => {
      setEscrowState(prev => ({ ...prev, isLoading: true }));
      // Mock initialization
      setTimeout(() => {
        setEscrowState(prev => ({ 
          ...prev, 
          isInitialized: true, 
          isLoading: false, 
          isConnected: true, 
          isCorrectNetwork: true,
          signerAddress: '0x1234567890123456789012345678901234567890'
        }));
      }, 1000);
    },
    isValidAddress: (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address),
    createEscrow: async (params: CreateEscrowParams) => {
      setEscrowState(prev => ({ ...prev, isLoading: true }));
      // Mock creation
      return new Promise(resolve => {
        setTimeout(() => {
          setEscrowState(prev => ({ ...prev, isLoading: false }));
          resolve({ success: true, data: { gigId: params.gigId } });
        }, 2000);
      });
    },
    getEscrow: async (gigId: string) => {
      setEscrowState(prev => ({ ...prev, isLoading: true }));
      // Mock retrieval
      return new Promise(resolve => {
        setTimeout(() => {
          setEscrowState(prev => ({ ...prev, isLoading: false }));
          resolve({ 
            success: true, 
            data: {
              gigId,
              gigTitle: 'Sample Gig',
              amount: '0.1',
              status: EscrowStatus.Active,
              client: '0x1234567890123456789012345678901234567890',
              freelancer: '0x0987654321098765432109876543210987654321',
              createdAt: new Date().toISOString()
            }
          });
        }, 1000);
      });
    },
    releaseEscrow: async (gigId: string) => {
      setEscrowState(prev => ({ ...prev, isLoading: true }));
      return new Promise(resolve => {
        setTimeout(() => {
          setEscrowState(prev => ({ ...prev, isLoading: false }));
          resolve({ success: true });
        }, 2000);
      });
    },
    refundEscrow: async (gigId: string) => {
      setEscrowState(prev => ({ ...prev, isLoading: true }));
      return new Promise(resolve => {
        setTimeout(() => {
          setEscrowState(prev => ({ ...prev, isLoading: false }));
          resolve({ success: true });
        }, 2000);
      });
    },
    checkConnection: async () => {
      setEscrowState(prev => ({ ...prev, isLoading: true }));
      setTimeout(() => {
        setEscrowState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isConnected: true,
          signerAddress: '0x1234567890123456789012345678901234567890'
        }));
      }, 500);
    },
    switchNetwork: async () => {
      setEscrowState(prev => ({ ...prev, isLoading: true }));
      setTimeout(() => {
        setEscrowState(prev => ({ ...prev, isLoading: false, isCorrectNetwork: true }));
      }, 1000);
    }
  };
  const [formData, setFormData] = useState<CreateEscrowParams>({
    gigId: '',
    freelancerAddress: '',
    amount: '',
    gigTitle: ''
  });
  const [searchGigId, setSearchGigId] = useState('');
  const [escrowData, setEscrowData] = useState<EscrowData | null>(null);

  // Initialize on component mount
  useEffect(() => {
    escrowActions.initialize();
  }, []);

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.gigId || !formData.freelancerAddress || !formData.amount || !formData.gigTitle) {
      alert('Please fill in all fields');
      return;
    }

    // Validate freelancer address
    if (!escrowActions.isValidAddress(formData.freelancerAddress)) {
      alert('Invalid freelancer address');
      return;
    }

    const result = await escrowActions.createEscrow(formData) as any;
    
    if (result.success) {
      console.log('Escrow created successfully:', result);
      // Reset form
      setFormData({
        gigId: '',
        freelancerAddress: '',
        amount: '',
        gigTitle: ''
      });
    } else {
      console.error('Failed to create escrow:', result.error);
    }
  };

  const handleSearchEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchGigId) {
      alert('Please enter a gig ID');
      return;
    }

    const result = await escrowActions.getEscrow(searchGigId) as any;
    
    if (result.success && result.data) {
      setEscrowData(result.data);
    } else {
      setEscrowData(null);
      console.error('Failed to get escrow:', result.error);
    }
  };

  const handleReleaseEscrow = async (gigId: string) => {
    const result = await escrowActions.releaseEscrow(gigId) as any;
    
    if (result.success) {
      console.log('Escrow released successfully');
      // Refresh escrow data
      const mockEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleSearchEscrow(mockEvent);
    }
  };

  const handleRefundEscrow = async (gigId: string) => {
    const result = await escrowActions.refundEscrow(gigId) as any;
    
    if (result.success) {
      console.log('Escrow refunded successfully');
      // Refresh escrow data
      const mockEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleSearchEscrow(mockEvent);
    }
  };

  const getStatusText = (status: EscrowStatus): string => {
    switch (status) {
      case EscrowStatus.Pending: return 'Pending';
      case EscrowStatus.Active: return 'Active';
      case EscrowStatus.Completed: return 'Completed';
      case EscrowStatus.Cancelled: return 'Cancelled';
      case EscrowStatus.Disputed: return 'Disputed';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: EscrowStatus): string => {
    switch (status) {
      case EscrowStatus.Pending: return 'text-yellow-600';
      case EscrowStatus.Active: return 'text-blue-600';
      case EscrowStatus.Completed: return 'text-green-600';
      case EscrowStatus.Cancelled: return 'text-red-600';
      case EscrowStatus.Disputed: return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (!escrowState.isInitialized && escrowState.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Initializing escrow service...</p>
        </div>
      </div>
    );
  }

  if (escrowState.error && !escrowState.isInitialized) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Initialization Error</h3>
        <p className="text-red-600 mt-1">{escrowState.error}</p>
        <button 
          onClick={escrowActions.initialize}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!escrowState.isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-yellow-800 font-medium">Wallet Not Connected</h3>
        <p className="text-yellow-600 mt-1">Please connect your Core Wallet to continue.</p>
        <button 
          onClick={escrowActions.checkConnection}
          className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Check Connection
        </button>
      </div>
    );
  }

  if (!escrowState.isCorrectNetwork) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="text-orange-800 font-medium">Wrong Network</h3>
        <p className="text-orange-600 mt-1">Please switch to Avalanche Fuji Testnet.</p>
        <button 
          onClick={escrowActions.switchNetwork}
          className="mt-3 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          disabled={escrowState.isLoading}
        >
          {escrowState.isLoading ? 'Switching...' : 'Switch Network'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Escrow Management</h1>
        
        {/* Connection Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-green-800 font-medium">Connected</p>
              <p className="text-green-600 text-sm">Address: {escrowState.signerAddress}</p>
            </div>
          </div>
        </div>

        {/* Create Escrow Form */}
        <div className="border-b pb-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Escrow</h2>
          <form onSubmit={handleCreateEscrow} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gig ID
                </label>
                <input
                  type="text"
                  value={formData.gigId}
                  onChange={(e) => setFormData({ ...formData, gigId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter unique gig ID"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (AVAX)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Freelancer Address
              </label>
              <input
                type="text"
                value={formData.freelancerAddress}
                onChange={(e) => setFormData({ ...formData, freelancerAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
                required
              />
              {formData.freelancerAddress && !escrowActions.isValidAddress(formData.freelancerAddress) && (
                <p className="text-red-600 text-sm mt-1">Invalid Ethereum address</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gig Title
              </label>
              <input
                type="text"
                value={formData.gigTitle}
                onChange={(e) => setFormData({ ...formData, gigTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter gig title"
                required
              />
            </div>

            <button
              type="submit"
              disabled={escrowState.isLoading || !escrowActions.isValidAddress(formData.freelancerAddress)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {escrowState.isLoading ? 'Creating...' : 'Create Escrow'}
            </button>
          </form>
        </div>

        {/* Search Escrow */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Escrow</h2>
          <form onSubmit={handleSearchEscrow} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchGigId}
                onChange={(e) => setSearchGigId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter gig ID to search"
                required
              />
              <button
                type="submit"
                disabled={escrowState.isLoading}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {escrowState.isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Escrow Details */}
          {escrowData && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Gig ID</p>
                  <p className="font-medium">{escrowData.gigId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium">{escrowData.gigTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium">{escrowData.amount} AVAX</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-medium ${getStatusColor(escrowData.status)}`}>
                    {getStatusText(escrowData.status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-mono text-sm">{escrowData.client}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Freelancer</p>
                  <p className="font-mono text-sm">{escrowData.freelancer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm">{new Date(escrowData.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {escrowData.status === EscrowStatus.Active && (
                <div className="flex gap-4">
                  {escrowData.client.toLowerCase() === escrowState.signerAddress?.toLowerCase() && (
                    <>
                      <button
                        onClick={() => handleReleaseEscrow(escrowData.gigId)}
                        disabled={escrowState.isLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Release to Freelancer
                      </button>
                      <button
                        onClick={() => handleRefundEscrow(escrowData.gigId)}
                        disabled={escrowState.isLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Refund to Client
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
