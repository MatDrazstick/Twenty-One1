import { Game } from './Game.js';
import { Card } from './Card.js';

console.log("=== FORCED BUST TIMER TEST ===");
console.log("Testing timer expiration that causes a bust\n");

// Create game with 15 second timer
const settings = {
  timerSeconds: 15,
  moveDistanceMode: 'rise' as const,
  firstPlayer: 'player1' as const
};

const game = new Game("TestPlayer", "singleplayer", 1, settings);

// Manipulate the deck to ensure next draw causes bust
// Player has hidden + visible cards, let's give them high cards
console.log("Setting up test scenario...");
console.log(`P1 starting hand: ${game.players[0].printHand()}`);
console.log(`P1 starting score: ${game.players[0].calculateTotalScore()}\n`);

// Remove all low cards from deck and add only high cards
game.deck.cards = [];
for (let i = 0; i < 10; i++) {
  game.deck.cards.push(new Card(11, true)); // Only 11s available
}

console.log("Deck manipulated: only cards with value 11 remaining");
console.log("This ensures forced draw will cause a bust\n");

// Function to wait
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log("=== INITIAL STATE ===");
  console.log(`- P1 total score: ${game.players[0].calculateTotalScore()}`);
  console.log(`- Next card will be: 11 (will cause bust if total > 10)`);
  console.log();

  console.log("Waiting for timer to expire (16 seconds)...\n");
  await delay(16000);

  console.log("\n=== AFTER TIMER EXPIRATION ===");
  console.log(`- Current player: ${game.players[game.currentPlayerIndex].name}`);
  console.log(`- Player 1 busted: ${game.players[0].isBusted}`);
  console.log(`- Player 1 stayed: ${game.player1Stayed}`);
  console.log(`- mustDraw: ${game.mustDraw}`);
  console.log(`- mustStay: ${game.mustStay}`);
  console.log(`- forcedActionTaken: ${game.forcedActionTaken}`);
  console.log(`- P1 total score: ${game.players[0].calculateTotalScore()}`);
  console.log();

  if (game.players[0].isBusted) {
    console.log("✓ Player busted as expected\n");
    
    if (game.mustStay) {
      console.log("✓ mustStay flag is set correctly\n");
    } else {
      console.log("❌ mustStay flag should be true but is false!\n");
    }
    
    if (!game.forcedActionTaken) {
      console.log("✓ forcedActionTaken flag cleared correctly\n");
    } else {
      console.log("❌ forcedActionTaken flag should be false but is true!\n");
      console.log("   This means player's 'stay' input will be ignored!\n");
    }
    
    console.log("Attempting to call playerStays()...");
    await game.playerStays();
    console.log("✓ playerStays() executed\n");
    
    console.log("=== AFTER PLAYER STAYS ===");
    console.log(`- Current player: ${game.players[game.currentPlayerIndex].name}`);
    console.log(`- Current index: ${game.currentPlayerIndex}`);
    console.log(`- Player 1 stayed: ${game.player1Stayed}`);
    console.log(`- mustStay: ${game.mustStay}`);
    
    if (game.currentPlayerIndex === 1) {
      console.log("\n✓ Turn correctly switched to AI\n");
    } else {
      console.log("\n❌ Turn did not switch to AI!\n");
    }
  } else {
    console.log("Player did not bust (score too low or forced draw didn't happen)");
    console.log(`P1 hand: ${game.players[0].printHand()}`);
  }

  console.log("=== TEST COMPLETE ===");
  process.exit(0);
}

runTest().catch(err => {
  console.error("Error during test:", err);
  process.exit(1);
});
