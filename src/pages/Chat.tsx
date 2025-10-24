import { useState } from "react";
import { Send, Plus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Navbar } from "@/components/Navbar";

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
  const [channels] = useState<Channel[]>([
    { id: "1", name: "general", color: "primary" },
    { id: "2", name: "trading", color: "secondary" },
    { id: "3", name: "arcade", color: "accent" },
  ]);

  const [activeChannel, setActiveChannel] = useState(channels[0].id);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      user: "anon_1337",
      content: "Welcome to The Basement IRC",
      timestamp: "12:00:00",
    },
    {
      id: "2",
      user: "system",
      content: "Burn 5 tokens to create a new channel",
      timestamp: "12:00:01",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      user: "you",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 h-screen flex">
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
    </div>
  );
};

export default Chat;
