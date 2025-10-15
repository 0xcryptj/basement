# 🔑 Wallet Addresses - The Basement Arcade

## 📋 **Official Wallet Addresses**

### **House Wallet (Revenue Collection)**
```
0x5Da407f983e0f11B3f7F67Acd64877b42B22068D
```
- **Purpose:** Receives all house fees from games (5% of each bet)
- **Set in:** All smart contracts (hardcoded in constructor)
- **Receives:** 
  - 5% from all Lucky Block bets
  - 5% from all CoinToss games  
  - 5% from all Connect4 games
  - 5% from all War games
  - 80% of affiliate fees (20% goes to referrer)

### **Deployment Wallet (Contract Deployment)**
```
0x22B33DbF8c4a07d37E86A8Bcc7dC156D6ecBe220
```
- **Purpose:** Used to deploy all smart contracts to Base mainnet
- **Deployed Contracts:**
  - LuckyBlock: `0x3041638a8a4393c13ad1A7E4173741e183518EB1`
  - CoinToss: `0xE5Bb0d6cD62BaE2EE4ece101D46B64C737385BE2`
  - Connect4: `0x959812ed75211C6e9e2376bc61a6d2B832954B2e`
  - War: `0x267540F44ceAAB3e854e8e6944B1d68Ff5c9BD60`
- **Cost:** ~0.08 ETH in deployment gas fees
- **Status:** Contracts deployed and verified on Basescan

---

## 🎮 **Deployed Smart Contracts on Base Mainnet**

### **Lucky Block (Jackpot Game)** ✅
```
Contract: 0x3041638a8a4393c13ad1A7E4173741e183518EB1
Network: Base Mainnet (Chain ID: 8453)
Status: LIVE & FUNCTIONAL
Features: Variable bet amounts, weighted probability, 60s timer
```
- **View on Basescan:** https://basescan.org/address/0x3041638a8a4393c13ad1A7E4173741e183518EB1
- **Verification:** `npx hardhat verify --network base 0x3041638a8a4393c13ad1A7E4173741e183518EB1`

### **Coin Toss (PvP)** ✅
```
Contract: 0xE5Bb0d6cD62BaE2EE4ece101D46B64C737385BE2
Network: Base Mainnet
Status: Deployed (needs frontend integration)
Features: Commit-reveal, provably fair
```
- **View on Basescan:** https://basescan.org/address/0xE5Bb0d6cD62BaE2EE4ece101D46B64C737385BE2
- **Verification:** `npx hardhat verify --network base 0xE5Bb0d6cD62BaE2EE4ece101D46B64C737385BE2 1800`

### **Connect 4 (PvP)** ✅
```
Contract: 0x959812ed75211C6e9e2376bc61a6d2B832954B2e
Network: Base Mainnet
Status: Deployed (needs frontend integration)
Features: On-chain game logic, 7x6 board
```
- **View on Basescan:** https://basescan.org/address/0x959812ed75211C6e9e2376bc61a6d2B832954B2e
- **Verification:** `npx hardhat verify --network base 0x959812ed75211C6e9e2376bc61a6d2B832954B2e`

### **War (Card Battle PvP)** ✅
```
Contract: 0x267540F44ceAAB3e854e8e6944B1d68Ff5c9BD60
Network: Base Mainnet
Status: Deployed (needs frontend integration)
Features: Commit-reveal, highest card wins
```
- **View on Basescan:** https://basescan.org/address/0x267540F44ceAAB3e854e8e6944B1d68Ff5c9BD60
- **Verification:** `npx hardhat verify --network base 0x267540F44ceAAB3e854e8e6944B1d68Ff5c9BD60 1800`

---

## 💰 **Fee Structure**

### **All Games:**
- **Player Fee:** 5% of bet amount
- **House Share:** 100% of fee (or 80% if referral)
- **Affiliate Share:** 20% of fee (if referred)

