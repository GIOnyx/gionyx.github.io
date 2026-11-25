<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { three } from "../../../three";
import { animations } from "../../../animations";
import { raycast } from "../../../three/utils/raycast";
import gsap from "gsap";
import { useAgent } from "../../../composables/useAgent";
import { projectId, projectVisible } from "../../../composables/useRouteObserver";
import { isTransitioning } from "../../../composables/useProjectTransition";
import { renderer } from "../../../three/core/renderer";
import profileImg from "../../../assets/images/profile.jpg";
import { apps, profile } from "../os/content";
import { useWindowManager } from "../os/useWindowManager";
import AppWindow from "../os/AppWindow.vue";
import AppContent from "../os/AppContent.vue";
import DesktopTerminal from "../os/DesktopTerminal.vue";
import Dock from "../os/Dock.vue";
import OsIcon from "../os/OsIcon.vue";
import { lightsOff, toggleLights } from "../../../composables/useLights";

const threeCanvasRef = ref<HTMLCanvasElement | null>(null);
const threeInitialized = ref(false);
const { isTouch } = useAgent();
const wm = useWindowManager();

// ── Menubar clock ──
const clockText = ref("");
const clockIso = ref("");
const clockFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const updateClock = () => {
  const now = new Date();
  clockText.value = clockFormat.format(now);
  clockIso.value = now.toISOString();
};
let clockInterval: ReturnType<typeof setInterval> | null = null;

// ── Pointer cursor over interactive 3D objects ──
const isHoveringObject3D = ref(false);
const updateCursor = () => {
  if (isTouch.value) return;
  const hovering = !!raycast.getHoveringBox();
  if (hovering !== isHoveringObject3D.value) {
    isHoveringObject3D.value = hovering;
    document.documentElement.style.cursor = hovering ? "pointer" : "";
  }
};

// Escape closes the frontmost window.
const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== "Escape") return;
  const key = wm.frontmost();
  if (key) wm.close(key);
};

onMounted(() => {
  if (threeCanvasRef.value && !threeInitialized.value) {
    three.init(threeCanvasRef.value);
    threeInitialized.value = true;
  }

  updateClock();
  clockInterval = setInterval(updateClock, 10_000);
  window.addEventListener("keydown", onKeydown);
  gsap.ticker.add(updateCursor);
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
  three.destroy();
  gsap.ticker.remove(updateCursor);
  animations.destroy();
  window.removeEventListener("keydown", onKeydown);
});

watch(projectVisible, (visible) => renderer.setIsActive(!visible), { immediate: true });
</script>

<template>
  <div
    :class="[
      'home-wrapper',
      lightsOff && 'lights-off',
      typeof projectId === 'string' && isTransitioning && `home-wrapper-out`,
      typeof projectId !== 'string' && isTransitioning && `home-wrapper-in`,
    ]"
  >
    <a class="skip-link" href="#terminal-input">Skip to terminal</a>

    <!-- Live 3D room behind the desktop -->
    <canvas ref="threeCanvasRef" class="three-canvas" aria-hidden="true"></canvas>


    <!-- ═══════════ MENU BAR ═══════════ -->
    <header class="menubar">
      <div class="menubar-left">
        <OsIcon name="logo" :size="15" />
        <span class="menubar-appname">GIOnyx</span>
        <span class="menubar-menu">Portfolio</span>
      </div>
      <div class="menubar-right">
        <button
          type="button"
          class="menubar-lights"
          :aria-pressed="lightsOff"
          :title="lightsOff ? 'Turn the room lights on' : 'Turn the room lights off'"
          @click="toggleLights"
        >
          <OsIcon :name="lightsOff ? 'moon' : 'sun'" :size="16" />
          <span class="visually-hidden">Lights off</span>
        </button>
        <span class="menubar-status" aria-hidden="true">
          <OsIcon name="wifi" :size="15" />
          <OsIcon name="battery" :size="17" />
        </span>
        <time class="menubar-clock" :datetime="clockIso">{{ clockText }}</time>
      </div>
    </header>

    <!-- ═══════════ DESKTOP ═══════════ -->
    <main class="desktop">
      <div class="widgets">
        <!-- Pinned profile note -->
        <article class="note">
          <span class="note-pin" aria-hidden="true"></span>
          <img class="note-avatar" :src="profileImg" alt="" width="120" height="120" fetchpriority="high" />
          <h1 class="note-name">
            <button type="button" class="note-open" @click="wm.open('about')">
              {{ profile.name }}
              <span class="visually-hidden">: open About Me</span>
            </button>
          </h1>
          <p class="note-role">{{ profile.role }}</p>
          <button type="button" class="note-status" @click="wm.open('experience')">
            <span class="status-dot" aria-hidden="true"></span>
            <span>{{ profile.currentRole }}</span>
            <OsIcon name="arrow" :size="14" />
          </button>
        </article>

        <DesktopTerminal class="desktop-terminal" :autofocus="!isTouch" />
      </div>
    </main>

    <!-- ═══════════ WINDOWS ═══════════ -->
    <AppWindow v-for="app in apps" :key="app.key" :app="app">
      <AppContent :app="app.key" />
    </AppWindow>

    <!-- ═══════════ DOCK ═══════════ -->
    <Dock />
  </div>
