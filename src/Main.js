// src/Main.ts
// Entry point for the Twenty-One game browser UI.
// Handles Main Menu → Game Settings → Game loop.
import { Game } from './Game.js';
import { GameUI } from './GameUI.js';
// ─── State ────────────────────────────────────────────────────────────────────
let currentGame = null;
let currentUI = null;
// ─── DOM references ───────────────────────────────────────────────────────────
const mainMenuEl = document.getElementById('main-menu');
const settingsEl = document.getElementById('settings-screen');
const gameScreenEl = document.getElementById('game-screen');
const canvas = document.getElementById('gameCanvas');
// Settings fields
const playerNameInput = document.getElementById('player-name');
const timerSelect = document.getElementById('timer-select');
const moveModeSelect = document.getElementById('move-mode-select');
const firstPlayerSelect = document.getElementById('first-player-select');
const settingsTitle = document.getElementById('settings-title');
// ─── Screen transitions ───────────────────────────────────────────────────────
function showMainMenu() {
    mainMenuEl.style.display = 'flex';
    settingsEl.style.display = 'none';
    gameScreenEl.style.display = 'none';
}
function showSettings() {
    mainMenuEl.style.display = 'none';
    settingsEl.style.display = 'flex';
    gameScreenEl.style.display = 'none';
    settingsTitle.textContent = 'Singleplayer Settings';
}
function showGame() {
    mainMenuEl.style.display = 'none';
    settingsEl.style.display = 'none';
    gameScreenEl.style.display = 'block';
}
// ─── Button wiring ────────────────────────────────────────────────────────────
document.getElementById('btn-singleplayer').addEventListener('click', () => {
    showSettings();
});
// Online multiplayer goes straight to the socket.io page
document.getElementById('btn-multiplayer').addEventListener('click', () => {
    window.location.href = 'multiplayer.html';
});
document.getElementById('btn-back').addEventListener('click', () => {
    showMainMenu();
});
document.getElementById('btn-start-game').addEventListener('click', () => {
    startGame().catch(console.error);
});
// ─── Game lifecycle ───────────────────────────────────────────────────────────
async function startGame() {
    // Collect settings from the form
    const p1Name = playerNameInput.value.trim() || 'Player 1';
    const timerVal = parseInt(timerSelect.value, 10);
    const moveMode = moveModeSelect.value;
    const firstPl = firstPlayerSelect.value;
    const settings = {
        timerSeconds: timerVal,
        moveDistanceMode: moveMode,
        firstPlayer: firstPl,
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
async function runAILoop(game) {
    const POLL_MS = 150;
    while (!game.gameOver) {
        // Player index 1 is always the AI in singleplayer
        if (game.currentPlayerIndex === 1 && !game.gameOver) {
            await game.executeAITurn();
        }
        await delay(POLL_MS);
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// ─── Boot ─────────────────────────────────────────────────────────────────────
showMainMenu();
