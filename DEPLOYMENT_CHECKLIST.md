# 🚀 Deployment Checklist

Use this checklist to ensure smooth deployment of The Basement Arcade.

## 📋 Pre-Deployment

### Environment Setup
- [ ] Node.js v18+ installed
- [ ] Git installed and configured
- [ ] Wallet (MetaMask/Coinbase Wallet) installed
- [ ] Base Sepolia added to wallet
- [ ] Test ETH obtained from faucet

### Repository Setup
- [ ] Repository cloned
- [ ] Chain dependencies installed (`cd chain && npm install`)
- [ ] `.env` file created from `env.example`
- [ ] Private key added to `.env` (without 0x prefix)
- [ ] RPC URLs configured in `.env`
- [ ] Basescan API key added to `.env`

### Contract Preparation
- [ ] Contract compiled successfully (`npm run compile`)
- [ ] No compilation errors
- [ ] ABI generated in artifacts
- [ ] Review contract parameters (REVEAL_WINDOW = 1800s)
- [ ] House address verified in contract

## 🧪 Testnet Deployment (Base Sepolia)

### Deploy
- [ ] Sufficient Sepolia ETH in wallet (>0.01 ETH)
- [ ] Run `npm run deploy:sepolia`
- [ ] Deployment successful
- [ ] Contract address saved to `deployment.json`
- [ ] ABI copied to `../abi/CoinToss.json`
- [ ] `arcade.js` updated with contract address

### Verify
- [ ] Contract verified on Basescan Sepolia
- [ ] Run: `npx hardhat verify --network baseSepolia <ADDRESS> 1800`
- [ ] Verification successful
- [ ] Contract source visible on explorer

### Test Frontend
- [ ] Dev server running (`npm run dev`)
- [ ] Arcade page loads at http://localhost:8000/arcade/
- [ ] Wallet connects successfully
- [ ] Network switched to Base Sepolia
- [ ] Contract address not 0x000...

### Test Game Flow
- [ ] Create game transaction succeeds
- [ ] Game appears in "My Games"
- [ ] Game appears in "Join Game" list (from different wallet)
- [ ] Join game transaction succeeds
- [ ] Both players can reveal
- [ ] Reveal transactions succeed
- [ ] Winner receives payout automatically
- [ ] Event logs show correct data

### Test Edge Cases
- [ ] Cannot join own game
- [ ] Cannot join with wrong stake amount
- [ ] Cannot reveal with wrong data
- [ ] Cannot reveal after deadline
- [ ] Timeout cancellation works
- [ ] UI handles errors gracefully

## 🌐 Mainnet Deployment (Base)

### Pre-Mainnet Checks
- [ ] All testnet tests passed
- [ ] Contract audited (if handling significant value)
- [ ] House address confirmed
- [ ] Fee percentage confirmed (5%)
- [ ] Reveal window confirmed (30 min)
- [ ] No hardcoded test values
- [ ] All console.logs reviewed

### Mainnet Deploy
- [ ] Sufficient ETH on Base Mainnet (>0.05 ETH recommended)
- [ ] Double-check `.env` has mainnet RPC
- [ ] Backup private key securely
- [ ] Run `npm run deploy:base`
- [ ] Save contract address securely
- [ ] Deployment transaction confirmed

### Mainnet Verify
- [ ] Contract verified on Basescan
- [ ] Run: `npx hardhat verify --network base <ADDRESS> 1800`
- [ ] Source code matches deployment
- [ ] Contract readable on Basescan

### Production Testing
- [ ] Frontend connects to mainnet contract
- [ ] Wallet connects to Base Mainnet
- [ ] Create small test game (0.001 ETH)
- [ ] Join from second wallet
- [ ] Both reveal successfully
- [ ] Winner receives correct payout
- [ ] House receives correct fees

## 📱 Frontend Deployment

### Hosting Options
- [ ] Choose hosting platform (Vercel, Netlify, GitHub Pages, etc.)
- [ ] Configure build settings
- [ ] Set environment variables (if needed)
- [ ] Deploy frontend
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

### Post-Deploy Checks
- [ ] Site loads correctly
- [ ] All assets load (images, fonts, scripts)
- [ ] Wallet connection works
- [ ] Contract interactions work
- [ ] Mobile responsive
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

## 🔐 Security

### Contract Security
- [ ] ReentrancyGuard implemented
- [ ] Ownable access control
- [ ] Input validation on all functions
- [ ] No unchecked external calls
- [ ] Proper event emissions
- [ ] Consider audit for high-value deployments

### Frontend Security
- [ ] No private keys in code
- [ ] No sensitive data in localStorage (only salts)
- [ ] HTTPS enabled
- [ ] Content Security Policy configured
- [ ] XSS protection enabled

### Operational Security
- [ ] `.env` never committed to git
- [ ] `.gitignore` properly configured
- [ ] Private keys stored securely
- [ ] Backup seed phrases
- [ ] Multi-sig for house wallet (recommended)

## 📊 Monitoring

### Contract Monitoring
- [ ] Basescan alerts configured
- [ ] Watch house address for fee collection
- [ ] Monitor gas usage
- [ ] Track game creation rate
- [ ] Monitor settlement success rate

### Frontend Monitoring
- [ ] Analytics configured (optional)
- [ ] Error tracking (Sentry, etc.)
- [ ] Uptime monitoring
- [ ] Performance monitoring

## 📣 Launch

### Pre-Launch
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Support channels ready
- [ ] Social media prepared
- [ ] Marketing materials ready

### Launch Day
- [ ] Announce on social media
- [ ] Share contract address
- [ ] Share arcade URL
- [ ] Monitor for issues
- [ ] Respond to user feedback

### Post-Launch
- [ ] Monitor first games
- [ ] Check for any bugs
- [ ] Gather user feedback
- [ ] Plan improvements
- [ ] Consider additional games

## 🐛 Rollback Plan

### If Issues Found
- [ ] Document the issue
- [ ] Pause new game creation (if critical)
- [ ] Allow existing games to complete
- [ ] Fix and redeploy if needed
- [ ] Communicate with users

### Emergency Contacts
- [ ] House wallet owner
- [ ] Development team
- [ ] Community managers

## 📈 Success Metrics

### Track These Metrics
- [ ] Total games created
- [ ] Total games completed
- [ ] Total volume (ETH)
- [ ] Unique players
- [ ] Average game size
- [ ] House fees collected
- [ ] User retention

## ✅ Final Checklist

- [ ] Contract deployed and verified
- [ ] Frontend deployed and accessible
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Support ready
- [ ] Launch announced

## 🎉 You're Live!

Congratulations! The Basement Arcade is now live on Base!

### Next Steps
1. Monitor the first few games closely
2. Gather user feedback
3. Plan additional games
4. Build the community
5. Iterate and improve

---

**Remember:** Start with testnet, test thoroughly, then move to mainnet!

Good luck! 🎮🚀
