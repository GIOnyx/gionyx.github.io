# Project Onboarding Guide — GIOnyx Interactive OS Portfolio

Welcome to the **GIOnyx OS Portfolio** project! This guide will help you understand the architecture, layout, configuration, and build processes.

---

## 🏛️ 1. Architecture Overview

The application is structured as an interactive Desktop OS shell overlaying a real-time **3D WebGL room animation**:

- **3D Room (Three.js)**:
  - Loads models (`room.glb`, `avatar.glb`, `lab.glb`) from resources.
  - Implements matcap shaders, mouse-following animations, and keyframe animations.
  - Runs in the background as a live wallpaper.
- **Desktop Shell (Vue 3 SFCs)**:
  - Implements macOS-style menu bar, bottom taskbar dock, and draggable application panels.
  - Provides sand-charcoal themed windows mapping layout content (About, Skills, Projects, Certifications, Contact).
- **Navigation & Routing**:
  - Toggling project details updates the Vue router path to `/projects/<slug>`.
  - Animates camera view coordinates to full-screen views, then restores desktop coordinates upon exiting.

---

## 📂 2. Directory Structure

```
├── .agents/                    # Local AI agent configs, rules, and runbooks
│   ├── rules/GEMINI.md         # Custom project guidelines
│   ├── skills/runbook.md       # Dev runbook reference
│   └── mcp.json                # Local Model Context Protocol configs
├── .github/workflows/          # GitHub Action workflows
│   └── deploy.yml              # Build & GitHub Pages automated deployment pipeline
├── public/                     # Static files (GLB models, textures, sounds, fonts)
├── src/
│   ├── animations/             # GSAP timeline coordinates & route hooks
│   ├── assets/                 # Profile images and SCSS styles
│   ├── components/             # Reusable UI component modules (Links, Tags)
│   ├── composables/            # Reactive composable hooks
│   ├── features/               # Vue feature page views (Home, Projects)
│   ├── i18n/                   # Multilingual i18n translations
│   └── three/                  # WebGL scene, cameras, render loops, and objects
├── package.json                # npm script bindings and dependencies
├── vite.config.ts              # Vite asset loader configurations
└── index.html                  # Core HTML file
```

---

## ⚙️ 3. Setup & Development Execution

### 1. Prerequisites
- **Node.js**: Version 20.x or higher
- **npm**: Version 10.x or higher

### 2. Setup Env Variables
Copy the template variables file to create your local env setup:
```bash
npm run env:copy-example
```

### 3. Install Dependencies
Install modules using the clean lockfile parameters:
```bash
npm ci
```

### 4. Running Locally
Run the Vite development server locally on port 3000:
```bash
npm run dev
```

### 5. Compiling for Production
Typecheck TypeScript bindings and compile final static files into `./dist`:
```bash
npm run build
```

---

## 🚀 4. Automated CI/CD Pages Deployment

The repository is integrated with **GitHub Pages** using GitHub Actions:
- On every push to the `main` branch, the workflow inside `.github/workflows/deploy.yml` builds the Vue code and pushes output files to the `gh-pages` branch.
- **Note**: Ensure repository Actions permissions are set to **"Read and write permissions"** in settings, and **Pages source** is set to build from the **`gh-pages`** branch.
