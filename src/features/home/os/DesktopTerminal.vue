<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { apps, certifications, contacts, experience, profile, projects, skillGroups, type WindowKey } from "./content";
import { useWindowManager } from "./useWindowManager";
import { lightsOff, setLights, toggleLights } from "../../../composables/useLights";

const props = defineProps<{ autofocus?: boolean }>();

type LineKind = "input" | "output" | "dim" | "error" | "accent";
interface Line {
  kind: LineKind;
  text: string;
}

const wm = useWindowManager();
const PROMPT = "guest@gionyx:~$";
const greeting = (): Line[] => [
  { kind: "accent", text: "GIOnyx OS 1.1 (tty1)" },
  { kind: "dim", text: "Type 'help' for commands, or 'open projects' to jump in." },
];

const lines = ref<Line[]>(greeting());
const input = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const history: string[] = [];
let historyIndex = -1;

const windowKeys = apps.map((a) => a.key);
const commands = ["help", "about", "experience", "skills", "projects", "certs", "contact", "open", "resume", "lights", "whoami", "clear"] as const;

const out = (kind: LineKind, ...texts: string[]) => texts.forEach((text) => lines.value.push({ kind, text }));

const openApp = (name: string) => {
  const key = (name === "certs" ? "certifications" : name) as WindowKey;
  if (!windowKeys.includes(key)) {
    out("error", `open: no such app '${name}'. Try: ${windowKeys.join(", ")}`);
    return;
  }
  out("dim", `Opening ${apps.find((a) => a.key === key)!.title}…`);
  wm.open(key);
};

const run = (raw: string) => {
  const cmd = raw.trim();
  lines.value.push({ kind: "input", text: `${PROMPT} ${cmd}` });
  if (!cmd) return;
  history.unshift(cmd);
  historyIndex = -1;

  const [name = "", ...args] = cmd.toLowerCase().split(/\s+/);
  switch (name) {
    case "help":
      out(
        "output",
        "about        who I am",
        "experience   internship & leadership highlights",
        "skills       technical toolkit",
        "projects     selected work",
        "certs        certifications & awards",
        "contact      email and socials",
        "open <app>   open a window, e.g. 'open projects'",
        "resume       download my resume (PDF)",
        "lights       toggle the room lights (or 'lights on' / 'lights off')",
        "clear        clear the screen",
      );
      out("dim", "Tip: ↑/↓ for history, Tab to complete.");
      break;
    case "about":
    case "whoami":
      out("accent", profile.fullName);
      out("output", `${profile.role}. ${profile.education}.`);
      out("output", "I build production web apps, real-time systems, and AI-enabled workflow automation with React, Node.js, Python, MongoDB, n8n, and ServiceNow.");
      break;
    case "experience":
      out("accent", `${experience.company}: ${experience.role}`);
      out("dim", `${experience.dates}, ${experience.project}`);
      experience.highlights.forEach((h) => out("output", `- ${h.title}`));
      out("dim", "Run 'open experience' for the full write-up.");
      break;
    case "skills":
      skillGroups.forEach((g) => out("output", `${g.title.padEnd(26)} ${g.items.join(", ")}`));
      break;
    case "projects":
      projects.forEach((p) => out("output", `${p.name.padEnd(28)} ${p.kind}`));
      out("dim", "Run 'open projects' to browse links and repos.");
      break;
    case "certs":
    case "certifications":
      certifications.forEach((c) => out("output", `- ${c.title}${c.detail ? ` (${c.detail})` : ""}`));
      break;
    case "contact":
      contacts.forEach((c) => out("output", `${c.label.padEnd(10)} ${c.value}`));
      break;
    case "open":
      if (!args[0]) out("error", `open: which app? Try: ${windowKeys.join(", ")}`);
      else openApp(args[0]);
      break;
    case "resume": {
      out("dim", "Downloading resume…");
      const a = document.createElement("a");
      a.href = profile.resume;
      a.download = profile.resume.slice(1);
      a.click();
      break;
    }
    case "lights": {
      if (args[0] === "on") setLights(true);
      else if (args[0] === "off") setLights(false);
      else toggleLights();
      out("dim", lightsOff.value ? "Lights off. The monitors will do." : "Lights on.");
      break;
    }
    case "clear":
      lines.value = greeting();
      break;
    case "sudo":
      out("error", "guest is not in the sudoers file. This incident will be reported.");
      break;
    default:
      if ((windowKeys as string[]).includes(name)) openApp(name);
      else out("error", `gionyx-sh: command not found: ${name}. Type 'help' for the list.`);
  }
};

