# Project Guidelines & Development Guardrails

These rules define strict development patterns for the **GIOnyx Portfolio** codebase. Ensure you adhere to them for every code change.

---

## 🏎️ 1. WebGL & Three.js Code Modifications

1. **Geometry Transformations**:
   - NEVER translate or modify the position of geometries on shared model resource nodes in-place.
   - ALWAYS clone the geometry (`geometry.clone()`) before applying transformations like `.translate()`, `.rotate()`, or `.scale()`. This prevents compounding mutations during Vite's HMR re-mount runs.

2. **Clean Lifecycle Hook (HMR safety)**:
   - Every file under `src/three/objects/` that exports an `init()` method MUST export a matching `destroy()` method.
   - In `destroy()`:
     - Remove any ticker loops: `gsap.ticker.remove(tick)`
     - Clear Three.js groups: `group.clear()` or `group.remove(mesh)`
     - Dereference local variables: set `mesh = null`, `objects = null`, and `mixers = null` to free up GPU allocations.

3. **Double Startup Protection**:
   - Any main setup hook inside `src/three/index.ts` must use initialization semaphores to block double executing `start()` when assets load instantly.

---

## 🖥️ 2. UI & Component Rules (Vue 3 / Vite)

1. **Draggable Windows**:
   - To add styling adjustments or new draggable elements inside `Home.vue`, ensure window drag and click handle logic includes targets checks on `.win-controls` to prevent dragging when clicking button dots.
   - Set `data-lenis-prevent` on any container that requires local wheel scrolling, to override Lenis scroll listeners.

2. **External Link Redirections**:
   - Utilize `handleProjectClick(slug, url)` for projects. If a live repository or hosting link exists, redirect to it in a new window. Otherwise, navigate to internal pages.

---

## 🎨 3. SCSS & Design Theming

1. **Vanilla SCSS & Tokens**:
   - Do NOT install or write Tailwind CSS utility styles.
   - Base all color palettes on variables declared in `src/assets/styles/colors.scss`.
   - Keep window content sand-charcoal themed (`--sand-bg`, `--sand-card`, `--sand-border`, `--text-color`).
