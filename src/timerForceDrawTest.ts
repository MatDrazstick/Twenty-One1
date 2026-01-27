import { Game, GameSettings } from './Game.js';

console.log("=== Timer Force Draw Test ===\n");

async function testTimerForceDraw() {
  // Create a game with a very short timer (15 seconds for testing)
  const settings: GameSettings = { timerSeconds: 15 };
  const game = new Game("TestPlayer", "singleplayer", 3, settings);
  
  console.log(`Game created with ${game.settings.timerSeconds} second timer`);
  console.log(`Current player: ${game.players[game.currentPlayerIndex].name}`);
  console.log(`Player hand: ${game.players[0].printHand()}`);
  console.log(`Player visible score: ${game.players[0].calculateVisibleScore()}`);
  
  // Wait for timer to show warning (at 10 seconds)
  console.log("\nWaiting 5 seconds to trigger 10-second warning...");
  await new Promise(resolve => setTimeout(resolve, 6000));
  
  console.log(`Time remaining: ${game.getTurnTimeRemaining()} seconds`);
  
  // Wait for timer to expire
  console.log("\nWaiting for timer to expire (9 more seconds)...");
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  console.log(`\nAfter timeout:`);
  console.log(`Player hand: ${game.players[0].printHand()}`);
  console.log(`Player visible score: ${game.players[0].calculateVisibleScore()}`);
  
  // Clean up
  game.stopTurnTimer();
  console.log("\n✓ Timer force draw test complete");
}

testTimerForceDraw().then(() => {
  console.log("\nTest finished successfully");
  process.exit(0);
}).catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
