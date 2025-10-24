import { motion } from "framer-motion";

export const NavbarAnimatedBox = () => {
  return (
    <motion.div
      className="fixed top-16 left-0 w-[280px] h-20 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-b-2 border-primary/30 backdrop-blur-sm z-40"
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        borderColor: [
          "hsl(var(--primary) / 0.3)",
          "hsl(var(--accent) / 0.3)",
          "hsl(var(--secondary) / 0.3)",
          "hsl(var(--primary) / 0.3)",
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundSize: "200% 200%",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="font-pixel text-xs text-primary/80"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          LIVE FEED
        </motion.div>
      </div>
    </motion.div>
  );
};
