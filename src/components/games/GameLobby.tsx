import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, ChevronDown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GameMatch {
  id: string;
  player1_id: string;
  player2_id: string | null;
  wager_amount: number;
  status: string;
  network: string;
  game_type: string;
  created_at: string;
  player1?: {
    username: string;
    avatarUrl: string;
    level?: number;
  };
  player2?: {
    username: string;
    avatarUrl: string;
    level?: number;
  };
  spectator_count?: number;
}

interface GameLobbyProps {
  gameType: "cointoss" | "war" | "connect4";
  gameTitle: string;
  gameDescription: string;
  onJoinGame: (matchId: string) => void;
  onSpectateGame: (matchId: string) => void;
}

export const GameLobby = ({ 
  gameType, 
  gameTitle, 
  gameDescription,
  onJoinGame,
  onSpectateGame 
}: GameLobbyProps) => {
  const { userId, network, isConnected } = useWallet();
  const { toast } = useToast();
  const [matches, setMatches] = useState<GameMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [wagerAmount, setWagerAmount] = useState(0.001);
  const [balance] = useState(0.00095);
  const [creating, setCreating] = useState(false);
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [sortBy, setSortBy] = useState<"high" | "low">("high");
  const [showAll, setShowAll] = useState(true);

  useEffect(() => {
    if (isConnected) {
      loadMatches();
      const channel = subscribeToMatches();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isConnected, gameType, network]);

  const loadMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:User!matches_player1_id_fkey(username, avatarUrl),
        player2:User!matches_player2_id_fkey(username, avatarUrl)
      `)
      .eq('game_type', gameType)
      .eq('network', network)
      .in('status', ['waiting', 'active'])
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setMatches(data as any);
    }
    setLoading(false);
  };

  const subscribeToMatches = () => {
    const channel = supabase
      .channel(`${gameType}-matches`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `game_type=eq.${gameType}`,
        },
        () => loadMatches()
      )
      .subscribe();

    return channel;
  };

  const createGame = async () => {
    if (!userId || !network) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (wagerAmount <= 0) {
      toast({
        title: "Invalid Wager",
        description: "Please enter a valid wager amount",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    const { data, error } = await supabase
      .from('matches')
      .insert([{
        player1_id: userId,
        game_type: gameType,
        wager_amount: wagerAmount,
        network: network,
        status: 'waiting'
      }])
      .select()
      .single();

    setCreating(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create game",
        variant: "destructive"
      });
    } else {
      setWaitingForMatch(true);
      toast({
        title: "Game Created!",
        description: "Waiting for opponent to join..."
      });
    }
  };

  const joinGame = async (matchId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from('matches')
      .update({ 
        player2_id: userId,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (!error) {
      onJoinGame(matchId);
    } else {
      toast({
        title: "Error",
        description: "Failed to join game",
        variant: "destructive"
      });
    }
  };

  const getUserLevel = () => Math.floor(Math.random() * 100) + 1;

  const sortedMatches = [...matches].sort((a, b) => 
    sortBy === "high" 
      ? b.wager_amount - a.wager_amount 
      : a.wager_amount - b.wager_amount
  );

  return (
    <div className="w-full space-y-6">
      {/* Waiting State Overlay */}
      {waitingForMatch && (
        <Card className="bg-accent/10 backdrop-blur-sm border-2 border-accent p-6 animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <div className="absolute inset-0 bg-accent/20 blur-xl animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="font-pixel text-lg text-accent mb-2">
                Waiting for Opponent...
              </h3>
              <p className="font-mono text-sm text-muted-foreground">
                Your game has been created. Waiting for another player to join.
              </p>
            </div>
            <Button
              onClick={() => setWaitingForMatch(false)}
              variant="outline"
              size="sm"
              className="font-mono text-xs"
            >
              Hide
            </Button>
          </div>
        </Card>
      )}

      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-glow-pulse" />
          <div>
            <h1 className="font-pixel text-2xl sm:text-3xl text-primary">{gameTitle}</h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground mt-1">
              {gameDescription}
            </p>
          </div>
        </div>

        {/* Create Game Section */}
        <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-xs text-muted-foreground mb-2">
                Bet Amount ~${(wagerAmount * 192).toFixed(2)}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-background/50 border border-primary/20 rounded-lg px-3 py-2 flex-1">
                  <span className="font-mono text-sm">≡</span>
                  <input
                    type="number"
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(parseFloat(e.target.value) || 0)}
                    step="0.001"
                    min="0.001"
                    className="w-full bg-transparent font-mono text-lg text-foreground outline-none"
                    placeholder="0"
                  />
                </div>
                <Button
                  variant="outline"
                  className="font-mono text-xs bg-background/50 border-primary/20 hover:bg-background whitespace-nowrap"
                >
                  SOL <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setWagerAmount(prev => prev + 0.01)}
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs bg-background/50 border-primary/20 hover:bg-primary/10"
                  >
                    +0.01
                  </Button>
                  <Button
                    onClick={() => setWagerAmount(prev => prev + 1)}
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs bg-background/50 border-primary/20 hover:bg-primary/10"
                  >
                    +1
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">Balance:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">≡</span>
                  <span className="font-mono text-sm text-foreground">{balance.toFixed(8)}</span>
                </div>
              </div>

              <Button
                onClick={createGame}
                disabled={!isConnected || creating || wagerAmount <= 0}
                className="font-pixel text-sm px-6 py-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan transition-all duration-200 hover:scale-105"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Games List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="font-pixel text-sm text-foreground">
              ALL GAMES <span className="text-primary">{matches.length}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <span className="text-primary">≡</span>
              <span>Payouts are settled in SOL</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">Sort By</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "high" ? "low" : "high")}
                className="font-mono text-xs bg-background/50 border-primary/20"
              >
                {sortBy === "high" ? "High to Low" : "Low to High"} <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="font-mono text-xs bg-background/50 border-primary/20"
            >
              <span className="text-primary">≡</span> {showAll ? "All" : "Active"} <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
            <p className="font-mono text-sm text-muted-foreground">Loading games...</p>
          </div>
        ) : sortedMatches.length === 0 ? (
          <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-8 text-center">
            <p className="font-mono text-sm text-muted-foreground">No games available</p>
            <p className="font-mono text-xs text-muted-foreground mt-2">Be the first to create one!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedMatches.map((match) => (
              <Card 
                key={match.id} 
                className={cn(
                  "bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border p-4 transition-all duration-200 hover:border-primary/40",
                  match.status === 'active' ? "border-accent/20" : "border-primary/20"
                )}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Player 1 */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/30">
                        <AvatarImage src={match.player1?.avatarUrl} />
                        <AvatarFallback className="bg-primary/20 text-primary font-pixel text-xs">
                          {match.player1?.username?.[0]?.toUpperCase() || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <Badge className="absolute -bottom-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground font-pixel text-[0.5rem] border-2 border-background">
                        {getUserLevel()}
                      </Badge>
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-foreground truncate">
                        {match.player1?.username || `Player ${match.player1_id.slice(0, 6)}`}
                      </p>
                    </div>
                  </div>

                  {/* VS Icon */}
                  <div className="flex items-center justify-center px-4">
                    <div className="font-pixel text-xs text-muted-foreground">VS</div>
                  </div>

                  {/* Player 2 or Waiting */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 justify-end sm:justify-start">
                    {match.player2_id ? (
                      <>
                        <div className="min-w-0">
                          <p className="font-mono text-sm text-foreground truncate text-right sm:text-left">
                            {match.player2?.username || `Player ${match.player2_id.slice(0, 6)}`}
                          </p>
                        </div>
                        <div className="relative">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-secondary/30">
                            <AvatarImage src={match.player2?.avatarUrl} />
                            <AvatarFallback className="bg-secondary/20 text-secondary font-pixel text-xs">
                              {match.player2?.username?.[0]?.toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <Badge className="absolute -bottom-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-secondary text-secondary-foreground font-pixel text-[0.5rem] border-2 border-background">
                            {getUserLevel()}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 bg-background/30 border border-primary/10 rounded-lg px-3 py-2">
                        <span className="font-mono text-xs text-muted-foreground">Waiting...</span>
                      </div>
                    )}
                  </div>

                  {/* Wager & Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-primary">≡</span>
                      <span className="font-mono text-sm sm:text-base text-foreground font-bold">
                        {match.wager_amount.toFixed(3)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {match.status === 'waiting' && match.player1_id !== userId && (
                        <Button
                          onClick={() => joinGame(match.id)}
                          size="sm"
                          className="font-pixel text-xs px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
                        >
                          Join
                        </Button>
                      )}
                      {match.status === 'active' && (
                        <Badge className="font-mono text-xs bg-accent/20 text-accent border-accent/30">
                          {match.player1_id === userId || match.player2_id === userId ? 'Playing' : 'Live'}
                        </Badge>
                      )}
                      <Button
                        onClick={() => onSpectateGame(match.id)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
