import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import bk3Image from "@/assets/bk3.png";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/contexts/WalletContext";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useToast } from "@/hooks/use-toast";
import { Crown, Loader2 } from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChainIndicator } from "@/components/ChainIndicator";
import { supabase } from "@/integrations/supabase/client";
import { checkAndProcessBotTurn } from "@/lib/botService";
import type { Database } from "@/integrations/supabase/types";

type Json = Database['public']['Tables']['matches']['Row']['game_state'];

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type PieceColor = "white" | "black";

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

interface Position {
  row: number;
  col: number;
}

const ChessMultiplayer = () => {
  const { userId, address, network } = useWallet();
  const { toast } = useToast();
  const { matchId, opponentId, isSearching, findMatch, cancelSearch, updateGameState, endMatch } =
    useMatchmaking("chess");

  const [wagerAmount, setWagerAmount] = useState("0.01");
  const [board, setBoard] = useState<(ChessPiece | null)[][]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("white");
  const [playerColor, setPlayerColor] = useState<PieceColor | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Initialize board
  useEffect(() => {
    initializeBoard();
  }, []);

  // Subscribe to game state updates
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`chess-game-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload: { new: { game_state: { board?: (ChessPiece | null)[][]; currentTurn?: string; lastMoveBy?: string; isBot?: boolean } | null; status: string; winner_id: string | null } }) => {
          const gameState = payload.new.game_state;
          if (gameState?.board) {
            setBoard(gameState.board);
            if (gameState.currentTurn) {
              setCurrentTurn(gameState.currentTurn as PieceColor);
            }
            
            // Check if it's bot's turn and process bot move
            if (gameState.isBot || gameState.lastMoveBy !== 'bot') {
              setTimeout(() => {
                checkAndProcessBotTurn(matchId);
              }, 1000);
            }
          }
          if (payload.new.status === "completed") {
            setGameOver(true);
            setWinner(payload.new.winner_id);
          }
        }
      )
      .subscribe();

    // Determine player color
    if (opponentId) {
      setPlayerColor("white"); // First player is white
    } else {
      setPlayerColor("black"); // Second player is black
    }

    // Check if it's a bot game and process bot's first move if needed
    if (matchId) {
      checkAndProcessBotTurn(matchId);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, opponentId]);

  const initializeBoard = () => {
    const newBoard: (ChessPiece | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Setup pawns - White on bottom (row 6-7), Black on top (row 0-1)
    for (let i = 0; i < 8; i++) {
      newBoard[1][i] = { type: "pawn", color: "black" }; // Top row pawns
      newBoard[6][i] = { type: "pawn", color: "white" }; // Bottom row pawns
    }

    // Setup back row - White pieces on bottom (row 7), Black pieces on top (row 0)
    const backRowSetup: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
    for (let i = 0; i < 8; i++) {
      newBoard[0][i] = { type: backRowSetup[i], color: "black" };
      newBoard[7][i] = { type: backRowSetup[i], color: "white" };
    }

    setBoard(newBoard);
  };

  const getPieceSymbol = (piece: ChessPiece): string => {
    const symbols = {
      white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
      black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
    };
    return symbols[piece.color][piece.type];
  };

  const isValidMove = (from: Position, to: Position): boolean => {
    const piece = board[from.row][from.col];
    if (!piece || piece.color !== currentTurn) return false;

    const targetPiece = board[to.row][to.col];
    if (targetPiece && targetPiece.color === piece.color) return false;

    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    // Basic movement validation (simplified)
    switch (piece.type) {
      case "pawn": {
        const direction = piece.color === "white" ? -1 : 1;
        const startRow = piece.color === "white" ? 6 : 1;
        if (colDiff === 0) {
          if (to.row === from.row + direction && !targetPiece) return true;
          if (from.row === startRow && to.row === from.row + 2 * direction && !targetPiece) return true;
        }
        if (colDiff === 1 && to.row === from.row + direction && targetPiece) return true;
        return false;
      }

      case "rook":
        return (rowDiff === 0 || colDiff === 0) && isPathClear(from, to);

      case "knight":
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case "bishop":
        return rowDiff === colDiff && isPathClear(from, to);

      case "queen":
        return (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) && isPathClear(from, to);

      case "king":
        return rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
  };

  const isPathClear = (from: Position, to: Position): boolean => {
    const rowStep = to.row > from.row ? 1 : to.row < from.row ? -1 : 0;
    const colStep = to.col > from.col ? 1 : to.col < from.col ? -1 : 0;

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row || currentCol !== to.col) {
      if (board[currentRow][currentCol] !== null) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  };

  const handleSquareClick = async (row: number, col: number) => {
    if (!matchId || gameOver || playerColor !== currentTurn) return;

    if (selectedPiece) {
      const from = selectedPiece;
      const to = { row, col };

      if (isValidMove(from, to)) {
        const newBoard = board.map((r) => [...r]);
        const piece = newBoard[from.row][from.col];
        newBoard[to.row][to.col] = piece;
        newBoard[from.row][from.col] = null;

        // Check if king was captured
        const capturedPiece = board[to.row][to.col];
        if (capturedPiece?.type === "king") {
          setGameOver(true);
          setWinner(userId!);
          await endMatch(userId!);
          toast({
            title: "Victory!",
            description: "You captured the king!",
          });
        } else {
          setBoard(newBoard);
          const nextTurn = currentTurn === "white" ? "black" : "white";
          setCurrentTurn(nextTurn);

          await updateGameState({
            board: newBoard,
            currentTurn: nextTurn,
            lastMove: { from, to },
            lastMoveBy: 'player'
          } as unknown as Json);
          
          // Check if opponent is bot and trigger bot move
          setTimeout(() => {
            checkAndProcessBotTurn(matchId);
          }, 1000);
        }
      }

      setSelectedPiece(null);
    } else {
      const piece = board[row][col];
      if (piece && piece.color === currentTurn && piece.color === playerColor) {
        setSelectedPiece({ row, col });
      }
    }
  };

  const handlePlayAgain = () => {
    initializeBoard();
    setSelectedPiece(null);
    setCurrentTurn("white");
    setGameOver(false);
    setWinner(null);
    setPlayerColor(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <div className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none" style={{ backgroundImage: 'url(/src/assets/bk3.png)' }} />
      <Navbar />
      <ChainIndicator />
      <ChatSidebar />

      <div className="flex-1 pt-20 container mx-auto px-4 pb-12 lg:ml-[280px] transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /CHESS/
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            On-chain strategy game
          </p>
        </div>

        {!matchId ? (
          <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-2 border-primary p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <Crown className="w-16 h-16 text-primary animate-glow-pulse" />
              </div>

              <div>
                <label className="font-pixel text-xs text-primary block mb-2">
                  WAGER AMOUNT (ETH)
                </label>
                <Input
                  type="number"
                  step="0.001"
                  value={wagerAmount}
                  onChange={(e) => setWagerAmount(e.target.value)}
                  className="font-mono text-center text-lg border-primary focus:shadow-glow-cyan"
                  disabled={isSearching}
                />
              </div>

              <Button
                onClick={() => findMatch(parseFloat(wagerAmount))}
                disabled={isSearching || !userId}
                className="w-full font-pixel text-sm bg-primary hover:bg-primary/80 shadow-glow-cyan"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    SEARCHING...
                  </>
                ) : (
                  "FIND MATCH"
                )}
              </Button>

              {isSearching && (
                <Button
                  onClick={cancelSearch}
                  variant="outline"
                  className="w-full font-pixel text-xs border-accent text-accent hover:bg-accent/20"
                >
                  CANCEL
                </Button>
              )}

              {!userId && (
                <p className="font-mono text-xs text-muted-foreground text-center">
                  Connect your wallet to play
                </p>
              )}
            </div>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div className="font-pixel text-xs text-muted-foreground">
                Your Color: {playerColor?.toUpperCase()}
              </div>
              <div className="font-pixel text-xs text-primary">
                Turn: {currentTurn.toUpperCase()}
              </div>
            </div>

            {/* Chess Board - Fixed size on mobile */}
            <div className="w-full max-w-[350px] sm:max-w-xl mx-auto bg-card/80 backdrop-blur-sm border-2 border-primary p-2 shadow-glow-cyan">
              <div className="grid grid-cols-8 gap-0 aspect-square">
                {board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0;
                    const isSelected =
                      selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;

                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl transition-all ${
                          isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]"
                        } ${
                          isSelected
                            ? "ring-4 ring-inset ring-primary shadow-glow-cyan"
                            : "hover:ring-2 hover:ring-primary/50"
                        } ${
                          playerColor === currentTurn && !gameOver
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                        }`}
                        disabled={playerColor !== currentTurn || gameOver}
                      >
                        {piece && (
                          <span 
                            className={`select-none font-bold ${
                              piece.color === "white" 
                                ? "text-white" 
                                : "text-black"
                            }`}
                            style={{
                              filter: piece.color === "white"
                                ? "drop-shadow(0 2px 3px rgba(0,0,0,0.9))"
                                : "drop-shadow(0 1px 2px rgba(255,255,255,0.6))",
                              textShadow: piece.color === "white" 
                                ? "0 2px 4px rgba(0,0,0,0.8)" 
                                : "0 1px 2px rgba(255,255,255,0.5)"
                            }}
                          >
                            {getPieceSymbol(piece)}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {gameOver && (
              <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary p-6 text-center">
                <h2 className="font-pixel text-xl text-primary mb-4">
                  {winner === userId ? "YOU WIN!" : "YOU LOSE"}
                </h2>
                <Button
                  onClick={handlePlayAgain}
                  className="font-pixel text-sm bg-primary hover:bg-primary/80 shadow-glow-cyan"
                >
                  PLAY AGAIN
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ChessMultiplayer;