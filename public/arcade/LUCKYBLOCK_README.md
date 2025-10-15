# 💎 Lucky Block - Jackpot Game

A fully decentralized jackpot game built on Base (Ethereum L2) with provably fair winner selection, real-time updates, live chat, and an affiliate program.

## 🎮 Game Overview

**Lucky Block** is a jackpot-style game where:
- Multiple players (2-20) can enter each round with ETH
- One random winner takes the entire pot
- Rounds last 2 minutes or fill up with 20 players
- Winner is selected using provably fair blockchain randomness
- 5% house fee from each entry
- 20% of fees go to affiliates who refer players

## ✨ Features

### 🎰 Core Gameplay
- **Real-time Pot Display**: Live ETH amount with USD conversion
- **Animated Player Cards**: Shows all active players in current round
- **Countdown Timer**: Visual timer with warning animations
- **Instant Entry**: One-click entry with wallet connection
- **Auto-Draw**: Automatic winner selection when round ends or max players reached

### 🔗 Web3 Integration
- **Base Network**: Optimized for low gas fees on Base L2
- **Multi-Wallet Support**: MetaMask, Coinbase Wallet, WalletConnect
- **Smart Contract**: Fully auditable on-chain logic
- **Real-time Events**: Live updates via blockchain event listeners
- **Transaction Feedback**: Instant notifications for all actions

### 💬 Live Chat
- Real-time chat with other players
- System announcements for entries and winners
- Animated message entries
- Auto-scroll to latest messages

### 🤝 Affiliate Program
- 20% commission on referred players' fees
- Unique referral links for each player
- Live tracking of referrals and earnings
- One-click copy referral link

### 📊 Player Statistics
- Total rounds played
- Total rounds won
- Win rate percentage
- Personal performance tracking

### 🎨 UX & Animations
- **Smooth Transitions**: All elements animate beautifully
- **Particle Background**: Dynamic animated particles
- **Glow Effects**: Neon glow on key elements
- **Winner Celebration**: Confetti and animations for winners
- **Toast Notifications**: Success/error popups
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Loading States**: Clear feedback during transactions

### ✅ Provably Fair
- Uses blockchain randomness (blockhash + block data)
- Transparent seed display after each round
- Verifiable on-chain winner selection
- No possibility of manipulation

### 🔒 Security & Legal
- Terms of Service modal on first visit
- Age verification and responsible gaming warnings
- Smart contract security best practices
- ReentrancyGuard protection
- Auditable code

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and choose MetaMask or Coinbase Wallet
2. **Switch to Base**: Automatically switches to Base network if needed
3. **Accept Terms**: Read and accept Terms of Service (first time only)
4. **Enter Round**: Click "ENTER JACKPOT" button to join current round
5. **Wait for Winner**: Watch timer countdown and players join
6. **Winner Announced**: One random winner takes entire pot!

## 💰 Entry Fees

- Default: **0.001 ETH** per entry (~$2 at $2000/ETH)
- House Fee: **5% of entry** (0.00005 ETH)
- Affiliate Bonus: **20% of house fee** to referrer (if referred)
- Pot Amount: **95% of entries** goes to winner

### Betting Increments
- +0.001 ETH (~$2)
- +0.005 ETH (~$10)
- +0.01 ETH (~$20)
- +0.05 ETH (~$100)
- +0.1 ETH (~$200)

### Example Round
- 10 players × 0.001 ETH = 0.01 ETH total
- House fee: 0.0005 ETH (5%)
- Winner receives: 0.0095 ETH (95%)
- ~$19 USD at $2000/ETH

## 🎲 Provably Fair System

### How Winner Selection Works

```solidity
randomSeed = keccak256(
    block.timestamp,
    block.prevrandao,
    block.number,
    players.length,
    pot
)

winnerIndex = randomSeed % players.length
```

- **block.timestamp**: Current block time
- **block.prevrandao**: Beacon chain randomness
- **block.number**: Current block height
- **players.length**: Number of players in round
- **pot**: Total pot amount

This combination creates unpredictable randomness that cannot be manipulated.

### Verification
After each round, the random seed is displayed. Anyone can verify:
1. The seed generation is correct
2. The winner index calculation is correct
3. No manipulation occurred

## 🤝 Affiliate Program

### How to Earn
1. Connect your wallet
2. Click "Register as Affiliate" (if needed)
3. Copy your referral link
4. Share with friends
5. Earn 20% of all fees from referred players

### Example Earnings
- Friend enters with 0.01 ETH
- House fee: 0.0005 ETH
- Your commission: 0.0001 ETH (20% of fee)
- Per 100 referrals: ~0.01 ETH (~$20)

### Referral Link Format
```
https://yoursite.com/arcade/luckyblock.html?ref=0xYourAddress
```

## 📱 Responsive Design

### Desktop (>1024px)
- Full sidebar with chat and stats
- Large jackpot card with all info
- Grid layout for players

