# 🚀 Solana Programs Deployment Guide

## 🏠 House Wallet Configuration

### **Base Network (Existing):**
```
Address: 0x5Da407f983e0f11B3f7F67Acd64877b42B22068D
Network: Base Mainnet (Chain ID: 8453)
Purpose: Receives 5% fees from all bets
```

### **Solana Network (New):**
```
Address: [Generate Solana keypair]
Network: Solana Mainnet
Purpose: Same - receives 5% fees from all bets
```

**Note:** Solana and Ethereum use different address formats, so you'll need a separate Solana wallet for the house.

---

## 📦 Programs to Deploy

### **1. LuckyBlock (Priority 1)**
- File: `solana/programs/luckyblock/lib.rs`
- Features: Same as Base contract
  - Min 2 players to start
  - Max 20 players
  - 60-second timer after 2nd player joins
  - 5% house fee
  - Weighted probability
  - Variable bet amounts

### **2. CoinToss (Priority 2)**
- File: `solana/programs/cointoss/lib.rs`
- Features: PvP coin flip
  - 2 players required
  - 50/50 odds
  - 5% house fee

---

## 🛠️ Deployment Steps (Use Pre-Built Binaries)

### **Step 1: Install Solana CLI (Pre-Built)**

**Download Windows Installer:**
```
https://github.com/solana-labs/solana/releases/download/v2.1.7/solana-install-init-x86_64-pc-windows-msvc.exe
```

**Or use package manager:**
```powershell
# Using Scoop
scoop install solana

# Or using Chocolatey
choco install solana
```

**Verify:**
```bash
solana --version
# Should show: solana-cli 2.1.7
```

### **Step 2: Create Solana Wallets**

**Deployment Wallet:**
```bash
solana-keygen new --outfile ~/.config/solana/deployer.json
# Save the seed phrase!
```

**House Wallet:**
```bash
solana-keygen new --outfile ~/.config/solana/house.json
# This will receive all fees
# Save the seed phrase!
```

**Set default:**
```bash
solana config set --keypair ~/.config/solana/deployer.json
solana config set --url mainnet-beta
```

### **Step 3: Fund Deployment Wallet**

**You need ~5-10 SOL for deployment:**
```bash
# Check balance
solana balance

# Get wallet address
solana address

# Buy SOL on exchange and send to this address
# Or use Phantom wallet to transfer
```

### **Step 4: Install Anchor (Pre-Built)**

**Using AVM:**
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.30.0
avm use 0.30.0
```

**Note:** If cargo install fails due to missing MSVC tools, use pre-built:
```
https://www.anchor-lang.com/docs/installation#windows
```

### **Step 5: Initialize Anchor Workspace**

```bash
cd solana
anchor init basement-games
cd basement-games

# Copy our programs
mkdir -p programs/luckyblock/src
mkdir -p programs/cointoss/src

cp ../programs/luckyblock/lib.rs programs/luckyblock/src/lib.rs
cp ../programs/luckyblock/Cargo.toml programs/luckyblock/Cargo.toml
cp ../programs/cointoss/lib.rs programs/cointoss/src/lib.rs
cp ../programs/cointoss/Cargo.toml programs/cointoss/Cargo.toml
```

### **Step 6: Update Anchor.toml**

```toml
[programs.mainnet]
luckyblock = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[provider]
cluster = "Mainnet"
wallet = "~/.config/solana/deployer.json"
```

### **Step 7: Build Programs**

```bash
anchor build
```

### **Step 8: Deploy to Devnet (Testing)**

```bash
# Switch to devnet
solana config set --url devnet

# Get devnet SOL (free)
solana airdrop 2

# Deploy
anchor deploy

# Test
anchor test
```

### **Step 9: Deploy to Mainnet**

```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Deploy (costs ~2-5 SOL)
anchor deploy

# Save program IDs!
```

### **Step 10: Update Frontend**

Update `luckyblock.html`:
```javascript
const SUPPORTED_CHAINS = {
    solana: {
        name: 'Solana',
        rpc: 'https://api.mainnet-beta.solana.com',
        contract: 'YOUR_PROGRAM_ID_HERE', // From anchor deploy
        explorer: 'https://solscan.io',
        currency: 'SOL'
    }
};
```

---

## 🔧 Alternative: Use Solana Playground (No Local Install!)

### **Deploy Without Installing Anything:**

1. Go to: https://beta.solpg.io
2. Create new Anchor project
3. Copy `luckyblock/lib.rs` into editor
4. Click "Build"
5. Connect Phantom wallet (Solana mode)
6. Click "Deploy"
7. Save program ID

**Much easier if you don't want to install Solana CLI!**

---

## 🏠 House Wallet Setup

### **After Deployment:**

1. **Initialize LuckyBlock Program:**
```javascript
const tx = await program.methods
    .initialize(new PublicKey("YOUR_HOUSE_WALLET_PUBKEY"))
    .accounts({
        gameState: gameStatePDA,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    })
    .rpc();
```

2. **Use Same House Wallet for All Programs:**
- LuckyBlock: Set in initialize()
- CoinToss: Set in initialize()
- All fees go to same Solana address

---

## 📊 Comparison: Deployment Costs

| Item | Base | Solana |
|------|------|--------|
| Contract Deploy | ~$10-20 | ~$5-10 |
| Rent (Account) | N/A | ~$0.02-0.05 |
| Transaction | $0.01 | $0.0001 |

---

## 🎯 Quick Deployment (Recommended)

### **Use Solana Playground:**
1. https://beta.solpg.io
2. New project → Anchor
3. Copy luckyblock/lib.rs
4. Build → Deploy
5. Done in 5 minutes!

### **Update Frontend:**
```javascript
// In luckyblock.html, update:
const SUPPORTED_CHAINS = {
    solana: {
        contract: 'PROGRAM_ID_FROM_PLAYGROUND'
    }
};

// Enable Solana betting:
if (newChain === 'solana') {
    document.getElementById('enter-btn').disabled = false;
    document.getElementById('enter-btn').textContent = '🎰 ENTER 🎰';
}
```

---

## ✅ Summary

**Programs Created:**
- ✅ LuckyBlock (same mechanics as Base)
- ✅ CoinToss (PvP game)

**Features (Same as Base):**
- ✅ 2 players min, 20 players max
- ✅ 60-second timer after 2nd player
- ✅ 5% house fee
- ✅ Affiliate system (20% of fee)
- ✅ Weighted probability
- ✅ Variable bet amounts

**Deployment Options:**
1. **Solana Playground** (easiest - 5 min)
2. **Local Anchor** (full control - requires setup)

**Next:**
1. Deploy programs
2. Update frontend with program IDs
3. Test on devnet
4. Deploy to mainnet
5. Enable Solana betting

---

**Recommended: Use Solana Playground for quick deployment!** 🚀

