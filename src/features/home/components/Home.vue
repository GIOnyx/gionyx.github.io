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
import { useRouter } from "../../../composables/useRouter";
import profileImg from "../../../assets/images/profile.jpg";

const router = useRouter();

const threeCanvasRef = ref<HTMLCanvasElement | null>(null);
const threeInitialized = ref<boolean>(false);
const { isTouch } = useAgent();

// ── Clock State ──
const clockText = ref("");
const updateClock = () => {
  const now = new Date();
  const opts = {
    weekday: "short" as const,
    month: "short" as const,
    day: "numeric" as const,
    hour: "numeric" as const,
    minute: "2-digit" as const,
    hour12: true,
  };
  clockText.value = now.toLocaleString("en-US", opts);
};

let clockInterval: any = null;

// ── Window OS State ──
const booting = ref(true);

const openWindows = ref({
  about: false,
  skills: false,
  projects: false,
  certifications: false,
  contact: false
});

const minimizedWindows = ref({
  about: false,
  skills: false,
  projects: false,
  certifications: false,
  contact: false
});

const maximizedWindows = ref({
  about: false,
  skills: false,
  projects: false,
  certifications: false,
  contact: false
});

const zIndices = ref({
  about: 100,
  skills: 100,
  projects: 100,
  certifications: 100,
  contact: 100
});

let topZ = 100;

const bringToFront = (app: string) => {
  topZ += 1;
  zIndices.value[app as keyof typeof zIndices.value] = topZ;
};

const openWindow = (app: string) => {
  openWindows.value[app as keyof typeof openWindows.value] = true;
  minimizedWindows.value[app as keyof typeof minimizedWindows.value] = false;
  bringToFront(app);
};

const closeWindow = (app: string) => {
  openWindows.value[app as keyof typeof openWindows.value] = false;
  maximizedWindows.value[app as keyof typeof maximizedWindows.value] = false;
  minimizedWindows.value[app as keyof typeof minimizedWindows.value] = false;
};

const minimizeWindow = (app: string) => {
  minimizedWindows.value[app as keyof typeof minimizedWindows.value] = true;
};

const toggleMaximize = (app: string) => {
  maximizedWindows.value[app as keyof typeof maximizedWindows.value] =
    !maximizedWindows.value[app as keyof typeof maximizedWindows.value];
  bringToFront(app);
};

const isWindowOpen = (app: string) => {
  return openWindows.value[app as keyof typeof openWindows.value] && !minimizedWindows.value[app as keyof typeof minimizedWindows.value];
};

const handleDockClick = (app: string) => {
  if (isWindowOpen(app)) {
    if (zIndices.value[app as keyof typeof zIndices.value] === topZ) {
      minimizeWindow(app);
    } else {
      bringToFront(app);
    }
  } else {
    openWindow(app);
  }
};

const handleProjectClick = (slug: string, url?: string) => {
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    router.push(`/projects/${slug}`);
  }
};

// ── Dragging logic ──
let dragState: any = null;

const onDragStart = (e: MouseEvent | TouchEvent, app: string) => {
  // Don't drag if clicking controls
  const target = e.target as HTMLElement;
  if (target.closest(".win-controls") || maximizedWindows.value[app as keyof typeof maximizedWindows.value]) return;

  e.preventDefault();
  bringToFront(app);

  const win = document.getElementById("win-" + app);
  if (!win) return;

  const rect = win.getBoundingClientRect();
  const clientX = e instanceof MouseEvent ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e instanceof MouseEvent ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

  dragState = {
    app,
    win,
    offsetX: clientX - rect.left,
    offsetY: clientY - rect.top,
  };

  win.style.transform = "none";
  win.style.left = rect.left + "px";
  win.style.top = rect.top + "px";
};

const onDragMove = (e: MouseEvent | TouchEvent) => {
  if (!dragState) return;
  e.preventDefault();

  const clientX = e instanceof MouseEvent ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e instanceof MouseEvent ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

  const newX = clientX - dragState.offsetX;
  const newY = Math.max(32, clientY - dragState.offsetY); // lock below menubar

  dragState.win.style.left = newX + "px";
  dragState.win.style.top = newY + "px";
};

const onDragEnd = () => {
  dragState = null;
};

// ── Raycast Hover Cursor update ──
const isHoveringObject3D = ref<boolean>(false);
const updateCursor = () => {
  if (isTouch.value) return;
  const hoveringBox = raycast.getHoveringBox();
  const shouldBePointer = !!hoveringBox;

  if (shouldBePointer !== isHoveringObject3D.value) {
    isHoveringObject3D.value = shouldBePointer;
    document.documentElement.style.cursor = shouldBePointer ? "pointer" : "";
  }
};

onMounted(() => {
  // Initialize Three.js WebGL
  if (threeCanvasRef.value && !threeInitialized.value) {
    three.init(threeCanvasRef.value);
    threeInitialized.value = true;
  }

  // Setup clock
  updateClock();
  clockInterval = setInterval(updateClock, 10000);

  // Setup global drag listeners
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);
  window.addEventListener("touchmove", onDragMove, { passive: false });
  window.addEventListener("touchend", onDragEnd);

  // Keyboard close uppermost window
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      let topApp = "";
      let maxVal = -1;
      Object.keys(openWindows.value).forEach((app) => {
        if (isWindowOpen(app)) {
          const z = zIndices.value[app as keyof typeof zIndices.value];
          if (z > maxVal) {
            maxVal = z;
            topApp = app;
          }
        }
      });
      if (topApp) closeWindow(topApp);
    }
  });

  // End boot delay
  setTimeout(() => {
    booting.value = false;
  }, 100);

  gsap.ticker.add(updateCursor);
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
  three.destroy();
  gsap.ticker.remove(updateCursor);
  animations.destroy();

  window.removeEventListener("mousemove", onDragMove);
  window.removeEventListener("mouseup", onDragEnd);
  window.removeEventListener("touchmove", onDragMove);
  window.removeEventListener("touchend", onDragEnd);
});

