import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getWalletFromSession } from '@/lib/forum/auth';

const prisma = new PrismaClient();

/**
 * GET /api/forum/boards
 * List all boards
 */
export async function GET(req: NextRequest) {
  try {
    const boards = await prisma.board.findMany({
      where: { isHidden: false },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        about: true,
        _count: {
          select: { threads: true },
        },
      },
    });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/forum/boards
 * Create a new board (any connected wallet can create)
 */
export async function POST(req: NextRequest) {
  try {
    // For demo/testing: allow board creation without strict wallet auth
    // In production, integrate with your existing wallet auth system
    const wallet = getWalletFromSession(req) || 'demo-user';
    
    console.log('[Forum] Create board request from:', wallet);

    const body = await req.json();
    const { slug, title, about } = body;

    // Validate required fields
    if (!slug || !title) {
      return NextResponse.json(
        { error: 'Slug and title are required' },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric, no spaces)
    const slugRegex = /^[a-z0-9]+$/;
    if (!slugRegex.test(slug.toLowerCase())) {
      return NextResponse.json(
        { error: 'Slug must be alphanumeric (a-z, 0-9) with no spaces' },
        { status: 400 }
      );
    }

    // Check if board already exists
    const exists = await prisma.board.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (exists) {
      return NextResponse.json(
        { error: 'Board with this slug already exists' },
        { status: 409 }
      );
    }

    // Create the board
    const newBoard = await prisma.board.create({
      data: {
        slug: slug.toLowerCase(),
        title: title.trim(),
        about: about?.trim() || null,
      },
    });

    console.log(`New board created: /${newBoard.slug}/ by wallet ${wallet}`);

    return NextResponse.json({ board: newBoard }, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

