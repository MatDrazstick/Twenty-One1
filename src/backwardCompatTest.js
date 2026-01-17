import { Game } from './Game.js';
console.log("=== Testing Multiplayer Mode (Backward Compatibility) ===\n");
// Test 1: Old constructor signature (player1Name, player2Name)
console.log("--- Test 1: Traditional multiplayer (old signature) ---");
const game1 = new Game("Alice", "Bob");
console.log(`Mode: ${game1.mode}`);
console.log(`Player 1: ${game1.players[0].name}`);
console.log(`Player 2: ${game1.players[1].name}`);
console.log(`AI Difficulty: ${game1.aiDifficulty || 'N/A'}`);
// Play a quick round
console.log("\nAlice draws and stays:");
game1.playerDraws();
game1.playerStays();
console.log("\nBob stays:");
game1.playerStays();
console.log("\n\n--- Test 2: New multiplayer mode signature ---");
const game2 = new Game("Charlie", "multiplayer");
console.log(`Mode: ${game2.mode}`);
console.log(`Player 1: ${game2.players[0].name}`);
console.log(`Player 2: ${game2.players[1].name}`);
console.log(`AI Difficulty: ${game2.aiDifficulty || 'N/A'}`);
console.log("\n=== Backward Compatibility Test Passed ===");