watch(
  projectVisible,
  (newVal) => {
    renderer.setIsActive(!newVal);
  },
  { immediate: true },
);
</script>

<template>
  <div
    :class="[
      'home-wrapper',
      booting && 'booting',
      typeof projectId === 'string' && isTransitioning && `home-wrapper-out`,
      typeof projectId !== 'string' && isTransitioning && `home-wrapper-in`,
    ]"
  >
    <!-- Live 3D WebGL wallpaper in the background -->
    <canvas class="three-canvas" ref="threeCanvasRef"></canvas>

    <!-- ═══════════ MENU BAR ═══════════ -->
    <header class="menubar" id="menubar">
      <div class="menubar-left">
        <button class="menubar-logo" aria-label="GIOnyx menu">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9V5H4v4h16zm0 2H4v8h16v-8zM3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 4h2v1H6V7z"/></svg>
        </button>
        <span class="menubar-appname">GIOnyx</span>
        <span class="menubar-separator">|</span>
        <span class="menubar-menu">Portfolio</span>
      </div>
      <div class="menubar-right">
        <span class="menubar-item" aria-label="Wi-Fi connected">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
        </span>
        <span class="menubar-item" aria-label="Battery full">
          <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/><rect x="3" y="8" width="14" height="8" rx="1" fill="currentColor" opacity="0.4"/></svg>
        </span>
        <time class="menubar-clock">{{ clockText }}</time>
      </div>
    </header>

    <!-- ═══════════ DESKTOP WORKSPACE ═══════════ -->
    <main class="desktop" id="desktop">
      
      <!-- Sticky Note Widget -->
      <aside class="sticky-note" id="sticky-note">
        <div class="sticky-pin" aria-hidden="true"></div>
        <img class="sticky-avatar" :src="profileImg" alt="Gregory Ivan Onyx Badinas" loading="eager">
        <h2 class="sticky-name">Gregory Ivan Onyx Badinas</h2>
        <p class="sticky-role">BSIT Student · Full-Stack Dev · Mobile Dev</p>
      </aside>
    </main>

    <!-- ═══════════ APP WINDOWS ═══════════ -->

    <!-- ── About Me Window ── -->
    <section
      class="app-window"
      id="win-about"
      :class="{ open: openWindows.about, minimizing: minimizedWindows.about, maximized: maximizedWindows.about }"
      :style="{ zIndex: zIndices.about }"
      aria-label="About Me window"
      role="dialog"
      :aria-hidden="!openWindows.about"
      @mousedown="bringToFront('about')"
      @touchstart="bringToFront('about')"
    >
      <header class="win-titlebar" data-drag-handle @mousedown="onDragStart($event, 'about')" @touchstart="onDragStart($event, 'about')">
        <div class="win-controls">
          <button class="win-dot close" @click="closeWindow('about')" aria-label="Close window"></button>
          <button class="win-dot minimize" @click="minimizeWindow('about')" aria-label="Minimize window"></button>
          <button class="win-dot maximize" @click="toggleMaximize('about')" aria-label="Maximize window"></button>
        </div>
        <span class="win-title">About Me</span>
        <span class="win-controls-spacer"></span>
      </header>
      <div class="win-body" data-lenis-prevent>
        <div class="about-hero">
          <img class="about-photo" :src="profileImg" alt="Gregory Ivan Onyx Badinas">
          <div class="about-intro">
            <h1>Gregory Ivan Onyx Badinas</h1>
            <p class="about-subtitle">BSIT Student · Full-Stack Developer · Mobile Developer</p>
            <div class="about-tags">
              <span>Web Apps</span>
              <span>IT Support</span>
              <span>Non-coding Roles</span>
            </div>
          </div>
        </div>
        <div class="about-body">
          <div class="about-stats">
            <div class="stat-chip"><span class="stat-label">Focus</span><span class="stat-value">App Support</span></div>
            <div class="stat-chip"><span class="stat-label">Stack</span><span class="stat-value">Java + React</span></div>
            <div class="stat-chip"><span class="stat-label">Status</span><span class="stat-value">Internship Ready</span></div>
          </div>
          <p>I build practical web, mobile, backend, and automation solutions using technologies such as Spring Boot, React, Kotlin, Django, Supabase, and n8n.</p>
          <p>I am a third-year BSIT student with a strong foundation in application development, system support, and technical problem-solving. I have built web and mobile applications, contributed to team-based software projects, and explored workflow automation through platforms such as ServiceNow and n8n.</p>
          <p>I am currently seeking an IT Operations, application support, software development, or non-coding technical internship where I can contribute to support, coordination, documentation, workflow improvement, and practical problem-solving while continuing to grow in a professional IT environment.</p>
          <div class="about-highlights">
            <span>Team-based delivery</span>
            <span>Support mindset</span>
            <span>Practical automation</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Skills Window ── -->
    <section
      class="app-window"
      id="win-skills"
      :class="{ open: openWindows.skills, minimizing: minimizedWindows.skills, maximized: maximizedWindows.skills }"
      :style="{ zIndex: zIndices.skills }"
      aria-label="Skills window"
      role="dialog"
      :aria-hidden="!openWindows.skills"
      @mousedown="bringToFront('skills')"
      @touchstart="bringToFront('skills')"
    >
      <header class="win-titlebar" data-drag-handle @mousedown="onDragStart($event, 'skills')" @touchstart="onDragStart($event, 'skills')">
        <div class="win-controls">
          <button class="win-dot close" @click="closeWindow('skills')" aria-label="Close window"></button>
          <button class="win-dot minimize" @click="minimizeWindow('skills')" aria-label="Minimize window"></button>
          <button class="win-dot maximize" @click="toggleMaximize('skills')" aria-label="Maximize window"></button>
        </div>
        <span class="win-title">Skills</span>
        <span class="win-controls-spacer"></span>
      </header>
      <div class="win-body" data-lenis-prevent>
        <h2 class="win-heading">Technical Toolkit</h2>
        <p class="win-subheading">Languages, frameworks, platforms, and tools I use across web, mobile, backend, automation, and design work.</p>
        <div class="skills-grid">
          <article class="skill-card">
            <h3>Languages</h3>
            <div class="badge-list">
              <span>Java</span><span>C</span><span>Kotlin</span><span>Python</span><span>HTML</span><span>CSS</span><span>JavaScript</span><span>PHP</span><span>SQL</span>
            </div>
          </article>
          <article class="skill-card">
            <h3>Frameworks &amp; Libraries</h3>
            <div class="badge-list">
              <span>Spring Boot</span><span>React</span><span>Django</span><span>JavaFX</span><span>Vite</span><span>Android Studio</span>
            </div>
          </article>
          <article class="skill-card">
            <h3>Databases &amp; DevOps</h3>
            <div class="badge-list">
              <span>Supabase</span><span>SQL</span><span>Git</span><span>GitHub</span><span>Render</span>
            </div>
          </article>
          <article class="skill-card">
            <h3>Platforms</h3>
            <div class="badge-list">
              <span>ServiceNow UI Builder</span><span>ServiceNow Flow Designer</span><span>Custom Scripting</span><span>n8n</span>
            </div>
          </article>
          <article class="skill-card">
            <h3>Design</h3>
            <div class="badge-list">
              <span>Figma</span><span>Canva</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ── Projects Window ── -->
    <section
      class="app-window win-large"
      id="win-projects"
      :class="{ open: openWindows.projects, minimizing: minimizedWindows.projects, maximized: maximizedWindows.projects }"
      :style="{ zIndex: zIndices.projects }"
      aria-label="Projects window"
      role="dialog"
      :aria-hidden="!openWindows.projects"
      @mousedown="bringToFront('projects')"
      @touchstart="bringToFront('projects')"
    >
      <header class="win-titlebar" data-drag-handle @mousedown="onDragStart($event, 'projects')" @touchstart="onDragStart($event, 'projects')">
        <div class="win-controls">
          <button class="win-dot close" @click="closeWindow('projects')" aria-label="Close window"></button>
          <button class="win-dot minimize" @click="minimizeWindow('projects')" aria-label="Minimize window"></button>
          <button class="win-dot maximize" @click="toggleMaximize('projects')" aria-label="Maximize window"></button>
        </div>
        <span class="win-title">Projects</span>
        <span class="win-controls-spacer"></span>
      </header>
      <div class="win-body" data-lenis-prevent>
        <h2 class="win-heading">Selected Work</h2>
        <p class="win-subheading">Academic, full-stack, mobile, and automation projects. Click a card to open its link or details.</p>
        <div class="projects-grid">
          
          <article class="project-card featured" @click="handleProjectClick('citewise', 'https://github.com/sophie546/CiteWise.git')">
            <span class="project-type">Capstone Project</span>
            <h3>CiteWise &rarr;</h3>
            <p>An intelligent academic research platform that uses AI citation workflows, citation management, literature validation, and semantic scoring.</p>
            <div class="badge-list"><span>Spring Boot</span><span>React</span><span>Supabase</span><span>n8n</span></div>
          </article>

          <article class="project-card" @click="handleProjectClick('instock', 'https://github.com/GIOnyx/IT342_InStock_G4_Badinas.git')">
            <span class="project-type">Full-Stack Web &amp; Mobile App</span>
            <h3>InStock &rarr;</h3>
            <p>Inventory, pantry control, and recipe suggest system with backend APIs, React dashboard, and Android app.</p>
            <div class="badge-list"><span>Spring Boot</span><span>React</span><span>Supabase</span><span>Android Kotlin</span></div>
          </article>

          <article class="project-card" @click="handleProjectClick('hygienix', 'https://hygienix.vercel.app/')">
            <span class="project-type">Full-Stack Web App</span>
            <h3>Hygienix &rarr;</h3>
            <p>A web-based gamified educational tool teaching school children good health and hygiene habits.</p>
            <div class="badge-list"><span>React</span><span>Vite</span><span>Supabase</span><span>Gamification</span></div>
          </article>

          <article class="project-card" @click="handleProjectClick('classlink', 'https://github.com/GIOnyx/ClassLink.git')">
            <span class="project-type">Full-Stack Web App</span>
            <h3>ClassLink &rarr;</h3>
            <p>Curriculum registration and enrollment database portal linking courses with student accounts.</p>
            <div class="badge-list"><span>Spring Boot</span><span>React</span><span>Java</span><span>JavaScript</span></div>
          </article>

          <article class="project-card" @click="handleProjectClick('rentmate', 'https://github.com/sipjems13/CSIT327-G7-RentMate.git')">
            <span class="project-type">Scrum Project Management</span>
            <h3>RentMate &rarr;</h3>
            <p>Served as project manager and scrum master for a property rentals system coordinating milestones.</p>
            <div class="badge-list"><span>Django</span><span>Supabase</span><span>Python</span><span>CSS</span></div>
          </article>

          <article class="project-card" @click="handleProjectClick('trikego', 'https://csit327-g1-trikego.onrender.com')">
            <span class="project-type">Ride-Sharing Web App</span>
            <h3>TrikeGo &rarr;</h3>
            <p>Real-time match commuter ride-sharing platform for tricycles with location backend.</p>
            <div class="badge-list"><span>Django</span><span>Supabase</span><span>Python</span><span>CSS</span></div>
          </article>

          <article class="project-card" @click="handleProjectClick('readysetcook')">
            <span class="project-type">Android Kotlin App</span>
            <h3>ReadySetCook &rarr;</h3>
            <p>Local storage database recipe assistant showing cooking steps and filtering allergens.</p>
            <div class="badge-list"><span>Kotlin</span><span>Android Studio</span></div>
          </article>

          <article class="project-card" @click="handleProjectClick('insecta')">
            <span class="project-type">Java Console Game</span>
            <h3>Insecta &rarr;</h3>
            <p>A text-based turn-based RPG applying core object-oriented structures and battle classes.</p>
            <div class="badge-list"><span>Java</span><span>IntelliJ IDEA</span></div>
          </article>

          <article class="project-card" @click="handleProjectClick('trackback', 'https://www.figma.com/design/f6ii06S1Pkl7f8wBw8Tg9R/HCI-Wireframe?node-id=0-1&t=P7tBFlOWam4Hk8IE-1')">
            <span class="project-type">Figma UI/UX Mockup</span>
            <h3>TrackBack &rarr;</h3>
            <p>Lost and found system mockup with user flows designed in Figma for university campus usability.</p>
            <div class="badge-list"><span>Figma</span></div>
          </article>

        </div>
      </div>
    </section>

    <!-- ── Certifications Window ── -->
    <section
      class="app-window"
      id="win-certifications"
      :class="{ open: openWindows.certifications, minimizing: minimizedWindows.certifications, maximized: maximizedWindows.certifications }"
      :style="{ zIndex: zIndices.certifications }"
      aria-label="Certifications window"
      role="dialog"
      :aria-hidden="!openWindows.certifications"
      @mousedown="bringToFront('certifications')"
      @touchstart="bringToFront('certifications')"
    >
      <header class="win-titlebar" data-drag-handle @mousedown="onDragStart($event, 'certifications')" @touchstart="onDragStart($event, 'certifications')">
        <div class="win-controls">
          <button class="win-dot close" @click="closeWindow('certifications')" aria-label="Close window"></button>
          <button class="win-dot minimize" @click="minimizeWindow('certifications')" aria-label="Minimize window"></button>
          <button class="win-dot maximize" @click="toggleMaximize('certifications')" aria-label="Maximize window"></button>
        </div>
        <span class="win-title">Certifications &amp; Awards</span>
        <span class="win-controls-spacer"></span>
      </header>
      <div class="win-body" data-lenis-prevent>
        <h2 class="win-heading">Academic Recognition &amp; Credentials</h2>
        <div class="cert-list">
          <article class="cert-item">
            <div class="cert-icon">🏅</div>
            <div>
              <h3>DOST-SEI RA 7687 Scholar</h3>
              <p>Batch 2023</p>
            </div>
          </article>
          <article class="cert-item">
            <div class="cert-icon">🏆</div>
            <div>
              <h3>Parangal 2024 Academic Achiever</h3>
            </div>
          </article>
          <article class="cert-item">
            <div class="cert-icon">☕</div>
            <div>
              <h3>Java Certification</h3>
              <p><a class="cert-link" href="https://citu.codechum.com/certificates/9969" target="_blank" rel="noopener noreferrer">View CodeChum Certificate &rarr;</a></p>
            </div>
          </article>
          <article class="cert-item">
            <div class="cert-icon">🛠️</div>
            <div>
              <h3>C Certification</h3>
              <p><a class="cert-link" href="https://citu.codechum.com/certificates/703" target="_blank" rel="noopener noreferrer">View CodeChum Certificate &rarr;</a></p>
            </div>
          </article>
          <article class="cert-item">
            <div class="cert-icon">⚙️</div>
            <div>
              <h3>EY GDS ServiceNow Hackathon Participant</h3>
              <p>Team ZNRP</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ── Contact Window ── -->
    <section
      class="app-window win-compact"
      id="win-contact"
      :class="{ open: openWindows.contact, minimizing: minimizedWindows.contact, maximized: maximizedWindows.contact }"
      :style="{ zIndex: zIndices.contact }"
      aria-label="Contact window"
      role="dialog"
      :aria-hidden="!openWindows.contact"
      @mousedown="bringToFront('contact')"
      @touchstart="bringToFront('contact')"
    >
      <header class="win-titlebar" data-drag-handle @mousedown="onDragStart($event, 'contact')" @touchstart="onDragStart($event, 'contact')">
        <div class="win-controls">
          <button class="win-dot close" @click="closeWindow('contact')" aria-label="Close window"></button>
          <button class="win-dot minimize" @click="minimizeWindow('contact')" aria-label="Minimize window"></button>
          <button class="win-dot maximize" @click="toggleMaximize('contact')" aria-label="Maximize window"></button>
        </div>
        <span class="win-title">Contact</span>
        <span class="win-controls-spacer"></span>
      </header>
      <div class="win-body" data-lenis-prevent>
        <h2 class="win-heading">Let&apos;s build something practical.</h2>
        <p class="win-subheading">I am open to internship opportunities, collaboration, and software development projects.</p>
        <div class="contact-list">
          <a class="contact-card" href="mailto:gregoryivanonyx.badinas@gmail.com">
            <span class="contact-icon">📧</span>
            <div>
              <span class="contact-label">Email</span>
              <strong>gregoryivanonyx.badinas@gmail.com</strong>
            </div>
          </a>
          <a class="contact-card" href="https://github.com/GIOnyx" target="_blank" rel="noopener noreferrer">
            <span class="contact-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57v-2.23c-3.34.73-4.04-1.42-4.04-1.42a3.18 3.18 0 0 0-1.34-1.75c-1.08-.74.09-.73.09-.73a2.52 2.52 0 0 1 1.84 1.24 2.56 2.56 0 0 0 3.5 1 2.56 2.56 0 0 1 .76-1.6c-2.67-.3-5.47-1.33-5.47-5.93a4.64 4.64 0 0 1 1.24-3.22 4.3 4.3 0 0 1 .12-3.18s1-.32 3.3 1.23a11.38 11.38 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23a4.3 4.3 0 0 1 .12 3.18 4.64 4.64 0 0 1 1.24 3.22c0 4.61-2.81 5.63-5.48 5.93a2.86 2.86 0 0 1 .82 2.22v3.29c0 .32.22.7.83.57A12 12 0 0 0 12 .3"/></svg>
            </span>
            <div>
              <span class="contact-label">GitHub</span>
              <strong>github.com/GIOnyx</strong>
            </div>
          </a>
          <a class="contact-card" href="https://linkedin.com/in/gregory-ivan-onyx-badinas-4721092b3" target="_blank" rel="noopener noreferrer">
            <span class="contact-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56zM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.76 1.76 0 0 0 24 22.27V1.73A1.76 1.76 0 0 0 22.22 0z"/></svg>
            </span>
            <div>
              <span class="contact-label">LinkedIn</span>
              <strong>gregory-ivan-onyx-badinas</strong>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- ═══════════ DOCK (Bottom taskbar) ═══════════ -->
    <nav class="dock" id="dock" aria-label="Application dock">
      <div class="dock-container">
        <button class="dock-item" :class="{ active: openWindows.about }" @click="handleDockClick('about')" data-tooltip="About Me" aria-label="About Me">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
        </button>
        <button class="dock-item" :class="{ active: openWindows.skills }" @click="handleDockClick('skills')" data-tooltip="Skills" aria-label="Skills">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </button>
        <button class="dock-item" :class="{ active: openWindows.projects }" @click="handleDockClick('projects')" data-tooltip="Projects" aria-label="Projects">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button class="dock-item" :class="{ active: openWindows.certifications }" @click="handleDockClick('certifications')" data-tooltip="Certifications" aria-label="Certifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
        </button>
        <button class="dock-item" :class="{ active: openWindows.contact }" @click="handleDockClick('contact')" data-tooltip="Contact" aria-label="Contact">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </button>
        <div class="dock-divider" aria-hidden="true"></div>
        <a class="dock-item" href="https://drive.google.com/uc?export=download&id=1H1breto8Fhe30B8vZrswvHGin4mFQVPY" target="_blank" rel="noopener noreferrer" data-tooltip="Resume" aria-label="Download Resume">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
        </a>
      </div>
    </nav>
  </div>
