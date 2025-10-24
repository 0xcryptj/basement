import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "magenta";
  animated?: boolean;
}

export const GameCard = ({ children, className, glowColor = "cyan", animated = true }: GameCardProps) => {
  const glowClass = {
    cyan: "shadow-glow-cyan",
    purple: "shadow-glow-purple",
    magenta: "shadow-glow-magenta",
  }[glowColor];

  return (
    <Card
      className={cn(
        "bg-card/80 backdrop-blur-sm border-2 p-6",
        glowClass,
        animated && "animate-scale-in hover-scale",
        className
      )}
    >
      {children}
    </Card>
  );
};