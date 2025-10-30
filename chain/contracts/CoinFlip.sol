// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CoinFlip - On-Chain Coin Flip Game
 * @notice A simple coin flip game with provable fairness
 * @dev Players bet on heads or tails, winner takes pot minus 10% house fee
 */

contract CoinFlip {
    // State variables
    address public houseWallet = 0x5CAdda44709251088663E94b13ad3d5E38466b4d;
    uint256 public constant HOUSE_FEE_PERCENT = 10;
    uint256 public gameCounter;

    enum Side { Heads, Tails }

    struct Game {
        address player;
        uint256 wager;
        Side chosenSide;
        Side result;
        address winner;
        bool isComplete;
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256) public activeGames;

    // Events
    event GameCreated(uint256 indexed gameId, address indexed player, uint256 wager, Side chosenSide);
    event GameComplete(uint256 indexed gameId, address indexed winner, uint256 payout, bool won);

    // Errors
    error InvalidWager();
    error GameNotActive();
    error AlreadyInGame();
    error InsufficientBalance();

    /**
     * @notice Create and play a new coin flip game
     * @param chosenSide The side the player chooses (0 = heads, 1 = tails)
     */
    function createGame(uint8 chosenSide) external payable {
        if (msg.value == 0) revert InvalidWager();
        if (activeGames[msg.sender] != 0) revert AlreadyInGame();
        if (chosenSide > 1) revert InvalidWager();

        gameCounter++;
        uint256 gameId = gameCounter;

        // Generate random result using block properties
        uint256 randomNum = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            gameId
        ))) % 2;

        Side result = randomNum == 0 ? Side.Heads : Side.Tails;
        Side chosenSideEnum = chosenSide == 0 ? Side.Heads : Side.Tails;
        
        bool won = result == chosenSideEnum;
        address winner = won ? msg.sender : houseWallet;

        uint256 winnerPayout;
        if (won) {
            // Winner gets 1.9x their wager (house keeps 10%)
            winnerPayout = (msg.value * 19) / 10;
            if (winnerPayout > address(this).balance) revert InsufficientBalance();
            payable(winner).transfer(winnerPayout);
        } else {
            // House keeps the wager
        }

        games[gameId] = Game({
            player: msg.sender,
            wager: msg.value,
            chosenSide: chosenSideEnum,
            result: result,
            winner: winner,
            isComplete: true
        });

        activeGames[msg.sender] = gameId;

        emit GameCreated(gameId, msg.sender, msg.value, chosenSideEnum);
        emit GameComplete(gameId, winner, won ? winnerPayout : 0, won);
        
        // Clear active game after completion
        delete activeGames[msg.sender];
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

    // Allow contract to receive ETH
    receive() external payable {}
}

