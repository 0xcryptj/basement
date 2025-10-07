# 🎮 The Basement Arcade - Setup Guide

Quick start guide to get The Basement Arcade up and running!

## ⚡ Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Crypto Wallet** (MetaMask, Coinbase Wallet, etc.)
- **ETH on Base** (for mainnet) or **Base Sepolia ETH** (for testnet)

## 🚀 Installation Steps

### Step 1: Clone Repository (Already Done!)

```bash
# You've already cloned the repo
cd basement
```

### Step 2: Install Chain Dependencies

```bash
cd chain
npm install
```

Expected packages:
- `hardhat` - Ethereum development environment
- `@nomicfoundation/hardhat-toolbox` - Hardhat plugins bundle
- `@openzeppelin/contracts` - Secure smart contract library
- `dotenv` - Environment variable management
- `typescript` - TypeScript support

### Step 3: Configure Environment Variables

```bash
# Copy the example file
cp ../env.example .env

# Edit .env file with your actual values
```

**Required values in `.env`:**

```bash
# Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_RPC=https://mainnet.base.org

# Export from your wallet (MetaMask -> Account Details -> Export Private Key)
# ⚠️ NEVER share this or commit it to git!
PRIVATE_KEY=your_private_key_without_0x

# Get from: https://basescan.org/myapikey
BASESCAN_API_KEY=your_basescan_api_key
```

### Step 4: Compile Contracts

```bash
# Still in chain/ directory
npm run compile
```

This creates the artifacts and ABI files needed for the frontend.

### Step 5: Deploy Contract

**Option A: Deploy to Testnet (Recommended First)**

```bash
npm run deploy:sepolia
```

**Option B: Deploy to Mainnet**

```bash
npm run deploy:base
```

After deployment, you'll see:
```
✅ CoinToss deployed to: 0x...
📝 Deployment info saved to deployment.json
📝 ABI saved to abi/CoinToss.json
📝 Updated arcade.js with contract address
```

### Step 6: Start the Arcade

```bash
# Go back to basement directory
cd ..

# Start development server
npm run dev
```

Server runs at: **http://localhost:8000**

### Step 7: Open the Arcade

Open your browser and navigate to:

**http://localhost:8000/arcade/arcade.html**

## 🎮 Using the Arcade

### Connect Your Wallet

1. Click **"Connect Wallet"** in the top right
2. Approve the connection in your wallet
3. Make sure you're on **Base Sepolia** (testnet) or **Base Mainnet**

### Play Coin Toss

**Create a Game:**
1. Click **"Play Now"** on the Coin Toss tile
2. Enter stake amount (e.g., 0.01 ETH)
3. Choose **Heads** or **Tails**
4. Click **"Create Game"**
5. Approve the transaction (stake + 5% fee + gas)

**Join a Game:**
1. Click **"Join Game"** tab
2. Find an open game
3. Click **"Join Game"**
4. Choose your guess (**Heads** or **Tails**)
5. Confirm and approve transaction

**Reveal Your Choice:**
1. Go to **"My Games"** tab
2. Find the game that needs revealing
3. Click **"🎲 Reveal Choice"**
4. Approve transaction
5. Wait for opponent to reveal
6. Winner automatically receives the pot!

## 🔍 Verifying Your Contract

After deployment, verify on Basescan:

```bash
cd chain
npx hardhat verify --network base <CONTRACT_ADDRESS> 1800
```

Replace `<CONTRACT_ADDRESS>` with your deployed address from `deployment.json`.

## 🧪 Testing

### Run Contract Tests (Optional)

```bash
cd chain
npm test
```

### Test Locally

You can deploy to a local Hardhat network for testing:

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy to local network
npm run deploy:local

