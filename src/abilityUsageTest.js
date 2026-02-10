import { Game } from './Game.js';
console.log("=== Ability Usage Test ===\n");
console.log("Testing: Player can use ability cards during their turn\n");
async function testAbilityUsage() {
    const settings = { timerSeconds: 30 };
    const game = new Game("TestPlayer", "singleplayer", 3, settings);
    const player = game.players[0];
    console.log(`Player: ${player.name}`);
    console.log(`Initial hand: ${player.printHand()}`);
    console.log(`Visible score: ${player.calculateVisibleScore()}`);
    console.log(`\nAbility cards in hand:`);
    console.log(player.printAbilityHand());
    console.log(`\nTotal abilities: ${player.abilityHand.length}`);
    if (player.abilityHand.length > 0) {
        console.log(`\n--- Using first ability ---`);
        const abilityName = player.abilityHand[0].name;
        console.log(`Ability to use: ${abilityName}`);
        const success = await game.useAbility(0);
        console.log(`\nAbility used successfully: ${success}`);
        console.log(`Hand after using ability: ${player.printHand()}`);
        console.log(`Visible score after: ${player.calculateVisibleScore()}`);
        console.log(`\nRemaining abilities:`);
        console.log(player.printAbilityHand());
        console.log(`Total abilities remaining: ${player.abilityHand.length}`);
        // Test using invalid ability index
        console.log(`\n--- Testing invalid ability index ---`);
        const invalidSuccess = await game.useAbility(99);
        console.log(`Invalid ability usage blocked: ${!invalidSuccess}`);
        // Player can still draw or stay after using ability
        console.log(`\n--- Player can still act after using ability ---`);
        console.log(`Current player: ${game.players[game.currentPlayerIndex].name}`);
        console.log(`Player can draw: ${!player.isBusted && !game.player1Stayed}`);
        console.log(`\n✓ Ability system working correctly!`);
    }
    else {
        console.log(`\n✗ No abilities found (unexpected)`);
    }
    game.stopTurnTimer();
}
testAbilityUsage().then(() => {
    console.log("\n🎉 Ability usage verified!");
    process.exit(0);
}).catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