const scrollToEnd = async () => {
  await nextTick();
  if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
};

const submit = () => {
  run(input.value);
  input.value = "";
  scrollToEnd();
};

const complete = () => {
  const value = input.value.toLowerCase();
  const parts = value.split(/\s+/);
  const pool: readonly string[] = parts.length > 1 && parts[0] === "open" ? windowKeys : commands;
  const stem = parts[parts.length - 1] ?? "";
  const matches = pool.filter((c) => c.startsWith(stem));
  if (matches.length === 1) {
    parts[parts.length - 1] = matches[0]!;
    input.value = parts.join(" ") + (parts.length === 1 && matches[0] === "open" ? " " : "");
  } else if (matches.length > 1) {
    lines.value.push({ kind: "input", text: `${PROMPT} ${input.value}` }, { kind: "dim", text: matches.join("  ") });
    scrollToEnd();
  }
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Tab" && input.value.trim()) {
    e.preventDefault();
    complete();
  } else if (e.key === "ArrowUp" && history.length) {
    e.preventDefault();
    historyIndex = Math.min(historyIndex + 1, history.length - 1);
    input.value = history[historyIndex] ?? "";
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    historyIndex = Math.max(historyIndex - 1, -1);
    input.value = historyIndex === -1 ? "" : (history[historyIndex] ?? "");
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    lines.value = greeting();
  }
};

// Clicking the screen focuses the prompt, unless the visitor is selecting text to copy.
const focusPrompt = () => {
  if (justDragged || window.getSelection()?.toString()) return;
  inputRef.value?.focus({ preventScroll: true });
};

// ── Dragging by the title bar (desktop layout only) ──
const rootRef = ref<HTMLElement | null>(null);
const moved = ref(false);
let drag: { id: number; dx: number; dy: number; startX: number; startY: number; live: boolean } | null = null;
let justDragged = false;

const onBarDown = (e: PointerEvent) => {
  if (e.button !== 0 || window.matchMedia("(max-width: 900px)").matches || !rootRef.value) return;
  const r = rootRef.value.getBoundingClientRect();
  drag = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, startX: e.clientX, startY: e.clientY, live: false };
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};

const onBarMove = (e: PointerEvent) => {
  const el = rootRef.value;
  if (!drag || e.pointerId !== drag.id || !el) return;
  if (!drag.live) {
    // Small threshold so a plain click on the bar still just focuses the prompt.
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 4) return;
    const r = el.getBoundingClientRect();
    el.style.width = `${r.width}px`;
    el.style.height = `${r.height}px`;
    moved.value = true;
    drag.live = true;
  }
  const w = el.offsetWidth;
  const x = Math.min(Math.max(e.clientX - drag.dx, 80 - w), window.innerWidth - 80);
  const y = Math.min(Math.max(e.clientY - drag.dy, 40), window.innerHeight - 80);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
};

const onBarUp = () => {
  if (drag?.live) {
    justDragged = true;
    setTimeout(() => (justDragged = false), 0);
  }
  drag = null;
};

// Double-click the title bar to put the terminal back in its spot.
const resetPosition = () => {
  const el = rootRef.value;
  if (!el) return;
  ["left", "top", "width", "height"].forEach((p) => el.style.removeProperty(p));
  moved.value = false;
};

