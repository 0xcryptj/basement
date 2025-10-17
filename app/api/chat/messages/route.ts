import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { broadcastMessage } from '@/lib/realtime/pusher-server';

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

    console.log('📥 Fetching messages for channel:', channelSlug);

    // Find channel
    const { data: channel, error: channelError } = await supabase
      .from('Channel')
      .select('id, name, slug')
      .eq('slug', channelSlug)
      .single();

    if (channelError || !channel) {
      console.log('❌ Channel not found, returning empty messages');
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

    // Fetch messages with user data
    const { data: messages, error: messagesError } = await supabase
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
      .order('createdAt', { ascending: true })
      .limit(limit);

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

    // Find or create user
    let { data: user, error: userFindError } = await supabase
      .from('User')
      .select('id, username, walletAddress')
      .eq('walletAddress', effectiveWallet)
      .single();

    if (!user) {
      console.log('👤 Creating new user:', effectiveWallet);
      const newUserId = generateId();
      const { data: newUser, error: userCreateError } = await supabase
        .from('User')
        .insert({
          id: newUserId,
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
      await supabase
        .from('User')
        .update({ lastSeenAt: new Date().toISOString() })
        .eq('id', user!.id);
    }

    // Find or create channel
    let { data: channel, error: channelFindError } = await supabase
      .from('Channel')
      .select('id, name, slug')
      .eq('slug', channelSlug)
      .single();

    if (!channel) {
      console.log('📢 Creating new channel:', channelSlug);
      const newChannelId = generateId();
      const { data: newChannel, error: channelCreateError } = await supabase
        .from('Channel')
        .insert({
          id: newChannelId,
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

    // Create message
    console.log('💬 Creating message...');
    const newMessageId = generateId();
    const { data: message, error: messageError } = await supabase
      .from('Message')
      .insert({
        id: newMessageId,
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

           const responseData = {
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
           };

           // Broadcast to WebSocket (non-blocking)
           broadcastMessage(channelSlug, responseData.message).catch(err => 
             console.error('Broadcast failed:', err)
           );

           return NextResponse.json(responseData);

         } catch (error) {
    console.error('❌ Error sending message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send message', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