</template>

<style scoped lang="scss">
.home-wrapper {
  /* GIOnyx OS tokens. Every text pairing here passes WCAG AA on --os-surface / --os-bg. */
  --os-bg: #f5efe6;
  --os-surface: #fbf7f0;
  --os-surface-2: #f3e9da;
  --os-chrome: #ece1cf;
  --os-chrome-back: #f3ebdf;
  --os-glass: rgba(248, 242, 233, 0.82);
  --os-line: #e3d6c2;
  --os-line-strong: #cfbea3;
  --os-chip: #efe4d3;
  --os-hover: rgba(95, 86, 70, 0.08);
  --os-ink: #2d2a24; /* 12.5:1 */
  --os-ink-body: #463f34; /* 9.6:1, running text */
  --os-ink-soft: #5f5646; /* 6.3:1, metadata */

  /* Type scale: one step per level of the reading order. */
  --os-text-display: 1.75rem; /* window headline */
  --os-text-title: 1.3125rem; /* featured item */
  --os-text-item: 1.0625rem; /* list item name */
  --os-text-body: 1rem;
  --os-text-meta: 0.875rem;
  --os-text-chip: 0.8125rem;
  --os-label-col: 13.5rem; /* left column for name/label in list rows */
  --os-accent: #ff8400; /* non-text only: pin, status, focus glow */
  --os-accent-ink: #9a4a00; /* 5.5:1, accent for text */
  --os-accent-wash: rgba(255, 132, 0, 0.12);
  --os-link: #006a94; /* 5.3:1 */
  --os-focus: #9a4a00;
  --os-dot-close: #ff5f57;
  --os-dot-min: #febc2e;
  --os-dot-max: #28c840;

  --os-radius-window: 14px;
  --os-shadow-window: 0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 32px 64px -16px rgba(45, 34, 20, 0.28), 0 12px 24px -12px rgba(45, 34, 20, 0.18);
  --os-shadow-window-back: 0 16px 32px -16px rgba(45, 34, 20, 0.18);
  --os-ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  --menubar-h: 34px;
  --dock-h: 72px;

  --os-note: #fffbf3;
  --os-shadow-note: 0 2px 0 rgba(45, 34, 20, 0.04), 0 14px 28px -10px rgba(45, 34, 20, 0.22);

  transition: color 400ms ease;

  :deep(::selection) {
    background: var(--os-ink);
    color: var(--os-bg);
  }
  :deep(button:focus-visible),
  :deep(a:focus-visible) {
    outline: 2px solid var(--os-focus);
    outline-offset: 2px;
    border-radius: 6px;
  }
}

