# Codebase Best Practices & Architecture Audit

This document details the architectural patterns, code health, memory safety, and security checks implemented in the **GIOnyx Portfolio** codebase.

---

## 🏗️ 1. Architecture & Design Patterns

The codebase is split cleanly into three main layers:

1. **WebGL Rendering Layer (`src/three/`)**:
   - Handles camera setup, rendering loops, and object scene graph configurations.
   - Distinct classes handle separate model boundaries: `room`, `avatar` (interactive desk person), `lab` (3D pod), and `contact`.
   - Local state is initialized synchronously or waits on global asset loaders (`src/utils/resources.ts`).

2. **UI Feature Layer (`src/features/`)**:
   - OS Desktop Shell built using Vue 3 SFCs.
   - Decoupled from WebGL logic; triggers updates to WebGL parameters (e.g. `tIdleIntensity`) reactively via imports.
   - Utilizes custom composables (`src/composables/`) to react to route transitions.

3. **Global Timeline & State (`src/animations/`)**:
   - Manages GSAP timelines and transition curves during route navigation (Hero ➜ About ➜ Projects ➜ Contact).

---

## 🛡️ 2. Memory & HMR Safety Checks

Because WebGL contexts and global Singletons (like `scene.instance`) persist in the browser during Vite's Hot Module Replacement (HMR) reload cycles, the codebase enforces strict lifecycle cleanups:

- **Initialization Guards**:
  - `src/three/index.ts` utilizes an `isInitializing` boolean semaphore. This guarantees `start()` and its resize event handlers are registered exactly once, preventing double loading loops.

- **Clean destroy() Routines**:
  - `room/index.ts` and `avatar/index.ts` clear active render tickers (`gsap.ticker.remove(tick)`), dispose of geometries, clear Three.js groups (`group.clear()`), and set reference singletons back to `null`.
  - Hologram and shadow mixers are disposed properly to release skeleton skeleton bones memory.

- **Geometry Instantiation Integrity**:
  - Monitor screen geometries (`desktops.ts`) clone base templates using `.clone()` before translating positions. This guarantees re-mounting or re-entering the page will never compound translation offsets and push the screen out of the physical monitors.

---

## 🎨 3. CSS Design Tokens & Theming

- **Vanilla CSS / SCSS Variables**:
  - Global variable definitions are unified in `src/assets/styles/colors.scss`.
  - The OS window shell maps these tokens locally inside the `.home-wrapper` class of `Home.vue` (e.g. `--sand-bg`, `--sand-card`, `--sand-border`, `--text-color`). This keeps the styling sand-charcoal themed without leaking global styles out of scope.

- **Scroll Intercept Fixes**:
  - Elements using scroll bars inside draggable widgets are decorated with the `data-lenis-prevent` attribute. This guarantees mouse wheel events bypass Lenis smooth scroll and scroll natively.

---

## 🔒 4. Security & Performance Checklist

- **API Secrets**: Supabase URL and credentials are read safely via environment settings (`import.meta.env`). Hardcoded secret values are strictly forbidden.
- **Strict Typing**: Type bindings are enforced using strict TS modules (`vue-tsc -b`). Casting to `any` is avoided.
- **Hologram Shaders**: Custom fragment and vertex shaders are organized cleanly under `src/three/shaders/` to optimize GPU processing.
