# 🚀 Deploy Solana Programs - Step by Step

## ✅ SQL Snippet (Run This First!)

### **Copy This Into Supabase SQL Editor:**

```sql
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "ChannelMember" CASCADE;
DROP TABLE IF EXISTS "Channel" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "walletAddress" TEXT UNIQUE NOT NULL,
    "username" TEXT UNIQUE,
    "avatarUrl" TEXT,
    "balanceEth" DECIMAL(18,8) DEFAULT 0,
    "balanceUsd" DECIMAL(18,2) DEFAULT 0,
    "isVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Channel" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isPrivate" BOOLEAN DEFAULT false,
    "maxMembers" INTEGER,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Message" (
    "id" TEXT PRIMARY KEY,
    "channelId" TEXT NOT NULL REFERENCES "Channel"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "replyToId" TEXT REFERENCES "Message"("id") ON DELETE SET NULL,
    "isEdited" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "Channel_slug_idx" ON "Channel"("slug");
CREATE INDEX "Message_channelId_createdAt_idx" ON "Message"("channelId", "createdAt" DESC);
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

INSERT INTO "Channel" ("id", "name", "slug", "description") VALUES
('luckyblock_ch', '#luckyblock', 'luckyblock', 'LuckyBlock game chat'),
('basement_ch', '#basement', 'basement', 'General chat'),
('arcade_ch', '#arcade', 'arcade', 'Arcade games');

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Channel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users viewable by all" ON "User" FOR SELECT USING (true);
CREATE POLICY "Users can insert" ON "User" FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update" ON "User" FOR UPDATE USING (true);
CREATE POLICY "Channels viewable by all" ON "Channel" FOR SELECT USING (true);
CREATE POLICY "Channels insertable" ON "Channel" FOR INSERT WITH CHECK (true);
CREATE POLICY "Messages viewable by all" ON "Message" FOR SELECT USING (true);
CREATE POLICY "Messages insertable" ON "Message" FOR INSERT WITH CHECK (true);
CREATE POLICY "Messages updatable" ON "Message" FOR UPDATE USING (true);

GRANT ALL ON "User" TO authenticated, anon;
GRANT ALL ON "Channel" TO authenticated, anon;
GRANT ALL ON "Message" TO authenticated, anon;

DO $$
BEGIN
    RAISE NOTICE '✅ Chat database fixed!';
    RAISE NOTICE '✅ Tables created: User, Channel, Message';
    RAISE NOTICE '✅ Default channels: luckyblock, basement, arcade';
    RAISE NOTICE '✅ Chat should now work!';
END$$;
```

**Run at:** https://supabase.com/dashboard → Your Project → SQL Editor

---

## 🌟 Deploy Solana LuckyBlock Program

### **Use Solana Playground (No Installation Needed!)**

**Step 1: Go to Solana Playground**
```
https://beta.solpg.io
```

**Step 2: Sign In**
- Click "Connect" in top right
- Sign in with GitHub (recommended) or create account

**Step 3: Create New Project**
- Click "Create New Project"
- Select "Anchor" framework
- Name it "basement-luckyblock"
- Click "Create"

**Step 4: Replace Default Code**
- You'll see `lib.rs` file open
- Delete ALL the default code
- Copy the entire program from: `solana/programs/luckyblock/lib.rs`
- Paste into the editor

**Step 5: Set House Wallet**
- Open Phantom wallet
- Switch to Solana network
- Copy your wallet address (will use as house wallet)
- Or create a new wallet specifically for house fees

**Step 6: Build**
- Click "Build" button (or press Ctrl+B)
- Wait for "Build successful ✅"
- If errors, check the console

**Step 7: Deploy**
- Make sure Phantom is connected (Solana mainnet)
- Make sure you have ~10 SOL in wallet
- Click "Deploy" button
- Confirm in Phantom wallet
- Wait for deployment (~30 seconds)
- **SAVE THE PROGRAM ID!** (Will look like: `Fg6PaF...FsLnS`)

**Step 8: Initialize Program**
- Go to "Test" tab in Playground
- Run this code (replace YOUR_HOUSE_WALLET):

