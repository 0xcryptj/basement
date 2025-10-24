import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CellState = 0 | 1 | 2; // 0 = empty, 1 = player 1, 2 = player 2

const Connect4 = () => {
  const { toast } = useToast();
  const ROWS = 6;
  const COLS = 7;
  
  const [board, setBoard] = useState<CellState[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const checkWin = (board: CellState[][], row: number, col: number, player: CellState): boolean => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal \
      [1, -1], // diagonal /
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      
      // Check positive direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }
      
      // Check negative direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }
      
      if (count >= 4) return true;
    }
    
    return false;
  };

  const dropPiece = (col: number) => {
    if (gameOver || winner) return;
    
    // Find the lowest empty row in this column
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        row = r;
        break;
      }
    }
    
    if (row === -1) return; // Column is full
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    
    if (checkWin(newBoard, row, col, currentPlayer)) {
      setWinner(`Player ${currentPlayer} Wins!`);
      setGameOver(true);
      toast({
        title: `Player ${currentPlayer} Wins!`,
        description: "Congratulations!",
      });
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setCurrentPlayer(1);
    setWinner(null);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 container mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /CONNECT 4/
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Connect four to win
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="bg-card border-2 border-primary p-8">
            {winner && (
              <div className="text-center mb-6">
                <h2 className="font-pixel text-2xl text-accent animate-glow-pulse">
                  {winner}
                </h2>
              </div>
            )}
            
            {!gameOver && (
              <div className="text-center mb-6">
                <p className="font-pixel text-sm">
                  <span className={currentPlayer === 1 ? "text-primary" : "text-secondary"}>
                    Player {currentPlayer}'s Turn
                  </span>
                </p>
              </div>
            )}

            {/* Game Board */}
            <div className="bg-background border-2 border-accent p-4 mb-6">
              <div className="grid grid-cols-7 gap-2">
                {board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <button
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => dropPiece(colIdx)}
                      disabled={gameOver}
                      className="aspect-square bg-muted border-2 border-primary rounded-full flex items-center justify-center hover:bg-muted/70 transition-colors"
                    >
                      {cell === 1 && <Circle className="w-8 h-8 text-primary fill-primary" />}
                      {cell === 2 && <Circle className="w-8 h-8 text-secondary fill-secondary" />}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={resetGame}
                className="font-pixel bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                New Game
              </Button>
            </div>
          </Card>

          <div className="mt-8 bg-card border-2 border-accent p-6">
            <h3 className="font-pixel text-sm text-accent mb-4">GAME RULES</h3>
            <ul className="font-mono text-xs text-muted-foreground space-y-2">
              <li>• Players alternate dropping pieces</li>
              <li>• Connect 4 pieces horizontally, vertically, or diagonally to win</li>
              <li>• Winner takes 90% of pot</li>
              <li>• 10% house fee on winnings</li>
              <li>• On-chain state verification</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Connect4;
