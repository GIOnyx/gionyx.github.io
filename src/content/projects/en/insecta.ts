import img0 from "../../../assets/images/projects/quibbo/quibbo-0.webp";
import img1 from "../../../assets/images/projects/quibbo/quibbo-1.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "Insecta",
  theme: "dark",
  tags: ["java", "intellij-idea"],
  videoBorder: false,
  live: "",
  description:
    "A text-based turn-based RPG that applies object-oriented programming concepts through character classes and battle mechanics.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: img0,
        alt: "Turn-based battle screen",
        caption: "Turn-based battle screen",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: img1,
        alt: "Character creation and stats editor",
        caption: "Character creation and stats editor",
      },
    },
  ],
} as const satisfies ProjectContent;
