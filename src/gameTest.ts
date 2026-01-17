import { Game } from './Game.js';
import * as readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for input
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Main game loop
async function playGame() {
  console.log("=== TWENTY-ONE: SINGLE PLAYER MODE ===\n");
  
  // Get player name
  const playerName = await askQuestion("Enter your name: ");
  
  // Get AI difficulty
  console.log("\nSelect AI Difficulty:");
  console.log("1 - Random (Easy)");
  console.log("2 - Basic (Stays at 17+)");
  console.log("3 - Conservative (Stays at 15+)");
  console.log("4 - Smart (Considers opponent)");
  console.log("5 - Advanced (Optimal strategy)");
  
  const difficultyInput = await askQuestion("Choose difficulty (1-5): ");
  const difficulty = parseInt(difficultyInput) as 1 | 2 | 3 | 4 | 5;
  
  if (difficulty < 1 || difficulty > 5 || isNaN(difficulty)) {
    console.log("Invalid difficulty! Using level 3 (Medium)");
  }
  
  // Create the game
  const game = new Game(playerName || "Player", "singleplayer", difficulty || 3);
  
  console.log("\n=== GAME STARTED ===\n");
  
  // Game loop
  while (!game.gameOver) {
    // Check whose turn it is
    const currentPlayer = game.players[game.currentPlayerIndex];
    
    if (game.currentPlayerIndex === 0) {
      // Human player's turn
      console.log(`\n--- ${currentPlayer.name}'s Turn ---`);
      console.log(`Your hand: ${currentPlayer.printHand()}`);
      console.log(`Your visible score: ${currentPlayer.calculateVisibleScore()}`);
      console.log(`Your total score (including hidden card): ${currentPlayer.calculateTotalScore()}`);
      console.log(`Opponent's visible score: ${game.players[1].calculateVisibleScore()}`);
      console.log(`\nKill Machine - Distance to you: ${game.machineDistanceP1}, Distance to AI: ${game.machineDistanceP2}`);
      
      // Check if player has busted
      if (currentPlayer.isBusted) {
        console.log("You have busted! Turn automatically passed.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // Ask for player action
      const action = await askQuestion("\nDo you want to (d)raw or (s)tay? ");
      
      if (action === 'd' || action === 'draw') {
        await game.playerDraws();
      } else if (action === 's' || action === 'stay') {
        await game.playerStays();
      } else {
        console.log("Invalid input! Please enter 'd' for draw or 's' for stay.");
        continue;
      }
    } else {
      // AI player's turn
      console.log(`\n--- ${currentPlayer.name}'s Turn ---`);
      console.log(`${currentPlayer.name} is thinking...`);
      
      // Execute AI turn (includes built-in delay)
      await game.executeAITurn();
    }
  }
  
  // Game over
  console.log("\n" + "=".repeat(50));
  console.log("GAME OVER!");
  console.log(`Winner: ${game.winner?.name}`);
  console.log("=".repeat(50) + "\n");
  
  // Ask if player wants to play again
  const playAgain = await askQuestion("Play again? (y/n): ");
  if (playAgain === 'y' || playAgain === 'yes') {
    await playGame();
  } else {
    console.log("\nThanks for playing!");
    rl.close();
  }
}

// Start the game
playGame().catch((error) => {
  console.error("Error:", error);
  rl.close();
});