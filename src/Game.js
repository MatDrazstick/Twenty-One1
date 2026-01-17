import { Deck } from './Deck.js';
import { Player } from './Players.js';
import { AIPlayer } from './AIPlayer.js';
export class Game {
    // Core game components
    deck;
    players;
    currentPlayerIndex; // 0 or 1
    // Game mode
    mode;
    aiDifficulty;
    // Kill machine mechanic
    machineDistanceP1;
    machineDistanceP2;
    moveDistance;
    // Game state
    gameOver;
    winner;
    roundNumber;
    player1Stayed;
    player2Stayed;
    constructor(player1Name, player2NameOrMode, aiDifficultyOrSettings, settings) {
        // Initialize basic properties
        this.deck = new Deck();
        this.machineDistanceP1 = 7;
        this.machineDistanceP2 = 7;
        this.moveDistance = 1;
        this.currentPlayerIndex = 0;
        this.gameOver = false;
        this.winner = null;
        this.roundNumber = 1;
        this.player1Stayed = false;
        this.player2Stayed = false;
        // Determine which constructor signature was used and create players
        // Check if second parameter is a game mode
        if (player2NameOrMode === 'singleplayer' || player2NameOrMode === 'multiplayer') {
            // New signature: (player1Name, mode, aiDifficulty?, settings?)
            this.mode = player2NameOrMode;
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
        }
        this.setupNewRound();
    }
    // Initial deal for a round
    setupNewRound() {
        console.log(`\n=== Round ${this.roundNumber} ===`);
        // Reset deck if needed
        if (this.deck.cardsRemaining() < 4) {
            this.deck.reset();
            this.deck.shuffle();
            console.log("Deck reshuffled!");
        }
        // Reset player hands and stayed flags
        this.players.forEach(player => {
            player.hand = [];
            player.faceDownCard = null;
            player.isBusted = false;
        });
        this.player1Stayed = false;
        this.player2Stayed = false;
        // Deal: face-down then face-up for each player
        this.players[0].setFaceDownCard(this.deck.dealCard(false));
        this.players[1].setFaceDownCard(this.deck.dealCard(false));
        this.players[0].addCard(this.deck.dealCard(true));
        this.players[1].addCard(this.deck.dealCard(true));
        console.log("Cards dealt!");
        console.log(`${this.players[0].name}: ${this.players[0].printHand()}`);
        console.log(`${this.players[1].name}: ${this.players[1].printHand()}`);
    }
    // Current player draws a card
    playerDraws() {
        if (this.gameOver)
            return;
        const currentPlayer = this.players[this.currentPlayerIndex];
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
        if (currentPlayer.calculateTotalScore() > 21) {
            currentPlayer.isBusted = true;
            console.log(`You busted with a total of ${currentPlayer.calculateTotalScore()}!`);
            // Automatically mark as stayed since they can't draw anymore
            if (this.currentPlayerIndex === 0) {
                this.player1Stayed = true;
            }
            else {
                this.player2Stayed = true;
            }
            // If both players have stayed/busted, end the round
            if (this.player1Stayed && this.player2Stayed) {
                console.log("Both have stayed! Outputting scores");
                this.endRound();
            }
            else {
                // Switch to other player without revealing the bust
                this.switchTurn();
            }
            return;
        }
        // Switch to next player
        this.switchTurn();
    }
    // Current player stays
    playerStays() {
        if (this.gameOver)
            return;
        const currentPlayer = this.players[this.currentPlayerIndex];
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
            this.endRound();
        }
        else {
            this.switchTurn();
        }
    }
    // Switch to next player
    switchTurn() {
        this.currentPlayerIndex = 1 - this.currentPlayerIndex; // Flips 0↔1
        console.log(`\nNow it's ${this.players[this.currentPlayerIndex].name}'s turn.`);
        // If it's AI's turn in single player mode, execute AI move
        if (this.mode === 'singleplayer' && this.currentPlayerIndex === 1) {
            this.executeAITurn();
        }
    }
    // Execute AI player's turn
    executeAITurn() {
        const aiPlayer = this.players[1];
        // Check if AI is an AIPlayer instance
        if (!(aiPlayer instanceof AIPlayer)) {
            console.error('Player 2 is not an AI player!');
            return;
        }
        // AI makes decision
        const opponentVisibleScore = this.players[0].calculateVisibleScore();
        const deckCardsRemaining = this.deck.cardsRemaining();
        const shouldHit = aiPlayer.shouldHit(opponentVisibleScore, deckCardsRemaining);
        if (shouldHit) {
            console.log(`${aiPlayer.name} decides to draw a card.`);
            this.playerDraws();
        }
        else {
            console.log(`${aiPlayer.name} decides to stay.`);
            this.playerStays();
        }
    }
    // End the round and determine winner
    endRound() {
        console.log("\n=== Round Over ===");
        // Reveal all face-down cards
        this.players[0].revealFaceDownCard();
        this.players[1].revealFaceDownCard();
        const player1 = this.players[0];
        const player2 = this.players[1];
        const score1 = player1.calculateTotalScore();
        const score2 = player2.calculateTotalScore();
        console.log(`${player1.name}: ${player1.printHand()} = ${score1}`);
        console.log(`${player2.name}: ${player2.printHand()} = ${score2}`);
        // Determine round winner
        let roundWinner = null;
        let roundLoser = null;
        if (score1 > 21 && score2 > 21) {
            // Both bust - closer to 21 wins
            roundWinner = (21 - score1 < 21 - score2) ? player1 : player2;
        }
        else if (score1 > 21) {
            roundWinner = player2;
            roundLoser = player1;
        }
        else if (score2 > 21) {
            roundWinner = player1;
            roundLoser = player2;
        }
        else {
            // Neither bust - closer to 21 wins
            roundWinner = (Math.abs(21 - score1) < Math.abs(21 - score2)) ? player1 : player2;
        }
        console.log(`Round winner: ${roundWinner.name}`);
        // Update kill machine
        this.updateKillMachine(roundWinner);
        // Check for game over
        this.checkGameOver();
        // Start next round if game continues
        if (!this.gameOver) {
            this.roundNumber++;
            this.moveDistance++; // Increase move distance for next round
            this.currentPlayerIndex = 0; // Reset to player 1
            this.setupNewRound();
        }
    }
    // Move the kill machine
    updateKillMachine(roundWinner) {
        if (roundWinner === this.players[0]) {
            // Machine moves toward player 2
            this.machineDistanceP2 -= this.moveDistance;
            console.log(`Machine moves ${this.moveDistance} toward ${this.players[1].name}`);
        }
        else {
            // Machine moves toward player 1
            this.machineDistanceP1 -= this.moveDistance;
            console.log(`Machine moves ${this.moveDistance} toward ${this.players[0].name}`);
        }
        console.log(`Machine distances: P1=${this.machineDistanceP1}, P2=${this.machineDistanceP2}`);
    }
    // Check if machine reached a player
    checkGameOver() {
        if (this.machineDistanceP1 <= 0) {
            this.gameOver = true;
            this.winner = this.players[1]; // Player 2 wins
            console.log(`\nGAME OVER! ${this.players[1].name} wins!`);
        }
        else if (this.machineDistanceP2 <= 0) {
            this.gameOver = true;
            this.winner = this.players[0]; // Player 1 wins
            console.log(`\nGAME OVER! ${this.players[0].name} wins!`);
        }
    }
}
