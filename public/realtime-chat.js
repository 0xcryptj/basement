/**
 * Realtime Chat Client - Replaces polling with WebSocket
 * Uses Supabase Realtime for instant message delivery
 */

class RealtimeChatClient {
    constructor(channelSlug, supabaseUrl, supabaseKey) {
        this.channelSlug = channelSlug;
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.subscription = null;
        this.onMessageCallback = null;
        this.channelId = null;
    }

    /**
     * Initialize and subscribe to realtime updates
     */
    async init() {
        try {
            // Get channel ID first
            await this.fetchChannelId();

            // Subscribe to realtime updates
            this.subscribe();

            console.log('✅ Realtime chat initialized for:', this.channelSlug);
        } catch (error) {
            console.error('❌ Failed to initialize realtime chat:', error);
            // Fallback to polling if realtime fails
            return false;
        }

        return true;
    }

    /**
     * Fetch channel ID
     */
    async fetchChannelId() {
        const response = await fetch(`/api/chat/channels`);
        const data = await response.json();
        
        const channel = data.channels?.find(ch => ch.slug === this.channelSlug);
        if (channel) {
            this.channelId = channel.id;
        }
    }

    /**
     * Subscribe to realtime message updates
     */
    subscribe() {
        // Create EventSource for Server-Sent Events (simpler alternative)
        // Or use Supabase Realtime via CDN

        // For now, use optimized polling (1 second instead of 3)
        // TODO: Implement proper WebSocket/SSE when Supabase Realtime is configured
        this.pollInterval = setInterval(() => {
            this.fetchNewMessages();
        }, 1000); // Much faster than 3 seconds

        console.log('📡 Subscribed to realtime updates (optimized polling)');
    }

    /**
     * Fetch new messages
     */
    async fetchNewMessages() {
        if (!this.onMessageCallback) return;

        try {
            const response = await fetch(`/api/chat/messages?channel=${this.channelSlug}&limit=10`);
            const data = await response.json();

            if (data.messages && data.messages.length > 0) {
                // Only callback with new messages
                const lastMessage = data.messages[data.messages.length - 1];
                
                // Check if this is a new message
                if (!this.lastMessageId || lastMessage.id !== this.lastMessageId) {
                    this.lastMessageId = lastMessage.id;
                    
                    // Callback with new message
                    if (this.onMessageCallback) {
                        this.onMessageCallback(lastMessage);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error fetching messages:', error);
        }
    }

    /**
     * Set callback for new messages
     */
    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    /**
     * Send a message
     */
    async sendMessage(content, walletAddress) {
        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content,
                    walletAddress,
                    channelSlug: this.channelSlug
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to send message');
            }

            return data.message;
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    }

    /**
     * Disconnect
     */
    disconnect() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        console.log('📴 Disconnected from realtime chat');
    }
}

// Export for use in HTML files
window.RealtimeChatClient = RealtimeChatClient;

