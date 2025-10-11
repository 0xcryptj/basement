import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getWalletFromSession, isAdmin } from '@/lib/forum/auth';
import { deleteImage } from '@/lib/forum/storage';

const prisma = new PrismaClient();

/**
 * POST /api/forum/mod
 * Moderation actions (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Get wallet from session
    const wallet = getWalletFromSession(req);
    if (!wallet) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if admin
    const adminStatus = await isAdmin(wallet);
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, targetId, reason, expiresAt } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'deleteThread':
        if (!targetId) {
          return NextResponse.json(
            { error: 'Thread ID required' },
            { status: 400 }
          );
        }

        // Get thread to delete images
        const thread = await prisma.thread.findUnique({
          where: { id: targetId },
          include: { posts: true },
        });

        if (thread) {
          // Delete thread images
          if (thread.opImageUrl) {
            await deleteImage(thread.opImageUrl, thread.opThumbUrl || undefined);
          }

          // Delete post images
          for (const post of thread.posts) {
            if (post.imageUrl) {
              await deleteImage(post.imageUrl, post.thumbUrl || undefined);
            }
          }

          // Delete thread (cascade will delete posts)
          await prisma.thread.delete({
            where: { id: targetId },
          });
        }

        result = { message: 'Thread deleted' };
        break;

      case 'deletePost':
        if (!targetId) {
          return NextResponse.json(
            { error: 'Post ID required' },
            { status: 400 }
          );
        }

        // Get post to delete images
        const post = await prisma.post.findUnique({
          where: { id: targetId },
        });

        if (post) {
          // Delete images
          if (post.imageUrl) {
            await deleteImage(post.imageUrl, post.thumbUrl || undefined);
          }

          // Delete post
          await prisma.post.delete({
            where: { id: targetId },
          });
        }

        result = { message: 'Post deleted' };
        break;

      case 'sticky':
        if (!targetId) {
          return NextResponse.json(
            { error: 'Thread ID required' },
            { status: 400 }
          );
        }

        await prisma.thread.update({
          where: { id: targetId },
          data: { isSticky: true },
        });

        result = { message: 'Thread stickied' };
        break;

      case 'unsticky':
        if (!targetId) {
          return NextResponse.json(
            { error: 'Thread ID required' },
            { status: 400 }
          );
        }

        await prisma.thread.update({
          where: { id: targetId },
          data: { isSticky: false },
        });

        result = { message: 'Thread unstickied' };
        break;

      case 'lock':
        if (!targetId) {
          return NextResponse.json(
            { error: 'Thread ID required' },
            { status: 400 }
          );
        }

        await prisma.thread.update({
          where: { id: targetId },
          data: { isLocked: true },
        });

        result = { message: 'Thread locked' };
        break;

      case 'unlock':
        if (!targetId) {
          return NextResponse.json(
            { error: 'Thread ID required' },
            { status: 400 }
          );
        }

        await prisma.thread.update({
          where: { id: targetId },
          data: { isLocked: false },
        });

        result = { message: 'Thread unlocked' };
        break;

      case 'ban':
        const { walletAddr, anonId, ipHash } = body;

        if (!walletAddr && !anonId && !ipHash) {
          return NextResponse.json(
            { error: 'Ban target required (wallet, anonId, or ipHash)' },
            { status: 400 }
          );
        }

        if (!reason) {
          return NextResponse.json(
            { error: 'Ban reason required' },
            { status: 400 }
          );
        }

        await prisma.ban.create({
          data: {
            walletAddr: walletAddr || null,
            anonId: anonId || null,
            ipHash: ipHash || null,
            reason,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
          },
        });

        result = { message: 'Ban created' };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error performing mod action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

