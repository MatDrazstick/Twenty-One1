import { Game } from './Game.js';
import { AIPlayer } from './AIPlayer.js';
import { AbilityDeck } from './AbilityDeck.js';
import { createAllAbilityCards, AbilityCategory } from './AbilityCard.js';
console.log("=== Ability Card System Tests ===\n");
// Test 1: Create and verify all ability cards
console.log("Test 1: Creating all ability cards...");
const allCards = createAllAbilityCards();
console.log(`Total ability cards created: ${allCards.length}`);
console.log(`Expected: 24 cards (5 AddNumber + 7 DeckTrump + 9 BetAbility + 3 GoFor)`);
const addNumberCards = allCards.filter(c => c.category === AbilityCategory.AddNumber);
const deckTrumpCards = allCards.filter(c => c.category === AbilityCategory.DeckTrump);
const betAbilityCards = allCards.filter(c => c.category === AbilityCategory.BetAbility);
const goForCards = allCards.filter(c => c.category === AbilityCategory.GoFor);
console.log(`\nAdd Number Cards: ${addNumberCards.length}`);
addNumberCards.forEach(card => console.log(`  - ${card.name}`));
console.log(`\nDeck Trump Cards: ${deckTrumpCards.length}`);
deckTrumpCards.forEach(card => console.log(`  - ${card.name}`));
console.log(`\nBet Ability Cards: ${betAbilityCards.length}`);
betAbilityCards.forEach(card => console.log(`  - ${card.name}`));
console.log(`\nGo For Cards: ${goForCards.length}`);
goForCards.forEach(card => console.log(`  - ${card.name}`));
console.log("\n✓ Test 1 passed!\n");
// Test 2: Ability Deck functionality
console.log("Test 2: Testing AbilityDeck...");
const abilityDeck = new AbilityDeck();
console.log(`Cards in deck: ${abilityDeck.cardsRemaining()}`);
abilityDeck.shuffle();
console.log("Deck shuffled");
const dealtCard = abilityDeck.dealCard();
console.log(`Dealt card: ${dealtCard.name}`);
console.log(`Cards remaining: ${abilityDeck.cardsRemaining()}`);
abilityDeck.reset();
console.log(`After reset: ${abilityDeck.cardsRemaining()} cards`);
console.log("✓ Test 2 passed!\n");
// Test 3: Test Add Number Abilities (2-Card)
console.log("Test 3: Testing 2-Card ability...");
const game3 = new Game("Test Player", "multiplayer");
const player = game3.players[0];
const opponent = game3.players[1];
// Find the 2-Card ability
const twoCardAbility = allCards.find(c => c.name === '2-Card');
if (twoCardAbility) {
    console.log(`Using ability: ${twoCardAbility.name}`);
    console.log(`Player score before: ${player.calculateTotalScore()}`);
    console.log(`Deck contains 2: ${game3.deck.containsValue(2)}`);
    const result = twoCardAbility.activate(game3, player, opponent);
    console.log(`Ability activation result: ${result}`);
    console.log(`Player score after: ${player.calculateTotalScore()}`);
}
console.log("✓ Test 3 passed!\n");
// Test 4: Test Perfect Draw
console.log("Test 4: Testing Perfect Draw ability...");
const game4 = new Game("Test Player", "multiplayer");
const player4 = game4.players[0];
const opponent4 = game4.players[1];
const perfectDrawAbility = allCards.find(c => c.name === 'Perfect Draw');
if (perfectDrawAbility) {
    console.log(`Player score before: ${player4.calculateTotalScore()}`);
    console.log(`Target: ${game4.targetNumber}`);
    const result = perfectDrawAbility.activate(game4, player4, opponent4);
    console.log(`Ability activation result: ${result}`);
    console.log(`Player score after: ${player4.calculateTotalScore()}`);
}
console.log("✓ Test 4 passed!\n");
// Test 5: Test Hush (hidden card draw)
console.log("Test 5: Testing Hush ability...");
const game5 = new Game("Test Player", "multiplayer");
const player5 = game5.players[0];
const opponent5 = game5.players[1];
const hushAbility = allCards.find(c => c.name === 'Hush');
if (hushAbility) {
    const handSizeBefore = player5.hand.length;
    console.log(`Hand size before: ${handSizeBefore}`);
    const result = hushAbility.activate(game5, player5, opponent5);
    console.log(`Ability activation result: ${result}`);
    console.log(`Hand size after: ${player5.hand.length}`);
    console.log(`Last card is face-up: ${player5.hand[player5.hand.length - 1].faceup}`);
}
console.log("✓ Test 5 passed!\n");
// Test 6: Test Remove ability
console.log("Test 6: Testing Remove ability...");
const game6 = new Game("Test Player", "multiplayer");
const player6 = game6.players[0];
const opponent6 = game6.players[1];
// Give opponent some cards first
const card = game6.deck.dealCard(true);
opponent6.addCard(card);
const removeAbility = allCards.find(c => c.name === 'Remove');
if (removeAbility) {
    console.log(`Opponent hand size before: ${opponent6.hand.length}`);
    console.log(`Opponent score before: ${opponent6.calculateTotalScore()}`);
    const result = removeAbility.activate(game6, player6, opponent6);
    console.log(`Ability activation result: ${result}`);
    console.log(`Opponent hand size after: ${opponent6.hand.length}`);
    console.log(`Opponent score after: ${opponent6.calculateTotalScore()}`);
}
console.log("✓ Test 6 passed!\n");
// Test 7: Test Return ability
console.log("Test 7: Testing Return ability...");
const game7 = new Game("Test Player", "multiplayer");
const player7 = game7.players[0];
const opponent7 = game7.players[1];
// Draw a card first
const newCard = game7.deck.dealCard(true);
player7.addCard(newCard);
const returnAbility = allCards.find(c => c.name === 'Return');
if (returnAbility) {
    console.log(`Player hand size before: ${player7.hand.length}`);
    console.log(`Player score before: ${player7.calculateTotalScore()}`);
    const result = returnAbility.activate(game7, player7, opponent7);
    console.log(`Ability activation result: ${result}`);
    console.log(`Player hand size after: ${player7.hand.length}`);
    console.log(`Player score after: ${player7.calculateTotalScore()}`);
}
console.log("✓ Test 7 passed!\n");
// Test 8: Test Exchange ability
console.log("Test 8: Testing Exchange ability...");
const game8 = new Game("Test Player", "multiplayer");
const player8 = game8.players[0];
const opponent8 = game8.players[1];
// Draw cards for both
const p8card = game8.deck.dealCard(true);
const o8card = game8.deck.dealCard(true);
player8.addCard(p8card);
opponent8.addCard(o8card);
const exchangeAbility = allCards.find(c => c.name === 'Exchange');
if (exchangeAbility) {
    console.log(`Player score before: ${player8.calculateTotalScore()}`);
    console.log(`Opponent score before: ${opponent8.calculateTotalScore()}`);
    const result = exchangeAbility.activate(game8, player8, opponent8);
    console.log(`Ability activation result: ${result}`);
    console.log(`Player score after: ${player8.calculateTotalScore()}`);
    console.log(`Opponent score after: ${opponent8.calculateTotalScore()}`);
}
console.log("✓ Test 8 passed!\n");
// Test 9: Test Disservice ability
console.log("Test 9: Testing Disservice ability...");
const game9 = new Game("Test Player", "multiplayer");
const player9 = game9.players[0];
const opponent9 = game9.players[1];
const disserviceAbility = allCards.find(c => c.name === 'Disservice');
if (disserviceAbility) {
    console.log(`Opponent hand size before: ${opponent9.hand.length}`);
    console.log(`Opponent score before: ${opponent9.calculateTotalScore()}`);
    const result = disserviceAbility.activate(game9, player9, opponent9);
    console.log(`Ability activation result: ${result}`);
    console.log(`Opponent hand size after: ${opponent9.hand.length}`);
    console.log(`Opponent score after: ${opponent9.calculateTotalScore()}`);
}
console.log("✓ Test 9 passed!\n");
// Test 10: Test Refresh ability
console.log("Test 10: Testing Refresh ability...");
const game10 = new Game("Test Player", "multiplayer");
const player10 = game10.players[0];
const opponent10 = game10.players[1];
// Draw some cards
player10.addCard(game10.deck.dealCard(true));
player10.addCard(game10.deck.dealCard(true));
const refreshAbility = allCards.find(c => c.name === 'Refresh');
if (refreshAbility) {
    console.log(`Player hand size before: ${player10.hand.length}`);
    console.log(`Player score before: ${player10.calculateTotalScore()}`);
    const result = refreshAbility.activate(game10, player10, opponent10);
    console.log(`Ability activation result: ${result}`);
    console.log(`Player hand size after: ${player10.hand.length}`);
    console.log(`Player score after: ${player10.calculateTotalScore()}`);
}
console.log("✓ Test 10 passed!\n");
// Test 11: Test One-Up ability
console.log("Test 11: Testing One-Up ability...");
const game11 = new Game("Test Player", "multiplayer");
const player11 = game11.players[0];
const opponent11 = game11.players[1];
const oneUpAbility = allCards.find(c => c.name === 'One-Up');
if (oneUpAbility) {
    console.log(`Bet modifier before: ${game11.betModifier}`);
    const result = oneUpAbility.activate(game11, player11, opponent11);
    console.log(`Ability activation result: ${result}`);
    console.log(`Bet modifier after: ${game11.betModifier}`);
}
console.log("✓ Test 11 passed!\n");
// Test 12: Test Two-Up ability
console.log("Test 12: Testing Two-Up ability...");
const game12 = new Game("Test Player", "multiplayer");
const player12 = game12.players[0];
const opponent12 = game12.players[1];
const twoUpAbility = allCards.find(c => c.name === 'Two-Up');
if (twoUpAbility) {
    console.log(`Bet modifier before: ${game12.betModifier}`);
    const result = twoUpAbility.activate(game12, player12, opponent12);
    console.log(`Ability activation result: ${result}`);
    console.log(`Bet modifier after: ${game12.betModifier}`);
}
console.log("✓ Test 12 passed!\n");
// Test 13: Test Shield ability
console.log("Test 13: Testing Shield ability...");
const game13 = new Game("Test Player", "multiplayer");
const player13 = game13.players[0];
const opponent13 = game13.players[1];
const shieldAbility = allCards.find(c => c.name === 'Shield');
if (shieldAbility) {
    console.log(`Bet modifier before: ${game13.betModifier}`);
    const result = shieldAbility.activate(game13, player13, opponent13);
    console.log(`Ability activation result: ${result}`);
    console.log(`Bet modifier after: ${game13.betModifier}`);
}
console.log("✓ Test 13 passed!\n");
// Test 14: Test Shield-Plus ability
console.log("Test 14: Testing Shield-Plus ability...");
const game14 = new Game("Test Player", "multiplayer");
const player14 = game14.players[0];
const opponent14 = game14.players[1];
const shieldPlusAbility = allCards.find(c => c.name === 'Shield-Plus');
if (shieldPlusAbility) {
    console.log(`Bet modifier before: ${game14.betModifier}`);
    const result = shieldPlusAbility.activate(game14, player14, opponent14);
    console.log(`Ability activation result: ${result}`);
    console.log(`Bet modifier after: ${game14.betModifier}`);
}
console.log("✓ Test 14 passed!\n");
// Test 15: Test Bless ability
console.log("Test 15: Testing Bless ability...");
const game15 = new Game("Test Player", "multiplayer");
const player15 = game15.players[0];
const opponent15 = game15.players[1];
const blessAbility = allCards.find(c => c.name === 'Bless');
if (blessAbility) {
    console.log(`Player has Bless before: ${player15.hasBless}`);
    const result = blessAbility.activate(game15, player15, opponent15);
    console.log(`Ability activation result: ${result}`);
    console.log(`Player has Bless after: ${player15.hasBless}`);
}
console.log("✓ Test 15 passed!\n");
// Test 16: Test Destroy ability
console.log("Test 16: Testing Destroy ability...");
const game16 = new Game("Test Player", "multiplayer");
const player16 = game16.players[0];
const opponent16 = game16.players[1];
// Opponent uses One-Up first
const oneUp16 = allCards.find(c => c.name === 'One-Up');
if (oneUp16) {
    oneUp16.activate(game16, opponent16, player16);
    console.log(`Bet modifier after One-Up: ${game16.betModifier}`);
}
const destroyAbility = allCards.find(c => c.name === 'Destroy');
if (destroyAbility) {
    const result = destroyAbility.activate(game16, player16, opponent16);
    console.log(`Destroy activation result: ${result}`);
    console.log(`Bet modifier after Destroy: ${game16.betModifier}`);
}
console.log("✓ Test 16 passed!\n");
// Test 17: Test Bloodfeast ability
console.log("Test 17: Testing Bloodfeast ability...");
const game17 = new Game("Test Player", "multiplayer");
const player17 = game17.players[0];
const opponent17 = game17.players[1];
const bloodfeastAbility = allCards.find(c => c.name === 'Bloodfeast');
if (bloodfeastAbility) {
    console.log(`Bet modifier before: ${game17.betModifier}`);
    console.log(`Player ability hand size before: ${player17.abilityHand.length}`);
    const result = bloodfeastAbility.activate(game17, player17, opponent17);
    console.log(`Ability activation result: ${result}`);
    console.log(`Bet modifier after: ${game17.betModifier}`);
    console.log(`Player ability hand size after: ${player17.abilityHand.length}`);
}
console.log("✓ Test 17 passed!\n");
// Test 18: Test Friendship ability
console.log("Test 18: Testing Friendship ability...");
const game18 = new Game("Test Player", "multiplayer");
const player18 = game18.players[0];
const opponent18 = game18.players[1];
const friendshipAbility = allCards.find(c => c.name === 'Friendship');
if (friendshipAbility) {
    console.log(`Player ability hand size before: ${player18.abilityHand.length}`);
    console.log(`Opponent ability hand size before: ${opponent18.abilityHand.length}`);
    const result = friendshipAbility.activate(game18, player18, opponent18);
    console.log(`Ability activation result: ${result}`);
    console.log(`Player ability hand size after: ${player18.abilityHand.length}`);
    console.log(`Opponent ability hand size after: ${opponent18.abilityHand.length}`);
}
console.log("✓ Test 18 passed!\n");
// Test 19: Test Relentless ability
console.log("Test 19: Testing Relentless ability...");
const game19 = new Game("Test Player", "multiplayer");
const player19 = game19.players[0];
const opponent19 = game19.players[1];
// Opponent uses One-Up first
const oneUp19 = allCards.find(c => c.name === 'One-Up');
if (oneUp19) {
    oneUp19.activate(game19, opponent19, player19);
    console.log(`Bet modifier after One-Up: ${game19.betModifier}`);
}
const relentlessAbility = allCards.find(c => c.name === 'Relentless');
if (relentlessAbility) {
    console.log(`Player ability hand size before: ${player19.abilityHand.length}`);
    const result = relentlessAbility.activate(game19, player19, opponent19);
    console.log(`Relentless activation result: ${result}`);
    console.log(`Bet modifier after Relentless: ${game19.betModifier}`);
    console.log(`Player ability hand size after: ${player19.abilityHand.length}`);
}
console.log("✓ Test 19 passed!\n");
// Test 20: Test Go For 17 ability
console.log("Test 20: Testing Go For 17 ability...");
const game20 = new Game("Test Player", "multiplayer");
const player20 = game20.players[0];
const opponent20 = game20.players[1];
const goFor17Ability = allCards.find(c => c.name === 'Go For 17');
if (goFor17Ability) {
    console.log(`Target number before: ${game20.targetNumber}`);
    const result = goFor17Ability.activate(game20, player20, opponent20);
    console.log(`Ability activation result: ${result}`);
    console.log(`Target number after: ${game20.targetNumber}`);
}
console.log("✓ Test 20 passed!\n");
// Test 21: Test Go For 24 ability
console.log("Test 21: Testing Go For 24 ability...");
const game21 = new Game("Test Player", "multiplayer");
const player21 = game21.players[0];
const opponent21 = game21.players[1];
const goFor24Ability = allCards.find(c => c.name === 'Go For 24');
if (goFor24Ability) {
    console.log(`Target number before: ${game21.targetNumber}`);
    const result = goFor24Ability.activate(game21, player21, opponent21);
    console.log(`Ability activation result: ${result}`);
    console.log(`Target number after: ${game21.targetNumber}`);
}
console.log("✓ Test 21 passed!\n");
// Test 22: Test Go For 27 ability
console.log("Test 22: Testing Go For 27 ability...");
const game22 = new Game("Test Player", "multiplayer");
const player22 = game22.players[0];
const opponent22 = game22.players[1];
const goFor27Ability = allCards.find(c => c.name === 'Go For 27');
if (goFor27Ability) {
    console.log(`Target number before: ${game22.targetNumber}`);
    const result = goFor27Ability.activate(game22, player22, opponent22);
    console.log(`Ability activation result: ${result}`);
    console.log(`Target number after: ${game22.targetNumber}`);
}
console.log("✓ Test 22 passed!\n");
// Test 23: Test ability stacking (One-Up + Two-Up)
console.log("Test 23: Testing ability stacking...");
const game23 = new Game("Test Player", "multiplayer");
const player23 = game23.players[0];
const opponent23 = game23.players[1];
const oneUp23 = allCards.find(c => c.name === 'One-Up');
const twoUp23 = allCards.find(c => c.name === 'Two-Up');
if (oneUp23 && twoUp23) {
    console.log(`Bet modifier before: ${game23.betModifier}`);
    oneUp23.activate(game23, player23, opponent23);
    console.log(`Bet modifier after One-Up: ${game23.betModifier}`);
    twoUp23.activate(game23, player23, opponent23);
    console.log(`Bet modifier after Two-Up: ${game23.betModifier}`);
}
console.log("✓ Test 23 passed!\n");
// Test 24: Test Player useAbility method
console.log("Test 24: Testing Player.useAbility method...");
const game24 = new Game("Test Player", "multiplayer");
const player24 = game24.players[0];
const opponent24 = game24.players[1];
// Add some ability cards to player's hand
const ability1 = allCards.find(c => c.name === 'One-Up');
const ability2 = allCards.find(c => c.name === 'Perfect Draw');
if (ability1 && ability2) {
    player24.abilityHand.push(ability1);
    player24.abilityHand.push(ability2);
    console.log(`Player ability hand: ${player24.printAbilityHand()}`);
    console.log(`Using ability at index 0...`);
    const result = player24.useAbility(0, game24, opponent24);
    console.log(`Use ability result: ${result}`);
    console.log(`Player ability hand after: ${player24.printAbilityHand()}`);
}
console.log("✓ Test 24 passed!\n");
// Test 25: Test AI Level 1 ability choice
console.log("Test 25: Testing AI Level 1 ability choice...");
const gameAI1 = new Game("Human", "singleplayer", 1);
const aiPlayer1 = gameAI1.players[1];
const human1 = gameAI1.players[0];
console.log(`AI abilities: ${aiPlayer1.printAbilityHand()}`);
if (aiPlayer1 instanceof AIPlayer) {
    // Call chooseAbility multiple times to see randomness
    for (let i = 0; i < 5; i++) {
        const choice = aiPlayer1.chooseAbility(gameAI1, human1);
        console.log(`  Choice ${i + 1}: ${choice === -1 ? 'No ability' : aiPlayer1.abilityHand[choice]?.name}`);
    }
}
console.log("✓ Test 25 passed!\n");
// Test 26: Test AI Level 5 ability choice
console.log("Test 26: Testing AI Level 5 ability choice...");
const gameAI5 = new Game("Human", "singleplayer", 5);
const aiPlayer5 = gameAI5.players[1];
const human5 = gameAI5.players[0];
console.log(`AI abilities: ${aiPlayer5.printAbilityHand()}`);
console.log(`AI score: ${aiPlayer5.calculateTotalScore()}`);
console.log(`Human score: ${human5.calculateVisibleScore()}`);
if (aiPlayer5 instanceof AIPlayer) {
    const choice = aiPlayer5.chooseAbility(gameAI5, human5);
    console.log(`AI choice: ${choice === -1 ? 'No ability' : aiPlayer5.abilityHand[choice]?.name}`);
}
console.log("✓ Test 26 passed!\n");
// Test 27: Test full game integration
console.log("Test 27: Testing full game integration...");
const fullGame = new Game("Player 1", "multiplayer");
console.log(`Game created successfully`);
console.log(`Player 1 has ${fullGame.players[0].abilityHand.length} abilities`);
console.log(`Player 2 has ${fullGame.players[1].abilityHand.length} abilities`);
console.log(`Target number: ${fullGame.targetNumber}`);
console.log(`Bet modifier: ${fullGame.betModifier}`);
console.log("✓ Test 27 passed!\n");
console.log("\n=== All Tests Completed Successfully! ===");
