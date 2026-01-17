import { AIPlayer } from './AIPlayer.js';

console.log("=== AI Strategy Decision Testing ===\n");
console.log("This test shows how different AI levels make decisions in various scenarios.\n");

// Test scenarios
interface Scenario {
  name: string;
  aiVisibleScore: number;
  opponentVisibleScore: number;
  deckCardsRemaining: number;
}

const scenarios: Scenario[] = [
  {
    name: "Low Score (AI: 8, Opponent: 10)",
    aiVisibleScore: 8,
    opponentVisibleScore: 10,
    deckCardsRemaining: 7
  },
  {
    name: "Medium Score (AI: 14, Opponent: 12)",
    aiVisibleScore: 14,
    opponentVisibleScore: 12,
    deckCardsRemaining: 7
  },
  {
    name: "High Score (AI: 16, Opponent: 15)",
    aiVisibleScore: 16,
    opponentVisibleScore: 15,
    deckCardsRemaining: 7
  },
  {
    name: "Behind (AI: 12, Opponent: 18)",
    aiVisibleScore: 12,
    opponentVisibleScore: 18,
    deckCardsRemaining: 7
  },
  {
    name: "Ahead (AI: 18, Opponent: 14)",
    aiVisibleScore: 18,
    opponentVisibleScore: 14,
    deckCardsRemaining: 7
  }
];

console.log("Legend: ✓ = Hit, ✗ = Stay\n");
console.log("=" .repeat(70));

// Print header
console.log("Scenario".padEnd(35) + " | L1 | L2 | L3 | L4 | L5 |");
console.log("-".repeat(70));

// Test each scenario with all AI levels
for (const scenario of scenarios) {
  let row = scenario.name.padEnd(35) + " |";
  
  for (let level = 1; level <= 5; level++) {
    const ai = new AIPlayer(level as 1 | 2 | 3 | 4 | 5);
    
    // Manually set the AI's visible score by adding cards
    // This is a bit hacky for testing purposes
    let score = 0;
    while (score < scenario.aiVisibleScore) {
      const cardValue = Math.min(scenario.aiVisibleScore - score, 11);
      ai.hand.push({ values: cardValue, faceup: true, flip: () => {}, toInteger: () => cardValue, toString: () => `[${cardValue}]` } as any);
      score += cardValue;
    }
    
    const decision = ai.shouldHit(scenario.opponentVisibleScore, scenario.deckCardsRemaining);
    row += ` ${decision ? '✓' : '✗'} |`;
  }
  
  console.log(row);
}

console.log("=" .repeat(70));

console.log("\n\nKey Observations:");
console.log("1. Level 1 (Random) - Decisions vary randomly");
console.log("2. Level 2 (Basic) - Always stays at 17+, hits below");
console.log("3. Level 3 (Conservative) - Stays at 15+, more cautious");
console.log("4. Level 4 (Smart) - Considers opponent's score");
console.log("5. Level 5 (Advanced) - Uses complex risk calculations");

console.log("\n=== Test Complete ===");
