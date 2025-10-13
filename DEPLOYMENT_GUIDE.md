# 🚀 Deployment Guide - The Basement

## Overview
Complete deployment guide for The Basement platform with token-gated features on Base network.

---

## 📋 Pre-Deployment Checklist

### Environment Variables Required
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Base Network (Optional for frontend)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASEMENT_TOKEN=0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23

# Vercel (Auto-configured)
VERCEL_URL=auto
VERCEL_ENV=production
```

### Database Setup
✅ Supabase tables created
✅ RLS policies enabled
✅ Storage buckets configured
✅ Seed data loaded (optional)

### Token Configuration
✅ Contract address: `0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23`
✅ Network: Base Mainnet (Chain ID: 8453)
✅ Minimum balance: 0.001 tokens
✅ Token-gating active on all endpoints

---

## 🎯 Deployment Steps

### 1. Verify All Tests Pass
```bash
cd basement

# Check linter
npm run lint

# Build project
npm run build
```

### 2. Deploy Smart Contracts (Optional)
If you want to deploy the unified arcade contract:

```bash
cd chain

# Install dependencies
npm install

# Configure Hardhat for Base
# Edit hardhat.config.ts with your private key

# Deploy
npx hardhat run scripts/deployArcade.ts --network base

# Verify on BaseScan
npx hardhat verify --network base DEPLOYED_ADDRESS 0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from basement directory)
cd basement
vercel

# Follow prompts:
# - Link to existing project or create new
# - Select scope (your account/team)
# - Confirm settings

# Deploy to production
vercel --prod
```

#### Option B: GitHub Integration
1. **Push to GitHub:**
```bash
git add .
git commit -m "feat: implement token-gating and mobile fixes"
git push origin main
```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure:
     - Framework: Next.js
     - Root Directory: `basement`
     - Build Command: `npm run build`
     - Install Command: `npm install`
   - Add environment variables
   - Deploy

### 4. Configure Environment Variables in Vercel

Navigate to: `Project Settings > Environment Variables`

Add these variables:
```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
SUPABASE_SERVICE_ROLE_KEY = your_service_key
NEXT_PUBLIC_BASE_RPC_URL = https://mainnet.base.org
NEXT_PUBLIC_BASEMENT_TOKEN = 0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23
```

### 5. Verify Deployment

✅ **Homepage:** Check main landing page loads
✅ **Arcade:** Test mobile responsiveness
✅ **Tokenomics:** Verify charts embed properly
✅ **IRC:** Test message posting (token-gated)
✅ **Forum:** Test thread creation (token-gated)
✅ **Token Check:** Connect wallet and verify balance check

---

## 🔍 Post-Deployment Testing

### Token-Gating Tests

1. **Non-Holder Test:**
   ```
   - Connect wallet without tokens
   - Try to create channel → Should fail with error
   - Try to post message → Should fail
   - Try to create thread → Should fail
   - Error should show balance and buy links
   ```

2. **Token Holder Test:**
   ```
   - Connect wallet with ≥0.001 tokens
   - Create IRC channel → Should succeed
   - Post messages → Should succeed
   - Create forum thread → Should succeed
   - Create forum post → Should succeed
   ```

3. **API Tests:**
   ```bash
   # Test token balance API
   curl https://your-domain.vercel.app/api/token/balance?address=0xYourAddress
   
   # Should return balance and permissions
   ```

### Mobile Testing

Test on various devices:
- iPhone (375px, 414px)
- Android (360px, 412px)
- iPad (768px, 1024px)

Check:
- ✅ Arcade games scale properly
- ✅ Connect 4 grid is playable
- ✅ All buttons are touch-friendly (44px min)
- ✅ No horizontal scrolling
- ✅ Text is readable
- ✅ Modals fit screen

---

## 📊 Monitoring & Analytics

### Vercel Dashboard
- Check deployment logs
- Monitor function execution
- Review analytics
- Check errors in real-time

### Database Monitoring
- Watch Supabase dashboard
- Monitor API usage
- Check RLS policy effectiveness
- Review query performance

### Token Integration
- Monitor token holder growth
- Track token-gated attempts
- Analyze conversion rate (non-holder → holder)
- Review arcade game usage

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables Not Working
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

### Token-Gating Not Working
- Verify Base RPC is accessible
- Check contract address is correct
- Ensure token ABI matches
- Test RPC connection manually

### Mobile Issues
- Clear browser cache
- Test in incognito mode
- Check viewport meta tags
- Verify CSS is loading

---

## 🎮 Smart Contract Deployment (Advanced)

If deploying the unified arcade contract:

### Setup Hardhat Config
```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY!,
    },
  },
};

export default config;
```

### Deploy Script
```bash
cd basement/chain
npx hardhat run scripts/deployArcade.ts --network base
```

### Verify on BaseScan
```bash
npx hardhat verify --network base CONTRACT_ADDRESS 0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23
```

---

## 📝 Post-Deployment Updates

### Update Frontend Config
After contract deployment, update:

**File:** `public/arcade/arcade.js`
```javascript
const ARCADE_CONTRACT = "YOUR_DEPLOYED_ADDRESS";
const ARCADE_ABI = [...]; // Add ABI
```

### Update Documentation
- Update README with live URLs
- Add contract addresses to docs
- Update API documentation
- Share links with community

---

## 🚨 Security Considerations

### Pre-Launch Security Checklist
- ✅ Server-side token verification
- ✅ RLS policies enabled on Supabase
- ✅ Rate limiting active
- ✅ Input sanitization on all endpoints
- ✅ CORS properly configured
- ✅ Environment variables secure
- ✅ No private keys in code
- ✅ API keys not exposed

### Monitoring
- Set up Vercel alerts
- Monitor error logs
- Track failed auth attempts
- Review token gate rejections

---

## 📈 Success Metrics

### Track These KPIs
1. **User Metrics:**
   - Daily/Monthly active users
   - Wallet connections
   - Token holders
   - Non-holders converted

2. **Platform Metrics:**
   - Messages sent
   - Threads created
   - Channels created
   - Arcade games played

3. **Token Metrics:**
   - Token gate success rate
   - Average token balance
   - Purchase conversions
   - Holder growth rate

---

## 🔗 Important Links

### Production URLs
- **Main Site:** https://your-domain.vercel.app
- **Arcade:** https://your-domain.vercel.app/arcade/arcade.html
- **Tokenomics:** https://your-domain.vercel.app/tokenomics.html
- **Forum:** https://your-domain.vercel.app/forum

### External Services
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **BaseScan:** https://basescan.org
- **DexScreener:** https://dexscreener.com/base/[pool-address]

### Contract Addresses
- **Basement Token:** `0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23`
- **Arcade Contract:** (Deploy and add here)

---

## 💡 Tips for Success

1. **Test Thoroughly:** Don't skip testing, especially token-gating
2. **Monitor Closely:** Watch logs for first 24-48 hours
3. **Communicate:** Keep community updated on launches
4. **Iterate Fast:** Be ready to hotfix issues quickly
5. **Document:** Keep deployment notes for future reference

---

## 🎉 Launch Checklist

Before announcing:
- [ ] All features tested
- [ ] Mobile fully responsive
- [ ] Token-gating working
- [ ] Charts displaying
- [ ] No console errors
- [ ] Performance optimized
- [ ] SEO configured
- [ ] Social previews set
- [ ] Analytics tracking
- [ ] Monitoring active

---

**Last Updated:** October 13, 2025  
**Status:** Ready for Deployment 🚀

