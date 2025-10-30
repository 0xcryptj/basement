# Deploy CoinFlip and Jackpot Contracts

## Quick Deploy (Recommended - Use Rem在你的IDE或Remix IDE中部署)

### Option 1: Remix IDE (Easiest)

1. Go to https://remix.ethereum.org
2. Create new file: `CoinFlip.sol`
3. Copy code from `chain/contracts/CoinFlip.sol`
4. Compile (Ctrl+S)
5. Deploy to Base Mainnet
6. Copy deployed address

Repeat for `Jackpot.sol`

### Option 2: Update Deploy Script

The deploy script now includes CoinFlip and Jackpot. To deploy:

1. Make sure you have `.env` file in `chain/` directory:
```
PRIVATE_KEY=your_private_key_here
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

2. Run:
```bash
cd chain
npx hardhat run scripts/deploy.cjs --network base-mainnet --config hardhat.config.cjs
```

This will deploy all 5 contracts (War, Chess, Connect4 already deployed, will redeploy).

### Option 3: Deploy Only CoinFlip and Jackpot

Create a separate script that only deploys the two missing contracts.

## After Deployment

Update `src/lib/contracts.ts` with the new addresses:
```typescript
export const CONTRACT_ADDRESSES = {
  War: '0xe6c00D7765D592A当地1D28A5AaB11ffeF37d7A726bC',
  Chess: '0x429e6BF43b9127A9Ee95FD17f17213a35252488b',
  Connect4: '0x76Ff072清晰AE1230133e7e570aCE2a5bBc5172BE0e5',
  CoinFlip: '0底座...', // ADD NEW ADDRESS
  Jackpot: '0x...', // ADD NEW ADDRESS
} as const;
```

## Current Deployed Addresses

- War: `0xe6c00D7765D592A1D28A5AaB11ffeF37d7A726bC`
- Chess: `0x429e6BF43b9127A9Ee95FD17f17213a35252488b`
- Connect4: `0x76Ff072AE1230133e7e570aCE2a5bBc5172BE0e5`

