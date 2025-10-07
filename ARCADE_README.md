# 🎮 The Basement Arcade - Coin Toss Game

A retro cyberpunk Web3 arcade featuring PvP games on Base Network. Currently featuring the **Coin Toss** game with more coming soon!

## 🎯 Features

- **PvP Coin Toss**: Commit-reveal scheme for fair gameplay
- **Base Network**: Built on Base (Layer 2 Ethereum)
- **Web3 Wallet**: Connect via Base SDK
- **Retro Cyberpunk UI**: Neon glows, glassmorphism, pixel aesthetics
- **5% House Fee**: From each player's stake

## 📁 Project Structure

```
basement/
├── arcade/
│   ├── index.html          # Main arcade page
│   ├── arcade.css          # Retro cyberpunk styling
│   └── arcade.js           # Web3 game logic
├── chain/
│   ├── contracts/
│   │   └── CoinToss.sol    # Smart contract
│   ├── scripts/
│   │   └── deploy.ts       # Deployment script
│   ├── hardhat.config.ts   # Hardhat configuration
│   └── package.json        # Chain dependencies
├── abi/
│   └── CoinToss.json       # Contract ABI (generated)
├── assets/
│   └── bk3.png             # Background image
└── env.example             # Environment variables template
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install chain dependencies
cd chain
npm install
```

### 2. Configure Environment

```bash
# Copy and configure environment variables
cp env.example .env

# Edit .env with your values:
# - PRIVATE_KEY: Your wallet private key (without 0x)
# - BASE_RPC: Base network RPC URL
# - BASESCAN_API_KEY: For contract verification
```

### 3. Deploy Contract

```bash
# Deploy to Base Sepolia (testnet)
cd chain
npm run deploy:sepolia

# Deploy to Base Mainnet (production)
npm run deploy:base
```

The deployment script will:
- Deploy the CoinToss contract
- Save contract address to `deployment.json`
- Generate ABI to `abi/CoinToss.json`
- Update `arcade/arcade.js` with contract address

### 4. Start Development Server

```bash
# Return to basement directory
cd ..

# Start the dev server
npm run dev
```

Open http://localhost:8000/arcade/arcade.html in your browser.

### 5. Verify Contract (Optional)

```bash
cd chain
npx hardhat verify --network base <CONTRACT_ADDRESS> 1800
```

## 🎮 How to Play Coin Toss

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Create Game**:
   - Enter stake amount (ETH)
   - Choose Heads or Tails
   - Click "Create Game"
3. **Join Game**:
   - Browse open games
   - Choose your guess
   - Click "Join Game"
4. **Reveal**:
   - Both players must reveal their choices
   - Winner takes the pot automatically
5. **Winner Takes All**: After both reveals, winner receives total pot (minus 5% fee from each player)

## 🔧 Smart Contract Details

### CoinToss.sol

- **Commit-Reveal Scheme**: Prevents front-running
- **Equal Stakes**: Both players stake same amount
- **5% Fee**: Deducted from each player's stake
- **30-min Reveal Window**: Players have 30 minutes to reveal
- **Fair Settlement**: XOR logic determines winner based on choices

### Game Flow

1. Player 1 creates game with commitment
2. Player 2 joins with equal stake and commitment
3. Both players reveal their choices (Heads=0, Tails=1)
4. Winner determined: XOR(p1Choice, p2Choice)
   - Same choice (0^0 or 1^1) = 0 → Player 1 wins
   - Different (0^1 or 1^0) = 1 → Player 2 wins
5. Winner receives entire pot

### Key Functions

```solidity
// Create a new game
function createGame(bytes32 commit) external payable returns (uint256 id)

// Join existing game
function joinGame(uint256 id, bytes32 commit) external payable

// Reveal your choice
function reveal(uint256 id, uint8 choice, bytes32 salt) external

// Calculate required amount with fee
function requiredWithFee(uint256 stake) public pure returns (uint256)
```

## 🎨 UI/UX Features

- **Neon Base Blue** (#0052ff99)
- **Glassmorphism** panels with backdrop blur
- **Pixel Borders** and retro fonts (Press Start 2P)
- **Hover Glows** on interactive elements
- **Responsive Design** for mobile and desktop
- **Real-time Updates** via contract events
- **Local Storage** for game state persistence

## 🔐 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Commit-Reveal**: Prevents front-running
- **Ownable**: Contract ownership control
- **Input Validation**: All inputs validated
- **Timeout Handling**: Games can be cancelled after deadline

## 📊 Contract Events

```solidity
event GameCreated(uint256 indexed id, address indexed creator, uint256 stake)
event GameJoined(uint256 indexed id, address indexed joiner)
event Revealed(uint256 indexed id, address indexed player, uint8 choice)
event Settled(uint256 indexed id, address indexed winner, uint256 payout, uint256 houseCut)
```

## 🛠️ Development Commands

```bash
# Compile contracts
cd chain
npm run compile

# Run tests
npm test

# Clean build artifacts
npm run clean

# Deploy to local network
npm run deploy:local

# Deploy to testnet
npm run deploy:sepolia

# Deploy to mainnet
npm run deploy:base
```

## 🌐 Network Information

### Base Mainnet
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org

### Base Sepolia (Testnet)
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 🎯 Future Games

The arcade is designed to support multiple games:
- 🎲 **Dice Duel** (Coming Soon)
- 🃏 **Card Wars** (Coming Soon)
- 🎰 **Slot Machine** (Coming Soon)
- 🎯 **Target Master** (Coming Soon)
- 🏁 **Race Track** (Coming Soon)

## 🔒 House Address

House fee address (hardcoded): `0x5Da407f983e0f11B3f7F67Acd64877b42B22068D`

5% of each player's stake is sent to this address upon game creation/joining.

## 📝 Notes

- Game state is stored on-chain
- Reveals are stored in localStorage (per device)
- If you lose localStorage, you can't reveal (but funds are safe via timeout mechanism)
- Always test on Sepolia testnet first!

## 🐛 Troubleshooting

**Wallet won't connect?**
- Make sure you have the Base network added to your wallet
- Refresh the page and try again

**Contract address shows 0x000...?**
- Deploy the contract first using `npm run deploy:sepolia` or `npm run deploy:base`
- The contract address will be automatically updated in arcade.js

**Transaction fails?**
- Check you have enough ETH for stake + 5% fee + gas
- Ensure you're on the correct network

**Can't reveal?**
- Check you're using the same device/browser you used to create/join
- Make sure you're within the 30-minute reveal window

## 📄 License

MIT

## 🤝 Contributing

This is an active development project. Feel free to open issues or submit PRs!

---

Built with ❤️ on Base Network 🔵