```javascript
// Initialize the program with your house wallet
const houseWallet = new web3.PublicKey("YOUR_HOUSE_WALLET_ADDRESS_HERE");

const [gameStatePDA] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("game_state")],
  pg.program.programId
);

try {
  const tx = await pg.program.methods
    .initialize(houseWallet)
    .accounts({
      gameState: gameStatePDA,
      authority: pg.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Initialized! TX:", tx);
  console.log("✅ Program ID:", pg.program.programId.toString());
  console.log("✅ House Wallet:", houseWallet.toString());
} catch (e) {
  console.error("Error:", e);
}
```

**Step 9: Create First Round**
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

console.log("✅ Round 1 created! TX:", tx2);
console.log("✅ Ready for players!");
```

**Step 10: Save Program Info**
```
Program ID: [From Step 7]
House Wallet: [Your Solana address]
Game State PDA: [Will be shown in console]
Round 1 PDA: [Will be shown in console]
```

---

## 📝 Update Frontend

**Edit:** `public/arcade/luckyblock.html`

**Find (around line 1290):**
```javascript
solana: {
    name: 'Solana',
    rpc: 'https://api.mainnet-beta.solana.com',
    contract: null, // Will be deployed
    explorer: 'https://solscan.io',
    currency: 'SOL'
}
```

**Change to:**
```javascript
solana: {
    name: 'Solana',
    rpc: 'https://api.mainnet-beta.solana.com',
    contract: 'YOUR_PROGRAM_ID_FROM_STEP_7',
    explorer: 'https://solscan.io',
    currency: 'SOL'
}
```

**Find `switchChain` function (around line 2403):**
```javascript
if (newChain === 'solana') {
    networkDisplay.textContent = 'Solana Mainnet';
    contractInfo.textContent = '⏳ Solana program deployment coming soon!';
    document.getElementById('enter-btn').disabled = true;
    document.getElementById('enter-btn').textContent = '⏸️ SOLANA COMING SOON';
    showToast('☀️ Switched to Solana network', 'success');
}
```

**Change to:**
```javascript
if (newChain === 'solana') {
    networkDisplay.textContent = 'Solana Mainnet';
    contractInfo.textContent = 'Program: YOUR_ID | 5% fee | Provably fair';
    if (userAddress) {
        document.getElementById('enter-btn').disabled = false;
        document.getElementById('enter-btn').textContent = '🎰 ENTER 🎰';
    }
    showToast('☀️ Switched to Solana network - LIVE!', 'success');
}
```

**Commit & Deploy:**
```bash
git add public/arcade/luckyblock.html
git commit -m "Enable Solana LuckyBlock with deployed program"
git push origin main
npx vercel --prod
```

---

## ✅ **What You'll Have:**

```
🌐 THE BASEMENT - MULTI-CHAIN ARCADE

🔵 BASE NETWORK:
✅ LuckyBlock: 0xf7Cd6fcc391ad2c771c84159E60BDAEeE9BA821e
✅ 2 players to start
✅ 60-second timer
✅ Fully functional

☀️ SOLANA NETWORK:
✅ LuckyBlock: [Your Program ID]
✅ 2 players to start
✅ 60-second timer  
✅ Fully functional

💬 CHAT:
✅ Works on both networks
✅ Real-time messaging
✅ Shared across chains

🦄 PHANTOM WALLET:
✅ One wallet for both chains
✅ Switch between networks
✅ Seamless experience
```

---

## 🎯 **Summary of Steps:**

**For Chat (30 seconds):**
1. Copy SQL above
2. Paste in Supabase SQL Editor
3. Run
4. Chat works! ✅

**For Solana (10 minutes):**
1. Go to https://beta.solpg.io
2. Create project, paste code
3. Build & Deploy
4. Initialize with house wallet
5. Create first round
6. Update frontend with program ID
7. Commit & deploy
8. Both chains operational! ✅

---

**Dev Server Running:** http://localhost:8000/arcade/luckyblock.html  
**Test Base Now:** ✅ Already working  
**Deploy Solana:** Follow steps above  

