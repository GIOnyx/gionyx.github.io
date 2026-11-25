<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import type { AppMeta } from "./content";
import { useWindowManager } from "./useWindowManager";
import OsIcon from "./OsIcon.vue";

const props = defineProps<{ app: AppMeta }>();

const wm = useWindowManager();
const state = computed(() => wm.windows[props.app.key]);
const visible = computed(() => wm.isVisible(props.app.key));

const winRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const titleId = `win-title-${props.app.key}`;

// Move focus into the window when it opens so keyboard and screen-reader users land in it.
watch(visible, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  bodyRef.value?.focus({ preventScroll: true });
});

// ── Dragging (pointer events cover mouse, pen and touch) ──
let drag: { id: number; dx: number; dy: number } | null = null;

const onPointerDown = (e: PointerEvent) => {
  wm.bringToFront(props.app.key);
  if (e.button !== 0 || state.value.maximized) return;
  // Phone layout: windows are full-width sheets, so there is nothing to drag.
  if (window.matchMedia("(max-width: 600px)").matches) return;
  if ((e.target as HTMLElement).closest(".win-controls")) return;
  const win = winRef.value;
  if (!win) return;
  const rect = win.getBoundingClientRect();
  drag = { id: e.pointerId, dx: e.clientX - rect.left, dy: e.clientY - rect.top };
  win.classList.add("dragging");
  win.style.transform = "none";
  win.style.left = `${rect.left}px`;
  win.style.top = `${rect.top}px`;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};

const onPointerMove = (e: PointerEvent) => {
  if (!drag || e.pointerId !== drag.id || !winRef.value) return;
  const w = winRef.value.offsetWidth;
  // Keep the title bar reachable: below the menubar and at least 80px on screen horizontally.
  const x = Math.min(Math.max(e.clientX - drag.dx, 80 - w), window.innerWidth - 80);
  const y = Math.min(Math.max(e.clientY - drag.dy, 36), window.innerHeight - 120);
  winRef.value.style.left = `${x}px`;
  winRef.value.style.top = `${y}px`;
};

const endDrag = () => {
  drag = null;
  winRef.value?.classList.remove("dragging");
};

// Reset a dragged position once the window is closed, so it reopens centred.
watch(
  () => state.value.open,
  (isOpen) => {
    if (isOpen || !winRef.value) return;
    winRef.value.style.removeProperty("left");
    winRef.value.style.removeProperty("top");
    winRef.value.style.removeProperty("transform");
  },
);

onUnmounted(endDrag);
</script>

<template>
  <section
    ref="winRef"
    :id="`win-${app.key}`"
    class="app-window"
    :class="[
      app.size && `win-${app.size}`,
      { open: state.open, minimizing: state.minimized, maximized: state.maximized, front: wm.isFront(app.key) },
    ]"
    :style="{ zIndex: state.z }"
    role="dialog"
    :aria-labelledby="titleId"
    :aria-hidden="!visible"
    :inert="!visible || undefined"
    @pointerdown.capture="wm.bringToFront(app.key)"
  >
    <header
      class="win-titlebar"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @dblclick="wm.toggleMaximize(app.key)"
    >
      <div class="win-controls">
        <button type="button" class="win-dot close" :aria-label="`Close ${app.title}`" @click="wm.close(app.key)">
          <OsIcon name="close" :size="8" />
        </button>
        <button type="button" class="win-dot minimize" :aria-label="`Minimize ${app.title}`" @click="wm.minimize(app.key)">
          <OsIcon name="minimize" :size="8" />
        </button>
        <button
          type="button"
          class="win-dot maximize"
          :aria-label="state.maximized ? `Restore ${app.title}` : `Maximize ${app.title}`"
          :aria-pressed="state.maximized"
          @click="wm.toggleMaximize(app.key)"
        >
          <OsIcon :name="state.maximized ? 'restore' : 'maximize'" :size="8" />
        </button>
      </div>
      <h2 :id="titleId" class="win-title">{{ app.title }}</h2>
      <span class="win-controls-spacer" aria-hidden="true"></span>
    </header>
    <div ref="bodyRef" class="win-body" tabindex="-1" data-lenis-prevent>
      <div class="win-content"><slot /></div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.app-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -48%) scale(0.96);
  width: 660px;
  max-width: calc(100vw - 32px);
  height: 540px;
  max-height: calc(100dvh - var(--menubar-h) - var(--dock-h) - 40px);
  display: flex;
  flex-direction: column;
  background: var(--os-surface);
  border: 1px solid var(--os-line-strong);
  border-radius: var(--os-radius-window);
  box-shadow: var(--os-shadow-window);
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  color: var(--os-ink);
  transition:
    opacity 180ms var(--os-ease-out),
    transform 220ms var(--os-ease-out),
    box-shadow 200ms ease,
    visibility 0ms 220ms;
}

.app-window.open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
  transition:
    opacity 200ms var(--os-ease-out),
    transform 320ms var(--os-ease-out),
    box-shadow 200ms ease,
    visibility 0ms;
}

