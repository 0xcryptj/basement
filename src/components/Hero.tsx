import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import bk3Image from "@/assets/bk3.png";

export const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bk3Image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/95" />
      
      {/* Floating Particles - Squares */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main Title with Glitch Effect */}
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-pixel text-2xl sm:text-3xl md:text-4xl text-primary mb-6 animate-glow-pulse"
        >
          WELCOME TO
          <br />
          <span className="text-3xl sm:text-4xl md:text-5xl animate-neon-flicker">
            THE BASEMENT
          </span>
        </motion.h1>

        {/* Subtitle with Scanline */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative inline-block mb-8"
        >
          <p className="font-mono text-sm sm:text-base md:text-lg text-muted-foreground mb-2">
            Retro Web3 Arcade • IRC Chat • Anonymous Forum
          </p>
          <p className="font-mono text-xs sm:text-sm text-secondary">
            Multi-Chain Support: Solana & Base
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Link to="/chat">
            <Button className="font-pixel text-sm sm:text-base px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/80 shadow-glow-cyan-lg transition-all hover:scale-105">
              Enter Basement
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

