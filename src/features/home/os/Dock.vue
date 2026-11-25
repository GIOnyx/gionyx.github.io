<script setup lang="ts">
import { apps, profile, type WindowKey } from "./content";
import { useWindowManager } from "./useWindowManager";
import OsIcon, { type OsIconName } from "./OsIcon.vue";

const wm = useWindowManager();

const icons: Record<WindowKey, OsIconName> = {
  about: "user",
  experience: "briefcase",
  projects: "folder",
  skills: "code",
  certifications: "award",
  contact: "mail",
};
</script>

<template>
  <nav class="dock" aria-label="Apps">
    <ul class="dock-shelf">
      <li v-for="app in apps" :key="app.key">
        <button
          type="button"
          class="dock-item"
          :class="{ running: wm.windows[app.key].open }"
          :aria-pressed="wm.isVisible(app.key)"
          :data-tip="app.title"
          @click="wm.toggleFromDock(app.key)"
        >
          <OsIcon :name="icons[app.key]" :size="22" />
          <span class="visually-hidden">{{ app.title }}</span>
        </button>
      </li>
      <li class="dock-divider" aria-hidden="true"></li>
      <li>
        <a class="dock-item" :href="profile.resume" target="_blank" rel="noopener noreferrer" data-tip="Resume (PDF)">
          <OsIcon name="download" :size="22" />
          <span class="visually-hidden">Download resume (PDF)</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.dock {
  position: fixed;
  left: 50%;
  bottom: max(10px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 900;
}

.dock-shelf {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--os-glass);
  backdrop-filter: blur(18px) saturate(1.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
  border: 1px solid var(--os-line-strong);
  border-radius: 20px;
  box-shadow: 0 12px 32px -8px rgba(45, 34, 20, 0.22);
}

.dock-item {
  position: relative;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: var(--os-ink-soft);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition:
    background-color 160ms ease,
    color 160ms ease;

  :deep(.os-icon) {
    transition: transform 240ms var(--os-ease-out);
  }

  &:hover,
  &:focus-visible {
    background: var(--os-hover);
    color: var(--os-ink);
  }
  &:hover :deep(.os-icon) {
    transform: translateY(-3px);
  }
  &:active :deep(.os-icon) {
    transform: translateY(0) scale(0.94);
  }
  &:focus-visible {
    outline: 2px solid var(--os-focus);
    outline-offset: 2px;
  }

  /* Running indicator */
  &.running::after {
    content: "";
    position: absolute;
    bottom: 3px;
    left: 50%;
    width: 4px;
    height: 4px;
    margin-left: -2px;
    border-radius: 50%;
    background: var(--os-accent-ink);
  }
  &[aria-pressed="true"] {
    background: var(--os-hover);
    color: var(--os-ink);
  }

  /* Tooltip, shown on hover and on keyboard focus */
  &::before {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 12px);
    left: 50%;
    padding: 5px 10px;
    border-radius: 8px;
    background: var(--os-ink);
    color: var(--os-bg);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, 4px);
    transition:
      opacity 140ms ease,
      transform 140ms var(--os-ease-out);
  }
  &:hover::before,
  &:focus-visible::before {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.dock-divider {
  width: 1px;
  height: 30px;
  margin: 0 4px;
  background: var(--os-line-strong);
}

@media (hover: none) {
  .dock-item::before {
    display: none;
  }
}

@media (max-width: 600px) {
  .dock-shelf {
    gap: 2px;
    padding: 4px;
    border-radius: 18px;
  }
  .dock-item {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
  .dock-divider {
    height: 26px;
    margin: 0 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dock-item :deep(.os-icon),
  .dock-item::before {
    transition: none;
  }
  .dock-item:hover :deep(.os-icon) {
    transform: none;
  }
}
</style>
