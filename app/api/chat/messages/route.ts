import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Helper function to generate cuid-like IDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(12).toString('base64url').substring(0, 16);
  return `${timestamp}${randomPart}`;
}

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
    const after = searchParams.get('after'); // Support pagination

    console.log('📥 Fetching messages for channel:', channelSlug);

    // Find channel
    const { data: channel, error: channelError } = await supabase
      .from('Channel')
      .select('id, name, slug')
      .eq('slug', channelSlug)
      .single();

    if (channelError || !channel) {
      console.log('❌ Channel not found, returning empty messages');
      // Return empty messages instead of error - channel will be created when first message is sent
      return NextResponse.json({
        success: true,
        messages: [],
        channel: {
          id: null,
          name: `#${channelSlug}`,
          slug: channelSlug
        }
      });
    }

    // Build query for messages with user data
    let query = supabase
      .from('Message')
      .select(`
        id,
        content,
        imageUrl,
        createdAt,
        user:User!Message_userId_fkey (
          username,
          walletAddress,
          avatarUrl
        )
      `)
      .eq('channelId', channel.id)
      .eq('isDeleted', false)
      .order('createdAt', { ascending: true });

    // If 'after' parameter is provided, only fetch messages after that ID
    if (after) {
      // Get the timestamp of the 'after' message
      const { data: afterMsg } = await supabase
        .from('Message')
        .select('createdAt')
        .eq('id', after)
        .single();
        
      if (afterMsg) {
        query = query.gt('createdAt', afterMsg.createdAt);
      }
    }

    // Fetch messages
    const { data: messages, error: messagesError } = await query.limit(limit);

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError);
      return NextResponse.json({
        success: true,
        messages: [],
        channel: {
          id: channel.id,
          name: channel.name,
          slug: channel.slug
        }
      });
    }

    console.log(`✅ Fetched ${messages?.length || 0} messages`);

    return NextResponse.json({
      success: true,
      messages: messages || [],
      channel: {
        id: channel.id,
        name: channel.name,
        slug: channel.slug
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/chat/messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
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
    if (!content) {
      console.log('❌ Validation failed: missing content');
      return NextResponse.json(
        { error: 'Content is required' },
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

    // Handle anonymous users
    const isAnonymous = !walletAddress || walletAddress === 'anonymous' || !walletAddress.startsWith('0x');
    const effectiveWallet = isAnonymous ? 'anonymous' : walletAddress;
    const username = isAnonymous ? 'Anon' : `User_${walletAddress.slice(0, 6)}`;
    
    console.log('👤 User type:', isAnonymous ? 'Anonymous' : 'Authenticated');

    // Find or create user using Supabase
    let { data: user, error: userFindError } = await supabase
      .from('User')
      .select('id, username, walletAddress')
      .eq('walletAddress', effectiveWallet)
      .single();

    if (!user) {
      console.log('👤 Creating new user:', effectiveWallet);
      const newUserId = generateId(); // Generate ID manually
      const { data: newUser, error: userCreateError } = await supabase
        .from('User')
        .insert({
          id: newUserId, // Explicitly set the ID
          walletAddress: effectiveWallet,
          username: username,
          lastSeenAt: new Date().toISOString()
        })
        .select()
        .single();

      if (userCreateError || !newUser) {
        console.error('❌ Error creating user:', userCreateError);
        return NextResponse.json(
          { error: 'Failed to create user', details: userCreateError?.message || 'Unknown error' },
          { status: 500 }
        );
      }
      user = newUser;
      console.log('✅ User created:', user!.id);
    } else {
      console.log('👤 User exists:', user!.id);
      // Update last seen
      await supabase
        .from('User')
        .update({ lastSeenAt: new Date().toISOString() })
        .eq('id', user!.id);
    }

    // Find or create channel using Supabase
    let { data: channel, error: channelFindError } = await supabase
      .from('Channel')
      .select('id, name, slug')
      .eq('slug', channelSlug)
      .single();

    if (!channel) {
      console.log('📢 Creating new channel:', channelSlug);
      const newChannelId = generateId(); // Generate ID manually
      const { data: newChannel, error: channelCreateError } = await supabase
        .from('Channel')
        .insert({
          id: newChannelId, // Explicitly set the ID
          name: `#${channelSlug}`,
          slug: channelSlug,
          description: `${channelSlug} channel`,
          createdBy: effectiveWallet
        })
        .select()
        .single();

      if (channelCreateError || !newChannel) {
        console.error('❌ Error creating channel:', channelCreateError);
        return NextResponse.json(
          { error: 'Failed to create channel', details: channelCreateError?.message || 'Unknown error' },
          { status: 500 }
        );
      }
      channel = newChannel;
      console.log('✅ Channel created:', channel!.id);
    } else {
      console.log('📢 Channel exists:', channel!.id);
    }

    // Create message using Supabase
    console.log('💬 Creating message...');
    const newMessageId = generateId(); // Generate ID manually
    const { data: message, error: messageError } = await supabase
      .from('Message')
      .insert({
        id: newMessageId, // Explicitly set the ID
        channelId: channel!.id,
        userId: user!.id,
        content,
        imageUrl
      })
      .select(`
        id,
        content,
        imageUrl,
        createdAt
      `)
      .single();

    if (messageError || !message) {
      console.error('❌ Error creating message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message', details: messageError?.message || 'Unknown error' },
        { status: 500 }
      );
    }

    console.log('✅ Message created:', message.id);

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        imageUrl: message.imageUrl,
        createdAt: message.createdAt,
        user: {
          username: user!.username,
          walletAddress: user!.walletAddress
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
  }
}

