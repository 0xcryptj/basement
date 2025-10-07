// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CoinToss
 * @notice A PvP coin toss game where two players commit to their choice (Heads/Tails),
 *         stake equal ETH amounts, and the winner takes the pot after a 5% house cut from each player.
 * @dev Uses commit-reveal scheme to prevent front-running.
 */
contract CoinToss is ReentrancyGuard, Ownable {
    
    // Constants
    uint256 public constant FEE_BPS_PER_PLAYER = 500; // 5% fee per player (500 basis points)
    uint256 public immutable REVEAL_WINDOW; // Time window for players to reveal their choices
    address payable public immutable house; // House address to receive fees

    // Game states
    enum State { 
        Open,       // Waiting for second player
        Filled,     // Both players joined, waiting for reveals
        Revealing,  // At least one player revealed
        Settled,    // Game completed, winner paid
        Cancelled   // Game cancelled (timeout or other reason)
    }

    // Game structure
    struct Game {
        address payable p1;         // Player 1 address
        address payable p2;         // Player 2 address
        uint256 stake;              // Stake amount per player (without fee)
        uint256 pot;                // Total pot (sum of both stakes)
        bytes32 p1Commit;           // Player 1's commit hash
        bytes32 p2Commit;           // Player 2's commit hash
        uint8 p1Reveal;             // Player 1's revealed choice (0=not revealed, 1=Heads, 2=Tails)
        uint8 p2Reveal;             // Player 2's revealed choice (0=not revealed, 1=Heads, 2=Tails)
        uint64 createdAt;           // Timestamp when game was created
        uint64 filledAt;            // Timestamp when second player joined
        uint64 revealDeadline;      // Deadline for reveals
        State state;                // Current game state
    }

    // Storage
    uint256 public nextId;                      // Next game ID
    mapping(uint256 => Game) public games;      // Game ID => Game data

    // Events
    event GameCreated(uint256 indexed id, address indexed creator, uint256 stake);
    event GameJoined(uint256 indexed id, address indexed joiner);
    event Revealed(uint256 indexed id, address indexed player, uint8 choice);
    event Settled(uint256 indexed id, address indexed winner, uint256 payout, uint256 houseCut);
    event GameCancelled(uint256 indexed id, string reason);

    /**
     * @notice Constructor
     * @param _revealWindow Time window (in seconds) for players to reveal their choices
     */
    constructor(uint256 _revealWindow) Ownable(msg.sender) {
        REVEAL_WINDOW = _revealWindow;
        house = payable(0x5Da407f983e0f11B3f7F67Acd64877b42B22068D);
    }

    /**
     * @notice Calculate total amount required including fee
     * @param stake The stake amount (without fee)
     * @return Total amount to send (stake + 5% fee)
     */
    function requiredWithFee(uint256 stake) public pure returns (uint256) {
        uint256 fee = (stake * FEE_BPS_PER_PLAYER) / 10_000;
        return stake + fee;
    }

    /**
     * @notice Create a new game
     * @param commit Keccak256 hash of abi.encode(choice, salt) where choice is 0 (Heads) or 1 (Tails)
     * @return id The ID of the created game
     */
    function createGame(bytes32 commit) external payable nonReentrant returns (uint256 id) {
        require(commit != bytes32(0), "Invalid commit");
        require(msg.value > 0, "Stake required");
        
        // Calculate stake and fee
        uint256 stake = msg.value * 10_000 / (10_000 + FEE_BPS_PER_PLAYER);
        uint256 fee = msg.value - stake;
        
        // Transfer fee to house
        (bool success,) = house.call{value: fee}("");
        require(success, "Fee transfer failed");
        
        // Create game
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

    /**
     * @notice Join an existing open game
     * @param id The game ID to join
     * @param commit Keccak256 hash of abi.encode(choice, salt)
     */
    function joinGame(uint256 id, bytes32 commit) external payable nonReentrant {
        Game storage g = games[id];
        
        require(g.state == State.Open, "Game not open");
        require(commit != bytes32(0), "Invalid commit");
        require(msg.sender != g.p1, "Cannot join own game");
        
        // Calculate stake and fee
        uint256 stake = msg.value * 10_000 / (10_000 + FEE_BPS_PER_PLAYER);
        uint256 fee = msg.value - stake;
        
        require(stake == g.stake, "Stake mismatch");
        
        // Transfer fee to house
        (bool success,) = house.call{value: fee}("");
        require(success, "Fee transfer failed");
        
        // Update game
        g.p2 = payable(msg.sender);
        g.p2Commit = commit;
        g.pot += stake;
        g.state = State.Filled;
        g.filledAt = uint64(block.timestamp);
        g.revealDeadline = uint64(block.timestamp + REVEAL_WINDOW);
        
        emit GameJoined(id, msg.sender);
    }

    /**
     * @notice Reveal your choice for a game
     * @param id The game ID
     * @param choice Your choice: 0 = Heads, 1 = Tails
     * @param salt The random salt you used in your commit
     */
    function reveal(uint256 id, uint8 choice, bytes32 salt) external nonReentrant {
        require(choice <= 1, "Invalid choice");
        
        Game storage g = games[id];
        require(g.state == State.Filled || g.state == State.Revealing, "Invalid state");
        require(block.timestamp <= g.revealDeadline, "Reveal deadline passed");
        
        // Verify commit
        bytes32 hash = keccak256(abi.encode(choice, salt));
        
        if (msg.sender == g.p1 && hash == g.p1Commit) {
            require(g.p1Reveal == 0, "Already revealed");
            g.p1Reveal = choice + 1; // Store as 1 or 2 (0 means not revealed)
        } else if (msg.sender == g.p2 && hash == g.p2Commit) {
            require(g.p2Reveal == 0, "Already revealed");
            g.p2Reveal = choice + 1;
        } else {
            revert("Invalid reveal");
        }
        
        // Update state
        if (g.state == State.Filled) {
            g.state = State.Revealing;
        }
        
        emit Revealed(id, msg.sender, choice);
        
        // If both revealed, settle the game
        if (g.p1Reveal != 0 && g.p2Reveal != 0) {
            _settle(id);
        }
    }

    /**
     * @notice Settle a game after both players have revealed
     * @dev Internal function called automatically after both reveals
     * @param id The game ID
     */
    function _settle(uint256 id) internal {
        Game storage g = games[id];
        
        // Convert reveals back to 0/1
        uint8 p1Choice = g.p1Reveal - 1;
        uint8 p2Choice = g.p2Reveal - 1;
        
        // Determine outcome using XOR
        // If both chose same (0^0=0 or 1^1=0) => Heads wins (p1)
        // If different (0^1=1 or 1^0=1) => Tails wins (p2)
        uint8 outcome = p1Choice ^ p2Choice;
        address payable winner = outcome == 0 ? g.p1 : g.p2;
        
        // Calculate payout (entire pot goes to winner)
        uint256 payout = g.pot;
        
        // Update state
        g.state = State.Settled;
        
        // Transfer winnings
        (bool success,) = winner.call{value: payout}("");
        require(success, "Payout failed");
        
        emit Settled(id, winner, payout, 0);
    }

    /**
     * @notice Cancel a game if reveal deadline passed and not both revealed
     * @param id The game ID
     */
    function cancelGame(uint256 id) external nonReentrant {
        Game storage g = games[id];
        
        require(g.state == State.Filled || g.state == State.Revealing, "Invalid state");
        require(block.timestamp > g.revealDeadline, "Deadline not passed");
        require(!(g.p1Reveal != 0 && g.p2Reveal != 0), "Both revealed");
        
        // Refund logic based on who revealed
        if (g.p1Reveal != 0 && g.p2Reveal == 0) {
            // P1 revealed, P2 didn't => P1 wins
            (bool success,) = g.p1.call{value: g.pot}("");
            require(success, "Refund failed");
        } else if (g.p1Reveal == 0 && g.p2Reveal != 0) {
            // P2 revealed, P1 didn't => P2 wins
            (bool success,) = g.p2.call{value: g.pot}("");
            require(success, "Refund failed");
        } else {
            // Neither revealed => refund both
            uint256 halfPot = g.pot / 2;
            (bool success1,) = g.p1.call{value: halfPot}("");
            (bool success2,) = g.p2.call{value: g.pot - halfPot}("");
            require(success1 && success2, "Refund failed");
        }
        
        g.state = State.Cancelled;
        emit GameCancelled(id, "Reveal timeout");
    }

    /**
     * @notice Get game details
     * @param id The game ID
     * @return All game data
     */
    function getGame(uint256 id) external view returns (Game memory) {
        return games[id];
    }

    /**
     * @notice Check if a player can reveal for a game
     * @param id The game ID
     * @param player The player address
     * @return True if player can reveal
     */
    function canReveal(uint256 id, address player) external view returns (bool) {
        Game storage g = games[id];
        
        if (g.state != State.Filled && g.state != State.Revealing) {
            return false;
        }
        
        if (block.timestamp > g.revealDeadline) {
            return false;
        }
        
        if (player == g.p1 && g.p1Reveal == 0) {
            return true;
        }
        
        if (player == g.p2 && g.p2Reveal == 0) {
            return true;
        }
        
        return false;
    }
}

