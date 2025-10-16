# 🚀 Solana Integration - Quick Start Guide

## ✅ What's Already Done

- ✅ Solana dependencies installed (@solana/web3.js, wallet-adapter)
- ✅ Multi-chain wallet adapter created (`lib/wallet/multi-chain.ts`)
- ✅ Chain selector UI component (`components/ChainSelector.tsx`)
- ✅ Solana connection utilities (`lib/solana/connection.ts`)
- ✅ CoinToss Solana program template (`solana/programs/cointoss/lib.rs`)

---

## 🎯 Integration Strategy: PARALLEL SUPPORT

**Best approach:** Keep Base working, add Solana as option

### **Benefits:**
- ⚡ Solana: 400ms transactions, $0.0001 fees
- 🔵 Base: Existing users, ETH liquidity
- 🦄 Phantom: Works on BOTH chains (one wallet!)
- 📈 Reach both ecosystems

---

## 🔧 Next Steps to Complete

### **1. Install Solana CLI (Local Development)**

**Windows:**
```powershell
# Download and install from:
https://github.com/solana-labs/solana/releases/latest

# Or use WSL:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

**Verify:**
```bash
solana --version
solana config get  # Should show devnet as default
```

### **2. Install Anchor Framework**

```bash
# Install AVM (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install latest Anchor
avm install latest
avm use latest

# Verify
anchor --version  # Should show 0.30.0 or later
```

### **3. Set Up Solana Wallet**

```bash
# Create new wallet for deployment
solana-keygen new --outfile ~/.config/solana/devnet.json

# Set it as default
solana config set --keypair ~/.config/solana/devnet.json

# Switch to devnet for testing
solana config set --url devnet

# Get some SOL for testing
solana airdrop 2
```

### **4. Initialize Anchor Workspace**

```bash
cd solana
anchor init basement-arcade
cd basement-arcade

# Copy our program code
cp ../programs/cointoss/lib.rs programs/basement-arcade/src/lib.rs
cp ../programs/cointoss/Cargo.toml programs/basement-arcade/Cargo.toml
```

### **5. Build & Test**

```bash
# Build program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy
```

---

## 🎨 Frontend Integration

### **Add Chain Selector to LuckyBlock:**

```html
<!-- Add near the top of luckyblock.html -->
<div id="chain-selector" class="chain-selector-container">
    <div class="chain-label">NETWORK:</div>
    <button id="chain-base" class="chain-btn active" onclick="switchToBase()">
        <span class="chain-icon">🔵</span> BASE
    </button>
    <button id="chain-solana" class="chain-btn" onclick="switchToSolana()">
        <span class="chain-icon">☀️</span> SOLANA
    </button>
</div>
```

### **Add Solana Support to Wallet Connection:**

```javascript
let currentChain = 'base'; // or 'solana'
let solanaWallet = null;
let solanaConnection = null;

// Update Phantom connection
async function connectPhantom() {
    if (currentChain === 'solana') {
        // Connect to Solana
        const resp = await window.phantom.solana.connect();
        solanaWallet = resp.publicKey;
        solanaConnection = new solanaWeb3.Connection(
            'https://api.mainnet-beta.solana.com',
            'confirmed'
        );
        
        // Show balance in SOL
        const balance = await solanaConnection.getBalance(solanaWallet);
        const balanceSOL = balance / solanaWeb3.LAMPORTS_PER_SOL;
        
        showToast(`Connected! Balance: ${balanceSOL.toFixed(4)} SOL`, 'success');
    } else {
        // Connect to Base (existing code)
        // ... your existing Phantom ETH connection
    }
}
```

---

## 🔗 Include Solana Web3.js in HTML

```html
<!-- Add before ethers.js -->
<script src="https://cdn.jsdelivr.net/npm/@solana/web3.js@latest/lib/index.iife.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/ethers@6.10.0/dist/ethers.umd.min.js"></script>
<script>
    // Both libraries now available:
    const solanaWeb3 = window.solanaWeb3; // Solana
    const ethers = window.ethers; // Ethereum/Base
</script>
```

---

## 🎮 Game Flow on Solana

### **CoinToss Example:**

```javascript
// 1. Create game
const tx = await program.methods
    .createGame(new BN(betAmount))
    .accounts({
        game: gamePDA,
        player: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    })
    .rpc();

// 2. Join game
const tx2 = await program.methods
    .joinGame()
    .accounts({
        game: gamePDA,
        player: wallet2.publicKey,
        systemProgram: SystemProgram.programId,
    })
    .rpc();

// 3. Resolve (determine winner)
const tx3 = await program.methods
    .resolveGame()
    .accounts({
        game: gamePDA,
        house: houseWallet,
        player1: player1.publicKey,
        player2: player2.publicKey,
        systemProgram: SystemProgram.programId,
    })
    .rpc();
```

---

## 💡 Recommended Implementation Order

### **Week 1: Foundation**
1. ✅ Install dependencies (DONE)
2. ✅ Create multi-chain wallet adapter (DONE)
3. ✅ Create Solana utilities (DONE)
4. 🔄 Install Solana CLI & Anchor
5. 🔄 Initialize Anchor workspace

### **Week 2: First Game**
1. Build CoinToss program
2. Test on Devnet
3. Deploy to Devnet
4. Update frontend for Solana CoinToss
5. Test end-to-end

### **Week 3: Expand**
1. Port LuckyBlock to Solana
2. Add chain selector UI
3. Full multi-chain support
4. Deploy to Mainnet

---

## 🦄 Phantom Wallet Advantage

**One wallet, two chains!**

```javascript
// Solana mode
window.phantom.solana.connect()

// Ethereum/Base mode
window.phantom.ethereum.request({ method: 'eth_requestAccounts' })
```

**This means users can:**
- Use same wallet for both networks
- Switch between chains easily
- One recovery phrase

---

## 📊 Multi-Chain Dashboard

### **Display Both Balances:**
```
┌─────────────────────────────────┐
│ Wallet: 0x0F03...5B03           │
│                                  │
│ 🔵 Base:   0.0104 ETH (~$27)    │
│ ☀️ Solana: 2.45 SOL (~$350)     │
│                                  │
│ Network: [BASE] | SOLANA         │
└─────────────────────────────────┘
```

---

## 🚨 Important Notes

### **For Devnet Testing:**
```bash
# Get free SOL for testing
solana airdrop 2

# Check balance
solana balance

# Switch between networks
solana config set --url devnet
solana config set --url mainnet-beta
```

### **For Mainnet:**
- Need real SOL for deployment (~2-5 SOL)
- Need SOL for rent-exempt accounts
- Test EVERYTHING on devnet first

---

## 📋 Current Status

| Task | Status |
|------|--------|
| Install @solana/web3.js | ✅ Done |
| Multi-chain wallet adapter | ✅ Done |
| Chain selector component | ✅ Done |
| Solana utilities | ✅ Done |
| CoinToss program template | ✅ Done |
| Install Solana CLI | ⏳ Your turn |
| Install Anchor | ⏳ Your turn |
| Build & deploy program | ⏳ Next |
| Frontend integration | ⏳ Next |

---

## 🎯 Want Me to Continue?

I can automatically:
1. Create the full LuckyBlock Solana program (Rust)
2. Add Solana CDN to luckyblock.html
3. Create chain switcher UI
4. Implement dual-chain betting system
5. Update chat for multi-chain

**Or you can:**
1. Install Solana CLI yourself
2. Test locally
3. Let me know when ready for next phase

---

**Let me know if you want me to continue building out the Solana integration!** 🚀

