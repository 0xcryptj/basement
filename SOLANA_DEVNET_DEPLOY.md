# 🎮 Deploy Solana to Devnet (FREE Testing)

## ✅ **No Cost - Perfect for Testing!**

You don't need 10 SOL! Deploy to **Devnet** first (completely free), test everything, then deploy to mainnet later when ready.

---

## 🆓 **Solana Devnet Deployment (Free SOL!)**

### **Step 1: Go to Solana Playground**
```
https://beta.solpg.io
```

### **Step 2: Create Project**
- Click "Create New Project"
- Select "Anchor"
- Name: "basement-luckyblock-test"

### **Step 3: Paste Program Code**
- Delete default code
- Copy from: `solana/programs/luckyblock/lib.rs` 
- Paste all 414 lines

### **Step 4: Switch to Devnet**
- In Playground, top right corner
- Click network dropdown
- Select **"Devnet"** (not Mainnet!)

### **Step 5: Connect Wallet**
- Click "Connect Wallet"
- Select Phantom
- In Phantom, switch to **Devnet** network
- (Settings → Developer Settings → Change Network → Devnet)

### **Step 6: Get FREE Devnet SOL**
- In Playground, click "Airdrop" button
- Or run this in Test tab:
```javascript
await pg.connection.requestAirdrop(
  pg.wallet.publicKey,
  2 * web3.LAMPORTS_PER_SOL
);
```
- You'll get 2 SOL for free!
- Click airdrop 5 times = 10 SOL (free!) ✅

### **Step 7: Build**
- Click "Build" button
- Wait for "✅ Build successful"

### **Step 8: Deploy to Devnet**
- Click "Deploy" button
- Confirm in Phantom (FREE - no real money!)
- Save the Program ID
- Example: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`

### **Step 9: Initialize (Free)**
```javascript
// In Test tab, paste this:
const houseWallet = pg.wallet.publicKey; // Use your wallet as house for testing

const [gameStatePDA] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("game_state")],
  pg.program.programId
);

const tx = await pg.program.methods
  .initialize(houseWallet)
  .accounts({
    gameState: gameStatePDA,
    authority: pg.wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();

console.log("✅ Program initialized!");
console.log("Program ID:", pg.program.programId.toString());
console.log("House Wallet:", houseWallet.toString());
```

### **Step 10: Create First Round (Free)**
```javascript
const gameState = await pg.program.account.gameState.fetch(gameStatePDA);
const roundNum = gameState.currentRound;

const [roundPDA] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("round"), new BN(roundNum).toArrayLike(Buffer, "le", 8)],
  pg.program.programId
);

