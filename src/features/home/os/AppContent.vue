<script setup lang="ts">
import { certifications, contacts, experience, profile, projects, skillGroups, type Project, type WindowKey } from "./content";
import { useWindowManager } from "./useWindowManager";
import { useRouter } from "../../../composables/useRouter";
import OsIcon from "./OsIcon.vue";
import profileImg from "../../../assets/images/profile.jpg";

defineProps<{ app: WindowKey }>();

const wm = useWindowManager();
const router = useRouter();

const featured = projects.find((p) => p.featured)!;
const others = projects.filter((p) => !p.featured);

const openCaseStudy = (p: Project) => router.push(`/projects/${p.slug}`);
const linkLabel = (url: string) => {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host === "github.com") return "View repository";
  if (host.endsWith("figma.com")) return "Open in Figma";
  return "Visit live site";
};
</script>

<template>
  <!-- ── About ── -->
  <div v-if="app === 'about'" class="about">
    <header class="about-head">
      <img class="about-photo" :src="profileImg" :alt="profile.name" width="96" height="96" />
      <div>
        <h3 class="display">{{ profile.fullName }}</h3>
        <p class="lede">{{ profile.role }}</p>
      </div>
    </header>

    <dl class="facts">
      <div><dt>Studying</dt><dd>{{ profile.education }}</dd></div>
      <div><dt>Latest role</dt><dd>Lead Dev Intern</dd></div>
      <div><dt>Scholarship</dt><dd>{{ profile.scholar }}</dd></div>
    </dl>

    <div class="prose">
      <p class="prose-lead">
        I'm an Information Technology student and full-stack developer building production web applications, real-time systems, and
        AI-enabled workflow automation.
      </p>
      <p>
        I work across React, Node.js, Python, MongoDB, n8n, and ServiceNow, and I've led multi-release enterprise platforms and mentored
        developer teams.
      </p>
      <p>
        Most recently I was <strong>Full-Stack Developer Intern (Lead Developer)</strong> at <strong>The Umonics Method</strong>, where I
        led 5 production releases (v3.5.0–v3.10.0) of the Umonics Integrated System across Vercel and Render and mentored 3 incoming
        developer interns.
      </p>
      <p>
        I care about streamlining operational workflows, and I use modern AI engineering tools (Antigravity, Gemini, Claude, GitHub
        Copilot) to ship reliable, maintainable, well-automated software.
      </p>
    </div>

    <div class="actions">
      <button type="button" class="btn btn-primary" @click="wm.open('experience')">
        Read the internship write-up <OsIcon name="arrow" :size="16" />
      </button>
      <a class="btn" :href="profile.resume" download>Download resume <OsIcon name="download" :size="16" /></a>
    </div>
  </div>

  <!-- ── Experience ── -->
  <div v-else-if="app === 'experience'" class="experience">
    <header class="window-head exp-head">
      <div>
        <h3 class="display">{{ experience.company }}</h3>
        <p class="lede">{{ experience.role }}</p>
        <p class="head-note">
          <strong>{{ experience.project }}</strong>, an {{ experience.projectNote }}
        </p>
      </div>
      <p class="exp-dates"><time>{{ experience.dates }}</time></p>
    </header>

    <ul class="rows">
      <li v-for="h in experience.highlights" :key="h.title" class="row">
        <h4 class="row-label">{{ h.title }}</h4>
        <p class="row-body">{{ h.body }}</p>
      </li>
      <li class="row">
        <h4 class="row-label">Tech stack</h4>
        <ul class="chips row-body">
          <li v-for="s in experience.stack" :key="s" translate="no">{{ s }}</li>
        </ul>
      </li>
    </ul>
  </div>

  <!-- ── Projects ── -->
  <div v-else-if="app === 'projects'" class="projects">
    <header class="window-head">
      <h3 class="display">Selected work</h3>
      <p class="intro">Academic, full-stack, mobile, and automation work. Each entry links to its repo, live site, or write-up.</p>
    </header>

    <article class="featured">
      <h4 class="featured-name">{{ featured.name }}</h4>
      <p class="meta">{{ featured.kind }}</p>
      <p class="featured-summary">{{ featured.summary }}</p>
      <ul class="chips">
        <li v-for="s in featured.stack" :key="s" translate="no">{{ s }}</li>
      </ul>
      <button type="button" class="btn btn-primary" @click="wm.open(featured.opens!)">
        Read the internship write-up <OsIcon name="arrow" :size="16" />
      </button>
    </article>

    <ul class="rows">
      <li v-for="p in others" :key="p.slug" class="row project">
        <div class="row-label">
          <h4 class="project-name">
            <a v-if="p.url" class="project-link" :href="p.url" target="_blank" rel="noopener noreferrer">
              {{ p.name }}
              <OsIcon name="external" :size="15" />
              <span class="visually-hidden">({{ linkLabel(p.url) }}, opens in a new tab)</span>
            </a>
            <button v-else type="button" class="project-link" @click="openCaseStudy(p)">
              {{ p.name }} <OsIcon name="arrow" :size="15" />
              <span class="visually-hidden">(read case study)</span>
            </button>
          </h4>
          <p class="meta">{{ p.kind }}</p>
        </div>
        <div class="row-body">
          <p>{{ p.summary }}</p>
          <p class="stack" translate="no">{{ p.stack.join(", ") }}</p>
        </div>
      </li>
    </ul>
  </div>

  <!-- ── Skills ── -->
  <div v-else-if="app === 'skills'" class="skills">
    <header class="window-head">
      <h3 class="display">Technical toolkit</h3>
      <p class="intro">Languages, frameworks, databases, automation platforms, and tools I use across full-stack, real-time, and AI workflow projects.</p>
    </header>
    <dl class="rows">
      <div v-for="g in skillGroups" :key="g.title" class="row">
        <dt class="row-label">{{ g.title }}</dt>
        <dd class="row-body">
          <ul class="chips">
            <li v-for="s in g.items" :key="s" translate="no">{{ s }}</li>
          </ul>
        </dd>
      </div>
    </dl>
  </div>

  <!-- ── Certifications ── -->
  <div v-else-if="app === 'certifications'" class="certs">
    <header class="window-head">
      <h3 class="display">Recognition &amp; credentials</h3>
    </header>
    <ul class="cert-list">
      <li v-for="c in certifications" :key="c.title" class="cert">
        <span class="cert-icon"><OsIcon :name="c.icon" :size="22" /></span>
        <div>
          <h4>{{ c.title }}</h4>
          <p v-if="c.detail" class="meta">{{ c.detail }}</p>
          <a v-if="c.url" class="text-link" :href="c.url" target="_blank" rel="noopener noreferrer">
            {{ c.source === "Credly" ? "View badge" : "View certificate" }} on {{ c.source }} <OsIcon name="external" :size="14" />
            <span class="visually-hidden">(opens in a new tab)</span>
          </a>
        </div>
      </li>
    </ul>
  </div>

  <!-- ── Contact ── -->
  <div v-else-if="app === 'contact'" class="contact">
    <header class="window-head">
      <h3 class="display">Let's build something practical.</h3>
      <p class="intro">I'm open to collaborations, software development, and technical projects.</p>
    </header>
    <ul class="contact-list">
      <li v-for="c in contacts" :key="c.label">
        <a
          class="contact-row"
          :href="c.href"
          :target="c.external ? '_blank' : undefined"
          :rel="c.external ? 'noopener noreferrer' : undefined"
        >
          <span class="contact-icon"><OsIcon :name="c.icon" :size="20" /></span>
          <span class="contact-text">
            <span class="contact-label">{{ c.label }}</span>
            <span class="contact-value" translate="no">{{ c.value }}</span>
          </span>
          <OsIcon :name="c.external ? 'external' : 'arrow'" :size="16" />
          <span v-if="c.external" class="visually-hidden">(opens in a new tab)</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
