import { MessageSquare, Eye, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Board {
  id: string;
  name: string;
  slug: string;
  description: string;
  threads: number;
  color: string;
}

interface Thread {
  id: string;
  subject: string;
  author: string;
  replies: number;
  views: number;
  timestamp: string;
  preview: string;
}

const Forum = () => {
  const boards: Board[] = [
    {
      id: "1",
      name: "/b/",
      slug: "Random",
      description: "Anything goes",
      threads: 1337,
      color: "primary",
    },
    {
      id: "2",
      name: "/crypto/",
      slug: "Crypto",
      description: "Blockchain & tokens",
      threads: 420,
      color: "secondary",
    },
    {
      id: "3",
      name: "/arcade/",
      slug: "Gaming",
      description: "Retro & Web3 games",
      threads: 69,
      color: "accent",
    },
  ];

  const threads: Thread[] = [
    {
      id: "1",
      subject: "Is Base the future?",
      author: "anon",
      replies: 42,
      views: 420,
      timestamp: "2 hours ago",
      preview: "Discussion about Base L2 scaling...",
    },
    {
      id: "2",
      subject: "Solana pump.fun strategy",
      author: "degen",
      replies: 69,
      views: 1337,
      timestamp: "5 hours ago",
      preview: "How to ape safely...",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="ml-0 md:ml-[280px] pt-20 container mx-auto px-4 pb-12 transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /BOARDS/
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Anonymous image board • Burn 5 tokens to post
          </p>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`bg-card border-2 ${
                board.color === "primary"
                  ? "border-primary hover:shadow-glow-cyan"
                  : board.color === "secondary"
                  ? "border-secondary hover:shadow-glow-purple"
                  : "border-accent hover:shadow-glow-magenta"
              } p-6 transition-all duration-300 hover:scale-105 cursor-pointer group`}
            >
              <h2 className="font-pixel text-2xl mb-2 group-hover:animate-glow-pulse">
                {board.name}
              </h2>
              <h3 className="font-pixel text-xs text-muted-foreground mb-3">
                {board.slug}
              </h3>
              <p className="font-mono text-sm text-muted-foreground mb-4">
                {board.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary">
                  {board.threads} threads
                </span>
                <Flame className={`w-4 h-4 text-${board.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Threads */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-pixel text-xl text-primary">Recent Threads</h2>
            <Button className="font-pixel text-xs px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-glow-purple">
              New Thread
            </Button>
          </div>

          <div className="space-y-4">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className="bg-card border-2 border-primary p-4 transition-all hover:shadow-glow-cyan cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-pixel text-sm group-hover:text-primary transition-colors">
                    {thread.subject}
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {thread.timestamp}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground mb-3">
                  by {thread.author}
                </p>
                <p className="font-mono text-sm text-foreground mb-4">
                  {thread.preview}
                </p>
                <div className="flex items-center space-x-4 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{thread.replies}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{thread.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Forum;
