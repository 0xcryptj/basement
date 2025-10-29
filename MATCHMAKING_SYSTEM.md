# 🎮 Multiplayer Matchmaking System

## Overview
Your arcade now has a complete matchmaking system that allows players to find opponents for PvP games!

---

## ✅ What's Been Implemented

### Backend API Routes:
1. **POST `/api/matchmaking/find`** - Join matchmaking queue
2. **GET `/api/matchmaking/find?playerId=xxx`** - Check match status
3. **POST `/api/matchmaking/cancel`** - Cancel search

### Frontend:
- `public/matchmaking.js` - Matchmaking client library
- Auto-polling for match updates
- Queue position tracking
- Match notifications

---

## 🎯 How It Works

### Matchmaking Flow:
```
Player 1 creates game
       ↓
Enters matchmaking queue
       ↓
Server searches for opponent
  - Same game type
  - Same stake amount
       ↓
Player 2 joins
       ↓
Match found!
       ↓
Both players notified
       ↓
Game starts
```

---

## 💻 Integration Example

### For Any Arcade Game:

```html
<!-- Include matchmaking.js in your game HTML -->
<script src="../matchmaking.js"></script>

<script>
// When player clicks "Find Opponent"
async function findOpponent() {
    const userAddress = '0x...'; // Get from wallet
    const stake = '0.01'; // Get from input
    const game = 'cointoss'; // Game type
    
    // Start matchmaking
    await matchmaking.startMatchmaking(game, stake, userAddress, (matchData) => {
        if (matchData.matched) {
            console.log('Match found!', matchData);
            // Start game with opponent
            startPvPGame(matchData.gameId, matchData.opponent);
        }
    });
}

// To cancel search
function cancelSearch() {
    matchmaking.stopMatchmaking();
}

// Check queue stats
async function showQueueStats() {
    const stats = await matchmaking.getQueueStats();
    console.log('Players in queue:', stats.queueSize);
    console.log('Games waiting:', stats.games);
}
</script>
```

---

## 🎨 UI Components Needed

### Add to Each Game's Modal:

```html
<!-- Matchmaking Status Display -->
<div id="matchmaking-status" class="matchmaking-status">
    <button onclick="findOpponent()" class="btn-primary">
        🔍 Find Opponent
    </button>
</div>

<!-- When searching, displays:
⏳ Searching for opponent...
Queue position: 1/3
Waiting: 15s
[Cancel Search] button
-->
```

### Example for Coin Toss:

```html
<!-- In coin toss modal, add matchmaking option -->
<div class="tab-content">
    <h3>PvP Mode</h3>
    <button onclick="findCoinTossOpponent()" class="btn-find-player">
        🔍 Find Random Opponent
    </button>
    <div id="matchmaking-status"></div>
</div>

<script>
async function findCoinTossOpponent() {
    const stake = document.getElementById('create-stake').value;
    const address = userWalletAddress; // Your wallet address
    
    await matchmaking.startMatchmaking('cointoss', stake, address, (match) => {
        if (match.matched) {
            // Match found! Start game
            alert(`Opponent found! Starting game vs ${match.opponent.address}`);
            // Load game with opponent
            loadPvPCoinToss(match.gameId, match.opponent);
        }
    });
}
</script>
```

---

## 📊 Matchmaking API Reference

### POST /api/matchmaking/find

**Request:**
```json
{
  "address": "0x1234...5678",
  "game": "cointoss",
  "stake": "0.01"
}
```

**Response (No Match):**
```json
{
  "matched": false,
  "playerId": "uuid-here",
  "queuePosition": 1,
  "queueSize": 3,
  "message": "Searching for opponent..."
}
```

**Response (Match Found):**
```json
{
  "matched": true,
  "gameId": "game-uuid",
  "opponent": {
    "address": "0x9876...4321",
    "playerId": "opponent-uuid"
  },
  "yourPlayerId": "your-uuid",
  "game": "cointoss",
  "stake": "0.01",
  "message": "Match found! Starting game..."
}
```

### GET /api/matchmaking/find?playerId=xxx

**Response:**
```json
{
  "status": "waiting",
  "queuePosition": 2,
  "queueSize": 5,
  "waitingTime": 15,
  "message": "Still searching for opponent..."
}
```

---

## 🎮 Game Integration Steps

### 1. Add Matchmaking Button
```html
<button onclick="findOpponent()" class="btn-matchmaking">
    🔍 Find Opponent
</button>
```

### 2. Handle Match Found
```javascript
matchmaking.startMatchmaking(game, stake, address, (matchData) => {
    if (matchData.matched) {
        // Close modal
        closeGameModal();
        
        // Start PvP game
        startPvPGame(matchData.gameId, matchData.opponent);
        
        // Show opponent info
        showOpponentInfo(matchData.opponent.address);
    }
});
```

### 3. Show Queue Status
```javascript
// Display while searching
const updateStatus = () => {
    if (matchmaking.searching) {
        document.getElementById('status').textContent = 
            'Searching for opponent... ⏳';
    }
};
```

---

## 🔧 Features

### ✅ Implemented:
- Auto-matching by game type and stake
- Queue position tracking
- Real-time polling (2s intervals)
- Cancel search functionality
- Queue statistics
- Auto-cleanup of stale entries (5min timeout)

### 🚀 Future Enhancements:
- Skill-based matching (ELO rating)
- Friend invites
- Private lobbies
- Tournament brackets
- Match history
- Player ratings

---

## 🎯 Supported Games

| Game | Type | Matchmaking Ready |
|------|------|-------------------|
| Coin Toss | PvP | ✅ Yes |
| Connect 4 | PvP | ✅ Yes |
| War | PvP | ✅ Yes |
| Rock Paper Scissors | PvP | ✅ Yes |
| Chess | PvP | ✅ Yes |
| Lucky Block | Solo | ❌ N/A |

---

## 📱 Mobile Support

Matchmaking works on all devices:
- Responsive UI
- Touch-friendly buttons
- Mobile-optimized polling
- Low bandwidth usage

---

## 🔐 Security

- Wallet address verification
- Stake amount validation
- Queue timeout (5 minutes)
- Anti-spam protection
- Session validation

---

## 💡 Usage Tips

1. **Always verify wallet connection** before starting matchmaking
2. **Set stake amount** before searching
3. **Cancel search** if waiting too long
4. **Check queue stats** to see activity
5. **Handle timeouts** gracefully

---

## 🐛 Troubleshooting

### No matches found:
- Not enough players online yet
- Try different stake amounts
- Check queue stats
- Wait longer (auto-polls every 2s)

### Match found but game doesn't start:
- Refresh the page
- Check console for errors
- Verify wallet is still connected
- Check network connection

---

## 🚀 Next Steps

1. **Integrate into each game's UI**
2. **Add matchmaking modals**
3. **Display queue stats on arcade page**
4. **Add notifications when match is found**
5. **Implement game start logic**

---

**Matchmaking system is ready! Now integrate it into your arcade games for true multiplayer PvP action! 🎮**

