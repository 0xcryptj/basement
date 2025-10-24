import { Timer } from "lucide-react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  timeLeft: number;
  label?: string;
}

export const CountdownTimer = ({ timeLeft, label = "DRAWING IN" }: CountdownTimerProps) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="bg-background/30 border border-secondary/20 p-3 text-center rounded">
      <Timer className="w-5 h-5 text-secondary mx-auto mb-1" />
      <div className="font-pixel text-[0.5rem] text-muted-foreground mb-1">{label}</div>
      <motion.div
        className={`font-pixel text-xl ${isUrgent ? "text-destructive animate-glow-pulse" : "text-secondary"}`}
        animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {minutes}:{seconds.toString().padStart(2, "0")}
      </motion.div>
    </div>
  );
};