/* Reading order in every window: headline → lede/intro → rows (label left, content right) → metadata. */

/* ── Type roles ── */
.display {
  font-size: var(--os-text-display);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--os-ink);
  text-wrap: balance;
}
.lede {
  margin-top: 8px;
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--os-accent-ink);
}
.intro {
  max-width: 60ch;
  margin-top: 10px;
  font-size: var(--os-text-body);
  line-height: 1.6;
  color: var(--os-ink-soft);
  text-wrap: pretty;
}
.head-note {
  margin-top: 10px;
  font-size: var(--os-text-meta);
  line-height: 1.5;
  color: var(--os-ink-soft);

  strong {
    font-weight: 700;
    color: var(--os-ink);
  }
}
.meta {
  margin-top: 4px;
  font-size: var(--os-text-meta);
  font-weight: 700;
  line-height: 1.4;
  color: var(--os-ink-soft);
}
.window-head {
  margin-bottom: 32px;
}

/* ── Rows: one list pattern shared by experience, projects and skills ── */
.rows {
  margin: 0;
  padding: 0;
  list-style: none;
}
.row {
  position: relative;
  display: grid;
  grid-template-columns: var(--os-label-col) minmax(0, 1fr);
  gap: 8px 32px;
  padding: 22px 0;
  border-top: 1px solid var(--os-line);

  &:last-child {
    padding-bottom: 4px;
  }
}
.row-label {
  margin: 0;
  font-size: var(--os-text-item);
  font-weight: 900;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--os-ink);
}
.row-body {
  margin: 0;
  max-width: 62ch;
  font-size: var(--os-text-body);
  line-height: 1.65;
  color: var(--os-ink-body);
  text-wrap: pretty;

  p {
    margin: 0;
  }
}

/* ── Prose ── */
.prose {
  max-width: 62ch;

  p {
    margin-bottom: 16px;
    font-size: var(--os-text-body);
    line-height: 1.7;
    color: var(--os-ink-body);
    text-wrap: pretty;
  }
  .prose-lead {
    font-size: 1.1875rem;
    line-height: 1.5;
    color: var(--os-ink);
  }
  strong {
    font-weight: 700;
    color: var(--os-ink);
  }
}

/* ── Chips ── */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding: 4px 10px;
    font-size: var(--os-text-chip);
    font-weight: 700;
    line-height: 1.4;
    color: var(--os-ink-soft);
    background: var(--os-chip);
    border-radius: 999px;
  }
}

