# Deploy Using Remix IDE

## Quick Deployment Guide

Since Hardhat has dependency issues, use Remix IDE for deployment:

### Deploy CoinFlip

1. Go to https://remix.ethereum.org
2. Create new file: `CoinFlip.sol`
3. Copy entire code from `chain/contracts/CoinFlip.sol`
4. Compile (Ctrl+S or click Compile button)
5. Switch to "Deploy & Run Transactions" tab
6. Select "Injected Provider - MetaMask"
7. Select network: Base Mainnet (chainId: 8453)
8. Click "Deploy"
9. Copy the deployed address from the console

### Deploy Jackpot

1. Repeat steps above but with `Jackpot.sol`
2. Get deployed address

### Update Frontend

After getting both addresses, update `src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  War: '0xe6c00D7765D592A1D28A5AaB11ffeF37d7A726bC',
  Chess: '0x429e6BF43b9127A9Ee95FD17f17213a35252488b',
  Connect4: '0x76Ff072AE1230133e7e570aCE2a5bBc5172BE0e5',
  CoinFlip: '0xYOUR_COINFLIP_ADDRESS',
  Jackpot: '0xYOUR_JACKPOT_ADDRESS',
} as const;
```

Then commit and push!

