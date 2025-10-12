import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - List all public channels
export async function GET(request: NextRequest) {
  try {
    const channels = await prisma.channel.findMany({
      where: { isPrivate: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            messages: true,
            members: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      channels: channels.map(ch => ({
        id: ch.id,
        name: ch.name,
        slug: ch.slug,
        description: ch.description,
        messageCount: ch._count.messages,
        memberCount: ch._count.members,
        createdAt: ch.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new channel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, walletAddress, isPrivate = false } = body;

    // Validation
    if (!name || !slug || !walletAddress) {
      return NextResponse.json(
        { error: 'Name, slug, and wallet address are required' },
        { status: 400 }
      );
    }

    // Check if slug is valid
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if channel already exists
    const existing = await prisma.channel.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Channel already exists' },
        { status: 409 }
      );
    }

    // Create channel
    const channel = await prisma.channel.create({
      data: {
        name,
        slug,
        description,
        isPrivate,
        createdBy: walletAddress
      }
    });

    return NextResponse.json({
      success: true,
      channel: {
        id: channel.id,
        name: channel.name,
        slug: channel.slug,
        description: channel.description,
        createdAt: channel.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

