import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface WinnerSparklesProps {
  show: boolean;
}

export const WinnerSparkles = ({ show }: WinnerSparklesProps) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            x: [0, Math.cos((i * Math.PI) / 3) * 40],
            y: [0, Math.sin((i * Math.PI) / 3) * 40],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Sparkles className="w-6 h-6 text-accent" fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
};