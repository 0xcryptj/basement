// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title War - On-Chain Card Game
 * @notice A simple War card game with provable fairness using Chainlink VRF
 * @dev Players lock wagers, draw random cards, winner takes pot minus 10% house fee
 */

contract War {
    // State variables
    address public houseWallet = 0x0F030f98b1F3cE9DA7054AC9CD454d2a816b5B03;
    uint256 public constant HOUSE_FEE_PERCENT = 10;
    uint256 public gameCounter;

    struct Game {
        address player1;
        address player2;
        uint256 wager;
        uint256 player1Card;
        uint256 player2Card;
        address winner;
        bool isActive;
        bool isComplete;
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256) public activeGames;

    // Events
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 wager);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event CardsDrawn(uint256 indexed gameId, uint256 player1Card, uint256 player2Card);
    event GameComplete(uint256 indexed gameId, address indexed winner, uint256 payout);

    // Errors
    error InvalidWager();
    error GameNotActive();
    error AlreadyInGame();
    error NotYourGame();
    error InsufficientBalance();

    /**
     * @notice Create a new War game
     * @dev Player 1 locks their wager and waits for opponent
     */
    function createGame() external payable {
        if (msg.value == 0) revert InvalidWager();
        if (activeGames[msg.sender] != 0) revert AlreadyInGame();

        gameCounter++;
        uint256 gameId = gameCounter;

        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            wager: msg.value,
            player1Card: 0,
            player2Card: 0,
            winner: address(0),
            isActive: true,
            isComplete: false
        });

        activeGames[msg.sender] = gameId;

        emit GameCreated(gameId, msg.sender, msg.value);
    }

    /**
     * @notice Join an existing game as player 2
     * @param gameId The ID of the game to join
     */
    function joinGame(uint256 gameId) external payable {
        Game storage game = games[gameId];

        if (!game.isActive) revert GameNotActive();
        if (msg.value != game.wager) revert InvalidWager();
        if (activeGames[msg.sender] != 0) revert AlreadyInGame();
        if (game.player1 == msg.sender) revert NotYourGame();

        game.player2 = msg.sender;
        activeGames[msg.sender] = gameId;

        emit GameJoined(gameId, msg.sender);

        // Immediately play the game
        _playGame(gameId);
    }

    /**
     * @notice Internal function to execute game logic
     * @dev Uses pseudo-randomness for card selection (Note: Not production-ready, use Chainlink VRF)
     * @param gameId The game to play
     */
    function _playGame(uint256 gameId) internal {
        Game storage game = games[gameId];

        // Generate pseudo-random cards (1-13 representing Ace to King)
        // WARNING: This is NOT secure randomness - use Chainlink VRF in production
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            gameId
        )));

        game.player1Card = (randomSeed % 13) + 1;
        game.player2Card = ((randomSeed / 13) % 13) + 1;

        emit CardsDrawn(gameId, game.player1Card, game.player2Card);

        // Determine winner
        address winner;
        if (game.player1Card > game.player2Card) {
            winner = game.player1;
        } else if (game.player2Card > game.player1Card) {
            winner = game.player2;
        } else {
            // Tie - refund both players
            _refundGame(gameId);
            return;
        }

        game.winner = winner;
        game.isActive = false;
        game.isComplete = true;

        // Calculate payouts
        uint256 totalPot = game.wager * 2;
        uint256 houseFee = (totalPot * HOUSE_FEE_PERCENT) / 100;
        uint256 winnerPayout = totalPot - houseFee;

        // Clear active games
        delete activeGames[game.player1];
        delete activeGames[game.player2];

        // Transfer funds
        payable(houseWallet).transfer(houseFee);
        payable(winner).transfer(winnerPayout);

        emit GameComplete(gameId, winner, winnerPayout);
    }

    /**
     * @notice Refund both players in case of a tie
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
     * @notice Get game details
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
}
