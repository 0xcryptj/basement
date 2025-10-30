// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Jackpot - On-Chain Jackpot Game
 * @notice A multiplayer jackpot game where players bet and winner is selected randomly
 * @dev Players contribute to pot, random winner selected, takes pot minus 10% house fee
 */

contract Jackpot {
    // State variables
    address public houseWallet = 0x5CAdda44709251088663E94b13ad3d5E38466b4d;
    uint256 public constant HOUSE_FEE_PERCENT = 10;
    uint256 public gameCounter;
    uint256 public currentPot;
    uint256 public playerCount;

    struct Player {
        address player;
        uint256 wager;
        uint256 tickets;
    }

    struct Game {
        uint256 gameId;
        Player[] players;
        address winner;
        uint256 pot;
        uint256 winnerPayout;
        bool isActive;
        bool isComplete;
    }

    mapping(uint256 => Game) public games;
    mapping(uint256 => mapping(address => uint256)) public playerTickets;
    uint256 public activeGameId;

    // Events
    event PlayerJoined(uint256 indexed gameId, address indexed player, uint256 wager, uint256 totalPot);
    event GameStarted(uint256 indexed gameId, uint256 totalPot, uint256 playerCount);
    event GameComplete(uint256 indexed gameId, address indexed winner, uint256 payout);

    // Errors
    error InvalidWager();
    error GameNotActive();
    error InsufficientBalance();
    error GameAlreadyComplete();

    /**
     * @notice Join the jackpot pool
     */
    function joinJackpot() external payable {
        if (msg.value == 0) revert InvalidWager();
        
        // Start new game if no active game
        if (activeGameId == 0 || games[activeGameId].isComplete) {
            gameCounter++;
            activeGameId = gameCounter;
            currentPot = 0;
            playerCount = 0;
            
            games[activeGameId] = Game({
                gameId: activeGameId,
                players: new Player[](0),
                winner: address(0),
                pot: 0,
                winnerPayout: 0,
                isActive: true,
                isComplete: false
            });
        }

        Game storage game = games[activeGameId];
        if (!game.isActive || game.isComplete) revert GameNotActive();

        currentPot += msg.value;
        playerCount++;

        // Store player info
        game.players.push(Player({
            player: msg.sender,
            wager: msg.value,
            tickets: currentPot // Use pot as ticket count
        }));

        game.pot = currentPot;
        playerTickets[activeGameId][msg.sender] = currentPot;

        emit PlayerJoined(activeGameId, msg.sender, msg.value, currentPot);
    }

    /**
     * @notice Finalize the jackpot and select winner
     * @dev Anyone can call this when game should end
     */
    function finalizeJackpot() external {
        uint256 gameId = activeGameId;
        Game storage game = games[gameId];
        
        if (game.isComplete) revert GameAlreadyComplete();
        if (game.players.length < 2) revert GameNotActive();

        // Generate random winner
        uint256 randomNum = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            gameId,
            currentPot
        ))) % game.players.length;

        address winner = game.players[randomNum].player;
        
        // Calculate payout (pot minus 10% house fee)
        uint256 winnerPayout = (game.pot * 90) / 100;
        if (winnerPayout > address(this).balance) revert InsufficientBalance();

        payable(winner).transfer(winnerPayout);

        game.winner = winner;
        game.winnerPayout = winnerPayout;
        game.isComplete = true;
        game.isActive = false;

        // Reset active game
        activeGameId = 0;
        currentPot = 0;
        playerCount = 0;

        emit GameComplete(gameId, winner, winnerPayout);
    }

    /**
     * @notice Get current game details
     */
    function getCurrentGame() external view returns (Game memory) {
        return games[activeGameId];
    }

    /**
     * @notice Get game by ID
     */
    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    /**
     * @notice Update house wallet (only owner)
     */
    function updateHouseWallet(address newHouse) external {
        require(msg.sender == houseWallet, "Only house can update");
        houseWallet = newHouse;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}