/* ── Buttons & links ── */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--os-ink);
  background: transparent;
  border: 1px solid var(--os-line-strong);
  border-radius: 12px;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;

  :deep(.os-icon) {
    transition: transform 200ms var(--os-ease-out);
  }
  &:hover {
    background: var(--os-hover);
    border-color: var(--os-ink-soft);
  }
  &:hover :deep(.os-icon) {
    transform: translateX(3px);
  }
}
.btn-primary {
  color: var(--os-bg);
  background: var(--os-ink);
  border-color: var(--os-ink);

  &:hover {
    background: color-mix(in srgb, var(--os-ink) 86%, var(--os-bg));
    border-color: color-mix(in srgb, var(--os-ink) 86%, var(--os-bg));
  }
}
.text-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: var(--os-text-meta);
  font-weight: 700;
  color: var(--os-link);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;

  &:hover {
    text-decoration-thickness: 2px;
  }
}

/* ── About ── */
.about-head {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 28px;
}
.about-photo {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 24%;
  box-shadow: 0 0 0 3px var(--os-surface), 0 0 0 4px var(--os-line-strong);
}
.facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 0 0 32px;
  background: var(--os-line);
  border: 1px solid var(--os-line);
  border-radius: 12px;
  overflow: hidden;

  div {
    padding: 12px 16px;
    background: var(--os-surface);
  }
  dt {
    font-size: var(--os-text-chip);
    font-weight: 700;
    color: var(--os-ink-soft);
  }
  dd {
    margin: 3px 0 0;
    font-size: var(--os-text-body);
    font-weight: 700;
    color: var(--os-ink);
  }
}

/* ── Experience ── */
.exp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.exp-dates {
  flex-shrink: 0;
  margin-top: 4px;
  padding: 5px 12px;
  font-size: var(--os-text-meta);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--os-ink);
  border: 1px solid var(--os-line-strong);
  border-radius: 999px;
}

/* ── Projects ── */
.featured {
  margin-bottom: 36px;
  padding: 28px;
  background: var(--os-surface-2);
  border: 1px solid var(--os-line);
  border-radius: 14px;

  .chips {
    margin-bottom: 22px;
  }
}
.featured-name {
  font-size: var(--os-text-title);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--os-ink);
}
.featured-summary {
  max-width: 64ch;
  margin: 14px 0 18px;
  font-size: var(--os-text-body);
  line-height: 1.65;
  color: var(--os-ink-body);
  text-wrap: pretty;
}
.project-name {
  font: inherit;
  letter-spacing: inherit;
}
.project-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  text-align: left;

  /* The whole row is the hit target. */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
  }
  :deep(.os-icon) {
    color: var(--os-ink-soft);
    transition: transform 200ms var(--os-ease-out);
  }
}
.project:hover .project-link {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.project:hover .project-link :deep(.os-icon) {
  transform: translate(2px, -2px);
}
.row-body .stack {
  margin-top: 10px;
  font-size: var(--os-text-meta);
  font-weight: 700;
  color: var(--os-ink-soft);
}

/* ── Certifications ── */
.cert-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.cert {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 0;
  border-top: 1px solid var(--os-line);

  h4 {
    font-size: var(--os-text-item);
    font-weight: 900;
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: var(--os-ink);
  }
}
.cert-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  color: var(--os-accent-ink);
  background: var(--os-accent-wash);
}

/* ── Contact ── */
.contact-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 64px;
  padding: 12px 16px;
  color: var(--os-ink-soft);
  border: 1px solid var(--os-line);
  border-radius: 12px;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;

  > :deep(.os-icon:last-of-type) {
    margin-left: auto;
    transition: transform 200ms var(--os-ease-out);
  }
  &:hover {
    background: var(--os-hover);
    border-color: var(--os-line-strong);
    color: var(--os-ink);
  }
  &:hover > :deep(.os-icon:last-of-type) {
    transform: translateX(3px);
  }
}
.contact-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  color: var(--os-ink);
  background: var(--os-chip);
}
.contact-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.contact-label {
  font-size: var(--os-text-chip);
  font-weight: 700;
  color: var(--os-ink-soft);
}
.contact-value {
  font-size: var(--os-text-body);
  font-weight: 700;
  color: var(--os-ink);
  overflow-wrap: anywhere;
}

/* ── Responsive ── */
@container (max-width: 520px) {
  .row {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 18px 0;
  }
  .facts {
    grid-template-columns: 1fr;
  }
  .exp-head {
    flex-direction: column;
    gap: 12px;
  }
  .exp-dates {
    margin-top: 0;
  }
  .about-head {
    gap: 16px;
  }
  .about-photo {
    width: 72px;
    height: 72px;
  }
  .featured {
    padding: 22px 20px;
  }
}

@media (max-width: 600px) {
  .display {
    font-size: 1.45rem;
  }
  .prose .prose-lead {
    font-size: 1.0625rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn :deep(.os-icon),
  .project-link :deep(.os-icon),
  .contact-row > :deep(.os-icon) {
    transition: none;
  }
}
</style>
