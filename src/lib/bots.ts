// Bot utilities for demo mode games
// Provides AI opponents with Easy, Medium, and Hard difficulty levels

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface BotPlayer {
  id: string;
  username: string;
  difficulty: BotDifficulty;
}

// Bot player IDs (these will be created in database)
export const BOT_PLAYERS: Record<BotDifficulty, BotPlayer> = {
  easy: {
    id: 'bot-easy-00000000-0000-0000-0000-000000000000',
    username: 'Bot (Easy)',
    difficulty: 'easy'
  },
  medium: {
    id: 'bot-medium-00000000-0000-0000-0000-000000000000',
    username: 'Bot (Medium)',
    difficulty: 'medium'
  },
  hard: {
    id: 'bot-hard-00000000-0000-0000-0000-000000000000',
    username: 'Bot (Master)',
    difficulty: 'hard'
  }
};

// Get random bot difficulty
export function getRandomBotDifficulty(): BotDifficulty {
  const rand = Math.random();
  if (rand < 0.4) return 'easy';
  if (rand < 0.8) return 'medium';
  return 'hard';
}

// Get bot player for a difficulty
export function getBotPlayer(difficulty: BotDifficulty = 'medium'): BotPlayer {
  return BOT_PLAYERS[difficulty];
}

// ============================================
// CHESS BOT LOGIC
// ============================================

export interface ChessMove {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface ChessBoard {
  board: number[][]; // 8x8 board, 0=empty, positive=white, negative=black
  currentTurn: 'player1' | 'player2';
}

/**
 * Get chess bot move based on difficulty
 */
export function getChessBotMove(
  board: ChessBoard,
  difficulty: BotDifficulty,
  isPlayer2: boolean
): ChessMove | null {
  const playerPiece = isPlayer2 ? -1 : 1;
  const validMoves = getValidChessMoves(board, isPlayer2);

  if (validMoves.length === 0) return null;

  switch (difficulty) {
    case 'easy':
      // Random valid move
      return validMoves[Math.floor(Math.random() * validMoves.length)];

    case 'medium':
      // Prefer captures, avoid being captured
      const captureMoves = validMoves.filter(m => {
        const target = board.board[m.toY][m.toX];
        return target !== 0 && (target > 0) !== isPlayer2;
      });
      if (captureMoves.length > 0) {
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
      }
      // Random move otherwise
      return validMoves[Math.floor(Math.random() * validMoves.length)];

    case 'hard':
      // Chess master level - use minimax with evaluation
      return getBestChessMove(board, isPlayer2, validMoves);

    default:
      return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
}

function getValidChessMoves(board: ChessBoard, isPlayer2: boolean): ChessMove[] {
  const moves: ChessMove[] = [];
  const playerPiece = isPlayer2 ? -1 : 1;

  // Simplified: Find all pieces of the player and generate basic moves
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.board[y][x];
      if (piece !== 0 && (piece > 0) !== isPlayer2) {
        // Generate basic moves for this piece
        const pieceMoves = generateChessPieceMoves(board, x, y, isPlayer2);
        moves.push(...pieceMoves);
      }
    }
  }

  return moves;
}

function generateChessPieceMoves(
  board: ChessBoard,
  fromX: number,
  fromY: number,
  isPlayer2: boolean
): ChessMove[] {
  const moves: ChessMove[] = [];
  const piece = Math.abs(board.board[fromY][fromX]);
  const playerDir = isPlayer2 ? -1 : 1;

  // Simplified move generation
  if (piece === 1) { // Pawn
    // Move forward
    const newY = fromY + playerDir;
    if (newY >= 0 && newY < 8 && board.board[newY][fromX] === 0) {
      moves.push({ fromX, fromY, toX: fromX, toY: newY });
    }
    // Capture diagonally
    for (const dx of [-1, 1]) {
      const newX = fromX + dx;
      const newY = fromY + playerDir;
      if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
        const target = board.board[newY][newX];
        if (target !== 0 && (target > 0) === !isPlayer2) {
          moves.push({ fromX, fromY, toX: newX, toY: newY });
        }
      }
    }
  } else {
    // For other pieces, generate basic directional moves
    const directions = [
      { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      { dx: 1, dy: 1 }, { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }
    ];

    for (const dir of directions) {
      for (let i = 1; i < 8; i++) {
        const newX = fromX + dir.dx * i;
        const newY = fromY + dir.dy * i;
        if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;

        const target = board.board[newY][newX];
        if (target === 0) {
          moves.push({ fromX, fromY, toX: newX, toY: newY });
        } else {
          if ((target > 0) === !isPlayer2) {
            moves.push({ fromX, fromY, toX: newX, toY: newY });
          }
          break;
        }
      }
    }
  }

  return moves;
}

