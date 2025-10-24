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
    <div className="bg-background border-2 border-secondary p-4 text-center">
      <Timer className="w-6 h-6 text-secondary mx-auto mb-2" />
      <div className="font-pixel text-[0.6rem] text-muted-foreground mb-2">{label}</div>
      <motion.div
        className={`font-pixel text-2xl ${isUrgent ? "text-destructive animate-glow-pulse" : "text-secondary"}`}
        animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {minutes}:{seconds.toString().padStart(2, "0")}
      </motion.div>
    </div>
  );
};