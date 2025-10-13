import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateAnonId, getWalletFromSession } from '@/lib/forum/auth';
import { generateTripcode } from '@/lib/forum/tripcode';
import { sanitizeText, containsSuspiciousContent } from '@/lib/forum/sanitize';
import { isRateLimited, getRateLimitReset } from '@/lib/forum/ratelimit';
import { uploadImageWithThumb } from '@/lib/forum/storage';
import { bumpThread } from '@/lib/forum/bump';
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
 * GET /api/forum/posts?thread=id&page=n
 * Get posts for a thread
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('thread');
    const page = parseInt(searchParams.get('page') || '1');

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID required' },
        { status: 400 }
      );
    }

    // Get posts with pagination
    const posts = await prisma.post.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      take: CONFIG.POSTS_PER_PAGE,
      skip: (page - 1) * CONFIG.POSTS_PER_PAGE,
    });

    // Get total count
    const totalCount = await prisma.post.count({
      where: { threadId },
    });

    const totalPages = Math.ceil(totalCount / CONFIG.POSTS_PER_PAGE);

    return NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        perPage: CONFIG.POSTS_PER_PAGE,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/forum/posts
 * Create a reply to a thread
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

    // TOKEN GATE: Check if wallet holds minimum required tokens
    try {
      const balance = await publicClient.readContract({
        address: TOKEN_CONFIG.address as Address,
        abi: TOKEN_CONFIG.abi,
        functionName: 'balanceOf',
        args: [wallet as Address],
      }) as bigint;

      const minRequired = BigInt(TOKEN_CONFIG.requirements.createPost);
      
      if (balance < minRequired) {
        const requiredFormatted = (Number(minRequired) / 1e18).toFixed(6);
        const userBalance = (Number(balance) / 1e18).toFixed(6);
        
        return NextResponse.json(
          { 
            error: 'Insufficient token balance',
            message: `You need at least ${requiredFormatted} $BASEMENT tokens to create a post. Your balance: ${userBalance}`,
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
    const threadId = formData.get('threadId') as string;
    const text = formData.get('text') as string;
    const tripString = formData.get('trip') as string | null;
    const sage = formData.get('sage') === 'true';
    const imageFile = formData.get('image') as File | null;
    const showAddress = formData.get('showAddress') === 'true';

    // Validate required fields
    if (!threadId || !text) {
      return NextResponse.json(
        { error: 'Thread ID and text required' },
        { status: 400 }
      );
    }

    // Check if thread exists and is not locked
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Thread is locked' },
        { status: 403 }
      );
    }

    // Sanitize input
    const sanitizedText = sanitizeText(text);

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
    let imageUrl: string | null = null;
    let thumbUrl: string | null = null;

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
      const result = await uploadImageWithThumb(
        buffer,
        imageFile.type,
        imageFile.name
      );

      imageUrl = result.imageUrl;
      thumbUrl = result.thumbUrl;
    }

    // Determine display name
    const displayAnonId = showAddress ? wallet : anonId;

    // Create post
    const post = await prisma.post.create({
      data: {
        threadId,
        text: sanitizedText,
        imageUrl,
        thumbUrl,
        anonId: displayAnonId,
        tripSig,
        sage,
      },
    });

    // Bump thread if not sage
    if (!sage) {
      await bumpThread(threadId, sage);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

