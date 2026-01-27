import { Player } from './Players.js';
import { AbilityCategory } from './AbilityCard.js';
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
    /**
     * Decide which ability card to use (if any)
     * @param game - The game instance
     * @param opponent - The opponent player
     * @returns The index of the ability to use, or -1 if no ability should be used
     */
    chooseAbility(game, opponent) {
        if (this.abilityHand.length === 0) {
            return -1;
        }
        const myScore = this.calculateTotalScore();
        const opponentVisibleScore = opponent.calculateVisibleScore();
        const targetNumber = game.targetNumber || 21;
        switch (this.difficulty) {
            case 1:
                // Level 1: Random - 30% chance to use any ability
                if (Math.random() < 0.3) {
                    return Math.floor(Math.random() * this.abilityHand.length);
                }
                return -1;
            case 2:
                // Level 2: Basic strategy - use simple abilities
                return this.basicAbilityStrategy(game, opponent, myScore, opponentVisibleScore, targetNumber);
            case 3:
                // Level 3: Conservative strategy - use defensive abilities
                return this.conservativeAbilityStrategy(game, opponent, myScore, opponentVisibleScore, targetNumber);
            case 4:
                // Level 4: Smart strategy - use abilities tactically
                return this.smartAbilityStrategy(game, opponent, myScore, opponentVisibleScore, targetNumber);
            case 5:
                // Level 5: Advanced strategy - optimal ability usage
                return this.advancedAbilityStrategy(game, opponent, myScore, opponentVisibleScore, targetNumber);
            default:
                return -1;
        }
    }
    /**
     * Level 2: Basic ability strategy
     */
    basicAbilityStrategy(game, opponent, myScore, opponentScore, target) {
        // Look for simple beneficial abilities
        for (let i = 0; i < this.abilityHand.length; i++) {
            const ability = this.abilityHand[i];
            // Use Add Number abilities if we need that specific card
            if (ability.category === AbilityCategory.AddNumber && ability.value) {
                const needed = target - myScore;
                if (ability.value === needed || (ability.value < needed && myScore < 15)) {
                    return i;
                }
            }
            // Use Perfect Draw if we're far from target
            if (ability.name === 'Perfect Draw' && myScore < target - 3) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Level 3: Conservative ability strategy
     */
    conservativeAbilityStrategy(game, opponent, myScore, opponentScore, target) {
        // Prioritize defensive and safe abilities
        for (let i = 0; i < this.abilityHand.length; i++) {
            const ability = this.abilityHand[i];
            // Use Shield if we're losing and machine is close
            if ((ability.name === 'Shield' || ability.name === 'Shield-Plus') && game.machineDistanceP2 <= 3) {
                return i;
            }
            // Use Bless if we're in danger
            if (ability.name === 'Bless' && game.machineDistanceP2 <= 2) {
                return i;
            }
            // Use Perfect Draw if safe
            if (ability.name === 'Perfect Draw' && myScore < target - 2) {
                return i;
            }
            // Use Return if we drew too high
            if (ability.name === 'Return' && myScore > target - 3) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Level 4: Smart ability strategy
     */
    smartAbilityStrategy(game, opponent, myScore, opponentScore, target) {
        // Use abilities tactically based on game state
        for (let i = 0; i < this.abilityHand.length; i++) {
            const ability = this.abilityHand[i];
            // Offensive: Use Disservice if opponent is close to target
            if (ability.name === 'Disservice' && opponentScore >= target - 3) {
                return i;
            }
            // Use Remove if opponent just drew a good card
            if (ability.name === 'Remove' && opponentScore > myScore) {
                return i;
            }
            // Use One-Up or Two-Up if we're winning
            if ((ability.name === 'One-Up' || ability.name === 'Two-Up') && myScore > opponentScore) {
                return i;
            }
            // Use Go For abilities strategically
            if (ability.name === 'Go For 17' && myScore >= 15 && myScore < 18) {
                return i;
            }
            // Use Destroy if opponent used a beneficial ability
            if (ability.name === 'Destroy' && game.lastAbilityPlayed && game.lastAbilityPlayed.player !== this) {
                return i;
            }
            // Use Perfect Draw if we need it
            if (ability.name === 'Perfect Draw' && myScore < target - 3) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Level 5: Advanced ability strategy
     */
    advancedAbilityStrategy(game, opponent, myScore, opponentScore, target) {
        // Optimal ability usage with complex decision-making
        const machineDistance = game.machineDistanceP2;
        const needed = target - myScore;
        // Calculate urgency
        const urgency = machineDistance <= 2 ? 'high' : machineDistance <= 4 ? 'medium' : 'low';
        for (let i = 0; i < this.abilityHand.length; i++) {
            const ability = this.abilityHand[i];
            // High urgency: Survival abilities
            if (urgency === 'high') {
                if (ability.name === 'Bless')
                    return i;
                if (ability.name === 'Shield-Plus')
                    return i;
                if (ability.name === 'Shield')
                    return i;
            }
            // Strategic Go For usage
            if (ability.name === 'Go For 17' && myScore >= 15 && myScore <= 17 && opponentScore < 15) {
                return i;
            }
            if (ability.name === 'Go For 24' && myScore >= 20 && myScore <= 24 && opponentScore < 20) {
                return i;
            }
            // Perfect card selection
            if (ability.category === AbilityCategory.AddNumber && ability.value) {
                if (ability.value === needed) {
                    return i; // Exact card we need
                }
            }
            // Aggressive plays when winning
            if (myScore > opponentScore) {
                if (ability.name === 'Disservice')
                    return i;
                if (ability.name === 'Two-Up')
                    return i;
                if (ability.name === 'Remove')
                    return i;
            }
            // Comeback plays when losing
            if (opponentScore > myScore + 3) {
                if (ability.name === 'Perfect Draw' && needed > 0)
                    return i;
                if (ability.name === 'Refresh')
                    return i;
                if (ability.name === 'Exchange')
                    return i;
            }
            // Nullify opponent advantages
            if (ability.name === 'Destroy' && game.lastAbilityPlayed) {
                const lastAbility = game.lastAbilityPlayed.ability;
                if (lastAbility === 'One-Up' || lastAbility === 'Two-Up' || lastAbility.startsWith('Go For')) {
                    return i;
                }
            }
            // Safe improvement
            if (ability.name === 'Perfect Draw' && needed >= 4) {
                return i;
            }
        }
        return -1;
    }
}