</template>

<style scoped lang="scss">
.home-wrapper {
  --sand-bg: var(--color-background-400);
  --sand-card: var(--color-beige-500);
  --sand-darker: var(--color-beige-700);
  --sand-border: var(--color-beige-700);
  --text-color: var(--color-text-400);
  --text-soft: var(--color-text-300);
  --text-muted: var(--color-gray-500);

  --menubar-h: 32px;
  --dock-h: 68px;
  --sticky-bg: #fffbf2;
  --sticky-text: var(--color-text-400);
  --sticky-text-soft: var(--color-text-300);
  --dot-close: #ff5f56;
  --dot-minimize: #ffbd2e;
  --dot-maximize: #27c93f;
  --radius: 12px;
  --radius-lg: 16px;
  --transition-bounce: 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --shadow-window: 0 20px 50px rgba(45, 42, 36, 0.15);
  --orange: var(--color-orange-400);
  --sage: #7a9a6d;
  --cyan: var(--color-cyan-500);
  --icon-blue: #4a90e2;
  --icon-green: #7a9a6d;
  --icon-purple: #9b51e0;
  --icon-amber: #f2c94c;
  --icon-rose: #eb5757;
  --icon-slate: #828282;
}

.three-canvas {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: auto;
}

/* ═══════════ MENU BAR ═══════════ */
.menubar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  height: var(--menubar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: rgba(245, 239, 230, 0.85);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border-bottom: 1px solid var(--sand-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}
.menubar-left, .menubar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.menubar-logo {
  display: grid;
  place-items: center;
  width: 20px; height: 20px;
  opacity: 0.9;
}
.menubar-logo:hover { opacity: 1; }
.menubar-appname { font-weight: 800; letter-spacing: -0.01em; color: var(--text-color); }
.menubar-separator { color: var(--sand-border); font-weight: 400; }
.menubar-menu { color: var(--text-soft); font-weight: 500; }
.menubar-item { display: grid; place-items: center; opacity: 0.7; }
.menubar-clock { color: var(--text-soft); font-weight: 600; font-variant-numeric: tabular-nums; }

/* ═══════════ DESKTOP ═══════════ */
.desktop {
  position: fixed;
  inset: 0;
  padding: calc(var(--menubar-h) + 32px) 40px calc(var(--dock-h) + 24px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none; /* Let clicks pass through to Three.js wallpaper if needed */
}

/* ═══════════ STICKY NOTE ═══════════ */
.sticky-note {
  position: absolute;
  top: 50%;
  left: 200px;
  width: 280px;
  padding: 28px 24px 22px;
  background: var(--sticky-bg);
  border-radius: 4px;
  border: 1px solid var(--sand-border);
  box-shadow:
    3px 4px 16px rgba(45,42,36,0.12);
  transform: translateY(-50%) rotate(-2.5deg);
  z-index: 50;
  color: var(--sticky-text);
  transition: transform var(--transition-bounce), box-shadow 200ms ease;
  pointer-events: auto;
}
.sticky-note:hover {
  transform: translateY(-50%) rotate(0deg) scale(1.03);
  box-shadow: 5px 8px 28px rgba(45,42,36,0.20);
}
.sticky-pin {
  position: absolute;
  top: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px; height: 16px;
  background: radial-gradient(circle at 40% 35%, var(--orange) 0%, #d46e00 100%);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(45,42,36,0.25), inset 0 1px 1px rgba(255,255,255,0.3);
}
.sticky-avatar {
  width: 110px; height: 110px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 24%;
  border: 3px solid var(--sand-border);
  margin: 0 auto 18px;
}
.sticky-name {
  font-size: 15px;
  font-weight: 800;
  text-align: center;
  line-height: 1.3;
  margin-bottom: 6px;
}
.sticky-role {
  font-size: 12px;
  color: var(--sticky-text-soft);
  text-align: center;
  line-height: 1.4;
  margin-bottom: 14px;
}
.sticky-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--sage);
  margin-bottom: 10px;
}
.pulse-dot {
  width: 7px; height: 7px;
  background: var(--sage);
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(122, 154, 109, 0.5);
  animation: pulse 2s ease-in-out infinite;
}
.sticky-focus {
  font-size: 11.5px;
  color: var(--sticky-text-soft);
  text-align: center;
  line-height: 1.5;
  border-top: 1px dashed var(--sand-border);
  padding-top: 12px;
}

/* ═══════════ APP WINDOWS ═══════════ */
.app-window {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(0.92);
  width: 640px;
  max-width: 92vw;
  height: 520px;
  max-height: calc(100vh - var(--menubar-h) - var(--dock-h) - 32px);
  display: flex;
  flex-direction: column;
  background: rgba(245, 239, 230, 0.95);
  backdrop-filter: blur(40px) saturate(1.4);
  -webkit-backdrop-filter: blur(40px) saturate(1.4);
  border: 1px solid var(--sand-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-window);
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transition:
    opacity 280ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 280ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0ms 280ms;
  z-index: 100;
  color: var(--text-color);
}
.app-window.open {
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
  transform: translate(-50%, -50%) scale(1);
  transition:
    opacity 280ms cubic-bezier(0.0, 0, 0.2, 1),
    transform 280ms cubic-bezier(0.34, 1.4, 0.64, 1),
    visibility 0ms 0ms;
}
.app-window.minimizing {
  opacity: 0;
  transform: translate(-50%, 80%) scale(0.3);
  transition: opacity 300ms ease-in, transform 300ms ease-in, visibility 0ms 300ms;
  pointer-events: none;
  visibility: hidden;
}
.app-window.maximized {
  top: var(--menubar-h) !important;
  left: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  height: calc(100vh - var(--menubar-h) - var(--dock-h) - 8px) !important;
  max-height: none !important;
  transform: none !important;
  border-radius: 0;
  transition:
    all 320ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0ms 0ms;
}
.app-window.maximized.open { transform: none !important; }

.win-large  { width: 820px; height: 580px; }
.win-compact { width: 520px; height: 460px; }

/* ── Title Bar ── */
.win-titlebar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 14px;
  background: var(--sand-darker);
  border-bottom: 1px solid var(--sand-border);
  cursor: default;
}
.win-titlebar[data-drag-handle] { cursor: grab; }
.win-titlebar[data-drag-handle]:active { cursor: grabbing; }

