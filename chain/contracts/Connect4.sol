// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Connect4 - On-Chain Connect 4 Game
 * @notice Classic Connect 4 game with on-chain state tracking
 * @dev Players take turns, winner determined by 4-in-a-row detection, 10% house fee
 */

contract Connect4 {
    // Constants
    uint8 constant ROWS = 6;
    uint8 constant COLS = 7;
    address public houseWallet = 0x5CAdda44709251088663E94b13ad3d5E38466b4d;
    uint256 public constant HOUSE_FEE_PERCENT = 10;
    uint256 public constant TIMEOUT_DURATION = 5 minutes;
    
    uint256 public gameCounter;

    struct Game {
        address player1;
        address player2;
        uint256 wager;
        uint8[ROWS][COLS] board; // 0 = empty, 1 = player1, 2 = player2
        address currentTurn;
        address winner;
        uint256 lastMoveTime;
        bool isActive;
        bool isComplete;
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256) public activeGames;

    // Events
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 wager);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 col);
    event GameComplete(uint256 indexed gameId, address indexed winner, uint256 payout);
    event GameTimeout(uint256 indexed gameId, address indexed winner);

    // Errors
    error InvalidWager();
    error GameNotActive();
    error AlreadyInGame();
    error NotYourGame();
    error NotYourTurn();
    error InvalidMove();
    error ColumnFull();

    /**
     * @notice Create a new Connect4 game
     */
    function createGame() external payable {
        if (msg.value == 0) revert InvalidWager();
        if (activeGames[msg.sender] != 0) revert AlreadyInGame();

        gameCounter++;
        uint256 gameId = gameCounter;

        Game storage game = games[gameId];
        game.player1 = msg.sender;
        game.wager = msg.value;
        game.isActive = true;
        game.lastMoveTime = block.timestamp;

        activeGames[msg.sender] = gameId;

        emit GameCreated(gameId, msg.sender, msg.value);
    }

    /**
     * @notice Join an existing game
     */
    function joinGame(uint256 gameId) external payable {
        Game storage game = games[gameId];

        if (!game.isActive) revert GameNotActive();
        if (msg.value != game.wager) revert InvalidWager();
        if (activeGames[msg.sender] != 0) revert AlreadyInGame();
        if (game.player1 == msg.sender) revert NotYourGame();
        if (game.player2 != address(0)) revert GameNotActive();

        game.player2 = msg.sender;
        game.currentTurn = game.player1; // Player 1 starts
        game.lastMoveTime = block.timestamp;

        activeGames[msg.sender] = gameId;

        emit GameJoined(gameId, msg.sender);
    }

    /**
     * @notice Make a move by dropping a disc in a column
     * @param gameId The game ID
     * @param col The column to drop the disc (0-6)
     */
    function makeMove(uint256 gameId, uint8 col) external {
        Game storage game = games[gameId];

        if (!game.isActive) revert GameNotActive();
        if (game.currentTurn != msg.sender) revert NotYourTurn();
        if (col >= COLS) revert InvalidMove();

        // Find the lowest empty row in the column
        uint8 row = ROWS;
        for (uint8 r = 0; r < ROWS; r++) {
            if (game.board[col][r] == 0) {
                row = r;
                break;
            }
        }

        if (row == ROWS) revert ColumnFull();

        // Place the disc
        uint8 playerNum = (msg.sender == game.player1) ? 1 : 2;
        game.board[col][row] = playerNum;
        game.lastMoveTime = block.timestamp;

        emit MoveMade(gameId, msg.sender, col);

        // Check for win
        if (_checkWin(game.board, col, row, playerNum)) {
            _endGame(gameId, msg.sender);
            return;
        }

        // Check for draw (board full)
        if (_isBoardFull(game.board)) {
            _refundGame(gameId);
            return;
        }

        // Switch turn
        game.currentTurn = (game.currentTurn == game.player1) ? game.player2 : game.player1;
    }

    /**
     * @notice Claim win by timeout if opponent doesn't move within time limit
     */
    function claimTimeout(uint256 gameId) external {
        Game storage game = games[gameId];

        if (!game.isActive) revert GameNotActive();
        if (block.timestamp < game.lastMoveTime + TIMEOUT_DURATION) revert NotYourTurn();
        if (msg.sender != game.player1 && msg.sender != game.player2) revert NotYourGame();

        // The player who DIDN'T timeout wins
        address winner = (game.currentTurn == game.player1) ? game.player2 : game.player1;
        
        emit GameTimeout(gameId, winner);
        _endGame(gameId, winner);
    }

    /**
     * @notice Check if there's a winning combination
     */
    function _checkWin(uint8[ROWS][COLS] storage board, uint8 col, uint8 row, uint8 player) internal view returns (bool) {
        // Check horizontal
        if (_checkDirection(board, col, row, player, 1, 0)) return true;
        // Check vertical
        if (_checkDirection(board, col, row, player, 0, 1)) return true;
        // Check diagonal /
        if (_checkDirection(board, col, row, player, 1, 1)) return true;
        // Check diagonal \
        if (_checkDirection(board, col, row, player, 1, -1)) return true;

        return false;
    }

    /**
     * @notice Check a specific direction for 4 in a row
     */
    function _checkDirection(
        uint8[ROWS][COLS] storage board,
        uint8 col,
        uint8 row,
        uint8 player,
        int8 dCol,
        int8 dRow
    ) internal view returns (bool) {
        uint8 count = 1;

        // Check positive direction
        int8 c = int8(col) + dCol;
        int8 r = int8(row) + dRow;
        while (c >= 0 && c < int8(COLS) && r >= 0 && r < int8(ROWS) && board[uint8(c)][uint8(r)] == player) {
            count++;
            c += dCol;
            r += dRow;
        }

        // Check negative direction
        c = int8(col) - dCol;
        r = int8(row) - dRow;
        while (c >= 0 && c < int8(COLS) && r >= 0 && r < int8(ROWS) && board[uint8(c)][uint8(r)] == player) {
            count++;
            c -= dCol;
            r -= dRow;
        }

        return count >= 4;
    }

    /**
     * @notice Check if board is completely full
     */
    function _isBoardFull(uint8[ROWS][COLS] storage board) internal view returns (bool) {
        for (uint8 c = 0; c < COLS; c++) {
            if (board[c][ROWS - 1] == 0) return false;
        }
        return true;
    }

    /**
     * @notice End game and transfer winnings
     */
    function _endGame(uint256 gameId, address winner) internal {
        Game storage game = games[gameId];

        game.winner = winner;
        game.isActive = false;
        game.isComplete = true;

        uint256 totalPot = game.wager * 2;
        uint256 houseFee = (totalPot * HOUSE_FEE_PERCENT) / 100;
        uint256 winnerPayout = totalPot - houseFee;

        delete activeGames[game.player1];
        delete activeGames[game.player2];

        payable(houseWallet).transfer(houseFee);
        payable(winner).transfer(winnerPayout);

        emit GameComplete(gameId, winner, winnerPayout);
    }

    /**
     * @notice Refund both players in case of a draw
     */
    function _refundGame(uint256 gameId) internal {
        Game storage game = games[gameId];

        game.isActive = false;
        game.isComplete = true;

        delete activeGames[game.player1];
        delete activeGames[game.player2];

        payable(game.player1).transfer(game.wager);
        payable(game.player2).transfer(game.wager);
    }

    /**
     * @notice Get board state
     */
    function getBoard(uint256 gameId) external view returns (uint8[ROWS][COLS] memory) {
        return games[gameId].board;
    }
}
