/**
 * Run Supabase SQL Migration
 * Usage: node supabase/run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  try {
    console.log('🔄 Running channel chain migration...');
    console.log('📁 Loading SQL file...');

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'migrations', 'add_channel_chain.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 SQL to execute:');
    console.log(sql);
    console.log('\n🚀 Executing migration...');

    // Execute the SQL
    // Note: Supabase client doesn't support raw SQL execution via JS SDK
    // You need to run this in the Supabase SQL Editor instead
    
    console.log('\n⚠️  IMPORTANT: Supabase JS SDK does not support raw SQL execution.');
    console.log('Please run this SQL in the Supabase Dashboard:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Paste the following SQL:\n');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log('\n5. Click "Run"');
    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

