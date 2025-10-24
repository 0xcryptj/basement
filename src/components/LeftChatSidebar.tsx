import { useState, useEffect } from "react";
import { Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import { EmojiPicker } from "@/components/EmojiPicker";

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
    level?: number;
  };
}

export const LeftChatSidebar = () => {
  const { toast } = useToast();
  const { address } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [onlineCount, setOnlineCount] = useState(255);
  const [activeChannel, setActiveChannel] = useState<string>("luckyblock_ch");

  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel);
      const channel = subscribeToMessages(activeChannel);
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeChannel]);

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
      .limit(50);

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
    if (!inputMessage.trim() || !address || !activeChannel) return;

    try {
      const { data: existingUser } = await supabase
        .from('User')
        .select('id')
        .eq('walletAddress', address)
        .single();

      let userId = existingUser?.id;

      if (!existingUser) {
        const { data: newUser, error: userError } = await supabase
          .from('User')
          .insert([{
            id: crypto.randomUUID(),
            walletAddress: address,
            username: `user_${address.slice(0, 8)}`,
          }])
          .select('id')
          .single();

        if (userError) throw userError;
        userId = newUser.id;
      }

      const { error } = await supabase.from('Message').insert([{
        id: crypto.randomUUID(),
        userId: userId,
        channelId: activeChannel,
        content: inputMessage.trim(),
      }]);

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

  const getUserLevel = () => Math.floor(Math.random() * 100) + 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0, width: isCollapsed ? "60px" : "280px" }}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[hsl(220,30%,8%)] border-r border-primary/20 z-40 flex flex-col hidden lg:flex shadow-glow-cyan"
      >
        {/* Header */}
        <div className="p-3 border-b border-primary/20 flex items-center justify-between">
          {!isCollapsed && (
            <>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[0.65rem] text-primary">Degen Chat</span>
                <Badge variant="secondary" className="font-mono text-[0.5rem] bg-primary/20 text-primary border-primary/30">
                  {onlineCount}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary"
                onClick={() => setIsCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary mx-auto"
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!isCollapsed && (
          <>
            {/* Channel Selector */}
            <div className="m-3 space-y-2">
              <div className="font-pixel text-[0.5rem] text-muted-foreground">CHANNELS</div>
              <div className="space-y-1">
                {["luckyblock_ch", "basement_ch", "arcade_ch"].map((channelId) => {
                  const channelNames: Record<string, string> = {
                    luckyblock_ch: "#luckyblock",
                    basement_ch: "#basement",
                    arcade_ch: "#arcade"
                  };
                  return (
                    <button
                      key={channelId}
                      onClick={() => setActiveChannel(channelId)}
                      className={`w-full text-left px-3 py-2 font-mono text-xs rounded transition-all ${
                        activeChannel === channelId
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                      }`}
                    >
                      {channelNames[channelId]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-3">
              {loading ? (
                <div className="text-center text-muted-foreground font-mono text-xs py-4">Loading...</div>
              ) : (
                <div className="space-y-3 py-2">
                  {messages.map((message, idx) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-8 w-8 border border-primary/20">
                          <AvatarImage src={message.user?.avatarUrl} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-pixel">
                            {message.user?.username?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -bottom-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-primary-foreground font-pixel text-[0.4rem] border-0">
                          {getUserLevel()}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-pixel text-[0.6rem] text-primary truncate">
                            {getDisplayName(message)}
                          </span>
                          <span className="font-mono text-[0.45rem] text-muted-foreground whitespace-nowrap">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="font-mono text-[0.65rem] text-foreground/90 break-words mt-0.5 leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <EmojiPicker onEmojiSelect={(emoji) => setInputMessage(prev => prev + emoji)} />
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type Message Here..."
                  disabled={!address}
                  className="flex-1 font-mono text-xs bg-background/50 border-primary/20 h-8 focus:border-primary"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!address || !inputMessage.trim()}
                  size="icon"
                  className="h-8 w-8 bg-primary hover:bg-primary/80"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-[0.5rem] font-mono text-muted-foreground">
                <span className="cursor-pointer hover:text-primary">Chat Rules</span>
                <div className="flex items-center gap-1">
                  <span>💬</span>
                  <span>180</span>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
