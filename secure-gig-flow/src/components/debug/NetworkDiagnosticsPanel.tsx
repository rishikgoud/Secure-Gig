import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { networkDebugger, NetworkDiagnostic } from '../../utils/networkDebugger';

/**
 * Network diagnostics panel for debugging API connection issues
 * Production-level debugging tool for developers and support
 */
export const NetworkDiagnosticsPanel: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostic[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = await networkDebugger.runDiagnostics();
      setDiagnostics(results);
      
      // Also log to console for detailed debugging
      const report = networkDebugger.generateReport(results);
      console.log(report);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'pass' ? 'default' : 
                   status === 'warning' ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Network Diagnostics
        </CardTitle>
        <CardDescription>
          Debug API connection issues and verify backend connectivity
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Running Diagnostics...
            </div>
          ) : (
            'Run Network Diagnostics'
          )}
        </Button>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Diagnostic Results</h3>
            
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostic.status)}
                    <span className="font-medium">{diagnostic.test}</span>
                    {getStatusBadge(diagnostic.status)}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {diagnostic.message}
                </p>
                
                {diagnostic.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                      {JSON.stringify(diagnostic.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}

            {/* Quick Actions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Quick Actions</h4>
              <div className="space-y-2 text-sm text-blue-800">
                {diagnostics.some(d => d.status === 'fail' && d.test === 'Basic Connectivity') && (
                  <p>• Start backend server: <code className="bg-blue-100 px-1 rounded">npm run dev</code> in avalanche-freelance-api folder</p>
                )}
                {diagnostics.some(d => d.status === 'fail' && d.test === 'CORS Preflight') && (
                  <p>• Check CORS configuration in server.ts</p>
                )}
                {diagnostics.some(d => d.status === 'fail' && d.test === 'Auth Endpoints') && (
                  <p>• Verify auth routes are registered in server.ts</p>
                )}
                <p>• Check browser console for detailed error logs</p>
                <p>• Ensure MongoDB is running and connected</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
