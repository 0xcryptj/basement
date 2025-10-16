// Optimized Realtime Chat System using Supabase Realtime
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface RealtimeMessage {
  id: string;
  content: string;
  createdAt: string;
  user: {
    username: string;
    walletAddress: string;
    avatarUrl?: string;
  };
}

export class RealtimeChatClient {
  private channel: any;
  private onMessageCallback: ((message: RealtimeMessage) => void) | null = null;

  constructor(private channelName: string) {}

  /**
   * Subscribe to realtime messages for a channel
   */
  subscribe(onMessage: (message: RealtimeMessage) => void) {
    this.onMessageCallback = onMessage;

    // Subscribe to Supabase Realtime for new messages
    this.channel = supabase
      .channel(`chat:${this.channelName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `channelId=eq.${this.channelName}`
        },
        (payload) => {
          console.log('🔴 Realtime message received:', payload);
          
          // Fetch the full message with user data
          this.fetchMessageById(payload.new.id);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime connection status:', status);
      });

    return this;
  }

  /**
   * Fetch a single message by ID with user data
   */
  private async fetchMessageById(messageId: string) {
    const { data, error } = await supabase
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
      .eq('id', messageId)
      .single();

    if (data && this.onMessageCallback) {
      this.onMessageCallback(data as any);
    }

    if (error) {
      console.error('❌ Error fetching message:', error);
    }
  }

  /**
   * Unsubscribe from realtime updates
   */
  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.channel?.state === 'joined';
  }
}

/**
 * Create a realtime chat client for a channel
 */
export function createRealtimeChat(channelName: string) {
  return new RealtimeChatClient(channelName);
}

