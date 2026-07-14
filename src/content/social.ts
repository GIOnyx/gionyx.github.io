export const social = [
  { url: "mailto:gregoryivanonyx.badinas@gmail.com", name: "mail" },
  { url: "https://github.com/GIOnyx", name: "github" },
  { url: "https://linkedin.com/in/gregory-ivan-onyx-badinas-4721092b3", name: "linkedin" }
] as const satisfies { url: string; name: "mail" | "github" | "instagram" | "linkedin" | "x" }[];