const tx2 = await pg.program.methods
  .createRound()
  .accounts({
    gameState: gameStatePDA,
    round: roundPDA,
    authority: pg.wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();

console.log("✅ Round 1 created! Ready for players!");
```

---

## 🔧 **Update Frontend for Devnet Testing**

**Edit:** `public/arcade/luckyblock.html`

**Find (line ~1290):**
```javascript
solana: {
    name: 'Solana',
    rpc: 'https://api.mainnet-beta.solana.com',
    contract: null,
    explorer: 'https://solscan.io',
    currency: 'SOL'
}
```

**Change to (for devnet testing):**
```javascript
solana: {
    name: 'Solana Devnet',
    rpc: 'https://api.devnet.solana.com',
    contract: 'YOUR_DEVNET_PROGRAM_ID_HERE',
    explorer: 'https://explorer.solana.com/?cluster=devnet',
    currency: 'SOL (Test)'
}
```

**Enable Solana betting (line ~2403):**
```javascript
if (newChain === 'solana') {
    networkDisplay.textContent = 'Solana Devnet (Test)';
    contractInfo.textContent = 'Program: ' + SUPPORTED_CHAINS.solana.contract;
    if (userAddress) {
        document.getElementById('enter-btn').disabled = false;
        document.getElementById('enter-btn').textContent = '🎰 ENTER (Test) 🎰';
    }
    showToast('☀️ Switched to Solana Devnet - FREE TESTING!', 'success');
}
```

---

## ✨ **Benefits of Devnet Testing:**

| Feature | Devnet | Mainnet |
|---------|--------|---------|
| **Cost** | FREE! ✅ | ~$300-750 |
| **SOL** | Free airdrop | Must buy |
| **Testing** | ✅ Safe | Risky |
| **Speed** | Same | Same |
| **Real Money** | No | Yes |

**Best Practice:** Test EVERYTHING on devnet first! ✅

---

## 🎮 **Full Test Flow (All Free!):**

1. Deploy to Devnet (free)
2. Update frontend with devnet program ID
3. Switch Phantom to Devnet
4. Get free test SOL (airdrop button)
5. Test full game:
   - Player 1 enters (free test SOL)
   - Player 2 enters (60s timer starts!)
   - Winner selected
   - Payout works
6. Fix any bugs
7. When perfect → Deploy to Mainnet

---

## 💰 **When Ready for Mainnet:**

**Option 1: Buy SOL**
- Buy on Coinbase/Binance (~$150 = 1 SOL currently)
- Need ~5-10 SOL for deployment
- Send to Phantom wallet

**Option 2: Earn SOL**
- Some platforms give SOL for tasks
- Solana faucets (limited amounts)

**Option 3: Start with What You Have**
- Deploy smaller programs first
- CoinToss needs less SOL (~2-3 SOL)
- Build up from game fees

**Option 4: Stay on Base for Now**
- Base is fully working
- Add Solana later when you have SOL
- No rush!

---

## 🎯 **Recommended Path:**

### **Phase 1: Devnet (This Week - FREE)**
1. Deploy to Devnet (free)
2. Test all features
3. Fix any bugs
4. Get comfortable with Solana
5. Show users the Devnet version

### **Phase 2: Mainnet (When You Have SOL)**
1. Same code, just switch to mainnet
2. Deploy (costs 5-10 SOL)
3. Update frontend
4. Launch for real!

---

## 🚀 **Deploy to Devnet Now (10 Minutes, FREE):**

1. **Solana Playground:** https://beta.solpg.io
2. **Switch to Devnet** (top right)
3. **Airdrop 10 SOL** (free!)
4. **Build & Deploy** (free!)
5. **Test with fake SOL** (free!)

**When it works on devnet, deploying to mainnet is just changing one dropdown!**

---

## 📝 **Quick Start (Free Devnet):**

```
1. https://beta.solpg.io
2. New Project → Anchor
3. Paste: solana/programs/luckyblock/lib.rs
4. Network: Devnet (top right)
5. Phantom: Switch to Devnet
6. Airdrop: Get 10 free SOL
7. Build → Deploy (free!)
8. Save Program ID
9. Initialize (free!)
10. Test game (free!)
```

**Total cost: $0** 🎉

---

## 🌟 **Alternative: Focus on Base**

**Base is already working!**

You can:
- Keep Base as primary network
- Add Solana later when you have funds
- Users can play on Base right now
- Earn fees on Base
- Use those fees to fund Solana deployment

**Base contract:** Already deployed, working, earning fees ✅

---

## ✅ **Summary:**

**For FREE Testing:**
- ✅ Deploy to Solana Devnet (free SOL via airdrop)
- ✅ Test full game mechanics
- ✅ Perfect the experience
- ✅ No real money risk

**For Production:**
- ⏳ Need 5-10 SOL for mainnet deployment
- ⏳ Can wait until you have funds
- ✅ Base network working now
- ✅ Can earn fees on Base first

**Recommended:** Deploy to Devnet now (FREE), mainnet later!

---

**Start here:** https://beta.solpg.io (switch to Devnet, get free SOL!)

**Or:** Keep using Base (already working!), add Solana later.

**Your choice!** Both options are good. 🚀


