/**
 * Cleanup Expired Messages Script
 * 
 * Automatically deletes messages that have passed their expiration time:
 * - Anonymous user messages: expire after 5 minutes
 * - Authenticated user messages: expire after 30 days
 * 
 * Run this script periodically (e.g., every 5 minutes via cron job)
 * 
 * Usage:
 *   npm run cleanup-messages
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupExpiredMessages() {
  console.log(`🧹 Starting expired message cleanup...`);
  const now = new Date();
  console.log(`🕐 Current time: ${now.toISOString()}`);

  try {
    // Step 1: Delete expired messages (hard delete)
    const { data: expiredMessages, error: fetchError } = await supabase
      .from('Message')
      .select('id, content, createdAt, expiresAt, user:User!Message_userId_fkey(walletAddress)')
      .not('expiresAt', 'is', null)
      .lte('expiresAt', now.toISOString());

    if (fetchError) {
      console.error('❌ Error fetching expired messages:', fetchError);
      throw fetchError;
    }

    console.log(`📝 Found ${expiredMessages?.length || 0} expired messages`);

    if (expiredMessages && expiredMessages.length > 0) {
      // Delete expired messages
      const { error: deleteError, count } = await supabase
        .from('Message')
        .delete()
        .not('expiresAt', 'is', null)
        .lte('expiresAt', now.toISOString());

      if (deleteError) {
        console.error('❌ Error deleting messages:', deleteError);
        throw deleteError;
      }

      console.log(`🗑️  Deleted ${count || 0} expired messages`);
    }

    // Step 2: Get statistics
    const { count: totalMessages, error: countError1 } = await supabase
      .from('Message')
      .select('*', { count: 'exact', head: true });

    const { count: activeMessages, error: countError2 } = await supabase
      .from('Message')
      .select('*', { count: 'exact', head: true })
      .eq('isDeleted', false);

    const { count: expiringSoon, error: countError3 } = await supabase
      .from('Message')
      .select('*', { count: 'exact', head: true })
      .not('expiresAt', 'is', null)
      .lte('expiresAt', new Date(now.getTime() + 10 * 60 * 1000).toISOString()); // Expires within 10 minutes

    console.log(`\n📊 Message Statistics:`);
    console.log(`   Total: ${totalMessages || 0}`);
    console.log(`   Active: ${activeMessages || 0}`);
    console.log(`   Expiring soon (next 10 min): ${expiringSoon || 0}`);

    console.log(`\n✨ Cleanup complete!`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupExpiredMessages()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });

