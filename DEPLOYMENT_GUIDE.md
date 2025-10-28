# 🚀 Smart Contract Deployment Guide

## 🔐 Credentials Securely Stored

✅ **Private Key**: Stored in `chain/.env` (NOT in git)  
✅ **House Wallet**: `0x5cadda44709251088663e94b13ad3d5e38466b4d`  
✅ **Network**: Base Mainnet (Chain ID: 8453)

## 💰 Estimated Deployment Costs

### On Base Mainnet:
- **Per contract**: ~$0.50 - $2.00 USD (depends on ETH price and gas)
- **Total for 4 contracts** (War, Chess, Connect4, CoinToss): ~$2-8 USD
- **Additional gas**: Transaction fees vary

### Current Base Gas Prices:
- Base typically has much lower fees than Ethereum mainnet
- Expect ~0.0001 - 0.001 ETH total for all deployments

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- [ ] Deployer wallet has sufficient ETH on Base
- [ ] Private key configured in `chain/.env`  
- [ ] House wallet funded (this will receive winnings)
- [ ] Contracts compiled successfully
- [ ] Tests pass (if available)

## 🎯 Deployment Status

**Contracts to Deploy:**
1. ✅ Chess.sol (already compiled)
2. ✅ Connect4.sol (already compiled)  
3. ✅ War.sol (already compiled)
4. ✅ CoinToss.sol (already compiled)

**Compilation Status**: ✅ All contracts compiled (found in `chain/artifacts/contracts/`)

## ⚠️ IMPORTANT

1. **The new credentials are safe** - stored in `chain/.env` which is in `.gitignore`
2. **Never commit the private key again**
3. **Verify the house wallet** before deployment
4. **Test on Base Sepolia first** if possible

---

## Next Steps:

1. Update contracts to use the new house wallet address
2. Create deployment script
3. Deploy to Base Mainnet
4. Save contract addresses
5. Update frontend to use new addresses

