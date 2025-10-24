import { useState, useEffect } from "react";
import { Send, Hash, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user?: {
    id: string;
    username?: string;
    walletAddress: string;
    avatarUrl?: string;
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
      .from('Channel')
      .select('*')
      .eq('isPrivate', false)
      .order('createdAt', { ascending: true });

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
      .from('Message')
      .select(`
        *,
        user:User!Message_userId_fkey (
          id,
          username,
          walletAddress,
          avatarUrl
        )
      `)
      .eq('channelId', channelId)
      .order('createdAt', { ascending: true })
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
          table: 'Message',
          filter: `channelId=eq.${channelId}`,
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from('User')
            .select('id, username, walletAddress, avatarUrl')
            .eq('id', payload.new.userId)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              user: userData || undefined,
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
        .from('User')
        .select('id')
        .eq('walletAddress', address)
        .single();

      let userId = existingUser?.id;

      if (!existingUser) {
        // Create user if doesn't exist
        const { data: newUser, error: userError } = await supabase
          .from('User')
          .insert({
            walletAddress: address,
            username: `user_${address.slice(0, 8)}`,
          })
          .select('id')
          .single();

        if (userError) throw userError;
        userId = newUser.id;
      }

      const { error } = await supabase.from('Message').insert({
        userId: userId,
        channelId: activeChannel,
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
    if (message.user?.username) return message.user.username;
    if (message.user?.walletAddress) return message.user.walletAddress.slice(0, 8) + '...';
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
                <div key={message.id} className="flex items-start gap-3 p-2 hover:bg-card/50 rounded-lg transition-colors animate-fade-in">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src={message.user?.avatarUrl} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {message.user?.username?.[0]?.toUpperCase() || message.user?.walletAddress?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-pixel text-[0.65rem] text-primary">
                        {getDisplayName(message)}
                      </span>
                      <span className="font-mono text-[0.5rem] text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-foreground break-words mt-0.5">
                      {message.content}
                    </p>
                  </div>
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