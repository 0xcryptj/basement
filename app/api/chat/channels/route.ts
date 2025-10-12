import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all public channels
export async function GET(request: NextRequest) {
  try {
    const { data: channels, error } = await supabase
      .from('Channel')
      .select('id, name, slug, description, createdAt')
      .eq('isPrivate', false)
      .order('createdAt', { ascending: true });

    if (error) {
      console.error('Error fetching channels:', error);
      return NextResponse.json(
        { error: 'Failed to fetch channels', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      channels: channels || []
    });

  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
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
    const { data: existing } = await supabase
      .from('Channel')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Channel already exists' },
        { status: 409 }
      );
    }

    // Create channel
    const { data: channel, error: channelError } = await supabase
      .from('Channel')
      .insert({
        name,
        slug,
        description,
        isPrivate,
        createdBy: walletAddress
      })
      .select()
      .single();

    if (channelError) {
      console.error('Error creating channel:', channelError);
      return NextResponse.json(
        { error: 'Failed to create channel', details: channelError.message },
        { status: 500 }
      );
    }

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
      { error: 'Failed to create channel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

