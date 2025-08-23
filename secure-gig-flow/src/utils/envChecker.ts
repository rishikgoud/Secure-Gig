// Environment variable checker for debugging
export const checkEnvironmentVariables = () => {
    console.log('=== Environment Variables Debug ===');
    console.log('VITE_AVALANCHE_RPC:', import.meta.env.VITE_AVALANCHE_RPC);
    console.log('VITE_CHAIN_ID:', import.meta.env.VITE_CHAIN_ID);
    console.log('VITE_NETWORK_NAME:', import.meta.env.VITE_NETWORK_NAME);
    console.log('VITE_CURRENCY_NAME:', import.meta.env.VITE_CURRENCY_NAME);
    console.log('VITE_CURRENCY_SYMBOL:', import.meta.env.VITE_CURRENCY_SYMBOL);
    console.log('VITE_CURRENCY_DECIMALS:', import.meta.env.VITE_CURRENCY_DECIMALS);
    console.log('VITE_BLOCK_EXPLORER:', import.meta.env.VITE_BLOCK_EXPLORER);
    console.log('=== End Environment Variables ===');
  };
  
  export const getAvalancheFujiConfig = () => {
    return {
      chainId: import.meta.env.VITE_CHAIN_ID || '0xa869',
      chainName: import.meta.env.VITE_NETWORK_NAME || 'Avalanche Fuji Testnet',
      nativeCurrency: {
        name: import.meta.env.VITE_CURRENCY_NAME || 'Avalanche',
        symbol: import.meta.env.VITE_CURRENCY_SYMBOL || 'AVAX',
        decimals: parseInt(import.meta.env.VITE_CURRENCY_DECIMALS || '18'),
      },
      rpcUrls: [import.meta.env.VITE_AVALANCHE_RPC || 'https://rpc.ankr.com/avalanche_fuji'],
      blockExplorerUrls: [import.meta.env.VITE_BLOCK_EXPLORER || 'https://testnet.snowtrace.io/'],
    };
  };
  