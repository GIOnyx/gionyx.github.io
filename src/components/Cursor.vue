<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import ArrowRightLong from "./icons/ArrowRightLong.vue";
import { path, projectId } from "../composables/useRouteObserver";
import { raycast } from "../three/utils/raycast";

type CursorType = "circle-black" | "arrow" | "arrow-external" | "circle-white" | null;

const VALID_CURSORS = new Set<string>(["circle-black", "arrow", "arrow-external", "circle-white"]);

const cursorWrapperRef = ref<HTMLElement | null>(null);
const cursorScaleRef = ref<HTMLElement | null>(null);
const cursorType = ref<CursorType>(null);
const isEnabled = ref(true);

// Non-reactive mutable state to avoid Vue reactivity overhead on every pointermove / frame
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;
let currentScale = 0;
let lastRenderedX = NaN;
let lastRenderedY = NaN;
let lastRenderedScale = NaN;
let isVisible = false;
let detectedType: CursorType = null;
let lastPointerType = "mouse";
let rafId: number | null = null;
let lastFrameTime = 0;

let reducedMotionQuery: MediaQueryList | null = null;
let coarsePointerQuery: MediaQueryList | null = null;

const POS_SMOOTHING = 16; // Exponential smoothing rate (frame-rate independent)
const SCALE_SMOOTHING = 20;

const checkCursorAttribute = (target: EventTarget | null): CursorType => {
  if (!(target instanceof Element)) return null;
  const match = target.closest<HTMLElement>("[data-cursor]");
  if (!match) return null;
  const cursor = match.dataset.cursor;
  return cursor && VALID_CURSORS.has(cursor) ? (cursor as CursorType) : null;
};

const updateEnabledState = () => {
  const prefersReducedMotion = reducedMotionQuery?.matches ?? false;
  const isCoarsePointer = coarsePointerQuery?.matches ?? false;
  const shouldEnable = !prefersReducedMotion && !isCoarsePointer && lastPointerType !== "touch";

  isEnabled.value = shouldEnable;

  if (shouldEnable) {
    startLoop();
  } else {
    stopLoop();
    isVisible = false;
    currentScale = 0;
    if (cursorType.value !== null) {
      cursorType.value = null;
    }
    if (cursorScaleRef.value) {
      cursorScaleRef.value.style.transform = "scale3d(0, 0, 1)";
      lastRenderedScale = 0;
    }
  }
};

const tick = (now: number) => {
  rafId = requestAnimationFrame(tick);

  if (!lastFrameTime) {
    lastFrameTime = now;
  }
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;

  const hoveringBox = raycast.getHoveringBox();
  let nextType: CursorType = null;

  if (hoveringBox) {
    nextType = "circle-black";
  } else if (detectedType) {
    nextType = detectedType;
  }

  const nextVisible = nextType !== null;
  if (nextVisible && !isVisible) {
    // Snap immediately to pointer on reveal so cursor doesn't fly in from stale coords
    currentX = mouseX;
    currentY = mouseY;
  }
  isVisible = nextVisible;

  if (cursorType.value !== nextType) {
    cursorType.value = nextType;
  }

  // Frame-rate-independent exponential lerp
  const posAlpha = 1 - Math.exp(-POS_SMOOTHING * dt);
  const scaleAlpha = 1 - Math.exp(-SCALE_SMOOTHING * dt);

  const dx = mouseX - currentX;
  const dy = mouseY - currentY;
  if (Math.abs(dx) < 0.05) {
    currentX = mouseX;
  } else {
    currentX += dx * posAlpha;
  }
  if (Math.abs(dy) < 0.05) {
    currentY = mouseY;
  } else {
    currentY += dy * posAlpha;
  }

  const targetScale = isVisible ? 1 : 0;
  const ds = targetScale - currentScale;
  if (Math.abs(ds) < 0.005) {
    currentScale = targetScale;
  } else {
    currentScale += ds * scaleAlpha;
  }

  // Only write DOM styles when values actually changed
  const roundedX = Math.round(currentX * 100) / 100;
  const roundedY = Math.round(currentY * 100) / 100;
  if (cursorWrapperRef.value && (roundedX !== lastRenderedX || roundedY !== lastRenderedY)) {
    cursorWrapperRef.value.style.transform = `translate3d(${roundedX}px, ${roundedY}px, 0)`;
    lastRenderedX = roundedX;
    lastRenderedY = roundedY;
  }

  const roundedScale = Math.round(currentScale * 1000) / 1000;
  if (cursorScaleRef.value && roundedScale !== lastRenderedScale) {
    cursorScaleRef.value.style.transform = `scale3d(${roundedScale}, ${roundedScale}, 1)`;
    lastRenderedScale = roundedScale;
  }
};

