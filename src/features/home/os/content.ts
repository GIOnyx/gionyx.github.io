// Single source of truth for the GIOnyx OS desktop: windows and terminal both read from here.

export type WindowKey = "about" | "experience" | "skills" | "projects" | "certifications" | "contact";

export interface AppMeta {
  key: WindowKey;
  title: string;
  size?: "compact" | "large";
}

export const apps: AppMeta[] = [
  { key: "about", title: "About Me" },
  { key: "experience", title: "Experience", size: "large" },
  { key: "projects", title: "Projects", size: "large" },
  { key: "skills", title: "Skills" },
  { key: "certifications", title: "Certifications & Awards" },
  { key: "contact", title: "Contact", size: "compact" },
];

export const profile = {
  name: "Gregory Ivan Onyx Badinas",
  fullName: "Gregory Ivan Onyx M. Badinas",
  role: "Full-Stack Software Engineer, AI & Workflow Automation",
  currentRole: "Lead Dev Intern at The Umonics Method",
  education: "BSIT, CIT-University",
  scholar: "DOST-SEI RA 7687",
  // Hosted on Google Drive so it can be updated without a redeploy; this is the direct-download link.
  resume: "https://drive.google.com/uc?export=download&id=1FgdkTex6Y0w71JA0R_kv-0tZZEy7WCyy",
};

export const experience = {
  company: "The Umonics Method",
  role: "Full-Stack Developer Intern (Lead Developer)",
  kind: "Internship, Lead Developer",
  dates: "Jul 2026 – Oct 2026",
  project: "Umonics Integrated System",
  projectNote: "HR & Intern Management Platform",
  highlights: [
    {
      title: "Workflow & Document Automation",
      body: "Architected end-to-end offboarding pipelines, including a 3-stage Intern Clearance Form (ICF), an automated Certificate of Completion (COC) PDF generator, Letter of Completion (LOC) fulfillment, and Evaluation sign-offs, enforced by an 80% hours completion gate.",
    },
    {
      title: "Real-Time Systems & PWA",
      body: "Engineered live Socket.IO synchronization, background Web Push and in-app toast notifications with configurable channel preferences, PWA service worker updates, and interactive Recharts analytics dashboards.",
    },
    {
      title: "Security & Data Integrity",
      body: "Enforced query-level MongoDB data scoping (teamId/groupId) to prevent cross-role data leakage, built an IT-scoped System Audit Trail, automated approved-leave attendance logging, and resolved server-side timezone sync bugs.",
    },
    {
      title: "Release Ownership & Mentorship",
      body: "Led 5 production releases (v3.5.0–v3.10.0) on Vercel and Render, delivering 50+ tracked features and fixes while onboarding, mentoring, and reviewing pull requests for 3 incoming developer interns.",
    },
  ],
  stack: ["React", "Node.js", "Express", "MongoDB", "Socket.IO", "PWA", "Tailwind CSS", "Recharts", "Vercel", "Render"],
};

export interface Project {
  slug: string;
  name: string;
  kind: string;
  summary: string;
  stack: string[];
  /** External link. Without one, the project opens its case-study route. */
  url?: string;
  /** Opens another window instead of a link. */
  opens?: WindowKey;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "umonics",
    name: "Umonics Integrated System",
    kind: "Internship, The Umonics Method",
    summary:
      "HR & Intern Management Platform with automated offboarding pipelines (3-stage ICF, COC PDF generation, LOC, Evaluations), real-time Socket.IO sync, PWA Web Push notifications, Recharts analytics, and query-level MongoDB scoping across 5 production releases.",
    stack: experience.stack,
    opens: "experience",
    featured: true,
  },
  {
    slug: "citewise",
    name: "CiteWise",
    kind: "Capstone Project",
    summary: "An academic research platform with AI citation workflows, citation management, literature validation, and semantic scoring.",
    stack: ["Spring Boot", "React", "Supabase", "n8n", "Antigravity"],
    url: "https://github.com/sophie546/CiteWise.git",
  },
  {
    slug: "agapay",
    name: "Agapay",
    kind: "EY GDS Hackathon, Team ZNRP",
    summary: "Disaster-response and mission-dispatching system covering incident reporting, situational assessment, resource dispatching, and automated Flow Designer workflows.",
    stack: ["ServiceNow", "Flow Designer", "UI Builder"],
    url: "https://github.com/GIOnyx",
  },
  {
    slug: "instock",
    name: "InStock",
    kind: "Full-Stack Web & Mobile App",
    summary: "Inventory, pantry control, and recipe suggestion system with backend APIs, a React dashboard, and an Android app.",
    stack: ["Spring Boot", "React", "Supabase", "Android Kotlin"],
    url: "https://github.com/GIOnyx/IT342_InStock_G4_Badinas.git",
  },
  {
    slug: "hygienix",
    name: "Hygienix",
    kind: "Full-Stack Web App",
    summary: "A gamified educational web tool that teaches school children good health and hygiene habits.",
    stack: ["React", "Vite", "Supabase", "Gamification"],
    url: "https://hygienix.vercel.app/",
  },
  {
    slug: "classlink",
    name: "ClassLink",
    kind: "Full-Stack Web App",
    summary: "Curriculum registration and enrollment portal linking courses with student accounts.",
    stack: ["Spring Boot", "React", "Java", "Antigravity"],
    url: "https://github.com/GIOnyx/ClassLink.git",
  },
  {
    slug: "rentmate",
    name: "RentMate",
    kind: "Scrum Project Management",
    summary: "Served as project manager and scrum master for a property rentals system, coordinating milestones.",
    stack: ["Django", "Supabase", "Python", "CSS"],
    url: "https://github.com/sipjems13/CSIT327-G7-RentMate.git",
  },
  {
    slug: "trikego",
    name: "TrikeGo",
    kind: "Ride-Sharing Web App",
    summary: "Real-time commuter ride-sharing platform for tricycles with a location backend.",
    stack: ["Django", "Supabase", "Python", "Antigravity"],
    url: "https://csit327-g1-trikego.onrender.com",
  },
  {
    slug: "readysetcook",
    name: "ReadySetCook",
    kind: "Android Kotlin App",
    summary: "Recipe assistant on a local database that walks through cooking steps and filters allergens.",
    stack: ["Kotlin", "Android Studio"],
  },
  {
    slug: "insecta",
    name: "Insecta",
    kind: "Java Console Game",
    summary: "A text-based, turn-based RPG built on core object-oriented structures and battle classes.",
    stack: ["Java", "IntelliJ IDEA"],
  },
  {
    slug: "trackback",
    name: "TrackBack",
    kind: "Figma UI/UX Mockup",
    summary: "Lost-and-found system mockup with user flows designed in Figma for university campus usability.",
    stack: ["Figma"],
    url: "https://www.figma.com/design/f6ii06S1Pkl7f8wBw8Tg9R/HCI-Wireframe?node-id=0-1&t=P7tBFlOWam4Hk8IE-1",
  },
];

