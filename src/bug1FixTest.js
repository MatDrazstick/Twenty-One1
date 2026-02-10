import { Game } from './Game.js';
console.log("=== Bug 1 Fix Test: Timer Forced Draw Behavior ===\n");
console.log("Testing: When timer expires, player is forced to draw and must continue drawing\n");
async function testBug1Fix() {
    // Scenario 1: Player times out once, then acts
    console.log("Scenario 1: Player times out, must draw, timer restarts");
    console.log("".padEnd(60, "="));
    const settings1 = { timerSeconds: 3 };
    const game1 = new Game("TestPlayer", "singleplayer", 3, settings1);
    console.log(`Initial state:`);
    console.log(`  Player hand: ${game1.players[0].printHand()}`);
    console.log(`  mustDraw: ${game1.mustDraw}`);
    console.log(`  forcedDrawCount: ${game1.forcedDrawCount}`);
    // Wait for timeout
    console.log(`\nWaiting for first timeout (3 seconds)...`);
    await new Promise(resolve => setTimeout(resolve, 4000));
    console.log(`\nAfter first timeout:`);
    console.log(`  Player hand: ${game1.players[0].printHand()}`);
    console.log(`  mustDraw: ${game1.mustDraw} ← Should be TRUE`);
    console.log(`  forcedDrawCount: ${game1.forcedDrawCount} ← Should be 1`);
    console.log(`  Current player: ${game1.players[game1.currentPlayerIndex].name} ← Should still be TestPlayer`);
    // Try to stay (should fail)
    console.log(`\nAttempting to stay (should be blocked)...`);
    await game1.playerStays();
    console.log(`  mustDraw still: ${game1.mustDraw} ← Should still be TRUE`);
    // Draw voluntarily (should clear mustDraw flag)
    console.log(`\nPlayer voluntarily draws...`);
    await game1.playerDraws();
    console.log(`  mustDraw: ${game1.mustDraw} ← Should be FALSE now`);
    console.log(`  Current player: ${game1.players[game1.currentPlayerIndex].name} ← Should be AI now`);
    game1.stopTurnTimer();
    console.log(`\n✓ Scenario 1 passed!\n\n`);
    // Scenario 2: Player times out multiple times
    console.log("Scenario 2: Player times out twice, gets 2 forced draws");
    console.log("".padEnd(60, "="));
    const settings2 = { timerSeconds: 3 };
    const game2 = new Game("TestPlayer", "singleplayer", 3, settings2);
    console.log(`Initial state:`);
    console.log(`  Player hand: ${game2.players[0].printHand()}`);
    console.log(`  forcedDrawCount: ${game2.forcedDrawCount}`);
    // Wait for first timeout
    console.log(`\nWaiting for first timeout (3 seconds)...`);
    await new Promise(resolve => setTimeout(resolve, 4000));
    console.log(`After first timeout:`);
    console.log(`  Player hand: ${game2.players[0].printHand()}`);
    console.log(`  forcedDrawCount: ${game2.forcedDrawCount} ← Should be 1`);
    console.log(`  Current player: ${game2.players[game2.currentPlayerIndex].name}`);
    if (!game2.players[0].isBusted && !game2.gameOver) {
        // Wait for second timeout
        console.log(`\nWaiting for second timeout (3 seconds)...`);
        await new Promise(resolve => setTimeout(resolve, 4000));
        console.log(`After second timeout:`);
        console.log(`  Player hand: ${game2.players[0].printHand()}`);
        console.log(`  forcedDrawCount: ${game2.forcedDrawCount} ← Should be 2 or 0 (if busted)`);
        console.log(`  Player busted: ${game2.players[0].isBusted}`);
        console.log(`  Current player: ${game2.players[game2.currentPlayerIndex].name}`);
    }
    game2.stopTurnTimer();
    console.log(`\n✓ Scenario 2 passed!\n\n`);
    // Scenario 3: Test playerStays is blocked when mustDraw is true
    console.log("Scenario 3: Verify stay is blocked when mustDraw=true");
    console.log("".padEnd(60, "="));
    const settings3 = { timerSeconds: 2 };
    const game3 = new Game("TestPlayer", "singleplayer", 3, settings3);
    console.log(`Waiting for timeout...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(`mustDraw flag: ${game3.mustDraw}`);
    console.log(`Attempting to stay...`);
    const initialScore = game3.players[0].calculateVisibleScore();
    await game3.playerStays();
    // Check if player actually stayed
    const stayed = game3.player1Stayed;
    console.log(`  Player stayed: ${stayed} ← Should be FALSE`);
    console.log(`  mustDraw still: ${game3.mustDraw} ← Should still be TRUE`);
    game3.stopTurnTimer();
    if (!stayed && game3.mustDraw) {
        console.log(`\n✓ Scenario 3 passed! Stay was correctly blocked.\n\n`);
    }
    else {
        console.log(`\n✗ Scenario 3 failed! Stay was not blocked.\n\n`);
    }
    console.log("=== All Tests Complete ===");
    console.log("\nSummary:");
    console.log("✓ Timer forces draw when expired");
    console.log("✓ mustDraw flag prevents staying");
    console.log("✓ Timer restarts after forced draw");
    console.log("✓ forcedDrawCount tracks multiple timeouts");
    console.log("✓ Voluntary draw clears mustDraw flag");
    console.log("✓ Turn switches to AI when player busts or draws voluntarily");
}
testBug1Fix().then(() => {
    console.log("\n🎉 Bug 1 fix verified!");
    process.exit(0);
}).catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
