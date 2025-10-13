import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createId } from '@paralleldrive/cuid2';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import { TOKEN_CONFIG } from '@/lib/token-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Create a public client for Base network
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

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

    // Fetch messages with user data (filter out expired messages)
    const { data: messages, error: messagesError } = await supabase
      .from('Message')
      .select(`
        id,
        content,
        imageUrl,
        createdAt,
        expiresAt,
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
    
    // Filter out expired messages on the server side
    const now = new Date();
    const activeMessages = messages?.filter(msg => 
      !msg.expiresAt || new Date(msg.expiresAt) > now
    ) || [];

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

    console.log(`✅ Fetched ${activeMessages.length} active messages (${messages?.length || 0} total)`);

    return NextResponse.json({
      success: true,
      messages: activeMessages,
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

    // TOKEN GATE: Check if authenticated users hold minimum required tokens
    if (!isAnonymous && walletAddress) {
      try {
        const balance = await publicClient.readContract({
          address: TOKEN_CONFIG.address as Address,
          abi: TOKEN_CONFIG.abi,
          functionName: 'balanceOf',
          args: [walletAddress as Address],
        }) as bigint;

        const minRequired = BigInt(TOKEN_CONFIG.requirements.postMessage);
        
        if (balance < minRequired) {
          const requiredFormatted = (Number(minRequired) / 1e18).toFixed(6);
          const userBalance = (Number(balance) / 1e18).toFixed(6);
          
          console.log(`❌ Token gate failed: ${userBalance} < ${requiredFormatted}`);
          
          return NextResponse.json(
            { 
              error: 'Insufficient token balance',
              message: `You need at least ${requiredFormatted} $BASEMENT tokens to post messages. Your balance: ${userBalance}`,
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
        
        console.log('✅ Token gate passed');
      } catch (tokenError) {
        console.error('❌ Error checking token balance:', tokenError);
        return NextResponse.json(
          { error: 'Failed to verify token holdings. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Find or create user using Supabase
    let { data: user, error: userFindError } = await supabase
      .from('User')
      .select('id, username, walletAddress')
      .eq('walletAddress', effectiveWallet)
      .single();

    if (!user) {
      console.log('👤 Creating new user:', effectiveWallet);
      const now = new Date().toISOString();
      const { data: newUser, error: userCreateError } = await supabase
        .from('User')
        .insert({
          id: createId(),
          walletAddress: effectiveWallet,
          username: username,
          lastSeenAt: now,
          createdAt: now,
          updatedAt: now
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
      console.log('✅ User created:', newUser.id);
    } else {
      console.log('👤 User exists:', user.id);
      // Update last seen
      await supabase
        .from('User')
        .update({ lastSeenAt: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Type guard: At this point user must exist
    if (!user) {
      console.error('❌ User is null after creation/fetch');
      return NextResponse.json(
        { error: 'Failed to get or create user' },
        { status: 500 }
      );
    }

    // Find or create channel using Supabase
    let { data: channel, error: channelFindError } = await supabase
      .from('Channel')
      .select('id, name, slug')
      .eq('slug', channelSlug)
      .single();

    if (!channel) {
      // Anonymous users cannot create new channels
      if (isAnonymous) {
        console.log('❌ Anonymous users cannot create channels');
        return NextResponse.json(
          { error: 'Channel not found. Anonymous users cannot create channels. Please connect your wallet or use an existing channel.' },
          { status: 403 }
        );
      }

      console.log('📢 Creating new channel:', channelSlug);
      const now = new Date().toISOString();
      const { data: newChannel, error: channelCreateError } = await supabase
        .from('Channel')
        .insert({
          id: createId(),
          name: `#${channelSlug}`,
          slug: channelSlug,
          description: `${channelSlug} channel`,
          createdBy: effectiveWallet,
          createdAt: now,
          updatedAt: now
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
      console.log('✅ Channel created:', newChannel.id);
    } else {
      console.log('📢 Channel exists:', channel.id);
    }

    // Type guard: At this point user and channel must exist
    if (!user || !channel) {
      console.error('❌ User or channel is null after creation/fetch');
      return NextResponse.json(
        { error: 'Failed to get or create user/channel' },
        { status: 500 }
      );
    }

    // Create message using Supabase
    console.log('💬 Creating message...');
    const now = new Date();
    const nowISO = now.toISOString();
    
    // Calculate expiration based on user type
    // Anonymous users: 5 minutes
    // Authenticated users: 30 days
    const expiresAt = isAnonymous
      ? new Date(now.getTime() + 5 * 60 * 1000).toISOString() // 5 minutes
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    
    console.log(`⏱️  Message will expire at: ${expiresAt} (${isAnonymous ? '5 min' : '30 days'})`);
    
    const { data: message, error: messageError } = await supabase
      .from('Message')
      .insert({
        id: createId(),
        channelId: channel.id,
        userId: user.id,
        content,
        imageUrl,
        expiresAt,
        createdAt: nowISO,
        updatedAt: nowISO
      })
      .select(`
        id,
        content,
        imageUrl,
        createdAt,
        expiresAt
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
          username: user.username,
          walletAddress: user.walletAddress
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

