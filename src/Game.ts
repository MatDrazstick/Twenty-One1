import { Deck } from './Deck.js';
import { Player } from './Players.js';
import { Card } from './Card.js';
import { AIPlayer, AIDifficulty } from './AIPlayer.js';
import { AbilityDeck } from './AbilityDeck.js';

export type GameMode = 'singleplayer' | 'multiplayer';

interface GameSettings {
  timerSeconds: number;  // 15-90
  moveDistanceMode: 'rise' | 'random';
  firstPlayer: 'player1' | 'player2' | 'random';
}

export class Game {
  // Core game components
  deck: Deck;
  players: Player[];
  currentPlayerIndex: number;  // 0 or 1
  
  // Ability card system
  abilityDeck: AbilityDeck;
  targetNumber: number;
  betModifier: number;
  lastAbilityPlayed: { player: Player; ability: string } | null;
  
  // Game mode
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
  
  // Kill machine mechanic
  machineDistanceP1: number;
  machineDistanceP2: number;
  moveDistance: number;
  
  // Game state
  gameOver: boolean;
  winner: Player | null;
  roundNumber: number;
  player1Stayed: boolean;
  player2Stayed: boolean;
  
  constructor(player1Name: string, player2Name: string, settings?: GameSettings);
  constructor(player1Name: string, mode: GameMode, aiDifficulty?: AIDifficulty, settings?: GameSettings);
  constructor(player1Name: string, player2NameOrMode: string | GameMode, aiDifficultyOrSettings?: AIDifficulty | GameSettings, settings?: GameSettings) {
    // Initialize basic properties
    this.deck = new Deck();
    this.abilityDeck = new AbilityDeck();
    this.machineDistanceP1 = 7;
    this.machineDistanceP2 = 7;
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
    
    // Determine which constructor signature was used and create players
    // Check if second parameter is a game mode
    if (player2NameOrMode === 'singleplayer' || player2NameOrMode === 'multiplayer') {
      // New signature: (player1Name, mode, aiDifficulty?, settings?)
      this.mode = player2NameOrMode;
      
      if (this.mode === 'singleplayer') {
        const difficulty = (aiDifficultyOrSettings as AIDifficulty) || 3;
        this.aiDifficulty = difficulty;
        this.players = [
          new Player(player1Name),
          new AIPlayer(difficulty)
        ];
      } else {
        this.players = [
          new Player(player1Name),
          new Player('Player 2')
        ];
      }
    } else {
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
  private setupNewRound(): void {
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
  }
  
  // Current player draws a card
  async playerDraws(): Promise<void> {
    if (this.gameOver) return;
    
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
      
      // Check if other player has also busted or stayed
      const otherPlayerIndex = 1 - this.currentPlayerIndex;
      const otherPlayer = this.players[otherPlayerIndex];
      const otherPlayerStayed = (otherPlayerIndex === 0) ? this.player1Stayed : this.player2Stayed;
      
      // End round if both players are done (busted or stayed)
      if (otherPlayer.isBusted || otherPlayerStayed) {
        console.log("Both players are done! Outputting scores");
        await this.endRound();
      } else {
        // Switch to other player - they still need their turn
        this.switchTurn();
      }
      return;
    }
    
    // Switch to next player
    this.switchTurn();
  }
  
  // Current player stays
  async playerStays(): Promise<void> {
    if (this.gameOver) return;
    
    const currentPlayer = this.players[this.currentPlayerIndex];
    console.log(`${currentPlayer.name} stays.`);
    
    // Mark current player as stayed
    if (this.currentPlayerIndex === 0) {
      this.player1Stayed = true;
    } else {
      this.player2Stayed = true;
    }
    
    // If both players have stayed, end the round
    if (this.player1Stayed && this.player2Stayed) {
      console.log("Both have stayed! Outputting scores");
      await this.endRound();
    } else {
      this.switchTurn();
    }
  }
  
  // Switch to next player
  private switchTurn(): void {
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;  // Flips 0↔1
    console.log(`\nNow it's ${this.players[this.currentPlayerIndex].name}'s turn.`);
    
    // Note: AI turn is now controlled manually from the game loop
    // This allows for better control in interactive mode
  }
  
  // Execute AI player's turn
  async executeAITurn(): Promise<void> {
    const aiPlayer = this.players[1];
    
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
    } else {
      console.log(`${aiPlayer.name} decides to stay.`);
      await this.playerStays();
    }
  }
  
  // End the round and determine winner
  async endRound(): Promise<void> {
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
    let roundWinner: Player | null = null;
    let roundLoser: Player | null = null;
    
    if (score1 > this.targetNumber && score2 > this.targetNumber) {
      // Both bust - closer to target wins
      roundWinner = (this.targetNumber - score1 < this.targetNumber - score2) ? player1 : player2;
    } else if (score1 > this.targetNumber) {
      roundWinner = player2;
      roundLoser = player1;
    } else if (score2 > this.targetNumber) {
      roundWinner = player1;
      roundLoser = player2;
    } else {
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
      this.moveDistance++;  // Increase move distance for next round
      this.currentPlayerIndex = 0;  // Reset to player 1
      
      // Pause before starting new round
      await this.delay(3500);
      this.setupNewRound();
    }
  }
  
  // Helper method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Move the kill machine
  private updateKillMachine(roundWinner: Player): void {
    const actualMoveDistance = this.moveDistance + this.betModifier;
    
    if (roundWinner === this.players[0]) {
      // Check if player 1 has Bless and would die
      if (this.players[1].hasBless && this.machineDistanceP2 - actualMoveDistance <= 0) {
        console.log(`${this.players[1].name} uses Bless to avoid death!`);
        this.players[1].hasBless = false;
        return;
      }
      
      // Machine moves toward player 2 (loser) and away from player 1 (winner)
      this.machineDistanceP2 -= actualMoveDistance;
      this.machineDistanceP1 += actualMoveDistance;
      console.log(`Machine moves ${actualMoveDistance} toward ${this.players[1].name} (base: ${this.moveDistance}, modifier: ${this.betModifier})`);
    } else {
      // Check if player 2 has Bless and would die
      if (this.players[0].hasBless && this.machineDistanceP1 - actualMoveDistance <= 0) {
        console.log(`${this.players[0].name} uses Bless to avoid death!`);
        this.players[0].hasBless = false;
        return;
      }
      
      // Machine moves toward player 1 (loser) and away from player 2 (winner)
      this.machineDistanceP1 -= actualMoveDistance;
      this.machineDistanceP2 += actualMoveDistance;
      console.log(`Machine moves ${actualMoveDistance} toward ${this.players[0].name} (base: ${this.moveDistance}, modifier: ${this.betModifier})`);
    }
    
    console.log(`Machine distances: P1=${this.machineDistanceP1}, P2=${this.machineDistanceP2}`);
  }
  
  // Check if machine reached a player
  private checkGameOver(): void {
    if (this.machineDistanceP1 <= 0) {
      this.gameOver = true;
      this.winner = this.players[1];  // Player 2 wins
      console.log(`\nGAME OVER! ${this.players[1].name} wins!`);
    } else if (this.machineDistanceP2 <= 0) {
      this.gameOver = true;
      this.winner = this.players[0];  // Player 1 wins
      console.log(`\nGAME OVER! ${this.players[0].name} wins!`);
    }
  }
  
}