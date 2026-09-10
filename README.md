# SurTest — Indian Song Guessing 🎵🇮🇳

A dark-themed, single-page web app inspired by Heardle/Songless where users guess iconic Indian songs from short audio clips. Each wrong guess ("skip") unlocks a longer snippet across six stages.

Built with **React**, **Tailwind CSS**, and an **Express / Node.js** catalog backend stub.

---

## 🌟 Key Features

- **Regional Catalogs**:
  - **Hindi (हिंदी)**: Bollywood + pop anthems
  - **Punjabi (ਪੰਜਾਬੀ)**: Bhangra + Punjabi pop hits
  - **Haryanvi (हरियाणवी)**: Desi high-energy dance anthems
- **Game Modes**:
  - **Normal Mode**: Standard forward audio playback with 6 progressive clip unlocks (1s → 16s)
  - **Reverse Mode**: Plays audio backwards! Inverted vocals and reversed beats for deep music lovers
  - **Antakshari Mode 🔗**: The iconic Desi sound-chaining game! Each song you guess connects to the next on its title's ending sound syllable (`...Ho → H → Hawayein`). Build your longest chain or beat the entire catalog!
- **6-Stage Gameplay Engine**:
  - Progressive clip unlocking: 1s → 2s → 4s → 7s → 11s → 16s / 30s
  - Interactive audio visualizer and waveform bars
  - Song title and artist autocomplete search
  - Live streak & win rate tracking
- **Vibe & Difficulty Tuning**:
  - 5 difficulty tiers (01 Easy to 05 Impossible)
  - "Start from hook" toggle (jump directly into the chorus)
- **Design & Visuals**:
  - Deep black base (`#0A0A0B`) with subtle warm stage lighting glow
  - Electric spring/neon green accents (`#22E06B`)
  - Inter & JetBrains Mono typography
  - Glassmorphic listening log sidebar & persistent status toast banner

---

## 🚀 Getting Started

### 1. Start Both Backend & Frontend Concurrently
From the project root directory:
```bash
npm run dev
```

Or run them individually:

**Backend API (Port 5000)**:
```bash
npm run dev:backend
```

**Frontend App (Port 5173)**:
```bash
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 📱 Playing on your Phone
To play on any phone (Wi-Fi or Mobile Data) without firewall or router configuration issues, run:
```bash
npm run tunnel
```
This generates a secure public HTTPS link that opens directly on your phone.

---

## 📁 Component Architecture

- `src/components/TopBar.jsx`: Brand logo badge (`ST`), title, subtitle, streak counter, and help modal trigger.
- `src/components/Hero.jsx`: Stage eyebrow, pulsating live dot, and bold headline.
- `src/components/GameSetupCard.jsx`: Step 1 language selection, Step 2 difficulty vibe, hook toggle, and action buttons.
- `src/components/LanguageCard.jsx`: Reusable regional language cards featuring native scripts (`हिंदी`, `ਪੰਜਾਬੀ`, `हरियाणवी`).
- `src/components/DifficultyPill.jsx`: Reusable numbered difficulty pills (`01 Easy` to `05 Impossible`).
- `src/components/SidebarPanel.jsx`: Sticky listening log sidebar with played, win rate, best streak, and how-it-works steps.
- `src/components/StatBlock.jsx`: Reusable statistic card block with tabular numbers.
- `src/components/HowItWorksStep.jsx`: Reusable step explanation item with green numerals.
- `src/components/Toast.jsx`: Bottom banner for server wake triggers and connectivity status.
- `src/components/GamePlayModal.jsx`: 6-stage audio guessing game modal with playback, progress indicators, and song guessing.
- `src/components/HelpModal.jsx`: Rule explanations and game tips modal.
- `src/components/Footer.jsx`: Dedicated footer with brand homage.
