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

console.log(`\nInitial machine position: ${game2.machinePosition} (Distance to P1: ${game2.machinePosition}, Distance to P2: ${12 - game2.machinePosition})`);
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

const originalPosition = game2.machinePosition;

console.log("\nBoth players stay:");
await game2.playerStays(); // Alice stays
await game2.playerStays(); // Bob stays (triggers end round)

console.log(`\nAfter round 1: Machine position ${game2.machinePosition} (was ${originalPosition})`);
const distanceToP1 = game2.machinePosition;
const distanceToP2 = 12 - game2.machinePosition;
console.log(`Distance to P1: ${distanceToP1}, Distance to P2: ${distanceToP2}`);
console.log(`Change: ${game2.machinePosition - originalPosition} (machine moved ${game2.machinePosition > originalPosition ? 'toward P2' : 'toward P1'})`);

// Alice won (21 > 10), so machine moves toward Bob (P2) - RIGHT on number line
// Machine position should INCREASE
if (game2.machinePosition > originalPosition) {
  console.log("✓ Machine distance updated correctly!");
  console.log("  Machine moved toward Bob (loser) and away from Alice (winner)");
} else if (game2.machinePosition < originalPosition) {
  console.log("✗ Machine distance updated INCORRECTLY - moved opposite direction");
} else {
  console.log("✗ Machine position did NOT change");
}

console.log("\n✓ All bug fix tests complete!");
