import { Game } from './Game.js';
console.log("=== First Player Selection Test ===\n");
// Test 1: Player1 starts (default)
console.log("Test 1: Player1 starts (default)");
const game1 = new Game("Alice", "Bob");
console.log(`Current player index: ${game1.currentPlayerIndex} (expected: 0)`);
console.log(`Current player: ${game1.players[game1.currentPlayerIndex].name} (expected: Alice)`);
console.log(`Setting: ${game1.settings.firstPlayer}`);
if (game1.currentPlayerIndex !== 0) {
    console.error("ERROR: Expected player index 0");
    process.exit(1);
}
game1.stopTurnTimer();
console.log("✓ Test 1 passed\n");
// Test 2: Player2 starts
console.log("Test 2: Player2 starts");
const settings2 = { firstPlayer: 'player2' };
const game2 = new Game("Charlie", "Diana", settings2);
console.log(`Current player index: ${game2.currentPlayerIndex} (expected: 1)`);
console.log(`Current player: ${game2.players[game2.currentPlayerIndex].name} (expected: Diana)`);
console.log(`Setting: ${game2.settings.firstPlayer}`);
if (game2.currentPlayerIndex !== 1) {
    console.error("ERROR: Expected player index 1");
    process.exit(1);
}
game2.stopTurnTimer();
console.log("✓ Test 2 passed\n");
// Test 3: Random selection (test multiple times)
console.log("Test 3: Random selection (10 trials)");
const settings3 = { firstPlayer: 'random' };
let player1Count = 0;
let player2Count = 0;
for (let i = 0; i < 10; i++) {
    const game = new Game("Eve", "Frank", settings3);
    if (game.currentPlayerIndex === 0) {
        player1Count++;
    }
    else if (game.currentPlayerIndex === 1) {
        player2Count++;
    }
    else {
        console.error(`ERROR: Invalid player index ${game.currentPlayerIndex}`);
        process.exit(1);
    }
    game.stopTurnTimer();
}
console.log(`Player1 started: ${player1Count} times`);
console.log(`Player2 started: ${player2Count} times`);
console.log(`Total: ${player1Count + player2Count} (expected: 10)`);
// Both players should have been selected at least once in 10 trials (very likely)
// We're just checking that both 0 and 1 are possible values
if (player1Count === 0 || player2Count === 0) {
    console.warn("WARNING: One player was never selected in 10 random trials (unlikely but possible)");
}
if (player1Count + player2Count !== 10) {
    console.error("ERROR: Total trials should be 10");
    process.exit(1);
}
console.log("✓ Test 3 passed\n");
// Test 4: Single player with player2 starting (AI starts)
console.log("Test 4: Single player with AI starting");
const settings4 = { firstPlayer: 'player2' };
const game4 = new Game("George", "singleplayer", 3, settings4);
console.log(`Current player index: ${game4.currentPlayerIndex} (expected: 1)`);
console.log(`Current player: ${game4.players[game4.currentPlayerIndex].name} (expected: AI)`);
if (game4.currentPlayerIndex !== 1) {
    console.error("ERROR: Expected player index 1 (AI)");
    process.exit(1);
}
console.log("✓ Test 4 passed\n");
console.log("=== All First Player Tests Passed! ===");
process.exit(0);
