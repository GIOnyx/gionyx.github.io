<script setup lang="ts">
// One stroke icon family (1.8px, round joins) for the whole desktop. Brand marks are filled.
export type OsIconName =
  | "user"
  | "briefcase"
  | "folder"
  | "code"
  | "award"
  | "mail"
  | "download"
  | "arrow"
  | "external"
  | "close"
  | "minimize"
  | "maximize"
  | "restore"
  | "scholar"
  | "trophy"
  | "check"
  | "star"
  | "cloud"
  | "shield"
  | "chip"
  | "sun"
  | "moon"
  | "github"
  | "linkedin"
  | "wifi"
  | "battery"
  | "logo";

defineProps<{ name: OsIconName; size?: number }>();

const brand = new Set<OsIconName>(["github", "linkedin"]);
</script>

<template>
  <svg
    class="os-icon"
    :width="size ?? 20"
    :height="size ?? 20"
    viewBox="0 0 24 24"
    :fill="brand.has(name) ? 'currentColor' : 'none'"
    :stroke="brand.has(name) ? 'none' : 'currentColor'"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'user'"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 0 0-16 0" /></template>
    <template v-else-if="name === 'briefcase'"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></template>
    <template v-else-if="name === 'folder'"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></template>
    <template v-else-if="name === 'code'"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></template>
    <template v-else-if="name === 'award'"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></template>
    <template v-else-if="name === 'mail'"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></template>
    <template v-else-if="name === 'download'"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 18 15 15" /></template>
    <template v-else-if="name === 'arrow'"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></template>
    <template v-else-if="name === 'external'"><path d="M7 17 17 7" /><polyline points="8 7 17 7 17 16" /></template>
    <template v-else-if="name === 'close'"><path d="M7 7l10 10M17 7 7 17" /></template>
    <template v-else-if="name === 'minimize'"><path d="M6 12h12" /></template>
    <template v-else-if="name === 'maximize'"><path d="M12 6v12M6 12h12" /></template>
    <template v-else-if="name === 'restore'"><path d="M9 4v5H4M15 20v-5h5" /></template>
    <template v-else-if="name === 'scholar'"><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></template>
    <template v-else-if="name === 'trophy'"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></template>
    <template v-else-if="name === 'check'"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></template>
    <template v-else-if="name === 'star'"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></template>
    <template v-else-if="name === 'cloud'"><path d="M17.5 19H7a5 5 0 1 1 1.2-9.86A6 6 0 0 1 19.5 11a4 4 0 0 1-2 8z" /></template>
    <template v-else-if="name === 'shield'"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z" /><path d="m9 12 2 2 4-4" /></template>
    <template v-else-if="name === 'chip'"><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></template>
    <template v-else-if="name === 'sun'"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></template>
    <template v-else-if="name === 'moon'"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></template>
    <template v-else-if="name === 'wifi'"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" /></template>
    <template v-else-if="name === 'battery'"><rect x="1" y="6" width="19" height="12" rx="2" /><line x1="23" y1="10" x2="23" y2="14" /><rect x="4" y="9" width="13" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.5" /></template>
    <template v-else-if="name === 'logo'"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M7 6h2" /></template>
    <path
      v-else-if="name === 'github'"
      d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57v-2.23c-3.34.73-4.04-1.42-4.04-1.42a3.18 3.18 0 0 0-1.34-1.75c-1.08-.74.09-.73.09-.73a2.52 2.52 0 0 1 1.84 1.24 2.56 2.56 0 0 0 3.5 1 2.56 2.56 0 0 1 .76-1.6c-2.67-.3-5.47-1.33-5.47-5.93a4.64 4.64 0 0 1 1.24-3.22 4.3 4.3 0 0 1 .12-3.18s1-.32 3.3 1.23a11.38 11.38 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23a4.3 4.3 0 0 1 .12 3.18 4.64 4.64 0 0 1 1.24 3.22c0 4.61-2.81 5.63-5.48 5.93a2.86 2.86 0 0 1 .82 2.22v3.29c0 .32.22.7.83.57A12 12 0 0 0 12 .3"
    />
    <path
      v-else-if="name === 'linkedin'"
      d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56zM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.76 1.76 0 0 0 24 22.27V1.73A1.76 1.76 0 0 0 22.22 0z"
    />
  </svg>
</template>

<style scoped>
.os-icon {
  display: block;
  flex-shrink: 0;
}
</style>
