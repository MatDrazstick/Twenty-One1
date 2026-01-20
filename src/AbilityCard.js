export var AbilityCategory;
(function (AbilityCategory) {
    AbilityCategory["AddNumber"] = "AddNumber";
    AbilityCategory["DeckTrump"] = "DeckTrump";
    AbilityCategory["BetAbility"] = "BetAbility";
    AbilityCategory["GoFor"] = "GoFor";
})(AbilityCategory || (AbilityCategory = {}));
export class AbilityCard {
    name;
    description;
    category;
    effect;
    value; // For AddNumber abilities
    constructor(name, description, category, effect, value) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.effect = effect;
        this.value = value;
    }
    activate(game, player, opponent) {
        console.log(`${player.name} uses ability: ${this.name}`);
        return this.effect(game, player, opponent);
    }
    toString() {
        return `${this.name} - ${this.description}`;
    }
}
// Factory function to create all ability cards
export function createAllAbilityCards() {
    const cards = [];
    // === Add Number Abilities ===
    const addNumberValues = [2, 3, 4, 6, 7];
    for (const value of addNumberValues) {
        cards.push(new AbilityCard(`${value}-Card`, `This ability '${value}-Card' allows you to draw the numbered card ${value} if it's still available in the deck, if not the trump will simply be used but not draw the card.`, AbilityCategory.AddNumber, (game, player, opponent) => {
            if (game.deck.containsValue(value)) {
                // Find and remove the specific card
                const cardIndex = game.deck.cards.findIndex(c => c.values === value);
                if (cardIndex !== -1) {
                    const card = game.deck.cards.splice(cardIndex, 1)[0];
                    card.faceup = true;
                    player.addCard(card);
                    console.log(`${player.name} draws card [${value}] using ${value}-Card ability`);
                    return true;
                }
            }
            console.log(`Card ${value} not available in deck. Ability used but no card drawn.`);
            return false;
        }, value));
    }
    // === Deck Trump Abilities ===
    // Hush
    cards.push(new AbilityCard('Hush', `'Hush' allows you to draw any card remaining from the deck however, it will be completely hidden what number you drew from your opponent.`, AbilityCategory.DeckTrump, (game, player, opponent) => {
        if (game.deck.cardsRemaining() > 0) {
            const card = game.deck.dealCard(false); // Deal face-down
            player.addCard(card);
            console.log(`${player.name} draws a hidden card using Hush`);
            return true;
        }
        console.log(`No cards available. Hush has no effect.`);
        return false;
    }));
    // Perfect Draw
    cards.push(new AbilityCard('Perfect Draw', `'Perfect Draw' allows you to draw the best remaining card remaining from the deck to reach the set number, it will however not work if there are no available cards from the deck or make you go over the set number.`, AbilityCategory.DeckTrump, (game, player, opponent) => {
        const targetNumber = game.targetNumber || 21;
        const currentScore = player.calculateTotalScore();
        const needed = targetNumber - currentScore;
        if (needed <= 0 || game.deck.cardsRemaining() === 0) {
            console.log(`Perfect Draw cannot be used (no valid cards available).`);
            return false;
        }
        // Find the best card that doesn't bust
        let bestCard = null;
        let bestIndex = -1;
        for (let i = 0; i < game.deck.cards.length; i++) {
            const card = game.deck.cards[i];
            if (card.values <= needed) {
                if (!bestCard || card.values > bestCard.values) {
                    bestCard = card;
                    bestIndex = i;
                }
            }
        }
        if (bestCard && bestIndex !== -1) {
            const card = game.deck.cards.splice(bestIndex, 1)[0];
            card.faceup = true;
            player.addCard(card);
            console.log(`${player.name} draws [${card.values}] using Perfect Draw`);
            return true;
        }
        console.log(`Perfect Draw cannot find a valid card.`);
        return false;
    }));
    // Refresh
    cards.push(new AbilityCard('Refresh', `'Refresh' allows you to draw 2 completely new cards remaining from the deck and return any of the cards you had in your deck before using this trump.`, AbilityCategory.DeckTrump, (game, player, opponent) => {
        if (game.deck.cardsRemaining() < 2) {
            console.log(`Not enough cards for Refresh.`);
            return false;
        }
        // Return all visible cards to deck (except face-down card)
        const cardsToReturn = player.hand.filter(c => c !== player.faceDownCard);
        for (const card of cardsToReturn) {
            game.deck.cards.push(card);
        }
        player.hand = player.faceDownCard ? [player.faceDownCard] : [];
        // Draw 2 new cards
        const card1 = game.deck.dealCard(true);
        const card2 = game.deck.dealCard(true);
        player.addCard(card1);
        player.addCard(card2);
        console.log(`${player.name} uses Refresh and draws 2 new cards: [${card1.values}], [${card2.values}]`);
        return true;
    }));
    // Remove
    cards.push(new AbilityCard('Remove', `'Remove' allows you remove the last card your opponent drew from the deck but this will not work if there is only one card remaining in the deck.`, AbilityCategory.DeckTrump, (game, player, opponent) => {
        if (opponent.hand.length <= 1 || game.deck.cardsRemaining() === 1) {
            console.log(`Remove cannot be used.`);
            return false;
        }
        // Remove the last card from opponent's hand (not the face-down card)
        const cardsWithoutFaceDown = opponent.hand.filter(c => c !== opponent.faceDownCard);
        if (cardsWithoutFaceDown.length > 0) {
            const removedCard = cardsWithoutFaceDown[cardsWithoutFaceDown.length - 1];
            const index = opponent.hand.indexOf(removedCard);
            opponent.hand.splice(index, 1);
            game.deck.cards.push(removedCard);
            console.log(`${player.name} removes opponent's last card [${removedCard.values}] using Remove`);
            return true;
        }
        console.log(`Remove cannot be used.`);
        return false;
    }));
    // Return
    cards.push(new AbilityCard('Return', `'Return' allows you withdraw the last card you drew from the deck.`, AbilityCategory.DeckTrump, (game, player, opponent) => {
        const cardsWithoutFaceDown = player.hand.filter(c => c !== player.faceDownCard);
        if (cardsWithoutFaceDown.length === 0) {
            console.log(`Return cannot be used (no cards to return).`);
            return false;
        }
        const returnedCard = cardsWithoutFaceDown[cardsWithoutFaceDown.length - 1];
        const index = player.hand.indexOf(returnedCard);
        player.hand.splice(index, 1);
        game.deck.cards.push(returnedCard);
        console.log(`${player.name} returns card [${returnedCard.values}] using Return`);
        return true;
    }));
    // Exchange
    cards.push(new AbilityCard('Exchange', `'Exchange' allows you to swap the most recently taken card you have in your hand with your opponents.`, AbilityCategory.DeckTrump, (game, player, opponent) => {
        const playerCards = player.hand.filter(c => c !== player.faceDownCard);
        const opponentCards = opponent.hand.filter(c => c !== opponent.faceDownCard);
        if (playerCards.length === 0 || opponentCards.length === 0) {
            console.log(`Exchange cannot be used.`);
            return false;
        }
        const playerCard = playerCards[playerCards.length - 1];
        const opponentCard = opponentCards[opponentCards.length - 1];
        // Swap the cards
        const playerIndex = player.hand.indexOf(playerCard);
        const opponentIndex = opponent.hand.indexOf(opponentCard);
        player.hand[playerIndex] = opponentCard;
        opponent.hand[opponentIndex] = playerCard;
        console.log(`${player.name} exchanges [${playerCard.values}] with opponent's [${opponentCard.values}]`);
        return true;
    }));
    // Disservice
    cards.push(new AbilityCard('Disservice', `'Disservice' forces your opponent to draw a card from the deck automatically and always works unless theres no more cards to draw.`, AbilityCategory.DeckTrump, (game, player, opponent) => {
        if (game.deck.cardsRemaining() === 0) {
            console.log(`Disservice cannot be used (no cards left).`);
            return false;
        }
        const card = game.deck.dealCard(true);
        opponent.addCard(card);
        console.log(`${player.name} forces ${opponent.name} to draw [${card.values}] using Disservice`);
        return true;
    }));
    // === Bet Abilities ===
    // One-up
    cards.push(new AbilityCard('One-Up', `'One-Up' allows you to increase the bet number by 1 therefore the counter will go up by 1 on the Kill Machine. However, if your opponent uses 'Destroy' or 'Reincarnation' the effect of the trump will be nullified and if someone uses another One-Up or Two-Up trump card when this is already in play the bet increase will stack.`, AbilityCategory.BetAbility, (game, player, opponent) => {
        game.betModifier = (game.betModifier || 0) + 1;
        game.lastAbilityPlayed = { player, ability: 'One-Up' };
        console.log(`${player.name} uses One-Up. Bet modifier: +${game.betModifier}`);
        return true;
    }));
    // Two-up
    cards.push(new AbilityCard('Two-Up', `'Two-up' allows you to increase the bet number by 2 therefore the counter will go up by 2 on the chainsaw. However, if your opponent uses 'Destroy' or 'Reincarnation' the effect of the trump will be nullified and if someone uses another One-Up or Two-Up trump card when this is already in play the bet increase will stack.`, AbilityCategory.BetAbility, (game, player, opponent) => {
        game.betModifier = (game.betModifier || 0) + 2;
        game.lastAbilityPlayed = { player, ability: 'Two-Up' };
        console.log(`${player.name} uses Two-Up. Bet modifier: +${game.betModifier}`);
        return true;
    }));
    // Shield
    cards.push(new AbilityCard('Shield', `'Shield' allows you to decrease the bet number by 1 therefore the counter will go down by 1 on the Kill Machine. However, if your opponent uses 'Destroy' or 'Reincarnation' the effect of the trump will be nullified and if someone uses another Shield or Shield+ card when this is already in play the bet decrease will stack.`, AbilityCategory.BetAbility, (game, player, opponent) => {
        game.betModifier = (game.betModifier || 0) - 1;
        game.lastAbilityPlayed = { player, ability: 'Shield' };
        console.log(`${player.name} uses Shield. Bet modifier: ${game.betModifier}`);
        return true;
    }));
    // Shield-Plus
    cards.push(new AbilityCard('Shield-Plus', `'Shield-Plus' allows you to decrease the bet number by 2 therefore the counter will go down by 2 on the Kill Machine. However, if your opponent uses 'Destroy' or 'Reincarnation' the effect of the trump will be nullified.`, AbilityCategory.BetAbility, (game, player, opponent) => {
        game.betModifier = (game.betModifier || 0) - 2;
        game.lastAbilityPlayed = { player, ability: 'Shield-Plus' };
        console.log(`${player.name} uses Shield-Plus. Bet modifier: ${game.betModifier}`);
        return true;
    }));
    // Bless
    cards.push(new AbilityCard('Bless', `'Bless' allows you to avoid death even if you lose the round and the number on the tally is the same or higher then your counter - it's noted that this card only applies if you're about to die, if the tally is lower then your counter number and this card is used it will have no effect.`, AbilityCategory.BetAbility, (game, player, opponent) => {
        player.hasBless = true;
        console.log(`${player.name} uses Bless. Will be protected from death this round.`);
        return true;
    }));
    // Bloodfeast
    cards.push(new AbilityCard('Bloodfeast', `'Bloodfeast' allows you to draw one trump card and also increase the bet number by 1 on the tally. However, if your opponent uses 'Destroy' or 'Reincarnation' the effect of the trump will be nullified and if someone uses a 'Two-Up' or 'One-Up' trump it will stack the increased bet and vice versa if someone uses the 'Shield' or 'Shield+' trump it will decrease the bet. This can also be stacked with other Bloodshed trumps.`, AbilityCategory.BetAbility, (game, player, opponent) => {
        game.betModifier = (game.betModifier || 0) + 1;
        game.lastAbilityPlayed = { player, ability: 'Bloodfeast' };
        // Draw one ability card
        if (game.abilityDeck && game.abilityDeck.cardsRemaining() > 0) {
            const newAbility = game.abilityDeck.dealCard();
            player.abilityHand.push(newAbility);
            console.log(`${player.name} uses Bloodfeast. Bet modifier: +${game.betModifier}, Drew ability: ${newAbility.name}`);
        }
        else {
            console.log(`${player.name} uses Bloodfeast. Bet modifier: +${game.betModifier}, No abilities left to draw`);
        }
        return true;
    }));
    // Destroy
    cards.push(new AbilityCard('Destroy', `'Destroy' allows you to destroy the most recently placed trump. However, if there are no trump cards placed on the table or the only placed trump cards were placed by you not your opponent then this trump will have no effect.`, AbilityCategory.BetAbility, (game, player, opponent) => {
        if (game.lastAbilityPlayed && game.lastAbilityPlayed.player !== player) {
            const destroyed = game.lastAbilityPlayed.ability;
            // Reverse the effect based on what was destroyed
            if (destroyed === 'One-Up' || destroyed === 'Bloodfeast') {
                game.betModifier = (game.betModifier || 0) - 1;
            }
            else if (destroyed === 'Two-Up') {
                game.betModifier = (game.betModifier || 0) - 2;
            }
            else if (destroyed === 'Shield') {
                game.betModifier = (game.betModifier || 0) + 1;
            }
            else if (destroyed === 'Shield-Plus') {
                game.betModifier = (game.betModifier || 0) + 2;
            }
            else if (destroyed.startsWith('Go For')) {
                game.targetNumber = 21; // Reset to default
            }
            game.lastAbilityPlayed = null;
            console.log(`${player.name} destroys ${destroyed}. Bet modifier: ${game.betModifier}`);
            return true;
        }
        console.log(`Destroy has no effect (no opponent abilities to destroy).`);
        return false;
    }));
    // Friendship
    cards.push(new AbilityCard('Friendship', `'Friendship' allows you to draw two trump cards during the game. However, it also makes it so your opponent draws two trump cards as well when it's used.`, AbilityCategory.BetAbility, (game, player, opponent) => {
        if (!game.abilityDeck) {
            console.log(`Friendship has no effect (no ability deck).`);
            return false;
        }
        // Draw 2 for player
        for (let i = 0; i < 2 && game.abilityDeck.cardsRemaining() > 0; i++) {
            const ability = game.abilityDeck.dealCard();
            player.abilityHand.push(ability);
            console.log(`${player.name} draws ability: ${ability.name}`);
        }
        // Draw 2 for opponent
        for (let i = 0; i < 2 && game.abilityDeck.cardsRemaining() > 0; i++) {
            const ability = game.abilityDeck.dealCard();
            opponent.abilityHand.push(ability);
            console.log(`${opponent.name} draws ability: ${ability.name}`);
        }
        return true;
    }));
    // Relentless
    cards.push(new AbilityCard('Relentless', `'Relentless' allows you to destroy the most recently placed trump and draw one. However, if there are no trump cards placed on the table or the only placed trump cards were placed by you not your opponent then this trump will have no effect.`, AbilityCategory.BetAbility, (game, player, opponent) => {
        if (game.lastAbilityPlayed && game.lastAbilityPlayed.player !== player) {
            const destroyed = game.lastAbilityPlayed.ability;
            // Reverse the effect based on what was destroyed
            if (destroyed === 'One-Up' || destroyed === 'Bloodfeast') {
                game.betModifier = (game.betModifier || 0) - 1;
            }
            else if (destroyed === 'Two-Up') {
                game.betModifier = (game.betModifier || 0) - 2;
            }
            else if (destroyed === 'Shield') {
                game.betModifier = (game.betModifier || 0) + 1;
            }
            else if (destroyed === 'Shield-Plus') {
                game.betModifier = (game.betModifier || 0) + 2;
            }
            else if (destroyed.startsWith('Go For')) {
                game.targetNumber = 21; // Reset to default
            }
            game.lastAbilityPlayed = null;
            // Draw one ability card
            if (game.abilityDeck && game.abilityDeck.cardsRemaining() > 0) {
                const newAbility = game.abilityDeck.dealCard();
                player.abilityHand.push(newAbility);
                console.log(`${player.name} destroys ${destroyed} and draws ability: ${newAbility.name}`);
            }
            else {
                console.log(`${player.name} destroys ${destroyed} but no abilities left to draw`);
            }
            return true;
        }
        console.log(`Relentless has no effect (no opponent abilities to destroy).`);
        return false;
    }));
    // === Go For Abilities ===
    const goForValues = [17, 24, 27];
    for (const value of goForValues) {
        cards.push(new AbilityCard(`Go For ${value}`, `'Go For ${value}' allows you to change the number needed to reach from "21" to "${value}" therefore you'll need to draw or remove cards to reach ${value} instead of 21, if another 'Go For' card is applied or someone uses 'Destroy' or 'Reincarnation' this trumps effect will no longer apply.`, AbilityCategory.GoFor, (game, player, opponent) => {
            game.targetNumber = value;
            game.lastAbilityPlayed = { player, ability: `Go For ${value}` };
            console.log(`${player.name} uses Go For ${value}. Target number is now ${value}.`);
            return true;
        }));
    }
    return cards;
}
