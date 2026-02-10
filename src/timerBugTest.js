import { Game } from './Game.js';
console.log("=== TIMER BUG TEST ===");
console.log("Testing with level 1 AI and 15 second timer\n");
// Create game with 15 second timer
const settings = {
    timerSeconds: 15,
    moveDistanceMode: 'rise',
    firstPlayer: 'player1'
};
const game = new Game("TestPlayer", "singleplayer", 1, settings);
console.log("Game created with:");
console.log(`- Timer: ${game.settings.timerSeconds} seconds`);
console.log(`- AI Difficulty: Level 1 (Random)`);
console.log(`- Starting player: ${game.players[game.currentPlayerIndex].name}\n`);
console.log("=== SIMULATING GAME FLOW ===\n");
// Function to wait
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function runTest() {
    console.log(`Initial state:`);
    console.log(`- Current player: ${game.players[game.currentPlayerIndex].name}`);
    console.log(`- P1 hand: ${game.players[0].printHand()}`);
    console.log(`- P1 visible score: ${game.players[0].calculateVisibleScore()}`);
    console.log(`- P1 hidden card: [${game.players[0].faceDownCard?.values}]`);
    console.log(`- P1 total score: ${game.players[0].calculateTotalScore()}`);
    console.log();
    console.log("Waiting for timer to expire (16 seconds)...");
    console.log("(Timer is set to 15 seconds, waiting 16 to ensure it expires)\n");
    // Wait for timer to expire
    await delay(16000);
    console.log("\n=== AFTER TIMER EXPIRATION ===");
    console.log(`- Current player: ${game.players[game.currentPlayerIndex].name}`);
    console.log(`- Player 1 busted: ${game.players[0].isBusted}`);
    console.log(`- mustDraw flag: ${game.mustDraw}`);
    console.log(`- mustStay flag: ${game.mustStay}`);
    console.log(`- forcedActionTaken flag: ${game.forcedActionTaken}`);
    console.log(`- P1 hand: ${game.players[0].printHand()}`);
    console.log(`- P1 visible score: ${game.players[0].calculateVisibleScore()}`);
    console.log(`- P1 total score: ${game.players[0].calculateTotalScore()}`);
    console.log();
    // Try to stay if player busted
    if (game.players[0].isBusted && game.mustStay) {
        console.log("Player busted. Attempting to use playerStays()...");
        await game.playerStays();
        console.log("✓ playerStays() executed successfully\n");
    }
    // Check if it's now AI's turn
    console.log("=== CHECKING AI TURN ===");
    console.log(`- Current player: ${game.players[game.currentPlayerIndex].name}`);
    console.log(`- Current player index: ${game.currentPlayerIndex}`);
    if (game.currentPlayerIndex === 1) {
        console.log("✓ Turn switched to AI correctly\n");
        console.log("Executing AI turn...");
        await game.executeAITurn();
        console.log("✓ AI turn completed\n");
    }
    else {
        console.log("❌ Turn did NOT switch to AI!\n");
    }
    // Final state
    console.log("=== FINAL STATE ===");
    console.log(`- Game over: ${game.gameOver}`);
    console.log(`- Round number: ${game.roundNumber}`);
    console.log(`- Machine position: ${game.machinePosition}`);
    console.log(`- P1 stayed: ${game.player1Stayed}`);
    console.log(`- P2 stayed: ${game.player2Stayed}`);
    console.log();
    console.log("=== TEST COMPLETE ===");
    process.exit(0);
}
runTest().catch(err => {
    console.error("Error during test:", err);
    process.exit(1);
});
