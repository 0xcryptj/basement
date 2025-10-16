# 🔧 How to Fix Chat Database in Supabase

## ⚠️ CRITICAL: Run this to make chat work!

---

## Method 1: Supabase Dashboard (EASIEST)

### Step 1: Login to Supabase
1. Go to: https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: **The Basement**

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button

### Step 3: Copy & Paste SQL
1. Open file: `supabase/FIX_CHAT_TABLES.sql`
2. Copy **ALL** contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** button (or press F5)

### Step 4: Verify Success
You should see output like:
```
NOTICE: ✅ Chat database fixed successfully!
NOTICE: ✅ All tables created
NOTICE: ✅ RLS policies configured
NOTICE: ✅ Default channels created
NOTICE: ✅ Ready for production use
```

---

## Method 2: Using psql Command Line

### Connection String Format:
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:[PORT]/postgres"
```

### Get Your Connection String:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"Settings"** → **"Database"**
4. Copy **"Connection string"** under **"Connection pooling"**
5. Replace `[YOUR-PASSWORD]` with your actual password

### Run the Fix:
```bash
# Navigate to project
cd C:\Users\joarb\OneDrive\Desktop\Basement

# Run the SQL file
psql "YOUR_CONNECTION_STRING" -f supabase/FIX_CHAT_TABLES.sql
```

---

## Method 3: Using Node.js Script

Create a file `fix-chat-db.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  try {
    const sql = fs.readFileSync('supabase/FIX_CHAT_TABLES.sql', 'utf8');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Database fixed successfully!');
    }
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

fixDatabase();
```

Then run:
```bash
node fix-chat-db.js
```

---

## Verify Everything Works

After running the SQL, verify with these queries:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('User', 'Channel', 'Message');
-- Should return 3 rows

-- Check channels created
SELECT * FROM "Channel";
-- Should show: luckyblock, basement, arcade

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('User', 'Channel', 'Message');
-- All should show: t (true)

-- Check policies
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('User', 'Channel', 'Message');
-- Should show multiple policies
```

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Solution:** Tables already exist. Drop them first or ignore the error.

### Error: "permission denied"
**Solution:** Make sure you're using the SERVICE_ROLE_KEY, not the anon key.

### Error: "connection refused"
**Solution:** Check your connection string and make sure Supabase project is active.

### Chat still not working after running SQL
1. Clear browser cache (Ctrl + Shift + R)
2. Restart dev server: `npm run dev`
3. Check browser console for errors
4. Verify environment variables are set

---

## Environment Variables Required

Make sure these are in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```

Get these from: https://supabase.com/dashboard → Your Project → Settings → API

---

## Quick Test After Fix

1. Go to: http://localhost:8000/arcade/luckyblock.html
2. Connect your wallet
3. Type a message in chat
4. Press Enter
5. Message should appear ✅

---

## Need Help?

### Check Supabase Logs:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"Logs"** → **"Postgres Logs"**
4. Look for errors

### Check API Logs:
1. Open browser console (F12)
2. Go to Network tab
3. Send a message
4. Check the `/api/chat/messages` request
5. Look at response

---

**🎯 Most Important:** Just use Method 1 (Supabase Dashboard) - it's the easiest and most reliable!

