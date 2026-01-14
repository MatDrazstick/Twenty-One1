import { Card } from './Card.js';
declare class Deck {
    cards: Card[];
    constructor();
    shuffle(): void;
    dealCard(faceUp?: boolean): Card;
    reset(): void;
    cardsRemaining(): number;
    printDeck(): string;
}
export { Deck };
//# sourceMappingURL=Deck.d.ts.map