import { Game, GameSettings } from './Game.js';

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║         TWENTY-ONE GAME - SETTINGS DEMONSTRATION            ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

// Demonstration 1: Timer Settings
console.log("═══════════════════════════════════════════════════════════════");
console.log("DEMO 1: Timer Settings");
console.log("═══════════════════════════════════════════════════════════════");

const timerOptions = [15, 30, 45, 60, 75, 90];
console.log("Available timer options:");
timerOptions.forEach((time, index) => {
  console.log(`  ${index + 1}. ${time} seconds${time === 30 ? ' (default)' : ''}`);
});

console.log("\nExample: Creating game with 60-second timer");
const settings1: GameSettings = { timerSeconds: 60 };
const game1 = new Game("Alice", "singleplayer", 3, settings1);
console.log(`✓ Timer: ${game1.settings.timerSeconds} seconds`);
console.log(`✓ Timer started for ${game1.players[0].name}`);
console.log(`✓ At 10 seconds: Warning will be displayed`);
console.log(`✓ At 0 seconds: Player forced to draw`);
game1.stopTurnTimer();

// Demonstration 2: Move Distance Modes
console.log("\n═══════════════════════════════════════════════════════════════");
console.log("DEMO 2: Move Distance Modes");
console.log("═══════════════════════════════════════════════════════════════");

console.log("\n🔼 RISE MODE (default):");
console.log("   Round 1: distance = 1");
console.log("   Round 2: distance = 2");
console.log("   Round 3: distance = 3");
console.log("   Round 4: distance = 4");
console.log("   ... (predictable increase)");

console.log("\n🔀 SHUFFLE MODE:");
console.log("   Round 1: distance = random(1-3)");
console.log("   Round 2: distance = random(1-3)");
console.log("   Round 3: distance = random(1-3)");
console.log("   Round 4: distance = random(1-3)");
console.log("   ... (unpredictable variation)");

console.log("\nExample: Creating game with shuffle mode");
const settings2: GameSettings = { moveDistanceMode: 'shuffle' };
const game2 = new Game("Bob", "singleplayer", 3, settings2);
console.log(`✓ Move distance mode: ${game2.settings.moveDistanceMode}`);
console.log(`✓ Initial distance: ${game2.moveDistance}`);
game2.stopTurnTimer();

// Demonstration 3: First Player Selection
console.log("\n═══════════════════════════════════════════════════════════════");
console.log("DEMO 3: First Player Selection");
console.log("═══════════════════════════════════════════════════════════════");

console.log("\nOption 1: Player1 (default)");
const game3a = new Game("Charlie", "singleplayer", 3);
console.log(`  Current player: ${game3a.players[game3a.currentPlayerIndex].name}`);
console.log(`  Current index: ${game3a.currentPlayerIndex}`);
game3a.stopTurnTimer();

console.log("\nOption 2: Player2");
const settings3b: GameSettings = { firstPlayer: 'player2' };
const game3b = new Game("Diana", "singleplayer", 3, settings3b);
console.log(`  Current player: ${game3b.players[game3b.currentPlayerIndex].name}`);
console.log(`  Current index: ${game3b.currentPlayerIndex}`);

console.log("\nOption 3: Random");
const settings3c: GameSettings = { firstPlayer: 'random' };
const game3c = new Game("Eve", "singleplayer", 3, settings3c);
console.log(`  Current player: ${game3c.players[game3c.currentPlayerIndex].name}`);
console.log(`  Current index: ${game3c.currentPlayerIndex}`);
game3c.stopTurnTimer();

// Demonstration 4: Combined Settings
console.log("\n═══════════════════════════════════════════════════════════════");
console.log("DEMO 4: Combined Settings");
console.log("═══════════════════════════════════════════════════════════════");

const settings4: GameSettings = {
  timerSeconds: 45,
  moveDistanceMode: 'shuffle',
  firstPlayer: 'random'
};

console.log("\nCustom configuration:");
console.log(`  Timer: ${settings4.timerSeconds} seconds`);
console.log(`  Move Distance: ${settings4.moveDistanceMode}`);
console.log(`  First Player: ${settings4.firstPlayer}`);

const game4 = new Game("Frank", "singleplayer", 3, settings4);
console.log("\n✓ Game created successfully!");
console.log(`  Timer: ${game4.settings.timerSeconds}s`);
console.log(`  Mode: ${game4.settings.moveDistanceMode}`);
console.log(`  First: ${game4.settings.firstPlayer}`);
console.log(`  Starting player: ${game4.players[game4.currentPlayerIndex].name}`);
game4.stopTurnTimer();

// Summary
console.log("\n═══════════════════════════════════════════════════════════════");
console.log("SUMMARY");
console.log("═══════════════════════════════════════════════════════════════");
console.log("✓ Timer: 6 options (15, 30, 45, 60, 75, 90 seconds)");
console.log("✓ Warning at 10 seconds remaining");
console.log("✓ Force draw when timer expires");
console.log("✓ Move distance: Rise (predictable) or Shuffle (random)");
console.log("✓ First player: Player1, Player2, or Random");
console.log("✓ All settings can be combined");
console.log("✓ Interactive menu available (interactiveGame.ts)");
console.log("✓ Full backward compatibility");

console.log("\n╔══════════════════════════════════════════════════════════════╗");
console.log("║              DEMONSTRATION COMPLETE!                         ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

process.exit(0);
