import { Gamepad2, Trophy, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import warGameImg from "@/assets/war-game.png";
import chessGameImg from "@/assets/chess-game.png";
import connect4GameImg from "@/assets/connect4-game.png";

interface Game {
  id: string;
  name: string;
  description: string;
  minBet: string;
  status: "live" | "coming-soon";
  color: string;
  image: string;
}

const Arcade = () => {
  const games: Game[] = [
    {
      id: "1",
      name: "WAR",
      description: "Classic card battle",
      minBet: "0.01 ETH",
      status: "live",
      color: "primary",
      image: warGameImg,
    },
    {
      id: "2",
      name: "CHESS",
      description: "On-chain strategy",
      minBet: "0.05 ETH",
      status: "coming-soon",
      color: "secondary",
      image: chessGameImg,
    },
    {
      id: "3",
      name: "CONNECT4",
      description: "Connect to win",
      minBet: "0.02 ETH",
      status: "coming-soon",
      color: "accent",
      image: connect4GameImg,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 container mx-auto px-4 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /ARCADE/
          </h1>
          <p className="font-mono text-sm text-muted-foreground mb-2">
            On-chain games with smart contract verification
          </p>
          <p className="font-mono text-xs text-secondary">
            10% house fee on all winnings
          </p>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
          <div className="bg-card border-2 border-primary p-4 text-center shadow-glow-cyan">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-pixel text-xs text-primary mb-1">PROVABLY FAIR</p>
            <p className="font-mono text-xs text-muted-foreground">
              Smart contract verified
            </p>
          </div>
          <div className="bg-card border-2 border-secondary p-4 text-center shadow-glow-purple">
            <Coins className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="font-pixel text-xs text-secondary mb-1">AUTO PAYOUT</p>
            <p className="font-mono text-xs text-muted-foreground">
              Instant settlement
            </p>
          </div>
          <div className="bg-card border-2 border-accent p-4 text-center shadow-glow-magenta">
            <Gamepad2 className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="font-pixel text-xs text-accent mb-1">MULTI-CHAIN</p>
            <p className="font-mono text-xs text-muted-foreground">
              Solana & Base
            </p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game) => (
            <div
              key={game.id}
              className={`bg-card border-2 ${
                game.color === "primary"
                  ? "border-primary"
                  : game.color === "secondary"
                  ? "border-secondary"
                  : "border-accent"
              } p-6 transition-all duration-300 hover:scale-105 group relative overflow-hidden`}
            >
              {/* Status Badge */}
              {game.status === "coming-soon" && (
                <div className="absolute top-3 right-3 bg-muted px-2 py-1">
                  <span className="font-pixel text-[0.5rem] text-muted-foreground">
                    SOON
                  </span>
                </div>
              )}

              {/* Game Image */}
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 overflow-hidden rounded border-2 border-primary">
                  <img 
                    src={game.image} 
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Game Info */}
              <h3 className="font-pixel text-xl text-center mb-2 group-hover:animate-glow-pulse">
                {game.name}
              </h3>
              <p className="font-mono text-sm text-muted-foreground text-center mb-4">
                {game.description}
              </p>
              <p className="font-mono text-xs text-center text-primary mb-4">
                Min Bet: {game.minBet}
              </p>

              {/* Play Button */}
              <Button
                disabled={game.status === "coming-soon"}
                className={`w-full font-pixel text-xs ${
                  game.status === "live"
                    ? game.color === "primary"
                      ? "bg-primary text-primary-foreground hover:bg-primary/80 shadow-glow-cyan"
                      : game.color === "secondary"
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-glow-purple"
                      : "bg-accent text-accent-foreground hover:bg-accent/80 shadow-glow-magenta"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {game.status === "live" ? "Play Now" : "Coming Soon"}
              </Button>
            </div>
          ))}
        </div>

        {/* Contract Info */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-card border-2 border-primary p-6">
            <h2 className="font-pixel text-sm text-primary mb-4">
              SMART CONTRACTS
            </h2>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Base Token:</span>
                <a 
                  href="https://dexscreener.com/base/0xfd730abb25c17e5bccf3bad3016ccc861bffbc7b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:shadow-glow-cyan transition-all"
                >
                  0xfd73...bc7b
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Solana Token:</span>
                <a 
                  href="https://dexscreener.com/solana/D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:shadow-glow-purple transition-all"
                >
                  D4MX...pump
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">House Fee:</span>
                <span className="text-accent">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Arcade;
