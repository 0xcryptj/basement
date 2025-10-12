import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch messages for a channel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelSlug = searchParams.get('channel') || 'basement';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Find channel
    const channel = await prisma.channel.findUnique({
      where: { slug: channelSlug }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        channelId: channel.id,
        isDeleted: false
      },
      include: {
        user: {
          select: {
            username: true,
            walletAddress: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      messages: messages.reverse(),
      channel: {
        id: channel.id,
        name: channel.name,
        slug: channel.slug
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    console.log('📨 POST /api/chat/messages - Request received');
    
    const body = await request.json();
    console.log('📨 Request body:', { walletAddress: body.walletAddress, contentLength: body.content?.length, channelSlug: body.channelSlug });
    
    const { walletAddress, content, channelSlug = 'basement', imageUrl } = body;

    // Validation
    if (!walletAddress || !content) {
      console.log('❌ Validation failed: missing wallet or content');
      return NextResponse.json(
        { error: 'Wallet address and content are required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      console.log('❌ Message too long:', content.length);
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      console.log('👤 Creating new user:', walletAddress);
      user = await prisma.user.create({
        data: {
          walletAddress,
          username: `User_${walletAddress.slice(0, 6)}`,
          lastSeenAt: new Date()
        }
      });
      console.log('✅ User created:', user.id);
    } else {
      console.log('👤 User exists:', user.id);
      // Update last seen
      await prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() }
      });
    }

    // Find or create channel
    let channel = await prisma.channel.findUnique({
      where: { slug: channelSlug }
    });

    if (!channel) {
      console.log('📢 Creating new channel:', channelSlug);
      channel = await prisma.channel.create({
        data: {
          name: `#${channelSlug}`,
          slug: channelSlug,
          description: `${channelSlug} channel`,
          createdBy: walletAddress
        }
      });
      console.log('✅ Channel created:', channel.id);
    } else {
      console.log('📢 Channel exists:', channel.id);
    }

    // Create message
    console.log('💬 Creating message...');
    const message = await prisma.message.create({
      data: {
        channelId: channel.id,
        userId: user.id,
        content,
        imageUrl
      },
      include: {
        user: {
          select: {
            username: true,
            walletAddress: true,
            avatarUrl: true
          }
        }
      }
    });

    console.log('✅ Message created:', message.id);

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        imageUrl: message.imageUrl,
        createdAt: message.createdAt,
        user: {
          username: message.user.username,
          walletAddress: message.user.walletAddress
        }
      }
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send message', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

