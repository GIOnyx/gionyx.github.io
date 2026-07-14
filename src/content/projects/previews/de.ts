import thumbnailCubeWar from "../../../assets/thumbnails/cubewar.webp";
import thumbnailQuibbo from "../../../assets/thumbnails/quibbo.webp";
import thumbnailPokedex from "../../../assets/thumbnails/pokedex.webp";
import thumbnailSharkie from "../../../assets/thumbnails/sharkie.webp";
import thumbnailStreakon from "../../../assets/thumbnails/streakon.webp";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "CiteWise",
    slug: "citewise",
    thumbnail: thumbnailStreakon,
    description: "Capstone research citation platform",
  },
  {
    title: "InStock",
    slug: "instock",
    thumbnail: thumbnailCubeWar,
    description: "Inventory & pantry manager",
  },
  {
    title: "Hygienix",
    slug: "hygienix",
    thumbnail: thumbnailQuibbo,
    description: "Interactive school hygiene game",
  },
  {
    title: "ClassLink",
    slug: "classlink",
    thumbnail: thumbnailSharkie,
    description: "School enrollment system",
  },
  {
    title: "RentMate",
    slug: "rentmate",
    thumbnail: thumbnailPokedex,
    description: "Property rental workspace manager",
  },
  {
    title: "TrikeGo",
    slug: "trikego",
    thumbnail: thumbnailStreakon,
    description: "Tricycle ride-sharing web app",
  },
  {
    title: "ReadySetCook",
    slug: "readysetcook",
    thumbnail: thumbnailCubeWar,
    description: "Android recipe suggestions app",
  },
  {
    title: "Insecta",
    slug: "insecta",
    thumbnail: thumbnailQuibbo,
    description: "Text-based OOP role playing game",
  },
  {
    title: "TrackBack",
    slug: "trackback",
    thumbnail: thumbnailPokedex,
    description: "Figma lost-and-found mobile design",
  },
] as const satisfies ProjectPreview[];
