import img0 from "../../../assets/images/projects/pokedex/pokedex-0.webp";
import img1 from "../../../assets/images/projects/pokedex/pokedex-1.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "TrackBack",
  theme: "dark",
  tags: ["figma", "ui-ux", "prototyping"],
  videoBorder: false,
  live: "https://www.figma.com/design/f6ii06S1Pkl7f8wBw8Tg9R/HCI-Wireframe?node-id=0-1&t=P7tBFlOWam4Hk8IE-1",
  description:
    "A digital campus lost-and-found system prototype designed with interactive mockups for usability testing and stakeholder feedback.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: img0,
        alt: "Figma wireframe flow",
        caption: "Figma wireframe flow",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: img1,
        alt: "Prototype screens of mobile interface",
        caption: "Prototype screens of mobile interface",
      },
    },
  ],
} as const satisfies ProjectContent;
