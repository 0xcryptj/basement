import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalStats } from "@/components/GlobalStats";
import { JackpotGame } from "@/components/games/JackpotGame";
import { CoinflipGame } from "@/components/games/CoinflipGame";
import { DailyCase } from "@/components/games/DailyCase";
import { WinnerHistory } from "@/components/games/WinnerHistory";
import { LuckOfTheDay } from "@/components/games/LuckOfTheDay";
import { LeftChatSidebar } from "@/components/LeftChatSidebar";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const mockWinners = [
  {
    id: "1",
    username: "CryptoWhale",
    avatarUrl: undefined,
    amount: 5.2345,
    chance: 67.8,
    timestamp: new Date().toISOString(),
    currency: "SOL",
  },
  {
    id: "2",
    username: "DiamondHands",
    amount: 3.1234,
    chance: 45.2,
    timestamp: new Date().toISOString(),
    currency: "SOL",
  },
  {
    id: "3",
    username: "MoonBoi",
    amount: 2.4567,
    chance: 32.1,
    timestamp: new Date().toISOString(),
    currency: "SOL",
  },
];

const Games = () => {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <GlobalStats />
      <LeftChatSidebar />

      {/* Main content with left margin for sidebar */}
      <div className="ml-[280px] pt-20 pb-12 pr-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="font-pixel text-3xl md:text-4xl text-primary mb-3 animate-glow-pulse">
              /CRYPTO GAMES/
            </h1>
            <p className="font-mono text-xs text-muted-foreground max-w-2xl mx-auto">
              Provably fair on-chain betting • Instant payouts • Multi-chain support
            </p>
          </div>

          {!isConnected && (
            <div className="mb-8 bg-card/80 backdrop-blur-sm border border-primary/30 p-6 text-center animate-scale-in rounded-lg">
              <h2 className="font-pixel text-lg text-primary mb-4">Connect Your Wallet</h2>
              <p className="font-mono text-sm text-muted-foreground mb-4">
                Connect your wallet to start playing and earning
              </p>
              <Button asChild className="font-pixel">
                <Link to="/">Go to Home</Link>
              </Button>
            </div>
          )}

          {/* Main Games Grid - 3 columns */}
          <div className="grid lg:grid-cols-12 gap-6 mb-8">
            {/* Main Game Area - Takes 2/3 width */}
            <div className="lg:col-span-8 space-y-6">
              <JackpotGame />
              <CoinflipGame />
            </div>

            {/* Right Sidebar - Takes 1/3 width */}
            <div className="lg:col-span-4 space-y-6">
              <LuckOfTheDay
                winner={{
                  username: "LuckyDegen",
                  amount: 12.5678,
                  chance: 0.87,
                  currency: "SOL",
                  game: "Jackpot",
                }}
              />
              <DailyCase />
              <WinnerHistory winners={mockWinners} />
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-5xl mx-auto bg-card/50 backdrop-blur-sm border border-accent/20 p-6 rounded-lg animate-fade-in">
            <h3 className="font-pixel text-xs text-accent mb-4">HOW IT WORKS</h3>
            <div className="grid md:grid-cols-3 gap-4 font-mono text-xs text-muted-foreground">
              <div className="space-y-2">
                <div className="text-primary font-pixel text-lg">01</div>
                <div className="text-foreground">Connect Wallet</div>
                <div>Connect your Phantom or MetaMask wallet to get started</div>
              </div>
              <div className="space-y-2">
                <div className="text-secondary font-pixel text-lg">02</div>
                <div className="text-foreground">Choose Game</div>
                <div>Select from Jackpot, Coinflip, or claim daily rewards</div>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-pixel text-lg">03</div>
                <div className="text-foreground">Win & Withdraw</div>
                <div>Instant payouts directly to your wallet. Provably fair.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Games;