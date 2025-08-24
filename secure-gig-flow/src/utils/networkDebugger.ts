/**
 * Production-level network debugging utility
 * Helps diagnose and resolve API connection issues
 */

export interface NetworkDiagnostic {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export class NetworkDebugger {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:4000') {
    this.baseURL = baseURL;
  }

  /**
   * Run comprehensive network diagnostics
   */
  async runDiagnostics(): Promise<NetworkDiagnostic[]> {
    const diagnostics: NetworkDiagnostic[] = [];

    // Test 1: Basic connectivity
    diagnostics.push(await this.testBasicConnectivity());

    // Test 2: CORS preflight
    diagnostics.push(await this.testCORSPreflight());

    // Test 3: Health endpoint
    diagnostics.push(await this.testHealthEndpoint());

    // Test 4: Auth endpoints
    diagnostics.push(await this.testAuthEndpoints());

    // Test 5: Environment variables
    diagnostics.push(this.testEnvironmentVariables());

    return diagnostics;
  }

  private async testBasicConnectivity(): Promise<NetworkDiagnostic> {
    try {
      const response = await fetch(this.baseURL, { 
        method: 'GET',
        mode: 'no-cors'
      });
      
      return {
        test: 'Basic Connectivity',
        status: 'pass',
        message: 'Server is reachable',
        details: { status: response.status }
      };
    } catch (error: any) {
      return {
        test: 'Basic Connectivity',
        status: 'fail',
        message: 'Cannot reach server',
        details: { 
          error: error.message,
          suggestion: 'Ensure backend server is running on http://localhost:4000'
        }
      };
    }
  }

  private async testCORSPreflight(): Promise<NetworkDiagnostic> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/signup`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:8081',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
      };

      if (corsHeaders['Access-Control-Allow-Origin'] && corsHeaders['Access-Control-Allow-Credentials']) {
        return {
          test: 'CORS Preflight',
          status: 'pass',
          message: 'CORS is properly configured',
          details: corsHeaders
        };
      } else {
        return {
          test: 'CORS Preflight',
          status: 'fail',
          message: 'CORS configuration issues detected',
          details: { 
            corsHeaders,
            suggestion: 'Check backend CORS configuration for credentials and origin'
          }
        };
      }
    } catch (error: any) {
      return {
        test: 'CORS Preflight',
        status: 'fail',
        message: 'CORS preflight failed',
        details: { error: error.message }
      };
    }
  }

  private async testHealthEndpoint(): Promise<NetworkDiagnostic> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          test: 'Health Endpoint',
          status: 'pass',
          message: 'Health endpoint responding',
          details: data
        };
      } else {
        return {
          test: 'Health Endpoint',
          status: 'warning',
          message: `Health endpoint returned ${response.status}`,
          details: { status: response.status, statusText: response.statusText }
        };
      }
    } catch (error: any) {
      return {
        test: 'Health Endpoint',
        status: 'fail',
        message: 'Health endpoint not accessible',
        details: { error: error.message }
      };
    }
  }

  private async testAuthEndpoints(): Promise<NetworkDiagnostic> {
    try {
      // Test signup endpoint with invalid data to check if it's accessible
      const response = await fetch(`${this.baseURL}/api/auth/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        credentials: 'include',
        body: JSON.stringify({}) // Empty body should trigger validation error
      });

      if (response.status === 400) {
        return {
          test: 'Auth Endpoints',
          status: 'pass',
          message: 'Auth endpoints are accessible (validation working)',
          details: { status: response.status }
        };
      } else if (response.status === 404) {
        return {
          test: 'Auth Endpoints',
          status: 'fail',
          message: 'Auth endpoints not found',
          details: { 
            status: response.status,
            suggestion: 'Check if auth routes are properly registered in server.ts'
          }
        };
      } else {
        return {
          test: 'Auth Endpoints',
          status: 'warning',
          message: `Unexpected response from auth endpoint: ${response.status}`,
          details: { status: response.status, statusText: response.statusText }
        };
      }
    } catch (error: any) {
      return {
        test: 'Auth Endpoints',
        status: 'fail',
        message: 'Cannot access auth endpoints',
        details: { error: error.message }
      };
    }
  }

  private testEnvironmentVariables(): NetworkDiagnostic {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      return {
        test: 'Environment Variables',
        status: 'warning',
        message: 'VITE_API_URL not set, using default',
        details: { 
          current: 'http://localhost:4000 (default)',
          suggestion: 'Set VITE_API_URL in .env file'
        }
      };
    } else if (apiUrl !== this.baseURL) {
      return {
        test: 'Environment Variables',
        status: 'warning',
        message: 'API URL mismatch',
        details: { 
          expected: this.baseURL,
          actual: apiUrl,
          suggestion: 'Ensure VITE_API_URL matches backend server URL'
        }
      };
    } else {
      return {
        test: 'Environment Variables',
        status: 'pass',
        message: 'Environment variables properly configured',
        details: { VITE_API_URL: apiUrl }
      };
    }
  }

  /**
   * Generate diagnostic report
   */
  generateReport(diagnostics: NetworkDiagnostic[]): string {
    let report = '🔍 Network Diagnostics Report\n';
    report += '================================\n\n';

    diagnostics.forEach((diagnostic, index) => {
      const icon = diagnostic.status === 'pass' ? '✅' : 
                   diagnostic.status === 'warning' ? '⚠️' : '❌';
      
      report += `${index + 1}. ${icon} ${diagnostic.test}\n`;
      report += `   Status: ${diagnostic.status.toUpperCase()}\n`;
      report += `   Message: ${diagnostic.message}\n`;
      
      if (diagnostic.details) {
        report += `   Details: ${JSON.stringify(diagnostic.details, null, 2)}\n`;
      }
      report += '\n';
    });

    // Add recommendations
    const failedTests = diagnostics.filter(d => d.status === 'fail');
    if (failedTests.length > 0) {
      report += '🔧 Recommended Actions:\n';
      report += '========================\n';
      
      if (failedTests.some(t => t.test === 'Basic Connectivity')) {
        report += '1. Start the backend server: npm run dev (in avalanche-freelance-api folder)\n';
      }
      
      if (failedTests.some(t => t.test === 'CORS Preflight')) {
        report += '2. Check CORS configuration in server.ts\n';
      }
      
      if (failedTests.some(t => t.test === 'Auth Endpoints')) {
        report += '3. Verify auth routes are registered in server.ts\n';
      }
      
      report += '4. Ensure MongoDB is running and connected\n';
      report += '5. Check for any console errors in browser developer tools\n';
    }

    return report;
  }
}

// Export singleton instance
export const networkDebugger = new NetworkDebugger();
