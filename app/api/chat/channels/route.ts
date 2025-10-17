import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// In-memory cache for channels (5 minute TTL)
const channelCache: { data: any[], timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now();
    if (channelCache && (now - channelCache.timestamp) < CACHE_TTL) {
      return NextResponse.json(
        { success: true, channels: channelCache.data },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache-Status': 'HIT'
          }
        }
      );
    }

    // Fetch from database
    const { data: channels, error } = await supabase
      .from('Channel')
      .select('id, name, slug, description, createdAt, createdBy, chain')
      .order('createdAt', { ascending: false })
      .limit(50); // Limit to prevent huge responses

    if (error) {
      console.error('Error fetching channels:', error);
      return NextResponse.json(
        { error: 'Failed to fetch channels', details: error.message },
        { status: 500 }
      );
    }

    // Update cache
    if (channelCache) {
      channelCache.data = channels || [];
      channelCache.timestamp = now;
    }

    return NextResponse.json(
      { success: true, channels },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache-Status': 'MISS'
        }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/chat/channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Edge runtime for faster cold starts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes
