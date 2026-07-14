import img0 from "../../../assets/images/projects/streakon/streakon-2.webp";
import img1 from "../../../assets/images/projects/streakon/streakon-3.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "TrikeGo",
  theme: "dark",
  tags: ["django", "supabase", "python", "css"],
  videoBorder: false,
  live: "https://csit327-g1-trikego.onrender.com",
  description:
    "A real-time ride-sharing application concept for tricycles, with backend APIs, Supabase integration, and driver-commuter matching logic.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: img0,
        alt: "TrikeGo driver matching screen",
        caption: "TrikeGo driver matching screen",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: img1,
        alt: "Map and commuter UI mockups",
        caption: "Map and commuter UI mockups",
      },
    },
  ],
} as const satisfies ProjectContent;
