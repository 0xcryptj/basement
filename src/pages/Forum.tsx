import { useState } from "react";
import { MessageSquare, Eye, Flame, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  
  const boards: Board[] = [
    {
      id: "1",
      name: "/b/",
      slug: "Random",
      description: "The stories and information posted here are artistic works of fiction and falsehood.",
      threads: 1337,
      color: "primary",
    },
    {
      id: "2",
      name: "/crypto/",
      slug: "Cryptocurrency",
      description: "Discuss blockchain, DeFi, tokens and Web3",
      threads: 420,
      color: "secondary",
    },
    {
      id: "3",
      name: "/arcade/",
      slug: "Gaming",
      description: "Video games, gambling, and arcade discussion",
      threads: 69,
      color: "accent",
    },
    {
      id: "4",
      name: "/biz/",
      slug: "Business",
      description: "Business and finance discussion",
      threads: 256,
      color: "primary",
    },
  ];

  const threads: Thread[] = [
    {
      id: "1",
      subject: "Welcome to The Basement",
      author: "anon",
      replies: 0,
      views: 1,
      timestamp: "just now",
      preview: "First thread on the random board. Post anything...",
    },
  ];

  const filteredThreads = threads.filter(thread =>
    thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0e0e10]">
      <Navbar />
      
      <div className="ml-0 lg:ml-[280px] pt-16 pb-8 transition-all duration-300">
        {/* Header - 4chan style */}
        <div className="bg-[#1a1a1d] border-b-2 border-primary/20 py-3 mb-4">
          <div className="container mx-auto px-4">
            <h1 className="font-pixel text-2xl text-primary">
              THE BASEMENT
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-3 space-y-6">
              {/* Boards List - 4chan style table */}
              <div className="bg-[#1a1a1d] border border-primary/20">
                <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
                  <h2 className="font-mono text-xs text-primary font-bold">Boards</h2>
                </div>
                <div className="divide-y divide-primary/10">
                  {boards.map((board) => (
                    <div
                      key={board.id}
                      className="px-4 py-3 hover:bg-primary/5 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="font-pixel text-lg text-primary group-hover:text-primary/80 shrink-0">
                            {board.name}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-mono text-sm text-foreground font-bold mb-1">
                              {board.slug}
                            </h3>
                            <p className="font-mono text-xs text-muted-foreground">
                              {board.description}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground shrink-0">
                          {board.threads}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Random Board Threads */}
              <div className="bg-[#1a1a1d] border border-primary/20">
                <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
                  <h2 className="font-mono text-xs text-primary font-bold">Random - /b/</h2>
                  <Button 
                    size="sm"
                    className="font-mono text-xs px-3 py-1 h-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    [Start a Thread]
                  </Button>
                </div>
                <div className="divide-y divide-primary/10">
                  {filteredThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className="px-4 py-3 hover:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-mono text-sm text-primary hover:underline truncate">
                              {thread.subject}
                            </h3>
                            <p className="font-mono text-xs text-muted-foreground mt-1">
                              {thread.preview}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {thread.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                        <span>by {thread.author}</span>
                        <span>R: {thread.replies}</span>
                        <span>V: {thread.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a1a1d] border border-primary/20 p-4 sticky top-20">
                <h3 className="font-mono text-xs text-primary font-bold mb-3">Search Threads</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20 font-mono text-xs"
                  />
                </div>
                
                <div className="mt-6 pt-4 border-t border-primary/20">
                  <h3 className="font-mono text-xs text-primary font-bold mb-2">Info</h3>
                  <p className="font-mono text-xs text-muted-foreground">
                    Burn 5 tokens to post
                  </p>
                  <p className="font-mono text-xs text-muted-foreground mt-2">
                    All posts are anonymous
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Forum;
