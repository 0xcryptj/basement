# Smart Contracts Deployment Guide

## Current Status

### ✅ Contracts Created
- **BaseGame.sol** - Abstract base (reduces duplication)
- **War.sol** - Deployed to Base
- **Chess.sol** - Deployed to Base  
- **Connect4.sol** - Deployed to Base
- **CoinFlip.sol** - Ready for deployment
- **Jackpot.sol** - Ready for deployment

### Contract Security
- ✅ 10% house fee properly configured
- ✅ House wallet: `0x5CAdda44709251088663E94b13ad3d5E38466b4d`
- ✅ All contracts use same fee structure
- ⚠️ Randomness uses block properties (for production, use Chainlink VRF)
- ⚠️ No reentrancy guards (should add before production)

## Deployment Steps

### 1. Compile Contracts
```bash
cd chain
npx hardhat compile --config hardhat.config.cjs
```

### 2. Deploy to Base
```bash
# Set your private key in .env
npx hardhat run scripts/deploy.cjs --network base --config hardhat.config.cjs
```

### 3. Update Frontend
Once deployed, update `src/lib/contracts.ts` with the new addresses:
```typescript
export const CONTRACT_ADDRESSES = {
  War: '0xe6c00D7765D592A1D28A5AaB11ffeF37d7A726bC',
  Chess: '0x429e6BF43b9127A9Ee95FD17f17213a35252488b',
  Connect4: '0x76Ff072AE1230133e7e570aCE2a5bBc5172BE0e5',
  CoinFlip: '0x...', // ADD DEPLOYED ADDRESS
  Jackpot: '0x...', // ADD DEPLOYED ADDRESS
} as const;
```

## Testing Requirements

Before mainnet:
1. ✅ Test contract compilation
2. ⚠️ Deploy to Base testnet
3. ⚠️ Test all game flows
4. ⚠️ Verify transaction gas costs
5. ⚠️ Security audit

## Known Issues

1. **Node version** - Need Node 22.10.0+ for Hardhat (current: 20.11.0)
2. **Module type** - hardhat.config.js needs .cjs extension
3. **ABI compilation** - Need to run compile to generate artifacts

## Next Steps

1. Deploy contracts manually using Remix or other tool
2. Or upgrade Node.js version
3. Test on testnet first
4. Get security audit
5. Deploy to mainnet

