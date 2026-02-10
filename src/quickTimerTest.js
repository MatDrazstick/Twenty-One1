import { Game } from './Game.js';
console.log("=== Quick Timer Bug 1 Test ===\n");
async function testNewTimerBehavior() {
    // Create a game with a very short timer for testing
    const settings = { timerSeconds: 5 };
    const game = new Game("TestPlayer", "singleplayer", 3, settings);
    console.log(`Game created with ${game.settings.timerSeconds} second timer`);
    console.log(`Current player: ${game.players[game.currentPlayerIndex].name}`);
    console.log(`Player hand: ${game.players[0].printHand()}`);
    console.log(`Player visible score: ${game.players[0].calculateVisibleScore()}`);
    console.log(`mustDraw flag: ${game.mustDraw}`);
    console.log(`forcedDrawCount: ${game.forcedDrawCount}`);
    // Wait for first timer to expire
    console.log("\nWaiting for first timeout (5 seconds)...");
    await new Promise(resolve => setTimeout(resolve, 6000));
    console.log(`\nAfter first timeout:`);
    console.log(`Player hand: ${game.players[0].printHand()}`);
    console.log(`Player visible score: ${game.players[0].calculateVisibleScore()}`);
    console.log(`mustDraw flag: ${game.mustDraw}`);
    console.log(`forcedDrawCount: ${game.forcedDrawCount}`);
    console.log(`Current player: ${game.players[game.currentPlayerIndex].name}`);
    console.log(`Player busted: ${game.players[0].isBusted}`);
    // Wait for second timer to expire
    if (!game.players[0].isBusted && !game.gameOver) {
        console.log("\nWaiting for second timeout (5 seconds)...");
        await new Promise(resolve => setTimeout(resolve, 6000));
        console.log(`\nAfter second timeout:`);
        console.log(`Player hand: ${game.players[0].printHand()}`);
        console.log(`Player visible score: ${game.players[0].calculateVisibleScore()}`);
        console.log(`mustDraw flag: ${game.mustDraw}`);
        console.log(`forcedDrawCount: ${game.forcedDrawCount}`);
        console.log(`Current player: ${game.players[game.currentPlayerIndex].name}`);
        console.log(`Player busted: ${game.players[0].isBusted}`);
    }
    // Clean up
    game.stopTurnTimer();
    console.log("\n✓ Test complete");
}
testNewTimerBehavior().then(() => {
    console.log("\nTest finished");
    process.exit(0);
}).catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
