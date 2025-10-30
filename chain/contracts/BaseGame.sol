// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BaseGame - Shared functionality for all games
 * @notice Provides common game logic including house fee, active game tracking, and refunds
 * @dev Inherit this contract to reduce code duplication
 */
abstract contract BaseGame {
    // Shared state
    address public houseWallet;
    uint256 public constant HOUSE_FEE_PERCENT = 10;
    uint256 public gameCounter;
    
    mapping(address => uint256) public activeGames;

    // Shared Events
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 wager);
    event GameComplete(uint256 indexed gameId, address indexed winner, uint256 payout);

    // Shared Errors
    error InvalidWager();
    error GameNotActive();
    error AlreadyInGame();
    error NotYourGame();
    error InsufficientBalance();

    constructor(address _houseWallet) {
        houseWallet = _houseWallet;
    }

    /**
     * @notice Validate a wager amount
     */
    modifier validWager(uint256 wager) {
        if (wager == 0) revert InvalidWager();
        _;
    }

    /**
     * @notice Check if sender has an active game
     */
    modifier hasNoActiveGame() {
        if (activeGames[msg.sender] != 0) revert AlreadyInGame();
        _;
    }

    /**
     * @notice Calculate house fee from total pot
     */
    function _calculateHouseFee(uint256 totalPot) internal pure returns (uint256) {
        return (totalPot * HOUSE_FEE_PERCENT) / 100;
    }

    /**
     * @notice Calculate winner payout after house fee
     */
    function _calculateWinnerPayout(uint256 totalPot) internal pure returns (uint256) {
        return totalPot - _calculateHouseFee(totalPot);
    }

    /**
     * @notice Transfer funds to winner and house
     */
    function _distributeWinnings(uint256 gameId, address winner, uint256 totalPot) internal {
        uint256 houseFee = _calculateHouseFee(totalPot);
        uint256 winnerPayout = _calculateWinnerPayout(totalPot);
        
        if (winnerPayout > address(this).balance) revert InsufficientBalance();
        
        payable(houseWallet).transfer(houseFee);
        payable(winner).transfer(winnerPayout);
        
        emit GameComplete(gameId, winner, winnerPayout);
    }

    /**
     * @notice Clear active game for players
     */
    function _clearActiveGame(address player1, address player2) internal {
        delete activeGames[player1];
        delete activeGames[player2];
    }

    /**
     * @notice Update house wallet (only current house can update)
     */
    function updateHouseWallet(address newHouse) external {
        require(msg.sender == houseWallet, "Only house can update");
        houseWallet = newHouse;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}

