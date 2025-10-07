# 🎮 Arcade Games Update

## ✅ **Changes Complete**

### 1. **New Games Added**
- ✅ **Connect 4** - Classic strategy game, 4-in-a-row to win
- ✅ **War** - Card battle, highest card wins
- ✅ Both have "Winner takes all" - house gets 5% but users don't see that

### 2. **Wallet Status Indicator**
- ✅ Added disconnect button in navbar (matches homepage)
- ✅ Shows connected wallet with profile pic + username
- ✅ "Connect Wallet" link if not connected
- ✅ Disconnect redirects to homepage

### 3. **Game Tiles**
- ❌ Removed: "Dice Duel" and "Car Wars"
- ✅ Added: "Connect 4" (🔴) and "War" (🃏)
- ✅ Both show "Play Now" buttons
- ✅ Both have modals with Create/Join/My Games tabs

---

## 📁 **Files Created/Updated**

### **Smart Contracts:**
1. `chain/contracts/Connect4.sol` - Full Connect 4 implementation
2. `chain/contracts/War.sol` - Card game with commit-reveal

### **Deployment Scripts:**
1. `chain/scripts/deployConnect4.ts` - Deploy Connect 4
2. `chain/scripts/deployWar.ts` - Deploy War
3. `chain/scripts/deployAll.ts` - Deploy all 3 games at once

### **Frontend:**
1. `arcade/arcade.html` - Updated game tiles + modals
2. `arcade/arcade.js` - Added Connect 4 & War functions
3. `arcade/arcade.css` - Already has all needed styles

---

## 🎮 **Game Mechanics**

### **Connect 4:**
- 6 rows x 7 columns
- Players alternate dropping pieces
- First to get 4 in a row (horizontal/vertical/diagonal) wins
- Draw = pot split 50/50
- Turn-based on-chain

### **War:**
- Each player picks a card (1-13)
- Uses commit-reveal (like Coin Toss)
- Highest card wins
- Tie = pot split 50/50
- 30-minute reveal window

---

## 💰 **House Fee (Hidden from Users)**

All games charge **5% per player**:
```solidity
uint256 public constant FEE_BPS_PER_PLAYER = 500; // 5%
address payable public immutable house = payable(0x5Da407f983e0f11B3f7F67Acd64877b42B22068D);
```

**Example:**
- Player 1 stakes 0.1 ETH → Pays 0.105 ETH (0.005 to house)
- Player 2 stakes 0.1 ETH → Pays 0.105 ETH (0.005 to house)
- Winner gets: 0.2 ETH
- House gets: 0.01 ETH total

Users only see "Winner takes all" - no fee mentioned.

---

## 🚀 **Deployment Instructions**

### **Deploy All Games:**
```bash
cd chain
npx hardhat run scripts/deployAll.ts --network base
```

### **Or Deploy Individually:**
```bash
# Coin Toss (already exists)
npx hardhat run scripts/deploy.ts --network base

# Connect 4
npx hardhat run scripts/deployConnect4.ts --network base

# War
npx hardhat run scripts/deployWar.ts --network base
```

### **After Deployment:**
Update `arcade/arcade.js` with contract addresses:
```javascript
const COIN_TOSS_ADDRESS = "0x...";
const CONNECT4_ADDRESS = "0x...";
const WAR_ADDRESS = "0x...";
```

---

## 🎯 **Current Game Status**

### **✅ Fully Implemented (Frontend + Contract):**
1. **Coin Toss** 🪙 - Heads or Tails, commit-reveal

### **🟡 Ready to Implement (Contract done, needs JS):**
2. **Connect 4** 🔴 - Contract ready, frontend stub
3. **War** 🃏 - Contract ready, frontend stub

### **⚪ Coming Soon:**
4. Slot Machine 🎰
5. Target Master 🎯
6. Race Track 🏁

---

## 📋 **Connect 4 Contract Interface**

```solidity
// Create game (auto-stakes)
function createGame() external payable returns (uint256 id)

// Join game (match stake)
function joinGame(uint256 id) external payable

// Make move (drop piece in column)
function makeMove(uint256 id, uint8 col) external

// Get board state
function getBoard(uint256 id) external view returns (uint8[6][7] memory)

// Events
event GameCreated(uint256 id, address creator, uint256 stake);
event GameJoined(uint256 id, address joiner);
event MoveMade(uint256 id, address player, uint8 col, uint8 row);
event GameWon(uint256 id, address winner, uint256 payout);
event GameDraw(uint256 id);
```

---

## 📋 **War Contract Interface**

```solidity
// Create game with commit
function createGame(bytes32 commit) external payable returns (uint256 id)

// Join game with commit
function joinGame(uint256 id, bytes32 commit) external payable

// Reveal card
function reveal(uint256 id, uint8 card, bytes32 salt) external

// Claim if opponent times out
function claimTimeout(uint256 id) external

// Events
event GameCreated(uint256 id, address creator, uint256 stake);
event GameJoined(uint256 id, address joiner);
event CardRevealed(uint256 id, address player, uint8 card);
event GameSettled(uint256 id, address winner, uint256 payout);
event GameTied(uint256 id, uint256 refundAmount);
```

---

## 🔧 **Next Steps to Complete Integration**

### **For Connect 4:**
1. Add contract ABI to `arcade.js`
2. Implement `createConnect4Game()` with contract call
3. Implement `loadConnect4Games()` to read open games
4. Add board display UI (7x6 grid)
5. Implement `makeConnect4Move()` for gameplay

### **For War:**
1. Add contract ABI to `arcade.js`
2. Implement `createWarGame()` with commit-reveal
3. Implement `loadWarGames()` to read open games
4. Add card selection UI (1-13)
5. Implement reveal logic

### **Testing:**
1. Deploy contracts to Base testnet
2. Update contract addresses
3. Test create/join/play flows
4. Test edge cases (timeouts, ties, etc.)

---

## ✨ **Wallet Integration**

✅ **Read-only wallet display:**
- Shows profile pic + username if connected
- Shows "Connect Wallet" link if not connected
- Disconnect button clears session and redirects to homepage
- Session persists via localStorage

✅ **Connection flow:**
1. User connects on homepage
2. Arcade reads from localStorage
3. Shows connected status
4. Can disconnect from arcade (clears everywhere)

---

## 🎨 **UI/UX**

✅ **Game Tiles:**
- Retro cyberpunk style
- Neon blue glows (#0052ff99)
- "Winner takes all" tagline
- No fee mentioned

✅ **Modals:**
- 3 tabs: Create / Join / My Games
- Same structure as Coin Toss
- Ready for game-specific content

✅ **Navbar:**
- Matches homepage exactly
- Profile pic + username + disconnect
- Or "Connect Wallet" link

---

## 📊 **Summary**

| Game | Contract | Frontend | Deploy Script | Status |
|------|----------|----------|---------------|--------|
| Coin Toss | ✅ | ✅ | ✅ | Ready |
| Connect 4 | ✅ | 🟡 Stub | ✅ | Needs JS |
| War | ✅ | 🟡 Stub | ✅ | Needs JS |

**Legend:**
- ✅ = Complete
- 🟡 = Partial (needs work)
- ❌ = Not started

---

**Updated:** October 7, 2025  
**Version:** 4.0.0 - Connect 4 & War Added

