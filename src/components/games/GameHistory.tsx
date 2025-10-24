import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HistoricalGame {
  id: string;
  gameType: string;
  winner: {
    username: string;
    avatarUrl?: string;
  };
  loser: {
    username: string;
    avatarUrl?: string;
  };
  wagerAmount: number;
  winAmount: number;
  timestamp: string;
  network: string;
}

const mockHistory: HistoricalGame[] = [
  {
    id: "1",
    gameType: "CoinToss",
    winner: { username: "CryptoKing", avatarUrl: undefined },
    loser: { username: "DeFiDegen", avatarUrl: undefined },
    wagerAmount: 0.5,
    winAmount: 0.9,
    timestamp: "2 hours ago",
    network: "solana"
  },
  {
    id: "2",
    gameType: "War",
    winner: { username: "BaseChad", avatarUrl: undefined },
    loser: { username: "EthMaxi", avatarUrl: undefined },
    wagerAmount: 0.25,
    winAmount: 0.45,
    timestamp: "3 hours ago",
    network: "base"
  },
  {
    id: "3",
    gameType: "Connect4",
    winner: { username: "SolWhale", avatarUrl: undefined },
    loser: { username: "MoonBoi", avatarUrl: undefined },
    wagerAmount: 1.0,
    winAmount: 1.8,
    timestamp: "5 hours ago",
    network: "solana"
  },
  {
    id: "4",
    gameType: "CoinToss",
    winner: { username: "DiamondHands", avatarUrl: undefined },
    loser: { username: "PaperHands", avatarUrl: undefined },
    wagerAmount: 0.1,
    winAmount: 0.18,
    timestamp: "6 hours ago",
    network: "base"
  },
  {
    id: "5",
    gameType: "War",
    winner: { username: "GigaBrain", avatarUrl: undefined },
    loser: { username: "Ape4Life", avatarUrl: undefined },
    wagerAmount: 0.75,
    winAmount: 1.35,
    timestamp: "8 hours ago",
    network: "solana"
  },
];

export const GameHistory = () => {
  return (
    <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border-primary/20 p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-pixel text-sm text-primary">Recent Games</h3>
      </div>

      <div className="space-y-3">
        {mockHistory.map((game) => (
          <div
            key={game.id}
            className="bg-background/50 border border-primary/10 rounded p-3 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <Badge
                variant="outline"
                className="font-mono text-xs border-primary/20"
              >
                {game.gameType}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {game.timestamp}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="w-8 h-8 border border-accent/30">
                  <AvatarImage src={game.winner.avatarUrl} />
                  <AvatarFallback className="bg-accent/20 text-accent font-pixel text-xs">
                    {game.winner.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-accent shrink-0" />
                    <p className="font-mono text-xs text-foreground truncate">
                      {game.winner.username}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-accent">
                    +{game.winAmount.toFixed(2)} {game.network === 'solana' ? '◎' : '⟠'}
                  </p>
                </div>
              </div>

              <div className="font-pixel text-xs text-muted-foreground px-3">
                vs
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <div className="min-w-0 flex-1 text-right">
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {game.loser.username}
                  </p>
                  <p className="font-mono text-xs text-destructive">
                    -{game.wagerAmount.toFixed(2)} {game.network === 'solana' ? '◎' : '⟠'}
                  </p>
                </div>
                <Avatar className="w-8 h-8 border border-muted/30">
                  <AvatarImage src={game.loser.avatarUrl} />
                  <AvatarFallback className="bg-muted/20 text-muted-foreground font-pixel text-xs">
                    {game.loser.username[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
