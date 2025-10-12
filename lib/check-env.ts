/**
 * Environment Variable Validation
 * Run this to check if all required env vars are set
 */

export function checkEnvVariables() {
  const required = {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missing: string[] = [];
  const present: string[] = [];

  Object.entries(required).forEach(([key, value]) => {
    if (!value || value === '') {
      missing.push(key);
    } else {
      present.push(key);
      console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
    }
  });

  if (missing.length > 0) {
    console.error('\n❌ MISSING ENVIRONMENT VARIABLES:');
    missing.forEach(key => {
      console.error(`   - ${key}`);
    });
    console.error('\n📝 Add these to your .env file or Vercel dashboard');
    console.error('See .vercel-env-setup.txt for values\n');
    return false;
  }

  console.log('\n✅ All required environment variables are set!\n');
  
  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('postgres')) {
    console.warn('⚠️  DATABASE_URL does not appear to be a PostgreSQL connection string');
  }
  
  if (dbUrl && dbUrl.includes('pooler.supabase.com:6543')) {
    console.log('✅ Using Supabase connection pooler (recommended for serverless)');
  } else if (dbUrl && dbUrl.includes(':5432')) {
    console.warn('⚠️  Using direct connection - consider using pooler for Vercel');
  }
  
  return true;
}

// Run check if this file is executed directly
if (require.main === module) {
  checkEnvVariables();
}

