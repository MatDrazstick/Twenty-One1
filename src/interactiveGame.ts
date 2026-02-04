import { Game, GameSettings } from './Game.js';
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

// Settings menu
async function configureSettings(): Promise<GameSettings> {
  console.log("\n=== GAME SETTINGS ===\n");
  
  const settings: GameSettings = {};
  
  // Timer setting
  console.log("Timer Options:");
  console.log("1 - 15 seconds");
  console.log("2 - 30 seconds (default)");
  console.log("3 - 45 seconds");
  console.log("4 - 60 seconds");
  console.log("5 - 75 seconds");
  console.log("6 - 90 seconds");
  
  const timerChoice = await askQuestion("Choose timer (1-6, or press Enter for default): ");
  
  switch (timerChoice) {
    case '1': settings.timerSeconds = 15; break;
    case '2': settings.timerSeconds = 30; break;
    case '3': settings.timerSeconds = 45; break;
    case '4': settings.timerSeconds = 60; break;
    case '5': settings.timerSeconds = 75; break;
    case '6': settings.timerSeconds = 90; break;
    default: settings.timerSeconds = 30; break;
  }
  
  console.log(`✓ Timer set to ${settings.timerSeconds} seconds\n`);
  
  // Move Distance Mode setting
  console.log("Move Distance Mode:");
  console.log("1 - Rise (increases by 1 each round) - default");
  console.log("2 - Shuffle (random 1-3 each round)");
  
  const moveChoice = await askQuestion("Choose mode (1-2, or press Enter for default): ");
  
  if (moveChoice === '2') {
    settings.moveDistanceMode = 'shuffle';
  } else {
    settings.moveDistanceMode = 'rise';
  }
  
  console.log(`✓ Move distance mode set to ${settings.moveDistanceMode}\n`);
  
  // First Player setting
  console.log("First Player:");
  console.log("1 - Player 1 (you) - default");
  console.log("2 - Player 2 (AI)");
  console.log("3 - Random");
  
  const firstPlayerChoice = await askQuestion("Choose first player (1-3, or press Enter for default): ");
  
  switch (firstPlayerChoice) {
    case '2': settings.firstPlayer = 'player2'; break;
    case '3': settings.firstPlayer = 'random'; break;
    default: settings.firstPlayer = 'player1'; break;
  }
  
  console.log(`✓ First player set to ${settings.firstPlayer}\n`);
  
  return settings;
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
  
  // Ask if user wants to configure settings
  const configureSettingsChoice = await askQuestion("\nWould you like to configure game settings? (y/n, default: n): ");
  
  let settings: GameSettings | undefined;
  if (configureSettingsChoice === 'y' || configureSettingsChoice === 'yes') {
    settings = await configureSettings();
  }
  
  // Create the game with settings
  const game = new Game(playerName || "Player", "singleplayer", difficulty || 3, settings);
  
  console.log("\n=== GAME STARTED ===");
  console.log(`Timer: ${game.settings.timerSeconds} seconds per turn`);
  console.log(`Move Distance Mode: ${game.settings.moveDistanceMode}`);
  console.log(`First Player: ${game.settings.firstPlayer}`);
  console.log(`Starting player: ${game.players[game.currentPlayerIndex].name}\n`);
  
  // Game loop
  while (!game.gameOver) {
    // Check whose turn it is
    const currentPlayer = game.players[game.currentPlayerIndex];
    
    // Check if current player has already acted (stayed or busted)
    const p1Done = game.player1Stayed || game.players[0].isBusted;
    const p2Done = game.player2Stayed || game.players[1].isBusted;
    
    // If both players are done, the round should have ended
    // Continue loop to allow endRound() to process
    if (p1Done && p2Done) {
      await new Promise(resolve => setTimeout(resolve, 100));
      continue;
    }
    
    // Bug 2 Fix: Check if current player is already done before processing turn
    const currentPlayerDone = (game.currentPlayerIndex === 0) ? p1Done : p2Done;
    if (currentPlayerDone) {
      // Current player is done, switch to other player
      console.log(`${currentPlayer.name} has already completed their turn.`);
      game.currentPlayerIndex = 1 - game.currentPlayerIndex;
      continue;
    }
    
    // If it's the AI's turn, execute AI turn
    if (game.currentPlayerIndex === 1) {
      await game.executeAITurn();
      continue;
    }
    
    // Human player's turn
    console.log(`\n--- ${currentPlayer.name}'s Turn ---`);
    console.log(`Your hand: ${currentPlayer.printHand()}`);
    console.log(`Your visible score: ${currentPlayer.calculateVisibleScore()}`);
    
    // Bug 1 Fix: Show hidden card to current player only
    if (currentPlayer.faceDownCard) {
      console.log(`Your hidden card: [${currentPlayer.faceDownCard.values}]`);
    }
    
    // Show time remaining
    const timeRemaining = game.getTurnTimeRemaining();
    if (timeRemaining > 0) {
      console.log(`Time remaining: ${timeRemaining} seconds`);
    }
    
    // Show ability cards
    if (currentPlayer.abilityHand.length > 0) {
      console.log(`\nYour abilities: ${currentPlayer.printAbilityHand()}`);
    }
    
    // Get player action
    const action = await askQuestion("\nWhat would you like to do? (draw/stay): ");
    
    // Bug 3 Fix: Check if timer forced an action while we were waiting for input
    if (game.forcedActionTaken) {
      console.log("(Timer already forced an action, ignoring input)");
      game.forcedActionTaken = false;  // Reset the flag
      continue;  // Skip to next iteration
    }
    
    if (action === 'draw' || action === 'd') {
      await game.playerDraws();
    } else if (action === 'stay' || action === 's') {
      await game.playerStays();
    } else {
      console.log("Invalid action. Please type 'draw' or 'stay'.");
    }
  }
  
  // Game over
  console.log("\n=== GAME COMPLETE ===");
  console.log(`Winner: ${game.winner?.name}`);
  
  rl.close();
  process.exit(0);
}

// Start the game
playGame().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
