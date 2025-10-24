import { Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "./GameCard";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";

export const DailyCase = () => {
  const { toast } = useToast();
  const { isConnected } = useWallet();
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<number | null>(null);

  const handleOpen = () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Connect your wallet to claim rewards",
        variant: "destructive",
      });
      return;
    }

    setIsOpening(true);
    
    setTimeout(() => {
      const rewardAmount = (Math.random() * 0.5 + 0.1);
      setReward(rewardAmount);
      setIsOpening(false);

      toast({
        title: "🎁 Daily Reward Claimed!",
        description: `You received ${rewardAmount.toFixed(4)} SOL`,
      });

      setTimeout(() => setReward(null), 3000);
    }, 2000);
  };

  return (
    <GameCard className="border-accent relative overflow-hidden" glowColor="magenta">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full"
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, -200],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: "100%",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Gift className="w-12 h-12 text-accent mx-auto" />
          </motion.div>
          <h3 className="font-pixel text-lg text-accent">DAILY CASE</h3>
          <p className="font-mono text-xs text-muted-foreground">
            Free rewards every 24h
          </p>
        </div>

        {/* Case Display */}
        <motion.div
          animate={isOpening ? { scale: [1, 1.2, 0.8, 1.1, 1], rotate: [0, 10, -10, 5, 0] } : {}}
          className="relative h-32 flex items-center justify-center"
        >
          {reward ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center space-y-2"
            >
              <Sparkles className="w-12 h-12 text-accent mx-auto animate-pulse" />
              <div className="font-pixel text-xl text-accent">
                +{reward.toFixed(4)} SOL
              </div>
            </motion.div>
          ) : (
            <div className="text-8xl">
              {isOpening ? "📦" : "🎁"}
            </div>
          )}
        </motion.div>

        {/* Open Button */}
        <Button
          onClick={handleOpen}
          disabled={isOpening}
          className="w-full font-pixel text-sm py-6 bg-gradient-to-r from-accent to-secondary text-white hover:from-accent/80 hover:to-secondary/80 shadow-glow-magenta border-2 border-accent hover-scale"
        >
          {isOpening ? "OPENING..." : "OPEN CASE"}
        </Button>

        {/* Countdown */}
        <div className="text-center">
          <div className="font-pixel text-[0.5rem] text-muted-foreground">NEXT CASE IN</div>
          <div className="font-mono text-sm text-accent">23:45:12</div>
        </div>
      </div>
    </GameCard>
  );
};