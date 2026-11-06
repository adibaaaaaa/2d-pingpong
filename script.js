/**
 * 2D Ping Pong Arcade Game
 * Built with HTML5 Canvas and Vanilla JavaScript.
 */

// ============================================================================
// 1. SOUND MANAGER (Web Audio API - Offline & Standalone)
// ============================================================================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, gainValue = 0.15, pitchDrop = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (pitchDrop) {
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio context interruptions
    }
  }

  playPaddleHit(isPlayer2 = false) {
    const baseFreq = isPlayer2 ? 520 : 440;
    this.playTone(baseFreq, 'triangle', 0.1, 0.2);
  }

  playWallHit() {
    this.playTone(280, 'sine', 0.08, 0.14);
  }

  playScore() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [350, 440, 587].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.18);
      });
    } catch (e) {}
  }

  playCountdown(isGo = false) {
    if (!this.enabled) return;
    if (isGo) {
      this.playTone(880, 'square', 0.25, 0.15);
    } else {
      this.playTone(440, 'triangle', 0.15, 0.15);
    }
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.2, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.35);
      });
    } catch (e) {}
  }

  playClick() {
    this.playTone(600, 'sine', 0.04, 0.06);
  }
}

// ============================================================================
// 2. PARTICLE & CONFETTI ENGINE
// ============================================================================
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  createImpact(x, y, color = '#2ee59d', count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.size = Math.max(0.5, p.size * 0.96);
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  reset() {
    this.particles = [];
  }
}

class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.pieces = [];
    this.active = false;
    this.animationId = null;
    this.colors = ['#2ee59d', '#00e5ff', '#ffbe3b', '#ffffff', '#ff5e7e', '#b388ff'];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start(duration = 4500) {
    this.active = true;
    this.pieces = [];
    const count = Math.min(140, Math.floor(window.innerWidth / 9));
    for (let i = 0; i < count; i++) {
      this.pieces.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height * 0.6,
        size: Math.random() * 8 + 6,
        w: Math.random() * 12 + 6,
        h: Math.random() * 6 + 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 4 + 3.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        oscSpeed: Math.random() * 0.05 + 0.02,
        oscVal: Math.random() * Math.PI * 2
      });
    }

    const loop = () => {
      if (!this.active) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (const p of this.pieces) {
        p.x += p.vx + Math.sin(p.oscVal) * 1.5;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.oscVal += p.oscSpeed;

        if (p.y > this.canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * this.canvas.width;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.restore();
      }
      this.animationId = requestAnimationFrame(loop);
    };

    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(loop);

    setTimeout(() => {
      this.stop();
    }, duration);
  }

  stop() {
    this.active = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.pieces = [];
  }
}

