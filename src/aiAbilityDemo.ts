import { Game } from './Game.js';
import { AIPlayer } from './AIPlayer.js';

console.log("=== AI Ability Usage Demonstration ===\n");

// Test AI at each difficulty level
for (let level = 1; level <= 5; level++) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing AI Level ${level}`);
  console.log('='.repeat(60));
  
  const game = new Game("Human Player", "singleplayer", level as any);
  const aiPlayer = game.players[1];
  const humanPlayer = game.players[0];
  
  console.log(`\nInitial State:`);
  console.log(`Human: ${humanPlayer.printHand()} (Score: ${humanPlayer.calculateTotalScore()})`);
  console.log(`AI: ${aiPlayer.printHand()} (Score: ${aiPlayer.calculateTotalScore()})`);
  console.log(`\nAI Abilities:`);
  console.log(aiPlayer.printAbilityHand());
  
  if (aiPlayer instanceof AIPlayer) {
    console.log(`\nAI Decision-Making:`);
    
    // Check if AI wants to use an ability
    const abilityChoice = aiPlayer.chooseAbility(game, humanPlayer);
    
    if (abilityChoice !== -1) {
      console.log(`✓ AI chose to use ability: ${aiPlayer.abilityHand[abilityChoice].name}`);
      console.log(`Description: ${aiPlayer.abilityHand[abilityChoice].description}`);
      
      // Use the ability
      const success = aiPlayer.useAbility(abilityChoice, game, humanPlayer);
      console.log(`Ability activation: ${success ? 'SUCCESS' : 'FAILED'}`);
      
      console.log(`\nAfter Ability:`);
      console.log(`Human: ${humanPlayer.printHand()} (Score: ${humanPlayer.calculateTotalScore()})`);
      console.log(`AI: ${aiPlayer.printHand()} (Score: ${aiPlayer.calculateTotalScore()})`);
      console.log(`Target Number: ${game.targetNumber}`);
      console.log(`Bet Modifier: ${game.betModifier}`);
    } else {
      console.log(`✓ AI chose not to use any ability (strategic decision)`);
    }
    
    // Test AI's card drawing decision
    console.log(`\nCard Drawing Decision:`);
    const shouldHit = aiPlayer.shouldHit(humanPlayer.calculateVisibleScore(), game.deck.cardsRemaining());
    console.log(`AI decides to: ${shouldHit ? 'DRAW a card' : 'STAY'}`);
    console.log(`Reasoning: Score=${aiPlayer.calculateVisibleScore()}, Opponent=${humanPlayer.calculateVisibleScore()}, Target=${game.targetNumber}`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log("Demonstration Complete!");
console.log('='.repeat(60));

// Demonstrate a full round with ability usage
console.log(`\n\n${'='.repeat(60)}`);
console.log("Full Round Simulation with Abilities");
console.log('='.repeat(60));

const fullGame = new Game("Player 1", "singleplayer", 5);
const player1 = fullGame.players[0];
const ai = fullGame.players[1];

console.log(`\nRound Start:`);
console.log(`Player 1: ${player1.printHand()} (Visible: ${player1.calculateVisibleScore()})`);
console.log(`AI: ${ai.printHand()} (Visible: ${ai.calculateVisibleScore()})`);
console.log(`\nPlayer 1 Abilities:`);
console.log(player1.printAbilityHand());
console.log(`\nAI Abilities:`);
console.log(ai.printAbilityHand());

// Simulate player using an ability
if (player1.abilityHand.length > 0) {
  console.log(`\nPlayer 1 uses ability: ${player1.abilityHand[0].name}`);
  player1.useAbility(0, fullGame, ai);
}

// Simulate AI response
if (ai instanceof AIPlayer && ai.abilityHand.length > 0) {
  const aiChoice = ai.chooseAbility(fullGame, player1);
  if (aiChoice !== -1) {
    console.log(`\nAI responds with ability: ${ai.abilityHand[aiChoice].name}`);
    ai.useAbility(aiChoice, fullGame, player1);
  }
}

console.log(`\nFinal State:`);
console.log(`Player 1: ${player1.printHand()} (Score: ${player1.calculateTotalScore()})`);
console.log(`AI: ${ai.printHand()} (Score: ${ai.calculateTotalScore()})`);
console.log(`Target: ${fullGame.targetNumber}, Bet Modifier: ${fullGame.betModifier}`);
console.log(`Machine Position: ${fullGame.machinePosition} (Distance to P1: ${fullGame.machinePosition}, Distance to P2: ${12 - fullGame.machinePosition})`);

console.log("\n✓ Demonstration Complete!");
