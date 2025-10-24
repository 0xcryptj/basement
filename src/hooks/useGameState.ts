import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGameState = <T>(matchId: string | null, initialState: T) => {
  const [gameState, setGameState] = useState<T>(initialState);

  useEffect(() => {
    if (!matchId) return;

    // Fetch initial game state
    const fetchGameState = async () => {
      const { data } = await supabase
        .from('matches')
        .select('game_state')
        .eq('id', matchId)
        .single();

      if (data?.game_state) {
        setGameState(data.game_state as T);
      }
    };

    fetchGameState();

    // Subscribe to game state updates
    const channel = supabase
      .channel(`game-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload: any) => {
          if (payload.new.game_state) {
            setGameState(payload.new.game_state as T);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return { gameState, setGameState };
};