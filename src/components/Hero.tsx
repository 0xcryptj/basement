import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, MessageSquare, Layout } from "lucide-react";
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
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-float"
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
          className="font-pixel text-3xl sm:text-4xl md:text-6xl text-primary mb-6 animate-glow-pulse"
        >
          WELCOME TO
          <br />
          <span className="text-4xl sm:text-5xl md:text-7xl animate-neon-flicker">
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

        {/* Feature Cards */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16"
        >
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="IRC Chat"
            description="Terminal-style chatrooms"
            color="cyan"
            delay={1.1}
          />
          <FeatureCard
            icon={<Layout className="w-8 h-8" />}
            title="Forum"
            description="Anonymous image boards"
            color="purple"
            delay={1.2}
          />
          <FeatureCard
            icon={<Gamepad2 className="w-8 h-8" />}
            title="Arcade"
            description="On-chain gaming"
            color="magenta"
            delay={1.3}
          />
        </motion.div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "cyan" | "purple" | "magenta";
  delay: number;
}

const FeatureCard = ({ icon, title, description, color, delay }: FeatureCardProps) => {
  const shadowClass = {
    cyan: "hover:shadow-glow-cyan",
    purple: "hover:shadow-glow-purple",
    magenta: "hover:shadow-glow-magenta",
  }[color];

  const textClass = {
    cyan: "text-primary",
    purple: "text-secondary",
    magenta: "text-accent",
  }[color];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-card border-2 border-${color === "cyan" ? "primary" : color === "purple" ? "secondary" : "accent"} p-6 transition-all duration-300 ${shadowClass} group cursor-pointer`}
    >
      <motion.div 
        className={`${textClass} mb-4 flex justify-center`}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      >
        {icon}
      </motion.div>
      <h3 className="font-pixel text-xs mb-2">{title}</h3>
      <p className="font-mono text-xs text-muted-foreground">{description}</p>
    </motion.div>
  );
};
