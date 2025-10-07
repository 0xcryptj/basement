# ⚡ Quick Start - The Basement Arcade

Get up and running in 5 minutes!

## 🚀 Fast Track

```bash
# 1. Install dependencies
cd chain
npm install

# 2. Create .env file
cp ../env.example .env
# Edit .env and add your PRIVATE_KEY (without 0x)

# 3. Compile contract
npm run compile

# 4. Deploy to testnet
npm run deploy:sepolia

# 5. Go back and start server
cd ..
npm run dev

# 6. Open arcade
# Visit: http://localhost:8000/arcade/arcade.html
```

## 🎮 Test the Game

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Create Game** - Choose stake (0.01 ETH) and Heads/Tails
3. **Join Game** - Use another wallet to join
4. **Reveal** - Both players reveal choices
5. **Win!** - Winner gets the pot automatically

## 📋 Prerequisites

- Node.js v18+
- Crypto wallet (MetaMask)
- Base Sepolia ETH ([Get from faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

## 🔑 Environment Variables

Required in `.env`:
```bash
PRIVATE_KEY=your_private_key_without_0x
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASESCAN_API_KEY=your_api_key_optional
```

## 📚 Need More Help?

- **Full Setup:** See `SETUP_GUIDE.md`
- **Technical Docs:** See `ARCADE_README.md`
- **Deployment:** See `DEPLOYMENT_CHECKLIST.md`
- **Overview:** See `PROJECT_SUMMARY.md`

## 🎯 What You Get

✅ Retro cyberpunk arcade UI
✅ PvP Coin Toss game
✅ Web3 wallet integration
✅ Smart contract on Base
✅ Commit-reveal fairness
✅ 5% house fee system

## 🐛 Common Issues

**Contract address is 0x000...?**
→ Deploy first: `cd chain && npm run deploy:sepolia`

**Wallet won't connect?**
→ Add Base Sepolia network to your wallet

**Transaction fails?**
→ Get testnet ETH from faucet first

## 🎉 That's It!

You now have a fully functional Web3 arcade!

**Next:** Deploy to mainnet when ready (`npm run deploy:base`)

---

Happy gaming! 🎮
