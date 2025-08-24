import React from 'react';
import { NetworkDiagnosticsPanel } from '../components/debug/NetworkDiagnosticsPanel';

/**
 * Dedicated page for network debugging
 * Accessible at /debug/network for troubleshooting API issues
 */
export const NetworkDebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Network Diagnostics</h1>
          <p className="mt-2 text-gray-600">
            Debug API connectivity issues and verify backend server status
          </p>
        </div>
        
        <NetworkDiagnosticsPanel />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            For additional support, check the browser console for detailed logs
          </p>
        </div>
      </div>
    </div>
  );
};
