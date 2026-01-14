import { Card } from './Card.js';
import { Deck } from './Deck.js';
import { Player } from './Players.js';

console.log("=== Starting Tests ===\n");
// Task 1: Create a deck and shuffle it 3 times
console.log("Task 1: Shuffling Test");
console.log("----------------------");

const deck = new Deck();
console.log("Initial deck order (before shuffle):");
console.log(deck.printDeck());

// Shuffle 3 times and show results
for (let i = 1; i <= 3; i++) {
  deck.shuffle();
  console.log(`\nAfter shuffle #${i}:`);
  console.log(deck.printDeck());
}
console.log("\n" + "=".repeat(50) + "\n");