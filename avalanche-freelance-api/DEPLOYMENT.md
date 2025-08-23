# Deployment Guide

## Prerequisites

1. **Node.js 18+** installed
2. **MongoDB** running (local or Atlas)
3. **Avalanche Fuji Testnet** access
4. **AvaCloud API Key** from [developers.avacloud.io](https://developers.avacloud.io)
5. **Escrow Smart Contract** deployed on Fuji

## Environment Configuration

Update `.env` with your actual values:

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/ava-freelance
AVAX_CHAIN_ID=43113
AVAX_RPC_HTTP=https://api.avax-test.network/ext/bc/C/rpc
AVAX_RPC_WS=wss://api.avax-test.network/ext/bc/C/ws
ESCROW_ADDRESS=0xYourActualEscrowContract
RELAYER_PK=your_private_key_for_meta_tx  # Optional
GLACIER_API_KEY=your_actual_avacloud_key
GLACIER_BASE=https://glacier-api.avax.network
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start

# Run tests
npm test
```

## API Testing

Once running, test these endpoints:

```bash
# Health check
curl http://localhost:4000/api/health

# Chain info
curl http://localhost:4000/api/chain/info

# Gas prices
curl http://localhost:4000/api/chain/gas

# Wallet balance (replace with actual address)
curl http://localhost:4000/api/wallet/0x742d35Cc6634C0532925a3b8D4C4c0c8c5C4C4c/balances

# Deposit quote
curl -X POST http://localhost:4000/api/escrow/quote/deposit \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "0x742d35Cc6634C0532925a3b8D4C4c0c8c5C4C4c",
    "jobId": 1,
    "token": "0x5425890298aed601595a70AB815c96711a31Bc65",
    "amount": "1000000",
    "decimals": 6
  }'
```

## Production Deployment

1. **Environment**: Set `NODE_ENV=production`
2. **Database**: Use MongoDB Atlas or managed service
3. **Process Manager**: Use PM2 or similar
4. **Reverse Proxy**: Configure nginx/Apache
5. **SSL**: Enable HTTPS with proper certificates
6. **Monitoring**: Set up logging and health checks

## Smart Contract Requirements

Your escrow contract must implement:

```solidity
interface IEscrow {
    function job(uint256 jobId) external view returns (
        address client,
        address freelancer, 
        address token,
        uint256 amount,
        uint8 state
    );
    
    function deposit(uint256 jobId, address token, uint256 amount) external payable;
    function release(uint256 jobId) external;
    function raiseDispute(uint256 jobId, string memory reason) external;
    
    event Deposited(uint256 indexed jobId, address client, address token, uint256 amount);
    event Released(uint256 indexed jobId, address freelancer, uint256 amount);
    event Disputed(uint256 indexed jobId, address opener);
}
```

## Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running
- Check connection string format
- Verify network access for Atlas

**Avalanche RPC Issues:**
- Verify Fuji RPC endpoints are accessible
- Check if rate limits are exceeded
- Ensure chain ID matches (43113)

**Glacier API Issues:**
- Verify API key is valid
- Check rate limits and plan restrictions
- Ensure proper headers are sent

**Gas Estimation Failures:**
- Check if contract address is correct
- Verify contract is deployed and accessible
- Ensure sufficient balance for gas estimation
