import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WaitingPlayer {
  id: string;
  user_id: string;
  game_type: string;
  network: string;
  wager_amount: number;
  users?: {
    id: string;
    display_name?: string;
    wallet_address: string;
    avatar_url?: string;
  };
}

export const WaitingPlayers = () => {
  const [players, setPlayers] = useState<WaitingPlayer[]>([]);

  useEffect(() => {
    loadWaitingPlayers();
    const channel = subscribeToWaitingPlayers();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadWaitingPlayers = async () => {
    const { data, error } = await supabase
      .from('waiting_players')
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          wallet_address,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setPlayers(data);
    }
  };

  const subscribeToWaitingPlayers = () => {
    const channel = supabase
      .channel('waiting-players-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiting_players',
        },
        () => {
          loadWaitingPlayers();
        }
      )
      .subscribe();

    return channel;
  };

  const getDisplayName = (player: WaitingPlayer) => {
    if (player.users?.display_name) return player.users.display_name;
    if (player.users?.wallet_address) return player.users.wallet_address.slice(0, 8) + '...';
    return 'Anonymous';
  };

  if (players.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 right-4 z-30 bg-black/70 backdrop-blur-sm border border-primary/40 rounded-lg p-3 max-w-xs"
    >
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-primary" />
        <p className="font-pixel text-[0.6rem] text-primary uppercase tracking-wider">
          Players Waiting ({players.length})
        </p>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-between text-[0.6rem] font-mono bg-card/50 p-2 rounded border border-primary/20"
            >
              <div className="flex flex-col gap-1">
                <span className="text-foreground">{getDisplayName(player)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{player.game_type}</span>
                  <span className={`px-1 rounded ${
                    player.network === 'solana' 
                      ? 'bg-secondary/20 text-secondary' 
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {player.network === 'solana' ? '◎' : '⟠'}
                  </span>
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-primary shadow-glow-cyan"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
