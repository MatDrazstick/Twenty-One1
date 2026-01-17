import { Game } from './Game.js';
console.log("=== Testing Twenty One Game - Single Player Mode ===\n");
// Test 1: Single player with AI difficulty level 1 (random)
console.log("--- Test 1: Single Player vs AI Level 1 (Random) ---");
const game1 = new Game("Alice", 'singleplayer', 1);
console.log(`Game Mode: ${game1.mode}`);
console.log(`AI Difficulty: ${game1.aiDifficulty}`);
console.log(`Player 1: ${game1.players[0].name}`);
console.log(`Player 2: ${game1.players[1].name}`);
// Make a few moves
console.log("\n--- Alice draws ---");
game1.playerDraws();
console.log("\n--- Alice draws again ---");
game1.playerDraws();
console.log("\n--- Alice stays ---");
game1.playerStays();
console.log("\n\n--- Test 2: Single Player vs AI Level 3 (Medium) ---");
const game2 = new Game("Bob", 'singleplayer', 3);
console.log(`Game Mode: ${game2.mode}`);
console.log(`Player 1: ${game2.players[0].name}`);
console.log(`Player 2: ${game2.players[1].name}`);
// Bob draws and stays quickly
console.log("\n--- Bob draws ---");
game2.playerDraws();
console.log("\n--- Bob stays ---");
game2.playerStays();
console.log("\n\n--- Test 3: Single Player vs AI Level 5 (Very Hard) ---");
const game3 = new Game("Charlie", 'singleplayer', 5);
console.log(`Game Mode: ${game3.mode}`);
console.log(`Player 1: ${game3.players[0].name}`);
console.log(`Player 2: ${game3.players[1].name}`);
// Charlie plays cautiously
console.log("\n--- Charlie stays immediately ---");
game3.playerStays();
console.log("\n\n--- Test 4: Multiplayer Mode (traditional) ---");
const game4 = new Game("Player1", "Player2");
console.log(`Game Mode: ${game4.mode}`);
console.log(`Player 1: ${game4.players[0].name}`);
console.log(`Player 2: ${game4.players[1].name}`);
console.log("\n--- Player 1 draws ---");
game4.playerDraws();
console.log("\n--- Player 2 draws ---");
game4.playerDraws();
console.log("\n--- Player 1 stays ---");
game4.playerStays();
console.log("\n--- Player 2 stays ---");
game4.playerStays();
console.log("\n=== All Tests Completed ===");
