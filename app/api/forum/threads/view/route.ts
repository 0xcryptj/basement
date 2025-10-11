import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/forum/threads/view
 * Increment view counter for a thread
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId } = body;

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID required' },
        { status: 400 }
      );
    }

    // Increment view count
    await prisma.thread.update({
      where: { id: threadId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    // Fail silently - view tracking is not critical
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