export const skillGroups: { title: string; items: string[] }[] = [
  { title: "Programming", items: ["Python", "JavaScript", "Java", "SQL", "Kotlin", "C", "HTML", "CSS", "PHP"] },
  {
    title: "Development & Frameworks",
    items: ["React", "Node.js", "Express", "Spring Boot", "Django", "REST APIs", "Socket.IO", "PWA", "Tailwind CSS", "Recharts", "Vite", "Android Studio"],
  },
  { title: "Databases & Deployment", items: ["MongoDB", "PostgreSQL", "Supabase", "Git", "GitHub", "Vercel", "Render"] },
  { title: "Automation & Platforms", items: ["n8n", "ServiceNow (Flow Designer, UI Builder)", "Custom Scripting"] },
  { title: "AI Tools & Assistants", items: ["Antigravity", "Gemini", "Claude", "GitHub Copilot", "Codex"] },
  { title: "Design & Prototyping", items: ["Figma", "Canva"] },
];

export type CertIcon = "scholar" | "trophy" | "check" | "star" | "cloud" | "shield" | "chip";

export const certifications: { title: string; detail?: string; url?: string; source?: string; icon: CertIcon }[] = [
  {
    title: "AWS Academy Graduate: Generative AI Foundations",
    detail: "Amazon Web Services, Nov 2026",
    url: "https://www.credly.com/badges/de250efe-782e-4447-b938-2f430ec9dd31/public_url",
    source: "Credly",
    icon: "cloud",
  },
  {
    title: "AWS Academy Graduate: Cloud Foundations",
    detail: "Amazon Web Services, Oct 2026",
    url: "https://www.credly.com/badges/96f9cbd1-6733-4f63-8d75-2cd6564408b3/public_url",
    source: "Credly",
    icon: "cloud",
  },
  {
    title: "Cybersecurity Fundamentals",
    detail: "IBM SkillsBuild, Oct 2026",
    url: "https://www.credly.com/badges/ee4d1dad-1e37-408a-9bca-86416569bfc0/public_url",
    source: "Credly",
    icon: "shield",
  },
  {
    title: "Artificial Intelligence Fundamentals",
    detail: "IBM SkillsBuild, Aug 2026",
    url: "https://www.credly.com/badges/3f88059e-683f-4af0-a48b-c0b341f105a9/public_url",
    source: "Credly",
    icon: "chip",
  },
  { title: "DOST-SEI RA 7687 Scholar", detail: "Batch 2023", icon: "scholar" },
  { title: "Parangal 2024 Academic Achiever", icon: "trophy" },
  { title: "Java Certification", url: "https://citu.codechum.com/certificates/9969", source: "CodeChum", icon: "check" },
  { title: "C Certification", url: "https://citu.codechum.com/certificates/703", source: "CodeChum", icon: "check" },
  { title: "EY GDS ServiceNow Hackathon Participant", detail: "Team ZNRP", icon: "star" },
];

export type ContactIcon = "mail" | "github" | "linkedin";

export const contacts: { label: string; value: string; href: string; icon: ContactIcon; external?: boolean }[] = [
  { label: "Email", value: "gregoryivanonyx.badinas@gmail.com", href: "mailto:gregoryivanonyx.badinas@gmail.com", icon: "mail" },
  { label: "GitHub", value: "github.com/GIOnyx", href: "https://github.com/GIOnyx", icon: "github", external: true },
  {
    label: "LinkedIn",
    value: "gregory-ivan-onyx-badinas",
    href: "https://linkedin.com/in/gregory-ivan-onyx-badinas-4721092b3",
    icon: "linkedin",
    external: true,
  },
];
