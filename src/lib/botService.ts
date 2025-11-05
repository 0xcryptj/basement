// Bot service to handle bot moves in demo mode games
import { supabase } from '@/integrations/supabase/client';
import {
  getChessBotMove,
  getConnect4BotMove,
  getWarBotResult,
  getCoinTossBotResult,
  type ChessMove,
  type ChessBoard,
  type Connect4Board,
  type BotDifficulty
} from './bots';
import type { Database } from '@/integrations/supabase/types';

type Json = Database['public']['Tables']['matches']['Row']['game_state'];

interface ChessPiece {
  type?: string;
  color?: string;
}

interface ChessGameState {
  board?: (ChessPiece | null)[][];
  currentTurn?: string;
  lastMove?: { from: { row: number; col: number }; to: { row: number; col: number } };
  lastMoveBy?: string;
  isBot?: boolean;
  botDifficulty?: BotDifficulty;
}

interface Connect4GameState {
  board?: number[][];
  currentTurn?: number;
  lastMove?: { col: number; row: number };
  lastMoveBy?: string;
  isBot?: boolean;
  botDifficulty?: BotDifficulty;
}

interface WarGameState {
  player1Card?: number | null;
  player2Card?: number | null;
  played?: boolean;
  isBot?: boolean;
  botDifficulty?: BotDifficulty;
}

interface CoinTossGameState {
  creatorChoice?: string;
  result?: string;
  won?: boolean;
  isBot?: boolean;
  botDifficulty?: BotDifficulty;
}

/**
 * Process bot move for Chess game
 */
export async function processChessBotMove(
  matchId: string,
  gameState: Json,
  botDifficulty: BotDifficulty,
  isPlayer2: boolean
): Promise<void> {
  try {
    const state = gameState as ChessGameState;
    // Convert game state to bot format - need to convert from ChessPiece format to number format
    const boardArray: number[][] = [];
    const currentBoard = state.board || [];
    
    // Convert ChessPiece[][] to number[][]
    for (let y = 0; y < 8; y++) {
      boardArray[y] = [];
      for (let x = 0; x < 8; x++) {
        const piece = currentBoard[y]?.[x];
        if (!piece) {
          boardArray[y][x] = 0;
        } else {
          // Convert piece to number: white positive, black negative
          const pieceValues: Record<string, number> = {
            pawn: 1, knight: 2, bishop: 3, rook: 4, queen: 5, king: 6
          };
          const value = pieceValues[piece.type] || 1;
          boardArray[y][x] = piece.color === 'white' ? value : -value;
        }
      }
    }

    const board: ChessBoard = {
      board: boardArray,
      currentTurn: isPlayer2 ? 'player2' : 'player1'
    };

    // Get bot move
    const move = getChessBotMove(board, botDifficulty, isPlayer2);
    if (!move) return;

    // Wait a bit to simulate thinking (longer for harder difficulty)
    const thinkTime = botDifficulty === 'easy' ? 1000 : botDifficulty === 'medium' ? 2000 : 3000;
    await new Promise(resolve => setTimeout(resolve, thinkTime));

    // Update game state with bot move
    const newBoard = currentBoard.map((r: (ChessPiece | null)[]) => [...r]);
    const piece = newBoard[move.fromY][move.fromX];
    newBoard[move.toY][move.toX] = piece;
    newBoard[move.fromY][move.fromX] = null;

    // Check if king was captured
    const capturedPiece = currentBoard[move.toY]?.[move.toX];
    const isCheckmate = capturedPiece?.type === 'king';

    // Update match in database
    const updatedState: ChessGameState = {
      ...state,
      board: newBoard,
      currentTurn: isPlayer2 ? 'white' : 'black',
      lastMove: { from: { row: move.fromY, col: move.fromX }, to: { row: move.toY, col: move.toX } },
      lastMoveBy: 'bot'
    };
    
    await supabase
      .from('matches')
      .update({
        game_state: updatedState as Json,
        ...(isCheckmate && {
          status: 'completed',
          winner_id: isPlayer2 ? 'player2' : 'player1',
          completed_at: new Date().toISOString()
        })
      })
      .eq('id', matchId);
  } catch (error) {
    console.error('Error processing chess bot move:', error);
  }
}

/**
 * Process bot move for Connect4 game
 */
export async function processConnect4BotMove(
  matchId: string,
  gameState: Json,
  botDifficulty: BotDifficulty,
  isPlayer2: boolean
): Promise<void> {
  try {
    const state = gameState as Connect4GameState;
    // Convert game state to bot format
    const board: Connect4Board = {
      board: state.board || Array(6).fill(null).map(() => Array(7).fill(0)),
      currentTurn: (state.currentTurn || (isPlayer2 ? 2 : 1)) as 1 | 2
    };

    // Get bot move
    const col = getConnect4BotMove(board, botDifficulty, isPlayer2);
    if (col === null) return;

    // Wait to simulate thinking
    const thinkTime = botDifficulty === 'easy' ? 800 : botDifficulty === 'medium' ? 1500 : 2500;
    await new Promise(resolve => setTimeout(resolve, thinkTime));

    // Find next empty row in column
    const newBoard = JSON.parse(JSON.stringify(state.board || []));
    let row = -1;
    for (let r = 5; r >= 0; r--) {
      if (newBoard[r][col] === 0) {
        row = r;
        break;
      }
    }
    if (row === -1) return;

    // Place piece
    newBoard[row][col] = isPlayer2 ? 2 : 1;

    // Check for win
    let winner = null;
    // Simple win check (can be improved)
    const player = isPlayer2 ? 2 : 1;
    if (checkConnect4Win(newBoard, player, col, row)) {
      winner = isPlayer2 ? 'player2' : 'player1';
    }

    // Update match in database
    const updatedState: Connect4GameState = {
      ...state,
      board: newBoard,
      currentTurn: isPlayer2 ? 2 : 1,
      lastMove: { col, row },
      lastMoveBy: 'bot'
    };
    
    await supabase
      .from('matches')
      .update({
        game_state: updatedState as Json,
        ...(winner && { status: 'completed', winner_id: isPlayer2 ? 'player2' : 'player1' })
      })
      .eq('id', matchId);
  } catch (error) {
    console.error('Error processing Connect4 bot move:', error);
  }
}

