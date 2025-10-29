# 🏗️ The Basement - Project Structure

## ✅ Correct Directory Structure

```
basement/                          ← Parent folder (ignore this)
└── basement/                      ← YOUR PROJECT ROOT (work here!)
    ├── app/                       ← BACKEND: Next.js API Routes + React Components
    │   ├── api/                   
    │   │   ├── auth/              ← Authentication endpoints
    │   │   │   ├── nonce/
    │   │   │   │   └── route.ts   ← GET /api/auth/nonce
    │   │   │   └── verify/
    │   │   │       └── route.ts   ← POST /api/auth/verify
    │   │   ├── chat/              ← Chat API endpoints
    │   │   └── forum/             ← Forum API endpoints
    │   ├── forum/                 ← Forum pages (React)
    │   ├── layout.tsx             ← Root layout with providers
    │   ├── page.tsx               ← Home (redirects to static)
    │   └── providers.tsx          ← OnchainKit + Wagmi providers
    │
    ├── public/                    ← FRONTEND: Static HTML/JS/CSS
    │   ├── arcade/                ← All arcade games (HTML+JS)
    │   │   ├── arcade.html
    │   │   ├── cointoss.html
    │   │   ├── connect4-game.html
    │   │   ├── chess.html
    │   │   └── *.js files
    │   ├── index.html             ← Main site (static)
    │   ├── script.js              ← Main app logic
    │   ├── style.css              ← Main styles
    │   └── base-signin-test.html  ← Auth testing page
    │
    ├── components/                ← React components
    ├── lib/                       ← Shared utilities
    ├── prisma/                    ← Database schema
    ├── server/                    ← Backend server (future)
    ├── config/                    ← App configuration
    └── package.json               ← Main dependencies
```

---

## 🚀 How to Run (IMPORTANT!)

### ❌ WRONG (Running Sharp Shot server):
```bash
cd C:\Users\Arbis\OneDrive\Desktop\basement
npm run dev  # ← This runs the wrong project!
```

### ✅ CORRECT (Running The Basement):
```bash
cd C:\Users\Arbis\OneDrive\Desktop\basement\basement
npm run dev  # ← This runs The Basement!
```

---

## 🎯 Your Dynamic App Architecture

### Frontend (Static HTML + JavaScript)
```
public/
├── index.html              ← Main entry point
├── script.js               ← Dynamic wallet auth, chat, forum
├── arcade/*.html           ← All games
└── base-signin-test.html   ← Auth testing
```

**Features:**
- ✅ Sign in with Base (wallet authentication)
- ✅ Persistent sessions (localStorage + server verification)
- ✅ Real-time chat (Supabase realtime)
- ✅ Dynamic forum (database-backed)
- ✅ Wagering system (smart contracts)
- ✅ User profiles saved
- ✅ Chat history persisted

### Backend (Next.js API Routes)
```
app/api/
├── auth/
│   ├── nonce/route.ts      ← Generate auth nonces
│   └── verify/route.ts     ← Verify wallet signatures
├── chat/                   ← Chat endpoints
└── forum/                  ← Forum endpoints
```

**Features:**
- ✅ Wallet signature verification (Viem)
- ✅ Session management
- ✅ Database operations (Prisma + Supabase)
- ✅ Real-time subscriptions
- ✅ API rate limiting
- ✅ Security validation

---

## 💾 Database (Supabase - Already Dynamic!)

Your app uses Supabase for persistent storage:

### Tables:
- `users` - User profiles and wallet addresses
- `channels` - Chat channels
- `messages` - Chat message history
- `forum_categories` - Forum categories
- `forum_posts` - Forum threads
- `forum_replies` - Thread replies
- `wagers` - Game wagering records

**Features:**
- ✅ Persistent user logins
- ✅ Chat history saved
- ✅ Forum posts stored
- ✅ Wager tracking
- ✅ Real-time subscriptions

---

