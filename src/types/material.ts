export type MaterialKind =
  | "animated-mission"
  | "interactive-exercise"
  | "mini-game"
  | "lesson-segment"
  | "worksheet"
  | "quiz"
  | "classroom-game";

export interface MaterialDefinition {
  id: string;
  slug: string;
  version: number;
  title: string;
  shortDescription: string;
  kind: MaterialKind;
  accessTier: "core" | "visual" | "premium";
  subjectId: "math";
  grades: number[];
  curriculumId: string;
  sectionId: string;
  topicIds: string[];
  skillIds: string[];
  difficulty: "support" | "core" | "challenge";
  estimatedMinutes: number;
  channels: Array<"student-solo" | "teacher-board" | "homework">;
  thumbnail: string;
  componentId: string;
  studentCanChoose: boolean;
  published: boolean;
}
