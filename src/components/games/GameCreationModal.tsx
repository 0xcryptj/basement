import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown } from "lucide-react";

interface GameCreationModalProps {
  open: boolean;
  onClose: () => void;
  gameType: "chess" | "connect4" | "cointoss" | "war";
  onCreateGame: (wagerAmount: number, selectedChoice: string) => Promise<void>;
  balance: number;
  network: string;
}

export const GameCreationModal = ({
  open,
  onClose,
  gameType,
  onCreateGame,
  balance,
  network
}: GameCreationModalProps) => {
  const [wagerAmount, setWagerAmount] = useState(0.001);
  const [selectedChoice, setSelectedChoice] = useState<string>("");

  const getChoiceOptions = () => {
    switch (gameType) {
      case "chess":
        return [
          { value: "white", label: "White ♔" },
          { value: "black", label: "Black ♚" }
        ];
      case "connect4":
        return [
          { value: "red", label: "Red 🔴" },
          { value: "yellow", label: "Yellow 🟡" }
        ];
      case "cointoss":
        return [
          { value: "heads", label: "Heads 🪙" },
          { value: "tails", label: "Tails 🪙" }
        ];
      default:
        return [];
    }
  };

  const handleCreate = async () => {
    try {
      // The transaction signing happens in onCreateGame
      // Don't close modal yet, let the parent handle the flow
      await onCreateGame(wagerAmount, selectedChoice);
      // Only close after successful creation
      onClose();
    } catch (error) {
      // Error handled by parent, keep modal open
      console.error('Error in create game:', error);
    }
  };

  const choiceOptions = getChoiceOptions();
  const needsChoice = choiceOptions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[hsl(220,30%,10%)] border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl text-primary">
            CREATE {gameType.toUpperCase()} GAME
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Wager Amount */}
          <div className="space-y-2">
            <Label className="font-mono text-sm text-muted-foreground">
              Bet Amount ~${(wagerAmount * 192).toFixed(2)}
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-background/50 border border-primary/20 rounded-lg px-3 py-2 flex-1">
                <span className="font-mono text-sm">≡</span>
                <Input
                  type="number"
                  value={wagerAmount}
                  onChange={(e) => setWagerAmount(parseFloat(e.target.value) || 0)}
                  step="0.001"
                  min="0.001"
                  className="border-0 bg-transparent font-mono text-lg p-0 h-auto focus-visible:ring-0"
                />
              </div>
              <Button
                variant="outline"
                className="font-mono text-xs bg-background/50 border-primary/20"
              >
                {network === 'solana' ? 'SOL' : 'ETH'} <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Balance:</span>
              <span className="text-foreground">{balance.toFixed(8)}</span>
            </div>
          </div>

          {/* Choice Selection */}
          {needsChoice && (
            <div className="space-y-3">
              <Label className="font-mono text-sm text-primary">
                Select Your {gameType === "chess" ? "Color" : gameType === "connect4" ? "Color" : "Side"}
              </Label>
              <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice}>
                <div className="grid grid-cols-2 gap-3">
                  {choiceOptions.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedChoice === option.value
                          ? "border-primary bg-primary/10"
                          : "border-primary/20 hover:border-primary/40"
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                      <span className="font-pixel text-sm">{option.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 font-pixel text-sm border-primary/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={wagerAmount <= 0 || (needsChoice && !selectedChoice)}
              className="flex-1 font-pixel text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
            >
              Create Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
