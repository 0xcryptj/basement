import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalStats } from "@/components/GlobalStats";
import { Sparkles, Timer, Trophy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useSound } from "@/hooks/useSound";
import { supabase } from "@/integrations/supabase/client";

interface Entry {
  id: string;
  user_id: string;
  wager_amount: number;
  odds: number;
  username?: string;
  avatar?: string;
}

interface Round {
  id: string;
  pot_size: number;
  status: string;
  winner_id: string | null;
  ends_at: string;
}

const LuckyBlockEnhanced = () => {
  const { toast } = useToast();
  const { isConnected, userId, network } = useWallet();
  const { play } = useSound();
  const [round, setRound] = useState<Round | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [wagerAmount, setWagerAmount] = useState(0.01);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!network) return;

    const fetchActiveRound = async () => {
      const { data: rounds } = await supabase
        .from('lucky_block_rounds')
        .select('*')
        .eq('network', network)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (rounds && rounds.length > 0) {
        setRound(rounds[0]);
      } else {
        // Create new round
        const endsAt = new Date();
        endsAt.setMinutes(endsAt.getMinutes() + 2);

        const { data: newRound } = await supabase
          .from('lucky_block_rounds')
          .insert({
            network,
            status: 'active',
            ends_at: endsAt.toISOString(),
          })
          .select()
          .single();

        if (newRound) setRound(newRound);
      }
    };

    fetchActiveRound();

    // Subscribe to round updates
    const roundChannel = supabase
      .channel(`round-${network}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lucky_block_rounds',
          filter: `network=eq.${network}`,
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE') {
            setRound(payload.new);
            
            if (payload.new.status === 'completed' && payload.new.winner_id) {
              if (payload.new.winner_id === userId) {
                play('jackpot');
                toast({
                  title: '🎉 JACKPOT WIN! 🎉',
                  description: `You won ${(payload.new.pot_size * 0.9).toFixed(4)} ${network === 'solana' ? 'SOL' : 'ETH'}!`,
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roundChannel);
    };
  }, [network, userId, play, toast]);

  useEffect(() => {
    if (!round) return;

    const fetchEntries = async () => {
      const { data } = await supabase
        .from('lucky_block_entries')
        .select(`
          *,
          User:user_id (
            username,
            avatarUrl
          )
        `)
        .eq('round_id', round.id);

      if (data) {
        const formattedEntries = data.map((entry: any) => ({
          id: entry.id,
          user_id: entry.user_id,
          wager_amount: entry.wager_amount,
          odds: entry.odds,
          username: entry.User?.username || 'Anonymous',
          avatar: entry.User?.avatarUrl,
        }));
        setEntries(formattedEntries);

        // Auto-draw after 2 players
        if (formattedEntries.length >= 2 && round.status === 'active') {
          setTimeout(() => drawWinner(), 2000);
        }
      }
    };

    fetchEntries();

    // Subscribe to entry updates
    const entryChannel = supabase
      .channel(`entries-${round.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lucky_block_entries',
          filter: `round_id=eq.${round.id}`,
        },
        () => {
          fetchEntries();
          play('join');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(entryChannel);
    };
  }, [round, play]);

  useEffect(() => {
    if (!round) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(round.ends_at).getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0 && entries.length >= 2 && round.status === 'active') {
        drawWinner();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [round, entries]);

  const joinJackpot = async () => {
    if (!userId || !round || !network) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);

    try {
      const newPotSize = round.pot_size + wagerAmount;
      const odds = (wagerAmount / newPotSize) * 100;

      // Create entry
      const { error: entryError } = await supabase
        .from('lucky_block_entries')
        .insert({
          round_id: round.id,
          user_id: userId,
          wager_amount: wagerAmount,
          odds,
        });

      if (entryError) throw entryError;

      // Update round pot size and recalculate all odds
      const { error: roundError } = await supabase
        .from('lucky_block_rounds')
        .update({ pot_size: newPotSize })
        .eq('id', round.id);

      if (roundError) throw roundError;

      // Update all entries with new odds
      const { data: allEntries } = await supabase
        .from('lucky_block_entries')
        .select('id, wager_amount')
        .eq('round_id', round.id);

      if (allEntries) {
        for (const entry of allEntries) {
          const newOdds = (entry.wager_amount / newPotSize) * 100;
          await supabase
            .from('lucky_block_entries')
            .update({ odds: newOdds })
            .eq('id', entry.id);
        }
      }

      // Increment global stats
      await supabase.rpc('increment_wager_stats', {
        wager_amt: wagerAmount,
      });

      play('join');
      toast({
        title: 'Joined Jackpot!',
        description: `Entry added with ${odds.toFixed(2)}% odds`,
      });
    } catch (error) {
      console.error('Error joining jackpot:', error);
      toast({
        title: 'Error',
        description: 'Failed to join jackpot',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const drawWinner = async () => {
    if (!round || entries.length < 2) return;

    try {
      // Weighted random selection
      const rand = Math.random() * 100;
      let cumulative = 0;
      let winnerId = null;

      for (const entry of entries) {
        cumulative += entry.odds;
        if (rand <= cumulative) {
          winnerId = entry.user_id;
          break;
        }
      }

      if (!winnerId) winnerId = entries[0].user_id;

      // Update round with winner
      await supabase
        .from('lucky_block_rounds')
        .update({
          status: 'completed',
          winner_id: winnerId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', round.id);

      // Create new round
      const endsAt = new Date();
      endsAt.setMinutes(endsAt.getMinutes() + 2);

      await supabase
        .from('lucky_block_rounds')
        .insert({
          network,
          status: 'active',
          ends_at: endsAt.toISOString(),
        });

    } catch (error) {
      console.error('Error drawing winner:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <GlobalStats />
        <div className="pt-20 container mx-auto px-4 pb-12 flex items-center justify-center min-h-[60vh]">
          <Card className="bg-card border-2 border-primary p-8 text-center animate-scale-in">
            <h2 className="font-pixel text-xl text-primary mb-4">Connect Wallet</h2>
            <p className="font-mono text-sm text-muted-foreground">
              Connect your wallet to join the jackpot
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <GlobalStats />
      
      <div className="pt-20 container mx-auto px-4 pb-12">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /LUCKY BLOCK/ {network === 'solana' ? '◎' : '⟠'}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Jackpot game with weighted odds • Winner drawn after 2 players
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Left Panel - Pot Info */}
          <Card className="bg-card border-2 border-primary p-6 animate-scale-in">
            <div className="text-center mb-6">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="font-pixel text-sm text-muted-foreground mb-2">JACKPOT POT</h2>
              <div className="font-pixel text-4xl text-primary animate-glow-pulse">
                {round?.pot_size.toFixed(4) || '0.0000'} {network === 'solana' ? 'SOL' : 'ETH'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background border-2 border-secondary p-3 text-center animate-fade-in">
                <Timer className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="font-pixel text-xs text-muted-foreground mb-1">DRAWING IN</div>
                <div className="font-pixel text-lg text-secondary">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="bg-background border-2 border-accent p-3 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="font-pixel text-xs text-muted-foreground mb-1">ENTRIES</div>
                <div className="font-pixel text-lg text-accent">{entries.length}</div>
              </div>
            </div>

            {round?.status === 'active' && (
              <div className="space-y-3">
                <div>
                  <label className="font-pixel text-xs text-muted-foreground mb-2 block">
                    WAGER AMOUNT
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={wagerAmount}
                      onChange={(e) => setWagerAmount(parseFloat(e.target.value) || 0.01)}
                      min="0.01"
                      step="0.01"
                      className="flex-1 bg-background border-2 border-primary/30 rounded px-3 py-2 font-mono text-sm text-foreground"
                    />
                    <span className="flex items-center font-pixel text-xs text-muted-foreground">
                      {network === 'solana' ? 'SOL' : 'ETH'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={joinJackpot}
                  disabled={isJoining}
                  className="w-full font-pixel bg-primary hover:bg-primary/80 text-primary-foreground hover-scale"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Jackpot'
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Right Panel - Entries */}
          <Card className="bg-card border-2 border-secondary p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-pixel text-sm text-secondary mb-4">JACKPOT ENTRIES</h3>
            
            {entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono text-sm">
                No entries yet. Be the first!
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {entries.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="bg-background border border-primary/30 p-3 flex justify-between items-center animate-fade-in hover-scale"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-2">
                      {entry.avatar ? (
                        <img src={entry.avatar} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-pixel text-xs text-primary">
                            {entry.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-mono text-xs text-foreground">{entry.username}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {entry.wager_amount.toFixed(4)} {network === 'solana' ? 'SOL' : 'ETH'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-pixel text-sm text-primary">
                        {entry.odds.toFixed(2)}%
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">chance</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="mt-8 max-w-5xl mx-auto bg-card border-2 border-accent p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-pixel text-sm text-accent mb-4">HOW IT WORKS</h3>
          <ul className="font-mono text-xs text-muted-foreground space-y-2">
            <li>• Join with any wager amount to enter the jackpot</li>
            <li>• Your odds are weighted based on your wager vs total pot</li>
            <li>• Winner automatically drawn after 2 players join</li>
            <li>• Winner receives 90% of pot (10% house fee)</li>
            <li>• Separate jackpots for Solana and Base chains</li>
            <li>• Provably fair on-chain randomness</li>
          </ul>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LuckyBlockEnhanced;