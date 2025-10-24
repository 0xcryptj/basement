import { useState, useEffect } from "react";
import { Send, Plus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: string;
}

interface Channel {
  id: string;
  name: string;
  color: string;
}

const Chat = () => {
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load channels from Supabase
  useEffect(() => {
    loadChannels();
  }, []);

  // Load messages for active channel
  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel);
      subscribeToMessages(activeChannel);
    }
  }, [activeChannel]);

  const loadChannels = async () => {
    const { data, error } = await supabase
      .from("Channel")
      .select("*")
      .order("createdAt", { ascending: true });

    if (error) {
      toast({
        title: "Error loading channels",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      const channelList = data.map((ch, idx) => ({
        id: ch.id,
        name: ch.name,
        color: idx % 3 === 0 ? "primary" : idx % 3 === 1 ? "secondary" : "accent",
      }));
      setChannels(channelList);
      setActiveChannel(channelList[0].id);
    }
    setIsLoading(false);
  };

  const loadMessages = async (channelId: string) => {
    const { data, error } = await supabase
      .from("Message")
      .select("*")
      .eq("channelId", channelId)
      .order("createdAt", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    if (data) {
      const formattedMessages = data.map((msg) => ({
        id: msg.id,
        user: msg.userId.slice(0, 8),
        content: msg.content,
        timestamp: new Date(msg.createdAt || "").toLocaleTimeString(),
      }));
      setMessages(formattedMessages);
    }
  };

  const subscribeToMessages = (channelId: string) => {
    const channel = supabase
      .channel(`messages-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `channelId=eq.${channelId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              user: newMsg.userId.slice(0, 8),
              content: newMsg.content,
              timestamp: new Date(newMsg.createdAt).toLocaleTimeString(),
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeChannel) return;

    const userId = crypto.randomUUID();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <p className="font-pixel text-primary">Loading channels...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-16 flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r-2 border-primary bg-card/50 backdrop-blur-sm hidden md:block">
          <div className="p-4 border-b-2 border-primary flex items-center justify-between">
            <h2 className="font-pixel text-xs text-primary">Channels</h2>
            <Button
              size="sm"
              className="font-pixel text-[0.6rem] px-2 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-glow-purple"
            >
              <Plus className="w-3 h-3 mr-1" />
              New
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-2 space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 font-mono text-sm transition-all ${
                    activeChannel === channel.id
                      ? "bg-primary/20 text-primary shadow-glow-cyan"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-primary"
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span>{channel.name}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b-2 border-primary bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-primary" />
              <h1 className="font-pixel text-sm text-primary">
                {channels.find((c) => c.id === activeChannel)?.name}
              </h1>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start space-x-3 animate-slide-in-bottom"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    [{message.timestamp}]
                  </span>
                  <span className="font-mono text-sm text-primary">
                    {message.user}:
                  </span>
                  <span className="font-mono text-sm text-foreground flex-1">
                    {message.content}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t-2 border-primary bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center space-x-2 max-w-4xl">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 font-mono text-sm bg-input border-primary focus:shadow-glow-cyan"
              />
              <Button
                onClick={sendMessage}
                className="font-pixel text-xs px-4 bg-primary text-primary-foreground hover:bg-primary/80 shadow-glow-cyan"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Chat;
