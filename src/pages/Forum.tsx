import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Reply, Forward, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import bk3Image from "@/assets/bk3.png";

interface Thread {
  id: string;
  subject: string | null;
  opText: string;
  anonId: string;
  createdAt: string;
  views: number;
  boardId: number;
}

interface Post {
  id: string;
  text: string;
  anonId: string;
  threadId: string;
  createdAt: string;
  likes: number;
  dislikes: number;
}

interface Board {
  id: number;
  slug: string;
  title: string;
  about: string | null;
}

const Forum = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newThreadSubject, setNewThreadSubject] = useState("");
  const [newThreadText, setNewThreadText] = useState("");
  const [newReply, setNewReply] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<number>(1);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardAbout, setNewBoardAbout] = useState("");

  useEffect(() => {
    loadBoards();
    loadThreads();
  }, []);

  useEffect(() => {
    loadThreads();
  }, [selectedBoard]);

  useEffect(() => {
    loadThreads();
    
    // Subscribe to real-time thread updates
    const channel = supabase
      .channel('forum-threads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Thread',
          filter: `boardId=eq.${selectedBoard}`,
        },
        () => loadThreads()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBoard]);

  useEffect(() => {
    if (selectedThread) {
      loadPosts(selectedThread.id);
      incrementViews(selectedThread.id);
      
      // Subscribe to real-time post updates
      const channel = supabase
        .channel('forum-posts')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'Post',
            filter: `threadId=eq.${selectedThread.id}`,
          },
          (payload) => {
            loadPosts(selectedThread.id);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedThread]);

  const loadBoards = async () => {
    const { data, error } = await supabase
      .from('Board')
      .select('*')
      .eq('isHidden', false)
      .order('id', { ascending: true });

    if (!error && data) {
      setBoards(data);
    }
  };

  const loadThreads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Thread')
      .select('*')
      .eq('boardId', selectedBoard)
      .order('bumpAt', { ascending: false })
      .limit(50);

    if (!error && data) {
      setThreads(data);
    }
    setLoading(false);
  };

  const loadPosts = async (threadId: string) => {
    const { data, error } = await supabase
      .from('Post')
      .select('*')
      .eq('threadId', threadId)
      .order('createdAt', { ascending: true });

    if (!error && data) {
      setPosts(data);
    }
  };

  const incrementViews = async (threadId: string) => {
    await supabase
      .from('Thread')
      .update({ views: (selectedThread?.views || 0) + 1 })
      .eq('id', threadId);
  };

  const createThread = async () => {
    if (!newThreadSubject.trim() || !newThreadText.trim()) {
      toast({
        title: "Error",
        description: "Subject and text are required",
        variant: "destructive",
      });
      return;
    }

    const anonId = `anon_${Math.random().toString(36).substr(2, 9)}`;
    const threadId = crypto.randomUUID();

    const { error } = await supabase.from('Thread').insert([{
      id: threadId,
      subject: newThreadSubject,
      opText: newThreadText,
      anonId,
      boardId: 1,
      bumpAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create thread",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thread Created!",
      description: "Your thread has been posted",
    });

    setNewThreadSubject("");
    setNewThreadText("");
    setShowNewThread(false);
    loadThreads();
  };

  const createBoard = async () => {
    if (!newBoardTitle.trim()) {
      toast({
        title: "Error",
        description: "Board title is required",
        variant: "destructive",
      });
      return;
    }

    const slug = newBoardTitle.toLowerCase().replace(/\s+/g, '-');

    const { error } = await supabase.from('Board').insert([{
      slug,
      title: newBoardTitle,
      about: newBoardAbout || null,
      isHidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create board",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Board created successfully",
    });

    setNewBoardTitle("");
    setNewBoardAbout("");
    setShowNewBoard(false);
    loadBoards();
  };

  const createPost = async () => {
    if (!newReply.trim() || !selectedThread) return;

    const anonId = `anon_${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await supabase.from('Post').insert([{
      id: crypto.randomUUID(),
      text: newReply,
      anonId,
      threadId: selectedThread.id,
    }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
      return;
    }

    await supabase
      .from('Thread')
      .update({ bumpAt: new Date().toISOString() })
      .eq('id', selectedThread.id);

    setNewReply("");
    loadPosts(selectedThread.id);
    loadThreads();
  };

  const vote = async (postId: string, isLike: boolean) => {
    const anonId = `anon_${Math.random().toString(36).substr(2, 9)}`;
    
    await supabase.from('Vote').insert([{
      id: crypto.randomUUID(),
      postId,
      anonId,
      isLike,
    }]);

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    await supabase
      .from('Post')
      .update({
        likes: isLike ? post.likes + 1 : post.likes,
        dislikes: !isLike ? post.dislikes + 1 : post.dislikes,
      })
      .eq('id', postId);

    loadPosts(selectedThread!.id);
  };

  const filteredThreads = threads.filter(thread =>
    thread.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.opText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${bk3Image})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />
      
      <Navbar />
      
      <div className="flex-1 ml-0 lg:ml-[280px] pt-16 pb-8 transition-all duration-300 relative z-10">
        {/* Header */}
        <div className="bg-[#1a1a1d]/80 backdrop-blur-sm border-b-2 border-primary/20 py-3 mb-4">
          <div className="container mx-auto px-4">
            <h1 className="font-pixel text-2xl text-primary">
              THE BASEMENT FORUM
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Board Selector */}
          <div className="mb-4 flex gap-2 flex-wrap items-center">
            {boards.map((board) => (
              <Button
                key={board.id}
                onClick={() => setSelectedBoard(board.id)}
                variant={selectedBoard === board.id ? "default" : "outline"}
                size="sm"
                className="font-mono text-xs"
              >
                /{board.slug}/
              </Button>
            ))}
            <Button
              onClick={() => setShowNewBoard(!showNewBoard)}
              variant="outline"
              size="sm"
              className="font-mono text-xs ml-auto"
            >
              + New Board
            </Button>
          </div>

          {/* New Board Form */}
          {showNewBoard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-[#1a1a1d]/80 backdrop-blur-sm border border-primary/30 p-4 mb-4"
            >
              <h3 className="font-mono text-sm text-primary mb-3">Create New Board</h3>
              <Input
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Board Title (e.g., Gaming)"
                className="mb-3 font-mono text-sm bg-background/50 border-primary/20"
              />
              <Textarea
                value={newBoardAbout}
                onChange={(e) => setNewBoardAbout(e.target.value)}
                placeholder="Description (optional)"
                className="mb-3 font-mono text-sm bg-background/50 border-primary/20"
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={createBoard} className="font-mono text-xs">
                  Create Board
                </Button>
                <Button
                  onClick={() => setShowNewBoard(false)}
                  variant="outline"
                  className="font-mono text-xs"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {selectedThread ? (
            // Thread View
            <div className="space-y-4">
              <Button
                onClick={() => {
                  setSelectedThread(null);
                  setPosts([]);
                }}
                variant="outline"
                className="mb-4"
              >
                ← Back to Threads
              </Button>

              {/* OP Post */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1a1a1d]/80 backdrop-blur-sm border border-primary/30 p-4"
              >
                <h2 className="font-mono text-lg text-primary mb-3">
                  {selectedThread.subject}
                </h2>
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {selectedThread.anonId}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(selectedThread.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="font-mono text-sm text-foreground whitespace-pre-wrap">
                  {selectedThread.opText}
                </p>
              </motion.div>

              {/* Replies */}
              <div className="space-y-3">
                {posts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-[#1a1a1d]/80 backdrop-blur-sm border border-primary/20 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {post.anonId}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => vote(post.id, true)}
                          className="h-6 px-2"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          <span className="text-xs">{post.likes}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => vote(post.id, false)}
                          className="h-6 px-2"
                        >
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          <span className="text-xs">{post.dislikes}</span>
                        </Button>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-foreground whitespace-pre-wrap">
                      {post.text}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Reply Form */}
              <div className="bg-[#1a1a1d]/80 backdrop-blur-sm border border-primary/20 p-4">
                <h3 className="font-mono text-sm text-primary mb-3">Post Reply</h3>
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write your reply... (use @username to mention)"
                  className="mb-3 font-mono text-sm bg-background/50 border-primary/20"
                  rows={4}
                />
                <Button
                  onClick={createPost}
                  className="font-mono text-xs"
                >
                  Post Reply
                </Button>
              </div>
            </div>
          ) : (
            // Threads List
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                {/* New Thread Form */}
                {showNewThread && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-[#1a1a1d]/80 backdrop-blur-sm border border-primary/30 p-4"
                  >
                    <h3 className="font-mono text-sm text-primary mb-3">Create New Thread</h3>
                    <Input
                      value={newThreadSubject}
                      onChange={(e) => setNewThreadSubject(e.target.value)}
                      placeholder="Subject"
                      className="mb-3 font-mono text-sm bg-background/50 border-primary/20"
                    />
                    <Textarea
                      value={newThreadText}
                      onChange={(e) => setNewThreadText(e.target.value)}
                      placeholder="Write your post... (use @username to mention)"
                      className="mb-3 font-mono text-sm bg-background/50 border-primary/20"
                      rows={6}
                    />
                    <div className="flex gap-2">
                      <Button onClick={createThread} className="font-mono text-xs">
                        Create Thread
                      </Button>
                      <Button
                        onClick={() => setShowNewThread(false)}
                        variant="outline"
                        className="font-mono text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Threads List */}
                <div className="bg-[#1a1a1d]/80 backdrop-blur-sm border border-primary/20">
                  <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
                    <h2 className="font-mono text-xs text-primary font-bold">
                      {boards.find(b => b.id === selectedBoard)?.title || 'Board'} - /{boards.find(b => b.id === selectedBoard)?.slug}/
                    </h2>
                    <Button 
                      size="sm"
                      onClick={() => setShowNewThread(!showNewThread)}
                      className="font-mono text-xs px-3 py-1 h-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      [Start a Thread]
                    </Button>
                  </div>
                  <div className="divide-y divide-primary/10">
                    {loading ? (
                      <div className="text-center py-8 font-mono text-sm text-muted-foreground">
                        Loading threads...
                      </div>
                    ) : filteredThreads.length === 0 ? (
                      <div className="text-center py-8 font-mono text-sm text-muted-foreground">
                        No threads yet. Start one!
                      </div>
                    ) : (
                      filteredThreads.map((thread) => (
                        <div
                          key={thread.id}
                          onClick={() => setSelectedThread(thread)}
                          className="px-4 py-3 hover:bg-primary/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-mono text-sm text-primary hover:underline truncate">
                                  {thread.subject || "No Subject"}
                                </h3>
                                <p className="font-mono text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {thread.opText}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground whitespace-nowrap shrink-0">
                              {new Date(thread.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                            <span>by {thread.anonId}</span>
                            <span>V: {thread.views}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-[#1a1a1d]/80 backdrop-blur-sm border border-primary/20 p-4 sticky top-20">
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
                      All posts are anonymous
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-2">
                      Use @username to mention
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Forum;
