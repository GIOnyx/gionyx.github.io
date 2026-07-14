import img0 from "../../../assets/images/projects/sharkie/sharkie-0.webp";
import img1 from "../../../assets/images/projects/sharkie/sharkie-1.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "ClassLink",
  theme: "dark",
  tags: ["spring-boot", "react", "java", "javascript"],
  videoBorder: false,
  live: "https://github.com/GIOnyx/ClassLink.git",
  description:
    "A school enrollment system with curriculum versioning, student management, and course-to-curriculum linking to support registration workflows.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: img0,
        alt: "Student registration view",
        caption: "Student registration view",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: img1,
        alt: "Curriculum builder and linking dashboard",
        caption: "Curriculum builder and linking dashboard",
      },
    },
  ],
} as const satisfies ProjectContent;
