import img0 from "../../../assets/images/projects/cubewar/cubewar-0.webp";
import img1 from "../../../assets/images/projects/cubewar/cubewar-1.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "ReadySetCook",
  theme: "dark",
  tags: ["kotlin", "android-studio", "sqlite"],
  videoBorder: false,
  live: "",
  description:
    "An Android application for ingredient selection, allergen filtering, and recipe recommendation with local data storage and user-friendly navigation.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: img0,
        alt: "ReadySetCook ingredient select screen",
        caption: "ReadySetCook ingredient select screen",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: img1,
        alt: "Recipe step view and filtering UI",
        caption: "Recipe step view and filtering UI",
      },
    },
  ],
} as const satisfies ProjectContent;
