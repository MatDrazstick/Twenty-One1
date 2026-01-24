import { Game } from './Game.js';
import { Card } from './Card.js';

console.log("=== Testing Bug Fixes ===\n");

// Test Bug 1: Player shouldn't be able to draw after staying
console.log("--- Test Bug 1: Can't draw after staying ---");
const game1 = new Game("Player1", "Player2");

console.log("\nPlayer1 draws:");
await game1.playerDraws(); // Player1 draws, switches to Player2

console.log("\nPlayer2 stays:");
await game1.playerStays(); // Player2 stays, switches back to Player1

console.log("\nPlayer1 draws again:");
await game1.playerDraws(); // Player1 draws, switches to Player2

console.log("\nPlayer2 tries to draw after staying (should be prevented):");
await game1.playerDraws(); // Should be prevented since Player2 already stayed

console.log("\n✓ Bug 1 test complete\n");

// Test Bug 2: Machine distance should update correctly
console.log("--- Test Bug 2: Machine distance updates ---");
const game2 = new Game("Alice", "Bob");

console.log(`\nInitial distances: P1=${game2.machineDistanceP1}, P2=${game2.machineDistanceP2}`);
console.log("Expected: Both start at 7\n");

// Draw cards to control the outcome
// We want Alice to get 21 and Bob to get less
console.log("Setting up controlled scenario...");

// Give Alice a 21
game2.players[0].hand = []; // Clear initial hand
game2.players[0].setFaceDownCard(new Card(10, false));
game2.players[0].addCard(new Card(11, true));

// Give Bob a lower score
game2.players[1].hand = []; // Clear initial hand  
game2.players[1].setFaceDownCard(new Card(5, false));
game2.players[1].addCard(new Card(5, true));

console.log(`Alice: ${game2.players[0].calculateTotalScore()}`);
console.log(`Bob: ${game2.players[1].calculateTotalScore()}`);

const originalP1Distance = game2.machineDistanceP1;
const originalP2Distance = game2.machineDistanceP2;

console.log("\nBoth players stay:");
await game2.playerStays(); // Alice stays
await game2.playerStays(); // Bob stays (triggers end round)

console.log(`\nAfter round 1: P1=${game2.machineDistanceP1}, P2=${game2.machineDistanceP2}`);
console.log(`Change: P1 went from ${originalP1Distance} to ${game2.machineDistanceP1} (diff: ${game2.machineDistanceP1 - originalP1Distance})`);
console.log(`Change: P2 went from ${originalP2Distance} to ${game2.machineDistanceP2} (diff: ${game2.machineDistanceP2 - originalP2Distance})`);

// Alice won (21 > 10), so machine moves toward Bob and away from Alice
// P1 (Alice) should INCREASE, P2 (Bob) should DECREASE
if (game2.machineDistanceP1 > originalP1Distance && game2.machineDistanceP2 < originalP2Distance) {
  console.log("✓ Machine distance updated correctly!");
  console.log("  Machine moved AWAY from Alice (winner) and TOWARD Bob (loser)");
} else if (game2.machineDistanceP1 < originalP1Distance && game2.machineDistanceP2 > originalP2Distance) {
  console.log("✗ Machine distance updated INCORRECTLY - moved opposite direction");
} else {
  console.log("✗ Machine distance NOT updated correctly");
}

console.log("\n✓ All bug fix tests complete!");
