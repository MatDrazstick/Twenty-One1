import { Card } from './Card.js';
import { AbilityCard } from './AbilityCard.js';

class Player {
  name: string;
  hand: Card[];
  faceDownCard: Card | null;
  isBusted: boolean;
  abilityHand: AbilityCard[];
  hasBless: boolean;
  
  constructor(name: string) {
    this.name = name;
    this.hand = [];
    this.faceDownCard = null;
    this.isBusted = false;
    this.abilityHand = [];
    this.hasBless = false;
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
    this.abilityHand = [];
    this.hasBless = false;
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

  // Print ability hand
  printAbilityHand(): string {
    return this.abilityHand.map((ability, index) => `${index + 1}. ${ability.name}`).join('\n');
  }

  // Use an ability card
  useAbility(index: number, game: any, opponent: Player): boolean {
    if (index < 0 || index >= this.abilityHand.length) {
      console.log(`Invalid ability index.`);
      return false;
    }

    const ability = this.abilityHand[index];
    const success = ability.activate(game, this, opponent);
    
    if (success) {
      // Remove used ability from hand
      this.abilityHand.splice(index, 1);
    }
    
    return success;
  }
  
}


export { Player };