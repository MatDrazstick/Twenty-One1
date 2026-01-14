import { Card } from './Card.js';
declare class Player {
    name: string;
    hand: Card[];
    faceDownCard: Card | null;
    constructor(name: string);
    addCard(card: Card): void;
    setFaceDownCard(card: Card): void;
    calculateVisibleScore(): number;
    calculateTotalScore(): number;
    revealFaceDownCard(): void;
    printHand(): string;
}
export { Player };
//# sourceMappingURL=Players.d.ts.map