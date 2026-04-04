# Twenty-One Game

A card game implementation where two players compete to get as close to 21 as possible without going over, with a unique "kill machine" mechanic that adds strategic pressure to each round, plus an **Ability Card system** that provides strategic advantages.

## Quick Links

- **[Game Documentation](README.md)** - This file
- **[Test Results](COMPREHENSIVE_TEST_RESULTS.md)** - Complete test documentation with console I/O
- **[Code History](CODE_HISTORY.md)** - Full changelog and feature history
- **[Documentation Guide](DOCUMENTATION_GUIDE.md)** - Navigate all documentation
- **[Server Setup](SERVER_README.md)** - Online multiplayer setup

## Features

### Ability Card System
Each round, players receive 2 random ability cards that can be used strategically to gain advantages. There are 24 unique abilities across 4 categories:

#### Add Number Abilities (5 cards)
- **2-Card, 3-Card, 4-Card, 6-Card, 7-Card**: Draw a specific numbered card if available in the deck

#### Deck Trump Abilities (7 cards)
- **Hush**: Draw a hidden card that your opponent can't see
- **Perfect Draw**: Draw the best available card to reach the target without busting
- **Refresh**: Return all visible cards and draw 2 new ones
- **Remove**: Remove your opponent's last drawn card
- **Return**: Return your last drawn card to the deck
- **Exchange**: Swap your last card with your opponent's last card
- **Disservice**: Force your opponent to draw a card

#### Bet Abilities (9 cards)
- **One-Up**: Increase kill machine movement by +1
- **Two-Up**: Increase kill machine movement by +2
- **Shield**: Decrease kill machine movement by -1
- **Shield-Plus**: Decrease kill machine movement by -2
- **Bless**: Avoid death once if you would lose
- **Bloodfeast**: Increase movement by +1 AND draw an ability card
- **Destroy**: Nullify opponent's most recent ability
- **Friendship**: Both players draw 2 ability cards
- **Relentless**: Destroy opponent's ability AND draw 1 ability card

#### Go For Abilities (3 cards)
- **Go For 17**: Change target number from 21 to 17
- **Go For 24**: Change target number from 21 to 24
- **Go For 27**: Change target number from 21 to 27

## Game Modes

### Online Multiplayer Mode
Play against another human player online using Socket.io! Players can create or join rooms using unique room codes and play in real-time.

See [SERVER_README.md](SERVER_README.md) for server setup and usage instructions.

### Single Player Mode
Play against an AI opponent with 5 difficulty levels:

- **Level 1 - Random (Very Easy)**: AI makes random decisions (50% chance to hit or stay, 30% chance to use abilities)
- **Level 2 - Basic Strategy (Easy)**: AI stays on 17 or higher and uses simple beneficial abilities
- **Level 3 - Conservative (Medium)**: AI stays on 15 or higher and prioritizes defensive abilities
- **Level 4 - Smart Strategy (Hard)**: AI considers opponent's visible score and uses abilities tactically
- **Level 5 - Advanced Strategy (Very Hard)**: AI uses risk calculation, probability, and optimal ability usage

### Multiplayer Mode
Traditional two-player mode where both players are human-controlled.

## Usage

### Creating a Single Player Game

```typescript
import { Game } from './Game.js';

// Create a game with AI difficulty level 3 (Medium)
const game = new Game("PlayerName", "singleplayer", 3);

// Player makes a move
game.playerDraws();  // Draw a card
// or
game.playerStays();  // Stay with current hand

// AI will automatically make its move after the player
```

### Creating a Multiplayer Game

```typescript
// Option 1: Traditional constructor (backward compatible)
const game = new Game("Player1", "Player2");

// Option 2: New constructor
const game = new Game("Player1", "multiplayer");

// Players alternate turns
game.playerDraws();  // Player 1 draws
game.playerDraws();  // Player 2 draws
game.playerStays();  // Player 1 stays
game.playerStays();  // Player 2 stays
```

## Game Rules

1. Each player starts with one face-down card and one face-up card
2. Players take turns drawing cards or staying
3. Goal: Get as close to 21 as possible without going over
4. If a player goes over 21, they bust
5. After both players stay (or bust), the round ends
6. The player closest to 21 wins the round
7. A "kill machine" moves toward the losing player each round
8. The game ends when the machine reaches a player

## Kill Machine Mechanic

- Both players start with the machine 7 spaces away
- After each round, the machine moves toward the losing player
- The move distance increases each round (1, 2, 3, ...)
- When the machine reaches a player (distance ≤ 0), that player loses the game

## Building and Running

```bash
# Compile TypeScript
npx tsc

# Run tests
node src/Test.js              # Basic card dealing test
node src/aiTest.js            # AI functionality test
node src/aiDemoTest.js        # AI difficulty demonstration
node src/aiStrategyTest.js    # AI decision-making analysis
node src/backwardCompatTest.js # Backward compatibility test
node src/abilityTest.js       # Ability card system tests (27 tests)
node src/aiAbilityDemo.js     # AI ability usage demonstration
```

## Test Documentation

See **[COMPREHENSIVE_TEST_RESULTS.md](COMPREHENSIVE_TEST_RESULTS.md)** for:
- Complete console commands for all 131+ tests
- Actual console inputs and outputs
- Test results organised by feature branch
- Analysis and explanations for each test
- Summary statistics (97.7% pass rate)

Other test documentation:
- [IterativeTests.txt](IterativeTests.txt) - Iterative test logs
- [PENETRATION_TEST_RESULTS.md](PENETRATION_TEST_RESULTS.md) - Edge case and robustness tests
- [BUGFIX.txt](BUGFIX.txt) - Bug fix verification tests

## AI Strategy Details

### Level 1 - Random
- Simple 50/50 random decision for cards
- 30% chance to use any random ability
- Most unpredictable

### Level 2 - Basic
- Mimics Blackjack dealer rules
- Always hits below 17
- Always stays at 17+
- Uses simple beneficial abilities (Add Number, Perfect Draw)

### Level 3 - Conservative
- More cautious than Level 2
- Hits below 15
- Stays at 15+
- Prioritizes defensive abilities (Shield, Bless, Return)

### Level 4 - Smart
- Considers opponent's visible score
- Takes risks when behind
- Plays conservatively when ahead
- Uses abilities tactically (Disservice, Remove, Destroy, Go For)
- Adapts strategy based on game state

### Level 5 - Advanced
- Calculates bust probability
- Considers remaining cards
- Uses risk-reward analysis
- Optimal ability usage based on urgency
- Strategic Go For timing
- Aggressive when winning, comeback strategies when losing
- Proactive advantage nullification

## Development

This game is written in TypeScript and compiles to JavaScript modules. The game supports both single-player (vs AI) and multiplayer (2 human players) modes while maintaining backward compatibility with existing code.

### Ability Card System Architecture

The ability card system is implemented with:
- `AbilityCard.ts`: Core ability card class with 24 unique abilities
- `AbilityDeck.ts`: Manages the deck of ability cards
- Extended `Player.ts`: Tracks ability hand and provides `useAbility()` method
- Extended `Game.ts`: Integrates abilities with game mechanics (target number, bet modifiers)
- Extended `AIPlayer.ts`: AI logic for strategic ability usage at all difficulty levels

All abilities are tested in `src/abilityTest.ts` with 27 comprehensive tests. See `Process.txt` for detailed implementation documentation.
