import { reactive, ref } from "vue";
import { apps, type WindowKey } from "./content";

interface WindowState {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  z: number;
}

const BASE_Z = 100;

const windows = reactive(
  Object.fromEntries(apps.map((a) => [a.key, { open: false, minimized: false, maximized: false, z: BASE_Z }])) as Record<
    WindowKey,
    WindowState
  >,
);

const topZ = ref(BASE_Z);
/** Element focused before a window opened, so focus can return when it closes. */
const returnFocus = new Map<WindowKey, HTMLElement | null>();

const isVisible = (key: WindowKey) => windows[key].open && !windows[key].minimized;

const isFront = (key: WindowKey) => isVisible(key) && windows[key].z === topZ.value;

const bringToFront = (key: WindowKey) => {
  // Already the unique top window (every window starts at BASE_Z, so BASE_Z itself is never "top").
  if (windows[key].z === topZ.value && topZ.value > BASE_Z) return;
  topZ.value += 1;
  windows[key].z = topZ.value;
};

const open = (key: WindowKey) => {
  if (!isVisible(key)) returnFocus.set(key, document.activeElement as HTMLElement | null);
  windows[key].open = true;
  windows[key].minimized = false;
  bringToFront(key);
};

const restoreFocus = (key: WindowKey) => {
  const el = returnFocus.get(key);
  returnFocus.delete(key);
  if (el && document.contains(el)) el.focus({ preventScroll: true });
};

const close = (key: WindowKey) => {
  windows[key].open = false;
  windows[key].maximized = false;
  windows[key].minimized = false;
  restoreFocus(key);
};

const minimize = (key: WindowKey) => {
  windows[key].minimized = true;
  restoreFocus(key);
};

const toggleMaximize = (key: WindowKey) => {
  windows[key].maximized = !windows[key].maximized;
  bringToFront(key);
};

/** Dock behaviour: open, raise, or minimize when already in front. */
const toggleFromDock = (key: WindowKey) => {
  if (!isVisible(key)) open(key);
  else if (isFront(key)) minimize(key);
  else bringToFront(key);
};

const frontmost = (): WindowKey | null => {
  let best: WindowKey | null = null;
  for (const a of apps) {
    if (isVisible(a.key) && (!best || windows[a.key].z > windows[best].z)) best = a.key;
  }
  return best;
};

export const useWindowManager = () => ({
  windows,
  isVisible,
  isFront,
  open,
  close,
  minimize,
  toggleMaximize,
  bringToFront,
  toggleFromDock,
  frontmost,
});