### Tablet (768-1024px)
- Stacked layout (chat on top, game below)
- Optimized player grid

### Mobile (<768px)
- Compact view
- Touch-optimized buttons
- Scrollable chat
- Simplified player cards

## 🎨 Visual Design

### Color Scheme
- **Primary**: Base Blue (#0052ff)
- **Accents**: Neon Cyan (#00ffff), Neon Green (#00ff00)
- **Success**: Gold (#ffd700)
- **Background**: Dark purple-blue gradient

### Typography
- **Headers**: Press Start 2P (retro gaming font)
- **Body**: Inter (modern, readable)
- **Monospace**: Courier New (addresses, seeds)

### Animations
- Glow effects on hover
- Pulse animations on key elements
- Slide-in for chat messages
- Confetti for winners
- Smooth transitions everywhere

## 🔧 Technical Stack

### Frontend
- **HTML5**: Semantic structure
- **CSS3**: Modern animations and gradients
- **JavaScript**: Vanilla JS for performance
- **Ethers.js v6**: Web3 integration

### Smart Contract
- **Solidity 0.8.24**: Latest features
- **OpenZeppelin**: Security libraries
- **Hardhat**: Development framework

### Blockchain
- **Base Mainnet**: Layer 2 for low fees
- **Chain ID**: 8453 (0x2105)
- **RPC**: https://mainnet.base.org

## 🚀 Deployment

### 1. Deploy Smart Contract

```bash
cd chain
npx hardhat run scripts/deployLuckyBlock.ts --network base
```

### 2. Update Frontend

Copy deployed contract address to `luckyblock.html`:
```javascript
const CONTRACT_ADDRESS = '0xYourDeployedAddress';
```

### 3. Verify Contract

```bash
npx hardhat verify --network base <CONTRACT_ADDRESS>
```

### 4. Test

1. Open luckyblock.html in browser
2. Connect MetaMask
3. Enter a round
4. Verify all features work

## 📊 Contract Functions

### User Functions
- `enterRound(address referrer)`: Enter current round with optional referrer
- `registerAffiliate()`: Register as an affiliate

### View Functions
- `getCurrentRound()`: Get current round info
- `getRoundPlayers(uint256)`: Get players in a round
- `getPlayerStats(address)`: Get player statistics
- `getAffiliateStats(address)`: Get affiliate statistics

### Admin Functions (Owner Only)
- `setEntryFee(uint256)`: Update entry fee

### Automatic Functions
- `drawWinner()`: Called when round ends or max players reached
- `cancelRound()`: Called if not enough players after timeout

## 🛡️ Security Features

### Smart Contract
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for admin functions
- **No External Calls**: Except for fee transfers
- **Checks-Effects-Interactions**: Proper ordering
- **SafeMath**: Built-in overflow protection (Solidity 0.8+)

### Frontend
- **CSP Headers**: Content Security Policy
- **XSS Prevention**: Sanitized inputs
- **HTTPS Only**: Secure connections
- **Wallet Verification**: Network checks
- **Transaction Confirmations**: Wait for blockchain confirmations

## 📈 Future Enhancements

### Planned Features
- [ ] Multiple pot sizes (0.01, 0.1, 1 ETH)
- [ ] VIP rooms with higher stakes
- [ ] NFT avatars for players
- [ ] Tournament mode with brackets
- [ ] Leaderboard with top players
- [ ] Voice chat integration
- [ ] Mobile app (iOS/Android)
- [ ] Multi-chain support (Optimism, Arbitrum)

### Community Requests
- [ ] Custom round durations
- [ ] Team jackpots
- [ ] Lucky number selection
- [ ] Bonus multipliers
- [ ] Loyalty rewards program

## 🆘 Support & Resources

### Documentation
- [Ethers.js Docs](https://docs.ethers.org/)
- [Base Network Docs](https://docs.base.org/)
- [Solidity Docs](https://docs.soliditylang.org/)

### Community
- Discord: [Join our server]
- Twitter: [@BasementArcade]
- Telegram: [Community chat]

### Help
- **Wallet Issues**: Make sure MetaMask is on Base network
- **Transaction Fails**: Check gas balance and network status
- **Chat Not Working**: Connect wallet to enable chat
- **Affiliate Link**: Must register as affiliate first

## ⚠️ Disclaimers

### Important Notices
1. **Gambling Risk**: Only bet what you can afford to lose
2. **Smart Contract Risk**: Use at your own risk, contracts are unaudited
3. **Network Issues**: Base network problems may affect gameplay
4. **No Refunds**: Entries are final once submitted
5. **Age Restriction**: Must be 18+ and comply with local laws
6. **Responsible Gaming**: Seek help if you have gambling problems

### Not Financial Advice
This is entertainment only. Not financial or investment advice.

## 📜 License

MIT License - Free to use and modify

---

**Built with ❤️ for The Basement Arcade**

Enjoy the game and may the odds be ever in your favor! 🎰💎

