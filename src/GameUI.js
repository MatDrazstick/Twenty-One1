// src/GameUI.ts
// Canvas rendering and input handling for the Twenty-One game.
// Works from a live Game instance (singleplayer / local AI mode).
export class GameUI {
    canvas;
    ctx;
    game;
    localPlayerIndex;
    // Ability sidebar state
    showAbilityMenu = false;
    hoveredAbilityIndex = -1;
    tooltipAbility = null;
    tooltipX = 0;
    tooltipY = 0;
    // Ability flash notification
    abilityFlashText = '';
    abilityFlashEnd = 0;
    lastSeenAbilityKey = '';
    // Smooth machine indicator position (lerp toward actual position)
    displayedMachinePos = 6;
    // Table layout bounds – updated each draw() call
    tblL = 0;
    tblR = 0;
    tblT = 0;
    tblB = 0;
    animFrameId = null;
    boundResize;
    constructor(canvas, game, localPlayerIndex = 0) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context)
            throw new Error('Could not get 2D canvas context');
        this.ctx = context;
        this.game = game;
        this.localPlayerIndex = localPlayerIndex;
        this.displayedMachinePos = game.machinePosition;
        this.boundResize = () => this.resizeCanvas();
        window.addEventListener('resize', this.boundResize);
        this.resizeCanvas();
        this.setupEventListeners();
        this.startRenderLoop();
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    setupEventListeners() {
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
            if (this.game.currentPlayerIndex === this.localPlayerIndex && !this.game.gameOver) {
                await this.game.playerDraws();
            }
        });
        this.canvas.addEventListener('contextmenu', async (e) => {
            e.preventDefault();
            if (this.game.currentPlayerIndex === this.localPlayerIndex && !this.game.gameOver) {
                await this.game.playerStays();
            }
        });
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.showAbilityMenu) {
                const idx = this.getHoveredAbilityIndex(e.clientX, e.clientY);
                this.hoveredAbilityIndex = idx;
                if (idx >= 0) {
                    this.tooltipAbility = this.game.players[this.localPlayerIndex].abilityHand[idx] ?? null;
                    this.tooltipX = e.clientX;
                    this.tooltipY = e.clientY;
                }
                else {
                    this.tooltipAbility = null;
                }
            }
            else {
                this.hoveredAbilityIndex = -1;
                this.tooltipAbility = null;
            }
        });
    }
    // ── Ability sidebar ──────────────────────────────────────────────────────────
    abilityCardBounds(i) {
        const sw = 300;
        return { x: this.canvas.width - sw + 15, y: 100 + i * 85, w: sw - 30, h: 70 };
    }
    getHoveredAbilityIndex(mx, my) {
        const hand = this.game.players[this.localPlayerIndex].abilityHand;
        for (let i = 0; i < hand.length; i++) {
            const b = this.abilityCardBounds(i);
            if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h)
                return i;
        }
        return -1;
    }
    // ── Render loop ─────────────────────────────────────────────────────────────
    startRenderLoop() {
        const loop = () => { this.draw(); this.animFrameId = requestAnimationFrame(loop); };
        this.animFrameId = requestAnimationFrame(loop);
    }
    destroy() {
        if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        window.removeEventListener('resize', this.boundResize);
    }
    // ── Drawing helpers ──────────────────────────────────────────────────────────
    /** Dark bordered table surface – three implicit zones separated by faint lines. */
    drawTableSurface() {
        const ctx = this.ctx;
        const { tblL, tblT, tblR, tblB } = this;
        const w = tblR - tblL;
        const h = tblB - tblT;
        // Table body
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(tblL, tblT, w, h);
        // Outer border
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.strokeRect(tblL, tblT, w, h);
        // Center divider (separates opponent side from player side)
        const midY = tblT + h / 2;
        ctx.strokeStyle = '#1e1e1e';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.moveTo(tblL + 20, midY);
        ctx.lineTo(tblR - 20, midY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    /** Single playing card. */
    drawCard(x, y, value, faceup, isOwner) {
        const ctx = this.ctx;
        const W = 80, H = 110;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.fillStyle = faceup ? '#e3e3e3' : (isOwner ? '#d4d4d4' : '#1a1a1a');
        ctx.fillRect(x, y, W, H);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, W, H);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (faceup) {
            ctx.font = 'bold 40px "Times New Roman"';
            ctx.fillStyle = '#000';
            ctx.fillText(value.toString(), x + W / 2, y + H / 2);
            // Scuff-mark detail
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = 'rgba(0,0,0,0.18)';
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + 22, y + 32);
            ctx.stroke();
        }
        else if (isOwner) {
            ctx.font = 'bold 38px "Times New Roman"';
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.fillText(value.toString(), x + W / 2, y + H / 2);
            ctx.font = '10px Courier';
            ctx.fillStyle = '#555';
            ctx.fillText('(HIDDEN)', x + W / 2, y + H - 14);
        }
        else {
            ctx.font = 'bold 36px "Times New Roman"';
            ctx.fillStyle = '#444';
            ctx.fillText('?', x + W / 2, y + H / 2);
        }
    }
    drawPlayerCards(playerIndex, cardsY, isLocal) {
        const cards = this.game.players[playerIndex].hand;
        const spacing = 88;
        const cx = this.tblL + (this.tblR - this.tblL) / 2;
        const startX = cx - (cards.length * spacing) / 2;
        cards.forEach((c, i) => this.drawCard(startX + i * spacing, cardsY, c.values, c.faceup, isLocal));
    }
    /** Score display. Local = large italic; Opponent = compact with "?" for hidden. */
    drawScore(playerIndex, x, y, isLocal) {
        const ctx = this.ctx;
        const player = this.game.players[playerIndex];
        ctx.textBaseline = 'middle';
        if (isLocal) {
            ctx.font = 'italic bold 62px "Times New Roman"';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText(`${player.calculateTotalScore()}/21`, x, y);
        }
        else {
            const vis = player.calculateVisibleScore();
            const hasFD = player.faceDownCard !== null && !player.faceDownCard.faceup;
            ctx.font = 'italic 30px "Times New Roman"';
            ctx.fillStyle = '#bbb';
            ctx.textAlign = 'left';
            ctx.fillText(hasFD ? `?+${vis}/21` : `${vis}/21`, x, y);
        }
    }
    /**
     * Left-side machine distance box (always visible).
     * Shows P2 DIST / MOVE / P1 DIST based on current machinePosition.
     *
     *  Position 0 = P1 zone, 12 = P2 zone. Machine starts at 6.
     *  P1 DIST = distance machine must still travel to reach P1 = machinePosition
     *  P2 DIST = distance machine must still travel to reach P2 = 12 - machinePosition
     */
    drawMachineBox() {
        const ctx = this.ctx;
        const bx = 10, bw = 148;
        const H = this.canvas.height;
        const by = H * 0.38, bh = 168;
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
        const p1Dist = this.game.machinePosition;
        const p2Dist = 12 - this.game.machinePosition;
        const move = this.game.moveDistance;
        const drawRow = (label, val, ry) => {
            ctx.font = '10px Courier';
            ctx.fillStyle = '#555';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(label, bx + 12, ry);
            ctx.font = 'bold 26px Courier';
            ctx.fillStyle = '#fff';
            ctx.fillText(val.toString(), bx + 12, ry + 14);
        };
        const sep = (sy) => {
            ctx.strokeStyle = '#1e1e1e';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx + 10, sy);
            ctx.lineTo(bx + bw - 10, sy);
            ctx.stroke();
        };
        drawRow('P2 DIST', p2Dist, by + 10);
        sep(by + 58);
        drawRow('MOVE', move, by + 66);
        sep(by + 114);
        drawRow('P1 DIST', p1Dist, by + 122);
    }
    /** Machine track – shown in the table center during and after the reveal phase. */
    drawMachineTrack() {
        const ctx = this.ctx;
        const { tblL, tblR, tblT, tblB } = this;
        const centerY = (tblT + tblB) / 2;
        const trackW = Math.min(340, (tblR - tblL) * 0.55);
        const trackX = tblL + (tblR - tblL) / 2 - trackW / 2;
        const trackH = 8;
        // Smooth lerp
        this.displayedMachinePos += (this.game.machinePosition - this.displayedMachinePos) * 0.06;
        // Track
        ctx.fillStyle = '#151515';
        ctx.fillRect(trackX, centerY - trackH / 2, trackW, trackH);
        ctx.strokeStyle = '#2e2e2e';
        ctx.lineWidth = 1;
        ctx.strokeRect(trackX, centerY - trackH / 2, trackW, trackH);
        // Notch marks
        ctx.strokeStyle = '#2a2a2a';
        for (let i = 0; i <= 12; i++) {
            const nx = trackX + (i / 12) * trackW;
            ctx.beginPath();
            ctx.moveTo(nx, centerY - 9);
            ctx.lineTo(nx, centerY + 9);
            ctx.stroke();
        }
        // Glowing indicator
        const ix = trackX + (this.displayedMachinePos / 12) * trackW;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#0f0';
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(ix, centerY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // "THE MACHINE" label
        ctx.font = '9px Courier';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('THE MACHINE', tblL + (tblR - tblL) / 2, centerY - 14);
    }
    drawTimer() {
        const rem = this.game.getTurnTimeRemaining();
        if (rem <= 0)
            return;
        const ctx = this.ctx;
        ctx.fillStyle = rem <= 10 ? '#ff4444' : '#fff';
        ctx.font = 'bold 22px Courier';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`⏱ ${rem}s`, this.canvas.width / 2, 10);
    }
    drawStatusMessage() {
        const ctx = this.ctx;
        const { game, localPlayerIndex } = this;
        if (game.revealPhase !== 'playing' && game.revealPhase !== 'round-over')
            return;
        const isLocalTurn = game.currentPlayerIndex === localPlayerIndex;
        let msg = '';
        if (game.gameOver)
            msg = `✓ Game Over! ${game.winner?.name ?? '?'} wins!`;
        else if (game.mustDraw && isLocalTurn)
            msg = '⚠ Timer expired — you must draw a card!';
        else if (game.mustStay && isLocalTurn)
            msg = '💥 Busted! Right-click to Stay.';
        else if (isLocalTurn)
            msg = '▶ Your turn — L-click Draw, R-click Stay';
        else
            msg = `⏳ ${game.players[1 - localPlayerIndex].name}'s turn…`;
        ctx.font = '14px Courier';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        const mw = ctx.measureText(msg).width + 28;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(this.canvas.width / 2 - mw / 2, 38, mw, 26);
        ctx.fillStyle = '#fff';
        ctx.fillText(msg, this.canvas.width / 2, 44);
    }
    drawRoundInfo() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '11px Courier';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`ROUND ${this.game.roundNumber}  TARGET ${this.game.targetNumber}  MOVE ${this.game.moveDistance}`, this.canvas.width - 12, 10);
    }
    drawControls() {
        const ctx = this.ctx;
        const x = this.tblL + 10;
        const y = this.tblB + 10;
        ctx.font = '12px Courier';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('[L-Click] Draw   [R-Click] Stay   [Space] Abilities', x, y);
    }
    /** Center overlay shown during the both-stayed / reveal / machine-move sequence. */
    drawRevealOverlay() {
        const phase = this.game.revealPhase;
        if (phase === 'playing' || phase === 'round-over')
            return;
        const msgs = {
            'both-stayed': 'Both players have stayed — cards are about to be revealed',
            'revealing': 'Revealing hidden cards…',
            'machine-moving': 'The machine moves…',
        };
        const msg = msgs[phase];
        if (!msg)
            return;
        const ctx = this.ctx;
        const W = this.canvas.width, H = this.canvas.height;
        // Dim overlay
        ctx.fillStyle = 'rgba(0,0,0,0.78)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = 'bold 26px Courier';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const mw = ctx.measureText(msg).width + 60;
        ctx.fillStyle = '#111';
        ctx.fillRect(W / 2 - mw / 2, H / 2 - 36, mw, 72);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(W / 2 - mw / 2, H / 2 - 36, mw, 72);
        ctx.fillStyle = '#fff';
        ctx.fillText(msg, W / 2, H / 2);
        // Pulsing ellipsis
        const dots = '.'.repeat((Math.floor(Date.now() / 500) % 4));
        ctx.font = '18px Courier';
        ctx.fillStyle = '#666';
        ctx.fillText(dots, W / 2, H / 2 + 26);
        // If machine is moving, show the track in the overlay
        if (phase === 'machine-moving') {
            this.drawMachineTrack();
        }
    }
    /** Centre-screen flash when an ability card is played. */
    updateAndDrawAbilityFlash() {
        const lap = this.game.lastAbilityPlayed;
        if (lap) {
            const key = `${lap.player.name}:${lap.ability}`;
            if (key !== this.lastSeenAbilityKey) {
                this.lastSeenAbilityKey = key;
                this.abilityFlashText = `${lap.player.name} used: ${lap.ability}`;
                this.abilityFlashEnd = Date.now() + 2500;
            }
        }
        if (!this.abilityFlashText || Date.now() > this.abilityFlashEnd)
            return;
        const alpha = Math.min(1, (this.abilityFlashEnd - Date.now()) / 500);
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        const cy = this.tblT + (this.tblB - this.tblT) / 2;
        ctx.font = 'bold 20px Courier';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const fw = ctx.measureText(this.abilityFlashText).width + 40;
        ctx.fillStyle = `rgba(0,0,0,${alpha * 0.9})`;
        ctx.fillRect(cx - fw / 2, cy - 26, fw, 52);
        ctx.strokeStyle = `rgba(255,200,0,${alpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - fw / 2, cy - 26, fw, 52);
        ctx.fillStyle = `rgba(255,200,0,${alpha})`;
        ctx.fillText(this.abilityFlashText, cx, cy);
    }
    /** Right-side ability sidebar (Space bar). */
    drawAbilityMenu() {
        if (!this.showAbilityMenu)
            return;
        const ctx = this.ctx;
        const sw = 300;
        const sx = this.canvas.width - sw;
        const player = this.game.players[this.localPlayerIndex];
        ctx.fillStyle = 'rgba(8,8,8,0.97)';
        ctx.fillRect(sx, 0, sw, this.canvas.height);
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, this.canvas.height);
        ctx.stroke();
        ctx.fillStyle = '#eee';
        ctx.font = 'bold 20px Courier';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TRUMP CARDS', sx + sw / 2, 46);
        if (player.abilityHand.length === 0) {
            ctx.fillStyle = '#444';
            ctx.font = '13px Courier';
            ctx.fillText('No abilities', sx + sw / 2, 160);
        }
        player.abilityHand.forEach((ability, i) => {
            const b = this.abilityCardBounds(i);
            const hov = i === this.hoveredAbilityIndex;
            ctx.fillStyle = hov ? 'rgba(255,200,0,0.1)' : '#111';
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = hov ? '#ffc107' : '#2a2a2a';
            ctx.lineWidth = hov ? 1.5 : 1;
            ctx.strokeRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px Courier';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(ability.name, b.x + 14, b.y + 9);
            ctx.fillStyle = '#666';
            ctx.font = '11px Courier';
            ctx.fillText(`[${ability.category}]`, b.x + 14, b.y + 27);
            ctx.fillStyle = '#444';
            ctx.fillText('Click to use', b.x + 14, b.y + 45);
        });
        if (this.tooltipAbility)
            this.drawTooltip(this.tooltipAbility, this.tooltipX, this.tooltipY);
    }
    drawTooltip(ability, mx, my) {
        const ctx = this.ctx;
        const maxW = 230, pad = 12, lh = 17;
        ctx.font = '12px Courier';
        const words = ability.description.split(' ');
        const lines = [];
        let line = '';
        for (const w of words) {
            const t = line ? `${line} ${w}` : w;
            if (ctx.measureText(t).width > maxW - pad * 2) {
                if (line)
                    lines.push(line);
                line = w;
            }
            else
                line = t;
        }
        if (line)
            lines.push(line);
        const th = pad * 2 + 18 + lines.length * lh;
        let tx = mx - maxW - 8;
        if (tx < 5)
            tx = mx + 8;
        let ty = my - th / 2;
        if (ty < 5)
            ty = 5;
        if (ty + th > this.canvas.height - 5)
            ty = this.canvas.height - th - 5;
        ctx.fillStyle = 'rgba(10,10,10,0.97)';
        ctx.fillRect(tx, ty, maxW, th);
        ctx.strokeStyle = '#ffc107';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, ty, maxW, th);
        ctx.fillStyle = '#ffc107';
        ctx.font = 'bold 12px Courier';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(ability.name, tx + pad, ty + pad);
        ctx.fillStyle = '#bbb';
        ctx.font = '12px Courier';
        lines.forEach((l, i) => ctx.fillText(l, tx + pad, ty + pad + 18 + i * lh));
    }
    // ── Main render ─────────────────────────────────────────────────────────────
    draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        // ── Layout constants ──────────────────────────────────────────────────────
        const BOX_W = 165; // left machine-box column width
        this.tblL = BOX_W + 8;
        this.tblR = W - 15;
        this.tblT = H * 0.06;
        this.tblB = H * 0.91;
        const { tblL, tblR, tblT, tblB } = this;
        const tblCx = tblL + (tblR - tblL) / 2;
        // 1. Dark background (no green anywhere)
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, W, H);
        // 2. Table surface with dashed center divider
        this.drawTableSurface();
        // ── Opponent zone (top half of table) ─────────────────────────────────────
        const opponentIndex = 1 - this.localPlayerIndex;
        const oppNameY = tblT + 18;
        const oppCardsY = tblT + 34;
        ctx.fillStyle = '#777';
        ctx.font = '11px Courier';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(this.game.players[opponentIndex].name.toUpperCase(), tblCx, oppNameY);
        this.drawPlayerCards(opponentIndex, oppCardsY, false);
        this.drawScore(opponentIndex, tblL + 14, tblT + 170, false);
        // ── Local player zone (bottom half of table) ──────────────────────────────
        const localCardsY = tblB - 148;
        ctx.fillStyle = '#ccc';
        ctx.font = '11px Courier';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(this.game.players[this.localPlayerIndex].name.toUpperCase(), tblCx, localCardsY - 10);
        this.drawPlayerCards(this.localPlayerIndex, localCardsY, true);
        // Large score bottom-left of table (RE7 style)
        this.drawScore(this.localPlayerIndex, tblL + 14, tblB - 28, true);
        // 3. Machine track – always in the table centre; smooth lerp indicator
        this.drawMachineTrack();
        // 4. Left machine-distance box (always visible)
        this.drawMachineBox();
        // 5. HUD overlays
        this.drawRoundInfo();
        this.drawTimer();
        this.drawStatusMessage();
        this.drawControls();
        // 6. Ability usage flash
        this.updateAndDrawAbilityFlash();
        // 7. Reveal-sequence overlay (dims screen + message)
        this.drawRevealOverlay();
        // 8. Ability sidebar (Space key)
        this.drawAbilityMenu();
    }
}