function getBestChessMove(
  board: ChessBoard,
  isPlayer2: boolean,
  validMoves: ChessMove[]
): ChessMove {
  // Simple evaluation: prefer moves that capture pieces or control center
  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    let score = 0;
    const target = board.board[move.toY][move.toX];

    // Capture bonus
    if (target !== 0 && (target > 0) !== isPlayer2) {
      score += Math.abs(target) * 10;
    }

    // Center control
    const centerDistance = Math.abs(move.toX - 3.5) + Math.abs(move.toY - 3.5);
    score += (7 - centerDistance) * 2;

    // Piece value
    const piece = Math.abs(board.board[move.fromY][move.fromX]);
    score += piece;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// ============================================
// CONNECT4 BOT LOGIC
// ============================================

export interface Connect4Board {
  board: number[][]; // 6x7 board, 0=empty, 1=player1, 2=player2
  currentTurn: 1 | 2;
}

/**
 * Get Connect4 bot move based on difficulty
 */
export function getConnect4BotMove(
  board: Connect4Board,
  difficulty: BotDifficulty,
  isPlayer2: boolean
): number | null {
  const player = isPlayer2 ? 2 : 1;
  const validCols = getValidConnect4Columns(board);

  if (validCols.length === 0) return null;

  switch (difficulty) {
    case 'easy':
      // Random valid column
      return validCols[Math.floor(Math.random() * validCols.length)];

    case 'medium':
      // Block opponent wins, try to win
      const winMove = findWinningMove(board, player);
      if (winMove !== null) return winMove;

      const blockMove = findWinningMove(board, player === 1 ? 2 : 1);
      if (blockMove !== null) return blockMove;

      // Prefer center columns
      const centerCols = validCols.filter(col => col >= 2 && col <= 4);
      if (centerCols.length > 0) {
        return centerCols[Math.floor(Math.random() * centerCols.length)];
      }
      return validCols[Math.floor(Math.random() * validCols.length)];

    case 'hard':
      // Use minimax algorithm
      return getBestConnect4Move(board, player, validCols);

    default:
      return validCols[Math.floor(Math.random() * validCols.length)];
  }
}

function getValidConnect4Columns(board: Connect4Board): number[] {
  const cols: number[] = [];
  for (let col = 0; col < 7; col++) {
    if (board.board[0][col] === 0) {
      cols.push(col);
    }
  }
  return cols;
}

function findWinningMove(board: Connect4Board, player: number): number | null {
  for (let col = 0; col < 7; col++) {
    if (board.board[0][col] !== 0) continue;

    const testBoard = JSON.parse(JSON.stringify(board));
    const row = getNextEmptyRow(testBoard, col);
    if (row === -1) continue;

    testBoard.board[row][col] = player;
    if (checkConnect4Win(testBoard, player, col, row)) {
      return col;
    }
  }
  return null;
}

function getNextEmptyRow(board: Connect4Board, col: number): number {
  for (let row = 5; row >= 0; row--) {
    if (board.board[row][col] === 0) {
      return row;
    }
  }
  return -1;
}

function checkConnect4Win(
  board: Connect4Board,
  player: number,
  col: number,
  row: number
): boolean {
  // Check horizontal
  let count = 1;
  for (let c = col - 1; c >= 0 && board.board[row][c] === player; c--) count++;
  for (let c = col + 1; c < 7 && board.board[row][c] === player; c++) count++;
  if (count >= 4) return true;

  // Check vertical
  count = 1;
  for (let r = row - 1; r >= 0 && board.board[r][col] === player; r--) count++;
  for (let r = row + 1; r < 6 && board.board[r][col] === player; r++) count++;
  if (count >= 4) return true;

  // Check diagonal /
  count = 1;
  for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && board.board[r][c] === player; r--, c--) count++;
  for (let r = row + 1, c = col + 1; r < 6 && c < 7 && board.board[r][c] === player; r++, c++) count++;
  if (count >= 4) return true;

  // Check diagonal \
  count = 1;
  for (let r = row - 1, c = col + 1; r >= 0 && c < 7 && board.board[r][c] === player; r--, c++) count++;
  for (let r = row + 1, c = col - 1; r < 6 && c >= 0 && board.board[r][c] === player; r++, c--) count++;
  if (count >= 4) return true;

  return false;
}