// ============================================================================
// 3. CORE GAME ENGINE
// ============================================================================
class PingPongGame {
  constructor() {
    // Virtual resolution for consistent physics across screens
    this.WIDTH = 1000;
    this.HEIGHT = 600;

    // Elements
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container = document.getElementById('canvas-container');

    // Systems
    this.sound = new SoundManager();
    this.particles = new ParticleSystem();
    this.confetti = new ConfettiEngine(document.getElementById('confetti-canvas'));

    // Config & Options
    this.gameMode = 'ai'; // 'ai' | 'pvp' | 'practice'
    this.difficulty = 'medium'; // 'easy' | 'medium' | 'hard'
    this.winningScore = 10;

    // Game state
    this.state = 'MENU'; // 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    this.scoreP1 = 0;
    this.scoreP2 = 0;
    this.currentRally = 0;
    this.maxRally = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerInterval = null;

    // Ball Trail Buffer
    this.ballTrail = [];
    this.maxTrailLength = 7;

    // Entities
    this.paddleWidth = 16;
    this.paddleHeight = 100;
    this.ballRadius = 9;

    this.p1 = {
      x: 35,
      y: (this.HEIGHT - this.paddleHeight) / 2,
      w: this.paddleWidth,
      h: this.paddleHeight,
      speed: 8.5,
      vy: 0,
      score: 0
    };

    this.p2 = {
      x: this.WIDTH - 35 - this.paddleWidth,
      y: (this.HEIGHT - this.paddleHeight) / 2,
      w: this.paddleWidth,
      h: this.paddleHeight,
      speed: 8.5,
      vy: 0,
      score: 0
    };

    this.ball = {
      x: this.WIDTH / 2,
      y: this.HEIGHT / 2,
      r: this.ballRadius,
      vx: 0,
      vy: 0,
      baseSpeed: 7.5,
      speed: 7.5,
      maxSpeed: 17
    };

    // Keyboard state
    this.keys = {};

    // Touch controls state
    this.touchP1Up = false;
    this.touchP1Down = false;
    this.touchP2Up = false;
    this.touchP2Down = false;

    // Setup
    this.initEventListeners();
    this.resizeCanvas();
    this.updateMenuUI();

    // Start loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // --------------------------------------------------------------------------
  // Canvas Resolution & Responsive Scaling
  // --------------------------------------------------------------------------
  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Aspect ratio 1000 / 600 = 5 / 3 = 1.6667
    let w = rect.width;
    let h = rect.height;

    const targetRatio = this.WIDTH / this.HEIGHT;
    const currentRatio = w / h;

    if (currentRatio > targetRatio) {
      w = h * targetRatio;
    } else {
      h = w / targetRatio;
    }

    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.canvas.width = this.WIDTH * dpr;
    this.canvas.height = this.HEIGHT * dpr;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --------------------------------------------------------------------------
  // UI & Event Handlers
  // --------------------------------------------------------------------------
  initEventListeners() {
    // Window Resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.sound.init();
      this.keys[e.code] = true;

      // Pause toggle
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }

      // Escape to Menu or close modal
      if (e.code === 'Escape') {
        const modeModal = document.getElementById('mode-modal');
        if (modeModal.classList.contains('active')) {
          this.closeModeModal();
          return;
        }

        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
          this.goToMainMenu();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Main Menu Buttons
    document.getElementById('btn-play-now').addEventListener('click', () => {
      this.sound.playClick();
      this.startCountdown();
    });

    // Steppers - Game Mode
    const modes = ['ai', 'pvp', 'practice'];
    document.getElementById('btn-mode-prev').addEventListener('click', () => {
      this.sound.playClick();
      let idx = modes.indexOf(this.gameMode);
      idx = (idx - 1 + modes.length) % modes.length;
      this.setGameMode(modes[idx]);
    });

    document.getElementById('btn-mode-next').addEventListener('click', () => {
      this.sound.playClick();
      let idx = modes.indexOf(this.gameMode);
      idx = (idx + 1) % modes.length;
      this.setGameMode(modes[idx]);
    });

    document.getElementById('btn-open-mode-modal').addEventListener('click', () => {
      this.sound.playClick();
      this.openModeModal();
    });

    // Steppers - AI Difficulty
    const difficulties = ['easy', 'medium', 'hard'];
    document.getElementById('btn-diff-prev').addEventListener('click', () => {
      this.sound.playClick();
      let idx = difficulties.indexOf(this.difficulty);
      idx = (idx - 1 + difficulties.length) % difficulties.length;
      this.setDifficulty(difficulties[idx]);
    });

    document.getElementById('btn-diff-next').addEventListener('click', () => {
      this.sound.playClick();
      let idx = difficulties.indexOf(this.difficulty);
      idx = (idx + 1) % difficulties.length;
      this.setDifficulty(difficulties[idx]);
    });

    // Sound Toggle
    const soundToggle = document.getElementById('toggle-sound');
    soundToggle.addEventListener('change', (e) => {
      this.sound.enabled = e.target.checked;
      this.sound.playClick();
      document.getElementById('sound-status-text').textContent = this.sound.enabled ? 'Sound: ON' : 'Sound: OFF';
    });

    // Mode Modal Event Listeners
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      this.sound.playClick();
      this.closeModeModal();
    });

    document.getElementById('btn-modal-cancel').addEventListener('click', () => {
      this.sound.playClick();
      this.closeModeModal();
    });

    document.getElementById('btn-modal-start').addEventListener('click', () => {
      this.sound.playClick();
      this.closeModeModal();
      this.startCountdown();
    });