.win-controls { display: flex; gap: 7px; flex-shrink: 0; width: 56px; }
.win-controls-spacer { width: 56px; flex-shrink: 0; }
.win-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  position: relative;
  transition: filter 150ms ease, transform 150ms ease;
}
.win-dot.close    { background: var(--dot-close); }
.win-dot.minimize { background: var(--dot-minimize); }
.win-dot.maximize { background: var(--dot-maximize); }
.win-dot:hover { filter: brightness(1.1); transform: scale(1.15); }

/* dot icons on hover */
.win-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 9px;
  font-weight: 900;
  color: rgba(0,0,0,0.5);
  opacity: 0;
  transition: opacity 100ms ease;
}
.win-titlebar:hover .win-dot::after { opacity: 1; }
.win-dot.close::after    { content: '×'; font-size: 11px; }
.win-dot.minimize::after { content: '−'; }
.win-dot.maximize::after { content: '+'; font-size: 10px; }

.win-title {
  flex: 1;
  text-align: center;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Window Body ── */
.win-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  scrollbar-width: thin;
  scrollbar-color: var(--sand-border) transparent;
}
.win-body::-webkit-scrollbar { width: 6px; }
.win-body::-webkit-scrollbar-track { background: transparent; }
.win-body::-webkit-scrollbar-thumb { background: var(--sand-border); border-radius: 3px; }
.win-body::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

