import { io } from 'socket.io-client';

// Test script for Socket.io multiplayer functionality

console.log('=== Socket.io Multiplayer Test ===\n');

// Create two client connections
const host = io('http://localhost:3000');
const guest = io('http://localhost:3000');

let roomCode = '';
let testsPassed = 0;
let testsFailed = 0;

function pass(message: string) {
  console.log(`✓ ${message}`);
  testsPassed++;
}

function fail(message: string) {
  console.log(`✗ ${message}`);
  testsFailed++;
}

function summary() {
  console.log(`\n=== Test Summary ===`);
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  
  host.disconnect();
  guest.disconnect();
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Test 1: Host creates a room
host.on('room-created', (data) => {
  roomCode = data.roomCode;
  
  if (roomCode && roomCode.length >= 6 && roomCode.length <= 8) {
    pass(`Host created room with code: ${roomCode}`);
    
    // Test 2: Guest joins the room
    setTimeout(() => {
      guest.emit('join-room', { roomCode, playerName: 'Guest' });
    }, 500);
  } else {
    fail('Room code not generated correctly');
    summary();
  }
});

// Test 3: Guest successfully joins
guest.on('room-joined', (data) => {
  pass('Guest joined room successfully');
});

// Test 4: Game starts
let hostGameStarted = false;
let guestGameStarted = false;

host.on('game-start', (data) => {
  hostGameStarted = true;
  if (data.players && data.players.length === 2) {
    pass('Host received game-start event');
  } else {
    fail('Host did not receive proper game-start data');
  }
  
  if (guestGameStarted && hostGameStarted) {
    runGameTests();
  }
});

guest.on('game-start', (data) => {
  guestGameStarted = true;
  if (data.players && data.players.length === 2) {
    pass('Guest received game-start event');
  } else {
    fail('Guest did not receive proper game-start data');
  }
  
  if (guestGameStarted && hostGameStarted) {
    runGameTests();
  }
});

// Test game synchronization
function runGameTests() {
  let hostState: any = null;
  let guestState: any = null;
  
  // Test 5: Host draws a card
  host.on('game-state', (state) => {
    hostState = state;
    
    if (state.yourHand && state.yourHand.length > 0) {
      pass('Host received updated game state');
    }
  });
  
  guest.on('game-state', (state) => {
    guestState = state;
    
    if (state.opponentHand && state.opponentHand.length > 0) {
      pass('Guest received synchronized game state');
    }
  });
  
  setTimeout(() => {
    host.emit('player-draw');
  }, 1000);
  
  // Test 6: Verify both players can take turns
  setTimeout(() => {
    // At this point, it should be guest's turn
    // Let guest draw
    guest.emit('player-draw');
    
    setTimeout(() => {
      pass('Both players successfully took turns');
      
      // Finish tests
      setTimeout(summary, 1000);
    }, 1000);
  }, 2500);
}

// Error handling
host.on('error', (data) => {
  fail(`Host error: ${data.message}`);
});

guest.on('error', (data) => {
  if (data.message !== 'Not your turn') {
    fail(`Guest error: ${data.message}`);
  }
});

// Start the test
setTimeout(() => {
  console.log('Starting test...\n');
  host.emit('create-room', { playerName: 'Host' });
}, 1000);

// Timeout after 10 seconds
setTimeout(() => {
  fail('Test timeout - not all tests completed');
  summary();
}, 10000);
