# 🍬 Candy Rain Mania

A 3D browser game built with Three.js + GSAP. Catch falling candies, build combo streaks, grab power-ups, and dodge bombs!

## Features
- 5 unique 3D candy shapes with points system
- Score-based speed progression (faster every 150 pts)
- 3 distinct power-ups: Shield 🛡️, 2x Points ⭐, Slow-Mo ❄️
- Combo multiplier system (up to ×5)
- Particle effects & GSAP animations
- Works on desktop (mouse/keyboard) and mobile (touch)

## Project Structure

```
candy-rain-mania/
├── index.html       ← entire game (self-contained)
├── README.md        ← this file
└── vercel.json      ← Vercel deploy config (optional)
```

---

## 🚀 Deployment Options

### Option 1 — Vercel (Recommended, Free)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Inside the project folder:
   ```bash
   cd candy-rain-mania
   vercel
   ```
3. Follow prompts → your game is live at `https://candy-rain-mania.vercel.app`

To redeploy after changes:
```bash
vercel --prod
```

---

### Option 2 — Netlify (Free, Drag & Drop)

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Log in → click **"Add new site"** → **"Deploy manually"**
3. Drag the entire `candy-rain-mania/` folder into the drop zone
4. Done — live URL is given instantly!

Or via CLI:
```bash
npm install -g netlify-cli
netlify deploy --dir . --prod
```

---

### Option 3 — GitHub Pages (Free)

1. Create a GitHub repo named `candy-rain-mania`
2. Push your files:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/candy-rain-mania.git
   git push -u origin main
   ```
3. Go to repo → **Settings** → **Pages**
4. Set source: **Deploy from branch** → `main` → `/ (root)`
5. Your game will be live at:
   `https://YOUR_USERNAME.github.io/candy-rain-mania`

---

### Option 4 — Local (No install needed)

Just open `index.html` directly in any modern browser:
```bash
open index.html         # Mac
start index.html        # Windows
xdg-open index.html     # Linux
```

---

## 🎮 Controls

| Action | Control |
|--------|---------|
| Move basket | Mouse / Touch |
| Move basket | ← → Arrow keys |

## 📈 Score & Level System

| Score | Level | Speed |
|-------|-------|-------|
| 0     | 1     | Slow  |
| 150   | 2     | +     |
| 300   | 3     | ++    |
| 450+  | 4+    | +++   |

Every 150 points = new level + speed increase!

---

Built by Kris · Powered by Three.js + GSAP
