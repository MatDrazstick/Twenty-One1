import { Card } from './Card.js';

/**
 * Test utility functions for creating test data
 */

/**
 * Create a mock card for testing purposes
 * @param value - The card value (1-11)
 * @param faceup - Whether the card is face up
 * @returns A Card object
 */
export function createTestCard(value: number, faceup: boolean = true): Card {
  return new Card(value, faceup);
}

/**
 * Create multiple test cards with specified values
 * @param values - Array of card values
 * @param faceup - Whether cards are face up (default: true)
 * @returns Array of Card objects
 */
export function createTestCards(values: number[], faceup: boolean = true): Card[] {
  return values.map(value => createTestCard(value, faceup));
}

/**
 * Add test cards to a player to simulate a specific score
 * This is useful for testing AI decision-making with specific hand values
 * @param targetScore - The desired visible score
 * @returns Array of cards that sum to the target score
 */
export function createCardsForScore(targetScore: number): Card[] {
  const cards: Card[] = [];
  let remainingScore = targetScore;
  
  while (remainingScore > 0) {
    const cardValue = Math.min(remainingScore, 11);
    cards.push(createTestCard(cardValue, true));
    remainingScore -= cardValue;
  }
  
  return cards;
}
