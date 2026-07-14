import img0 from "../../../assets/images/projects/pokedex/pokedex-0.webp";
import img1 from "../../../assets/images/projects/pokedex/pokedex-1.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "RentMate",
  theme: "dark",
  tags: ["django", "supabase", "python", "css"],
  videoBorder: false,
  live: "https://github.com/sipjems13/CSIT327-G7-RentMate.git",
  description:
    "A property rental management platform where I served as project manager and scrum master, coordinating sprints, task distribution, and milestone delivery.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: img0,
        alt: "RentMate dashboard",
        caption: "RentMate dashboard",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: img1,
        alt: "Property rental metrics and schedules",
        caption: "Property rental metrics and schedules",
      },
    },
  ],
} as const satisfies ProjectContent;
