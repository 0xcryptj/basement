// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title War
 * @notice On-chain War card game - highest card wins, with 5% house fee
 * @dev Uses commit-reveal for fairness
 */
contract War is ReentrancyGuard, Ownable {
    uint256 public constant FEE_BPS_PER_PLAYER = 500; // 5% per player
    uint256 public immutable REVEAL_WINDOW;
    address payable public immutable house = payable(0x5Da407f983e0f11B3f7F67Acd64877b42B22068D);

    enum State { Open, Filled, Revealing, Settled, Cancelled }

    struct Game {
        address payable p1;
        address payable p2;
        uint256 stake;
        uint256 pot;
        bytes32 p1Commit;
        bytes32 p2Commit;
        uint8 p1Card; // 1-13 (Ace to King)
        uint8 p2Card;
        uint64 createdAt;
        uint64 filledAt;
        uint64 revealDeadline;
        State state;
    }

    uint256 public nextId;
    mapping(uint256 => Game) public games;

    event GameCreated(uint256 id, address creator, uint256 stake);
    event GameJoined(uint256 id, address joiner);
    event CardRevealed(uint256 id, address player, uint8 card);
    event GameSettled(uint256 id, address winner, uint256 payout);
    event GameTied(uint256 id, uint256 refundAmount);

    constructor(uint256 _revealWindow) Ownable(msg.sender) {
        REVEAL_WINDOW = _revealWindow;
    }

    function requiredWithFee(uint256 stake) public pure returns (uint256) {
        uint256 fee = (stake * FEE_BPS_PER_PLAYER) / 10_000;
        return stake + fee;
    }

    function createGame(bytes32 commit) external payable nonReentrant returns (uint256 id) {
        uint256 stake = msg.value * 10_000 / (10_000 + FEE_BPS_PER_PLAYER);
        uint256 fee = msg.value - stake;
        (bool ok,) = house.call{value: fee}("");
        require(ok, "fee fail");

        id = nextId++;
        Game storage g = games[id];
        g.p1 = payable(msg.sender);
        g.stake = stake;
        g.p1Commit = commit;
        g.pot = stake;
        g.state = State.Open;
        g.createdAt = uint64(block.timestamp);

        emit GameCreated(id, msg.sender, stake);
    }

    function joinGame(uint256 id, bytes32 commit) external payable nonReentrant {
        Game storage g = games[id];
        require(g.state == State.Open, "not open");
        require(msg.sender != g.p1, "cannot join own game");
        
        uint256 stake = msg.value * 10_000 / (10_000 + FEE_BPS_PER_PLAYER);
        uint256 fee = msg.value - stake;
        require(stake == g.stake, "stake mismatch");

        (bool ok,) = house.call{value: fee}("");
        require(ok, "fee fail");

        g.p2 = payable(msg.sender);
        g.p2Commit = commit;
        g.pot += stake;
        g.state = State.Filled;
        g.filledAt = uint64(block.timestamp);
        g.revealDeadline = uint64(block.timestamp + REVEAL_WINDOW);

        emit GameJoined(id, msg.sender);
    }

    function reveal(uint256 id, uint8 card, bytes32 salt) external nonReentrant {
        require(card >= 1 && card <= 13, "invalid card");
        Game storage g = games[id];
        require(g.state == State.Filled || g.state == State.Revealing, "state");
        require(block.timestamp <= g.revealDeadline, "expired");

        bytes32 hash = keccak256(abi.encode(card, salt));
        
        if (msg.sender == g.p1 && hash == g.p1Commit && g.p1Card == 0) {
            g.p1Card = card;
            emit CardRevealed(id, msg.sender, card);
        } else if (msg.sender == g.p2 && hash == g.p2Commit && g.p2Card == 0) {
            g.p2Card = card;
            emit CardRevealed(id, msg.sender, card);
        } else {
            revert("bad reveal");
        }

        if (g.state == State.Filled) {
            g.state = State.Revealing;
        }

        if (g.p1Card != 0 && g.p2Card != 0) {
            _settle(id);
        }
    }

    function _settle(uint256 id) internal {
        Game storage g = games[id];
        g.state = State.Settled;

        if (g.p1Card > g.p2Card) {
            // Player 1 wins
            (bool ok,) = g.p1.call{value: g.pot}("");
            require(ok, "payout fail");
            emit GameSettled(id, g.p1, g.pot);
        } else if (g.p2Card > g.p1Card) {
            // Player 2 wins
            (bool ok,) = g.p2.call{value: g.pot}("");
            require(ok, "payout fail");
            emit GameSettled(id, g.p2, g.pot);
        } else {
            // Tie - split pot
            uint256 half = g.pot / 2;
            (bool ok1,) = g.p1.call{value: half}("");
            (bool ok2,) = g.p2.call{value: g.pot - half}("");
            require(ok1 && ok2, "refund fail");
            emit GameTied(id, g.pot);
        }
    }

    function claimTimeout(uint256 id) external nonReentrant {
        Game storage g = games[id];
        require(g.state == State.Filled || g.state == State.Revealing, "state");
        require(block.timestamp > g.revealDeadline, "not expired");

        g.state = State.Settled;

        // Award to player who revealed (or both if neither revealed)
        if (g.p1Card != 0 && g.p2Card == 0) {
            // P1 revealed, P2 didn't
            (bool ok,) = g.p1.call{value: g.pot}("");
            require(ok, "payout fail");
            emit GameSettled(id, g.p1, g.pot);
        } else if (g.p2Card != 0 && g.p1Card == 0) {
            // P2 revealed, P1 didn't
            (bool ok,) = g.p2.call{value: g.pot}("");
            require(ok, "payout fail");
            emit GameSettled(id, g.p2, g.pot);
        } else {
            // Neither revealed, split pot
            uint256 half = g.pot / 2;
            (bool ok1,) = g.p1.call{value: half}("");
            (bool ok2,) = g.p2.call{value: g.pot - half}("");
            require(ok1 && ok2, "refund fail");
            emit GameTied(id, g.pot);
        }
    }

    function getCardName(uint8 card) public pure returns (string memory) {
        if (card == 1) return "Ace";
        if (card == 11) return "Jack";
        if (card == 12) return "Queen";
        if (card == 13) return "King";
        if (card >= 2 && card <= 10) {
            if (card == 2) return "2";
            if (card == 3) return "3";
            if (card == 4) return "4";
            if (card == 5) return "5";
            if (card == 6) return "6";
            if (card == 7) return "7";
            if (card == 8) return "8";
            if (card == 9) return "9";
            if (card == 10) return "10";
        }
        return "Invalid";
    }
}

