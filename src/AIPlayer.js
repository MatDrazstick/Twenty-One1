import { Player } from './Players.js';
export class AIPlayer extends Player {
    difficulty;
    constructor(difficulty) {
        super(`AI (Level ${difficulty})`);
        this.difficulty = difficulty;
    }
    /**
     * Decide whether to hit or stay based on AI difficulty level
     * @param opponentVisibleScore - The opponent's visible score
     * @param deckCardsRemaining - Number of cards left in deck
     * @returns true if AI should hit, false if AI should stay
     */
    shouldHit(opponentVisibleScore, deckCardsRemaining) {
        const myVisibleScore = this.calculateVisibleScore();
        const myTotalScore = this.calculateTotalScore();
        // If already busted, can't hit
        if (this.isBusted) {
            return false;
        }
        switch (this.difficulty) {
            case 1:
                // Level 1: Random moves (50% chance to hit or stay)
                return Math.random() < 0.5;
            case 2:
                // Level 2: Basic strategy - stay on 17 or higher (like blackjack)
                return myVisibleScore < 17;
            case 3:
                // Level 3: Conservative strategy - stay on 15 or higher
                return myVisibleScore < 15;
            case 4:
                // Level 4: Smart strategy - considers opponent and risk
                return this.smartStrategy(myVisibleScore, opponentVisibleScore, deckCardsRemaining);
            case 5:
                // Level 5: Advanced strategy - optimal play with card counting
                return this.advancedStrategy(myVisibleScore, myTotalScore, opponentVisibleScore, deckCardsRemaining);
            default:
                return myVisibleScore < 17;
        }
    }
    /**
     * Level 4 AI: Smart strategy considering opponent
     */
    smartStrategy(myScore, opponentScore, cardsLeft) {
        // If we're already winning and have a decent score, play it safe
        if (myScore > opponentScore && myScore >= 16) {
            return false;
        }
        // If opponent is ahead and we're below 18, take the risk
        if (opponentScore > myScore && myScore < 18) {
            return true;
        }
        // If we're losing badly, take more risks
        if (opponentScore - myScore > 5 && myScore < 19) {
            return true;
        }
        // Default: stay on 17+
        return myScore < 17;
    }
    /**
     * Level 5 AI: Advanced strategy with risk calculation
     */
    advancedStrategy(myVisibleScore, myTotalScore, opponentScore, cardsLeft) {
        // Calculate probability of busting
        const remainingValue = 21 - myTotalScore;
        // If we have 20 or 21, always stay
        if (myTotalScore >= 20) {
            return false;
        }
        // If opponent is showing strong hand (18+), we need to be aggressive
        if (opponentScore >= 18 && myVisibleScore < 17) {
            // But not if we're too close to busting
            if (remainingValue >= 6) {
                return true;
            }
        }
        // Calculate risk: if we can only safely draw cards 1-5 (more than half the deck is dangerous)
        if (remainingValue <= 5) {
            // High risk situation - only hit if we're losing badly
            if (opponentScore > myVisibleScore + 3) {
                return Math.random() < 0.4; // 40% chance to take the risk
            }
            return false;
        }
        // If opponent is showing weak hand, play conservative
        if (opponentScore <= 12 && myVisibleScore >= 15) {
            return false;
        }
        // Standard play: hit if below 16, stay if 16+
        if (myVisibleScore >= 16) {
            // Check if opponent is ahead
            if (opponentScore > myVisibleScore) {
                return myTotalScore < 19; // Take small risk to catch up
            }
            return false;
        }
        return true;
    }
}
