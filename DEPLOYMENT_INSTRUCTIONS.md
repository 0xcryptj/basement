# 🚀 FINAL DEPLOYMENT INSTRUCTIONS

## ✅ What's Ready:
1. **✅ All contracts compiled successfully**
2. **✅ Local tests passed** - contracts working correctly
3. **✅ House wallet configured**: `0x5CAdda44709251088663E94b13ad3d5E38466b4d`
4. **✅ Private key stored securely** in `chain/.env` (NOT in git)

---

## 💰 BEFORE DEPLOYING - FUND YOUR WALLET

### Deployer Account Balance: 0.0 ETH (Needs Funding)

**Deployer Address:** `0x5CAdda44709251088663E94b13ad3d5E38466b4d`

### How to Fund:
1. Send ETH to: `0x5CAdda44709251088663E94b13ad3d5E38466b4d`
2. Get Base ETH from: https://bridge.base.org/ (bridge from Ethereum)
3. Or use: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### How Much You Need:
- **Recommended**: 0.01 ETH on Base Mainnet
- **Minimum**: 0.005 ETH
- **Cost per deployment**: ~0.0001 - 0.0005 ETH per contract

---

## 🚀 DEPLOYMENT COMMAND

Once your wallet is funded, run:

```bash
cd chain
npx hardhat run scripts/deploy.cjs --network base-mainnet
```

This will:
1. Deploy Chess contract
2. Deploy Connect4 contract  
3. Deploy War contract
4. Save addresses to `deployed-addresses.json`

---

## ✅ AFTER DEPLOYMENT:

1. **Save the deployed addresses** from `deployed-addresses.json`
2. **Update frontend** (`src/lib/constants.ts`) with new addresses
3. **Test on BaseScan** (https://basescan.org)
4. **Monitor contract interactions**

---

## 🏠 House Wallet Info:

- **Address**: `0x5CAdda44709251088663E94b13ad3d5E38466b4d`
- **Purpose**: Receives 10% house fee from all games
- **Network**: Base Mainnet (Chain ID: 8453)

---

## ⚠️ REMEMBER:

- **NEVER commit private keys to git**
- **NEVER share your private key**
- **Always fund deployer wallet before deploying**
- **Keep some ETH for gas after deployment**

---

## Status: 🟡 READY TO DEPLOY (waiting for wallet funding)

Once you fund the deployer wallet, run the deployment command above!

