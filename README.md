# 🤖 NEO REPAIR: KAWAIITECH ⚡ (Ludum Dare 60 Compo Source Code)

Welcome to the retro tech restoration station! Dust off your old childhood memories in this cozy, juice-packed ASMR cleaning simulator inspired by Super Nintendo and Dendy aesthetics.

* **Play the game on Itch.io:** [itch.io](https://atomicart.itch.io/neo-repair-kawaiitech)
* **Ludum Dare Entry Page:** [ldjam.com](https://ldjam.com/events/ludum-dare/60/neo-repair-kawaiitech)

---

### 🛠️ 100% From Scratch Compo Development
This repository contains the pristine, fully optimized source code for the game. Every single script, mechanical logic loop, and visual structure was written completely from scratch by a single developer during the 48-hour Ludum Dare Compo window.

**Key Engine Components written during the event:**
* **Custom Pixel-Particle Physics Pool:** Built an independent custom sprite-based particle simulation (`EffectManager.js`) to achieve fluid, performance-friendly dust storms without relying on standard Phaser emitters.
* **Math-Based Pseudo-3D Rendering:** Designed custom Canvas drawing pipelines for all 5 unique devices (`src/render/devices/`) that handle real-time cosine-based rotation, perspective squeezing, and 3D depth.
* **Pixel-Perfect Tint Mapping:** Implemented a real-time pixel extraction system (`ctx.getImageData`) that reads colors directly from dirt masks and dynamically transfers that exact hue to the newly spawned ASMR debris.
* **Custom Audio Generation:** Every retro chiptune audio effect was created from scratch using **bfxr** during the jam window.

---

### 📦 Tech Stack
* **Engine:** Phaser v3.86.0
* **Bundler:** Vite
* **Audio FX:** Created via bfxr
* **Generative AI Disclosure:** 100% human-made. No Generative AI tools were used for code, visuals, or audio.

### 🎮 Controls:
* **Move Mouse** to aim the blower nozzle.
* **Hold Left Click** to blast away the dust!

### 🚀 How to Run Locally
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the local development server: `npm run dev`
