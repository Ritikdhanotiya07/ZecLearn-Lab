# ZecLearn Lab

**Learn Privacy. Explore Zcash. Build the Future.**

ZecLearn Lab is a modern, dark-themed educational web application designed to teach Zcash protocol fundamentals, zero-knowledge cryptography (zk-SNARKs & Halo 2), shielded value pools, and Rust-based Zcash developer tooling through interactive sandboxes, structured lessons, and hands-on quizzes.

> **Educational Sandbox Notice:** All interactive playgrounds and transaction simulations in ZecLearn Lab run **100% locally in your browser**. No real ZEC is moved, no live blockchain is queried, and no simulated transactions are broadcast to Mainnet or Testnet.

---

## Table of Contents

- [What Was Built](#what-was-built)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [How to Run Locally](#how-to-run-locally)
- [Building for Production](#building-for-production)
- [Deploying to GitHub](#deploying-to-github)
- [Educational Resources](#educational-resources)

---

## What Was Built

ZecLearn Lab is structured into **9 distinct views** with a responsive desktop sidebar and mobile navigation drawer:

1. **Landing Page**
   - Hero section with clear calls to action (`Start Learning Free` & `Try Privacy Playground`).
   - Protocol foundations overview covering Transparent vs. Shielded pools, Halo 2 zk-SNARKs, and Selective Disclosure via Viewing Keys.
   - Live **Interactive Playground Preview** toggling between Transparent (`t → t`) and Fully Shielded Orchard (`u → u`) metadata exposure.
   - Structured learning track previews, a `librustzcash` code showcase, and official Zcash community links.

2. **Student Dashboard (Overview)**
   - Personalized welcome banner with course completion progress bar.
   - Live telemetry cards for **Total XP & Level**, **Lessons Completed**, **Quiz Performance**, and **Unlocked Achievements**.
   - Smart **Continue Learning** card pointing directly to the next unfinished lesson.
   - Quick-launch cards for interactive labs and a recent achievements feed.

3. **Learning Academy (`Learn Zcash`)**
   - Searchable, filterable catalog of **8 original lessons** organized across **3 tracks**:
     - **Foundations:** Why Financial Privacy Matters, Transparent/Sapling/Orchard Pools, Unified Addresses (ZIP-316).
     - **Cryptography & Privacy:** Zero-Knowledge Proofs & Halo 2, Viewing Keys & Selective Disclosure, 512-byte Encrypted Memos.
     - **Zcash Developer Track:** Zebra & Lightwalletd Architecture, Building with `librustzcash` & Wallet SDKs.

4. **Individual Lesson Page**
   - Structured reading experience with comparison tables, architectural diagrams, copyable code examples, and protocol callouts.
   - Embedded **Quick Comprehension Check** with instant feedback and explanations.
   - Completion tracking that awards XP and unlocks track-based achievements.

5. **Privacy Playground**
   - Interactive side-by-side comparison showing **What Public Observers See** vs. **What Authorized Parties / Auditors See**.
   - Supports 4 modes: **Transparent (`t → t`)**, **Shielding (`t → u`)**, **Fully Shielded (`u → u`)**, and **Auditor View (Incoming Viewing Key / IVK)**.
   - Customizable sender, recipient, amount, and 512-byte memo fields with a dynamic privacy score breakdown.

6. **Transaction Simulator**
   - Local sandbox builder supporting Transparent, Shielding, Deshielding, and Fully Shielded (Orchard) transfers.
   - Randomized mock `t1...` and `u1...` addresses, ZIP-317 simulated fee display, and encrypted memo input.
   - Multi-step simulated proving pipeline (Note Commitments → Halo 2 zk-SNARK → Nullifier Verification → Sandbox Receipt).
   - Toggleable **Public Ledger** vs. **Private Decrypted** receipt inspector and persisted local transaction history.

7. **Quiz Arena**
   - **4 themed quizzes** (*Zcash Fundamentals*, *Shielded Pools & Addresses*, *Zero-Knowledge Proofs & Halo 2*, *Zcash Developer Stack*).
   - Progress tracking, instant answer explanations, 75% pass threshold, retake support, and bonus XP rewards.

8. **Developer Hub**
   - **Ecosystem Architecture:** Reference cards and official repository links for Zebra (`zebrad`), Lightwalletd/Zaino, `librustzcash`, and mobile SDKs.
   - **Interactive ZIP-316 Unified Address Anatomy:** Clickable receiver segments (`u1`, `0x03` Orchard, `0x02` Sapling, `0x00` Transparent) explaining how Bech32m encoding and receiver priority work.
   - **Copyable Code Snippets:** Rust examples for parsing Unified Addresses, deriving Unified Full Viewing Keys (UFVKs), and Lightwalletd compact block syncing.

9. **Student Profile & Achievements**
   - Editable local student profile (Display Name, Role, Bio).
   - Track-by-track completion breakdown.
   - **8 unlockable achievement badges** with bonus XP and real-time toast notifications.
   - Safe inline confirmation modal to reset all local progress.

---

## How It Works

### State Management & Local Persistence
- All user progress is managed via a centralized React Context (`LabProvider`) and automatically synced to browser `localStorage` under the key `zeclearn_lab_state_v1`.
- Persisted data includes:
  - Student profile details
  - Completed lesson IDs
  - Quiz attempt history and best scores
  - Explored Privacy Playground modes
  - Locally simulated transaction receipts (up to the 20 most recent)
  - Unlocked achievements and bonus XP

### XP, Leveling & Achievement Engine
- Students earn XP by completing lessons (`100–160 XP`), passing quizzes (`150–200 XP`), exploring playground modes (`+15 XP`), running sandbox simulations (`+20 XP`), and unlocking badges (`50–300 XP`).
- Levels scale every **300 XP** (`Level = floor(totalXp / 300) + 1`), displayed live in the sidebar progress widget and dashboard.
- Whenever state updates, an automatic evaluator (`evaluateAchievements`) checks unlock conditions and triggers a toast notification for newly earned badges.

### Navigation
- View routing is handled cleanly via internal state navigation (`ZecLearnRouter`), smoothly scrolling to the top on page changes and supporting contextual parameters (such as jumping directly to a filtered track in the Academy or opening a specific lesson).

---

## Tech Stack

- **Frontend Framework:** React 18+ with Vite
- **Language:** JavaScript (JSX)
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Persistence:** Browser `localStorage` API

---

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes bundled with Node.js)

### Step-by-Step Setup

1. **Create a new Vite + React project** (if you don't already have the project initialized):
   ```bash
   npm create vite@latest zeclearn-lab -- --template react
   cd zeclearn-lab
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm install lucide-react tailwindcss @tailwindcss/vite
   ```

3. **Configure Tailwind CSS v4:**
   Update `vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [react(), tailwindcss()],
   })
   ```

   Replace the contents of `src/index.css` with:
   ```css
   @import "tailwindcss";
   ```

4. **Add the application code:**
   Place the ZecLearn Lab source code into `src/App.jsx`.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open in your browser:**
   Visit the local URL printed in your terminal (typically `http://localhost:5173`).

---

## Building for Production

To create an optimized production bundle:

```bash
npm run build
```

You can preview the production build locally with:

```bash
npm run preview
```

---

## Deploying to GitHub

1. Initialize Git and commit your project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ZecLearn Lab"
   ```
2. Create an empty repository on GitHub, then link and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/zeclearn-lab.git
   git push -u origin main
   ```

---

## Educational Resources

- [Zcash Protocol & ZIP Specifications](https://zips.z.cash)
- [Zcash Foundation (Zebra)](https://github.com/ZcashFoundation/zebra)
- [librustzcash Workspace](https://github.com/zcash/librustzcash)
- [Zcash Documentation](https://zcash.readthedocs.io)