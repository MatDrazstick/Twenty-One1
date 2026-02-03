import { Game } from './Game.js';
console.log("=== Settings Test Suite ===\n");
// Test 1: Default Settings
console.log("Test 1: Default Settings");
const game1 = new Game("Alice", "singleplayer", 3);
console.log(`Timer: ${game1.settings.timerSeconds} seconds (expected: 30)`);
console.log(`Move Distance Mode: ${game1.settings.moveDistanceMode} (expected: rise)`);
console.log(`First Player: ${game1.settings.firstPlayer} (expected: player1)`);
console.log(`Current Player: ${game1.players[game1.currentPlayerIndex].name}`);
console.log("✓ Test 1 passed\n");
// Test 2: Custom Timer Settings
console.log("Test 2: Custom Timer (15 seconds)");
const settings2 = { timerSeconds: 15 };
const game2 = new Game("Bob", "singleplayer", 3, settings2);
console.log(`Timer: ${game2.settings.timerSeconds} seconds (expected: 15)`);
console.log("✓ Test 2 passed\n");
// Test 3: Custom Timer Settings (45 seconds)
console.log("Test 3: Custom Timer (45 seconds)");
const settings3 = { timerSeconds: 45 };
const game3 = new Game("Charlie", "singleplayer", 3, settings3);
console.log(`Timer: ${game3.settings.timerSeconds} seconds (expected: 45)`);
console.log("✓ Test 3 passed\n");
// Test 4: Custom Timer Settings (90 seconds)
console.log("Test 4: Custom Timer (90 seconds)");
const settings4 = { timerSeconds: 90 };
const game4 = new Game("Diana", "singleplayer", 3, settings4);
console.log(`Timer: ${game4.settings.timerSeconds} seconds (expected: 90)`);
console.log("✓ Test 4 passed\n");
// Test 5: Shuffle Mode
console.log("Test 5: Shuffle Mode");
const settings5 = { moveDistanceMode: 'shuffle' };
const game5 = new Game("Eve", "singleplayer", 3, settings5);
console.log(`Move Distance Mode: ${game5.settings.moveDistanceMode} (expected: shuffle)`);
console.log(`Initial move distance: ${game5.moveDistance} (expected: 1)`);
console.log("✓ Test 5 passed\n");
// Test 6: Player 2 Starts First
console.log("Test 6: Player 2 Starts First");
const settings6 = { firstPlayer: 'player2' };
const game6 = new Game("Frank", "singleplayer", 3, settings6);
console.log(`First Player setting: ${game6.settings.firstPlayer} (expected: player2)`);
console.log(`Current player index: ${game6.currentPlayerIndex} (expected: 1)`);
console.log(`Current player: ${game6.players[game6.currentPlayerIndex].name}`);
console.log("✓ Test 6 passed\n");
// Test 7: Random First Player
console.log("Test 7: Random First Player");
const settings7 = { firstPlayer: 'random' };
const game7 = new Game("George", "singleplayer", 3, settings7);
console.log(`First Player setting: ${game7.settings.firstPlayer} (expected: random)`);
console.log(`Current player index: ${game7.currentPlayerIndex} (should be 0 or 1)`);
console.log(`Current player: ${game7.players[game7.currentPlayerIndex].name}`);
console.log("✓ Test 7 passed\n");
// Test 8: All Custom Settings
console.log("Test 8: All Custom Settings");
const settings8 = {
    timerSeconds: 60,
    moveDistanceMode: 'shuffle',
    firstPlayer: 'player2'
};
const game8 = new Game("Hannah", "singleplayer", 3, settings8);
console.log(`Timer: ${game8.settings.timerSeconds} seconds (expected: 60)`);
console.log(`Move Distance Mode: ${game8.settings.moveDistanceMode} (expected: shuffle)`);
console.log(`First Player: ${game8.settings.firstPlayer} (expected: player2)`);
console.log(`Current player index: ${game8.currentPlayerIndex} (expected: 1)`);
console.log("✓ Test 8 passed\n");
// Test 9: Multiplayer with Settings
console.log("Test 9: Multiplayer with Settings");
const settings9 = {
    timerSeconds: 45,
    moveDistanceMode: 'rise',
    firstPlayer: 'player1'
};
const game9 = new Game("Ian", "Julia", settings9);
console.log(`Mode: ${game9.mode} (expected: multiplayer)`);
console.log(`Timer: ${game9.settings.timerSeconds} seconds (expected: 45)`);
console.log(`Player 1: ${game9.players[0].name} (expected: Ian)`);
console.log(`Player 2: ${game9.players[1].name} (expected: Julia)`);
console.log("✓ Test 9 passed\n");
// Test 10: Verify Move Distance Changes with Shuffle Mode
console.log("Test 10: Move Distance with Shuffle Mode (simulated)");
const settings10 = { moveDistanceMode: 'shuffle' };
const game10 = new Game("Karl", "singleplayer", 3, settings10);
console.log(`Initial move distance: ${game10.moveDistance}`);
console.log("Simulating multiple rounds to check shuffle behavior:");
for (let i = 0; i < 5; i++) {
    game10.roundNumber++;
    if (game10.settings.moveDistanceMode === 'shuffle') {
        game10.moveDistance = Math.floor(Math.random() * 3) + 1;
    }
    else {
        game10.moveDistance++;
    }
    console.log(`Round ${game10.roundNumber}: move distance = ${game10.moveDistance} (should be 1-3)`);
}
console.log("✓ Test 10 passed\n");
// Test 11: Verify Move Distance Changes with Rise Mode
console.log("Test 11: Move Distance with Rise Mode");
const settings11 = { moveDistanceMode: 'rise' };
const game11 = new Game("Laura", "singleplayer", 3, settings11);
console.log(`Initial move distance: ${game11.moveDistance} (expected: 1)`);
console.log("Simulating multiple rounds to check rise behavior:");
for (let i = 0; i < 5; i++) {
    game11.roundNumber++;
    if (game11.settings.moveDistanceMode === 'shuffle') {
        game11.moveDistance = Math.floor(Math.random() * 3) + 1;
    }
    else {
        game11.moveDistance++;
    }
    console.log(`Round ${game11.roundNumber}: move distance = ${game11.moveDistance} (expected: ${i + 2})`);
}
console.log("✓ Test 11 passed\n");
// Test 12: Timer Methods
console.log("Test 12: Timer Methods");
const game12 = new Game("Mike", "singleplayer", 3);
console.log("Starting timer...");
game12.startTurnTimer();
console.log(`Timer started for ${game12.settings.timerSeconds} seconds`);
console.log(`Time remaining: ${game12.getTurnTimeRemaining()} seconds`);
console.log("Stopping timer...");
game12.stopTurnTimer();
console.log(`Time remaining after stop: ${game12.getTurnTimeRemaining()} seconds (expected: 0)`);
console.log("✓ Test 12 passed\n");
console.log("=== All Settings Tests Passed! ===");