const startLoop = () => {
  if (rafId !== null) return;
  lastFrameTime = 0;
  rafId = requestAnimationFrame(tick);
};

const stopLoop = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const handlePointerMove = (e: PointerEvent) => {
  if (e.pointerType === "touch") {
    if (lastPointerType !== "touch") {
      lastPointerType = "touch";
      updateEnabledState();
    }
    return;
  }

  if (lastPointerType === "touch") {
    lastPointerType = e.pointerType || "mouse";
    updateEnabledState();
  }

  mouseX = e.clientX;
  mouseY = e.clientY;
  detectedType = checkCursorAttribute(e.target);
};

const handlePointerLeave = () => {
  detectedType = null;
};

onMounted(() => {
  mouseX = window.innerWidth / 2;
  mouseY = window.innerHeight / 2;
  currentX = mouseX;
  currentY = mouseY;

  reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  coarsePointerQuery = window.matchMedia("(pointer: coarse)");

  reducedMotionQuery.addEventListener("change", updateEnabledState);
  coarsePointerQuery.addEventListener("change", updateEnabledState);

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.addEventListener("pointerleave", handlePointerLeave, { passive: true });
  window.addEventListener("blur", handlePointerLeave, { passive: true });

  updateEnabledState();
});

// Watch for route changes and reset cursor
watch(
  () => path.value,
  () => {
    isVisible = false;
    detectedType = null;
    cursorType.value = null;
  },
);

onUnmounted(() => {
  stopLoop();
  window.removeEventListener("pointermove", handlePointerMove);
  document.removeEventListener("pointerleave", handlePointerLeave);
  window.removeEventListener("blur", handlePointerLeave);
  reducedMotionQuery?.removeEventListener("change", updateEnabledState);
  coarsePointerQuery?.removeEventListener("change", updateEnabledState);
});
</script>

<template>
  <div
    v-show="isEnabled"
    ref="cursorWrapperRef"
    class="cursor-wrapper"
    :class="{ [`project-${projectId}`]: projectId !== null }"
    aria-hidden="true"
  >
    <div ref="cursorScaleRef" class="cursor-scale">
      <div class="cursor cursor-circle-black" :class="{ 'cursor-active': cursorType === 'circle-black' }" />
      <div class="cursor cursor-circle-white" :class="{ 'cursor-active': cursorType === 'circle-white' }" />
      <div class="cursor cursor-arrow" :class="{ 'cursor-active': cursorType === 'arrow' }">
        <ArrowRightLong class="cursor-arrow-icon" />
      </div>
      <div class="cursor cursor-arrow-external" :class="{ 'cursor-active': cursorType === 'arrow-external' }">
        <ArrowRightLong class="cursor-arrow-external-icon" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cursor-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
  contain: layout style;
  display: none;

  // Hide cursor on touch devices
  @include mixins.hover {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    display: none !important;
  }
}

.cursor-scale {
  position: relative;
  transform-origin: center;
  will-change: transform;
  transform: scale3d(0, 0, 1);
}

.cursor {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.1s ease-in-out;

  &-active {
    opacity: 1;
  }

  &-circle-black {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 4px solid var(--color-text-400);
  }

  &-circle-white {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 4px solid var(--color-white-400);
  }

  &-arrow {
    width: 54px;
    height: 54px;
    transition:
      background-color 0.1s ease-in-out,
      opacity 0.1s ease-in-out;
    background-color: var(--color-accent-400, var(--color-orange-400));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    //border: var(--stroke-md) solid var(--color-white-400);

    &-icon {
      color: var(--color-accent-text-400, var(--color-white-400));
      --icon-color: var(--color-accent-text-400, var(--color-white-400));
      width: 24px;
    }
  }

  &-arrow-external {
    width: 54px;
    height: 54px;
    transition:
      background-color 0.1s ease-in-out,
      opacity 0.1s ease-in-out;
    background-color: var(--color-accent-400, var(--color-orange-400));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    //border: var(--stroke-md) solid var(--color-white-400);

    &-icon {
      color: var(--color-accent-text-400, var(--color-white-400));
      --icon-color: var(--color-accent-text-400, var(--color-white-400));
      width: 24px;
      transform: rotate(-45deg);
    }
  }
}
</style>