.win-heading {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.win-subheading {
  color: var(--text-soft);
  font-size: 0.9rem;
  margin-bottom: 24px;
  line-height: 1.55;
}

/* ═══════════ ABOUT WINDOW CONTENT ═══════════ */
.about-hero {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--sand-border);
}
.about-photo {
  width: 80px; height: 80px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 24%;
  border: 2px solid var(--sand-border);
  box-shadow: 0 4px 16px rgba(45,42,36,0.08);
  flex-shrink: 0;
}
.about-intro h1 {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-color);
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}
.about-subtitle {
  font-size: 0.85rem;
  color: var(--orange);
  font-weight: 700;
  margin-bottom: 10px;
}
.about-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.about-tags span {
  padding: 3px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-soft);
  background: var(--sand-darker);
  border: 1px solid var(--sand-border);
  border-radius: 6px;
}
.about-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}
.stat-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  background: var(--sand-card);
  border: 1px solid var(--sand-border);
  border-radius: 8px;
}
.stat-label { font-size: 0.7rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.02em; }
.stat-value { font-size: 0.88rem; font-weight: 800; color: var(--text-color); }

.about-body p {
  color: var(--text-soft);
  font-size: 0.88rem;
  line-height: 1.7;
  margin-bottom: 14px;
}
.about-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}
.about-highlights span {
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--sage);
  background: rgba(122, 154, 109, 0.08);
  border: 1px solid rgba(122, 154, 109, 0.15);
  border-radius: 6px;
}