const onResize = () => {
  if (moved.value && window.matchMedia("(max-width: 900px)").matches) resetPosition();
};
onMounted(() => window.addEventListener("resize", onResize));
onUnmounted(() => window.removeEventListener("resize", onResize));
</script>

<template>
  <section ref="rootRef" class="terminal" :class="{ moved }" aria-label="Terminal" @click="focusPrompt">
    <header
      class="terminal-bar"
      title="Drag to move, double-click to reset"
      @pointerdown="onBarDown"
      @pointermove="onBarMove"
      @pointerup="onBarUp"
      @pointercancel="onBarUp"
      @dblclick="resetPosition"
    >
      <span class="terminal-lights" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="terminal-title">guest@gionyx: ~</span>
      <span class="terminal-lights-spacer" aria-hidden="true"></span>
    </header>
    <div ref="bodyRef" class="terminal-body" data-lenis-prevent>
      <div class="terminal-log" role="log" aria-live="polite">
        <p v-for="(line, i) in lines" :key="i" :class="['line', line.kind]">{{ line.text }}</p>
      </div>
      <form class="prompt" @submit.prevent="submit">
        <label for="terminal-input" class="prompt-label">{{ PROMPT }}</label>
        <input
          id="terminal-input"
          ref="inputRef"
          v-model="input"
          name="command"
          type="text"
          class="prompt-input"
          :autofocus="props.autofocus"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          enterkeyhint="send"
          @keydown="onKeydown"
        />
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
.terminal {
  --term-bg: #26221c;
  --term-bar: #1e1b16;
  --term-text: #e8dcc8;
  --term-dim: #b9ad98;
  --term-accent: #ffb454;
  --term-prompt: #9fc28e;
  --term-error: #ff9e8a;

  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--term-bg);
  border: 1px solid #3a342b;
  border-radius: 10px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 24px 48px -12px rgba(45, 34, 20, 0.35),
    0 8px 16px -8px rgba(45, 34, 20, 0.25);
  font-family: "ProFontWindows", ui-monospace, "Cascadia Mono", Consolas, monospace;
  font-size: 15px;
  line-height: 1.5;
  letter-spacing: 0;
  color: var(--term-text);
  cursor: text;

  ::selection {
    background: var(--term-accent);
    color: var(--term-bg);
  }
}

.terminal-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  background: var(--term-bar);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: grab;
  touch-action: none;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}

/* Once dragged, the terminal floats free of the desktop column. */
.terminal.moved {
  position: fixed;
  z-index: 60;
  margin: 0;
  max-height: none;
}

@media (max-width: 900px) {
  .terminal-bar {
    cursor: default;
  }
}
.terminal-lights {
  display: flex;
  gap: 6px;
  width: 48px;

  i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4a4238;
  }
}
.terminal-lights-spacer {
  width: 48px;
}
.terminal-title {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: var(--term-dim);
}

.terminal-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 14px 16px 16px;
  scrollbar-width: thin;
  scrollbar-color: #4a4238 transparent;
}

.line {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin: 0;
}
.line.input {
  color: var(--term-text);
  margin-top: 8px;
}
.line.input:first-child {
  margin-top: 0;
}
.line.dim {
  color: var(--term-dim);
}
.line.accent {
  color: var(--term-accent);
}
.line.error {
  color: var(--term-error);
}

.prompt {
  display: flex;
  align-items: baseline;
  gap: 1ch;
  margin-top: 8px;
}
.prompt-label {
  flex-shrink: 0;
  color: var(--term-prompt);
  cursor: text;
}
.prompt-input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  color: var(--term-text);
  caret-color: var(--term-accent);

  &:focus {
    outline: none;
  }
}
.terminal:has(.prompt-input:focus-visible) {
  border-color: var(--term-accent);
}
</style>