/* ── Lights off: warm dark theme, as if the only light were the monitors ── */
.home-wrapper.lights-off {
  --os-bg: #1d1a16;
  --os-surface: #24201b;
  --os-surface-2: #2d2822;
  --os-chrome: #2b2620;
  --os-chrome-back: #221e19;
  --os-glass: rgba(29, 26, 22, 0.78);
  --os-line: #3a332b;
  --os-line-strong: #4f463b;
  --os-chip: #352f28;
  --os-hover: rgba(255, 240, 220, 0.07);
  --os-ink: #f3eadc; /* 14.8:1 on surface */
  --os-ink-body: #dcd1c0; /* 11.6:1 */
  --os-ink-soft: #b5a893; /* 7.4:1 */
  --os-accent-ink: #ffb454;
  --os-accent-wash: rgba(255, 180, 84, 0.14);
  --os-link: #7cc6ee;
  --os-focus: #ffb454;
  --os-note: #2a2620;
  --os-shadow-note: 0 2px 0 rgba(0, 0, 0, 0.2), 0 18px 32px -10px rgba(0, 0, 0, 0.55);
  --os-shadow-window: 0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 32px 64px -16px rgba(0, 0, 0, 0.6), 0 12px 24px -12px rgba(0, 0, 0, 0.45);
  --os-shadow-window-back: 0 16px 32px -16px rgba(0, 0, 0, 0.5);
}

.skip-link {
  position: fixed;
  top: 6px;
  left: 50%;
  z-index: 2000;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--os-bg);
  background: var(--os-ink);
  border-radius: 8px;
  transform: translate(-50%, -150%);
  transition: transform 160ms var(--os-ease-out);

  &:focus-visible {
    transform: translate(-50%, 0);
  }
}

.three-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}

/* ═══════════ MENU BAR ═══════════ */
.menubar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: var(--menubar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--os-glass);
  backdrop-filter: blur(18px) saturate(1.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
  border-bottom: 1px solid var(--os-line);
  font-size: 13px;
  font-weight: 700;
  color: var(--os-ink);
  animation: os-drop 480ms var(--os-ease-out) backwards;
}
.menubar-left,
.menubar-right,
.menubar-status {
  display: flex;
  align-items: center;
  gap: 10px;
}
.menubar-appname {
  font-weight: 900;
}
.menubar-menu {
  padding-left: 10px;
  border-left: 1px solid var(--os-line-strong);
  color: var(--os-ink-soft);
}
.menubar-status {
  color: var(--os-ink-soft);
}
.menubar-lights {
  display: grid;
  place-items: center;
  width: 28px;
  height: 24px;
  margin-right: 2px;
  border-radius: 6px;
  color: var(--os-ink-soft);
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: var(--os-hover);
    color: var(--os-ink);
  }
  &[aria-pressed="true"] {
    color: var(--os-accent-ink);
  }
}
.menubar-clock {
  font-variant-numeric: tabular-nums;
}

/* ═══════════ DESKTOP ═══════════ */
.desktop {
  position: fixed;
  inset: 0;
  pointer-events: none; /* clicks fall through to the 3D room */
}

.widgets {
  position: absolute;
  top: calc(var(--menubar-h) + clamp(20px, 5vh, 48px));
  bottom: calc(var(--dock-h) + 24px);
  left: clamp(20px, 7vw, 128px);
  width: min(560px, 40vw);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(16px, 3vh, 28px);
}

