import { Game } from './Game.js';
import { Card } from './Card.js';
console.log("=== BOTH BUST WINNER TEST ===");
console.log("Testing winner determination when both players bust\n");
const settings = {
    timerSeconds: 30,
    moveDistanceMode: 'rise',
    firstPlayer: 'player1'
};
const game = new Game("Player1", "multiplayer", 3, settings);
game.players[1].name = "Player2";
console.log("Test Scenario: Both players will bust");
console.log("Player 1 will have score 23 (over by 2)");
console.log("Player 2 will have score 28 (over by 7)");
console.log("Expected winner: Player1 (closer to 21)\n");
// Setup hands to create specific scores
// Clear current hands
game.players[0].hand = [];
game.players[1].hand = [];
// Player 1: hidden 10 + visible 6 + visible 7 = 23
game.players[0].setFaceDownCard(new Card(10, false));
game.players[0].addCard(new Card(6, true));
game.players[0].addCard(new Card(7, true));
// Player 2: hidden 11 + visible 8 + visible 9 = 28
game.players[1].setFaceDownCard(new Card(11, false));
game.players[1].addCard(new Card(8, true));
game.players[1].addCard(new Card(9, true));
// Mark both as stayed to trigger round end
game.player1Stayed = true;
game.player2Stayed = true;
// Set busted flags
game.players[0].isBusted = true;
game.players[1].isBusted = true;
console.log("Setup complete:");
console.log(`- Player 1 hand: [10 (hidden)], [6], [7] = 23`);
console.log(`- Player 2 hand: [11 (hidden)], [8], [9] = 28`);
console.log(`- Target: ${game.targetNumber}`);
console.log(`- Distance from target: P1 = 2, P2 = 7`);
console.log();
async function runTest() {
    console.log("Calling endRound()...\n");
    // Stop any timers first
    game.stopTurnTimer();
    await game.endRound();
    console.log("\n=== TEST RESULTS ===");
    if (game.winner) {
        console.log(`Winner: ${game.winner.name}`);
        if (game.winner === game.players[0]) {
            console.log("✓ TEST PASSED: Player 1 correctly won (closer to 21)");
        }
        else {
            console.log("❌ TEST FAILED: Player 2 won but Player 1 should have won");
        }
    }
    else {
        console.log("No winner determined yet (round continues)");
    }
    process.exit(0);
}
runTest().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