### **Example Breakdown (0.1 ETH bet):**
```
Player bets:     0.1 ETH
House fee (5%):  0.005 ETH
To pot (95%):    0.095 ETH

If referred:
  - Affiliate:   0.001 ETH (20% of fee)
  - House:       0.004 ETH (80% of fee)
```

---

## 🔐 **Security & Access**

### **House Wallet:**
- ✅ Immutable (set in constructor, cannot be changed)
- ✅ Receives fees automatically via smart contract
- ✅ No admin functions needed
- ✅ All transactions transparent on-chain

### **Deployment Wallet:**
- ✅ Used only for deploying contracts
- ✅ Has owner privileges on contracts (for emergency functions)
- ⚠️ Private key stored securely in `.env` (never committed to git)
- ⚠️ Keep separate from main/house wallet for security

---

## 📊 **Revenue Tracking**

### **To Monitor House Wallet Revenue:**

**Via Basescan:**
```
Visit: https://basescan.org/address/0x5Da407f983e0f11B3f7F67Acd64877b42B22068D
View: All incoming transactions from game contracts
```

**Via Smart Contract:**
```javascript
// Get global stats from Lucky Block
const luckyBlock = new ethers.Contract(
    '0x3041638a8a4393c13ad1A7E4173741e183518EB1',
    ['function getGlobalStats() view returns (uint256,uint256,uint256,uint256,uint256)'],
    provider
);

const [totalWagered, rounds, players, currentRound, active] = await luckyBlock.getGlobalStats();
console.log('Total wagered:', ethers.formatEther(totalWagered), 'ETH');
// House earned = totalWagered * 0.05 (5%)
```

---

## 🚀 **Live Status**

### **Production Site:**
- **URL:** https://thebasement.wtf
- **Status:** ✅ LIVE ON BASE MAINNET
- **Lucky Block:** Fully functional with real ETH
- **Other Games:** Contracts deployed, frontend integration pending

### **What's Working Now:**
✅ Lucky Block - Full PvP jackpot with variable bets  
✅ Blockchain-synced 60-second timer  
✅ Real wager tracking and display  
✅ Personal stats (rounds played/won)  
✅ Global stats dashboard  
✅ Live chat integration  
✅ Multi-wallet support (MetaMask, Coinbase, Phantom)  

### **Next Steps:**
⏳ Integrate Coin Toss frontend  
⏳ Integrate Connect4 frontend  
⏳ Integrate War frontend  
⏳ Verify all contracts on Basescan  

---

## 📝 **Important Notes**

1. **NEVER share or commit private keys**
   - The `.env` file contains the deployment wallet private key
   - It's in `.gitignore` and should NEVER be committed

2. **House Wallet Security**
   - Keep house wallet private key in secure cold storage
   - Only use for withdrawing accumulated fees
   - Never used for day-to-day operations

3. **Deployment Wallet**
   - Only needed for contract deployments and upgrades
   - Has owner privileges on contracts
   - Keep separate from operational wallets

4. **Contract Verification**
   - All contracts should be verified on Basescan for transparency
   - Users can audit the code and fee structure
   - Builds trust in the platform

5. **Monitoring**
   - Check house wallet balance regularly on Basescan
   - Monitor contract interactions
   - Track gas costs and optimize if needed

---

## 🔗 **Quick Links**

### **Basescan (Block Explorer):**
- House Wallet: https://basescan.org/address/0x5Da407f983e0f11B3f7F67Acd64877b42B22068D
- Deployment Wallet: https://basescan.org/address/0x22B33DbF8c4a07d37E86A8Bcc7dC156D6ecBe220
- Lucky Block Contract: https://basescan.org/address/0x3041638a8a4393c13ad1A7E4173741e183518EB1

### **Project:**
- GitHub: https://github.com/0xcryptj/basement
- Production Site: https://thebasement.wtf
- Arcade: https://thebasement.wtf/arcade/luckyblock.html

---

**Last Updated:** October 15, 2025
**Network:** Base Mainnet (Chain ID: 8453)
**Deployer:** 0x22B3...e220
**House:** 0x5Da4...068D

