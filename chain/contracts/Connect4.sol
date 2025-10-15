// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Connect4
 * @notice On-chain Connect 4 game with 5% house fee (not mentioned to users)
 * @dev Players take turns dropping pieces, first to get 4 in a row wins
 */
contract Connect4 is ReentrancyGuard, Ownable {
    uint256 public constant FEE_BPS_PER_PLAYER = 500; // 5% per player
    uint256 public constant ROWS = 6;
    uint256 public constant COLS = 7;
    address payable public immutable house = payable(0x5Da407f983e0f11B3f7F67Acd64877b42B22068D);

    enum State { Open, InProgress, Finished, Cancelled }
    enum CellState { Empty, Player1, Player2 }

    struct Game {
        address payable player1;
        address payable player2;
        uint256 stake;
        uint256 pot;
        uint8[6][7] board; // [col][row]
        uint8 currentTurn; // 1 or 2
        uint64 lastMoveTime;
        uint64 createdAt;
        State state;
        address winner;
    }

    uint256 public nextId;
    mapping(uint256 => Game) public games;

    event GameCreated(uint256 id, address creator, uint256 stake);
    event GameJoined(uint256 id, address joiner);
    event MoveMade(uint256 id, address player, uint8 col, uint8 row);
    event GameWon(uint256 id, address winner, uint256 payout);
    event GameDraw(uint256 id);

    constructor() Ownable(msg.sender) {}

    function requiredWithFee(uint256 stake) public pure returns (uint256) {
        uint256 fee = (stake * FEE_BPS_PER_PLAYER) / 10_000;
        return stake + fee;
    }

    function createGame() external payable nonReentrant returns (uint256 id) {
        uint256 stake = msg.value * 10_000 / (10_000 + FEE_BPS_PER_PLAYER);
        uint256 fee = msg.value - stake;
        (bool ok,) = house.call{value: fee}("");
        require(ok, "fee fail");

        id = nextId++;
        Game storage g = games[id];
        g.player1 = payable(msg.sender);
        g.stake = stake;
        g.pot = stake;
        g.state = State.Open;
        g.createdAt = uint64(block.timestamp);
        
        emit GameCreated(id, msg.sender, stake);
    }

    function joinGame(uint256 id) external payable nonReentrant {
        Game storage g = games[id];
        require(g.state == State.Open, "not open");
        require(msg.sender != g.player1, "cannot join own game");
        
        uint256 stake = msg.value * 10_000 / (10_000 + FEE_BPS_PER_PLAYER);
        uint256 fee = msg.value - stake;
        require(stake == g.stake, "stake mismatch");
        
        (bool ok,) = house.call{value: fee}("");
        require(ok, "fee fail");

        g.player2 = payable(msg.sender);
        g.pot += stake;
        g.state = State.InProgress;
        g.currentTurn = 1;
        g.lastMoveTime = uint64(block.timestamp);

        emit GameJoined(id, msg.sender);
    }

    function makeMove(uint256 id, uint8 col) external nonReentrant {
        Game storage g = games[id];
        require(g.state == State.InProgress, "not in progress");
        require(col < COLS, "invalid column");
        
        address currentPlayer = g.currentTurn == 1 ? g.player1 : g.player2;
        require(msg.sender == currentPlayer, "not your turn");

        // Find lowest empty row in column
        uint8 row = 255;
        for (uint8 r = 0; r < ROWS; r++) {
            if (g.board[col][r] == 0) {
                row = r;
                break;
            }
        }
        require(row != 255, "column full");

        // Place piece
        g.board[col][row] = g.currentTurn;
        g.lastMoveTime = uint64(block.timestamp);

        emit MoveMade(id, msg.sender, col, row);

        // Check for win
        if (_checkWin(g, col, row)) {
            g.state = State.Finished;
            g.winner = msg.sender;
            
            uint256 payout = g.pot;
            (bool ok,) = payable(msg.sender).call{value: payout}("");
            require(ok, "payout fail");
            
            emit GameWon(id, msg.sender, payout);
        } else if (_checkDraw(g)) {
            g.state = State.Finished;
            
            // Split pot on draw
            uint256 half = g.pot / 2;
            (bool ok1,) = g.player1.call{value: half}("");
            (bool ok2,) = g.player2.call{value: g.pot - half}("");
            require(ok1 && ok2, "refund fail");
            
            emit GameDraw(id);
        } else {
            // Switch turn
            g.currentTurn = g.currentTurn == 1 ? 2 : 1;
        }
    }

    function _checkWin(Game storage g, uint8 col, uint8 row) internal view returns (bool) {
        uint8 piece = g.board[col][row];
        
        // Check horizontal
        uint8 count = 0;
        for (uint8 c = 0; c < COLS; c++) {
            if (g.board[c][row] == piece) {
                count++;
                if (count >= 4) return true;
            } else {
                count = 0;
            }
        }
        
        // Check vertical
        count = 0;
        for (uint8 r = 0; r < ROWS; r++) {
            if (g.board[col][r] == piece) {
                count++;
                if (count >= 4) return true;
            } else {
                count = 0;
            }
        }
        
        // Check diagonal (bottom-left to top-right)
        count = 0;
        int8 startC = int8(col) - int8(row);
        int8 startR = 0;
        if (startC < 0) {
            startR = -startC;
            startC = 0;
        }
        for (; startC < int8(int256(COLS)) && startR < int8(int256(ROWS)); ) {
            if (g.board[uint8(startC)][uint8(startR)] == piece) {
                count++;
                if (count >= 4) return true;
            } else {
                count = 0;
            }
            startC++;
            startR++;
        }
        
        // Check diagonal (top-left to bottom-right)
        count = 0;
        startC = int8(col) + int8(row);
        startR = 0;
        if (startC >= int8(int256(COLS))) {
            startR = startC - int8(int256(COLS)) + 1;
            startC = int8(int256(COLS)) - 1;
        }
        for (; startC >= 0 && startR < int8(int256(ROWS)); ) {
            if (g.board[uint8(startC)][uint8(startR)] == piece) {
                count++;
                if (count >= 4) return true;
            } else {
                count = 0;
            }
            startC--;
            startR++;
        }
        
        return false;
    }

    function _checkDraw(Game storage g) internal view returns (bool) {
        for (uint8 c = 0; c < COLS; c++) {
            if (g.board[c][ROWS - 1] == 0) {
                return false;
            }
        }
        return true;
    }

    function getBoard(uint256 id) external view returns (uint8[6][7] memory) {
        return games[id].board;
    }
}

