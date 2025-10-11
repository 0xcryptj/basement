# ⚡ Supabase Quick Setup - 2 SQL Scripts

Run these **2 SQL scripts** in Supabase SQL Editor, in order:

---

## 🔹 STEP 1: Create All Tables (Run First!)

**File:** `supabase/CREATE_ALL_TABLES.sql`

**What it does:** Creates all database tables (Board, Thread, Post, User, Channel, Message, Transaction, Vote, Admin, Ban)

### How to run:

1. Go to **https://dpfuunbmiwdlmnlxpahk.supabase.co**
2. Click **"SQL Editor"** (left sidebar, has `</>` icon)
3. Click **"New query"**
4. Open file `supabase/CREATE_ALL_TABLES.sql` in your editor
5. **Copy ALL** (Ctrl+A, Ctrl+C)
6. **Paste** into SQL Editor (Ctrl+V)
7. Click **"Run"** (or Ctrl+Enter)
8. Wait for **"Success"** message
9. ✅ Tables created!

---

## 🔹 STEP 2: Apply Security Policies (Run Second!)

**File:** `supabase/RUN_THIS_IN_SUPABASE.sql`

**What it does:** Enables Row Level Security, sets up permissions, adds indexes

### How to run:

1. Still in SQL Editor, click **"New query"** again
2. Open file `supabase/RUN_THIS_IN_SUPABASE.sql`
3. **Copy ALL** (Ctrl+A, Ctrl+C)
4. **Paste** into SQL Editor (Ctrl+V)
5. Click **"Run"** (or Ctrl+Enter)
6. Wait for **"Success"** message
7. ✅ Security enabled!

---

## 🎯 That's It!

After running both scripts, your Supabase is fully set up with:

✅ All database tables created
✅ Row Level Security enabled
✅ Public read access (forum/chat visible to all)
✅ API-only write access (secure)
✅ Performance indexes
✅ Message cleanup function

---

## 📦 Next: Create Storage Bucket

1. In Supabase, click **"Storage"** (left sidebar)
2. Click **"Create a new bucket"**
3. **Name:** `forum-images`
4. **Public:** Toggle ON ✅
5. Click **"Create"**
6. ✅ Done!

Storage policies will be handled automatically by your app code.

---

## 🚀 Then Deploy!

After these 3 quick tasks (2 SQL scripts + 1 bucket):

1. Add environment variables to Vercel
2. Redeploy
3. ✅ You're live!

**Full deployment checklist:** See `FINAL_DEPLOYMENT_STEPS.md`

