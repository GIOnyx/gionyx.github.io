# Local Workspace Runbook & Skills Guide

This runbook acts as a development reference skill file for compiling, debugging, and building this portfolio.

---

## 🛠️ 1. Project Commands

- **Start Dev Server**:
  `npm run dev`
  Executes the Vite bundler on `http://localhost:3000`.

- **Typecheck Code**:
  `npm run typecheck`
  Runs `vue-tsc -b` to compile and check TypeScript bindings across all files and Vue templates.

- **Build Production Bundle**:
  `npm run build`
  Typechecks code and bundles assets to `./dist`.

---

## 🔍 2. Common Debugging Workflows

### Character Standing in T-Pose / Double Mesh Glitch
- **Cause**: Vite hot-reloading re-executes module setup blocks but keeps the global WebGL canvas scene object in memory. Old avatars and rooms are not cleanly disposed.
- **Fix**: Check `src/three/objects/avatar/index.ts` and `src/three/objects/room/index.ts`. Ensure `destroy()` clears the mesh from `scene.instance`, removes `tick` from `gsap.ticker`, and clears references to `null`. Press **F5 (Refresh)** to clear GPU context memory.

### Draggable Windows Cannot Scroll with Wheel
- **Cause**: Lenis smooth scroll captures global mouse wheel inputs and prevents normal scrollable windows.
- **Fix**: Add the `data-lenis-prevent` attribute to the scrollable container elements.
