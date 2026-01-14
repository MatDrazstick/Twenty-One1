import { Card } from './Card.js';
class Deck {
    cards;
    constructor() {
        this.cards = [];
        // Create all 11 unique cards
        for (let values = 1; values <= 11; values++) {
            this.cards.push(new Card(values, true)); // All cards start face-up in deck
        }
    }
    // Shuffle the deck
    shuffle() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // Swap cards at positions i and j
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    // Deal a card, specifying if it should be face-up or face-down
    dealCard(faceUp = true) {
        if (this.cards.length === 0) {
            throw new Error("No cards left in deck!");
        }
        // Take the top card (last in array)
        const card = this.cards.pop();
        // Set its face status
        card.faceup = faceUp;
        return card;
    }
    // Reset the deck (for a new game)
    reset() {
        this.cards = [];
        for (let value = 1; value <= 11; value++) {
            this.cards.push(new Card(value, true));
        }
    }
    // Check how many cards are left
    cardsRemaining() {
        return this.cards.length;
    }
    // Helper method to see deck order
    printDeck() {
        return this.cards.map(card => card.toString()).join(', ');
    }
}
export { Deck };
