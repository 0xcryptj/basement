import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateAnonId, getWalletFromSession } from '@/lib/forum/auth';

const prisma = new PrismaClient();

/**
 * POST /api/forum/vote
 * Vote on a post (upvote/downvote)
 */
export async function POST(req: NextRequest) {
  try {
    // Get wallet from session
    const wallet = getWalletFromSession(req);
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not connected' },
        { status: 401 }
      );
    }

    // Generate anon ID
    const anonId = generateAnonId(wallet);

    const body = await req.json();
    const { postId, isLike } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Handle vote removal (null)
    if (isLike === null) {
      // Remove existing vote
      const existingVote = await prisma.vote.findUnique({
        where: {
          postId_anonId: {
            postId,
            anonId,
          },
        },
      });

      if (existingVote) {
        await prisma.vote.delete({
          where: {
            postId_anonId: {
              postId,
              anonId,
            },
          },
        });

        // Update post counters
        if (existingVote.isLike) {
          await prisma.post.update({
            where: { id: postId },
            data: { likes: { decrement: 1 } },
          });
        } else {
          await prisma.post.update({
            where: { id: postId },
            data: { dislikes: { decrement: 1 } },
          });
        }
      }
    } else {
      // Create or update vote
      const existingVote = await prisma.vote.findUnique({
        where: {
          postId_anonId: {
            postId,
            anonId,
          },
        },
      });

      if (existingVote) {
        // Change vote
        if (existingVote.isLike !== isLike) {
          await prisma.vote.update({
            where: {
              postId_anonId: {
                postId,
                anonId,
              },
            },
            data: { isLike },
          });

          // Update counters
          if (isLike) {
            // Changed from dislike to like
            await prisma.post.update({
              where: { id: postId },
              data: {
                likes: { increment: 1 },
                dislikes: { decrement: 1 },
              },
            });
          } else {
            // Changed from like to dislike
            await prisma.post.update({
              where: { id: postId },
              data: {
                likes: { decrement: 1 },
                dislikes: { increment: 1 },
              },
            });
          }
        }
      } else {
        // New vote
        await prisma.vote.create({
          data: {
            postId,
            anonId,
            isLike,
          },
        });

        // Update counters
        if (isLike) {
          await prisma.post.update({
            where: { id: postId },
            data: { likes: { increment: 1 } },
          });
        } else {
          await prisma.post.update({
            where: { id: postId },
            data: { dislikes: { increment: 1 } },
          });
        }
      }
    }

    // Get updated post
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: true,
        dislikes: true,
      },
    });

    return NextResponse.json({
      likes: updatedPost?.likes || 0,
      dislikes: updatedPost?.dislikes || 0,
    });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

