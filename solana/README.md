# 🌟 The Basement - Solana Programs

## Overview
Solana programs (smart contracts) for The Basement arcade games.

---

## 🎮 Games on Solana

### **Planned Programs:**
1. **LuckyBlock** - Multi-player jackpot (Anchor program)
2. **CoinToss** - PvP coin flip
3. **War** - Card battle game
4. **Connect4** - Board game

---

## 🛠️ Development Setup

### **Prerequisites:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor (Solana framework)
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
```

### **Verify Installation:**
```bash
solana --version
anchor --version
rustc --version
```

---

## 🚀 Quick Start

### **Initialize Anchor Project:**
```bash
cd solana
anchor init luckyblock
cd luckyblock
```

### **Build Program:**
```bash
anchor build
```

### **Test:**
```bash
anchor test
```

### **Deploy to Devnet:**
```bash
anchor deploy --provider.cluster devnet
```

### **Deploy to Mainnet:**
```bash
anchor deploy --provider.cluster mainnet
```

---

## 📁 Structure

```
solana/
├── luckyblock/              # LuckyBlock game program
│   ├── programs/
│   │   └── luckyblock/
│   │       ├── src/
│   │       │   └── lib.rs   # Main program logic
│   │       └── Cargo.toml
│   ├── tests/
│   │   └── luckyblock.ts    # Program tests
│   ├── Anchor.toml          # Anchor config
│   └── package.json
│
├── cointoss/                # CoinToss PvP
└── programs.md              # Program documentation
```

---

## 💰 Economics (Same as Base)

- **House Fee:** 5%
- **To Pot:** 95%
- **Affiliate:** 20% of fee (if referred)

---

## 🔐 Security

### **Anchor Built-in Security:**
- ✅ Account validation
- ✅ Ownership checks
- ✅ PDA (Program Derived Address) safety
- ✅ Integer overflow protection

### **Custom Security:**
- Reentrancy checks
- Rate limiting
- Signer validation

---

## 🌐 Networks

### **Devnet (Testing):**
- RPC: https://api.devnet.solana.com
- Faucet: https://faucet.solana.com
- Explorer: https://explorer.solana.com/?cluster=devnet

### **Mainnet (Production):**
- RPC: https://api.mainnet-beta.solana.com
- Explorer: https://explorer.solana.com

---

## 📊 Comparison: Ethereum vs Solana

| Feature | Base (ETH) | Solana |
|---------|------------|--------|
| **Tx Speed** | ~2 seconds | ~400ms ⚡ |
| **Tx Cost** | ~$0.01 | ~$0.0001 💰 |
| **Language** | Solidity | Rust |
| **Framework** | Hardhat | Anchor |
| **Accounts** | State in contract | PDAs |
| **Randomness** | blockhash | Switchboard VRF |

---

## 🎯 Next Steps

1. Install Solana CLI & Anchor
2. Initialize first program (LuckyBlock or CoinToss)
3. Port game logic from Solidity to Rust
4. Test on Devnet
5. Deploy to Mainnet

---

**Status:** 🟡 In Progress
**Target:** Full multi-chain support (Base + Solana)