function checkConnect4WinAnywhere(
  board: Connect4Board,
  player: number
): boolean {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (board.board[row][col] === player) {
        if (checkConnect4Win(board, player, col, row)) {
          return true;
        }
      }
    }
  }
  return false;
}

function getBestConnect4Move(
  board: Connect4Board,
  player: number,
  validCols: number[]
): number {
  // Use minimax with limited depth for performance
  let bestCol = validCols[0];
  let bestScore = -Infinity;

  for (const col of validCols) {
    const testBoard = JSON.parse(JSON.stringify(board));
    const row = getNextEmptyRow(testBoard, col);
    if (row === -1) continue;

    testBoard.board[row][col] = player;
    const score = minimaxConnect4(testBoard, 3, false, player);
    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
}

function minimaxConnect4(
  board: Connect4Board,
  depth: number,
  isMaximizing: boolean,
  player: number
): number {
  const opponent = player === 1 ? 2 : 1;

  // Check for wins
  if (checkConnect4WinAnywhere(board, player)) {
    return isMaximizing ? 1000 : -1000;
  }
  if (checkConnect4WinAnywhere(board, opponent)) {
    return isMaximizing ? -1000 : 1000;
  }

  if (depth === 0) {
    return evaluateConnect4Board(board, player);
  }

  const validCols = getValidConnect4Columns(board);
  if (validCols.length === 0) return 0;

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const col of validCols) {
      const testBoard = JSON.parse(JSON.stringify(board));
      const row = getNextEmptyRow(testBoard, col);
      if (row === -1) continue;

      testBoard.board[row][col] = player;
      const score = minimaxConnect4(testBoard, depth - 1, false, player);
      maxScore = Math.max(maxScore, score);
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const col of validCols) {
      const testBoard = JSON.parse(JSON.stringify(board));
      const row = getNextEmptyRow(testBoard, col);
      if (row === -1) continue;

      testBoard.board[row][col] = opponent;
      const score = minimaxConnect4(testBoard, depth - 1, true, player);
      minScore = Math.min(minScore, score);
    }
    return minScore;
  }
}

function evaluateConnect4Board(board: Connect4Board, player: number): number {
  let score = 0;
  const opponent = player === 1 ? 2 : 1;

  // Evaluate based on piece positions and potential threats
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (board.board[row][col] === player) {
        // Center preference
        score += (7 - Math.abs(col - 3)) * 2;
      } else if (board.board[row][col] === opponent) {
        score -= (7 - Math.abs(col - 3)) * 2;
      }
    }
  }

  return score;
}

// ============================================
// WAR BOT LOGIC
// ============================================

/**
 * War is a simple card game - bot just needs to play
 * The winner is determined by card draw, so bot doesn't need strategy
 */
export function getWarBotResult(): { player1Card: number; player2Card: number } {
  // Cards are 1-52 (or 1-13 for simplicity)
  return {
    player1Card: Math.floor(Math.random() * 13) + 1,
    player2Card: Math.floor(Math.random() * 13) + 1
  };
}

// ============================================
// COINTOSS BOT LOGIC
// ============================================

/**
 * CoinToss is random - bot just needs to flip
 */
export function getCoinTossBotResult(): 'heads' | 'tails' {
  return Math.random() > 0.5 ? 'heads' : 'tails';
}

