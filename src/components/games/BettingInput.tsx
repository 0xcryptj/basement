import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface BettingInputProps {
  value: number;
  onChange: (value: number) => void;
  currency: string;
  min?: number;
  max?: number;
  balance?: number;
}

export const BettingInput = ({
  value,
  onChange,
  currency,
  min = 0.01,
  max,
  balance,
}: BettingInputProps) => {
  const increment = (amount: number) => {
    const newValue = Math.max(min, value + amount);
    if (max && newValue > max) return;
    onChange(newValue);
  };

  const setMax = () => {
    if (balance) onChange(balance);
  };

  return (
    <div className="space-y-3">
      {balance !== undefined && (
        <div className="flex justify-between items-center">
          <span className="font-pixel text-[0.6rem] text-muted-foreground">BALANCE</span>
          <span className="font-mono text-sm text-foreground">
            {balance.toFixed(4)} {currency}
          </span>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => increment(-0.01)}
          disabled={value <= min}
          className="px-3 py-2 bg-background border-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover-scale"
          size="sm"
        >
          <Minus className="w-4 h-4" />
        </Button>

        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          min={min}
          max={max}
          step="0.01"
          className="flex-1 bg-background border-2 border-primary/30 text-center font-mono text-lg font-bold text-primary focus:border-primary focus:shadow-glow-cyan"
        />

        <Button
          type="button"
          onClick={() => increment(0.01)}
          disabled={max !== undefined && value >= max}
          className="px-3 py-2 bg-background border-2 border-primary/50 text-primary hover:bg-primary/10 hover-scale"
          size="sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => onChange(0.1)}
          className="flex-1 font-pixel text-[0.5rem] bg-background border border-primary/30 text-primary hover:bg-primary/10 hover-scale py-1"
          size="sm"
        >
          +0.1
        </Button>
        <Button
          type="button"
          onClick={() => onChange(0.5)}
          className="flex-1 font-pixel text-[0.5rem] bg-background border border-primary/30 text-primary hover:bg-primary/10 hover-scale py-1"
          size="sm"
        >
          +0.5
        </Button>
        <Button
          type="button"
          onClick={() => onChange(1)}
          className="flex-1 font-pixel text-[0.5rem] bg-background border border-primary/30 text-primary hover:bg-primary/10 hover-scale py-1"
          size="sm"
        >
          +1
        </Button>
        {balance !== undefined && (
          <Button
            type="button"
            onClick={setMax}
            className="flex-1 font-pixel text-[0.5rem] bg-background border border-accent/50 text-accent hover:bg-accent/10 hover-scale py-1"
            size="sm"
          >
            MAX
          </Button>
        )}
      </div>
    </div>
  );
};