/* Background windows recede a little so the focused one reads first. */
.app-window.open:not(.front) {
  box-shadow: var(--os-shadow-window-back);
}
.app-window.open:not(.front) .win-titlebar {
  background: var(--os-chrome-back);
}

.app-window.minimizing {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, 60%) scale(0.4);
  transition:
    opacity 240ms ease-in,
    transform 280ms cubic-bezier(0.55, 0, 0.8, 0.4),
    visibility 0ms 280ms;
}

.app-window.maximized {
  top: calc(var(--menubar-h) + 8px) !important;
  left: 8px !important;
  width: calc(100vw - 16px);
  max-width: none;
  height: calc(100dvh - var(--menubar-h) - var(--dock-h) - 28px);
  max-height: none;
  transform: none !important;
  transition:
    opacity 200ms var(--os-ease-out),
    width 260ms var(--os-ease-out),
    height 260ms var(--os-ease-out),
    top 260ms var(--os-ease-out),
    left 260ms var(--os-ease-out),
    visibility 0ms;
}

.app-window.dragging {
  transition: none !important;
  user-select: none;
}

.win-large {
  width: 860px;
  height: 600px;
}
.win-compact {
  width: 520px;
  height: auto;
  min-height: 380px;
}

/* ── Title bar ── */
.win-titlebar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 14px;
  background: var(--os-chrome);
  border-bottom: 1px solid var(--os-line);
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.dragging .win-titlebar {
  cursor: grabbing;
}
.maximized .win-titlebar {
  cursor: default;
}

.win-controls {
  display: flex;
  gap: 9px;
  width: 72px;
  flex-shrink: 0;
}
.win-controls-spacer {
  width: 72px;
  flex-shrink: 0;
}

.win-dot {
  position: relative;
  width: 15px;
  height: 15px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: rgba(40, 20, 10, 0.72);
  /* A darker rim and a soft drop keep the dots readable on the sand title bar. */
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.16),
    0 1px 2px rgba(45, 34, 20, 0.22);
  transition:
    filter 150ms ease,
    transform 150ms var(--os-ease-out);

  /* 15px dot, 32px hit area. */
  &::before {
    content: "";
    position: absolute;
    inset: -9px -4px;
  }

  :deep(.os-icon) {
    width: 9px;
    height: 9px;
    stroke-width: 2.6;
    opacity: 0;
    transition: opacity 120ms ease;
  }
  &:hover {
    filter: brightness(1.06) saturate(1.1);
    transform: scale(1.08);
  }
  &:active {
    filter: brightness(0.9);
    transform: scale(0.96);
  }
}
.win-dot.close {
  background: var(--os-dot-close);
}
.win-dot.minimize {
  background: var(--os-dot-min);
}
.win-dot.maximize {
  background: var(--os-dot-max);
}
/* Glyphs appear as soon as the pointer is anywhere on the title bar, or a dot has keyboard focus. */
.win-titlebar:hover .win-dot :deep(.os-icon),
.win-controls:focus-within .win-dot :deep(.os-icon) {
  opacity: 1;
}

.win-title {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--os-ink-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.front .win-title {
  color: var(--os-ink);
}

/* ── Body ── */
.win-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: clamp(24px, 4vw, 36px) clamp(20px, 4.5vw, 40px) clamp(28px, 4vw, 40px);
  scrollbar-width: thin;
  scrollbar-color: var(--os-line-strong) transparent;
  scrollbar-gutter: stable;

  letter-spacing: 0.005em;

  /* Focus lands here programmatically when a window opens; controls inside carry their own rings. */
  &:focus,
  &:focus-visible {
    outline: none;
  }
}

/* Content keeps a readable column; a maximized window grows its margins, not its line length. */
.win-content {
  container-type: inline-size;
  max-width: 880px;
  margin-inline: auto;
}

@media (max-width: 900px) {
  .app-window,
  .app-window.win-large,
  .app-window.win-compact {
    width: calc(100vw - 24px);
    height: calc(100dvh - var(--menubar-h) - var(--dock-h) - 32px);
  }
}

@media (max-width: 600px) {
  .app-window,
  .app-window.win-large,
  .app-window.win-compact {
    top: calc(var(--menubar-h) + 8px);
    left: 8px;
    width: calc(100vw - 16px);
    max-width: none;
    height: calc(100dvh - var(--menubar-h) - var(--dock-h) - 24px);
    max-height: none;
    transform: translateY(16px);
  }
  .app-window.open {
    transform: none;
  }
  .app-window.minimizing {
    transform: translateY(60%) scale(0.6);
  }
  .win-titlebar {
    cursor: default;
  }
  .win-body {
    padding: 24px 20px 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-window,
  .app-window.open,
  .app-window.minimizing,
  .app-window.maximized {
    transition:
      opacity 120ms linear,
      visibility 0ms;
  }
}
</style>
