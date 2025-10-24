# The Basement - Smart Contracts

## Overview
This directory contains the Solidity smart contracts for The Basement arcade games deployed on Base network.

## Contracts

### War.sol
Classic War card game with on-chain randomness.
- Players lock equal wagers
- Random cards dealt (1-13)
- Winner takes pot minus 10% house fee
- Ties result in refund

**Note:** Current implementation uses pseudo-randomness. For production, integrate Chainlink VRF.

### Connect4.sol
Full Connect 4 implementation with on-chain state.
- 6x7 grid stored on-chain
- Turn-based gameplay with timeout protection
- Win detection for 4-in-a-row (horizontal, vertical, diagonal)
- 10% house fee on winnings

### Chess.sol
Simplified chess with basic move validation.
- Standard 8x8 board initialization
- King capture = win condition
- Timeout mechanism for inactive players
- 10% house fee on winnings

**Note:** This is a simplified implementation. Full chess rule validation would require significantly more complexity.

## Deployment

### Using Remix (Recommended)
1. Visit [Remix IDE](https://remix.ethereum.org/)
2. Create new files for each contract
3. Compile with Solidity 0.8.20+
4. Switch to "Injected Provider" (MetaMask)
5. Select Base network in MetaMask
6. Deploy contracts

### Using Hardhat
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

npx hardhat compile
npx hardhat run scripts/deploy.js --network base
```

## House Wallets
- **Base**: `0x0F030f98b1F3cE9DA7054AC9CD454d2a816b5B03`
- **Solana**: `bLTgi8oDjiE2zwV3ym15gHDwAnn2NqZ1ScfQZERoyYf`

All contracts deduct 10% fees automatically routed to house wallet.

## Token Addresses
- **Base Token (ERC-20)**: `0xfd730abb25c17e5bccf3bad3016ccc861bffbc7b`
- **Solana Token (SPL)**: `D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump`

## Security Considerations
⚠️ **WARNING**: These contracts are templates for demonstration purposes.

Before mainnet deployment:
1. Replace pseudo-randomness with Chainlink VRF
2. Add comprehensive input validation
3. Implement pause mechanisms
4. Complete professional security audit
5. Add emergency withdrawal functions
6. Test extensively on testnet

## Gas Optimization
- Connect4 board storage is expensive (~200k gas per game)
- Consider off-chain state with on-chain verification
- Use events for move history instead of storage

## Frontend Integration
```javascript
// Example: Create War game
const warContract = new ethers.Contract(warAddress, warABI, signer);
const tx = await warContract.createGame({ value: ethers.utils.parseEther("0.01") });
await tx.wait();

// Join game
const joinTx = await warContract.joinGame(gameId, { value: ethers.utils.parseEther("0.01") });
await joinTx.wait();
```

## License
MIT
