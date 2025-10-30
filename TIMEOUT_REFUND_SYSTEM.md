# Timeout Refund System

## Overview
Games that don't find an opponent within 60 seconds automatically trigger a refund to the creator with a 4% house fee retained for gas costs.

## How It Works

### 1. Automatic Timeout Detection
- Frontend checks all "waiting" games every 5 seconds
- Calculates elapsed time since game creation
- Triggers refund if elapsed time >= 60 seconds

### 2. Refund Processing
When a timeout is detected:
- Calls smart contract's `cancelGame()` function
- Refunds 96% of original wager to player
- 4% house fee retained for gas costs
- Updates game status to "cancelled" in database
- Shows notification with refund amount

### 3. User Experience
- Players are notified via toast when their game times out
- Refund amount clearly shown: `{wager * 0.96} ETH`
- House fee explained: "(4% house fee)"
- Games automatically removed from active listings

## Technical Implementation

### Frontend (GameLobby.tsx)
```typescript
// Checks timeouts every 5 seconds
useEffect(() => {
  const checkTimeouts = async () => {
    for (const match of matches) {
      if (match.status === 'waiting' && elapsedSeconds >= 60) {
        // Process refund via smart contract
        await checkAndProcessTimeout(gameType, gameId, createdAt);
        // Update database
        await supabase.from('matches').update({ status: 'cancelled' }).eq('id', match.id);
      }
    }
  };
  const interval = setInterval(checkTimeouts, 5000);
  return () => clearInterval(interval);
}, [matches]);
```

### Smart Contract Utilities (contracts.ts)
- `checkAndProcessTimeout()` - Checks elapsed time and triggers refund
- `cancelGame()` - Calls contract's cancel function

## Refund Breakdown

Example: Player wagers 0.1 ETH

- **Original Wager**: 0.1 ETH
- **House Fee (4%)**: 0.004 ETH
- **Refund to Player**: 0.096 ETH (96%)

## Benefits

1. **Fair to Players** - Don't lose money waiting for opponents
2. **Gas Cost Coverage** - 4% fee covers transaction costs
3. **Automatic** - No manual intervention needed
4. **Transparent** - Clear notification of refund amount

## Future Enhancements

- Add countdown timer on UI showing time until refund
- Implement flash warning at 45 seconds
- Option to extend timeout for high-stakes games
- History of timeout refunds in user profile

