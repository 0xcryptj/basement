# 🤖 Demo Mode Guide

## Overview

Demo Mode allows users to preview and test all arcade games **without deploying contracts or using real/testnet ETH**. AI-powered bots simulate realistic gameplay, creating a live gaming environment for demonstration purposes.

---

## Features

### 🎮 Fully Functional Preview
- All games work exactly as they would on-chain
- Users can create and join games
- Bots act as real players, creating competitive matches
- Win/loss outcomes are simulated realistically

### 🤖 Intelligent Bot System
- **10 unique bot personas** with crypto-themed names:
  - CryptoWhale, DiamondHands, MoonBoy, BasedDev, DeFiKing
  - NFTCollector, GasGuzzler, SmartContract, TokenMaster, BlockChainBro

### ⚡ Realistic Game Flow
1. **Bots Create Games**: Every 15-30 seconds, bots create new games with random stakes (0.01-0.1 ETH)
2. **Bots Join Games**: Bots join open games, including user-created ones
3. **Auto-Reveal**: Games automatically reveal and settle after 3-5 seconds
4. **Game Cleanup**: Settled games are removed after 30 seconds

### 💾 Persistent State
- Games are saved to `localStorage` as `basement_demo_games`
- Demo games persist across page refreshes
- State is shared with the contract system for seamless transition

---

## How It Works

### Activation
```javascript
// In arcade.js
const DEMO_MODE = true; // Set to false when contracts are deployed
```

When `DEMO_MODE = true`:
- Contract interactions are bypassed
- All game logic runs locally
- Bots start automatically on page load

### User Experience

#### Creating a Game
1. User enters stake amount and selects choice (e.g., Heads/Tails)
2. Game is added to demo games list
3. A bot will join within 5-10 seconds
4. Game auto-reveals and settles

#### Joining a Game
1. User selects an open game from the list
2. Chooses their option
3. Game is instantly joined
4. Auto-reveals after 2 seconds

#### Viewing Live Games
- Open Games tab shows all available games
- My Games tab shows user's active/completed games
- Games auto-refresh every 5 seconds

---

## Games Implemented

### ✅ Coin Toss (Fully Functional in Demo)
- **Type**: PvP binary choice
- **Mechanic**: Heads or Tails
- **Winner**: Matching choices → random; Different choices → random
- **Fee**: 5% house cut (hidden from UI)

### 🔄 Connect 4 (Placeholder)
- Alert: "Coming soon! Smart contract under development."

### 🔄 War (Placeholder)
- Alert: "Coming soon! Smart contract under development."

### 🔄 Rock Paper Scissors (Placeholder)
- Alert: "Coming soon! Smart contract under development."

---

## Bot Behavior Logic

### Bot Actions (Probability)
- **30% Create Game**: Bot creates a new game
- **40% Join Game**: Bot joins an existing open game
- **30% Reveal Game**: Bot reveals a filled game

### Random Stake Generation
```javascript
const stake = (Math.random() * 0.09 + 0.01).toFixed(3); // 0.01 to 0.1 ETH
```

### Bot Address Generation
```javascript
function generateBotAddress() {
    return '0x' + Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}
```

---

## Data Structure

### Demo Game Object
```javascript
{
    id: 0,                  // Unique game ID
    p1: "0xabc...",        // Player 1 address
    p1Name: "CryptoWhale", // Player 1 display name
    p2: "0xdef...",        // Player 2 address (null if open)
    p2Name: "MoonBoy",     // Player 2 display name
    stake: "0.05",         // Stake amount in ETH
    pot: "0.10",           // Total pot (stake * 2 when filled)
    state: 1,              // 0=Open, 1=Filled, 2=Revealing, 3=Settled
    p1Choice: "Heads",     // Player 1's choice
    p2Choice: "Tails",     // Player 2's choice
    winner: "0xabc...",    // Winner address (after settlement)
    createdAt: 1234567890, // Timestamp
    filledAt: 1234567900   // Timestamp when p2 joined
}
```

---

## Transitioning to Real Contracts

When contracts are deployed:

1. **Update Contract Address**:
   ```javascript
   const COIN_TOSS_ADDRESS = "0xYourDeployedContractAddress";
   ```

2. **Disable Demo Mode**:
   ```javascript
   const DEMO_MODE = false;
   ```

3. **Clear Demo Data** (optional):
   ```javascript
   localStorage.removeItem('basement_demo_games');
   ```

All game functions automatically switch from demo logic to real contract interactions.

---

## Benefits

### For Users
- ✅ No wallet connection required to preview
- ✅ No testnet ETH needed
- ✅ Instant gameplay without waiting
- ✅ See how games work before playing with real funds

### For Developers
- ✅ Test UI/UX without deploying contracts
- ✅ Demonstrate features to investors/users
- ✅ Iterate quickly on game design
- ✅ Zero gas costs during development

### For Marketing
- ✅ Show live gameplay in demos
- ✅ Create promotional videos with active games
- ✅ Allow users to "try before they buy"
- ✅ Build excitement before mainnet launch

---

## Console Logs

Demo mode provides detailed logging:

```
🤖 Demo Mode Active - Bots will create and play games
🤖 CryptoWhale created game #0 with 0.042 ETH
🤖 MoonBoy joined game #0
🎉 Game #0 settled! Winner: CryptoWhale
```

---

## Troubleshooting

### Games Not Appearing
- Check `localStorage` for `basement_demo_games`
- Verify `DEMO_MODE = true` in arcade.js
- Check console for bot activity logs

### Bots Not Active
- Ensure `initDemoMode()` is called on page load
- Check if `botInterval` is running
- Look for errors in console

### Performance Issues
- Demo mode uses `setInterval` for bot actions
- If too many games accumulate, clear localStorage:
  ```javascript
  localStorage.removeItem('basement_demo_games');
  ```

---

## Future Enhancements

1. **More Game Types**: Extend demo mode to Connect 4, War, and RPS
2. **Difficulty Levels**: Add "Easy/Medium/Hard" bot intelligence
3. **Bot Chat**: Simulate chat messages for more immersion
4. **Tournament Mode**: Bots compete in brackets
5. **Stats Dashboard**: Show bot win rates, total games played, etc.

---

## Technical Notes

- Demo games are separate from real contract games
- No blockchain interaction in demo mode
- All state is client-side (localStorage)
- Bot intervals are cleared on page unload
- Games auto-refresh every 5 seconds when modal is open

---

**Demo Mode Status**: ✅ Active  
**Last Updated**: October 2025  
**Version**: 1.0.0