/* ═══════════ SKILLS WINDOW CONTENT ═══════════ */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.skill-card {
  padding: 18px;
  background: var(--sand-card);
  border: 1px solid var(--sand-border);
  border-radius: var(--radius);
  transition: border-color 200ms ease, background 200ms ease;
}
.skill-card:hover {
  border-color: var(--text-muted);
}
.skill-card h3 {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--sand-border);
}
.badge-list { display: flex; flex-wrap: wrap; gap: 6px; }
.badge-list span {
  padding: 4px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-soft);
  background: var(--sand-bg);
  border: 1px solid var(--sand-border);
  border-radius: 5px;
  transition: background 150ms ease, color 150ms ease;
}
.badge-list span:hover {
  background: var(--sand-darker);
  color: var(--text-color);
}

/* ═══════════ PROJECTS WINDOW CONTENT ═══════════ */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.project-card {
  padding: 18px;
  background: var(--sand-card);
  border: 1px solid var(--sand-border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
  cursor: pointer;
}
.project-card:hover {
  transform: translateY(-2px);
  border-color: var(--text-muted);
  box-shadow: 0 8px 24px rgba(45,42,36,0.06);
}
.project-card.featured {
  grid-column: span 2;
  background: linear-gradient(135deg, rgba(255, 132, 0, 0.04) 0%, var(--sand-card) 100%);
  border-color: rgba(255, 132, 0, 0.2);
}
.project-type {
  display: inline-block;
  padding: 3px 8px;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--orange);
  background: rgba(255, 132, 0, 0.06);
  border: 1px solid rgba(255, 132, 0, 0.15);
  border-radius: 5px;
  margin-bottom: 10px;
  width: fit-content;
}
.project-card h3 {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}
.project-card p {
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.6;
  margin-bottom: 14px;
  flex: 1;
}
.project-card .badge-list { margin-top: auto; margin-bottom: 0; }
.project-links { margin-top: 12px; }
.project-links a {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--cyan);
  background: rgba(0, 134, 187, 0.06);
  border: 1px solid rgba(0, 134, 187, 0.15);
  border-radius: 6px;
  transition: background 150ms ease, color 150ms ease, transform 150ms ease;
}
.project-links a:hover {
  background: rgba(0, 134, 187, 0.12);
  color: var(--cyan);
  transform: translateY(-1px);
}

