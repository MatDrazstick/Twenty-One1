import { Card } from './Card.js';

class Player {
  name: string;
  hand: Card[];
  faceDownCard: Card | null;
  isBusted: boolean;
  
  constructor(name: string) {
    this.name = name;
    this.hand = [];
    this.faceDownCard = null;
    this.isBusted = false;
  }
  // NEW: Check if player has busted (over 21)
  checkBust(): boolean {
    const total = this.calculateTotalScore();
    this.isBusted = total > 21;
    return this.isBusted;
  }
    // NEW: Reset bust status for new round
  resetForNewRound(): void {
    this.hand = [];
    this.faceDownCard = null;
    this.isBusted = false;
  }
  addCard(card: Card): void {
    this.hand.push(card);
  }
  
  setFaceDownCard(card: Card): void {
    card.faceup = false;
    this.faceDownCard = card;
    this.hand.push(card);
  }
  
  calculateVisibleScore(): number {
    let score = 0;
    for (const card of this.hand) {
      if (card !== this.faceDownCard) {
        score += card.values;
      }
    }
    return score;
  }
  
  calculateTotalScore(): number {
    let score = 0;
    for (const card of this.hand) {
      score += card.values;
    }
    return score;
  }
  
  revealFaceDownCard(): void {
    if (this.faceDownCard) {
      this.faceDownCard.flip();
    }
  }
  
  printHand(): string {
    return this.hand.map(card => card.toString()).join(', ');
  }
  
}


export { Player };