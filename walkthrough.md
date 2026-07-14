# Portfolio Redesign Walkthrough — Restructured WebGL + Desktop OS Theme

## Summary

The portfolio codebase has been restructured to use a **Vue 3 + Vite + Three.js** environment. The live **3D animated character at a desk (typing on a computer)** runs in WebGL directly in the background of the desktop space, acting as an interactive live wallpaper!

## Bug Fixes

### 3D WebGL Canvas Loading Bug
- **Issue**: On localhost, resources (GLB models, textures) load almost instantly. By the time `Home.vue` mounted and called `three.init()`, the resource manager was already `ready`. Because the Three.js code had a listener `resources.once("ready", start)`, it waited forever for a ready event that had already occurred. The camera stayed at `(0, 0, 0)` and the renderer set the canvas to `visibility: hidden`, leaving a solid cream screen.
- **Fix**: Reconfigured `src/three/index.ts` to check if resources are already loaded (`resources.isReady`). If they are, it initializes the WebGL room and typing animations immediately.

### Standing Character & Sideways/Shifted Screens (Hot-Reload / Re-mount Bug)
- **Issue**: When Vite updates modules or re-mounts elements during development, the Three.js canvas is destroyed and initialized again. However, the original code had commented out or incomplete cleanups in the `destroy()` methods of `avatar/index.ts`, `hologram.ts`, and `room/index.ts`. They didn't remove old meshes or clear module-level variables (`mesh = null`, `objects = null`). This led to:
  1. The character's animation mixer failing to hook onto the new render ticks, reverting him back to the default "T-pose" (standing).
  2. The monitor screens translating the shared cached model geometries *repeatedly* on every reload, shifting them further and further out of the physical monitors.
- **Fix**:
  1. Uncommented and correctly implemented full cleanup procedures in `avatar/index.ts`, `hologram.ts`, and `room/index.ts` to clear and reset the meshes, geometry, and scene groupings.
  2. Upgraded `desktops.ts` to clone the geometries before applying translations, ensuring they are never shifted more than once.

### Stray Blue Circle & Desktop Layout Corrections
- **Issue**:
  1. A stray blue cylinder (the lab pod machine's base platform from the About section) was rendering directly on the rug because its group default coordinates sat at `(0, 0, 0)`.
  2. The home screen had duplicate navigations (both desktop icons grid and dock taskbar icons).
  3. The sticky note sat too close to the left border.
- **Fix**:
  1. Added `lab.group.visible = false` inside the default layout initialization in `three/index.ts` to hide the pod base entirely.
  2. Removed the desktop icon grid from the home screen wrapper template in `Home.vue`, clean-keeping all navigations in the bottom dock.
  3. Vertically centered the sticky note (`top: 50%; transform: translateY(-50%) rotate(-2.5deg)`) and moved it right to `left: 200px;`.
  4. Removed "Open to internship" and description texts from the sticky note, and increased the profile picture size to `110px`.
  5. Injected and mapped the sand-charcoal color variables (`--sand-bg`, `--sand-card`, `--sand-border`, `--text-color`) inside `Home.vue` style block to match David's exact design system variables.

### Redirection, Maximize and Scroll Fixes
- **Issue**:
  1. **Redirection to GitHub**: Clicking cards navigated to local detail routes but the GitHub links were never accessible.
  2. **Certifications Window Maximize Typos**: The green dot button maxed the About window instead of Certifications because of a class binding typo (`maximizedWindows.about`).
  3. **Multi-Window Mode Reverted**: Restored previous desktop OS behavior to allow multiple window panels to overlap instead of closing when a new one opens.
  4. **Blocked Scroll Wheel in Windows**: Lenis smooth-scroll intercepted wheel inputs on absolute windows.
  5. **Jittery Indicators**: Animating dock buttons on hover shifted dots.
- **Fix**:
  1. Added `handleProjectClick` to redirect cards with live urls directly in a new tab (e.g. GitHub repos, Figma mockups, Vercel deployments).
  2. Corrected the binding on line 505 to use `maximizedWindows.certifications`.
  3. Restored `openWindow()` to allow multiple open app panels.
  4. Injected `data-lenis-prevent` to windows bodies to bypass Lenis scroll intercept.
  5. Transferred hover transforms to inner SVG shapes, locking buttons and active indicator dots in place.

## Architecture

- **Background (3D WebGL)**: Renders `room.glb` and `avatar.glb` with skeleton animations, mouse movements, penguin ticks, and custom matcap shaders, running live behind the desktop grid.
- **Foreground (Desktop OS UI)**: Built reactively in Vue 3. Features a top macOS-style menubar, left-side sticky note widget, responsive dock (taskbar), and drag-and-drop window management.
- **Detail Pages (Scroll Transitions)**: Clicking any card inside the "Projects" app window triggers Vue/Vite router updates to navigate to `/projects/<slug>`. This activates the original camera animations and full-screen presentations before transitioning back.

## Verification Checklist

1. Refresh `http://localhost:3000` in the browser.
2. Verify that:
   - Clicking CiteWise, InStock, Hygienix, ClassLink, RentMate, TrikeGo, or TrackBack **redirects directly to their live links** in a new tab.
   - The **green maximize button (+)** on the Certifications window expands it correctly.
   - **Multiple windows** can open and overlap simultaneously.
   - The **sticky note** has a larger profile picture and no redundant texts.
