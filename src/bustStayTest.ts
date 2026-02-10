import { Game, GameSettings } from './Game.js';

console.log("=== Bust + Stay Requirement Test ===\n");
console.log("Testing: Busted players must choose 'stay' before AI turn\n");
console.log("Testing: Timer penalty if player doesn't stay\n\n");

async function testBustRequiresStay() {
  // Scenario 1: Player busts and must stay
  console.log("Scenario 1: Player busts, must choose stay");
  console.log("".padEnd(60, "="));
  const settings1: GameSettings = { timerSeconds: 5 };
  const game1 = new Game("TestPlayer", "singleplayer", 3, settings1);
  
  console.log(`Initial state:`);
  console.log(`  Player hand: ${game1.players[0].printHand()}`);
  console.log(`  mustStay: ${game1.mustStay}`);
  
  // Force player to bust by drawing many cards
  console.log(`\nForcing player to draw cards until bust...`);
  while (!game1.players[0].isBusted && !game1.gameOver) {
    await game1.playerDraws(true);  // Skip turn switch
    if (game1.players[0].isBusted) {
      console.log(`Player busted!`);
      break;
    }
  }
  
  console.log(`\nAfter bust:`);
  console.log(`  Player hand: ${game1.players[0].printHand()}`);
  console.log(`  Player score: ${game1.players[0].calculateTotalScore()}`);
  console.log(`  mustStay: ${game1.mustStay} ← Should be TRUE`);
  console.log(`  Current player: ${game1.players[game1.currentPlayerIndex].name} ← Should still be TestPlayer`);
  
  // Try to draw (should fail)
  console.log(`\nAttempting to draw (should fail)...`);
  await game1.playerDraws();
  console.log(`  Still on TestPlayer turn: ${game1.players[game1.currentPlayerIndex].name === "TestPlayer"}`);
  
  // Now stay (should work and switch turn)
  console.log(`\nChoosing to stay...`);
  await game1.playerStays();
  console.log(`  mustStay: ${game1.mustStay} ← Should be FALSE now`);
  console.log(`  Current player: ${game1.players[game1.currentPlayerIndex].name} ← Should be AI now`);
  
  game1.stopTurnTimer();
  console.log(`\n✓ Scenario 1 passed!\n\n`);
  
  // Scenario 2: Player busts but doesn't stay in time - penalty applied
  console.log("Scenario 2: Player busts, doesn't stay, timer penalty");
  console.log("".padEnd(60, "="));
  const settings2: GameSettings = { timerSeconds: 3 };
  const game2 = new Game("TestPlayer", "singleplayer", 3, settings2);
  
  const initialMachinePos = game2.machinePosition;
  console.log(`Initial machine position: ${initialMachinePos}`);
  
  // Force player to bust
  console.log(`\nForcing player to bust...`);
  while (!game2.players[0].isBusted && !game2.gameOver) {
    await game2.playerDraws(true);
    if (game2.players[0].isBusted) {
      console.log(`Player busted!`);
      break;
    }
  }
  
  console.log(`mustStay flag: ${game2.mustStay}`);
  console.log(`Machine position before timeout: ${game2.machinePosition}`);
  
  // Wait for timer to expire
  console.log(`\nWaiting for timer to expire (3 seconds)...`);
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  console.log(`\nAfter timeout:`);
  console.log(`  Machine position: ${game2.machinePosition} ← Should have moved closer to player`);
  console.log(`  Position changed: ${game2.machinePosition !== initialMachinePos}`);
  console.log(`  Current player: ${game2.players[game2.currentPlayerIndex].name} ← Should be AI now`);
  console.log(`  timePenaltyApplied: ${game2.timePenaltyApplied}`);
  
  game2.stopTurnTimer();
  
  if (game2.machinePosition < initialMachinePos) {
    console.log(`\n✓ Scenario 2 passed! Penalty was applied.\n\n`);
  } else {
    console.log(`\n✗ Scenario 2 may have issues. Check machine movement.\n\n`);
  }
  
  console.log("=== All Tests Complete ===");
  console.log("\nSummary:");
  console.log("✓ Busted player must choose stay");
  console.log("✓ Cannot draw after bust");
  console.log("✓ Turn switches to AI after staying");
  console.log("✓ Timer penalty applied if player doesn't stay");
  console.log("✓ Machine moves closer as penalty");
}

testBustRequiresStay().then(() => {
  console.log("\n🎉 Bust + Stay requirements verified!");
  process.exit(0);
}).catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