function checkConnect4Win(board: number[][], player: number, col: number, row: number): boolean {
  // Check horizontal
  let count = 1;
  for (let c = col - 1; c >= 0 && board[row][c] === player; c--) count++;
  for (let c = col + 1; c < 7 && board[row][c] === player; c++) count++;
  if (count >= 4) return true;

  // Check vertical
  count = 1;
  for (let r = row - 1; r >= 0 && board[r][col] === player; r--) count++;
  for (let r = row + 1; r < 6 && board[r][col] === player; r++) count++;
  if (count >= 4) return true;

  // Check diagonal /
  count = 1;
  for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && board[r][c] === player; r--, c--) count++;
  for (let r = row + 1, c = col + 1; r < 6 && c < 7 && board[r][c] === player; r++, c++) count++;
  if (count >= 4) return true;

  // Check diagonal \
  count = 1;
  for (let r = row - 1, c = col + 1; r >= 0 && c < 7 && board[r][c] === player; r--, c++) count++;
  for (let r = row + 1, c = col - 1; r < 6 && c >= 0 && board[r][c] === player; r++, c--) count++;
  if (count >= 4) return true;

  return false;
}

/**
 * Process bot move for War game
 */
export async function processWarBotMove(
  matchId: string,
  gameState: Json,
  botDifficulty: BotDifficulty
): Promise<void> {
  try {
    const state = gameState as WarGameState;
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get bot card result
    const result = getWarBotResult();
    const isPlayer2 = !state.player1Card;
    
    const newState: WarGameState = {
      ...state,
      [isPlayer2 ? 'player2Card' : 'player1Card']: isPlayer2 ? result.player2Card : result.player1Card,
      played: true
    };

    // Determine winner
    let winnerId = null;
    if (newState.player1Card && newState.player2Card) {
      if (newState.player1Card > newState.player2Card) {
        winnerId = 'player1';
      } else if (newState.player2Card > newState.player1Card) {
        winnerId = 'player2';
      }
    }

    // Update match
    await supabase
      .from('matches')
      .update({
        game_state: newState as Json,
        status: 'completed',
        winner_id: winnerId,
        completed_at: new Date().toISOString()
      })
      .eq('id', matchId);
  } catch (error) {
    console.error('Error processing War bot move:', error);
  }
}

/**
 * Process bot move for CoinToss game
 */
export async function processCoinTossBotMove(
  matchId: string,
  gameState: Json
): Promise<void> {
  try {
    const state = gameState as CoinTossGameState;
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get bot result
    const result = getCoinTossBotResult();
    const userChoice = state.creatorChoice || 'heads';
    
    const won = (result === 'heads' && userChoice === 'heads') || 
                (result === 'tails' && userChoice === 'tails');

    // Update match
    await supabase
      .from('matches')
      .update({
        game_state: {
          ...state,
          result,
          won
        } as Json,
        status: 'completed',
        winner_id: won ? 'player1' : null,
        completed_at: new Date().toISOString()
      })
      .eq('id', matchId);
  } catch (error) {
    console.error('Error processing CoinToss bot move:', error);
  }
}

/**
 * Check if it's bot's turn and process bot move
 */
export async function checkAndProcessBotTurn(matchId: string): Promise<void> {
  try {
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match || match.status !== 'active') return;

    const gameState = (match.game_state || {}) as Json;
    const state = gameState as { botDifficulty?: BotDifficulty; isBot?: boolean };
    const botDifficulty: BotDifficulty = state.botDifficulty || 'medium';
    const isBot = state.isBot || false;

    // Check if player2 is a bot
    const botIds = [
      'bot-easy-00000000-0000-0000-0000-000000000000',
      'bot-medium-00000000-0000-0000-0000-000000000000',
      'bot-hard-00000000-0000-0000-0000-000000000000'
    ];
    const isPlayer2Bot = match.player2_id && botIds.includes(match.player2_id);

    if (!isBot && !isPlayer2Bot) return;

    const isBotPlayer2 = isPlayer2Bot || (isBot && match.player2_id);

    // Process bot move based on game type
    switch (match.game_type) {
      case 'chess':
        await processChessBotMove(matchId, gameState, botDifficulty, isBotPlayer2 as boolean);
        break;
      case 'connect4':
        await processConnect4BotMove(matchId, gameState, botDifficulty, isBotPlayer2 as boolean);
        break;
      case 'war':
        await processWarBotMove(matchId, gameState, botDifficulty);
        break;
      case 'cointoss':
        await processCoinTossBotMove(matchId, gameState);
        break;
    }
  } catch (error) {
    console.error('Error checking bot turn:', error);
  }
}

