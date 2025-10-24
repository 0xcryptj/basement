import { useState, useEffect } from "react";
import { Send, Hash, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users?: {
    id: string;
    display_name?: string;
    wallet_address: string;
    avatar_url?: string;
  };
}

interface Channel {
  id: string;
  name: string;
  slug: string;
}

export const ChatSidebar = () => {
  const { toast } = useToast();
  const { address } = useWallet();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel);
      const channel = subscribeToMessages(activeChannel);
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeChannel]);

  const loadChannels = async () => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('is_private', false)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setChannels(data);
      if (data.length > 0 && !activeChannel) {
        setActiveChannel(data[0].id);
      }
    }
  };

  const loadMessages = async (channelId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          wallet_address,
          avatar_url
        )
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const subscribeToMessages = (channelId: string) => {
    const channel = supabase
      .channel(`messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from('users')
            .select('id, display_name, wallet_address, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              users: userData || undefined,
            } as Message,
          ]);
        }
      )
      .subscribe();

    return channel;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeChannel || !address) return;

    try {
      // Ensure user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address)
        .single();

      let userId = existingUser?.id;

      if (!existingUser) {
        // Create user if doesn't exist
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            wallet_address: address,
            display_name: `user_${address.slice(0, 8)}`,
          })
          .select('id')
          .single();

        if (userError) throw userError;
        userId = newUser.id;
      }

      const { error } = await supabase.from('messages').insert({
        user_id: userId,
        channel_id: activeChannel,
        content: inputMessage.trim(),
      });

      if (error) throw error;

      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const getDisplayName = (message: Message) => {
    if (message.users?.display_name) return message.users.display_name;
    if (message.users?.wallet_address) return message.users.wallet_address.slice(0, 8) + '...';
    return 'Anonymous';
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-glow-cyan bg-primary hover:bg-primary/80"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 bg-card/95 backdrop-blur-sm border-l-2 border-primary">
        <SheetHeader className="p-4 border-b-2 border-primary">
          <SheetTitle className="font-pixel text-sm text-primary">CHAT</SheetTitle>
        </SheetHeader>

        {/* Channel Tabs */}
        <div className="border-b border-primary/30 p-2 overflow-x-auto">
          <div className="flex gap-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`px-3 py-1.5 font-pixel text-[0.6rem] whitespace-nowrap transition-all ${
                  activeChannel === channel.id
                    ? "bg-primary/20 text-primary shadow-glow-cyan border border-primary rounded"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                }`}
              >
                <Hash className="w-3 h-3 inline mr-1" />
                {channel.name}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[calc(100vh-200px)] p-4">
          {loading ? (
            <div className="text-center text-muted-foreground font-mono text-xs">Loading...</div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex flex-col space-y-1 animate-fade-in"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-pixel text-[0.6rem] text-primary">
                      {getDisplayName(message)}
                    </span>
                    <span className="font-mono text-[0.5rem] text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-foreground pl-2 break-words">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-primary bg-card/95 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={address ? "Type message..." : "Connect wallet to chat"}
              disabled={!address}
              className="flex-1 font-mono text-xs bg-input border-primary focus:shadow-glow-cyan"
            />
            <Button
              onClick={sendMessage}
              disabled={!address || !inputMessage.trim()}
              className="font-pixel text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/80 shadow-glow-cyan"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
