// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Chess - Simplified On-Chain Chess
 * @notice A basic chess implementation with move validation
 * @dev Simplified ruleset focusing on core mechanics, 10% house fee
 */

contract Chess {
    // Constants
    address public houseWallet = 0x0F030f98b1F3cE9DA7054AC9CD454d2a816b5B03;
    uint256 public constant HOUSE_FEE_PERCENT = 10;
    uint256 public constant TIMEOUT_DURATION = 10 minutes;
    
    uint256 public gameCounter;

    // Piece types: 0=empty, 1=pawn, 2=knight, 3=bishop, 4=rook, 5=queen, 6=king
    // Positive = white, Negative = black
    struct Game {
        address player1; // White
        address player2; // Black
        uint256 wager;
        int8[8][8] board;
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
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 fromX, uint8 fromY, uint8 toX, uint8 toY);
    event GameComplete(uint256 indexed gameId, address indexed winner, uint256 payout);

    // Errors
    error InvalidWager();
    error GameNotActive();
    error AlreadyInGame();
    error NotYourGame();
    error NotYourTurn();
    error InvalidMove();

    /**
     * @notice Create a new chess game
     */
    function createGame() external payable {
        if (msg.value == 0) revert InvalidWager();
        if (activeGames[msg.sender] != 0) revert AlreadyInGame();

        gameCounter++;
        uint256 gameId = gameCounter;

        Game storage game = games[gameId];
        game.player1 = msg.sender; // White
        game.wager = msg.value;
        game.isActive = true;
        game.lastMoveTime = block.timestamp;

        // Initialize board
        _initializeBoard(game.board);

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

        game.player2 = msg.sender; // Black
        game.currentTurn = game.player1; // White starts
        game.lastMoveTime = block.timestamp;

        activeGames[msg.sender] = gameId;

        emit GameJoined(gameId, msg.sender);
    }

    /**
     * @notice Make a move
     * @param gameId The game ID
     * @param fromX Source X coordinate (0-7)
     * @param fromY Source Y coordinate (0-7)
     * @param toX Destination X coordinate (0-7)
     * @param toY Destination Y coordinate (0-7)
     */
    function makeMove(uint256 gameId, uint8 fromX, uint8 fromY, uint8 toX, uint8 toY) external {
        Game storage game = games[gameId];

        if (!game.isActive) revert GameNotActive();
        if (game.currentTurn != msg.sender) revert NotYourTurn();
        if (fromX > 7 || fromY > 7 || toX > 7 || toY > 7) revert InvalidMove();

        int8 piece = game.board[fromX][fromY];
        
        // Check if piece belongs to current player
        bool isPlayer1 = (msg.sender == game.player1);
        if ((isPlayer1 && piece <= 0) || (!isPlayer1 && piece >= 0)) revert InvalidMove();

        // Simplified move validation (just check piece exists and not moving to same square)
        if (piece == 0 || (fromX == toX && fromY == toY)) revert InvalidMove();

        // Execute move
        int8 capturedPiece = game.board[toX][toY];
        game.board[toX][toY] = piece;
        game.board[fromX][fromY] = 0;
        game.lastMoveTime = block.timestamp;

        emit MoveMade(gameId, msg.sender, fromX, fromY, toX, toY);

        // Check if king was captured (simplified win condition)
        if (capturedPiece == 6 || capturedPiece == -6) {
            _endGame(gameId, msg.sender);
            return;
        }

        // Switch turn
        game.currentTurn = (game.currentTurn == game.player1) ? game.player2 : game.player1;
    }

    /**
     * @notice Claim win by timeout
     */
    function claimTimeout(uint256 gameId) external {
        Game storage game = games[gameId];

        if (!game.isActive) revert GameNotActive();
        if (block.timestamp < game.lastMoveTime + TIMEOUT_DURATION) revert NotYourTurn();
        if (msg.sender != game.player1 && msg.sender != game.player2) revert NotYourGame();

        address winner = (game.currentTurn == game.player1) ? game.player2 : game.player1;
        _endGame(gameId, winner);
    }

    /**
     * @notice Initialize chess board
     */
    function _initializeBoard(int8[8][8] storage board) internal {
        // Black pieces (negative)
        board[0][0] = -4; board[1][0] = -2; board[2][0] = -3; board[3][0] = -5;
        board[4][0] = -6; board[5][0] = -3; board[6][0] = -2; board[7][0] = -4;
        for (uint8 i = 0; i < 8; i++) {
            board[i][1] = -1; // Black pawns
        }

        // White pieces (positive)
        board[0][7] = 4; board[1][7] = 2; board[2][7] = 3; board[3][7] = 5;
        board[4][7] = 6; board[5][7] = 3; board[6][7] = 2; board[7][7] = 4;
        for (uint8 i = 0; i < 8; i++) {
            board[i][6] = 1; // White pawns
        }
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
     * @notice Get board state
     */
    function getBoard(uint256 gameId) external view returns (int8[8][8] memory) {
        return games[gameId].board;
    }
}
