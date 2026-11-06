# 🏓 2D Ping Pong Arcade Game

A complete, fully functional, and visually polished modern arcade Ping Pong game built with **HTML5 Canvas, CSS3, and vanilla JavaScript**.

![Ping Pong Arcade](https://img.shields.io/badge/Language-Vanilla%20JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Graphics-Canvas](https://img.shields.io/badge/Graphics-HTML5%20Canvas-E34F26?logo=html5&logoColor=white)
![Style-CSS3](https://img.shields.io/badge/Design-Cyberpunk%20Arcade-00e5ff)

---

## 🎮 Gameplay & Features

### 1. Three Playable Game Modes
- **Mode 1: Player vs AI**
  - Battle against an intelligent AI opponent with 3 selectable difficulty levels:
    - **Easy**: Slower tracking with deliberate human-like reaction latency.
    - **Medium**: Balanced tracking and consistent rallies.
    - **Hard**: Predictive trajectory calculation that calculates wall bounces to intercept fast shots.
- **Mode 2: Two Players**
  - Local multiplayer on the same keyboard or screen.
  - Player 1 uses `W` and `S`.
  - Player 2 uses `↑` and `↓` Arrow keys.
- **Mode 3: Practice Mode**
  - Solo endless training mode with an automated training rebound board.
  - Real-time consecutive rally counter and personal record tracker.

### 2. Modern Cyberpunk & Minimalist Arcade Aesthetic
- Deep navy/charcoal background (`#091019`) with glowing cyan and neon green accents.
- Subtle background court grid and animated starfield.
- Capsule glow paddles and glowing ball with real-time motion trail.
- Impact spark particle bursts on paddle hits and boundary deflections.
- Full-screen celebration confetti system for match victories.
- Handcrafted SVG mascots: cute cosmic cat mascot and crossed ping-pong paddles.

### 3. Audio & Sound Effects (Web Audio API)
- 100% standalone and offline synthesized sound effects with zero external audio assets:
  - Paddle impact blips (with distinct pitch tones for each player).
  - Wall bounce thuds.
  - Point scored fanfare.
  - 3, 2, 1, GO! countdown tones.
  - Triumphant match victory fanfare.
- In-game Sound ON/OFF switch.

### 4. Robust Physics & Gameplay Flow
- **Sub-step collision engine**: Eliminates ball tunneling and prevents the ball from ever clipping or sticking inside paddles.
- **Angle deflection physics**: Dynamic angle response calculated based on the distance between the ball and paddle center.
- **Dynamic speed progression**: Ball accelerates gradually over consecutive rallies for thrilling gameplay.
- **Match duration timer** and live rally statistics.
- **3, 2, 1, GO! Countdown** before round starts.
- **First to 10 points wins** with trophy victory screen and match stats.

---

## 🕹️ Controls

| Action | Player 1 (Left) | Player 2 (Right) |
| :--- | :--- | :--- |
| **Move Up** | <kbd>W</kbd> or <kbd>▲</kbd> *(Single Player)* | <kbd>▲</kbd> Arrow Up |
| **Move Down** | <kbd>S</kbd> or <kbd>▼</kbd> *(Single Player)* | <kbd>▼</kbd> Arrow Down |
| **Pause / Resume** | <kbd>Space</kbd> or Pause Header Button | <kbd>Space</kbd> |
| **Main Menu / Close**| <kbd>ESC</kbd> | <kbd>ESC</kbd> |
| **Mobile / Touch** | On-screen touch buttons or touch & drag | Touch buttons |

---

## 📁 Project Structure

```text
/ping-pong-game
  ├── index.html     # Semantic structure, main menu, HUD, modals, SVGs
  ├── style.css      # Cyber-arcade neon styling, layout, animations & responsive rules
  ├── script.js      # Game loop, physics engine, AI, audio synthesis, particles
  └── README.md      # Documentation & quick start guide
```

---

## 🚀 How to Run

1. Simply double-click **`index.html`** or open it in any modern browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, serve with any local HTTP server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser and have fun playing!
