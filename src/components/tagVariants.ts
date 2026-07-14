export type TagVariant =
  | "three"
  | "websockets"
  | "react"
  | "redis"
  | "gray"
  | "html"
  | "css"
  | "javascript"
  | "node"
  | "next"
  | "kubernetes"
  | "postgresql"
  | "ogl"
  | "glsl"
  | "spring-boot"
  | "supabase"
  | "n8n"
  | "java"
  | "vite"
  | "gamification"
  | "intellij-idea"
  | "kotlin"
  | "android-studio"
  | "sqlite"
  | "django"
  | "python"
  | "figma"
  | "ui-ux"
  | "prototyping";

export const tagLabels = {
  three: "Three.js",
  websockets: "WebSockets",
  react: "React",
  redis: "Redis",
  gray: "Gray",
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  node: "Node.js",
  next: "Next.js",
  kubernetes: "Kubernetes",
  postgresql: "PostgreSQL",
  ogl: "OGL.js",
  glsl: "GLSL",
  "spring-boot": "Spring Boot",
  supabase: "Supabase",
  n8n: "n8n",
  java: "Java",
  vite: "Vite",
  gamification: "Gamification",
  "intellij-idea": "IntelliJ",
  kotlin: "Kotlin",
  "android-studio": "Android Studio",
  sqlite: "SQLite",
  django: "Django",
  python: "Python",
  figma: "Figma",
  "ui-ux": "UI/UX",
  prototyping: "Prototyping",
} as const satisfies Record<TagVariant, string>;
