#!/bin/bash
# Vercel Environment Variable Setup Script
# Run this to configure all environment variables in Vercel

echo "🚀 Setting up Vercel environment variables..."

# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://dpfuunbmiwdlmnlxpahk.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk0OTQsImV4cCI6MjA3NTc1NTQ5NH0.eqfGpQ9BW-nBaTR9pGglbsd26JSZvkJjsyZqZJh2pd0"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE3OTQ5NCwiZXhwIjoyMDc1NzU1NDk0fQ.p5BsoZm9edQo7yI60iiT0giJLimOp2zv97Cnsi1wbdA"

# Database URLs
vercel env add DATABASE_URL production <<< "postgresql://postgres.dpfuunbmiwdlmnlxpahk:3NNPfu2FSWu9h5IJ@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
vercel env add DIRECT_URL production <<< "postgresql://postgres:3NNPfu2FSWu9h5IJ@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres"

# App Configuration
vercel env add NODE_ENV production <<< "production"
vercel env add SERVER_SALT production <<< "basement_crypto_salt_2024_CHANGE_THIS"
vercel env add ADMIN_WALLETS production <<< "0xYourWalletAddressHere"
vercel env add NEXT_PUBLIC_BASE_RPC_URL production <<< "https://mainnet.base.org"
vercel env add NEXT_PUBLIC_STORAGE_BUCKET production <<< "forum-images"
vercel env add CHAT_RETENTION_DAYS production <<< "30"

echo "✅ Environment variables configured!"
echo "🔄 Redeploying..."
vercel --prod

