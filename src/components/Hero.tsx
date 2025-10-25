import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import bk3Image from "@/assets/bk3.png";
import { useState, useEffect } from "react";

const CryptoParticle = ({ delay }: { delay: number }) => {
  const [char, setChar] = useState("0");
  const chars = "0123456789ABCDEFabcdef";
  
  useEffect(() => {
    const interval = setInterval(() => {
      setChar(chars[Math.floor(Math.random() * chars.length)]);
    }, 100 + Math.random() * 200);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className="font-mono text-xs text-primary/60 animate-float">
      {char}
    </span>
  );
};

export const Hero = () => {
  const navigate = useNavigate();
  const [isPortaling, setIsPortaling] = useState(false);

  const handleEnterBasement = () => {
    setIsPortaling(true);
    setTimeout(() => navigate("/chat"), 1000);
  };

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
      
      {/* Floating Particles - Mix of squares and crypto characters */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(80)].map((_, i) => {
          const isCryptoChar = i % 2 === 0;
          return (
            <div
              key={i}
              className="absolute flex flex-col gap-1"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              {isCryptoChar ? (
                <>
                  <CryptoParticle delay={Math.random() * 3} />
                  <CryptoParticle delay={Math.random() * 3 + 0.5} />
                  <CryptoParticle delay={Math.random() * 3 + 1} />
                </>
              ) : (
                <div className="w-1 h-1 bg-primary animate-float" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Portal Animation Overlay */}
      {isPortaling && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 50, opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary z-50 rounded-full"
          style={{ 
            transformOrigin: "center",
            filter: "blur(20px)"
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 px-4 max-w-7xl mx-auto w-full flex justify-center items-center">
        <div className="text-center max-w-2xl ml-20">
        {/* Main Title with Glitch Effect */}
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-pixel text-xl sm:text-2xl md:text-3xl text-primary mb-6"
          style={{ 
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8), 4px 4px 0px rgba(0, 0, 0, 0.4), 0 0 10px hsl(var(--primary) / 0.5)' 
          }}
        >
          WELCOME TO
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl animate-neon-flicker">
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
          <p 
            className="font-mono text-sm sm:text-base md:text-lg text-muted-foreground mb-2"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.4)' }}
          >
            Retro Web3 Arcade • IRC Chat • Anonymous Forum
          </p>
          <p 
            className="font-mono text-xs sm:text-sm text-secondary"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.4)' }}
          >
            Multi-Chain Support: Solana & Base
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button 
            onClick={handleEnterBasement}
            disabled={isPortaling}
            className="font-pixel text-sm sm:text-base px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/80 transition-all hover:scale-105"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
          >
            {isPortaling ? "ENTERING..." : "Enter Basement"}
          </Button>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

