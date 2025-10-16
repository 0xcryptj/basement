# 🗄️ Database Migration Guide

## ✅ **Add Channel Chain Support**

### **What This Migration Does:**
- Adds `chain` column to Channel table ('base' or 'solana')
- Adds `burnTxSignature` column for Solana burn proofs
- Sets default chain to 'base'
- Creates index for chain queries
- Adds constraint to validate chain values

---

## 🚀 **How to Run the Migration**

### **Option 1: Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Select Your Project**

3. **Navigate to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

4. **Copy and Paste This SQL:**
   ```sql
   -- Add chain support to Channel table
   ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "chain" TEXT DEFAULT 'base';
   ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "burnTxSignature" TEXT;

   -- Create index for chain queries
   CREATE INDEX IF NOT EXISTS "Channel_chain_idx" ON "Channel"("chain");

   -- Add check constraint for valid chains
   ALTER TABLE "Channel" ADD CONSTRAINT "Channel_chain_check" CHECK ("chain" IN ('base', 'solana'));
   ```

5. **Click "Run" (or press Ctrl+Enter)**

6. **Verify Success:**
   - You should see "Success. No rows returned"
   - Check the "Channel" table structure to confirm new columns

---

### **Option 2: Using psql Command Line**

If you have direct database access:

```bash
# Connect to your database
psql "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require"

# Run the migration file
\i prisma/migrations/add_channel_chain.sql

# Verify
\d "Channel"
```

---

### **Option 3: Using Node.js Script**

```bash
# Run the migration helper script
node supabase/run-migration.js
```

**Note:** This script will display the SQL for you to copy/paste into Supabase Dashboard, as the Supabase JS SDK doesn't support raw SQL execution.

---

## 🔍 **Verify Migration**

### **Check Table Structure:**

Run this in Supabase SQL Editor:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Channel';
```

**Expected Output:**
```
column_name      | data_type | column_default
-----------------|-----------|---------------
id               | text      | 
name             | text      | 
slug             | text      | 
description      | text      | 
createdBy        | text      | 
createdAt        | timestamp | now()
chain            | text      | 'base'
burnTxSignature  | text      | NULL
```

---

### **Test the Constraint:**

```sql
-- This should work (valid chain)
INSERT INTO "Channel" (id, name, slug, chain, "createdBy") 
VALUES ('test1', 'Test Base', 'test-base', 'base', 'test_wallet');

INSERT INTO "Channel" (id, name, slug, chain, "createdBy") 
VALUES ('test2', 'Test Solana', 'test-sol', 'solana', 'test_wallet');

-- This should fail (invalid chain)
INSERT INTO "Channel" (id, name, slug, chain, "createdBy") 
VALUES ('test3', 'Test Invalid', 'test-bad', 'ethereum', 'test_wallet');
-- Error: new row for relation "Channel" violates check constraint "Channel_chain_check"

-- Clean up test data
DELETE FROM "Channel" WHERE id IN ('test1', 'test2', 'test3');
```

---

## 🔄 **Rollback (If Needed)**

If you need to undo this migration:

```sql
-- Remove the constraint
ALTER TABLE "Channel" DROP CONSTRAINT IF EXISTS "Channel_chain_check";

-- Remove the index
DROP INDEX IF EXISTS "Channel_chain_idx";

-- Remove the columns
ALTER TABLE "Channel" DROP COLUMN IF EXISTS "burnTxSignature";
ALTER TABLE "Channel" DROP COLUMN IF EXISTS "chain";
```

---

## 📝 **Connection String Format**

If you need the connection string for direct access:

```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require
```

**Where to Find:**
1. Go to Supabase Dashboard
2. Click your project
3. Go to Settings → Database
4. Under "Connection string" → "URI"
5. Replace `[YOUR-PASSWORD]` with your actual password

**Example:**
```
postgresql://postgres.abc123:MyP@ssw0rd@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

---

## ✅ **Post-Migration Checklist**

- [ ] Migration executed successfully
- [ ] `chain` column exists with default 'base'
- [ ] `burnTxSignature` column exists
- [ ] Index created on `chain` column
- [ ] Constraint validates only 'base' or 'solana'
- [ ] Existing channels have chain='base'
- [ ] Test creating Base channel (free)
- [ ] Test creating Solana channel (with burn)

---

## 🐛 **Troubleshooting**

### **Error: "relation 'Channel' does not exist"**
**Solution:** Your Channel table hasn't been created yet. Run your main Prisma migrations first:
```bash
npx prisma db push
```

### **Error: "permission denied"**
**Solution:** Make sure you're using the SERVICE_ROLE_KEY, not the ANON_KEY.

### **Error: "constraint already exists"**
**Solution:** The migration has already been run. You can safely ignore this if the columns exist.

---

## 📊 **Migration File Location**

```
prisma/migrations/add_channel_chain.sql
```

**Contents:**
```sql
-- Add chain support to Channel table
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "chain" TEXT DEFAULT 'base';
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "burnTxSignature" TEXT;

-- Create index for chain queries
CREATE INDEX IF NOT EXISTS "Channel_chain_idx" ON "Channel"("chain");

-- Add check constraint for valid chains
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_chain_check" CHECK ("chain" IN ('base', 'solana'));
```

---

## 🎯 **Summary**

**Purpose:** Add multi-chain support to channels  
**Changes:** 2 new columns + 1 index + 1 constraint  
**Breaking:** No (backwards compatible)  
**Time:** ~1 second  
**Status:** ✅ Ready to run

**Recommended Method:** Copy SQL into Supabase Dashboard SQL Editor

---

**Created:** 2025-10-16  
**Status:** ✅ Ready to execute

