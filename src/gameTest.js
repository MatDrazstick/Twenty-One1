import { Game } from './Game.js';
import * as readline from 'readline';
// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Prompt user for input
function askQuestion(question) {
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
    const difficulty = parseInt(difficultyInput);
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
            // Check if player has busted and already stayed
            if (currentPlayer.isBusted && game.player1Stayed) {
                console.log("You have busted! Waiting for opponent's turn...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            // Show available actions
            let prompt = "\nChoose action: (d)raw, (s)tay";
            if (currentPlayer.abilityHand.length > 0) {
                prompt += ", (a)bility cards";
            }
            prompt += ": ";
            // Ask for player action
            const action = await askQuestion(prompt);
            if (action === 'd' || action === 'draw') {
                if (currentPlayer.isBusted) {
                    console.log("You have busted and cannot draw more cards.");
                    continue;
                }
                await game.playerDraws();
            }
            else if (action === 's' || action === 'stay') {
                await game.playerStays();
            }
            else if (action === 'a' || action === 'ability' || action === 'ability cards') {
                // Show ability cards
                if (currentPlayer.abilityHand.length === 0) {
                    console.log("You don't have any ability cards!");
                    continue;
                }
                console.log("\n=== Your Ability Cards ===");
                console.log(currentPlayer.printAbilityHand());
                console.log(`\nEnter ability number to use (1-${currentPlayer.abilityHand.length}), or 'b' to go back:`);
                const abilityChoice = await askQuestion("Choice: ");
                if (abilityChoice === 'b' || abilityChoice === 'back') {
                    continue;
                }
                const abilityIndex = parseInt(abilityChoice) - 1;
                if (isNaN(abilityIndex) || abilityIndex < 0 || abilityIndex >= currentPlayer.abilityHand.length) {
                    console.log("Invalid ability choice!");
                    continue;
                }
                // Use the ability
                const opponent = game.players[1];
                const result = currentPlayer.useAbility(abilityIndex, game, opponent);
                if (result) {
                    console.log(`Successfully used ability!`);
                    // Don't auto-switch turn after using ability, let player choose next action
                }
            }
            else {
                console.log("Invalid input! Please enter 'd' for draw, 's' for stay, or 'a' for ability cards.");
                continue;
            }
        }
        else {
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
    }
    else {
        console.log("\nThanks for playing!");
        rl.close();
    }
}
// Start the game
playGame().catch((error) => {
    console.error("Error:", error);
    rl.close();
});
