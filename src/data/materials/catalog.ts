import type { MaterialDefinition } from "@/types/material";

export const MATERIAL_CATALOG: MaterialDefinition[] = [
  {
    id: "game-beaver-dam-v1",
    slug: "tama-liczb",
    version: 1,
    title: "Chrupek i Tama Liczb",
    shortDescription: "Wybieraj właściwe kłody, rozwiązuj działania i pomóż Chrupkowi naprawić tamę.",
    kind: "animated-mission",
    accessTier: "visual",
    subjectId: "math",
    grades: [5],
    curriculumId: "pl-math-5-2026-classic",
    sectionId: "M5-S1",
    topicIds: ["M5-1.2", "M5-1.3", "M5-1.5"],
    skillIds: ["M5-1.2-mental-add-sub", "M5-1.3-mental-mul-div", "M5-1.5-estimation"],
    difficulty: "core",
    estimatedMinutes: 7,
    channels: ["student-solo", "teacher-board", "homework"],
    thumbnail: "/materials/beaver-dam/v1/beaver-dam-game-scene-v1.png",
    componentId: "beaver-dam-game",
    studentCanChoose: true,
    published: true,
  },
];

export function getMaterial(slug: string) {
  return MATERIAL_CATALOG.find((material) => material.slug === slug);
}
