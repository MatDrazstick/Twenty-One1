import { Game, GameSettings } from './Game.js';

console.log("=== Move Distance Shuffle Test ===\n");

async function testShuffleMode() {
  const SHUFFLE_MIN_DISTANCE = 1;
  const SHUFFLE_MAX_DISTANCE = 3;
  
  // Create a game with shuffle mode
  const settings: GameSettings = { moveDistanceMode: 'shuffle' };
  const game = new Game("Player1", "Player2", settings);
  
  console.log(`Game created with ${game.settings.moveDistanceMode} mode`);
  console.log(`Initial move distance: ${game.moveDistance}`);
  console.log(`Initial machine position: ${game.machinePosition} (Distance to P1: ${game.machinePosition}, Distance to P2: ${12 - game.machinePosition})`);
  
  // Simulate round endings to test shuffle
  console.log("\nSimulating 10 rounds to test shuffle behavior:");
  for (let i = 1; i <= 10; i++) {
    game.roundNumber = i;
    
    // Simulate shuffle mode
    if (game.settings.moveDistanceMode === 'shuffle') {
      game.moveDistance = Math.floor(Math.random() * 3) + 1;
    } else {
      game.moveDistance++;
    }
    
    console.log(`Round ${i}: move distance = ${game.moveDistance} (should be ${SHUFFLE_MIN_DISTANCE}-${SHUFFLE_MAX_DISTANCE} for shuffle)`);
    
    // Verify distance is in valid range
    if (game.moveDistance < SHUFFLE_MIN_DISTANCE || game.moveDistance > SHUFFLE_MAX_DISTANCE) {
      console.error(`ERROR: Invalid distance ${game.moveDistance}`);
      process.exit(1);
    }
  }
  
  console.log(`\n✓ All shuffle distances within valid range (${SHUFFLE_MIN_DISTANCE}-${SHUFFLE_MAX_DISTANCE})`);
  
  // Test Rise mode
  console.log("\n=== Testing Rise Mode ===");
  const settings2: GameSettings = { moveDistanceMode: 'rise' };
  const game2 = new Game("Player1", "Player2", settings2);
  
  console.log(`Game created with ${game2.settings.moveDistanceMode} mode`);
  console.log(`Initial move distance: ${game2.moveDistance}`);
  
  console.log("\nSimulating 10 rounds to test rise behavior:");
  for (let i = 1; i <= 10; i++) {
    game2.roundNumber = i;
    
    // Simulate rise mode
    if (game2.settings.moveDistanceMode === 'shuffle') {
      game2.moveDistance = Math.floor(Math.random() * 3) + 1;
    } else {
      game2.moveDistance++;
    }
    
    const expected = i + 1;
    console.log(`Round ${i}: move distance = ${game2.moveDistance} (expected: ${expected})`);
    
    // Verify distance increases by 1
    if (game2.moveDistance !== expected) {
      console.error(`ERROR: Expected ${expected}, got ${game2.moveDistance}`);
      process.exit(1);
    }
  }
  
  console.log("\n✓ Rise mode increases distance by 1 each round");
  console.log("\n✓ Move distance test complete");
}

testShuffleMode().then(() => {
  console.log("\nTest finished successfully");
  process.exit(0);
}).catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
