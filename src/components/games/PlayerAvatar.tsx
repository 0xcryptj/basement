import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  username?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  ringColor?: "primary" | "secondary" | "accent";
}

export const PlayerAvatar = ({
  username,
  avatarUrl,
  size = "md",
  className,
  ringColor = "primary",
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

  const initial = username?.[0]?.toUpperCase() || "?";

  return (
    <Avatar className={cn(sizeClass, ringClass, "transition-all hover:scale-110", className)}>
      <AvatarImage src={avatarUrl} alt={username} />
      <AvatarFallback className="bg-primary/20 text-primary font-pixel text-xs">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
};