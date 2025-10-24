import { useState, useCallback } from "react";

export const useWinnerAnimation = () => {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const celebrateWinner = useCallback((id: string) => {
    setWinnerId(id);
    setShowConfetti(true);
    setShowSparkles(true);

    // Stop confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);
    
    // Stop sparkles after 5 seconds
    setTimeout(() => setShowSparkles(false), 5000);
    
    // Clear winner highlight after 10 seconds
    setTimeout(() => setWinnerId(null), 10000);
  }, []);

  const resetAnimation = useCallback(() => {
    setWinnerId(null);
    setShowConfetti(false);
    setShowSparkles(false);
  }, []);

  return {
    winnerId,
    showConfetti,
    showSparkles,
    celebrateWinner,
    resetAnimation,
  };
};