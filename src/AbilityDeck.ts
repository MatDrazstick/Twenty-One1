import { AbilityCard, createAllAbilityCards } from './AbilityCard.js';

export class AbilityDeck {
  cards: AbilityCard[];
  
  constructor() {
    this.cards = createAllAbilityCards();
  }
  
  // Shuffle the deck
  shuffle(): void {
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j]!, this.cards[i]!];
    }
  }
  
  // Deal an ability card
  dealCard(): AbilityCard {
    if (this.cards.length === 0) {
      throw new Error("No ability cards left in deck!");
    }
    
    return this.cards.pop()!;
  }
  
  // Reset the deck (for a new game)
  reset(): void {
    this.cards = createAllAbilityCards();
  }
  
  // Check how many cards are left
  cardsRemaining(): number {
    return this.cards.length;
  }
  
  // Helper method to see deck
  printDeck(): string {
    return this.cards.map(card => card.name).join(', ');
  }
}
