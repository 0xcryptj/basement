import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all channels
export async function GET(request: NextRequest) {
  try {
    console.log('📢 Fetching all channels');

    const { data: channels, error } = await supabase
      .from('Channel')
      .select('id, name, slug, description, createdAt')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching channels:', error);
      return NextResponse.json(
        { error: 'Failed to fetch channels', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${channels?.length || 0} channels`);

    return NextResponse.json({
      success: true,
      channels: channels || []
    });

  } catch (error) {
    console.error('❌ Error in GET /api/chat/channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

