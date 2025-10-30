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
  const { isConnected } = useWallet();
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

    try {
      // Prompt wallet to sign transaction
      toast({
        title: "Sign Transaction",
        description: "Please confirm the transaction in your wallet"
      });

      // Import contract utilities (properly handle default exports)
      const contractsModule = await import('@/lib/contracts');
      const createGame = contractsModule.createGame || (contractsModule.default && contractsModule.default.createGame);
      
      if (!createGame) {
        throw new Error('Failed to import createGame function');
      }
      
      // Create CoinFlip game with chosen side (0 = heads, 1 = tails)
      const chosenSide = selectedSide === 'heads' ? 0 : 1;
      const { txHash } = await createGame('CoinFlip', wagerAmount, chosenSide);

      console.log('Transaction confirmed:', txHash);

      // Note: The coin flip result is determined on-chain
      // For now, we'll show a placeholder result
      // In production, you'd need to read the game result from the contract
      const flipResult = Math.random() > 0.5 ? "heads" : "tails";
      setResult(flipResult);
      setIsFlipping(false);

      if (flipResult === selectedSide) {
        toast({
          title: "🎉 YOU WIN! 🎉",
          description: `Won ${(wagerAmount * 1.9).toFixed(4)} ETH`,
        });
      } else {
        toast({
          title: "You Lost",
          description: `Better luck next time!`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error flipping coin:', error);
      setIsFlipping(false);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to flip coin",
        variant: "destructive",
      });
    }
  };

  return (
    <GameCard className="border-secondary/30 bg-[hsl(220,30%,10%)]" glowColor="purple">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-secondary" />
            <h2 className="font-pixel text-xl text-secondary">
              COINFLIP
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            The classic 50/50 game mode.
          </p>
        </div>

        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setSelectedSide("heads")}
            disabled={isFlipping}
            className={`font-pixel text-xs py-6 border transition-all ${
              selectedSide === "heads"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background/50 border-primary/20 text-muted-foreground hover:border-primary/40"
            }`}
          >
            <div className="space-y-1">
              <div className="text-2xl">👑</div>
              <div>HEADS</div>
            </div>
          </Button>

          <Button
            onClick={() => setSelectedSide("tails")}
            disabled={isFlipping}
            className={`font-pixel text-xs py-6 border transition-all ${
              selectedSide === "tails"
                ? "bg-secondary/10 border-secondary text-secondary"
                : "bg-background/50 border-secondary/20 text-muted-foreground hover:border-secondary/40"
            }`}
          >
            <div className="space-y-1">
              <div className="text-2xl">⚡</div>
              <div>TAILS</div>
            </div>
          </Button>
        </div>

        {/* Coin Animation */}
        <div className="relative h-24 flex items-center justify-center bg-background/30 border border-secondary/20 rounded">
          <AnimatePresence mode="wait">
            {isFlipping ? (
              <motion.div
                key="flipping"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 3600 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="text-6xl"
              >
                🪙
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ scale: 0, rotateY: 0 }}
                animate={{ scale: 1, rotateY: 360 }}
                className="text-center space-y-1"
              >
                <div className="text-5xl">
                  {result === "heads" ? "👑" : "⚡"}
                </div>
                <div className={`font-pixel text-xs ${result === selectedSide ? "text-primary" : "text-destructive"}`}>
                  {result.toUpperCase()}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl opacity-30"
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
              currency="ETH"
              balance={balance}
              min={0.01}
              max={balance}
            />

            <Button
              onClick={handleFlip}
              disabled={isFlipping || wagerAmount > balance}
              className="w-full font-pixel text-xs py-5 bg-primary hover:bg-primary/80 text-primary-foreground border border-primary/30"
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
            <div className="bg-background/30 border border-secondary/20 p-3 text-center rounded">
              <div className="font-pixel text-[0.5rem] text-muted-foreground mb-1">POTENTIAL WIN</div>
              <div className="font-mono text-base text-secondary">
                {(wagerAmount * 1.9).toFixed(4)} ETH
              </div>
              <div className="font-mono text-[0.6rem] text-muted-foreground mt-0.5">
                (10% house fee)
              </div>
            </div>
          </div>
        )}

        {/* Recent Flips */}
        <div className="space-y-2">
          <h3 className="font-pixel text-[0.6rem] text-secondary">RECENT FLIPS</h3>
          <div className="grid grid-cols-5 gap-2">
            {["heads", "tails", "heads", "heads", "tails"].map((flip, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center text-xl bg-background/30 border rounded ${
                  flip === "heads" ? "border-primary/20" : "border-secondary/20"
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