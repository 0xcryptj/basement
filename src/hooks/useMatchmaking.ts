import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';

type GameType = 'war' | 'chess' | 'connect4' | 'cointoss';

export const useMatchmaking = (gameType: GameType) => {
  const { userId, network } = useWallet();
  const { toast } = useToast();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [opponentId, setOpponentId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !network) return;

    // Listen for match updates
    const matchChannel = supabase
      .channel('matches-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `player1_id=eq.${userId}`,
        },
        (payload: { new: { id: string; player2_id: string | null; status: string } }) => {
          if (payload.new.player2_id && payload.new.status === 'active') {
            setMatchId(payload.new.id);
            setOpponentId(payload.new.player2_id);
            setIsSearching(false);
            toast({
              title: 'Match Found!',
              description: 'Opponent joined. Game starting...',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `player2_id=eq.${userId}`,
        },
        (payload: { new: { id: string; player1_id: string; status: string } }) => {
          if (payload.new.status === 'active') {
            setMatchId(payload.new.id);
            setOpponentId(payload.new.player1_id);
            toast({
              title: 'Match Found!',
              description: 'Joining game...',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [userId, network, toast]);

  const findMatch = async (wagerAmount: number = 0) => {
    if (!userId || !network) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);

    try {
      // Add to waiting players for visibility
      const { error: waitingError } = await supabase
        .from('waiting_players')
        .insert({
          user_id: userId,
          game_type: gameType as string,
          network: network as string,
          wager_amount: wagerAmount,
        });

      if (waitingError) {
        console.warn('Warning: Could not add to waiting players:', waitingError);
        // Continue anyway - this is not critical
      }

      // Check for existing matches waiting for player 2
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('game_type', gameType as 'war' | 'chess' | 'connect4' | 'cointoss' | 'luckyblock')
        .eq('network', network as 'base' | 'solana')
        .eq('status', 'waiting')
        .eq('wager_amount', wagerAmount)
        .is('player2_id', null)
        .neq('player1_id', userId)
        .limit(1);

      if (existingMatches && existingMatches.length > 0) {
        // Join existing match
        const match = existingMatches[0];
        
        const { error } = await supabase
          .from('matches')
          .update({
            player2_id: userId,
            status: 'active',
            started_at: new Date().toISOString(),
          })
          .eq('id', match.id);

        if (error) throw error;

        // Remove both players from waiting queue
        await supabase
          .from('waiting_players')
          .delete()
          .in('user_id', [userId, match.player1_id])
          .eq('game_type', gameType as string);

        setMatchId(match.id);
        setOpponentId(match.player1_id);
        setIsSearching(false);
      } else {
        // Create new match
        const { data: newMatch, error } = await supabase
          .from('matches')
          .insert({
            game_type: gameType as 'war' | 'chess' | 'connect4' | 'cointoss' | 'luckyblock',
            network: network as 'base' | 'solana',
            player1_id: userId,
            wager_amount: wagerAmount,
            status: 'waiting',
          })
          .select()
          .single();

        if (error) throw error;

        setMatchId(newMatch.id);
        
        toast({
          title: 'Searching...',
          description: 'Waiting for opponent to join',
        });
      }
    } catch (error) {
      console.error('Error finding match:', error);
      toast({
        title: 'Error',
        description: 'Failed to find match',
        variant: 'destructive',
      });
      setIsSearching(false);
    }
  };

  const cancelSearch = async () => {
    if (!matchId) return;

    try {
      await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
        .eq('status', 'waiting');

      // Remove from waiting players
      if (userId) {
        await supabase
          .from('waiting_players')
          .delete()
          .eq('user_id', userId)
          .eq('game_type', gameType as string);
      }

      setMatchId(null);
      setIsSearching(false);
      setOpponentId(null);
    } catch (error) {
      console.error('Error canceling search:', error);
    }
  };

  const updateGameState = async (newState: Record<string, unknown>) => {
    if (!matchId) return;

    try {
      await supabase
        .from('matches')
        .update({ game_state: newState })
        .eq('id', matchId);
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  };

  const endMatch = async (winnerId: string | null) => {
    if (!matchId) return;

    try {
      await supabase
        .from('matches')
        .update({
          status: 'completed',
          winner_id: winnerId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', matchId);

      setMatchId(null);
      setOpponentId(null);
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  return {
    matchId,
    opponentId,
    isSearching,
    findMatch,
    cancelSearch,
    updateGameState,
    endMatch,
  };
};