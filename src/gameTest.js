import { Game } from './Game.js';
console.log("=== Testing Twenty One Game - Bust Detection ===\n");
const game = new Game("Alice", "Bob");
// Test bust scenario - Alice draws until she busts
console.log("\n--- Turn 1: Alice draws (trying to force bust) ---");
game.playerDraws();
console.log("\n--- Turn 2: Alice draws again ---");
game.playerDraws();
console.log("\n--- Turn 3: Alice draws again ---");
game.playerDraws();
console.log("\n--- Turn 4: Alice draws again (should bust) ---");
game.playerDraws();
console.log("\n--- Turn 5: Alice tries to draw but is busted ---");
game.playerDraws();
console.log("\n--- Turn 6: Bob draws ---");
game.playerDraws();
console.log("\n--- Turn 7: Bob stays ---");
game.playerStays();
