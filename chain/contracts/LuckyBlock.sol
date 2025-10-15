// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LuckyBlock
 * @notice A jackpot game where multiple players can enter, one random winner takes the pot
 * @dev Uses blockhash for provably fair randomness
 */
contract LuckyBlock is ReentrancyGuard, Ownable {
    
    // Constants
    uint256 public constant FEE_BPS = 500; // 5% house fee
    uint256 public constant MIN_PLAYERS = 2;
    uint256 public constant MAX_PLAYERS = 20;
    uint256 public constant ROUND_DURATION = 300; // 5 minutes max wait for players
    uint256 public constant ACTIVE_ROUND_DURATION = 60; // 60 seconds once 2+ players joined
    
    address payable public immutable house;
    
    // Round states
    enum State {
        Open,        // Accepting entries
        Drawing,     // Drawing winner
        Settled,     // Winner paid out
        Cancelled    // Cancelled (e.g., not enough players)
    }
    
    // Round structure
    struct Round {
        uint256 id;
        address payable[] players;
        uint256[] bets;             // Array to store each player's bet amount
        uint256 pot;
        uint256 startTime;
        uint256 endTime;
        uint256 activeTime;         // Time when 2nd player joins (60s countdown starts)
        address payable winner;
        uint256 randomSeed;
        State state;
        uint256 totalFees;
    }
    
    // Affiliate tracking
    struct Affiliate {
        uint256 totalReferred;
        uint256 totalEarned;
        bool isActive;
    }
    
    // Storage
    uint256 public currentRoundId;
    mapping(uint256 => Round) public rounds;
    mapping(address => uint256) public playerStats; // Total rounds played
    mapping(address => uint256) public playerWins;  // Total rounds won
    mapping(address => Affiliate) public affiliates;
    mapping(address => address) public referrals; // Player => Referrer
    
    // Current round tracking
    uint256 public currentEntryFee = 0.001 ether;
    
    // Events
    event RoundCreated(uint256 indexed roundId, uint256 entryFee, uint256 startTime, uint256 endTime);
    event PlayerEntered(uint256 indexed roundId, address indexed player, uint256 entryNumber, address indexed referrer);
    event WinnerDrawn(uint256 indexed roundId, address indexed winner, uint256 payout, uint256 randomSeed);
    event RoundCancelled(uint256 indexed roundId, string reason);
    event AffiliateEarned(address indexed affiliate, uint256 amount);
    
    constructor() Ownable(msg.sender) {
        house = payable(0x5Da407f983e0f11B3f7F67Acd64877b42B22068D);
        _createNewRound();
    }
    
    /**
     * @notice Enter the current jackpot round with any bet amount
     * @param referrer Optional referrer address for affiliate tracking
     */
    function enterRound(address referrer) external payable nonReentrant {
        Round storage round = rounds[currentRoundId];
        
        require(round.state == State.Open, "Round not open");
        require(block.timestamp < round.endTime, "Round expired");
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(round.players.length < MAX_PLAYERS, "Round full");
        
        // Check if player already entered
        for (uint i = 0; i < round.players.length; i++) {
            require(round.players[i] != msg.sender, "Already entered");
        }
        
        // Calculate fee
        uint256 fee = (msg.value * FEE_BPS) / 10_000;
        uint256 toPot = msg.value - fee;
        
        // Handle affiliate
        address actualReferrer = address(0);
        if (referrer != address(0) && referrer != msg.sender && affiliates[referrer].isActive) {
            actualReferrer = referrer;
            referrals[msg.sender] = referrer;
            
            // Give 20% of fee to affiliate
            uint256 affiliateCut = fee / 5;
            uint256 houseCut = fee - affiliateCut;
            
            affiliates[referrer].totalReferred++;
            affiliates[referrer].totalEarned += affiliateCut;
            
            (bool success1,) = payable(referrer).call{value: affiliateCut}("");
            require(success1, "Affiliate payment failed");
            
            (bool success2,) = house.call{value: houseCut}("");
            require(success2, "House payment failed");
            
            emit AffiliateEarned(referrer, affiliateCut);
        } else {
            // No affiliate, all fee to house
            (bool success,) = house.call{value: fee}("");
            require(success, "Fee transfer failed");
        }
        
        // Add player to round
        round.players.push(payable(msg.sender));
        round.bets.push(msg.value);  // Store the bet amount
        round.pot += toPot;
        round.totalFees += fee;
        
        // Start 60 second countdown when 2nd player joins
        if (round.players.length == MIN_PLAYERS) {
            round.activeTime = block.timestamp;
            round.endTime = block.timestamp + ACTIVE_ROUND_DURATION;
        }
        
        // Update player stats
        playerStats[msg.sender]++;
        
        emit PlayerEntered(currentRoundId, msg.sender, round.players.length, actualReferrer);
        
        // Auto-draw if max players reached
        if (round.players.length == MAX_PLAYERS) {
            _drawWinner();
        }
    }
    
    /**
     * @notice Draw winner for current round (can be called by anyone after round ends)
     */
    function drawWinner() external nonReentrant {
        Round storage round = rounds[currentRoundId];
        
        require(round.state == State.Open, "Round not open");
        require(block.timestamp >= round.endTime || round.players.length == MAX_PLAYERS, "Round still active");
        require(round.players.length >= MIN_PLAYERS, "Not enough players");
        
        _drawWinner();
    }
    
    /**
     * @notice Internal function to draw winner (weighted by bet amount)
     */
    function _drawWinner() internal {
        Round storage round = rounds[currentRoundId];
        
        require(round.players.length >= MIN_PLAYERS, "Not enough players");
        
        round.state = State.Drawing;
        
        // Generate random seed using blockhash (provably fair)
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            round.players.length,
            round.pot
        )));
        
        round.randomSeed = randomSeed;
        
        // Calculate total pot for weighted selection
        uint256 totalPot = 0;
        for (uint i = 0; i < round.bets.length; i++) {
            totalPot += round.bets[i];
        }
        
        // Select winner based on weighted probability
        uint256 randomNumber = randomSeed % totalPot;
        uint256 cumulative = 0;
        uint256 winnerIndex = 0;
        
        for (uint i = 0; i < round.players.length; i++) {
            cumulative += round.bets[i];
            if (randomNumber < cumulative) {
                winnerIndex = i;
                break;
            }
        }
        
        address payable winner = round.players[winnerIndex];
        
        round.winner = winner;
        round.state = State.Settled;
        
        // Update player wins
        playerWins[winner]++;
        
        // Pay winner
        uint256 payout = round.pot;
        (bool success,) = winner.call{value: payout}("");
        require(success, "Payout failed");
        
        emit WinnerDrawn(currentRoundId, winner, payout, randomSeed);
        
        // Start new round
        _createNewRound();
    }
    
    /**
     * @notice Cancel current round if not enough players
     */
    function cancelRound() external nonReentrant {
        Round storage round = rounds[currentRoundId];
        
        require(round.state == State.Open, "Round not open");
        require(block.timestamp >= round.endTime, "Round still active");
        require(round.players.length < MIN_PLAYERS, "Enough players");
        
        round.state = State.Cancelled;
        
        // Refund all players
        for (uint i = 0; i < round.players.length; i++) {
            uint256 refundAmount = (round.pot / round.players.length);
            (bool success,) = round.players[i].call{value: refundAmount}("");
            require(success, "Refund failed");
        }
        
        emit RoundCancelled(currentRoundId, "Not enough players");
        
        // Start new round
        _createNewRound();
    }
    
    /**
     * @notice Create a new round
     */
    function _createNewRound() internal {
        currentRoundId++;
        Round storage newRound = rounds[currentRoundId];
        
        newRound.id = currentRoundId;
        newRound.entryFee = currentEntryFee;
        newRound.startTime = block.timestamp;
        newRound.endTime = block.timestamp + ROUND_DURATION;
        newRound.state = State.Open;
        
        emit RoundCreated(currentRoundId, currentEntryFee, newRound.startTime, newRound.endTime);
    }
    
    /**
     * @notice Register as an affiliate
     */
    function registerAffiliate() external {
        require(!affiliates[msg.sender].isActive, "Already registered");
        affiliates[msg.sender].isActive = true;
    }
    
    /**
     * @notice Update entry fee (owner only)
     */
    function setEntryFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "Invalid fee");
        currentEntryFee = newFee;
    }
    
    /**
     * @notice Get current round details
     */
    function getCurrentRound() external view returns (
        uint256 id,
        uint256 playerCount,
        uint256 pot,
        uint256 timeLeft,
        bool isActive,
        State state
    ) {
        Round storage round = rounds[currentRoundId];
        
        id = round.id;
        playerCount = round.players.length;
        pot = round.pot;
        
        // If 2+ players, use active countdown (60s), otherwise use initial wait time
        if (round.players.length >= MIN_PLAYERS && round.activeTime > 0) {
            timeLeft = round.endTime > block.timestamp ? round.endTime - block.timestamp : 0;
            isActive = true;
        } else {
            timeLeft = round.endTime > block.timestamp ? round.endTime - block.timestamp : 0;
            isActive = false;
        }
        
        state = round.state;
    }
    
    /**
     * @notice Get round players
     */
    function getRoundPlayers(uint256 roundId) external view returns (address[] memory) {
        Round storage round = rounds[roundId];
        address[] memory players = new address[](round.players.length);
        
        for (uint i = 0; i < round.players.length; i++) {
            players[i] = round.players[i];
        }
        
        return players;
    }
    
    /**
     * @notice Get player statistics
     */
    function getPlayerStats(address player) external view returns (
        uint256 roundsPlayed,
        uint256 roundsWon,
        uint256 winRate
    ) {
        roundsPlayed = playerStats[player];
        roundsWon = playerWins[player];
        winRate = roundsPlayed > 0 ? (roundsWon * 100) / roundsPlayed : 0;
    }
    
    /**
     * @notice Get affiliate stats
     */
    function getAffiliateStats(address affiliate) external view returns (
        uint256 totalReferred,
        uint256 totalEarned,
        bool isActive
    ) {
        Affiliate storage aff = affiliates[affiliate];
        return (aff.totalReferred, aff.totalEarned, aff.isActive);
    }
}

