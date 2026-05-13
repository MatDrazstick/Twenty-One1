# Twenty-One Game - Code History and Changes

Repository: thakhan29m-tech/Twenty-One
Documentation Date: February 13, 2026 (Updated: March 17, 2026)
Purpose: Documents all code changes, additions, bug fixes, and test results across the major pull requests

---

## Table of Contents
1. Overview
2. PR #2: Single Player and Multiplayer Modes
3. PR #3: Ability Card System
4. PR #5: Configurable Game Settings
5. PR #7: Socket.io Online Multiplayer
6. Bug Fixes Summary
7. Testing Summary

---

## Overview

The Twenty-One game evolved through 4 major pull requests that added substantial features:

| PR # | Title | Files Changed | Lines Added | Lines Removed | Merged Date |
|------|-------|---------------|-------------|---------------|-------------|
| #2 | Single Player and Multiplayer Modes | 156 | +57,886 | -84 | Jan 17, 2026 |
| #3 | Ability Card System | 22 | +3,426 | -73 | Jan 27, 2026 |
| #5 | Configurable Game Settings | 18 | +2,261 | -8 | Feb 3, 2026 |
| #7 | Socket.io Online Multiplayer | 882 | +120,045 | -219 | Feb 13, 2026 |

---

## PR #2: Single Player and Multiplayer Modes

Branch: copilot/add-single-multiplayer-modes
Merged: January 17, 2026
Purpose: Add AI opponents with 5 difficulty levels and explicit multiplayer mode support

### New Files Added

#### 1. src/AIPlayer.ts (NEW)
Purpose: AI opponent with 5 difficulty levels

Key Features:
- Extends Player class
- 5 difficulty levels with distinct strategies
- Decision-making based on game state

Code Implementation:

```typescript
export class AIPlayer extends Player {
  private difficulty: number; // 1-5

  constructor(name: string, difficulty: number) {
    super(name);
    this.difficulty = Math.max(1, Math.min(5, difficulty));
  }

  // Main decision method
  public shouldDraw(game: Game, opponent: Player): boolean {
    switch (this.difficulty) {
      case 1: return this.randomStrategy();
      case 2: return this.basicStrategy();
      case 3: return this.conservativeStrategy();
      case 4: return this.smartStrategy(game, opponent);
      case 5: return this.advancedStrategy(game, opponent);
      default: return this.basicStrategy();
    }
  }

  // Level 1: Random (50/50)
  private randomStrategy(): boolean {
    return Math.random() > 0.5;
  }

  // Level 2: Basic Blackjack rules
  private basicStrategy(): boolean {
    return this.calculateScore() < 17;
  }

  // Level 3: Conservative approach
  private conservativeStrategy(): boolean {
    return this.calculateScore() < 15;
  }

  // Level 4: Context-aware
  private smartStrategy(game: Game, opponent: Player): boolean {
    const myScore = this.calculateScore();
    const opponentVisibleScore = opponent.calculateVisibleScore();
    
    if (myScore < 12) return true;
    if (myScore >= 19) return false;
    if (myScore < opponentVisibleScore) return true;
    return myScore < 17;
  }

  // Level 5: Probabilistic analysis
  private advancedStrategy(game: Game, opponent: Player): boolean {
    const myScore = this.calculateScore();
    const bustProbability = this.calculateBustProbability(myScore, game.deck);
    const opponentScore = opponent.calculateVisibleScore();
    
    if (bustProbability > 0.6) return false;
    if (myScore < opponentScore && bustProbability < 0.4) return true;
    return myScore < 17;
  }
}
```

AI Strategy Matrix:

| Scenario | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|----------|---------|---------|---------|---------|----------|
| Score < 12 | Random | Draw | Draw | Draw | Draw |
| Score 12-14 | Random | Draw | Draw | Draw | Risk-based |
| Score 15-16 | Random | Draw | Stay | Context | Probability |
| Score 17+ | Random | Stay | Stay | Stay | Stay |
| Behind opponent | Random | Draw | Draw | Draw | Aggressive |
| Ahead of opponent | Random | Stay | Stay | Stay | Conservative |

#### 2. src/testUtils.ts (NEW)
Purpose: Utilities for creating test scenarios

```typescript
export function createCardsForScore(targetScore: number): Card[] {
  const cards: Card[] = [];
  let remaining = targetScore;
  
  while (remaining > 0) {
    const value = Math.min(remaining, 11);
    cards.push(new Card(1, 'Hearts')); // Create appropriate card
    remaining -= value;
  }
  
  return cards;
}

export function createTestCard(value: number, suit: string = 'Hearts'): Card {
  return new Card(value, suit);
}
```

### Files Modified

#### src/Game.ts - Constructor Overload
BEFORE:
```typescript
export class Game {
  constructor(player1Name: string, player2Name: string) {
    this.players = [
      new Player(player1Name),
      new Player(player2Name)
    ];
    this.mode = 'multiplayer';
  }
}
```

AFTER:
```typescript
export class Game {
  private mode: 'singleplayer' | 'multiplayer';
  
  // New overloaded constructor
  constructor(player1Name: string, modeOrPlayer2: string, aiDifficulty?: number) {
    if (modeOrPlayer2 === 'singleplayer') {
      // Single player mode
      this.mode = 'singleplayer';
      const difficulty = aiDifficulty || 3;
      this.players = [
        new Player(player1Name),
        new AIPlayer('AI', difficulty)
      ];
    } else if (modeOrPlayer2 === 'multiplayer') {
      // Explicit multiplayer mode
      this.mode = 'multiplayer';
      this.players = [
        new Player(player1Name),
        new Player('Player 2')
      ];
    } else {
      // Backward compatible: treat as player2 name
      this.mode = 'multiplayer';
      this.players = [
        new Player(player1Name),
        new Player(modeOrPlayer2)
      ];
    }
  }
}
```

Reason for Change: Enable both single-player (vs AI) and multiplayer modes while maintaining backward compatibility