    document.querySelectorAll('.mode-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.sound.playClick();
        const mode = card.getAttribute('data-mode');
        this.setGameMode(mode);
      });
    });

    document.querySelectorAll('.diff-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        this.sound.playClick();
        const diff = pill.getAttribute('data-diff');
        this.setDifficulty(diff);
      });
    });

    // In-game Pause & Hint Buttons
    document.getElementById('btn-pause-toggle').addEventListener('click', () => {
      this.sound.playClick();
      if (this.state === 'PLAYING') this.pauseGame();
      else if (this.state === 'PAUSED') this.resumeGame();
    });

    document.getElementById('btn-pause-hint').addEventListener('click', () => {
      this.sound.playClick();
      if (this.state === 'PLAYING') this.pauseGame();
    });

    // Pause Modal Buttons
    document.getElementById('btn-resume').addEventListener('click', () => {
      this.sound.playClick();
      this.resumeGame();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      this.sound.playClick();
      this.restartGame();
    });

    document.getElementById('btn-menu-from-pause').addEventListener('click', () => {
      this.sound.playClick();
      this.goToMainMenu();
    });

    // Victory / Game Over Modal Buttons
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.sound.playClick();
      this.restartGame();
    });

    document.getElementById('btn-win-menu').addEventListener('click', () => {
      this.sound.playClick();
      this.goToMainMenu();
    });

    // Touch controls binding
    this.setupTouchControls();
  }

  setupTouchControls() {
    const bindTouch = (btnId, onDown, onUp) => {
      const el = document.getElementById(btnId);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.init();
        onDown();
      });
      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        onUp();
      });
      el.addEventListener('pointerleave', (e) => {
        e.preventDefault();
        onUp();
      });
      el.addEventListener('pointercancel', (e) => {
        e.preventDefault();
        onUp();
      });
    };

    bindTouch('touch-left-up', () => this.touchP1Up = true, () => this.touchP1Up = false);
    bindTouch('touch-left-down', () => this.touchP1Down = true, () => this.touchP1Down = false);
    bindTouch('touch-right-up', () => this.touchP2Up = true, () => this.touchP2Up = false);
    bindTouch('touch-right-down', () => this.touchP2Down = true, () => this.touchP2Down = false);

    // Direct touch/drag on canvas
    this.canvas.addEventListener('touchmove', (e) => {
      if (this.state !== 'PLAYING') return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const clientY = touch.clientY - rect.top;
        const normY = (clientY / rect.height) * this.HEIGHT;
        const clientX = touch.clientX - rect.left;
        const normX = (clientX / rect.width) * this.WIDTH;

        if (normX < this.WIDTH / 2) {
          this.p1.y = Math.max(10, Math.min(this.HEIGHT - this.paddleHeight - 10, normY - this.paddleHeight / 2));
        } else if (this.gameMode === 'pvp') {
          this.p2.y = Math.max(10, Math.min(this.HEIGHT - this.paddleHeight - 10, normY - this.paddleHeight / 2));
        }
      }
    }, { passive: false });
  }

  // --------------------------------------------------------------------------
  // Mode & Difficulty Configuration
  // --------------------------------------------------------------------------
  setGameMode(mode) {
    this.gameMode = mode;
    this.updateMenuUI();
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.updateMenuUI();
  }

  updateMenuUI() {
    const modeNames = {
      'ai': 'Player vs AI',
      'pvp': 'Two Players',
      'practice': 'Practice Mode'
    };

    const diffNames = {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard'
    };

    document.getElementById('display-mode-text').textContent = modeNames[this.gameMode];
    document.getElementById('display-diff-text').textContent = diffNames[this.difficulty];

    const diffRow = document.getElementById('difficulty-stepper-row');
    const modalDiffRow = document.getElementById('modal-difficulty-row');
    if (this.gameMode === 'ai') {
      diffRow.style.opacity = '1';
      diffRow.style.pointerEvents = 'auto';
      modalDiffRow.style.display = 'flex';
    } else {
      diffRow.style.opacity = '0.35';
      diffRow.style.pointerEvents = 'none';
      modalDiffRow.style.display = 'none';
    }

    // Modal cards active state
    document.querySelectorAll('.mode-card').forEach((card) => {
      if (card.getAttribute('data-mode') === this.gameMode) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Modal diff pills active state
    document.querySelectorAll('.diff-pill').forEach((pill) => {
      if (pill.getAttribute('data-diff') === this.difficulty) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update in-game labels
    const labelP2 = document.getElementById('label-p2');
    const touchRightZone = document.getElementById('touch-zone-right');
    if (this.gameMode === 'ai') {
      labelP2.textContent = 'AI';
      if (touchRightZone) touchRightZone.style.display = 'none';
    } else if (this.gameMode === 'pvp') {
      labelP2.textContent = 'P2';
      if (touchRightZone) touchRightZone.style.display = 'flex';
    } else {
      labelP2.textContent = 'WALL';
      if (touchRightZone) touchRightZone.style.display = 'none';
    }
  }

  openModeModal() {
    document.getElementById('mode-modal').classList.add('active');
  }

  closeModeModal() {
    document.getElementById('mode-modal').classList.remove('active');
  }

  // --------------------------------------------------------------------------
  // Flow Management
  // --------------------------------------------------------------------------
  switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  startCountdown() {
    this.switchScreen('game-screen');
    this.resizeCanvas();
    this.resetMatchData();
    this.state = 'COUNTDOWN';

    const overlay = document.getElementById('countdown-overlay');
    const countNumber = document.getElementById('countdown-number');
    overlay.classList.add('show');

    let count = 3;
    countNumber.textContent = count;
    this.sound.playCountdown(false);

    const step = () => {
      count--;
      if (count > 0) {
        countNumber.textContent = count;
        countNumber.style.animation = 'none';
        void countNumber.offsetWidth; // trigger reflow
        countNumber.style.animation = 'countdownPulse 0.85s ease-out';
        this.sound.playCountdown(false);
        setTimeout(step, 900);
      } else if (count === 0) {
        countNumber.textContent = 'GO!';
        countNumber.style.animation = 'none';
        void countNumber.offsetWidth;
        countNumber.style.animation = 'countdownPulse 0.85s ease-out';
        this.sound.playCountdown(true);
        setTimeout(step, 800);
      } else {
        overlay.classList.remove('show');
        this.launchBall(Math.random() > 0.5 ? 1 : -1);
        this.state = 'PLAYING';
        this.startTimer();
      }
    };

    setTimeout(step, 900);
  }

  resetMatchData() {
    this.scoreP1 = 0;
    this.scoreP2 = 0;
    this.currentRally = 0;
    this.maxRally = 0;
    this.elapsedTime = 0;
    this.particles.reset();
    this.confetti.stop();
    this.updateScoreHUD();
    this.updateHUDTimer();

    // Center paddles
    this.p1.y = (this.HEIGHT - this.paddleHeight) / 2;
    this.p2.y = (this.HEIGHT - this.paddleHeight) / 2;
  }

  startTimer() {
    this.startTime = performance.now() - (this.elapsedTime * 1000);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state === 'PLAYING') {
        this.elapsedTime = Math.floor((performance.now() - this.startTime) / 1000);
        this.updateHUDTimer();
      }
    }, 500);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateHUDTimer() {
    const str = this.formatTime(this.elapsedTime);
    document.getElementById('match-timer-hud').textContent = `⏱ ${str}`;
  }

  updateScoreHUD() {
    document.getElementById('score-p1').textContent = this.scoreP1;
    document.getElementById('score-p2').textContent = this.scoreP2;
    document.getElementById('match-rally-hud').textContent = `⚡ Rally: ${this.currentRally}`;
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    document.getElementById('pause-time').textContent = this.formatTime(this.elapsedTime);
    document.getElementById('pause-rally').textContent = this.currentRally;
    document.getElementById('pause-modal').classList.add('active');
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    document.getElementById('pause-modal').classList.remove('active');
    this.startTime = performance.now() - (this.elapsedTime * 1000);
    this.state = 'PLAYING';
  }

  restartGame() {
    document.getElementById('pause-modal').classList.remove('active');
    document.getElementById('game-over-modal').classList.remove('active');
    this.confetti.stop();
    this.startCountdown();
  }

  goToMainMenu() {
    this.stopTimer();
    this.state = 'MENU';
    document.getElementById('pause-modal').classList.remove('active');
    document.getElementById('game-over-modal').classList.remove('active');
    this.confetti.stop();
    this.switchScreen('menu-screen');
  }

  // --------------------------------------------------------------------------
  // Ball Launch & Physics
  // --------------------------------------------------------------------------
  launchBall(direction = 1) {
    this.ball.x = this.WIDTH / 2;
    this.ball.y = this.HEIGHT / 2;
    this.ball.speed = this.ball.baseSpeed;

    // Launch angle between -35 and +35 degrees
    const angle = (Math.random() * 0.7 - 0.35) * Math.PI;
    this.ball.vx = Math.cos(angle) * this.ball.speed * direction;
    this.ball.vy = Math.sin(angle) * this.ball.speed;
    this.ballTrail = [];
  }

  handlePointScored(scoringPlayer) {
    this.sound.playScore();

    // Show point banner
    const banner = document.getElementById('point-banner');
    const bannerText = document.getElementById('point-banner-text');

    if (this.gameMode === 'practice') {
      bannerText.textContent = `PRACTICE RALLY: ${this.currentRally}`;
    } else {
      bannerText.textContent = scoringPlayer === 1 ? 'POINT PLAYER 1!' : (this.gameMode === 'ai' ? 'POINT AI!' : 'POINT PLAYER 2!');
    }

    banner.classList.add('show');
    setTimeout(() => {
      banner.classList.remove('show');
    }, 1200);

    // Update Rally
    if (this.currentRally > this.maxRally) {
      this.maxRally = this.currentRally;
    }
    this.currentRally = 0;

    if (scoringPlayer === 1) {
      this.scoreP1++;
    } else {
      this.scoreP2++;
    }
    this.updateScoreHUD();

    // Check Win
    if (this.gameMode !== 'practice' && (this.scoreP1 >= this.winningScore || this.scoreP2 >= this.winningScore)) {
      this.finishMatch();
      return;
    }

    // Brief pause before launching next ball
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.x = this.WIDTH / 2;
    this.ball.y = this.HEIGHT / 2;

    setTimeout(() => {
      if (this.state === 'PLAYING') {
        const nextDir = scoringPlayer === 1 ? -1 : 1;
        this.launchBall(nextDir);
      }
    }, 1100);
  }

  finishMatch() {
    this.state = 'GAMEOVER';
    this.stopTimer();

    const winnerTitle = document.getElementById('winner-title');
    if (this.scoreP1 > this.scoreP2) {
      winnerTitle.textContent = 'Player 1 Wins!';
    } else if (this.gameMode === 'ai') {
      winnerTitle.textContent = 'AI Wins!';
    } else {
      winnerTitle.textContent = 'Player 2 Wins!';
    }

    document.getElementById('win-time').textContent = this.formatTime(this.elapsedTime);
    document.getElementById('win-score').textContent = `${this.scoreP1} - ${this.scoreP2}`;
    document.getElementById('win-max-rally').textContent = `${this.maxRally} hits`;

    this.sound.playWin();
    this.confetti.start();
    document.getElementById('game-over-modal').classList.add('active');
  }

  // --------------------------------------------------------------------------
  // AI Controller
  // --------------------------------------------------------------------------
  updateAI(dt) {
    if (this.gameMode === 'practice') {
      // Practice mode: Right paddle behaves as a solid training deflector
      this.p2.y = Math.max(15, Math.min(this.HEIGHT - this.paddleHeight - 15, this.ball.y - this.paddleHeight / 2));
      return;
    }

    if (this.gameMode !== 'ai') return;

    let targetY = this.ball.y;
    let aiSpeed = 7.0;
    let errorMargin = 20;

    if (this.difficulty === 'easy') {
      aiSpeed = 4.8;
      errorMargin = 38;
      // Sluggish reaction if ball is far or moving away
      if (this.ball.vx < 0 && this.ball.x < this.WIDTH * 0.6) {
        targetY = this.HEIGHT / 2;
      }
    } else if (this.difficulty === 'medium') {
      aiSpeed = 7.2;
      errorMargin = 16;
      if (this.ball.vx < 0) {
        targetY = this.HEIGHT / 2;
      }
    } else if (this.difficulty === 'hard') {
      aiSpeed = 10.2;
      errorMargin = 6;
      // Trajectory Prediction
      if (this.ball.vx > 0) {
        let simX = this.ball.x;
        let simY = this.ball.y;
        let simVx = this.ball.vx;
        let simVy = this.ball.vy;
        const targetX = this.p2.x;

        while (simX < targetX && simVx > 0) {
          simX += simVx;
          simY += simVy;
          if (simY - this.ball.r <= 0 || simY + this.ball.r >= this.HEIGHT) {
            simVy = -simVy;
          }
        }
        targetY = simY;
      } else {
        targetY = this.HEIGHT / 2;
      }
    }

    const paddleCenter = this.p2.y + this.p2.h / 2;
    const diff = targetY - paddleCenter;

    if (Math.abs(diff) > errorMargin) {
      if (diff > 0) {
        this.p2.y += Math.min(diff, aiSpeed);
      } else {
        this.p2.y += Math.max(diff, -aiSpeed);
      }
    }

    // Clamp inside boundaries
    this.p2.y = Math.max(12, Math.min(this.HEIGHT - this.paddleHeight - 12, this.p2.y));
  }

  // --------------------------------------------------------------------------
  // Update Physics
  // --------------------------------------------------------------------------
  updatePhysics(dt) {
    // 1. Move Player 1
    const p1Up = this.keys['KeyW'] || (this.gameMode !== 'pvp' && this.keys['ArrowUp']) || this.touchP1Up;
    const p1Down = this.keys['KeyS'] || (this.gameMode !== 'pvp' && this.keys['ArrowDown']) || this.touchP1Down;

    if (p1Up) {
      this.p1.y -= this.p1.speed;
    }
    if (p1Down) {
      this.p1.y += this.p1.speed;
    }
    this.p1.y = Math.max(12, Math.min(this.HEIGHT - this.p1.h - 12, this.p1.y));

    // 2. Move Player 2
    if (this.gameMode === 'pvp') {
      const p2Up = this.keys['ArrowUp'] || this.touchP2Up;
      const p2Down = this.keys['ArrowDown'] || this.touchP2Down;

      if (p2Up) {
        this.p2.y -= this.p2.speed;
      }
      if (p2Down) {
        this.p2.y += this.p2.speed;
      }
      this.p2.y = Math.max(12, Math.min(this.HEIGHT - this.p2.h - 12, this.p2.y));
    } else {
      this.updateAI(dt);
    }

    // 3. Move Ball with sub-stepping for anti-tunneling
    const subSteps = 3;
    const subVx = this.ball.vx / subSteps;
    const subVy = this.ball.vy / subSteps;

    for (let step = 0; step < subSteps; step++) {
      this.ball.x += subVx;
      this.ball.y += subVy;

      // Top & Bottom Boundary Collisions
      if (this.ball.y - this.ball.r <= 8) {
        this.ball.y = 8 + this.ball.r;
        this.ball.vy = Math.abs(this.ball.vy);
        this.sound.playWallHit();
        this.particles.createImpact(this.ball.x, 8, '#00e5ff', 8);
      } else if (this.ball.y + this.ball.r >= this.HEIGHT - 8) {
        this.ball.y = this.HEIGHT - 8 - this.ball.r;
        this.ball.vy = -Math.abs(this.ball.vy);
        this.sound.playWallHit();
        this.particles.createImpact(this.ball.x, this.HEIGHT - 8, '#00e5ff', 8);
      }

      // Check Collision: Player 1 Paddle
      if (
        this.ball.vx < 0 &&
        this.ball.x - this.ball.r <= this.p1.x + this.p1.w &&
        this.ball.x + this.ball.r >= this.p1.x &&
        this.ball.y + this.ball.r >= this.p1.y &&
        this.ball.y - this.ball.r <= this.p1.y + this.p1.h
      ) {
        this.ball.x = this.p1.x + this.p1.w + this.ball.r;
        this.handlePaddleBounce(this.p1, 1);
        break;
      }

      // Check Collision: Player 2 / AI / Practice Paddle
      if (
        this.ball.vx > 0 &&
        this.ball.x + this.ball.r >= this.p2.x &&
        this.ball.x - this.ball.r <= this.p2.x + this.p2.w &&
        this.ball.y + this.ball.r >= this.p2.y &&
        this.ball.y - this.ball.r <= this.p2.y + this.p2.h
      ) {
        this.ball.x = this.p2.x - this.ball.r;
        this.handlePaddleBounce(this.p2, -1);
        break;
      }

      // Scoring Condition: Ball passed paddle boundaries
      if (this.ball.x + this.ball.r < 0) {
        this.handlePointScored(2);
        return;
      } else if (this.ball.x - this.ball.r > this.WIDTH) {
        this.handlePointScored(1);
        return;
      }
    }

    // Update Motion Trail
    this.ballTrail.push({ x: this.ball.x, y: this.ball.y });
    if (this.ballTrail.length > this.maxTrailLength) {
      this.ballTrail.shift();
    }

    // Update Particles
    this.particles.update();
  }

  handlePaddleBounce(paddle, dir) {
    // Relative impact from center (-1 top edge to +1 bottom edge)
    const relativeImpact = (this.ball.y - (paddle.y + paddle.h / 2)) / (paddle.h / 2);
    const clampedImpact = Math.max(-1, Math.min(1, relativeImpact));

    // Maximum deflection angle 55 degrees
    const maxBounceAngle = (55 * Math.PI) / 180;
    const bounceAngle = clampedImpact * maxBounceAngle;

    // Gradually ramp speed on each paddle hit
    this.ball.speed = Math.min(this.ball.maxSpeed, this.ball.speed * 1.045 + 0.15);

    this.ball.vx = Math.cos(bounceAngle) * this.ball.speed * dir;
    this.ball.vy = Math.sin(bounceAngle) * this.ball.speed;

    this.currentRally++;
    this.updateScoreHUD();

    this.sound.playPaddleHit(dir < 0);
    this.particles.createImpact(this.ball.x, this.ball.y, dir > 0 ? '#2ee59d' : '#00e5ff', 14);
  }

  // --------------------------------------------------------------------------
  // Rendering
  // --------------------------------------------------------------------------
  render() {
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

    // 1. Draw Subtle Court Grid
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = gridSize; x < this.WIDTH; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.HEIGHT);
      this.ctx.stroke();
    }
    for (let y = gridSize; y < this.HEIGHT; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.WIDTH, y);
      this.ctx.stroke();
    }

    // 2. Center Dividing Line (Dashed)
    this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.WIDTH / 2, 10);
    this.ctx.lineTo(this.WIDTH / 2, this.HEIGHT - 10);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();

    // 3. Draw Ball Trail
    if (this.ballTrail.length > 1) {
      for (let i = 0; i < this.ballTrail.length; i++) {
        const pt = this.ballTrail[i];
        const alpha = ((i + 1) / this.ballTrail.length) * 0.35;
        const radius = this.ball.r * (0.4 + (i / this.ballTrail.length) * 0.6);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // 4. Draw Ball with Glow
    this.ctx.save();
    this.ctx.shadowBlur = 18;
    this.ctx.shadowColor = '#00e5ff';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // 5. Draw Paddles (Rounded Capsules)
    this.drawPaddle(this.p1, '#ffffff', 'rgba(46, 229, 157, 0.6)');
    this.drawPaddle(this.p2, '#ffffff', 'rgba(0, 229, 255, 0.6)');

    // 6. Draw Spark Particles
    this.particles.draw(this.ctx);
  }

  drawPaddle(paddle, fillStyle, glowColor) {
    this.ctx.save();
    this.ctx.shadowBlur = 14;
    this.ctx.shadowColor = glowColor;
    this.ctx.fillStyle = fillStyle;

    const r = paddle.w / 2;
    const x = paddle.x;
    const y = paddle.y;
    const w = paddle.w;
    const h = paddle.h;

    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  // --------------------------------------------------------------------------
  // Main Game Loop (requestAnimationFrame)
  // --------------------------------------------------------------------------
  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (this.state === 'PLAYING') {
      this.updatePhysics(dt);
    }

    if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'COUNTDOWN') {
      this.render();
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// ============================================================================
// Initialize Game on DOM Ready
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  window.pongGame = new PingPongGame();
});
