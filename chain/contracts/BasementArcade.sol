// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title BasementArcade
 * @notice Unified arcade contract with ERC-20 token integration for The Basement
 * @dev Supports multiple game types with token holder benefits
 */
contract BasementArcade is ReentrancyGuard, Ownable {
    
    // Token integration
    IERC20 public immutable basementToken;
    uint256 public constant MIN_TOKEN_BALANCE = 1e15; // 0.001 tokens
    
    // Fee structure
    uint256 public constant FEE_BPS_NO_TOKEN = 500; // 5% for non-holders
    uint256 public constant FEE_BPS_WITH_TOKEN = 250; // 2.5% for token holders
    uint256 public immutable REVEAL_WINDOW = 300; // 5 minutes
    
    address payable public immutable house;

    // Game types
    enum GameType { CoinToss, Connect4, War, RPS }
    
    // Game states
    enum State { 
        Open,       // Waiting for second player
        Filled,     // Both players joined
        InProgress, // Game in progress
        Settled,    // Game completed
        Cancelled   // Game cancelled
    }

    // Unified game structure
    struct Game {
        GameType gameType;
        address payable player1;
        address payable player2;
        uint256 stake;
        uint256 pot;
        bytes32 p1Commit;       // For commit-reveal games
        bytes32 p2Commit;
        uint8 p1Reveal;
        uint8 p2Reveal;
        uint8[6][7] board;      // For board games
        uint8 currentTurn;
        uint64 createdAt;
        uint64 filledAt;
        uint64 revealDeadline;
        State state;
        address winner;
    }

    // Storage
    uint256 public nextId;
    mapping(uint256 => Game) public games;
    
    // Statistics
    mapping(address => uint256) public gamesPlayed;
    mapping(address => uint256) public gamesWon;
    uint256 public totalGamesPlayed;

    // Events
    event GameCreated(uint256 indexed id, GameType gameType, address indexed creator, uint256 stake, bool isTokenHolder);
    event GameJoined(uint256 indexed id, address indexed joiner, bool isTokenHolder);
    event GameSettled(uint256 indexed id, address indexed winner, uint256 payout, uint256 houseCut);
    event GameCancelled(uint256 indexed id, string reason);
    event TokenHolderBenefit(address indexed player, uint256 feeSaved);

    /**
     * @notice Constructor
     * @param _tokenAddress The Basement ERC-20 token address on Base
     */
    constructor(address _tokenAddress) Ownable(msg.sender) {
        basementToken = IERC20(_tokenAddress);
        house = payable(0x5Da407f983e0f11B3f7F67Acd64877b42B22068D);
    }

    /**
     * @notice Check if address is a token holder
     * @param player The address to check
     * @return True if holds minimum required tokens
     */
    function isTokenHolder(address player) public view returns (bool) {
        return basementToken.balanceOf(player) >= MIN_TOKEN_BALANCE;
    }

    /**
     * @notice Calculate fee based on token holder status
     * @param player The player address
     * @return Fee in basis points
     */
    function getFeeForPlayer(address player) public view returns (uint256) {
        return isTokenHolder(player) ? FEE_BPS_WITH_TOKEN : FEE_BPS_NO_TOKEN;
    }

    /**
     * @notice Calculate total amount required including fee
     * @param stake The stake amount
     * @param player The player address (for token holder discount)
     * @return Total amount to send
     */
    function requiredWithFee(uint256 stake, address player) public view returns (uint256) {
        uint256 feeBps = getFeeForPlayer(player);
        uint256 fee = (stake * feeBps) / 10_000;
        return stake + fee;
    }

    /**
     * @notice Create a new Coin Toss game
     * @param commit Keccak256 hash of abi.encode(choice, salt)
     * @return id The game ID
     */
    function createCoinToss(bytes32 commit) external payable nonReentrant returns (uint256 id) {
        require(commit != bytes32(0), "Invalid commit");
        require(msg.value > 0, "Stake required");
        
        // Calculate stake and fee with token holder discount
        uint256 feeBps = getFeeForPlayer(msg.sender);
        uint256 stake = msg.value * 10_000 / (10_000 + feeBps);
        uint256 fee = msg.value - stake;
        
        // Transfer fee to house
        (bool success,) = house.call{value: fee}("");
        require(success, "Fee transfer failed");
        
        // Emit token holder benefit if applicable
        if (isTokenHolder(msg.sender)) {
            uint256 saved = (stake * (FEE_BPS_NO_TOKEN - FEE_BPS_WITH_TOKEN)) / 10_000;
            emit TokenHolderBenefit(msg.sender, saved);
        }
        
        // Create game
        id = nextId++;
        Game storage g = games[id];
        g.gameType = GameType.CoinToss;
        g.player1 = payable(msg.sender);
        g.stake = stake;
        g.p1Commit = commit;
        g.pot = stake;
        g.state = State.Open;
        g.createdAt = uint64(block.timestamp);
        
        emit GameCreated(id, GameType.CoinToss, msg.sender, stake, isTokenHolder(msg.sender));
    }

    /**
     * @notice Join a Coin Toss game
     * @param id The game ID
     * @param commit Your commit hash
     */
    function joinCoinToss(uint256 id, bytes32 commit) external payable nonReentrant {
        Game storage g = games[id];
        
        require(g.gameType == GameType.CoinToss, "Wrong game type");
        require(g.state == State.Open, "Game not open");
        require(commit != bytes32(0), "Invalid commit");
        require(msg.sender != g.player1, "Cannot join own game");
        
        // Calculate stake and fee
        uint256 feeBps = getFeeForPlayer(msg.sender);
        uint256 stake = msg.value * 10_000 / (10_000 + feeBps);
        uint256 fee = msg.value - stake;
        
        require(stake == g.stake, "Stake mismatch");
        
        // Transfer fee to house
        (bool success,) = house.call{value: fee}("");
        require(success, "Fee transfer failed");
        
        // Emit token holder benefit if applicable
        if (isTokenHolder(msg.sender)) {
            uint256 saved = (stake * (FEE_BPS_NO_TOKEN - FEE_BPS_WITH_TOKEN)) / 10_000;
            emit TokenHolderBenefit(msg.sender, saved);
        }
        
        // Update game
        g.player2 = payable(msg.sender);
        g.p2Commit = commit;
        g.pot += stake;
        g.state = State.Filled;
        g.filledAt = uint64(block.timestamp);
        g.revealDeadline = uint64(block.timestamp + REVEAL_WINDOW);
        
        emit GameJoined(id, msg.sender, isTokenHolder(msg.sender));
    }

    /**
     * @notice Reveal your Coin Toss choice
     * @param id The game ID
     * @param choice 0 = Heads, 1 = Tails
     * @param salt Random salt used in commit
     */
    function revealCoinToss(uint256 id, uint8 choice, bytes32 salt) external nonReentrant {
        require(choice <= 1, "Invalid choice");
        
        Game storage g = games[id];
        require(g.gameType == GameType.CoinToss, "Wrong game type");
        require(g.state == State.Filled, "Invalid state");
        require(block.timestamp <= g.revealDeadline, "Reveal deadline passed");
        
        // Verify commit
        bytes32 hash = keccak256(abi.encode(choice, salt));
        
        if (msg.sender == g.player1 && hash == g.p1Commit) {
            require(g.p1Reveal == 0, "Already revealed");
            g.p1Reveal = choice + 1;
        } else if (msg.sender == g.player2 && hash == g.p2Commit) {
            require(g.p2Reveal == 0, "Already revealed");
            g.p2Reveal = choice + 1;
        } else {
            revert("Invalid reveal");
        }
        
        // If both revealed, settle
        if (g.p1Reveal != 0 && g.p2Reveal != 0) {
            _settleCoinToss(id);
        }
    }

    /**
     * @notice Settle a Coin Toss game
     * @dev Internal function
     * @param id The game ID
     */
    function _settleCoinToss(uint256 id) internal {
        Game storage g = games[id];
        
        uint8 p1Choice = g.p1Reveal - 1;
        uint8 p2Choice = g.p2Reveal - 1;
        
        // XOR logic: same choice (0^0 or 1^1) = 0 => p1 wins, different = 1 => p2 wins
        uint8 outcome = p1Choice ^ p2Choice;
        address payable winner = outcome == 0 ? g.player1 : g.player2;
        
        uint256 payout = g.pot;
        g.state = State.Settled;
        g.winner = winner;
        
        // Update stats
        gamesPlayed[g.player1]++;
        gamesPlayed[g.player2]++;
        gamesWon[winner]++;
        totalGamesPlayed++;
        
        // Transfer winnings
        (bool success,) = winner.call{value: payout}("");
        require(success, "Payout failed");
        
        emit GameSettled(id, winner, payout, 0);
    }

    /**
     * @notice Create a Connect 4 game
     * @return id The game ID
     */
    function createConnect4() external payable nonReentrant returns (uint256 id) {
        require(msg.value > 0, "Stake required");
        
        uint256 feeBps = getFeeForPlayer(msg.sender);
        uint256 stake = msg.value * 10_000 / (10_000 + feeBps);
        uint256 fee = msg.value - stake;
        
        (bool success,) = house.call{value: fee}("");
        require(success, "Fee transfer failed");
        
        if (isTokenHolder(msg.sender)) {
            uint256 saved = (stake * (FEE_BPS_NO_TOKEN - FEE_BPS_WITH_TOKEN)) / 10_000;
            emit TokenHolderBenefit(msg.sender, saved);
        }
        
        id = nextId++;
        Game storage g = games[id];
        g.gameType = GameType.Connect4;
        g.player1 = payable(msg.sender);
        g.stake = stake;
        g.pot = stake;
        g.state = State.Open;
        g.createdAt = uint64(block.timestamp);
        
        emit GameCreated(id, GameType.Connect4, msg.sender, stake, isTokenHolder(msg.sender));
    }

    /**
     * @notice Get game details
     * @param id The game ID
     * @return The game data
     */
    function getGame(uint256 id) external view returns (Game memory) {
        return games[id];
    }

    /**
     * @notice Get player statistics
     * @param player The player address
     * @return played Total games played
     * @return won Total games won
     * @return winRate Win rate in basis points (0-10000)
     */
    function getPlayerStats(address player) external view returns (
        uint256 played, 
        uint256 won, 
        uint256 winRate
    ) {
        played = gamesPlayed[player];
        won = gamesWon[player];
        winRate = played > 0 ? (won * 10000) / played : 0;
    }

    /**
     * @notice Check if player gets token holder discount
     * @param player The player address
     * @return isHolder True if token holder
     * @return discount Discount in basis points
     * @return savings Estimated savings on 1 ETH stake
     */
    function getTokenBenefits(address player) external view returns (
        bool isHolder,
        uint256 discount,
        uint256 savings
    ) {
        isHolder = isTokenHolder(player);
        discount = isHolder ? FEE_BPS_NO_TOKEN - FEE_BPS_WITH_TOKEN : 0;
        savings = isHolder ? (1 ether * discount) / 10_000 : 0;
    }
}

