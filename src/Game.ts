import { Deck } from './Deck.js';
import { Player } from './Players.js';
import { Card } from './Card.js';
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
  
    constructor(player1Name: string, player2Name: string, settings?: GameSettings) {
        //apply settings or use defaults
    this.deck = new Deck();
    this.players = [
      new Player(player1Name),
      new Player(player2Name)
    ];
    
    // Initialize kill machine
    this.machineDistanceP1 = 7;  // Starts 7 away from both players
    this.machineDistanceP2 = 7;
    this.moveDistance = 1;  // Increases by 1 each round
    
    this.currentPlayerIndex = 0;  // Player 1 starts
    this.gameOver = false;
    this.winner = null;
    this.roundNumber = 1;
    this.player1Stayed = false;
    this.player2Stayed = false;
    
    this.setupNewRound();
  }
  
  // Initial deal for a round
  private setupNewRound(): void {
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
  playerDraws(): void {
    if (this.gameOver) return;
    
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
      } else {
        this.player2Stayed = true;
      }
      
      // If both players have stayed/busted, end the round
      if (this.player1Stayed && this.player2Stayed) {
        console.log("Both have stayed! Outputting scores");
        this.endRound();
      } else {
        // Switch to other player without revealing the bust
        this.switchTurn();
      }
      return;
    }
    
    // Switch to next player
    this.switchTurn();
  }
  
  // Current player stays
  playerStays(): void {
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
      this.endRound();
    } else {
      this.switchTurn();
    }
  }
  
  // Switch to next player
  private switchTurn(): void {
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;  // Flips 0↔1
    console.log(`\nNow it's ${this.players[this.currentPlayerIndex].name}'s turn.`);
  }
  
  // End the round and determine winner
  private endRound(): void {
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
    let roundWinner: Player | null = null;
    let roundLoser: Player | null = null;
    
    if (score1 > 21 && score2 > 21) {
      // Both bust - closer to 21 wins
      roundWinner = (21 - score1 < 21 - score2) ? player1 : player2;
    } else if (score1 > 21) {
      roundWinner = player2;
      roundLoser = player1;
    } else if (score2 > 21) {
      roundWinner = player1;
      roundLoser = player2;
    } else {
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
      this.moveDistance++;  // Increase move distance for next round
      this.currentPlayerIndex = 0;  // Reset to player 1
      this.setupNewRound();
    }
  }
  
  // Move the kill machine
  private updateKillMachine(roundWinner: Player): void {
    if (roundWinner === this.players[0]) {
      // Machine moves toward player 2
      this.machineDistanceP2 -= this.moveDistance;
      console.log(`Machine moves ${this.moveDistance} toward ${this.players[1].name}`);
    } else {
      // Machine moves toward player 1
      this.machineDistanceP1 -= this.moveDistance;
      console.log(`Machine moves ${this.moveDistance} toward ${this.players[0].name}`);
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