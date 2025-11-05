import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import baseLogo from "@/assets/base-logo.svg";
import type { Database } from "@/integrations/supabase/types";

type GameType = Database["public"]["Enums"]["game_type"];

interface Player {
  username: string;
  avatarUrl: string | null;
}

type GameHistoryMatch = Database["public"]["Tables"]["matches"]["Row"] & {
  player1: Player | null;
  player2: Player | null;
};

interface GameHistoryProps {
  gameType: string;
}

export const GameHistory = ({ gameType }: GameHistoryProps) => {
  const [recentGames, setRecentGames] = useState<GameHistoryMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentGames = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:User!matches_player1_id_fkey(username, avatarUrl),
        player2:User!matches_player2_id_fkey(username, avatarUrl)
      `)
      .eq('game_type', gameType as GameType)
      .eq('status', 'completed')
      .not('winner_id', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentGames(data as unknown as GameHistoryMatch[]);
    }
    setLoading(false);
  }, [gameType]);

  const subscribeToGames = useCallback(() => {
    const channel = supabase
      .channel(`${gameType}-game-history`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `game_type=eq.${gameType}`,
        },
        () => loadRecentGames()
      )
      .subscribe();

    return channel;
  }, [gameType, loadRecentGames]);

  useEffect(() => {
    loadRecentGames();
    const channel = subscribeToGames();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, loadRecentGames, subscribeToGames]);

  const getWinStreak = (playerId: string) => {
    let streak = 0;
    for (const game of recentGames) {
      if (game.winner_id === playerId) {
        streak++;
      } else if (game.player1_id === playerId || game.player2_id === playerId) {
        break;
      }
    }
    return streak;
  };

  return (
    <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-4">
      <div className="space-y-3">
        <h3 className="font-pixel text-sm text-primary">Recent Games</h3>
        
        {loading ? (
          <div className="text-center py-4 font-mono text-xs text-muted-foreground">Loading...</div>
        ) : recentGames.length === 0 ? (
          <div className="text-center py-4 font-mono text-xs text-muted-foreground">No games yet</div>
        ) : (
          <div className="space-y-2">
            {recentGames.map((game) => {
              const winner = game.winner_id === game.player1_id ? game.player1 : game.player2;
              const loser = game.winner_id === game.player1_id ? game.player2 : game.player1;
              const winStreak = getWinStreak(game.winner_id);

              return (
                <div key={game.id} className="flex items-center justify-between p-2 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Trophy className="w-3 h-3 text-accent flex-shrink-0" />
                    <span className="font-mono text-xs text-foreground truncate">{winner?.username || 'Player'}</span>
                    <span className="font-mono text-xs text-muted-foreground">vs</span>
                    <span className="font-mono text-xs text-muted-foreground truncate">{loser?.username || 'Player'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {winStreak >= 3 && (
                      <Badge className="bg-accent/20 text-accent border-accent/30 font-pixel text-[0.5rem] px-1.5">
                        <Flame className="w-2 h-2 mr-0.5" />{winStreak}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <img src={baseLogo} alt={game.network || 'base'} className="w-3 h-3" />
                      <span className="font-mono text-xs text-primary font-bold">{game.wager_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
