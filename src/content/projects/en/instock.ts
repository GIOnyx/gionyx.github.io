import img0 from "../../../assets/images/projects/cubewar/cubewar-0.webp";
import img1 from "../../../assets/images/projects/cubewar/cubewar-1.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "InStock",
  theme: "dark",
  tags: ["spring-boot", "react", "supabase", "kotlin"],
  videoBorder: false,
  live: "https://github.com/GIOnyx/IT342_InStock_G4_Badinas.git",
  description:
    "An inventory, pantry management, and recipe suggestion system with a Spring Boot backend, responsive React frontend, and native Android companion app.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: img0,
        alt: "InStock inventory control panel",
        caption: "InStock inventory control panel",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: img1,
        alt: "Recipe recommendation screen",
        caption: "Recipe recommendation screen",
      },
    },
  ],
} as const satisfies ProjectContent;
