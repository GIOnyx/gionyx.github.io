import img0 from "../../../assets/images/projects/streakon/streakon-0.webp";
import img1 from "../../../assets/images/projects/streakon/streakon-1.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "CiteWise",
  theme: "dark",
  tags: ["spring-boot", "react", "supabase", "n8n"],
  videoBorder: false,
  live: "https://github.com/sophie546/CiteWise.git",
  description:
    "An intelligent academic research platform that uses AI-assisted workflows to support citation management, literature validation, semantic scoring, and introduction generation.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: img0,
        alt: "CiteWise research dashboard",
        caption: "CiteWise research dashboard",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: img1,
        alt: "Citation scoring metrics",
        caption: "Citation scoring metrics",
      },
    },
  ],
} as const satisfies ProjectContent;
