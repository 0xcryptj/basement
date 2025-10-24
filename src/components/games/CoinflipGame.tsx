import { useState } from "react";
import { Coins, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { GameCard } from "./GameCard";
import { BettingInput } from "./BettingInput";
import { PlayerAvatar } from "./PlayerAvatar";
import { motion, AnimatePresence } from "framer-motion";

export const CoinflipGame = () => {
  const { toast } = useToast();
  const { isConnected, network } = useWallet();
  const [wagerAmount, setWagerAmount] = useState(0.1);
  const [selectedSide, setSelectedSide] = useState<"heads" | "tails">("heads");
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [balance] = useState(10.5);

  const handleFlip = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to play",
        variant: "destructive",
      });
      return;
    }

    setIsFlipping(true);
    setResult(null);

    // Simulate flip after 2 seconds
    setTimeout(() => {
      const flipResult = Math.random() > 0.5 ? "heads" : "tails";
      setResult(flipResult);
      setIsFlipping(false);

      if (flipResult === selectedSide) {
        toast({
          title: "🎉 YOU WIN! 🎉",
          description: `Won ${(wagerAmount * 1.9).toFixed(4)} ${network === 'solana' ? 'SOL' : 'ETH'}`,
        });
      } else {
        toast({
          title: "You Lost",
          description: `Better luck next time!`,
          variant: "destructive",
        });
      }
    }, 2000);
  };

  return (
    <GameCard className="border-secondary" glowColor="purple">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Coins className="w-8 h-8 text-secondary animate-pulse" />
            <h2 className="font-pixel text-2xl text-secondary animate-glow-pulse">
              COINFLIP
            </h2>
            <Coins className="w-8 h-8 text-secondary animate-pulse" />
          </div>
          <p className="font-mono text-sm text-muted-foreground italic">
            50/50 • Double or nothing
          </p>
        </div>

        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setSelectedSide("heads")}
            disabled={isFlipping}
            className={`font-pixel text-sm py-8 border-2 transition-all ${
              selectedSide === "heads"
                ? "bg-primary/20 border-primary text-primary shadow-glow-cyan"
                : "bg-background border-primary/30 text-muted-foreground hover:border-primary/50"
            }`}
          >
            <div className="space-y-2">
              <div className="text-4xl">👑</div>
              <div>HEADS</div>
            </div>
          </Button>

          <Button
            onClick={() => setSelectedSide("tails")}
            disabled={isFlipping}
            className={`font-pixel text-sm py-8 border-2 transition-all ${
              selectedSide === "tails"
                ? "bg-secondary/20 border-secondary text-secondary shadow-glow-purple"
                : "bg-background border-secondary/30 text-muted-foreground hover:border-secondary/50"
            }`}
          >
            <div className="space-y-2">
              <div className="text-4xl">⚡</div>
              <div>TAILS</div>
            </div>
          </Button>
        </div>

        {/* Coin Animation */}
        <div className="relative h-32 flex items-center justify-center bg-background border-2 border-secondary/30">
          <AnimatePresence mode="wait">
            {isFlipping ? (
              <motion.div
                key="flipping"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 3600 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="text-8xl"
              >
                🪙
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ scale: 0, rotateY: 0 }}
                animate={{ scale: 1, rotateY: 360 }}
                className="text-center space-y-2"
              >
                <div className="text-6xl">
                  {result === "heads" ? "👑" : "⚡"}
                </div>
                <div className={`font-pixel text-sm ${result === selectedSide ? "text-primary" : "text-destructive"}`}>
                  {result.toUpperCase()}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl opacity-30"
              >
                🪙
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Betting Input */}
        {isConnected && (
          <div className="space-y-4">
            <BettingInput
              value={wagerAmount}
              onChange={setWagerAmount}
              currency={network === 'solana' ? 'SOL' : 'ETH'}
              balance={balance}
              min={0.01}
              max={balance}
            />

            <Button
              onClick={handleFlip}
              disabled={isFlipping || wagerAmount > balance}
              className="w-full font-pixel text-sm py-6 bg-gradient-to-r from-secondary to-accent text-white hover:from-secondary/80 hover:to-accent/80 shadow-glow-purple border-2 border-secondary hover-scale"
            >
              {isFlipping ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  FLIPPING...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  FLIP NOW
                </>
              )}
            </Button>

            {/* Potential Win */}
            <div className="bg-background border border-secondary/20 p-4 text-center">
              <div className="font-pixel text-[0.55rem] text-muted-foreground mb-1">POTENTIAL WIN</div>
              <div className="font-mono text-lg text-secondary">
                {(wagerAmount * 1.9).toFixed(4)} {network === 'solana' ? 'SOL' : 'ETH'}
              </div>
              <div className="font-mono text-xs text-muted-foreground mt-1">
                (10% house fee)
              </div>
            </div>
          </div>
        )}

        {/* Recent Flips */}
        <div className="space-y-2">
          <h3 className="font-pixel text-xs text-secondary">RECENT FLIPS</h3>
          <div className="grid grid-cols-5 gap-2">
            {["heads", "tails", "heads", "heads", "tails"].map((flip, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center text-2xl bg-background border ${
                  flip === "heads" ? "border-primary/30" : "border-secondary/30"
                }`}
              >
                {flip === "heads" ? "👑" : "⚡"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameCard>
  );
};