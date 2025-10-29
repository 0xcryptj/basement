# 🚀 Starting The Basement Server

## ⚠️ IMPORTANT: Always Use The Correct Directory!

You have two folders with similar names:
```
❌ Desktop/basement/           ← OLD (Sharp Shot project - ignore!)
✅ Desktop/basement/basement/  ← CORRECT (The Basement - your project!)
```

---

## 🎯 How to Start The Server

### Step 1: Navigate to the CORRECT directory
```bash
cd C:\Users\Arbis\OneDrive\Desktop\basement\basement
```

### Step 2: Start the dev server
```bash
npm run dev
```

### Step 3: Open your browser
- **Frontend**: http://localhost:3000
- **Auth Test**: http://localhost:3000/base-signin-test.html

---

## 🔍 How to Know You're in the Right Place

### ✅ Correct Directory Signs:
```bash
pwd
# Should show: C:\Users\Arbis\OneDrive\Desktop\basement\basement

ls
# Should see: app/, public/, package.json, next.config.js
```

### ❌ Wrong Directory Signs:
```bash
# If you see "SHARP SHOT" in terminal output
# If server runs on port 5000
# If you're in .../Desktop/basement (without the second /basement)
```

---

## 🎮 Your Server Ports

| Service | Port | URL |
|---------|------|-----|
| **Next.js Frontend** | 3000 | http://localhost:3000 |
| **Backend API** | 3001 | http://localhost:3001 |
| **API Routes** | 3000 | http://localhost:3000/api/* |

---

## 📝 Quick Commands Reference

### Start Development:
```bash
# Always cd to the correct directory first!
cd C:\Users\Arbis\OneDrive\Desktop\basement\basement
npm run dev
```

### Database Commands:
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:seed        # Seed forum data
```

### Build for Production:
```bash
npm run build
npm start
```

---

## 🐛 Troubleshooting

### Problem: "SHARP SHOT SERVER" appears
**Solution**: You're in the wrong directory!
```bash
cd C:\Users\Arbis\OneDrive\Desktop\basement\basement  # Add the extra /basement
npm run dev
```

### Problem: Server won't start
**Solution**: Kill all Node processes and try again
```bash
taskkill /F /IM node.exe
cd C:\Users\Arbis\OneDrive\Desktop\basement\basement
npm run dev
```

### Problem: Port already in use
**Solution**: Change the port or kill the process
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /F /PID <process_id>
```

---

## ✅ Expected Terminal Output

When you run `npm run dev` from the CORRECT directory, you should see:

```
> the-basement@1.0.0 dev
> concurrently "npm run dev:frontend" "npm run dev:backend"

[0] > the-basement@1.0.0 dev:frontend
[0] > next dev -p 3000
[1] > basement-backend@1.0.0 dev
[1] > tsx watch index.ts
[0]    ▲ Next.js 15.x.x
[0]    - Local:        http://localhost:3000
[1] 🎮 The Basement Backend Server
[1] 📡 Running on http://localhost:3001
[0] ✓ Starting...
[0] ✓ Ready in 2s
```

**NO mention of "Sharp Shot" anywhere!**

---

## 📚 Architecture Overview

Your app is **FULLY DYNAMIC** with:

### Backend (Next.js API + Server):
```typescript
app/api/auth/nonce/     ← Generates nonces
app/api/auth/verify/    ← Verifies signatures
app/api/chat/           ← Chat endpoints  
app/api/forum/          ← Forum endpoints
server/index.ts         ← WebSocket server
```

### Frontend (HTML + JS with Dynamic Data):
```javascript
public/script.js
- Sign in with Base        ← Wallet authentication
- Session management       ← Remember users
- Real-time chat          ← Supabase realtime
- Forum interactions      ← API calls to backend
- Wager creation          ← Smart contract calls
- Profile management      ← Database storage
```

### Database (Supabase):
```sql
- users table             ← Store user profiles
- messages table          ← Chat history
- forum_posts table       ← Forum content
- channels table          ← Chat channels
- wagers table            ← Game wagering records
```

---

## 🎯 Your App's Dynamic Features

1. **Login System** ✅
   - Sign in with Base wallet
   - Session persists across page reloads
   - Backend verification with Viem

2. **User Management** ✅
   - Profiles saved to database
   - Usernames and avatars
   - Wallet address linking

3. **Real-time Chat** ✅
   - Messages stored in Supabase
   - Realtime subscriptions
   - Chat history loaded on login

4. **Forum System** ✅
   - Posts saved to database
   - Comments and replies
   - Categories and threads

5. **Wagering** ✅
   - Smart contract integration
   - Wager records in database
   - Transaction history

6. **Game Comments** 🔧
   - API endpoints ready
   - Need to connect to UI

---

## 🎨 Hybrid Architecture Benefits

You get the **best of both worlds**:

### Static HTML/JS Advantages:
- ⚡ **Fast loading** - No React bundle overhead
- 🎮 **Arcade games work independently** - Each game is standalone
- 📱 **Mobile optimized** - Lightweight, responsive
- 🔧 **Easy to maintain** - Simple file structure

### Dynamic Backend Advantages:
- 🔐 **Secure authentication** - Server-side verification
- 💾 **Data persistence** - Database storage
- 🔄 **Real-time updates** - WebSocket + Supabase
- 📊 **API flexibility** - Next.js API routes
- 🎯 **Scalable** - Can add features easily

---

**Your app is ALREADY dynamic and production-ready!** 🎉

Just make sure to always run from the correct directory:
```bash
cd C:\Users\Arbis\OneDrive\Desktop\basement\basement
npm run dev
```