## 🔐 Dynamic Authentication Flow

### 1. User Clicks "Sign in with Base"
```javascript
// public/script.js
app.signInWithBase()
  ↓
Fetch nonce from /api/auth/nonce
  ↓
wallet_connect with SIWE
  ↓
Send signature to /api/auth/verify
  ↓
Backend verifies + creates session
  ↓
User is authenticated! ✅
  ↓
Session persists across reloads
```

### 2. Session Persistence
```javascript
// Saved in localStorage:
- walletAddress
- walletType
- username
- profilePic

// Verified by backend:
- Signature check (Viem)
- Nonce validation
- Session token (optional JWT)
```

### 3. Auto-Restore on Page Load
```javascript
// public/script.js - init()
restoreUserSession()
  ↓
Check localStorage
  ↓
Validate session with backend
  ↓
Re-authenticate if needed
  ↓
User stays logged in! ✅
```

---

## 🎮 Dynamic Arcade Features

### Wagering System:
```javascript
// Games talk to smart contracts
- Create wager → Store in database
- Join game → Update database
- Play game → Blockchain transaction
- Winner determined → Payout via contract
- Results saved → Database history
```

### Comments on Games:
```javascript
// Database-backed comments
POST /api/games/:gameId/comment
  ↓
Save to database
  ↓
Broadcast via WebSocket
  ↓
All users see comment instantly
```

### Live Updates:
```javascript
// Supabase realtime subscriptions
- New chat messages → Instant update
- New forum posts → Live notification
- Game results → Real-time leaderboard
- Wager status → Live tracking
```

---

## 📊 What Makes Your App Dynamic

| Feature | Static | Dynamic | Status |
|---------|--------|---------|--------|
| **User Login** | ❌ | ✅ Sign in with Base | ✅ Implemented |
| **Remember Users** | ❌ | ✅ Session persistence | ✅ Implemented |
| **Chat History** | ❌ | ✅ Supabase storage | ✅ Implemented |
| **Forum Posts** | ❌ | ✅ Database-backed | ✅ Implemented |
| **Wagering** | ❌ | ✅ Smart contracts + DB | ✅ Ready |
| **Game Comments** | ❌ | ✅ API endpoints ready | 🔧 Needs integration |
| **Real-time Updates** | ❌ | ✅ WebSocket + Supabase | ✅ Implemented |
| **User Profiles** | ❌ | ✅ Saved in DB | ✅ Implemented |

---

## 🚀 Start The Correct Server

### Option 1: From basement/basement directory
```bash
cd C:\Users\Arbis\OneDrive\Desktop\basement\basement
npm run dev
```

### Option 2: Concurrently (Frontend + Backend)
```bash
cd C:\Users\Arbis\OneDrive\Desktop\basement\basement
npm run dev  # Starts both Next.js (3000) + Backend API (3001)
```

---

## 🌐 Access Your App

Once started, your app runs on:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Auth Test**: http://localhost:3000/base-signin-test.html

---

## 📁 Clean Directory Structure

You currently have:
```
Desktop/basement/           ← Old Sharp Shot project (ignore)
Desktop/basement/basement/  ← The Basement (your project!)
```

**Always work in: `basement/basement/`** ✅

---

## ✅ Your App IS Dynamic!

Don't worry - your app has ALL the dynamic features you need:

1. ✅ **Sign in with Base** - Users login with wallet
2. ✅ **Sessions persist** - localStorage + backend verification
3. ✅ **Supabase database** - All data saved
4. ✅ **Real-time chat** - Messages sync across users
5. ✅ **Forum system** - Posts stored in database
6. ✅ **Wagering ready** - Smart contract integration
7. ✅ **User profiles** - Saved and remembered
8. ✅ **API endpoints** - Full backend architecture

The HTML+JS approach doesn't mean "static" - it means **fast, lightweight, and dynamic**! Your Supabase integration and Next.js API routes handle all the backend logic.

