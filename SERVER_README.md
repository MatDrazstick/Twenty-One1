# Twenty-One Online Multiplayer Server

This is the Socket.io-based online multiplayer server for the Twenty-One card game.

## Features

- **Cryptographically Secure Room Codes**: 6-8 character room codes generated using Node.js crypto module
- **Room Management**: Create and join rooms with unique codes
- **Real-time Synchronization**: All game actions (draw, stay, ability usage) are synchronized in real-time
- **Server-Authoritative**: Game state is managed on the server to prevent cheating
- **Disconnect/Reconnect Handling**: Players can reconnect to games after disconnection (60-second grace period)

## Running the Server

### Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Start the server
node src/server.js
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 node src/server.js
```

### Testing

To run the automated multiplayer tests:

```bash
npx tsc
node src/multiplayerTest.js
```

## Client Usage

Open `http://localhost:3000/multiplayer.html` in your browser to access the online multiplayer interface.

### Creating a Room

1. Enter your name
2. Click "Create Room"
3. Share the room code with your opponent

### Joining a Room

1. Enter your name
2. Enter the room code
3. Click "Join Room"

## Socket.io Events

### Client → Server

- `create-room`: Create a new room
  - Payload: `{ playerName: string, settings?: GameSettings }`
  - Response: `room-created` event with room code

- `join-room`: Join an existing room
  - Payload: `{ roomCode: string, playerName: string }`
  - Response: `room-joined` and `game-start` events

- `player-draw`: Draw a card
  - No payload
  - Response: `game-state` event with updated state

- `player-stay`: Stay with current hand
  - No payload
  - Response: `game-state` event with updated state

- `use-ability`: Use an ability card
  - Payload: `{ abilityIndex: number }`
  - Response: `game-state` event with updated state

- `reconnect-room`: Reconnect to a room after disconnection
  - Payload: `{ roomCode: string, wasHost: boolean }`
  - Response: `reconnected` event

### Server → Client

- `room-created`: Room successfully created
  - Payload: `{ roomCode: string }`

- `room-joined`: Successfully joined a room
  - Payload: `{ roomCode: string }`

- `game-start`: Game has started
  - Payload: `{ players: string[], gameState: GameState }`

- `game-state`: Updated game state
  - Payload: `GameState` (see below)

- `error`: Error occurred
  - Payload: `{ message: string }`

- `opponent-disconnected`: Opponent has disconnected
  - No payload

- `opponent-reconnected`: Opponent has reconnected
  - No payload

- `reconnected`: Successfully reconnected to a room
  - Payload: `{ roomCode: string }`

## Game State Structure

The `game-state` event sends a comprehensive game state object:

```typescript
{
  roundNumber: number,
  currentPlayerIndex: number,
  isYourTurn: boolean,
  gameOver: boolean,
  winner: string | null,
  targetNumber: number,
  betModifier: number,
  machinePosition: number,
  moveDistance: number,
  
  yourHand: Card[],
  yourScore: number,
  yourVisibleScore: number,
  yourBusted: boolean,
  yourStayed: boolean,
  yourAbilities: AbilityCard[],
  
  opponentHand: Card[],  // Only visible cards
  opponentVisibleScore: number,
  opponentBusted: boolean,
  opponentStayed: boolean,
  opponentAbilityCount: number,
  
  turnTimeRemaining: number,
  mustDraw: boolean,
  mustStay: boolean
}
```

## Security Features

- **Server-Authoritative Game Logic**: All game logic runs on the server
- **Turn Validation**: Server validates that actions are taken by the correct player
- **Cryptographically Secure Room Codes**: Uses Node.js `crypto.randomBytes()` for room code generation
- **Input Validation**: All client inputs are validated before processing

## Architecture

- **Express**: HTTP server for serving static files
- **Socket.io**: WebSocket communication for real-time updates
- **TypeScript**: Type-safe server implementation
- **Game Integration**: Uses existing Twenty-One game logic from `Game.ts`
