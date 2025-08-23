# Avalanche Freelance API

A production-ready Express API for a decentralized freelance marketplace with escrow functionality on Avalanche C-Chain (Fuji testnet).

## Features

- **Smart Contract Integration**: Interact with escrow contracts on Avalanche C-Chain
- **Gas Optimization**: EIP-1559 fee suggestions for optimal transaction costs
- **Glacier Integration**: Real-time balance and transaction data via AvaCloud Data API
- **MongoDB Storage**: Persistent storage for jobs, users, escrows, and disputes
- **Meta-transactions**: Optional gasless transactions via relayer
- **Production Ready**: Comprehensive error handling, logging, and validation

## Tech Stack

- **Runtime**: Node.js 18+, TypeScript
- **Framework**: Express.js with security middleware (helmet, cors)
- **Blockchain**: ethers.js v6 for Avalanche C-Chain interaction
- **Database**: MongoDB with Mongoose ODM
- **Data API**: AvaCloud Glacier for indexed blockchain data
- **Validation**: Zod for request/response validation
- **Logging**: Pino structured logging
- **Testing**: Jest with supertest

## Quick Start

### 1. Environment Setup

Copy `.env` and configure your settings:

```bash
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/ava-freelance
AVAX_CHAIN_ID=43113
AVAX_RPC_HTTP=https://api.avax-test.network/ext/bc/C/rpc
AVAX_RPC_WS=wss://api.avax-test.network/ext/bc/C/ws
ESCROW_ADDRESS=0xYourEscrowOnFuji
RELAYER_PK=  # Optional for meta-transactions
GLACIER_API_KEY=your_avacloud_key
GLACIER_BASE=https://glacier-api.avax.network
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Chain Information
- `GET /api/chain/gas` - Get EIP-1559 gas fee suggestions
- `GET /api/chain/info` - Get chain information and current block

### Wallet Operations
- `GET /api/wallet/:address/balances` - Get native and ERC-20 balances
- `GET /api/wallet/:address/activity` - Get transaction history
- `GET /api/wallet/:address/tokens/:tokenAddress` - Get specific token balance

### Escrow Operations
- `POST /api/escrow/quote/deposit` - Get deposit transaction calldata and gas estimate
- `POST /api/escrow/quote/release` - Get release transaction calldata and gas estimate
- `POST /api/escrow/quote/dispute` - Get dispute transaction calldata and gas estimate
- `GET /api/escrow/job/:jobId` - Get job state from smart contract

### Meta-transactions (Optional)
- `POST /api/escrow/relay/deposit` - Server-signed deposit transaction
- `POST /api/escrow/relay/release` - Server-signed release transaction
- `POST /api/escrow/relay/dispute` - Server-signed dispute transaction

### Transaction Tracking
- `GET /api/tx/:hash` - Get transaction details with enriched data
- `GET /api/tx/:hash/status` - Get transaction confirmation status
- `POST /api/tx/:hash/wait` - Wait for transaction confirmation

## Usage Examples

### Get Gas Prices
```bash
curl http://localhost:4000/api/chain/gas
```

### Check Wallet Balance
```bash
curl http://localhost:4000/api/wallet/0xYourAddress/balances
```

### Get Deposit Transaction Data
```bash
curl -X POST http://localhost:4000/api/escrow/quote/deposit \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "0xClientAddress",
    "jobId": 1,
    "token": "0xUSDCAddress",
    "amount": "1000000",
    "decimals": 6
  }'
```

### Check Transaction Status
```bash
curl http://localhost:4000/api/tx/0xTransactionHash/status
```

## Smart Contract Integration

The API expects an escrow smart contract with these functions:

```solidity
function job(uint256 jobId) view returns (address client, address freelancer, address token, uint256 amount, uint8 state);
function deposit(uint256 jobId, address token, uint256 amount) payable;
function release(uint256 jobId);
function raiseDispute(uint256 jobId, string reason);
```

## Database Models

- **User**: Freelancer/client profiles with reputation and earnings
- **Job**: Job postings with escrow details and status tracking
- **Escrow**: Smart contract state synchronization
- **Dispute**: Dispute management and resolution tracking

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Deployment Considerations

1. **Environment Variables**: Ensure all required env vars are set in production
2. **Database**: Use MongoDB Atlas or similar managed service
3. **Logging**: Configure structured logging for monitoring
4. **Rate Limiting**: Add rate limiting middleware for production
5. **HTTPS**: Use HTTPS in production with proper certificates
6. **Monitoring**: Set up health checks and monitoring

## Security Notes

- Never store private keys in code or logs
- Use RELAYER_PK only for intended meta-transaction flows
- Validate all user inputs with Zod schemas
- Implement proper authentication for sensitive operations
- Use helmet.js security headers

## Avalanche Integration

This API leverages:
- **Fuji Testnet**: Chain ID 43113 for development
- **JSON-RPC**: Standard Ethereum-compatible RPC calls
- **AvaCloud Glacier**: Indexed data API for balances and transactions
- **EIP-1559**: Dynamic fee pricing for optimal gas costs

## Support

For issues related to:
- **Avalanche**: [Avalanche Builder Hub](https://docs.avax.network/)
- **AvaCloud**: [AvaCloud Documentation](https://developers.avacloud.io/)
- **API Issues**: Check logs and error responses for debugging

## License

MIT
