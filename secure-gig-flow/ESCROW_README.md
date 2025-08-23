# Escrow System with DAO Dispute Resolution

A production-grade escrow system built on Avalanche C-Chain with decentralized dispute resolution through DAO voting.

## 🏗️ Architecture Overview

### Smart Contracts
- **Escrow.sol**: Main escrow contract handling fund deposits, work approval, and dispute management
- **EscrowDAO.sol**: DAO contract for dispute voting with token-weighted governance
- **DAOToken.sol**: ERC20Votes governance token for DAO participation

### Frontend Components
- **EscrowPage.tsx**: Main dashboard with client, freelancer, and DAO views
- **EscrowCard.tsx**: Individual escrow display with role-based actions
- **VoteCard.tsx**: DAO voting interface for disputed escrows
- **CreateEscrowModal.tsx**: Form for creating new escrow contracts

### Web3 Hooks
- **useEscrow.ts**: Contract interaction for escrow operations
- **useDAO.ts**: DAO voting and governance functionality

## 🚀 Features

### Core Escrow Features
- ✅ Secure fund locking with deadline-based milestones
- ✅ Client work approval and automatic fund release
- ✅ Dispute raising by either party
- ✅ Emergency refund mechanism for contract owner
- ✅ Platform fee system with configurable rates

### DAO Governance
- ✅ Token-weighted voting on disputes
- ✅ 3-day voting period with quorum requirements
- ✅ Automatic fund release based on vote outcomes
- ✅ Fallback to client if quorum not met

### Security Features
- ✅ OpenZeppelin ReentrancyGuard protection
- ✅ Pausable contracts for emergency stops
- ✅ Access control with owner privileges
- ✅ Event emission for frontend synchronization

### UI/UX Features
- ✅ Responsive design with shadcn/ui components
- ✅ Real-time progress tracking and deadline monitoring
- ✅ Toast notifications for all actions
- ✅ Role-based views (Client/Freelancer/DAO)
- ✅ Mock data for development and testing

## 📁 Project Structure

```
secure-gig-flow/
├── contracts/                    # Smart contracts
│   ├── contracts/
│   │   ├── Escrow.sol           # Main escrow contract
│   │   ├── EscrowDAO.sol        # DAO voting contract
│   │   └── DAOToken.sol         # Governance token
│   ├── scripts/deploy.js        # Deployment script
│   ├── test/                    # Contract tests
│   └── hardhat.config.ts        # Hardhat configuration
├── src/
│   ├── components/escrow/       # Escrow UI components
│   ├── hooks/                   # Web3 hooks
│   ├── pages/EscrowPage.tsx     # Main escrow interface
│   └── data/mockEscrows.ts      # Development mock data
└── .env.example                 # Environment variables template
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Core Wallet or MetaMask
- Avalanche Fuji testnet AVAX

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Smart contract dependencies
cd contracts
npm install
cd ..
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
VITE_AVALANCHE_NETWORK=fuji
VITE_ESCROW_CONTRACT_ADDRESS=<deployed_address>
VITE_ESCROW_DAO_ADDRESS=<deployed_address>
VITE_DAO_TOKEN_ADDRESS=<deployed_address>
```

### 3. Smart Contract Deployment

```bash
cd contracts

# Copy contract environment template
cp .env.example .env

# Add your deployment private key and RPC URL
PRIVATE_KEY=your_private_key_here
AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=your_api_key_here

# Deploy contracts to Fuji testnet
npm run deploy:fuji

# Verify contracts (optional)
npm run verify:fuji
```

### 4. Update Frontend Configuration

After deployment, update your frontend `.env` file with the deployed contract addresses from the deployment output.

### 5. Start Development Server

```bash
npm run dev
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npm test
```

### Test Coverage
- ✅ Escrow creation and fund locking
- ✅ Work approval and fund release
- ✅ Dispute raising and resolution
- ✅ DAO voting mechanics
- ✅ Emergency functions and edge cases

## 📖 Usage Guide

### For Clients
1. **Create Escrow**: Set freelancer address, amount, deadline, and description
2. **Monitor Progress**: Track work completion and deadline status
3. **Approve Work**: Release funds when satisfied with deliverables
4. **Raise Dispute**: Escalate to DAO if work is unsatisfactory

### For Freelancers
1. **View Assignments**: See all escrows where you're the freelancer
2. **Track Deadlines**: Monitor project timelines and requirements
3. **Raise Dispute**: Contest unfair client decisions through DAO

### For DAO Token Holders
1. **Vote on Disputes**: Use tokens to vote for freelancer or client
2. **Earn Governance**: Participate in protocol decision-making
3. **Monitor Outcomes**: Track voting results and fund distributions

## 🔧 Configuration

### Smart Contract Parameters
- **Voting Period**: 3 days (259,200 seconds)
- **Minimum Voting Tokens**: 100 DAO tokens
- **Platform Fee**: 2.5% (configurable, max 10%)
- **Quorum Requirement**: Dynamic based on total supply

### Frontend Features
- **Mock Data**: Enabled for development without deployed contracts
- **Wallet Integration**: Supports Core Wallet and MetaMask
- **Network Switching**: Automatic Avalanche network detection
- **Error Handling**: Comprehensive toast notifications

## 🚀 Deployment to Production

### 1. Deploy to Avalanche Mainnet
```bash
cd contracts
npm run deploy:mainnet
```

### 2. Update Environment Variables
```bash
VITE_AVALANCHE_NETWORK=mainnet
# Update contract addresses with mainnet deployments
```

### 3. Disable Mock Data
Remove mock data imports and enable real contract interactions in `useEscrow.ts` and `useDAO.ts`.

## 🔒 Security Considerations

### Smart Contract Security
- **Audited Dependencies**: Uses OpenZeppelin battle-tested contracts
- **Reentrancy Protection**: Guards against reentrancy attacks
- **Access Control**: Proper permission management
- **Emergency Stops**: Pausable functionality for critical issues

### Frontend Security
- **Input Validation**: Comprehensive form validation
- **Address Verification**: Ethereum address format checking
- **Amount Limits**: Maximum escrow amount restrictions
- **Deadline Validation**: Minimum 24-hour deadline requirement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check existing GitHub issues
2. Review smart contract documentation
3. Test on Fuji testnet before mainnet deployment

---

**Built with ❤️ for the decentralized freelance economy**
