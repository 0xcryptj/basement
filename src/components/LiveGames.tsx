import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface LiveMatch {
  id: string;
  game_type: string;
  network: string;
  wager_amount: number;
  player1_id: string;
  player2_id: string;
  spectator_count?: number;
}

export const LiveGames = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadLiveMatches();
    const channel = subscribeToMatches();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLiveMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      // Get spectator counts
      const matchesWithSpectators = await Promise.all(
        data.map(async (match) => {
          const { count } = await supabase
            .from('game_spectators')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id);
          return { ...match, spectator_count: count || 0 };
        })
      );
      setLiveMatches(matchesWithSpectators);
    }
  };

  const subscribeToMatches = () => {
    const channel = supabase
      .channel('live-matches-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: 'status=eq.active',
        },
        () => {
          loadLiveMatches();
        }
      )
      .subscribe();

    return channel;
  };

  const watchGame = (match: LiveMatch) => {
    // Navigate to game with spectator mode
    const gameRoutes: Record<string, string> = {
      war: '/games/war',
      chess: '/games/chess',
      connect4: '/games/connect4',
      cointoss: '/games/cointoss',
    };
    
    const route = gameRoutes[match.game_type];
    if (route) {
      navigate(`${route}?spectate=${match.id}`);
    }
  };

  if (liveMatches.length === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/30 p-4">
      <h3 className="font-pixel text-sm text-primary mb-4 flex items-center gap-2">
        <Eye className="w-4 h-4" />
        LIVE GAMES
      </h3>
      <div className="space-y-2">
        {liveMatches.map((match) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-background/50 rounded border border-primary/20 hover:border-primary/40 transition-all"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[0.6rem] text-foreground">
                  {match.game_type.toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 rounded text-[0.5rem] font-pixel ${
                  match.network === 'solana' 
                    ? 'bg-secondary/20 text-secondary' 
                    : 'bg-primary/20 text-primary'
                }`}>
                  {match.network === 'solana' ? 'SOL' : 'BASE'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[0.55rem] font-mono text-muted-foreground">
                <span>{match.wager_amount} {match.network === 'solana' ? 'SOL' : 'ETH'}</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {match.spectator_count || 0}
                </span>
              </div>
            </div>
            <Button
              onClick={() => watchGame(match)}
              size="sm"
              className="font-pixel text-[0.5rem] px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/40"
            >
              <Eye className="w-3 h-3 mr-1" />
              WATCH
            </Button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
