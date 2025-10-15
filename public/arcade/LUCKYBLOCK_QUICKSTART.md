# 🚀 Lucky Block - Quick Start Guide

Get Lucky Block up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MetaMask wallet with Base network
- Some ETH on Base for testing

## Step 1: Deploy Smart Contract

```bash
# Navigate to chain directory
cd chain

# Install dependencies (if not done)
npm install

# Deploy to Base testnet (Sepolia)
npx hardhat run scripts/deployLuckyBlock.ts --network base-sepolia

# Or deploy to Base mainnet
npx hardhat run scripts/deployLuckyBlock.ts --network base
```

**Save the deployed contract address!**

## Step 2: Update Frontend

Open `public/arcade/luckyblock.html` and update line ~30:

```javascript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS_HERE';
```

Replace with your deployed contract address.

## Step 3: Configure Network

The game is pre-configured for Base network:
- Chain ID: 8453 (0x2105)
- RPC: https://mainnet.base.org
- Currency: ETH

For testnet, update the configuration in luckyblock.html.

## Step 4: Test Locally

```bash
# Start a local web server
python -m http.server 8000
# or
npx serve
```

Open: http://localhost:8000/public/arcade/luckyblock.html

## Step 5: Connect Wallet

1. Click "Connect Wallet"
2. Approve Terms of Service
3. Select MetaMask
4. Approve network switch to Base
5. Done! You're ready to play

## Quick Test

### Test Entry
1. Make sure you have ETH on Base
2. Click "ENTER JACKPOT"
3. Approve transaction in MetaMask
4. Wait for confirmation
5. You'll see yourself in the players list

### Test Full Round
Need 2+ players for a round to complete. Options:
- Use multiple wallets
- Wait for other players
- Set up a test environment with friends

## Configuration Options

### Change Entry Fee (Contract Owner Only)

```javascript
// In your deployment script or console
await luckyBlock.setEntryFee(ethers.parseEther("0.001")); // 0.001 ETH (default)
await luckyBlock.setEntryFee(ethers.parseEther("0.01")); // 0.01 ETH
await luckyBlock.setEntryFee(ethers.parseEther("0.1")); // 0.1 ETH
```

### Adjust Round Duration

Edit `LuckyBlock.sol` line 12:
```solidity
uint256 public constant ROUND_DURATION = 120; // seconds
```

Then redeploy.

### Change Max Players

Edit `LuckyBlock.sol` line 11:
```solidity
uint256 public constant MAX_PLAYERS = 20;
```

Then redeploy.

## Testing Checklist

- [ ] Contract deployed successfully
- [ ] Address updated in HTML
- [ ] Wallet connects properly
- [ ] Network switches to Base
- [ ] Can enter round
- [ ] See yourself in players list
- [ ] Pot amount updates
- [ ] Timer counts down
- [ ] Chat works
- [ ] Affiliate link generated
- [ ] Stats display correctly

## Common Issues

### ❌ "Please install MetaMask"
**Solution**: Install MetaMask extension

### ❌ "Incorrect entry fee"
**Solution**: Check you're sending exact entry fee amount

### ❌ "Round not open"
**Solution**: Wait for new round to start (2 min after previous ends)

### ❌ "Already entered"
**Solution**: Wait for current round to end before entering again

### ❌ Transaction fails
**Solution**: 
- Check gas balance
- Verify network is Base
- Check contract is deployed correctly

### ❌ Chat not working
**Solution**: Connect wallet to enable chat

### ❌ Stats show 0
**Solution**: 
- Make sure wallet is connected
- Check contract address is correct
- Verify you've played at least one round

## Advanced Setup

### Multiple Pot Sizes

You can deploy multiple instances with different entry fees:

```bash
# Deploy 0.01 ETH pot
npx hardhat run scripts/deployLuckyBlock.ts --network base

# Deploy 0.1 ETH pot (after modifying setEntryFee)
npx hardhat run scripts/deployLuckyBlock.ts --network base

# Deploy 1 ETH pot
npx hardhat run scripts/deployLuckyBlock.ts --network base
```

Create separate HTML files for each pot size.

### Custom Branding

Edit colors in `luckyblock.html` CSS variables:
```css
:root {
    --base-blue: #0052ff;      /* Your brand color */
    --neon-cyan: #00ffff;      /* Accent color */
    --gold: #ffd700;           /* Highlight color */
}
```

### Analytics Integration

Add Google Analytics or Plausible:
```html
<!-- Add before closing </head> tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

## Production Deployment

### 1. Verify Contract on Basescan

```bash
npx hardhat verify --network base CONTRACT_ADDRESS
```

### 2. Deploy to Production

Upload to:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **IPFS**: `ipfs add -r public/`

### 3. Configure Domain

Point your domain to the deployment.

### 4. Enable HTTPS

Ensure SSL/TLS certificate is active.

### 5. Set Up Monitoring

- Monitor contract events
- Track player activity
- Monitor pot sizes
- Alert on errors

## Security Checklist (Production)

- [ ] Contract verified on Basescan
- [ ] Security audit completed (recommended)
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization verified
- [ ] Terms of Service displayed
- [ ] Age verification implemented
- [ ] Responsible gaming links added

## Support

Need help? Check:
- Full README: `LUCKYBLOCK_README.md`
- Contract code: `chain/contracts/LuckyBlock.sol`
- Frontend code: `public/arcade/luckyblock.html`

## Next Steps

1. ✅ Deploy and test locally
2. ✅ Test with friends
3. ✅ Verify contract
4. ✅ Deploy to production
5. ✅ Market your game!

---

**Ready to go live?** Make sure to:
- Fund the house wallet for initial liquidity
- Set up monitoring
- Prepare support channels
- Announce to community

Good luck! 🎰💎

