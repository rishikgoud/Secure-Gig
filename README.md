# Avalanche Freelance Platform

A decentralized freelance marketplace built on Avalanche C-Chain with React frontend and Express.js backend.

## 🏗️ Architecture

### Backend (Express.js + TypeScript)
- **Location**: `avalanche-freelance-api/`
- **Tech Stack**: Node.js 18+, TypeScript, Express.js, MongoDB, ethers.js v6
- **Features**: Smart contract integration, wallet balance tracking, transaction monitoring, escrow functionality

### Frontend (React + TypeScript)
- **Location**: `secure-gig-flow/`
- **Tech Stack**: React 18, TypeScript, TailwindCSS, shadcn/ui, TanStack Query
- **Features**: Wallet connection, blockchain data display, transaction sending, real-time status tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally
- Avalanche Core Wallet or MetaMask installed

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd avalanche-freelance-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```env
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/avalanche-freelance
   AVAX_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
   AVAX_CHAIN_ID=43113
   GLACIER_API_URL=https://glacier-api.avax.network
   GLACIER_API_KEY=your_glacier_api_key
   ESCROW_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D2C7C1e8d8b8C8C8
   RELAYER_PRIVATE_KEY=your_relayer_private_key_optional
   ```

4. **Start the backend server**:
   ```bash
   npm run dev
   ```
   
   Server will start on http://localhost:4000

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd secure-gig-flow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env`:
   ```env
   VITE_API_URL=http://localhost:4000
   VITE_AVALANCHE_NETWORK=fuji
   VITE_SNOWTRACE_URL=https://testnet.snowtrace.io
   ```

4. **Start the frontend**:
   ```bash
   npm run dev
   ```
   
   Frontend will start on http://localhost:5173

## 🔗 API Endpoints

### Chain Information
- `GET /api/health` - Health check
- `GET /api/chain/info` - Network information (chainId, name, blockNumber)
- `GET /api/chain/gas` - Gas price suggestions (slow/standard/fast)

### Wallet Operations
- `GET /api/wallet/:address/balances` - Native and ERC20 token balances
- `GET /api/wallet/:address/activity` - Transaction history
- `GET /api/wallet/:address/tokens/:tokenAddress` - Specific token balance

### Transaction Tracking
- `GET /api/tx/:hash` - Transaction details
- `GET /api/tx/:hash/status` - Transaction status (pending/confirmed/failed)
- `POST /api/tx/:hash/wait` - Wait for transaction confirmation

### Escrow Operations
- `POST /api/escrow/quote/deposit` - Get deposit transaction data
- `POST /api/escrow/quote/release` - Get release transaction data
- `POST /api/escrow/quote/dispute` - Get dispute transaction data
- `GET /api/escrow/job/:jobId` - Get job state from contract

## 🎯 Key Features

### Wallet Integration
- **Avalanche Core Wallet** support via browser extension
- **Network detection** and auto-switching to Fuji testnet
- **Balance display** in real-time AVAX amounts
- **Transaction sending** with status tracking

### Blockchain Data
- **Real-time chain info** (block number, network status)
- **Gas price monitoring** with slow/standard/fast options
- **Transaction history** from Glacier API
- **Smart contract interaction** for escrow operations

### User Experience
- **Loading states** and error handling throughout
- **Toast notifications** for transaction updates
- **Responsive design** with TailwindCSS
- **Dark/light mode** support
- **Explorer links** to Snowtrace for transactions

## 🧪 Testing the Integration

### 1. Connect Wallet
- Visit http://localhost:5173
- Navigate to Client or Freelancer Dashboard
- Click "Connect Wallet" in the Blockchain Integration section
- Approve connection in your wallet

### 2. View Blockchain Data
- Check the "Blockchain Status" card for:
  - API connection status
  - Current block number
  - Real-time gas prices
  - Network information

### 3. Send Test Transaction
- Use the "Send Test Transaction" card
- Enter a recipient address (or use the default)
- Set amount (default 0.001 AVAX)
- Click "Send Transaction"
- Monitor status updates in real-time
- Click explorer link to view on Snowtrace

### 4. API Testing
Test backend endpoints directly:
```bash
# Health check
curl http://localhost:4000/api/health

# Chain info
curl http://localhost:4000/api/chain/info

# Gas prices
curl http://localhost:4000/api/chain/gas

# Wallet balance (replace with actual address)
curl http://localhost:4000/api/wallet/0x742d35Cc6634C0532925a3b8D2C7C1e8d8b8C8C8/balances
```

## 📁 Project Structure

```
avalanche-freelance-api/
├── src/
│   ├── api/           # API client and types
│   ├── components/    # React components
│   │   └── wallet/    # Wallet-specific components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   └── lib/           # Utilities
├── .env               # Environment variables
└── package.json

secure-gig-flow/
├── src/
│   ├── config/        # Configuration files
│   ├── contracts/     # Smart contract ABIs
│   ├── db/            # Database models
│   ├── routes/        # Express routes
│   ├── services/      # Business logic
│   └── utils/         # Utilities
├── .env               # Environment variables
└── package.json
```

## 🔧 Development

### Backend Development
```bash
cd avalanche-freelance-api
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Development
```bash
cd secure-gig-flow
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
```

## 🚨 Troubleshooting

### Backend Issues
- **Port 4000 in use**: Change `PORT` in `.env`
- **MongoDB connection**: Ensure MongoDB is running locally
- **Path-to-regexp error**: Use the fixed server with dynamic imports

### Frontend Issues
- **Wallet not connecting**: Ensure Core Wallet or MetaMask is installed
- **Network errors**: Check if backend is running on correct port
- **Transaction failures**: Ensure sufficient AVAX balance and correct network

### Common Solutions
1. **Clear browser cache** and reload
2. **Reset wallet connection** and reconnect
3. **Check console logs** for detailed error messages
4. **Verify environment variables** are set correctly

## 🌐 Network Configuration

### Avalanche Fuji Testnet
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io
- **Faucet**: https://faucet.avax.network

### Avalanche Mainnet
- **Chain ID**: 43114
- **RPC URL**: https://api.avax.network/ext/bc/C/rpc
- **Explorer**: https://snowtrace.io

## 📚 Additional Resources

- [Avalanche Documentation](https://docs.avax.network/)
- [Core Wallet Guide](https://support.avax.network/en/articles/6115608-core-extension-how-to-add-the-avalanche-network)
- [Glacier API Docs](https://glacier-api.avax.network/docs)
- [ethers.js Documentation](https://docs.ethers.org/v6/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