/* ═══════════ CERTIFICATIONS WINDOW CONTENT ═══════════ */
.cert-list { display: flex; flex-direction: column; gap: 12px; }
.cert-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  background: var(--sand-card);
  border: 1px solid var(--sand-border);
  border-radius: var(--radius);
  transition: border-color 200ms ease, background 200ms ease;
}
.cert-item:hover {
  border-color: var(--text-muted);
}
.cert-icon { font-size: 1.4rem; flex-shrink: 0; line-height: 1; padding-top: 2px; }
.cert-item h3 { font-size: 0.9rem; font-weight: 700; color: var(--text-color); margin-bottom: 4px; }
.cert-item p { color: var(--text-muted); font-size: 0.82rem; }
.cert-link {
  color: var(--cyan);
  font-weight: 700;
  transition: color 150ms ease;
}
.cert-link:hover { color: var(--orange); text-decoration: underline; }

/* ═══════════ CONTACT WINDOW CONTENT ═══════════ */
.contact-list { display: flex; flex-direction: column; gap: 12px; }
.contact-card {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 16px 18px;
  background: var(--sand-card);
  border: 1px solid var(--sand-border);
  border-radius: var(--radius);
  transition: transform 200ms ease, border-color 200ms ease, background 200ms ease;
}
.contact-card:hover {
  transform: translateX(4px);
  border-color: var(--text-muted);
}
.contact-icon { font-size: 1.3rem; flex-shrink: 0; display: grid; place-items: center; }
.contact-icon svg { color: var(--text-soft); }
.contact-card:hover .contact-icon svg { color: var(--text-color); }
.contact-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--orange);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 2px;
}
.contact-card strong {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-soft);
  word-break: break-all;
}
.contact-card:hover strong { color: var(--text-color); }

