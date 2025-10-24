import { useState, useEffect } from "react";
import { Send, Hash, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";

interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  User?: {
    display_name?: string;
    username?: string;
    walletAddress: string;
  };
}

interface Channel {
  id: string;
  name: string;
  slug: string;
}

export const ChatSidebar = () => {
  const { toast } = useToast();
  const { userId, address } = useWallet();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel);
      const unsubscribe = subscribeToMessages(activeChannel);
      return unsubscribe;
    }
  }, [activeChannel]);

  const loadChannels = async () => {
    const { data, error } = await supabase
      .from("Channel")
      .select("*")
      .eq("isPrivate", false)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Error loading channels:", error);
      return;
    }

    if (data && data.length > 0) {
      setChannels(data);
      setActiveChannel(data[0].id);
    }
  };

  const loadMessages = async (channelId: string) => {
    const { data, error } = await supabase
      .from("Message")
      .select(`
        *,
        User:userId (
          display_name,
          username,
          walletAddress
        )
      `)
      .eq("channelId", channelId)
      .eq("isDeleted", false)
      .order("createdAt", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = (channelId: string) => {
    const channel = supabase
      .channel(`chat-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `channelId=eq.${channelId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Fetch user info
          const { data: userData } = await supabase
            .from("User")
            .select("display_name, username, walletAddress")
            .eq("id", newMsg.userId)
            .single();

          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, User: userData }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeChannel || !userId) {
      if (!userId) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet to chat",
          variant: "destructive",
        });
      }
      return;
    }

    const { error } = await supabase.from("Message").insert({
      id: crypto.randomUUID(),
      channelId: activeChannel,
      userId: userId,
      content: inputMessage,
    });

    if (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setInputMessage("");
  };

  const getDisplayName = (msg: Message) => {
    if (msg.User?.display_name) return msg.User.display_name;
    if (msg.User?.username) return msg.User.username;
    if (msg.User?.walletAddress) return msg.User.walletAddress.slice(0, 8) + "...";
    return "Anonymous";
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
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 bg-background/95 backdrop-blur-sm border-l-2 border-primary">
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
                    ? "bg-primary/20 text-primary shadow-glow-cyan border border-primary"
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
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex flex-col space-y-1 animate-slide-in-bottom"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-pixel text-[0.6rem] text-primary">
                    {getDisplayName(message)}
                  </span>
                  <span className="font-mono text-[0.5rem] text-muted-foreground">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="font-mono text-xs text-foreground pl-2 break-words">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-primary bg-background/95 p-4">
          <div className="flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={userId ? "Type message..." : "Connect wallet to chat"}
              disabled={!userId}
              className="flex-1 font-mono text-xs bg-input border-primary focus:shadow-glow-cyan"
            />
            <Button
              onClick={sendMessage}
              disabled={!userId}
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