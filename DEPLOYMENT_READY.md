# 🚀 Ready to Deploy Smart Contracts

## Current Status

✅ **Deployed**: War, Chess, Connect4 (on Base Mainnet)  
⚠️ **Needs Deployment**: CoinFlip, Jackpot

## What's Ready

1. ✅ Deployment scripts created
2. ✅ Contracts compiled and ready
3. ✅ Node.js 22.21.1 installed
4. ✅ Hardhat configured
5. ⚠️ Need: `.env` file with `PRIVATE_KEY`

## To Deploy CoinFlip and Jackpot

### Step 1: Setup Environment

Create `.env` file in `chain/` directory:
```
PRIVATE_KEY=your_wallet_private_key_here
BASE_MAINNET_RPC_URL=https://mainnet.base.org
HOUSE_WALLET=0x5CAdda44709251088663E94b13ad3d5E38466b4d
```

### Step 2: Deploy

```bash
cd chain
npx hardhat run scripts/deploy-coinflip-jackpot.cjs --network base-mainnet --config hardhat.config.cjs
```

### Step 3: Update Frontend

After deployment, update `src/lib/contracts.ts` with the new addresses from `chain/deployed-addresses.json`

### Step 4: Commit and Deploy to Vercel

```bash
git add .
git commit -m "feat: Deployed CoinFlip and Jackpot contracts"
git push origin dev
vercel --prod
```

## Alternative: Use Remix IDE

If Hardhat has issues, use Remix IDE:
1. Go to https://remix.ethereum.org
2. Copy contract code
3. Compile and deploy to Base Mainnet
4. Update addresses manually

## Ready When You Have Private Key!

All scripts and contracts are ready. Just need the private key in `.env` file.

