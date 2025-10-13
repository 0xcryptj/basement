import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import { generateAnonId, getWalletFromSession } from '@/lib/forum/auth';
import { generateTripcode } from '@/lib/forum/tripcode';
import { sanitizeText, sanitizeSubject, containsSuspiciousContent } from '@/lib/forum/sanitize';
import { isRateLimited, getRateLimitReset } from '@/lib/forum/ratelimit';
import { uploadImageWithThumb } from '@/lib/forum/storage';
import { CONFIG } from '@/lib/forum/constants';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import { TOKEN_CONFIG } from '@/lib/token-config';

const prisma = new PrismaClient();

// Create a public client for Base network
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

/**
 * GET /api/forum/threads?board=slug&page=n
 * List threads for a board
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const boardSlug = searchParams.get('board');
    const page = parseInt(searchParams.get('page') || '1');

    if (!boardSlug) {
      return NextResponse.json(
        { error: 'Board slug required' },
        { status: 400 }
      );
    }

    // Find board
    const board = await prisma.board.findUnique({
      where: { slug: boardSlug },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Get threads with pagination
    const threads = await prisma.thread.findMany({
      where: { boardId: board.id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: [
        { isSticky: 'desc' },
        { bumpAt: 'desc' },
      ],
      take: CONFIG.THREADS_PER_PAGE,
      skip: (page - 1) * CONFIG.THREADS_PER_PAGE,
    });

    // Get total count
    const totalCount = await prisma.thread.count({
      where: { boardId: board.id },
    });

    const totalPages = Math.ceil(totalCount / CONFIG.THREADS_PER_PAGE);

    return NextResponse.json({
      threads,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        perPage: CONFIG.THREADS_PER_PAGE,
      },
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/forum/threads
 * Create a new thread
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Get wallet from session
    const wallet = getWalletFromSession(req);
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not connected' },
        { status: 401 }
      );
    }

    // TOKEN GATE: Check if wallet holds minimum required tokens
    try {
      const balance = await publicClient.readContract({
        address: TOKEN_CONFIG.address as Address,
        abi: TOKEN_CONFIG.abi,
        functionName: 'balanceOf',
        args: [wallet as Address],
      });

      const minRequired = BigInt(TOKEN_CONFIG.requirements.createThread);
      
      if (balance < minRequired) {
        const requiredFormatted = (Number(minRequired) / 1e18).toFixed(6);
        const userBalance = (Number(balance) / 1e18).toFixed(6);
        
        return NextResponse.json(
          { 
            error: 'Insufficient token balance',
            message: `You need at least ${requiredFormatted} $BASEMENT tokens to create a thread. Your balance: ${userBalance}`,
            required: requiredFormatted,
            balance: userBalance,
            tokenAddress: TOKEN_CONFIG.address,
            buyLinks: {
              dexScreener: TOKEN_CONFIG.links.dexScreener,
              geckoterminal: TOKEN_CONFIG.links.geckoterminal,
            }
          },
          { status: 403 }
        );
      }
    } catch (tokenError) {
      console.error('Error checking token balance:', tokenError);
      return NextResponse.json(
        { error: 'Failed to verify token holdings. Please try again.' },
        { status: 500 }
      );
    }

    // Generate anon ID
    const anonId = generateAnonId(wallet);

    // Check rate limit
    if (isRateLimited(anonId)) {
      const resetIn = getRateLimitReset(anonId);
      return NextResponse.json(
        { error: `Rate limited. Try again in ${resetIn} seconds` },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const boardSlug = formData.get('boardSlug') as string;
    const subject = formData.get('subject') as string | null;
    const text = formData.get('text') as string;
    const tripString = formData.get('trip') as string | null;
    const imageFile = formData.get('image') as File | null;
    const showAddress = formData.get('showAddress') === 'true';

    // Validate required fields
    if (!boardSlug || !text) {
      return NextResponse.json(
        { error: 'Board and text required' },
        { status: 400 }
      );
    }

    // Find board
    const board = await prisma.board.findUnique({
      where: { slug: boardSlug },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Sanitize input
    const sanitizedText = sanitizeText(text);
    const sanitizedSubject = sanitizeSubject(subject);

    // Check for suspicious content
    if (containsSuspiciousContent(sanitizedText)) {
      return NextResponse.json(
        { error: 'Suspicious content detected' },
        { status: 400 }
      );
    }

    // Generate tripcode if provided
    const tripSig = tripString ? generateTripcode(tripString) : null;

    // Handle image upload
    let opImageUrl: string | null = null;
    let opThumbUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      // Validate image size
      if (imageFile.size > CONFIG.IMAGE_MAX_BYTES) {
        return NextResponse.json(
          { error: `Image too large. Max size: ${CONFIG.IMAGE_MAX_MB}MB` },
          { status: 400 }
        );
      }

      // Validate MIME type
      if (!CONFIG.ACCEPTED_MIME.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Invalid image type' },
          { status: 400 }
        );
      }

      // Upload image
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const { imageUrl, thumbUrl } = await uploadImageWithThumb(
        buffer,
        imageFile.type,
        imageFile.name
      );

      opImageUrl = imageUrl;
      opThumbUrl = thumbUrl;
    }

    // Determine display name
    const displayAnonId = showAddress ? wallet : anonId;

    // Create thread
    const thread = await prisma.thread.create({
      data: {
        boardId: board.id,
        subject: sanitizedSubject,
        opText: sanitizedText,
        opImageUrl,
        opThumbUrl,
        anonId: displayAnonId,
        tripSig,
      },
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

