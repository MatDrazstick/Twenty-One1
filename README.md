# Twenty-One Game

A card game implementation where two players compete to get as close to 21 as possible without going over, with a unique "kill machine" mechanic that adds strategic pressure to each round.

## Game Modes

### Single Player Mode
Play against an AI opponent with 5 difficulty levels:

- **Level 1 - Random (Very Easy)**: AI makes random decisions (50% chance to hit or stay)
- **Level 2 - Basic Strategy (Easy)**: AI stays on 17 or higher (like Blackjack dealer rules)
- **Level 3 - Conservative (Medium)**: AI stays on 15 or higher, playing more cautiously
- **Level 4 - Smart Strategy (Hard)**: AI considers opponent's visible score and takes calculated risks
- **Level 5 - Advanced Strategy (Very Hard)**: AI uses risk calculation, probability, and optimal decision-making

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
```

## AI Strategy Details

### Level 1 - Random
- Simple 50/50 random decision
- No strategy involved
- Most unpredictable

### Level 2 - Basic
- Mimics Blackjack dealer rules
- Always hits below 17
- Always stays at 17+

### Level 3 - Conservative
- More cautious than Level 2
- Hits below 15
- Stays at 15+

### Level 4 - Smart
- Considers opponent's visible score
- Takes risks when behind
- Plays conservatively when ahead
- Adapts strategy based on game state

### Level 5 - Advanced
- Calculates bust probability
- Considers remaining cards
- Uses risk-reward analysis
- Adapts to opponent's strategy
- Makes optimal decisions based on complex calculations

## Development

This game is written in TypeScript and compiles to JavaScript modules. The game supports both single-player (vs AI) and multiplayer (2 human players) modes while maintaining backward compatibility with existing code.