# Then update arcade.js to point to localhost:8545
```

## 📊 Monitoring

### View Your Games

- **"My Games"** tab shows all games you've created or joined
- Auto-refreshes every 10 seconds
- Shows game status: Open, Filled, Revealing, Settled

### Check Transactions

- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Base Mainnet Explorer**: https://basescan.org

Search your wallet address or contract address to see all transactions.

## 🛠️ Troubleshooting

### Problem: Contract address is 0x000...

**Solution:** Deploy the contract first
```bash
cd chain
npm run deploy:sepolia
```

### Problem: Wallet won't connect

**Solutions:**
- Refresh the page
- Make sure wallet extension is installed and unlocked
- Check you're on the correct network (Base Sepolia or Base)
- Clear browser cache

### Problem: Transaction fails

**Solutions:**
- Check you have enough ETH for stake + 5% fee + gas
- Verify you're on the correct network
- Increase gas limit in wallet
- Wait a minute and try again

### Problem: Can't reveal

**Solutions:**
- Make sure you're using the same browser/device
- Check localStorage isn't cleared
- Verify you're within 30-minute reveal window
- Check you haven't already revealed

### Problem: "Module not found" errors

**Solution:** Install dependencies
```bash
cd chain
npm install
```

### Problem: Hardhat compile errors

**Solutions:**
- Delete cache and artifacts:
  ```bash
  npm run clean
  npm run compile
  ```
- Reinstall dependencies:
  ```bash
  rm -rf node_modules
  npm install
  ```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `arcade/index.html` | Main arcade UI |
| `arcade/arcade.css` | Styling |
| `arcade/arcade.js` | Web3 game logic |
| `chain/contracts/CoinToss.sol` | Smart contract |
| `chain/hardhat.config.ts` | Network configuration |
| `chain/scripts/deploy.ts` | Deployment script |
| `abi/CoinToss.json` | Contract ABI (auto-generated) |
| `deployment.json` | Deployment info (auto-generated) |
| `.env` | Private configuration (DON'T COMMIT!) |

## 🔐 Security Best Practices

1. **NEVER commit `.env` file** - It contains your private key!
2. **Use testnet first** - Test everything on Sepolia before mainnet
3. **Keep private key safe** - Store securely, never share
4. **Start with small amounts** - Test with minimal ETH first
5. **Verify contract** - Always verify on Basescan after deployment

## 🌐 Network Details

### Base Sepolia (Testnet)
- **Chain ID:** 84532
- **RPC:** https://sepolia.base.org
- **Explorer:** https://sepolia.basescan.org
- **Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Currency:** Sepolia ETH (free from faucet)

### Base Mainnet
- **Chain ID:** 8453
- **RPC:** https://mainnet.base.org
- **Explorer:** https://basescan.org
- **Currency:** Real ETH (costs money!)

## 📱 Add Base to Your Wallet

**Base Mainnet:**
- Network Name: Base
- RPC URL: https://mainnet.base.org
- Chain ID: 8453
- Currency Symbol: ETH
- Block Explorer: https://basescan.org

**Base Sepolia:**
- Network Name: Base Sepolia
- RPC URL: https://sepolia.base.org
- Chain ID: 84532
- Currency Symbol: ETH
- Block Explorer: https://sepolia.basescan.org

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Deploy to testnet
4. ✅ Test the game
5. ⬜ Deploy to mainnet (when ready)
6. ⬜ Verify contract
7. ⬜ Share with friends!

## 💡 Tips

- **Always test on Sepolia first** - It's free and safe
- **Small stakes** - Start with 0.001-0.01 ETH for testing
- **Save your seed phrase** - Back up your wallet securely
- **Watch gas prices** - Deploy during low network activity
- **Read console logs** - Check browser console for debug info

## 🤝 Need Help?

- Check the browser console (F12) for errors
- Review transaction on Basescan
- Check that contract is deployed correctly
- Verify you have sufficient ETH balance
- Ensure wallet is connected to correct network

## 🎉 Success Checklist

- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Contract compiled
- [ ] Contract deployed
- [ ] Wallet connected
- [ ] Game created successfully
- [ ] Game joined successfully
- [ ] Both players revealed
- [ ] Winner received payout

## 📚 Additional Resources

- **Hardhat Docs:** https://hardhat.org/docs
- **Base Docs:** https://docs.base.org
- **Ethers.js Docs:** https://docs.ethers.org
- **OpenZeppelin Docs:** https://docs.openzeppelin.com
- **Basescan:** https://basescan.org

---

Ready to play? Follow the steps above and let's get gaming! 🎮

Questions? Check ARCADE_README.md for detailed technical documentation.

