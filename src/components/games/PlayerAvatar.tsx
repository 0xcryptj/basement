import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  username?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  ringColor?: "primary" | "secondary" | "accent";
  level?: number;
  showLevel?: boolean;
}

export const PlayerAvatar = ({
  username,
  avatarUrl,
  size = "md",
  className,
  ringColor = "primary",
  level,
  showLevel = true,
}: PlayerAvatarProps) => {
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }[size];

  const ringClass = {
    primary: "ring-2 ring-primary/30",
    secondary: "ring-2 ring-secondary/30",
    accent: "ring-2 ring-accent/30",
  }[ringColor];

  const badgeSize = {
    sm: "h-4 w-4 text-[0.4rem]",
    md: "h-5 w-5 text-[0.45rem]",
    lg: "h-6 w-6 text-[0.5rem]",
  }[size];

  const initial = username?.[0]?.toUpperCase() || "?";
  const displayLevel = level || Math.floor(Math.random() * 100) + 1;

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeClass, ringClass, "transition-all hover:scale-110")}>
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback className="bg-primary/20 text-primary font-pixel text-xs">
          {initial}
        </AvatarFallback>
      </Avatar>
      {showLevel && (
        <Badge className={cn(
          "absolute -bottom-1 -right-1 p-0 flex items-center justify-center bg-primary text-primary-foreground font-pixel border-0 rounded-full",
          badgeSize
        )}>
          {displayLevel}
        </Badge>
      )}
    </div>
  );
};