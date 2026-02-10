import { Deck } from './Deck.js';
import { Player } from './Players.js';
import { AIPlayer } from './AIPlayer.js';
import { AbilityDeck } from './AbilityDeck.js';
export class Game {
    // Core game components
    deck;
    players;
    currentPlayerIndex; // 0 or 1
    // Ability card system
    abilityDeck;
    targetNumber;
    betModifier;
    lastAbilityPlayed;
    // Game mode
    mode;
    aiDifficulty;
    // Kill machine mechanic (Bug 4 Fix: Array-based number line)
    // Machine position on number line: 0 = P1, 6 = Machine start, 12 = P2
    machinePosition;
    moveDistance;
    // Game state
    gameOver;
    winner;
    roundNumber;
    player1Stayed;
    player2Stayed;
    // Settings
    settings;
    // Timer state
    turnTimer;
    turnStartTime;
    turnTimeRemaining;
    forcedActionTaken; // Track if timer forced an action
    forcedDrawCount; // Track how many times we've forced a draw in current turn
    mustDraw; // Indicates player must draw (cannot stay) after timer forced action
    mustStay; // Indicates busted player must stay before AI turn
    timePenaltyApplied; // Track if penalty was applied for not staying after bust
    constructor(player1Name, player2NameOrMode, aiDifficultyOrSettings, settings) {
        // Initialize basic properties
        this.deck = new Deck();
        this.abilityDeck = new AbilityDeck();
        // Bug 4 Fix: Machine starts at position 6 (center of 0-12 number line)
        // Position 0 = Player 1, Position 6 = Machine, Position 12 = Player 2
        this.machinePosition = 6;
        this.moveDistance = 1;
        this.currentPlayerIndex = 0;
        this.gameOver = false;
        this.winner = null;
        this.roundNumber = 1;
        this.player1Stayed = false;
        this.player2Stayed = false;
        this.targetNumber = 21;
        this.betModifier = 0;
        this.lastAbilityPlayed = null;
        // Initialize timer state
        this.turnTimer = null;
        this.turnStartTime = null;
        this.turnTimeRemaining = 0;
        this.forcedActionTaken = false;
        this.forcedDrawCount = 0;
        this.mustDraw = false;
        this.mustStay = false;
        this.timePenaltyApplied = false;
        // Initialize default settings
        this.settings = {
            timerSeconds: 30,
            moveDistanceMode: 'rise',
            firstPlayer: 'player1'
        };
        // Determine which constructor signature was used and create players
        // Check if second parameter is a game mode
        if (player2NameOrMode === 'singleplayer' || player2NameOrMode === 'multiplayer') {
            // New signature: (player1Name, mode, aiDifficulty?, settings?)
            this.mode = player2NameOrMode;
            // Extract settings if provided
            if (settings) {
                this.settings = { ...this.settings, ...settings };
            }
            if (this.mode === 'singleplayer') {
                const difficulty = aiDifficultyOrSettings || 3;
                this.aiDifficulty = difficulty;
                this.players = [
                    new Player(player1Name),
                    new AIPlayer(difficulty)
                ];
            }
            else {
                this.players = [
                    new Player(player1Name),
                    new Player('Player 2')
                ];
            }
        }
        else {
            // Old signature: (player1Name, player2Name, settings?)
            this.mode = 'multiplayer';
            this.players = [
                new Player(player1Name),
                new Player(player2NameOrMode)
            ];
            // Extract settings if provided (aiDifficultyOrSettings is actually settings here)
            if (aiDifficultyOrSettings && typeof aiDifficultyOrSettings === 'object') {
                this.settings = { ...this.settings, ...aiDifficultyOrSettings };
            }
        }
        // Set initial player based on settings
        if (this.settings.firstPlayer === 'player2') {
            this.currentPlayerIndex = 1;
        }
        else if (this.settings.firstPlayer === 'random') {
            this.currentPlayerIndex = Math.random() < 0.5 ? 0 : 1;
        }
        this.setupNewRound();
    }
    // Initial deal for a round
    setupNewRound() {
        console.log(`\n=== Round ${this.roundNumber} ===`);
        // Reset and shuffle deck for each new round
        // This ensures all cards are available again
        this.deck.reset();
        this.deck.shuffle();
        console.log("Deck shuffled for new round!");
        // Shuffle ability deck if needed, but don't reset it
        if (this.abilityDeck.cardsRemaining() < 4) {
            console.log("Ability deck running low, reshuffling...");
            this.abilityDeck.reset();
            this.abilityDeck.shuffle();
        }
        // Reset game state for new round
        this.targetNumber = 21;
        this.betModifier = 0;
        this.lastAbilityPlayed = null;
        // Reset player hands and stayed flags (but keep ability cards)
        this.players.forEach(player => {
            player.hand = [];
            player.faceDownCard = null;
            player.isBusted = false;
            player.hasBless = false;
        });
        this.player1Stayed = false;
        this.player2Stayed = false;
        // Deal: face-down then face-up for each player
        this.players[0].setFaceDownCard(this.deck.dealCard(false));
        this.players[1].setFaceDownCard(this.deck.dealCard(false));
        this.players[0].addCard(this.deck.dealCard(true));
        this.players[1].addCard(this.deck.dealCard(true));
        // Deal 2 ability cards to each player
        for (let i = 0; i < 2; i++) {
            this.players[0].abilityHand.push(this.abilityDeck.dealCard());
            this.players[1].abilityHand.push(this.abilityDeck.dealCard());
        }
        console.log("Cards dealt!");
        console.log(`${this.players[0].name}: ${this.players[0].printHand()}`);
        console.log(`${this.players[1].name}: ${this.players[1].printHand()}`);
        // Show abilities if players don't have any yet (first round)
        if (this.players[0].abilityHand.length === 0) {
            console.log(`\n${this.players[0].name} Abilities:`);
            console.log(this.players[0].printAbilityHand());
            // Only show AI abilities in multiplayer mode
            if (this.mode === 'multiplayer') {
                console.log(`\n${this.players[1].name} Abilities:`);
                console.log(this.players[1].printAbilityHand());
            }
        }
        // Start timer for the current player
        this.startTurnTimer();
    }
    // Current player draws a card
    async playerDraws(skipTurnSwitch = false) {
        if (this.gameOver)
            return;
        // Clear mustDraw flag when player voluntarily draws
        if (this.mustDraw && !skipTurnSwitch) {
            this.mustDraw = false;
            console.log("✓ Player drew a card.");
        }
        const currentPlayer = this.players[this.currentPlayerIndex];
        // Check if player has already stayed
        const currentPlayerStayed = (this.currentPlayerIndex === 0) ? this.player1Stayed : this.player2Stayed;
        if (currentPlayerStayed) {
            console.log(`You have already stayed and cannot draw more cards.`);
            return;
        }
        // If player has already busted, they can't draw anymore
        if (currentPlayer.isBusted) {
            console.log(`You have busted and cannot draw more cards.`);
            return;
        }
        const newCard = this.deck.dealCard(true);
        currentPlayer.addCard(newCard);
        console.log(`${currentPlayer.name} draws: ${newCard.toString()}`);
        console.log(`New total: ${currentPlayer.calculateVisibleScore()}`);
        // Check if bust
        if (currentPlayer.calculateTotalScore() > this.targetNumber) {
            currentPlayer.isBusted = true;
            // Only show bust message for human player or in multiplayer mode
            if (this.mode === 'multiplayer' || this.currentPlayerIndex === 0) {
                console.log(`You busted with a total of ${currentPlayer.calculateTotalScore()} (target: ${this.targetNumber})!`);
            }
            // Bug 5 Fix: Check if other player has also busted or stayed
            const otherPlayerIndex = 1 - this.currentPlayerIndex;
            const otherPlayer = this.players[otherPlayerIndex];
            const otherPlayerStayed = (otherPlayerIndex === 0) ? this.player1Stayed : this.player2Stayed;
            // Bug 6 Fix: Clear mustDraw flag whenever player busts, regardless of other player's state
            this.mustDraw = false;
            // End round if both players are done (busted or stayed)
            if (otherPlayer.isBusted || otherPlayerStayed) {
                console.log("Both players are done! Outputting scores");
                await this.endRound();
            }
            else {
                // New behavior: Require player to choose 'stay' before AI turn
                console.log(`${currentPlayer.name} is out. You must choose 'stay' to proceed to ${this.players[otherPlayerIndex].name}'s turn.`);
                this.mustStay = true;
                // Bug 6 Fix Part C: Clear forcedActionTaken so player's 'stay' input won't be ignored
                this.forcedActionTaken = false;
                // Don't switch turn - wait for player to stay
                // Restart timer to give them time to stay
                if (!skipTurnSwitch) {
                    this.startTurnTimer();
                }
            }
            return;
        }
        // Player didn't bust, switch to next player (unless this is a forced draw)
        if (!skipTurnSwitch) {
            this.switchTurn();
        }
    }
    // Current player stays
    async playerStays() {
        if (this.gameOver)
            return;
        // Bug 1 Fix: Prevent staying when player must draw (after forced timeout)
        if (this.mustDraw) {
            console.log(`❌ You cannot stay right now. You must draw a card first.`);
            return;
        }
        const currentPlayer = this.players[this.currentPlayerIndex];
        // If player has busted and must stay, clear the flag and switch turn
        if (this.mustStay && currentPlayer.isBusted) {
            console.log(`${currentPlayer.name} acknowledges bust and stays.`);
            this.mustStay = false;
            // Mark player as stayed
            if (this.currentPlayerIndex === 0) {
                this.player1Stayed = true;
            }
            else {
                this.player2Stayed = true;
            }
            // Switch to AI turn
            this.switchTurn();
            return;
        }
        console.log(`${currentPlayer.name} stays.`);
        // Mark current player as stayed
        if (this.currentPlayerIndex === 0) {
            this.player1Stayed = true;
        }
        else {
            this.player2Stayed = true;
        }
        // If both players have stayed, end the round
        if (this.player1Stayed && this.player2Stayed) {
            console.log("Both have stayed! Outputting scores");
            await this.endRound();
        }
        else {
            this.switchTurn();
        }
    }
    // Use an ability card
    async useAbility(abilityIndex) {
        if (this.gameOver)
            return false;
        const currentPlayer = this.players[this.currentPlayerIndex];
        const opponent = this.players[1 - this.currentPlayerIndex];
        // Check if player has any abilities
        if (currentPlayer.abilityHand.length === 0) {
            console.log(`You have no ability cards to use.`);
            return false;
        }
        // Check valid index
        if (abilityIndex < 0 || abilityIndex >= currentPlayer.abilityHand.length) {
            console.log(`Invalid ability index. Choose 1-${currentPlayer.abilityHand.length}.`);
            return false;
        }
        // Use the ability
        const success = currentPlayer.useAbility(abilityIndex, this, opponent);
        if (success) {
            // Ability was used successfully
            // Note: abilities don't end your turn, you can still draw or stay
            return true;
        }
        return false;
    }
    // Switch to next player
    switchTurn() {
        // Stop the current player's timer
        this.stopTurnTimer();
        // Reset forced draw tracking and flags for new turn
        this.forcedDrawCount = 0;
        this.mustDraw = false;
        this.mustStay = false;
        this.timePenaltyApplied = false;
        this.currentPlayerIndex = 1 - this.currentPlayerIndex; // Flips 0↔1
        console.log(`\nNow it's ${this.players[this.currentPlayerIndex].name}'s turn.`);
        // Start timer for the new player (if not AI)
        this.startTurnTimer();
        // Note: AI turn is now controlled manually from the game loop
        // This allows for better control in interactive mode
    }
    // Execute AI player's turn
    async executeAITurn() {
        const aiPlayer = this.players[1];
        // Bug 2 Fix: Check if AI has already stayed or busted before acting
        if (aiPlayer.isBusted || this.player2Stayed) {
            // Don't log here, let the game loop handle it
            return;
        }
        // Add delay before AI makes decision, longer for higher difficulties
        // Level 1: 3s, Level 2: 3.5s, Level 3: 4s, Level 4: 4.5s, Level 5: 5s
        let thinkingTime = 3000;
        if (aiPlayer instanceof AIPlayer) {
            thinkingTime = 2500 + (aiPlayer.difficulty * 500);
        }
        await this.delay(thinkingTime);
        // Check if AI is an AIPlayer instance
        if (!(aiPlayer instanceof AIPlayer)) {
            console.error(`Expected AIPlayer instance for single player mode, but got: ${aiPlayer.constructor.name}`);
            return;
        }
        // AI makes decision
        const opponentVisibleScore = this.players[0].calculateVisibleScore();
        const deckCardsRemaining = this.deck.cardsRemaining();
        const shouldHit = aiPlayer.shouldHit(opponentVisibleScore, deckCardsRemaining);
        if (shouldHit) {
            console.log(`${aiPlayer.name} decides to draw a card.`);
            await this.playerDraws();
        }
        else {
            console.log(`${aiPlayer.name} decides to stay.`);
            await this.playerStays();
        }
    }
    // End the round and determine winner
    async endRound() {
        console.log("\n=== Round Over ===");
        console.log("Revealing hidden cards...");
        // Add suspense before reveal
        await this.delay(3000);
        // Reveal all face-down cards
        this.players[0].revealFaceDownCard();
        this.players[1].revealFaceDownCard();
        const player1 = this.players[0];
        const player2 = this.players[1];
        const score1 = player1.calculateTotalScore();
        const score2 = player2.calculateTotalScore();
        console.log(`${player1.name}: ${player1.printHand()} = ${score1}`);
        console.log(`${player2.name}: ${player2.printHand()} = ${score2}`);
        // Pause after showing scores
        await this.delay(3000);
        // Determine round winner
        let roundWinner = null;
        let roundLoser = null;
        if (score1 > this.targetNumber && score2 > this.targetNumber) {
            // Both bust - closer to target wins (Bug 7 Fix: use absolute value)
            roundWinner = (Math.abs(this.targetNumber - score1) < Math.abs(this.targetNumber - score2)) ? player1 : player2;
        }
        else if (score1 > this.targetNumber) {
            roundWinner = player2;
            roundLoser = player1;
        }
        else if (score2 > this.targetNumber) {
            roundWinner = player1;
            roundLoser = player2;
        }
        else {
            // Neither bust - closer to target wins
            roundWinner = (Math.abs(this.targetNumber - score1) < Math.abs(this.targetNumber - score2)) ? player1 : player2;
        }
        console.log(`Round winner: ${roundWinner.name} (Target: ${this.targetNumber})`);
        // Pause before showing kill machine movement
        await this.delay(3000);
        // Update kill machine
        this.updateKillMachine(roundWinner);
        // Pause after kill machine update
        await this.delay(3000);
        // Check for game over
        this.checkGameOver();
        // Start next round if game continues
        if (!this.gameOver) {
            this.roundNumber++;
            // Update move distance based on settings
            if (this.settings.moveDistanceMode === 'shuffle') {
                // Random distance between 1 and 3
                this.moveDistance = Math.floor(Math.random() * 3) + 1;
                console.log(`Move distance shuffled to: ${this.moveDistance}`);
            }
            else {
                // Rise mode: increase by 1 each round (default)
                this.moveDistance++;
            }
            // Reset to first player based on settings
            if (this.settings.firstPlayer === 'player2') {
                this.currentPlayerIndex = 1;
            }
            else if (this.settings.firstPlayer === 'random') {
                this.currentPlayerIndex = Math.random() < 0.5 ? 0 : 1;
            }
            else {
                this.currentPlayerIndex = 0;
            }
            // Pause before starting new round
            await this.delay(3500);
            this.setupNewRound();
        }
    }
    // Helper method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Move the kill machine (Bug 4 Fix: Number line approach)
    updateKillMachine(roundWinner) {
        const actualMoveDistance = this.moveDistance + this.betModifier;
        // Number line: 0 = P1, 6 = center, 12 = P2
        if (roundWinner === this.players[0]) {
            // Player 1 wins, machine moves toward Player 2 (right on number line)
            const newPosition = this.machinePosition + actualMoveDistance;
            // Check if player 2 has Bless and would die
            if (this.players[1].hasBless && newPosition >= 12) {
                console.log(`${this.players[1].name} uses Bless to avoid death!`);
                this.players[1].hasBless = false;
                return;
            }
            this.machinePosition = newPosition;
            console.log(`Machine moves ${actualMoveDistance} toward ${this.players[1].name} (base: ${this.moveDistance}, modifier: ${this.betModifier})`);
        }
        else {
            // Player 2 wins, machine moves toward Player 1 (left on number line)
            const newPosition = this.machinePosition - actualMoveDistance;
            // Check if player 1 has Bless and would die
            if (this.players[0].hasBless && newPosition <= 0) {
                console.log(`${this.players[0].name} uses Bless to avoid death!`);
                this.players[0].hasBless = false;
                return;
            }
            this.machinePosition = newPosition;
            console.log(`Machine moves ${actualMoveDistance} toward ${this.players[0].name} (base: ${this.moveDistance}, modifier: ${this.betModifier})`);
        }
        // Calculate distances from machine to each player
        const distanceToP1 = this.machinePosition - 0;
        const distanceToP2 = 12 - this.machinePosition;
        console.log(`Machine position: ${this.machinePosition} (Distance to P1: ${distanceToP1}, Distance to P2: ${distanceToP2})`);
    }
    // Check if machine reached a player (Bug 4 Fix: Use number line positions)
    checkGameOver() {
        if (this.machinePosition <= 0) {
            this.gameOver = true;
            this.winner = this.players[1]; // Player 2 wins
            console.log(`\nGAME OVER! The machine reached ${this.players[0].name}!`);
            console.log(`${this.players[1].name} wins!`);
        }
        else if (this.machinePosition >= 12) {
            this.gameOver = true;
            this.winner = this.players[0]; // Player 1 wins
            console.log(`\nGAME OVER! The machine reached ${this.players[1].name}!`);
            console.log(`${this.players[0].name} wins!`);
        }
    }
    // Start turn timer
    startTurnTimer() {
        // Clear any existing timer
        this.stopTurnTimer();
        // Only reset forced action flag if it wasn't just set
        // (Don't reset it immediately after a forced action)
        if (!this.forcedActionTaken) {
            // This is a normal turn start, not following a forced action
        }
        // Skip timer for AI players
        if (this.players[this.currentPlayerIndex] instanceof AIPlayer) {
            return;
        }
        const timerSeconds = this.settings.timerSeconds || 30;
        this.turnStartTime = Date.now();
        this.turnTimeRemaining = timerSeconds;
        console.log(`\nTimer started: ${timerSeconds} seconds`);
        // Set up timer to check every second
        this.turnTimer = setInterval(() => {
            if (!this.turnStartTime)
                return;
            const elapsed = Math.floor((Date.now() - this.turnStartTime) / 1000);
            this.turnTimeRemaining = timerSeconds - elapsed;
            // Warn at 10 seconds
            if (this.turnTimeRemaining === 10) {
                console.log(`\n⚠️  WARNING: 10 seconds remaining!`);
            }
            // Time's up - force action
            if (this.turnTimeRemaining <= 0) {
                this.stopTurnTimer();
                const currentPlayer = this.players[this.currentPlayerIndex];
                const currentPlayerStayed = (this.currentPlayerIndex === 0) ? this.player1Stayed : this.player2Stayed;
                // Check if player has busted and must stay
                if (this.mustStay && currentPlayer.isBusted && !this.timePenaltyApplied) {
                    console.log(`\n⏰ Time's up! You did not stay after busting.`);
                    console.log(`⚠️  PENALTY: Machine moves 1 space closer to you!`);
                    // Apply penalty: move machine toward the current player
                    if (this.currentPlayerIndex === 0) {
                        // Player 1 timed out, move machine toward Player 1
                        this.machinePosition--;
                        console.log(`Machine position: ${this.machinePosition}`);
                    }
                    else {
                        // Player 2 timed out, move machine toward Player 2
                        this.machinePosition++;
                        console.log(`Machine position: ${this.machinePosition}`);
                    }
                    this.timePenaltyApplied = true;
                    // Force stay and switch turn
                    console.log(`Forcing stay...`);
                    this.playerStays().catch(err => console.error('Error forcing stay:', err));
                    return;
                }
                // Bug 3 Fix: Check if player has already busted or stayed
                if (currentPlayer.isBusted || currentPlayerStayed) {
                    console.log(`\n⏰ Time's up! Player has already ${currentPlayer.isBusted ? 'busted' : 'stayed'}.`);
                    // Just switch turn, don't force draw
                    this.switchTurn();
                }
                else {
                    // Bug 1 Fix: Force draw and restart timer (don't switch turns)
                    this.forcedDrawCount++;
                    console.log(`\n⏰ Time's up! Forcing draw (${this.forcedDrawCount})...`);
                    this.forcedActionTaken = true;
                    this.mustDraw = true; // Player must draw next, cannot stay
                    // Force the draw (pass true to skip turn switch)
                    this.playerDraws(true).then(() => {
                        // After forced draw, check if player busted or if round ended
                        if (!this.gameOver && !currentPlayer.isBusted) {
                            // Player didn't bust, restart timer and require another draw
                            console.log(`\n⚠️  You must draw a card (cannot stay). Timer restarting...`);
                            // Don't call switchTurn - keep it as same player's turn
                            // Manually restart timer for the same player
                            this.startTurnTimer();
                        }
                        else {
                            // Player busted or game ended, clear the mustDraw flag
                            this.mustDraw = false;
                        }
                    }).catch(err => console.error('Error forcing draw:', err));
                }
            }
        }, 1000);
    }
    // Stop turn timer
    stopTurnTimer() {
        if (this.turnTimer) {
            clearInterval(this.turnTimer);
            this.turnTimer = null;
            this.turnStartTime = null;
            this.turnTimeRemaining = 0;
        }
    }
    // Get remaining time for current turn
    getTurnTimeRemaining() {
        return this.turnTimeRemaining;
    }
}