/* ── Profile note ── */
.note {
  position: relative;
  width: 345px; /* 15% larger than the original 300px note */
  margin-left: clamp(0px, 8vw, 150px);
  padding: 30px 28px 23px;
  text-align: center;
  background: var(--os-note);
  border: 1px solid var(--os-line);
  border-radius: 4px;
  box-shadow: var(--os-shadow-note);
  color: var(--os-ink);
  transform: rotate(-1.5deg);
  pointer-events: auto;
  animation: os-rise 560ms var(--os-ease-out) 260ms backwards;
  transition:
    transform 320ms var(--os-ease-out),
    box-shadow 200ms ease;

  &:hover {
    transform: rotate(0deg) translateY(-2px);
    box-shadow: var(--os-shadow-note);
    filter: brightness(1.02);
  }
}
.note-pin {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #ffb054 0%, var(--os-accent) 45%, #c45f00 100%);
  box-shadow: 0 3px 5px rgba(45, 34, 20, 0.3);
}
.note-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 14px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 24%;
  box-shadow: 0 0 0 3px var(--os-note), 0 0 0 4px var(--os-line-strong);
}
.note-name {
  font-size: 1.3rem;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.note-open {
  font: inherit;
  color: inherit;
  text-wrap: balance;

  /* The whole note opens About Me. */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
  }
}
.note-role {
  margin: 6px 0 14px;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--os-ink-soft);
  text-wrap: balance;
}
.note-status {
  position: relative; /* sits above the stretched About target */
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 46px;
  padding: 0 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--os-ink);
  background: var(--os-accent-wash);
  border-radius: 8px;
  transition: background-color 150ms ease;

  :deep(.os-icon) {
    color: var(--os-accent-ink);
    transition: transform 200ms var(--os-ease-out);
  }
  &:hover {
    background: rgba(255, 132, 0, 0.2);
  }
  &:hover :deep(.os-icon) {
    transform: translateX(3px);
  }
}
.status-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #4f8a3c;
  box-shadow: 0 0 0 0 rgba(79, 138, 60, 0.45);
  animation: status-pulse 2.4s ease-out infinite;
}
@keyframes status-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 138, 60, 0.45);
  }
  70%,
  100% {
    box-shadow: 0 0 0 7px rgba(79, 138, 60, 0);
  }
}

/* ── Terminal widget ── */
.desktop-terminal {
  width: 100%;
  /* Nudged right and down from the note's column. */
  margin: clamp(8px, 2.5vh, 28px) 0 0 clamp(16px, 3.5vw, 64px);
  flex: 1 1 auto;
  min-height: 220px;
  max-height: 420px;
  pointer-events: auto;
  animation: os-rise 560ms var(--os-ease-out) 380ms backwards;
}

/* ═══════════ BOOT ═══════════ */
/* One staggered arrival: menubar, dock, note, terminal. `translate` keeps it independent of hover transforms. */
:deep(.dock) {
  animation: os-rise 520ms var(--os-ease-out) 140ms backwards;
}
@keyframes os-rise {
  from {
    opacity: 0;
    translate: 0 18px;
  }
}
@keyframes os-drop {
  from {
    opacity: 0;
    translate: 0 -100%;
  }
}

/* ═══════════ RESPONSIVE ═══════════ */
@media (max-width: 1100px) {
  .widgets {
    width: min(480px, 46vw);
  }
  .note {
    margin-left: clamp(0px, 4vw, 60px);
  }
}

/* Tablet & phone: the desktop becomes a scrolling column over the room. */
@media (max-width: 900px) {
  .desktop {
    overflow-y: auto;
    pointer-events: auto;
    overscroll-behavior: contain;
  }
  .widgets {
    position: static;
    width: auto;
    max-width: 560px;
    margin: 0 auto;
    padding: calc(var(--menubar-h) + 28px) 16px calc(var(--dock-h) + 32px);
    align-items: center;
  }
  .note {
    margin-left: 0;
  }
  .desktop-terminal {
    margin: 0;
    flex: none;
    height: 300px;
  }
}

@media (max-width: 600px) {
  .home-wrapper {
    --menubar-h: 30px;
    --dock-h: 64px;
  }
  .menubar {
    padding: 0 12px;
    font-size: 12px;
  }
  .menubar-menu {
    display: none;
  }
  .note {
    width: min(345px, 100%);
  }
  .note-avatar {
    width: 92px;
    height: 92px;
  }
  .desktop-terminal {
    height: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .note,
  .desktop-terminal,
  .menubar,
  :deep(.dock) {
    animation: none;
  }
  .note:hover {
    transform: rotate(-1.5deg);
  }
  .status-dot {
    animation: none;
  }
}
</style>

<style lang="scss">
/* The global reset gives buttons a solid border; desktop controls draw their own. Low specificity so components win. */
.home-wrapper :where(button) {
  padding: 0;
  border: 0;
  background: none;
}
</style>
