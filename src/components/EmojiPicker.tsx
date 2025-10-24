import { useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const EMOJI_CATEGORIES = {
  pepe: ["🐸", "😏", "😎", "🤡", "💀", "👻", "🤖", "👽", "🦍", "🐒", "🦧", "🐵", "🙈", "🙉", "🙊", "🤠", "🥸", "😈", "👹", "👺", "🤑"],
  memes: ["🚀", "💎", "🙌", "📈", "📉", "🔥", "💯", "🎯", "🎰", "🎲", "🃏", "🏆", "💰", "💸", "🤝", "🫡", "🗿", "☠️", "⚡", "💥", "✨"],
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋"],
  gestures: ["👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖"],
  crypto: ["₿", "Ξ", "₮", "💰", "💸", "💵", "💴", "💶", "💷", "🪙", "💳", "💎", "⚡", "🔥", "🚀", "🌙", "⭐", "✨", "💫"],
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>("smileys");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-2 bg-[hsl(220,30%,8%)] border-primary/20" 
        align="start"
        side="top"
      >
        <div className="space-y-2">
          {/* Category Tabs */}
          <div className="flex gap-1 border-b border-primary/20 pb-2">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
                className={`font-mono text-[0.6rem] h-6 px-2 ${
                  activeCategory === category
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Emoji Grid */}
          <ScrollArea className="h-48">
            <div className="grid grid-cols-7 gap-1">
              {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  onClick={() => onEmojiSelect(emoji)}
                  className="text-xl hover:bg-primary/10 rounded p-1 transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
