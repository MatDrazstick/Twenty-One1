import { Game } from './Game.js';

console.log("=== Comprehensive AI Difficulty Demonstration ===\n");
console.log("This test demonstrates how each AI difficulty level behaves.\n");

// Helper function to play a quick game and show AI behavior
function demonstrateAILevel(level: number): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`AI DIFFICULTY LEVEL ${level}`);
  console.log(`${'='.repeat(60)}`);
  
  const difficultyNames = {
    1: "Random (Very Easy)",
    2: "Basic Strategy - Stays on 17+ (Easy)",
    3: "Conservative - Stays on 15+ (Medium)",
    4: "Smart - Considers Opponent (Hard)",
    5: "Advanced - Optimal Play (Very Hard)"
  };
  
  console.log(`Strategy: ${difficultyNames[level as keyof typeof difficultyNames]}\n`);
  
  const game = new Game("Player", 'singleplayer', level as 1 | 2 | 3 | 4 | 5);
  
  // Player makes one move to let AI play
  console.log("Player draws once and stays to observe AI behavior...\n");
  game.playerDraws();
  game.playerStays();
  
  console.log(`\n--- End of Level ${level} demonstration ---`);
}

// Demonstrate each difficulty level
for (let level = 1; level <= 5; level++) {
  demonstrateAILevel(level);
}

console.log("\n\n" + "=".repeat(60));
console.log("SUMMARY OF AI DIFFICULTY LEVELS");
console.log("=".repeat(60));
console.log(`
Level 1 - Random (Very Easy):
  • Makes random decisions (50% chance to hit or stay)
  • Unpredictable and often makes poor choices
  • Great for beginners who want an easy win

Level 2 - Basic Strategy (Easy):
  • Stays on 17 or higher (like Blackjack dealer rules)
  • Simple and predictable
  • Easy to beat with smart play

Level 3 - Conservative (Medium):
  • Stays on 15 or higher
  • Plays more cautiously than Level 2
  • Moderate challenge

Level 4 - Smart Strategy (Hard):
  • Considers opponent's visible score
  • Takes calculated risks based on game state
  • Plays more aggressively when losing
  • Challenging opponent

Level 5 - Advanced Strategy (Very Hard):
  • Uses risk calculation and probability
  • Considers cards remaining and bust probability
  • Adapts strategy based on opponent's strength
  • Makes optimal decisions
  • Most difficult to beat
`);

console.log("\n=== Test Complete ===");
