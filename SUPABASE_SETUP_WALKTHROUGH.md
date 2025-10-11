# 🚀 Supabase Setup - Step by Step

Follow this guide **exactly** as you create your Supabase account. I'll tell you exactly what information I need from you.

---

## Step 1: Create Your Supabase Account (2 minutes)

1. Go to **[https://supabase.com](https://supabase.com)**
2. Click **"Start your project"** (top right)
3. Sign up with one of these options:
   - ✅ **GitHub** (Recommended - easier for developers)
   - Gmail
   - Email

**✋ STOP HERE** - Once you're logged in, continue to Step 2

---

## Step 2: Create New Project (3 minutes)

You should now see the Supabase dashboard.

1. Click **"New project"** (or it may auto-prompt you)

2. **Organization**
   - If this is your first project, it will create an organization automatically
   - Name it whatever you want (e.g., "My Projects")
   - Click "Create organization" if prompted

3. **Fill in Project Details:**

   **Project Name:** (Choose one)
   - `basement-prod`
   - `the-basement`
   - Or whatever you prefer

   **Database Password:** (VERY IMPORTANT!)
   - Click "Generate a password" (recommended)
   - **📋 COPY THIS PASSWORD IMMEDIATELY**
   - **Save it in a safe place** - you'll need it soon
   - ⚠️ You can't recover this password later!

   **Region:** (Choose closest to your users)
   - US East (N. Virginia) - `us-east-1`
   - US West (Oregon) - `us-west-1`
   - EU (Frankfurt) - `eu-central-1`
   - AP (Singapore) - `ap-southeast-1`
   - Other options available

   **Pricing Plan:**
   - Select **"Free"** (perfect for getting started)
   - You can upgrade later if needed

4. Click **"Create new project"**

5. **⏳ Wait 2-3 minutes** for project initialization
   - You'll see a progress bar
   - Don't close the browser!

---

## Step 3: Get Your Credentials (5 minutes)

### 📋 I NEED THESE 5 CREDENTIALS FROM YOU:

Once your project is ready, gather these credentials:

### A. Project URL & API Keys

1. In Supabase dashboard, click **"Settings"** (gear icon, bottom left)
2. Click **"API"** in the sidebar

**Copy these 3 values:**

```
CREDENTIAL #1 - Project URL:
https://[your-project-ref].supabase.co

CREDENTIAL #2 - Anon/Public Key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (long string)

CREDENTIAL #3 - Service Role Key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (longer string)
⚠️ KEEP THIS SECRET! Never commit to Git!
```

### B. Database Connection Strings

1. Still in **Settings**, click **"Database"** in the sidebar
2. Scroll down to **"Connection string"**
3. Select **"URI"** tab

**Copy this connection string:**

```
CREDENTIAL #4 - Database URL (URI):
postgresql://postgres:[YOUR-PASSWORD]@db.[your-ref].supabase.co:5432/postgres
```

4. Now select the **"Connection pooling"** tab
5. Select **"Transaction"** mode

**Copy this connection string:**

```
CREDENTIAL #5 - Direct URL (Pooler):
postgresql://postgres.[your-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

---

## Step 4: Paste Your Credentials Here

**📋 PASTE YOUR 5 CREDENTIALS IN THIS FORMAT:**

```env
# Paste your actual values here:
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV..."
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres.xxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**⚠️ Replace `[PASSWORD]` in both URLs with your actual database password!**

---

## Step 5: I'll Configure Everything

Once you paste those 5 credentials above, I will:

1. ✅ Create your `.env` file with all credentials
2. ✅ Push your database schema (Users, Channels, Messages, Balances)
3. ✅ Set up Row Level Security policies
4. ✅ Create the image storage bucket
5. ✅ Seed initial data (channels, etc.)
6. ✅ Test the connection
7. ✅ Configure Vercel environment variables

---

## What Your Database Will Include

### 📊 Tables I'm Setting Up:

**Users Table:**
- `walletAddress` - Primary authentication (your Web3 wallet)
- `username` - Optional display name
- `balanceEth` - ETH balance (8 decimal precision)
- `balanceUsd` - USD balance (2 decimal precision)
- `avatarUrl` - Profile picture
- `isVerified` - Verification status

**Channels Table:**
- `name` - Channel name
- `slug` - URL-friendly identifier
- `description` - Channel description
- `isPrivate` - Public or private
- `maxMembers` - Member limit
- `createdBy` - Creator's wallet address

**Messages Table:**
- `content` - Message text
- `imageUrl` - Optional image
- `channelId` - Which channel
- `userId` - Who sent it
- `replyToId` - For threaded conversations

**Transactions Table:**
- `type` - deposit, withdrawal, transfer, tip
- `amount` - Transaction amount
- `currency` - ETH or USD
- `txHash` - Blockchain transaction hash
- `status` - pending, completed, failed

**Plus:**
- Forum boards, threads, posts (already configured)
- Admins, Bans, Votes

---

## Quick Checklist

Before you paste credentials, make sure you have:

- [ ] Created Supabase account
- [ ] Created new project
- [ ] **SAVED your database password** 
- [ ] Copied Project URL from API settings
- [ ] Copied Anon key from API settings
- [ ] Copied Service Role key from API settings
- [ ] Copied Database URL from Database settings
- [ ] Copied Direct/Pooler URL from Database settings
- [ ] Replaced `[YOUR-PASSWORD]` in both URLs with actual password

---

## 🔐 Security Notes

- ✅ The `.env` file is already in `.gitignore` (won't be committed)
- ✅ Anon key is safe to expose (public read-only)
- ⚠️ **Service Role key must stay secret** (full database access)
- ✅ All database operations are protected by Row Level Security
- ✅ Only API routes can write to database (not users directly)

---

## Ready? 

**Paste your 5 credentials in the format above and I'll take care of everything!**

Example format again:
```env
NEXT_PUBLIC_SUPABASE_URL="https://abcdefghij.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJ..."
DATABASE_URL="postgresql://postgres:YourActualPassword123@db.abcdefghij.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres.abcdefghij:YourActualPassword123@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

