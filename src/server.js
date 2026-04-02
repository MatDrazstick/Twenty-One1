import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { randomBytes } from 'crypto';
import { Game } from './Game.js';
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        // NOTE: In production, replace "*" with specific allowed origins
        // Example: origin: "https://yourdomain.com"
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Serve static files
app.use(express.static('.'));
// Store active rooms
const rooms = new Map();
// Generate cryptographically secure room code (6-8 characters)
function generateRoomCode() {
    // Use cryptographically secure random for length as well
    const lengthBytes = randomBytes(1);
    const length = 6 + (lengthBytes[0] % 3); // 6-8 characters
    const bytes = randomBytes(Math.ceil(length / 2));
    return bytes.toString('hex').substring(0, length).toUpperCase();
}
// Find room by socket ID
function findRoomBySocket(socketId) {
    for (const room of rooms.values()) {
        if (room.hostSocketId === socketId || room.guestSocketId === socketId) {
            return room;
        }
    }
    return null;
}
// Get player index in game
function getPlayerIndex(room, socketId) {
    return room.hostSocketId === socketId ? 0 : 1;
}
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    // Create new room
    socket.on('create-room', (data) => {
        const roomCode = generateRoomCode();
        const room = {
            code: roomCode,
            hostSocketId: socket.id,
            guestSocketId: null,
            game: null,
            hostName: data.playerName || 'Player 1',
            guestName: null,
            settings: data.settings || {},
            disconnectTimeout: null
        };
        rooms.set(roomCode, room);
        socket.join(roomCode);
        console.log(`Room created: ${roomCode} by ${room.hostName}`);
        socket.emit('room-created', { roomCode });
    });
    // Join existing room
    socket.on('join-room', (data) => {
        const roomCode = data.roomCode.toUpperCase();
        const room = rooms.get(roomCode);
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }
        if (room.guestSocketId) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }
        room.guestSocketId = socket.id;
        room.guestName = data.playerName || 'Player 2';
        socket.join(roomCode);
        console.log(`${room.guestName} joined room: ${roomCode}`);
        // Initialize game
        room.game = new Game(room.hostName, room.guestName, room.settings);
        // Broadcast live state updates during endRound() phase transitions
        room.game.onStateChange = () => {
            if (!room.game)
                return;
            io.to(room.hostSocketId).emit('game-state', serializeGameState(room.game, 0));
            if (room.guestSocketId) {
                io.to(room.guestSocketId).emit('game-state', serializeGameState(room.game, 1));
            }
        };
        // Notify both players
        socket.emit('room-joined', { roomCode });
        io.to(roomCode).emit('game-start', {
            players: [room.hostName, room.guestName],
            gameState: serializeGameState(room.game, 0), // Send to host
        });
        // Send guest-specific state
        socket.emit('game-state', serializeGameState(room.game, 1));
    });
    // Player draws a card
    socket.on('player-draw', async () => {
        const room = findRoomBySocket(socket.id);
        if (!room || !room.game) {
            socket.emit('error', { message: 'Not in a game' });
            return;
        }
        const playerIndex = getPlayerIndex(room, socket.id);
        if (room.game.currentPlayerIndex !== playerIndex) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }
        await room.game.playerDraws();
        // Broadcast updated game state to both players
        io.to(room.hostSocketId).emit('game-state', serializeGameState(room.game, 0));
        io.to(room.guestSocketId).emit('game-state', serializeGameState(room.game, 1));
    });
    // Player stays
    socket.on('player-stay', async () => {
        const room = findRoomBySocket(socket.id);
        if (!room || !room.game) {
            socket.emit('error', { message: 'Not in a game' });
            return;
        }
        const playerIndex = getPlayerIndex(room, socket.id);
        if (room.game.currentPlayerIndex !== playerIndex) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }
        await room.game.playerStays();
        // Broadcast updated game state to both players
        io.to(room.hostSocketId).emit('game-state', serializeGameState(room.game, 0));
        io.to(room.guestSocketId).emit('game-state', serializeGameState(room.game, 1));
    });
    // Player uses ability
    socket.on('use-ability', async (data) => {
        const room = findRoomBySocket(socket.id);
        if (!room || !room.game) {
            socket.emit('error', { message: 'Not in a game' });
            return;
        }
        const playerIndex = getPlayerIndex(room, socket.id);
        if (room.game.currentPlayerIndex !== playerIndex) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }
        const currentPlayer = room.game.players[playerIndex];
        const opponent = room.game.players[1 - playerIndex];
        const success = currentPlayer.useAbility(data.abilityIndex, room.game, opponent);
        if (success) {
            // Broadcast updated game state to both players
            io.to(room.hostSocketId).emit('game-state', serializeGameState(room.game, 0));
            io.to(room.guestSocketId).emit('game-state', serializeGameState(room.game, 1));
        }
        else {
            socket.emit('error', { message: 'Failed to use ability' });
        }
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        const room = findRoomBySocket(socket.id);
        if (room) {
            // Notify the other player
            if (socket.id === room.hostSocketId) {
                if (room.guestSocketId) {
                    io.to(room.guestSocketId).emit('opponent-disconnected');
                }
            }
            else if (socket.id === room.guestSocketId) {
                io.to(room.hostSocketId).emit('opponent-disconnected');
            }
            // Clean up room after a delay to allow reconnection
            room.disconnectTimeout = setTimeout(() => {
                if (rooms.has(room.code)) {
                    rooms.delete(room.code);
                    console.log(`Room ${room.code} deleted`);
                }
            }, 60000); // 60 second grace period for reconnection
        }
    });
    // Reconnect to room
    socket.on('reconnect-room', (data) => {
        const roomCode = data.roomCode.toUpperCase();
        const room = rooms.get(roomCode);
        if (!room) {
            socket.emit('error', { message: 'Room no longer exists' });
            return;
        }
        // Cancel the disconnect timeout if it exists
        if (room.disconnectTimeout) {
            clearTimeout(room.disconnectTimeout);
            room.disconnectTimeout = null;
        }
        if (data.wasHost) {
            room.hostSocketId = socket.id;
            socket.join(roomCode);
            socket.emit('reconnected', { roomCode });
            if (room.game) {
                socket.emit('game-state', serializeGameState(room.game, 0));
            }
            console.log(`Host reconnected to room: ${roomCode}`);
        }
        else {
            room.guestSocketId = socket.id;
            socket.join(roomCode);
            socket.emit('reconnected', { roomCode });
            if (room.game) {
                socket.emit('game-state', serializeGameState(room.game, 1));
            }
            console.log(`Guest reconnected to room: ${roomCode}`);
        }
        // Notify the other player
        io.to(roomCode).emit('opponent-reconnected');
    });
});
// Serialize game state for client
function serializeGameState(game, playerIndex) {
    const player = game.players[playerIndex];
    const opponent = game.players[1 - playerIndex];
    return {
        roundNumber: game.roundNumber,
        currentPlayerIndex: game.currentPlayerIndex,
        isYourTurn: game.currentPlayerIndex === playerIndex,
        gameOver: game.gameOver,
        winner: game.winner ? game.winner.name : null,
        targetNumber: game.targetNumber,
        betModifier: game.betModifier,
        machinePosition: game.machinePosition,
        moveDistance: game.moveDistance,
        revealPhase: game.revealPhase,
        // Player names (needed by the canvas renderer)
        yourName: player.name,
        opponentName: opponent.name,
        // Last ability played (for flash notification)
        lastAbilityPlayed: game.lastAbilityPlayed
            ? { playerName: game.lastAbilityPlayed.player.name, abilityName: game.lastAbilityPlayed.ability }
            : null,
        // Your hand
        yourHand: player.hand.map(card => ({
            values: card.values,
            faceup: card.faceup
        })),
        yourScore: player.calculateTotalScore(),
        yourVisibleScore: player.calculateVisibleScore(),
        yourBusted: player.isBusted,
        yourStayed: playerIndex === 0 ? game.player1Stayed : game.player2Stayed,
        yourAbilities: player.abilityHand.map(ability => ({
            name: ability.name,
            description: ability.description,
            category: ability.category
        })),
        // Opponent hand (only visible cards)
        opponentHand: opponent.hand.map(card => ({
            values: card.values,
            faceup: card.faceup
        })),
        opponentVisibleScore: opponent.calculateVisibleScore(),
        opponentBusted: opponent.isBusted,
        opponentStayed: (1 - playerIndex) === 0 ? game.player1Stayed : game.player2Stayed,
        opponentAbilityCount: opponent.abilityHand.length,
        // Timer info
        turnTimeRemaining: game.turnTimeRemaining,
        mustDraw: game.mustDraw,
        mustStay: game.mustStay
    };
}
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
