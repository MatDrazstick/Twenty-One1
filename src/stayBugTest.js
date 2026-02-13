import { Game } from './Game.js';
import { Card } from './Card.js';
console.log('=== Testing Stay Behavior Fix ===\n');
// Create a multiplayer game with no timer
const game = new Game('Player 1', 'Player 2', { timerSeconds: 0 });
// Replace players' hands with controlled cards to avoid random busts
game.players[0].hand = [];
game.players[0].faceDownCard = new Card(2, false);
game.players[0].hand.push(game.players[0].faceDownCard);
game.players[0].addCard(new Card(3, true));
game.players[1].hand = [];
game.players[1].faceDownCard = new Card(4, false);
game.players[1].hand.push(game.players[1].faceDownCard);
game.players[1].addCard(new Card(5, true));
console.log('Expected behavior:');
console.log('Turn 1: Player 1 draws (will add a 2), Player 2 stays (skips turn)');
console.log('Turn 2: Player 1 stays (skips turn), Player 2 draws (should work - adds a 3!)');
console.log('Turn 3: Player 1 stays, Player 2 stays (both want to stop, round ends)\n');
console.log('=== Executing Test ===\n');
// Inject controlled cards into deck
game.deck.cards = [new Card(2), new Card(3), new Card(4)];
// Turn 1: Player 1 draws
console.log('--- Turn 1 (Player 1) ---');
const p1HandBefore = game.players[0].hand.length;
await game.playerDraws();
const p1HandAfter = game.players[0].hand.length;
console.log(`P1 hand size: ${p1HandBefore} -> ${p1HandAfter}`);
console.log(`p1Stayed=${game.player1Stayed}, p2Stayed=${game.player2Stayed}, lastWhoStayed=${game.lastPlayerIndexWhoStayed}`);
// Turn 1: Player 2 stays  
console.log('\n--- Turn 1 (Player 2) ---');
await game.playerStays();
console.log(`p1Stayed=${game.player1Stayed}, p2Stayed=${game.player2Stayed}, lastWhoStayed=${game.lastPlayerIndexWhoStayed}`);
if (game.roundNumber === 2) {
    console.log('\n✗ TEST FAILED: Round ended too early after P2 stayed!');
    process.exit(1);
}
// Turn 2: Player 1 stays
console.log('\n--- Turn 2 (Player 1) ---');
await game.playerStays();
console.log(`p1Stayed=${game.player1Stayed}, p2Stayed=${game.player2Stayed}, lastWhoStayed=${game.lastPlayerIndexWhoStayed}`);
if (game.roundNumber === 2) {
    console.log('\n✗ TEST FAILED: Round ended after both players stayed once! (P2 should get another turn)');
    process.exit(1);
}
// Turn 2: Player 2 draws (CRITICAL TEST)
console.log('\n--- Turn 2 (Player 2) - CRITICAL TEST ---');
const p2HandBefore = game.players[1].hand.length;
await game.playerDraws();
const p2HandAfter = game.players[1].hand.length;
console.log(`P2 hand size: ${p2HandBefore} -> ${p2HandAfter}`);
console.log(`p1Stayed=${game.player1Stayed}, p2Stayed=${game.player2Stayed}, lastWhoStayed=${game.lastPlayerIndexWhoStayed}`);
if (p2HandAfter <= p2HandBefore) {
    console.log('\n✗ TEST FAILED: Player 2 could not draw after staying!');
    process.exit(1);
}
console.log('✓ SUCCESS: Player 2 was able to draw after staying!');
// Turn 3: Player 1 stays
console.log('\n--- Turn 3 (Player 1) ---');
await game.playerStays();
console.log(`p1Stayed=${game.player1Stayed}, p2Stayed=${game.player2Stayed}, lastWhoStayed=${game.lastPlayerIndexWhoStayed}`);
if (game.roundNumber === 2) {
    console.log('\n✗ TEST FAILED: Round ended before P2 stayed!');
    process.exit(1);
}
// Turn 3: Player 2 stays (should end)
console.log('\n--- Turn 3 (Player 2) ---');
const roundBefore = game.roundNumber;
await game.playerStays();
const roundAfter = game.roundNumber;
console.log(`Round: ${roundBefore} -> ${roundAfter}`);
if (roundAfter === roundBefore + 1) {
    console.log('\n✓ SUCCESS: Round ended correctly after both players stayed!');
    console.log('\n=== ✓ ALL TESTS PASSED ===');
    console.log('Players can now stay on one turn and draw on the next!');
    process.exit(0);
}
else {
    console.log('\n✗ TEST FAILED: Round did not end when both players stayed consecutively.');
    process.exit(1);
}
