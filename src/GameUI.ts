// src/GameUI.ts
// Handles all canvas-based rendering and user input for the Twenty-One game.
// Uses the Game class from Game.ts as its state source.

import { Game } from './Game.js';
import { AbilityCard } from './AbilityCard.js';

export class GameUI {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private game: Game;
  private showAbilityMenu: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private hoveredAbilityIndex: number = -1;
  private animFrameId: number | null = null;
  private localPlayerIndex: number;

  // Tooltip state
  private tooltipAbility: AbilityCard | null = null;
  private tooltipX: number = 0;
  private tooltipY: number = 0;

  // Bound resize handler so it can be removed later
  private boundResize: () => void;

  constructor(canvas: HTMLCanvasElement, game: Game, localPlayerIndex: number = 0) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.game = game;
    this.localPlayerIndex = localPlayerIndex;

    this.boundResize = () => this.resizeCanvas();
    window.addEventListener('resize', this.boundResize);
    this.resizeCanvas();

    this.setupEventListeners();
    this.startRenderLoop();
  }

  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.showAbilityMenu = !this.showAbilityMenu;
      }
    });

    this.canvas.addEventListener('click', async (e) => {
      if (this.showAbilityMenu) {
        const idx = this.getHoveredAbilityIndex(e.clientX, e.clientY);
        if (idx >= 0) {
          await this.game.useAbility(idx);
          return;
        }
      }
      const isLocalTurn = this.game.currentPlayerIndex === this.localPlayerIndex;
      if (isLocalTurn && !this.game.gameOver) {
        await this.game.playerDraws();
      }
    });

    this.canvas.addEventListener('contextmenu', async (e) => {
      e.preventDefault();
      const isLocalTurn = this.game.currentPlayerIndex === this.localPlayerIndex;
      if (isLocalTurn && !this.game.gameOver) {
        await this.game.playerStays();
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (this.showAbilityMenu) {
        const idx = this.getHoveredAbilityIndex(e.clientX, e.clientY);
        this.hoveredAbilityIndex = idx;
        if (idx >= 0) {
          const player = this.game.players[this.localPlayerIndex];
          this.tooltipAbility = player.abilityHand[idx] ?? null;
          this.tooltipX = e.clientX;
          this.tooltipY = e.clientY;
        } else {
          this.tooltipAbility = null;
        }
      } else {
        this.hoveredAbilityIndex = -1;
        this.tooltipAbility = null;
      }
    });
  }

  private getAbilityCardBounds(index: number): { x: number; y: number; w: number; h: number } {
    const sidebarW = 300;
    const x = this.canvas.width - sidebarW;
    const cardY = 100 + index * 85;
    return { x: x + 15, y: cardY, w: sidebarW - 30, h: 70 };
  }

  private getHoveredAbilityIndex(mx: number, my: number): number {
    const player = this.game.players[this.localPlayerIndex];
    for (let i = 0; i < player.abilityHand.length; i++) {
      const b = this.getAbilityCardBounds(i);
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        return i;
      }
    }
    return -1;
  }

  private startRenderLoop(): void {
    const loop = () => {
      this.draw();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this.boundResize);
  }

  // ─── Drawing helpers ───────────────────────────────────────────────────────

  /** Draw the green felt table surface in the lower portion of the screen */
  private drawTable(): void {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const tableTop = H * 0.52;

    // Felt surface gradient
    const feltGrad = ctx.createLinearGradient(W / 2, tableTop, W / 2, H);
    feltGrad.addColorStop(0,   '#1d4a21'); // darker far edge
    feltGrad.addColorStop(0.4, '#2a5e2e'); // main felt green
    feltGrad.addColorStop(1,   '#162e18'); // darker near edge
    ctx.fillStyle = feltGrad;
    ctx.fillRect(0, tableTop, W, H - tableTop);

    // Subtle felt texture (noise lines)
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let y = tableTop; y < H; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Table edge — bright top border
    ctx.strokeStyle = '#4a7a4e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, tableTop);
    ctx.lineTo(W, tableTop);
    ctx.stroke();

    // Inner shadow on table edge
    const edgeShadow = ctx.createLinearGradient(0, tableTop, 0, tableTop + 18);
    edgeShadow.addColorStop(0, 'rgba(0,0,0,0.45)');
    edgeShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = edgeShadow;
    ctx.fillRect(0, tableTop, W, 18);
  }

  private drawCard(x: number, y: number, value: number, isFaceUp: boolean, isOwner: boolean): void {
    const ctx = this.ctx;
    const w = 80;
    const h = 110;

    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';

    if (isFaceUp) {
      ctx.fillStyle = '#e3e3e3';
    } else {
      ctx.fillStyle = isOwner ? '#d4d4d4' : '#1a1a1a';
    }
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 40px "Times New Roman"';

    if (isFaceUp) {
      ctx.fillStyle = '#000';
      ctx.fillText(value.toString(), x + w / 2, y + h / 2);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 10);
      ctx.lineTo(x + 20, y + 30);
      ctx.stroke();
    } else {
      if (isOwner) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillText(value.toString(), x + w / 2, y + h / 2);
        ctx.font = '12px Courier';
        ctx.fillStyle = '#555';
        ctx.fillText('(HIDDEN)', x + w / 2, y + h - 15);
      } else {
        ctx.fillStyle = '#555';
        ctx.fillText('?', x + w / 2, y + h / 2);
      }
    }
  }

  private drawPlayerCards(playerIndex: number, cardsY: number, isLocal: boolean): void {
    const player = this.game.players[playerIndex];
    const cards = player.hand;
    const cardSpacing = 90;
    const startX = this.canvas.width / 2 - (cards.length * cardSpacing) / 2;

    cards.forEach((card, i) => {
      this.drawCard(startX + i * cardSpacing, cardsY, card.values, card.faceup, isLocal);
    });
  }

  /**
   * Score display — RE7 style:
   *  Local player:  large italic "16/21" bottom-left
   *  Opponent:      smaller "?+6/21" near opponent cards
   */
  private drawScore(playerIndex: number, x: number, y: number, isLocal: boolean): void {
    const ctx = this.ctx;
    const player = this.game.players[playerIndex];
    ctx.textBaseline = 'middle';

    if (isLocal) {
      const total = player.calculateTotalScore();
      ctx.fillStyle = '#fff';
      ctx.font = 'italic bold 64px "Times New Roman"';
      ctx.textAlign = 'left';
      ctx.fillText(`${total}/21`, x, y);
    } else {
      const visible = player.calculateVisibleScore();
      const hasFaceDown = player.faceDownCard !== null && !player.faceDownCard.faceup;
      const text = hasFaceDown ? `?+${visible}/21` : `${visible}/21`;

      ctx.fillStyle = '#ccc';
      ctx.font = 'italic 32px "Times New Roman"';
      ctx.textAlign = 'left';
      ctx.fillText(text, x, y);
    }
  }

  /**
   * Machine track (green light indicator).
   * Hidden during card-playing phase; shown when the game is over.
   */
  private drawMachine(centerY: number, visible: boolean): void {
    if (!visible) return;

    const ctx = this.ctx;
    const trackWidth = Math.min(400, this.canvas.width * 0.5);
    const trackHeight = 10;
    const trackX = this.canvas.width / 2 - trackWidth / 2;

    ctx.fillStyle = '#111';
    ctx.fillRect(trackX, centerY - trackHeight / 2, trackWidth, trackHeight);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(trackX, centerY - trackHeight / 2, trackWidth, trackHeight);

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 12; i++) {
      const nx = trackX + (i / 12) * trackWidth;
      ctx.beginPath();
      ctx.moveTo(nx, centerY - 10);
      ctx.lineTo(nx, centerY + 10);
      ctx.stroke();
    }

    const pos = this.game.machinePosition;
    const indicatorX = trackX + (pos / 12) * trackWidth;

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ff00';
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.arc(indicatorX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(indicatorX, centerY - 20);
    ctx.lineTo(indicatorX, 0);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Courier';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('THE MACHINE', this.canvas.width / 2, centerY - 22);

    const distP1 = pos;
    const distP2 = 12 - pos;
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Courier';
    ctx.textAlign = 'left';
    ctx.fillText(`← ${distP1} from ${this.game.players[0].name}`, trackX, centerY - 32);
    ctx.textAlign = 'right';
    ctx.fillText(`${distP2} from ${this.game.players[1].name} →`, trackX + trackWidth, centerY - 32);
  }

  private drawControls(): void {
    const ctx = this.ctx;
    const x = 20;
    const bottomY = this.canvas.height - 20;

    ctx.textAlign = 'left';
    ctx.font = '14px Courier';

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x - 10, bottomY - 95, 235, 100);

    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('[L-Click]  Draw Card', x, bottomY - 65);
    ctx.fillText('[R-Click]  Stay', x, bottomY - 40);
    ctx.fillText('[Space]    Abilities', x, bottomY - 15);
  }

  private drawTimer(): void {
    const remaining = this.game.getTurnTimeRemaining();
    if (remaining <= 0) return;

    const ctx = this.ctx;
    ctx.fillStyle = remaining <= 10 ? '#ff4444' : '#ffffff';
    ctx.font = 'bold 24px Courier';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`⏱ ${remaining}s`, this.canvas.width / 2, 10);
  }

  private drawStatusMessage(): void {
    const ctx = this.ctx;
    const game = this.game;
    let msg = '';
    const isLocalTurn = game.currentPlayerIndex === this.localPlayerIndex;

    if (game.gameOver) {
      msg = `✓ Game Over! ${game.winner?.name ?? '?'} wins!`;
    } else if (game.mustDraw && isLocalTurn) {
      msg = '⚠ Timer expired — you must draw a card!';
    } else if (game.mustStay && isLocalTurn) {
      // Only show bust prompt when it is the LOCAL player who must acknowledge their bust
      msg = '💥 Busted! Right-click to Stay.';
    } else if (isLocalTurn) {
      msg = '▶ Your turn — L-click Draw, R-click Stay';
    } else {
      const opp = game.players[1 - this.localPlayerIndex];
      msg = `⏳ ${opp.name}'s turn…`;
    }

    ctx.font = '15px Courier';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    const msgW = ctx.measureText(msg).width + 30;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(this.canvas.width / 2 - msgW / 2, 40, msgW, 28);
    ctx.fillStyle = '#fff';
    ctx.fillText(msg, this.canvas.width / 2, 48);
  }

  private drawAbilityMenu(): void {
    if (!this.showAbilityMenu) return;

    const ctx = this.ctx;
    const sidebarW = 300;
    const x = this.canvas.width - sidebarW;
    const player = this.game.players[this.localPlayerIndex];

    ctx.fillStyle = 'rgba(8,8,8,0.95)';
    ctx.fillRect(x, 0, sidebarW, this.canvas.height);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, this.canvas.height);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Courier';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TRUMP CARDS', x + sidebarW / 2, 50);

    player.abilityHand.forEach((ability, i) => {
      const b = this.getAbilityCardBounds(i);
      const isHovered = i === this.hoveredAbilityIndex;

      ctx.fillStyle = isHovered ? 'rgba(255,200,0,0.15)' : 'rgba(30,30,30,0.9)';
      ctx.fillRect(b.x, b.y, b.w, b.h);

      ctx.strokeStyle = isHovered ? '#ffc107' : '#555';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Courier';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(ability.name, b.x + 15, b.y + 10);

      ctx.fillStyle = '#aaa';
      ctx.font = '11px Courier';
      ctx.fillText(`[${ability.category}]`, b.x + 15, b.y + 28);

      ctx.fillStyle = '#666';
      ctx.fillText('Click to use', b.x + 15, b.y + 46);
    });

    if (player.abilityHand.length === 0) {
      ctx.fillStyle = '#555';
      ctx.font = '14px Courier';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No abilities', x + sidebarW / 2, 160);
    }

    if (this.tooltipAbility) {
      this.drawTooltip(this.tooltipAbility, this.tooltipX, this.tooltipY);
    }
  }

  private drawTooltip(ability: AbilityCard, mx: number, my: number): void {
    const ctx = this.ctx;
    const maxW = 240;
    const padding = 12;
    const lineHeight = 18;

    ctx.font = '12px Courier';

    const words = ability.description.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW - padding * 2) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);

    const tooltipH = padding * 2 + 20 + lines.length * lineHeight;

    let tx = mx - maxW - 10;
    if (tx < 5) tx = mx + 10;
    let ty = my - tooltipH / 2;
    if (ty < 5) ty = 5;
    if (ty + tooltipH > this.canvas.height - 5) ty = this.canvas.height - tooltipH - 5;

    ctx.fillStyle = 'rgba(15,15,15,0.97)';
    ctx.fillRect(tx, ty, maxW, tooltipH);
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, ty, maxW, tooltipH);

    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 13px Courier';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(ability.name, tx + padding, ty + padding);

    ctx.fillStyle = '#ccc';
    ctx.font = '12px Courier';
    lines.forEach((l, i) => {
      ctx.fillText(l, tx + padding, ty + padding + 20 + i * lineHeight);
    });
  }

  private drawRoundInfo(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '12px Courier';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`Round: ${this.game.roundNumber}  Move Dist: ${this.game.moveDistance}`, this.canvas.width - 12, 10);
  }

  // ─── Main draw call ────────────────────────────────────────────────────────

  draw(): void {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const cx = W / 2;

    // 1. Dark background (RE7 style: near-black)
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, W, H);

    // 2. Green felt table in the lower half
    this.drawTable();

    // 3. Machine track — revealed only when game is over
    const machineVisible = this.game.gameOver;
    this.drawMachine(H * 0.35, machineVisible);

    // 4. Opponent area (upper half, above the table)
    const opponentIndex = 1 - this.localPlayerIndex;
    const opponentCardsY = H * 0.18;
    this.drawPlayerCards(opponentIndex, opponentCardsY, false);

    // Opponent name label
    ctx.fillStyle = '#aaa';
    ctx.font = '13px Courier';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(this.game.players[opponentIndex].name, cx, opponentCardsY - 14);

    // Opponent score — near opponent cards, left-aligned (RE7: "?+6/21")
    this.drawScore(opponentIndex, cx - 180, opponentCardsY - 50, false);

    // 5. Local player cards — placed ON the table
    const localCardsY = H * 0.60;
    this.drawPlayerCards(this.localPlayerIndex, localCardsY, true);

    // Local player name label — above cards
    ctx.fillStyle = '#eee';
    ctx.font = '13px Courier';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(this.game.players[this.localPlayerIndex].name, cx, localCardsY - 10);

    // Local player score — large bottom-left, RE7 style ("11/21")
    this.drawScore(this.localPlayerIndex, 20, H - 120, true);

    // 6. HUD overlay
    this.drawRoundInfo();
    this.drawTimer();
    this.drawStatusMessage();
    this.drawControls();
    this.drawAbilityMenu();
  }
}

