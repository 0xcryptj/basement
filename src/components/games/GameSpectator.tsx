import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";

interface GameSpectatorProps {
  matchId: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const GameSpectator = ({ matchId, onClose, children }: GameSpectatorProps) => {
  const { userId } = useWallet();
  const [spectatorCount, setSpectatorCount] = useState(0);

  useEffect(() => {
    if (userId && matchId) {
      joinAsSpectator();
      subscribeToSpectators();
    }

    return () => {
      if (userId && matchId) {
        leaveAsSpectator();
      }
    };
  }, [userId, matchId]);

  const joinAsSpectator = async () => {
    if (!userId) return;

    await supabase
      .from('game_spectators')
      .insert([{
        match_id: matchId,
        user_id: userId
      }]);

    updateSpectatorCount();
  };

  const leaveAsSpectator = async () => {
    if (!userId) return;

    await supabase
      .from('game_spectators')
      .delete()
      .eq('match_id', matchId)
      .eq('user_id', userId);
  };

  const updateSpectatorCount = async () => {
    const { count } = await supabase
      .from('game_spectators')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', matchId);

    setSpectatorCount(count || 0);
  };

  const subscribeToSpectators = () => {
    const channel = supabase
      .channel(`spectators-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_spectators',
          filter: `match_id=eq.${matchId}`,
        },
        () => updateSpectatorCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:ml-[280px]">
        {/* Header */}
        <div className="max-w-screen-xl mx-auto mb-6">
          <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary" />
                <span className="font-pixel text-sm text-primary">SPECTATING</span>
                <Badge variant="secondary" className="font-mono text-xs bg-primary/20 text-primary border-primary/30">
                  {spectatorCount} watching
                </Badge>
              </div>
              <Button
                onClick={onClose}
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Game Content */}
        <div className="max-w-screen-xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
