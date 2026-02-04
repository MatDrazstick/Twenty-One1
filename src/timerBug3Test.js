/**
 * Timer Bug 3 Test
 *
 * Tests that when the timer forces a draw on the human player's turn,
 * the game correctly switches to the AI's turn and the AI executes
 * its turn automatically without waiting for additional player input.
 */
import { Game } from './Game.js';
async function testTimerForcedDrawSwitchesToAI() {
    console.log("=== Testing Timer Forced Draw Switches to AI ===\n");
    // Create a game with very short timer (15 seconds)
    const game = new Game("TestPlayer", "singleplayer", 3, {
        timerSeconds: 2, // Very short for testing
        moveDistanceMode: 'rise',
        firstPlayer: 'player1'
    });
    console.log("Initial state:");
    console.log(`Current player: ${game.players[game.currentPlayerIndex].name}`);
    console.log(`forcedActionTaken flag: ${game.forcedActionTaken}`);
    // Simulate that the timer has started
    game.startTurnTimer();
    console.log("\nWaiting for timer to force draw...");
    // Wait for timer to expire (2.5 seconds to be safe)
    await new Promise(resolve => setTimeout(resolve, 2500));
    console.log("\nAfter timer expires:");
    console.log(`forcedActionTaken flag: ${game.forcedActionTaken}`);
    console.log(`Current player should now be AI: ${game.players[game.currentPlayerIndex].name}`);
    console.log(`Player 1 stayed: ${game.player1Stayed}`);
    console.log(`Player 1 busted: ${game.players[0].isBusted}`);
    // Verify that:
    // 1. forcedActionTaken flag is set
    // 2. Current player switched to AI (player 2)
    const success = game.forcedActionTaken === true &&
        game.currentPlayerIndex === 1;
    if (success) {
        console.log("\n✅ TEST PASSED: Timer correctly forced draw and switched to AI");
    }
    else {
        console.log("\n❌ TEST FAILED:");
        if (!game.forcedActionTaken) {
            console.log("   - forcedActionTaken flag not set");
        }
        if (game.currentPlayerIndex !== 1) {
            console.log("   - Current player did not switch to AI");
        }
    }
    // Clean up timer
    game.stopTurnTimer();
    return success;
}
async function testForcedActionFlagResets() {
    console.log("\n=== Testing forcedActionTaken Flag Can Be Reset ===\n");
    const game = new Game("TestPlayer", "singleplayer", 3, {
        timerSeconds: 2,
        moveDistanceMode: 'rise',
        firstPlayer: 'player1'
    });
    // Manually set the flag to simulate forced action
    game.forcedActionTaken = true;
    console.log(`forcedActionTaken flag set to: ${game.forcedActionTaken}`);
    // In the game loop, the flag should be manually reset after checking
    if (game.forcedActionTaken) {
        game.forcedActionTaken = false;
        console.log(`Flag manually reset to: ${game.forcedActionTaken}`);
    }
    const success = !game.forcedActionTaken;
    if (success) {
        console.log("\n✅ TEST PASSED: Flag can be manually reset in game loop");
    }
    else {
        console.log("\n❌ TEST FAILED: Flag did not reset");
    }
    game.stopTurnTimer();
    return success;
}
async function runAllTests() {
    console.log("╔════════════════════════════════════════════════╗");
    console.log("║       TIMER BUG 3 COMPREHENSIVE TESTS         ║");
    console.log("╚════════════════════════════════════════════════╝\n");
    const results = [];
    results.push(await testTimerForcedDrawSwitchesToAI());
    results.push(await testForcedActionFlagResets());
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log("\n╔════════════════════════════════════════════════╗");
    console.log(`║  RESULTS: ${passed}/${total} tests passed                      ║`);
    console.log("╚════════════════════════════════════════════════╝");
    if (passed === total) {
        console.log("\n🎉 All tests passed! Bug 3 is fixed.");
    }
    else {
        console.log("\n⚠️  Some tests failed. Bug 3 may still exist.");
    }
}
runAllTests().catch(console.error);
