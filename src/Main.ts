// src/Main.ts
// Entry point for the Twenty-One game browser UI.
// Handles Main Menu → Game Settings → Game loop.

import { Game, GameSettings } from './Game.js';
import { GameUI } from './GameUI.js';

// ─── State ────────────────────────────────────────────────────────────────────
let currentGame: Game | null = null;
let currentUI: GameUI | null = null;

// ─── DOM references ───────────────────────────────────────────────────────────
const mainMenuEl    = document.getElementById('main-menu')!;
const settingsEl    = document.getElementById('settings-screen')!;
const gameScreenEl  = document.getElementById('game-screen')!;
const canvas        = document.getElementById('gameCanvas') as HTMLCanvasElement;

// Settings fields
const playerNameInput  = document.getElementById('player-name')   as HTMLInputElement;
const timerSelect      = document.getElementById('timer-select')  as HTMLSelectElement;
const moveModeSelect   = document.getElementById('move-mode-select') as HTMLSelectElement;
const firstPlayerSelect= document.getElementById('first-player-select') as HTMLSelectElement;
const settingsTitle    = document.getElementById('settings-title')!;

// ─── Screen transitions ───────────────────────────────────────────────────────
function showMainMenu(): void {
  mainMenuEl.style.display   = 'flex';
  settingsEl.style.display   = 'none';
  gameScreenEl.style.display = 'none';
}

function showSettings(): void {
  mainMenuEl.style.display   = 'none';
  settingsEl.style.display   = 'flex';
  gameScreenEl.style.display = 'none';
  settingsTitle.textContent  = 'Singleplayer Settings';
}

function showGame(): void {
  mainMenuEl.style.display   = 'none';
  settingsEl.style.display   = 'none';
  gameScreenEl.style.display = 'block';
}

// ─── Button wiring ────────────────────────────────────────────────────────────
document.getElementById('btn-singleplayer')!.addEventListener('click', () => {
  showSettings();
});

// Online multiplayer goes straight to the socket.io page
document.getElementById('btn-multiplayer')!.addEventListener('click', () => {
  window.location.href = 'multiplayer.html';
});

document.getElementById('btn-back')!.addEventListener('click', () => {
  showMainMenu();
});

document.getElementById('btn-start-game')!.addEventListener('click', () => {
  startGame().catch(console.error);
});

// ─── Game lifecycle ───────────────────────────────────────────────────────────
async function startGame(): Promise<void> {
  // Collect settings from the form
  const p1Name: string    = playerNameInput.value.trim()   || 'Player 1';
  const timerVal: number  = parseInt(timerSelect.value,    10);
  const moveMode = moveModeSelect.value   as 'rise' | 'shuffle';
  const firstPl  = firstPlayerSelect.value as 'player1' | 'player2' | 'random';

  const settings: GameSettings = {
    timerSeconds:     timerVal,
    moveDistanceMode: moveMode,
    firstPlayer:      firstPl,
  };

  // Destroy any previous game/renderer
  if (currentUI) {
    currentUI.destroy();
    currentUI = null;
  }

  // Singleplayer: player vs AI (difficulty 3)
  currentGame = new Game(p1Name, 'singleplayer', 3, settings);

  showGame();

  currentUI = new GameUI(canvas, currentGame, 0);

  // Run AI decision loop in the background
  runAILoop(currentGame).catch(console.error);
}

/**
 * Singleplayer AI loop: watches for the AI's turn and executes it.
 * Runs until the game ends.
 */
async function runAILoop(game: Game): Promise<void> {
  const POLL_MS = 150;

  while (!game.gameOver) {
    // Player index 1 is always the AI in singleplayer
    if (game.currentPlayerIndex === 1 && !game.gameOver) {
      await game.executeAITurn();
    }
    await delay(POLL_MS);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
showMainMenu();
