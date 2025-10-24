import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, DollarSign } from 'lucide-react';

export const GlobalStats = () => {
  const [stats, setStats] = useState({
    total_wagers_placed: 0,
    total_volume: 0,
    solana_online: 0,
    base_online: 0,
  });

  useEffect(() => {
    // Fetch initial stats
    const fetchStats = async () => {
      const { data } = await supabase
        .from('global_stats')
        .select('*')
        .single();
      
      if (data) {
        setStats(data);
      }
    };

    fetchStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('global-stats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'global_stats',
        },
        (payload: any) => {
          setStats(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed top-20 right-4 bg-card/95 backdrop-blur border-2 border-primary/30 rounded-lg p-4 space-y-3 animate-fade-in z-40">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <div>
          <div className="font-pixel text-xs text-muted-foreground">TOTAL BETS</div>
          <div className="font-pixel text-lg text-primary animate-glow-pulse">
            {stats.total_wagers_placed.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-accent" />
        <div>
          <div className="font-pixel text-xs text-muted-foreground">VOLUME</div>
          <div className="font-pixel text-sm text-accent">
            ${stats.total_volume.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="border-t border-primary/20 pt-2 space-y-1">
        <div className="font-pixel text-xs text-muted-foreground mb-2">ONLINE</div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-secondary" />
            <span className="font-mono text-xs text-muted-foreground">◎ Solana</span>
          </div>
          <span className="font-pixel text-sm text-secondary">{stats.solana_online}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-primary" />
            <span className="font-mono text-xs text-muted-foreground">⟠ Base</span>
          </div>
          <span className="font-pixel text-sm text-primary">{stats.base_online}</span>
        </div>
      </div>
    </div>
  );
};