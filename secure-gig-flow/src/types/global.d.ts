interface Window {
    ethereum?: {
      isMetaMask?: true;
      request: (...args: any[]) => Promise<any>;
    };
  }
  