/* ═══════════ DOCK (Bottom taskbar) ═══════════ */
.dock {
  position: fixed;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  pointer-events: auto; /* Re-enable pointer events for dock */
}
.dock-container {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(245, 239, 230, 0.85);
  backdrop-filter: blur(32px) saturate(1.4);
  -webkit-backdrop-filter: blur(32px) saturate(1.4);
  border: 1px solid var(--sand-border);
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(45,42,36,0.12);
}
.dock-item {
  position: relative;
  width: 46px; height: 46px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(45, 42, 36, 0.04);
  border: 1px solid rgba(45, 42, 36, 0.06);
  cursor: pointer;
  transition:
    background 200ms ease,
    border-color 200ms ease,
    box-shadow 200ms ease;
  -webkit-tap-highlight-color: transparent;
}
.dock-item svg {
  width: 22px; height: 22px;
  color: var(--text-soft);
  transition: transform var(--transition-bounce), color 150ms ease;
}
.dock-item:hover {
  background: rgba(45, 42, 36, 0.08);
  border-color: var(--text-muted);
}
.dock-item:hover svg {
  transform: translateY(-4px) scale(1.22);
  color: var(--text-color);
}

/* adjacent dock magnification via :has() */
.dock-item:has(+ .dock-item:hover) svg,
.dock-item:hover + .dock-item svg {
  transform: translateY(-2px) scale(1.1);
}
.dock-item:has(+ .dock-item + .dock-item:hover) svg,
.dock-item:hover + .dock-item + .dock-item svg {
  transform: translateY(-0.5px) scale(1.03);
}

/* active indicator dot */
.dock-item.active::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px; height: 4px;
  background: var(--text-color);
  border-radius: 50%;
  opacity: 0.8;
}

/* tooltip */
.dock-item::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 4px 10px;
  background: rgba(245, 239, 230, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--sand-border);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease, transform 150ms ease;
}
.dock-item:hover::before {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.dock-divider {
  width: 1px;
  height: 32px;
  background: var(--sand-border);
  margin: 0 4px;
  flex-shrink: 0;
}

/* ═══════════ BOOT ANIMATION ═══════════ */
.booting .menubar {
  transform: translateY(-100%);
  opacity: 0;
}
.booting .sticky-note {
  opacity: 0;
  transform: rotate(-2.5deg) scale(0.7) translateY(20px);
}
.booting .dock {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
}

/* transition targets after booting removed */
.menubar {
  transition: transform 500ms cubic-bezier(0.34, 1.4, 0.64, 1), opacity 400ms ease;
}
.sticky-note {
  transition: transform var(--transition-bounce) 300ms, opacity 400ms ease 300ms, box-shadow 200ms ease;
}
.dock {
  transition: transform 500ms cubic-bezier(0.34, 1.4, 0.64, 1) 200ms, opacity 400ms ease 200ms;
}

/* ═══════════ RESPONSIVE ═══════════ */
@media (max-width: 900px) {
  .sticky-note {
    position: relative;
    top: auto; left: auto;
    width: 260px;
    margin: 0 auto 24px;
    padding: 24px 20px 18px;
    transform: rotate(-1.5deg);
  }
  .sticky-note:hover { transform: rotate(0deg) scale(1.02); }

  .desktop {
    flex-direction: column;
    justify-content: flex-start;
    padding-top: calc(var(--menubar-h) + 20px);
    overflow-y: auto;
  }

  .app-window,
  .app-window.win-large,
  .app-window.win-compact {
    width: 96vw;
    max-width: 96vw;
    height: calc(100vh - var(--menubar-h) - var(--dock-h) - 24px);
  }

  .projects-grid { grid-template-columns: 1fr; }
  .project-card.featured { grid-column: auto; }

  .about-hero { flex-direction: column; text-align: center; }
  .about-tags { justify-content: center; }
  .about-stats { grid-template-columns: 1fr; }
  .skills-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  :root { --menubar-h: 28px; --dock-h: 64px; }

  .menubar { padding: 0 10px; font-size: 12px; }
  .menubar-separator, .menubar-menu { display: none; }
  .menubar-right { gap: 8px; }

  .desktop { padding: calc(var(--menubar-h) + 14px) 16px calc(var(--dock-h) + 16px); }

  .sticky-note { width: 220px; padding: 22px 18px 16px; }
  .sticky-avatar { width: 56px; height: 56px; }
  .sticky-name { font-size: 13px; }

  .dock-container { padding: 5px 8px; gap: 4px; }
  .dock-item { width: 40px; height: 40px; border-radius: 10px; }
  .dock-item svg { width: 18px; height: 18px; }
  .dock-item:hover { transform: translateY(-6px) scale(1.2); }
  .dock-divider { height: 28px; }

  .app-window, .app-window.win-large, .app-window.win-compact {
    width: 100vw;
    max-width: 100vw;
    height: calc(100vh - var(--menubar-h) - var(--dock-h) - 8px);
    border-radius: var(--radius) var(--radius) 0 0;
  }
  .win-body { padding: 20px; }

  .about-hero { gap: 14px; }
  .about-photo { width: 64px; height: 64px; }
  .about-intro h1 { font-size: 1.1rem; }
}
</style>
