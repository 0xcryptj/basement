/**
 * Cleanup Old Messages Script
 * 
 * Automatically deletes or marks messages older than CHAT_RETENTION_DAYS
 * Run this script periodically (e.g., daily cron job)
 * 
 * Usage:
 *   npm run cleanup-messages
 * 
 * Or with custom retention days:
 *   CHAT_RETENTION_DAYS=7 npm run cleanup-messages
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RETENTION_DAYS = parseInt(process.env.CHAT_RETENTION_DAYS || '30');
const HARD_DELETE_DAYS = RETENTION_DAYS * 2; // 60 days by default

async function cleanupOldMessages() {
  console.log(`🧹 Starting message cleanup...`);
  console.log(`📅 Retention period: ${RETENTION_DAYS} days`);
  console.log(`🗑️  Hard delete after: ${HARD_DELETE_DAYS} days`);

  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - RETENTION_DAYS);

  const hardDeleteDate = new Date();
  hardDeleteDate.setDate(hardDeleteDate.getDate() - HARD_DELETE_DAYS);

  try {
    // Step 1: Mark old messages as deleted (soft delete)
    const softDeleted = await prisma.message.updateMany({
      where: {
        createdAt: {
          lt: retentionDate,
        },
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        content: '[Message deleted due to retention policy]',
        imageUrl: null, // Remove image references
      },
    });

    console.log(`📝 Soft deleted ${softDeleted.count} messages older than ${RETENTION_DAYS} days`);

    // Step 2: Hard delete very old messages
    const hardDeleted = await prisma.message.deleteMany({
      where: {
        createdAt: {
          lt: hardDeleteDate,
        },
        isDeleted: true,
      },
    });

    console.log(`🗑️  Hard deleted ${hardDeleted.count} messages older than ${HARD_DELETE_DAYS} days`);

    // Step 3: Get statistics
    const totalMessages = await prisma.message.count();
    const activeMessages = await prisma.message.count({
      where: { isDeleted: false },
    });
    const deletedMessages = await prisma.message.count({
      where: { isDeleted: true },
    });

    console.log(`\n📊 Message Statistics:`);
    console.log(`   Total: ${totalMessages}`);
    console.log(`   Active: ${activeMessages}`);
    console.log(`   Soft Deleted: ${deletedMessages}`);

    console.log(`\n✨ Cleanup complete!`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupOldMessages()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

