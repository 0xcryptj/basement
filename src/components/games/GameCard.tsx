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
        "bg-[hsl(220,30%,10%)] backdrop-blur-sm border p-4 rounded-lg",
        glowClass,
        animated && "animate-scale-in",
        className
      )}
    >
      {children}
    </Card>
  );
};