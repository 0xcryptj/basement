/**
 * CPU OPPONENT AI FOR ARCADE GAMES
 * Demo mode - no wagering required
 */

class CPUOpponent {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.thinkingTime = this.getThinkingTime();
        this.name = this.generateName();
    }

    generateName() {
        const names = [
            'HAL9000', 'CORTANA', 'JARVIS', 'GLaDOS', 'SHODAN',
            'EDI', 'AIDEN', 'NEXUS', 'VEGA', 'CIPHER',
            'MATRIX', 'ZERO', 'BYTE', 'CORE', 'NEURAL'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    getThinkingTime() {
        const times = {
            easy: { min: 1000, max: 2000 },
            medium: { min: 500, max: 1500 },
            hard: { min: 200, max: 800 }
        };
        return times[this.difficulty];
    }

    async makeMove() {
        // Simulate thinking time
        const delay = Math.random() * (this.thinkingTime.max - this.thinkingTime.min) + this.thinkingTime.min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Connect 4 AI
    getConnect4Move(board, playerPiece, cpuPiece) {
        const cols = 7;
        const rows = 6;

        // Check for winning move
        for (let col = 0; col < cols; col++) {
            const tempBoard = this.copyBoard(board);
            if (this.canPlacePiece(tempBoard, col)) {
                this.simulateMove(tempBoard, col, cpuPiece);
                if (this.checkWin(tempBoard, cpuPiece)) {
                    return col;
                }
            }
        }

        // Block player's winning move
        for (let col = 0; col < cols; col++) {
            const tempBoard = this.copyBoard(board);
            if (this.canPlacePiece(tempBoard, col)) {
                this.simulateMove(tempBoard, col, playerPiece);
                if (this.checkWin(tempBoard, playerPiece)) {
                    return col;
                }
            }
        }

        // Difficulty-based strategy
        if (this.difficulty === 'hard') {
            return this.getStrategicMove(board, cpuPiece);
        } else if (this.difficulty === 'medium') {
            return Math.random() < 0.7 ? this.getStrategicMove(board, cpuPiece) : this.getRandomMove(board);
        } else {
            return Math.random() < 0.5 ? this.getStrategicMove(board, cpuPiece) : this.getRandomMove(board);
        }
    }

    canPlacePiece(board, col) {
        return board[0][col] === null;
    }

    simulateMove(board, col, piece) {
        for (let row = 5; row >= 0; row--) {
            if (!board[row][col]) {
                board[row][col] = piece;
                return row;
            }
        }
        return -1;
    }

    checkWin(board, piece) {
        const rows = 6;
        const cols = 7;

        // Horizontal
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 3; c++) {
                if (board[r][c] === piece && board[r][c+1] === piece && 
                    board[r][c+2] === piece && board[r][c+3] === piece) {
                    return true;
                }
            }
        }

        // Vertical
        for (let r = 0; r < rows - 3; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] === piece && board[r+1][c] === piece && 
                    board[r+2][c] === piece && board[r+3][c] === piece) {
                    return true;
                }
            }
        }

        // Diagonal (down-right)
        for (let r = 0; r < rows - 3; r++) {
            for (let c = 0; c < cols - 3; c++) {
                if (board[r][c] === piece && board[r+1][c+1] === piece && 
                    board[r+2][c+2] === piece && board[r+3][c+3] === piece) {
                    return true;
                }
            }
        }

        // Diagonal (up-right)
        for (let r = 3; r < rows; r++) {
            for (let c = 0; c < cols - 3; c++) {
                if (board[r][c] === piece && board[r-1][c+1] === piece && 
                    board[r-2][c+2] === piece && board[r-3][c+3] === piece) {
                    return true;
                }
            }
        }

        return false;
    }

    getStrategicMove(board, cpuPiece) {
        // Prefer center columns
        const centerCols = [3, 2, 4, 1, 5, 0, 6];
        for (const col of centerCols) {
            if (this.canPlacePiece(board, col)) {
                return col;
            }
        }
        return this.getRandomMove(board);
    }

    getRandomMove(board) {
        const validCols = [];
        for (let col = 0; col < 7; col++) {
            if (this.canPlacePiece(board, col)) {
                validCols.push(col);
            }
        }
        return validCols[Math.floor(Math.random() * validCols.length)];
    }

    copyBoard(board) {
        return board.map(row => [...row]);
    }

    // Coin Toss AI (simple 50/50)
    getCoinTossChoice() {
        return Math.random() < 0.5 ? 'heads' : 'tails';
    }

    // Rock Paper Scissors AI
    getRPSChoice() {
        const choices = ['rock', 'paper', 'scissors'];
        if (this.difficulty === 'easy') {
            // Easy: Random
            return choices[Math.floor(Math.random() * 3)];
        } else if (this.difficulty === 'medium') {
            // Medium: Slightly predictable patterns
            return choices[Math.floor(Math.random() * 3)];
        } else {
            // Hard: Counter-strategy (would need game history)
            return choices[Math.floor(Math.random() * 3)];
        }
    }

    // War card game AI
    getWarStrategy(hand) {
        // Simple strategy: play highest or lowest based on difficulty
        if (this.difficulty === 'hard') {
            // Play highest card
            return hand.reduce((max, card) => card.value > max.value ? card : max);
        } else {
            // Play random card
            return hand[Math.floor(Math.random() * hand.length)];
        }
    }

    // Chess AI (simplified)
    getChessMove(board, color) {
        // This would integrate with a chess engine
        // For now, return random valid move
        const validMoves = this.getValidChessMoves(board, color);
        if (validMoves.length === 0) return null;
        
        if (this.difficulty === 'hard') {
            // Prioritize captures and threats
            const captures = validMoves.filter(m => m.capture);
            if (captures.length > 0) {
                return captures[Math.floor(Math.random() * captures.length)];
            }
        }
        
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    getValidChessMoves(board, color) {
        // Placeholder - would implement full chess move validation
        return [];
    }
}

// Export for use in arcade games
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CPUOpponent;
}

