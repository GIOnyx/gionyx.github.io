import img0 from "../../../assets/images/projects/quibbo/quibbo-0.webp";
import img1 from "../../../assets/images/projects/quibbo/quibbo-1.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "Hygienix",
  theme: "dark",
  tags: ["react", "vite", "supabase", "gamification"],
  videoBorder: false,
  live: "https://hygienix.vercel.app/",
  description:
    "A web-based gamification platform that teaches essential hygiene practices to Grades 3-6 students through onboarding, progress tracking, leaderboards, and interactive gaming layers.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: img0,
        alt: "Hygienix interactive learning flow",
        caption: "Hygienix interactive learning flow",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: img1,
        alt: "Tooth washing and hand hygiene games",
        caption: "Tooth washing and hand hygiene games",
      },
    },
  ],
} as const satisfies ProjectContent;
