/**
 * Matchmaking System for The Basement Arcade
 * Find opponents for PvP games
 */

class MatchmakingSystem {
    constructor() {
        this.searching = false;
        this.playerId = null;
        this.pollInterval = null;
        this.onMatchFound = null;
    }

    /**
     * Start searching for an opponent
     * @param {string} game - Game type (cointoss, connect4, war, rps)
     * @param {string} stake - Wager amount in ETH
     * @param {string} address - Player's wallet address
     * @param {function} onMatch - Callback when match is found
     */
    async startMatchmaking(game, stake, address, onMatch) {
        try {
            this.searching = true;
            this.onMatchFound = onMatch;

            console.log(`🔍 Searching for ${game} opponent with stake: ${stake} ETH`);

            // Request matchmaking
            const response = await fetch('/api/matchmaking/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, game, stake })
            });

            const data = await response.json();

            if (data.matched) {
                // Match found immediately!
                console.log('✅ Match found!', data);
                this.searching = false;
                if (this.onMatchFound) {
                    this.onMatchFound(data);
                }
                return data;
            } else {
                // Added to queue, start polling
                this.playerId = data.playerId;
                console.log(`⏳ Added to queue. Position: ${data.queuePosition}`);
                this.startPolling(game);
                return data;
            }

        } catch (error) {
            console.error('Matchmaking error:', error);
            this.searching = false;
            throw error;
        }
    }

    /**
     * Poll for match updates
     */
    startPolling(game) {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }

        this.pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/matchmaking/find?playerId=${this.playerId}&game=${game}`);
                const data = await response.json();

                if (data.status === 'matched_or_expired') {
                    // Check if we got matched
                    console.log('Match status changed, checking game lobby...');
                    this.stopMatchmaking();
                    
                    // Notify UI to check for active games
                    if (this.onMatchFound) {
                        this.onMatchFound({ matched: true, message: 'Match found! Loading game...' });
                    }
                } else if (data.status === 'waiting') {
                    console.log(`⏳ Still waiting... Queue position: ${data.queuePosition}/${data.queueSize} (${data.waitingTime}s)`);
                    
                    // Update UI with queue status
                    this.updateQueueStatus(data);
                }

            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000); // Poll every 2 seconds
    }

    /**
     * Update UI with queue status
     */
    updateQueueStatus(data) {
        const statusElement = document.getElementById('matchmaking-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 1.5rem; margin-bottom: 10px;">⏳</div>
                    <div style="font-size: 0.9rem; margin-bottom: 5px;">Searching for opponent...</div>
                    <div style="font-size: 0.7rem; color: #888;">
                        Queue position: ${data.queuePosition}/${data.queueSize}
                    </div>
                    <div style="font-size: 0.6rem; color: #666;">
                        Waiting: ${data.waitingTime}s
                    </div>
                    <button onclick="matchmaking.stopMatchmaking()" 
                            style="margin-top: 15px; padding: 10px 20px; font-size: 0.7rem;">
                        Cancel Search
                    </button>
                </div>
            `;
        }
    }

    /**
     * Stop matchmaking search
     */
    async stopMatchmaking() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }

        if (this.playerId) {
            try {
                await fetch('/api/matchmaking/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId: this.playerId })
                });
            } catch (error) {
                console.error('Error canceling matchmaking:', error);
            }
        }

        this.searching = false;
        this.playerId = null;
        this.onMatchFound = null;
        
        console.log('❌ Matchmaking canceled');
    }

    /**
     * Get current queue stats
     */
    async getQueueStats() {
        try {
            const response = await fetch('/api/matchmaking/find');
            return await response.json();
        } catch (error) {
            console.error('Error fetching queue stats:', error);
            return { queueSize: 0, games: {} };
        }
    }
}

// Global matchmaking instance
const matchmaking = new MatchmakingSystem();

// Example usage:
/*
// When player clicks "Find Opponent" button
matchmaking.startMatchmaking('cointoss', '0.01', userWalletAddress, (matchData) => {
    if (matchData.matched) {
        console.log('Match found!', matchData);
        // Start the game with opponent
        startGame(matchData.gameId, matchData.opponent);
    }
});

// To cancel search
matchmaking.stopMatchmaking();

// To check queue stats
const stats = await matchmaking.getQueueStats();
console.log('Queue stats:', stats);
*/

