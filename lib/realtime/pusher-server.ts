/**
 * SERVER-SIDE PUSHER (for triggering events)
 * Sends real-time updates to connected clients
 * Gracefully degrades if Pusher not installed
 */

let Pusher: any;
try {
  Pusher = require('pusher');
} catch (e) {
  console.warn('⚠️ Pusher not installed - WebSocket features disabled');
}

let pusherInstance: any | null = null;

export function getPusher(): any | null {
  if (pusherInstance) return pusherInstance;

  // Check if Pusher is available
  if (!Pusher) {
    return null;
  }

  // Only initialize if all credentials are present
  if (!process.env.PUSHER_APP_ID || 
      !process.env.PUSHER_KEY || 
      !process.env.PUSHER_SECRET || 
      !process.env.PUSHER_CLUSTER) {
    console.warn('⚠️ Pusher credentials not configured');
    return null;
  }

  pusherInstance = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
  });

  console.log('✅ Pusher server instance created');
  return pusherInstance;
}

export async function broadcastMessage(channelSlug: string, message: any): Promise<boolean> {
  const pusher = getPusher();
  if (!pusher) {
    console.warn('Pusher not available, skipping broadcast');
    return false;
  }

  try {
    await pusher.trigger(`chat-${channelSlug}`, 'new-message', message);
    console.log(`📡 Message broadcast to channel: ${channelSlug}`);
    return true;
  } catch (error) {
    console.error('Failed to broadcast message:', error);
    return false;
  }
}

