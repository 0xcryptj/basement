import { PrismaClient } from '@prisma/client';
import { CONFIG } from './constants';

const prisma = new PrismaClient();

/**
 * Bump a thread (update bumpAt timestamp)
 * Only bumps if:
 * - sage is false
 * - thread is not locked
 * - thread has not reached bump limit
 */
export async function bumpThread(
  threadId: string,
  sage: boolean = false
): Promise<void> {
  if (sage) {
    // Don't bump if sage is enabled
    return;
  }

  try {
    // Get thread with post count
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!thread) {
      console.error('Thread not found for bumping:', threadId);
      return;
    }

    // Don't bump if locked
    if (thread.isLocked) {
      return;
    }

    // Don't bump if over bump limit
    if (thread._count.posts >= CONFIG.BUMP_LIMIT) {
      return;
    }

    // Update bumpAt timestamp
    await prisma.thread.update({
      where: { id: threadId },
      data: { bumpAt: new Date() },
    });
  } catch (error) {
    console.error('Error bumping thread:', error);
    throw error;
  }
}

/**
 * Get bump order for threads (sticky first, then by bumpAt)
 */
export function getBumpOrderClause() {
  return {
    isSticky: 'desc' as const,
    bumpAt: 'desc' as const,
  };
}

