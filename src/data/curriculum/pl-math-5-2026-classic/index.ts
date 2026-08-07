import { z } from "zod";
export { plMath4Classic2026 } from "@/data/curriculum/pl-math-4-2026-classic";
export { plMath6Classic2026 } from "@/data/curriculum/pl-math-6-2026-classic";
import { plMath4Classic2026 } from "@/data/curriculum/pl-math-4-2026-classic";
import { plMath6Classic2026 } from "@/data/curriculum/pl-math-6-2026-classic";
import type { ProgramCurriculum, ProgramSection, ProgramTopic } from "@/types/program";
import { math5ClassicSections, MATH5_CLASSIC_TOPIC_COUNT } from "./sections";

const topicKindSchema = z.enum(["regular", "review", "exam", "optional", "diagnostic"]);
const contentStatusSchema = z.enum(["metadata-only", "draft", "review", "published", "retired"]);
const requirementSchema = z.enum(["required", "recommended", "optional", "extension"]);

export const programTopicSchema = z.object({
  id: z.string().regex(/^M[456]-/),
  title: z.string().min(2),
  hoursLabel: z.string().min(1),
  coreLesson: z.string().min(2),
  paperEvidence: z.string().min(2),
  kind: topicKindSchema,
  requirement: requirementSchema,
  contentStatus: contentStatusSchema,
  skillIds: z.array(z.string()),
  prerequisiteTopicIds: z.array(z.string()),
});

export const programSectionSchema = z.object({
  id: z.string().regex(/^M[456]-S\d+$/),
  number: z.number().int().min(0).max(12),
  title: z.string().min(2),
  hoursLabel: z.string().min(1),
  goal: z.string().min(4),
  topics: z.array(programTopicSchema).min(1),
});

export const programCurriculumSchema = z.object({
  id: z.enum(["pl-math-4-2026-classic", "pl-math-5-2026-classic", "pl-math-6-2026-classic"]),
  version: z.number().int().positive(),
  title: z.string().min(4),
  grade: z.union([z.literal(4), z.literal(5), z.literal(6)]),
  subject: z.literal("math"),
  schoolYearLabel: z.string().min(4),
  effectiveFrom: z.string().min(4),
  sections: z.array(programSectionSchema).min(1),
  totalTopics: z.number().int().positive(),
});

function collectTopicIds(sections: ProgramSection[]): string[] {
  return sections.flatMap((section) => section.topics.map((topic) => topic.id));
}

export function validateProgramCurriculum(curriculum: ProgramCurriculum): void {
  programCurriculumSchema.parse(curriculum);

  const topicIds = collectTopicIds(curriculum.sections);
  const uniqueIds = new Set(topicIds);

  if (uniqueIds.size !== topicIds.length) {
    throw new Error("Program zawiera zduplikowane identyfikatory tematów.");
  }

  if (curriculum.totalTopics !== topicIds.length) {
    throw new Error(
      `totalTopics (${curriculum.totalTopics}) nie zgadza się z liczbą tematów (${topicIds.length}).`,
    );
  }

  for (const topic of curriculum.sections.flatMap((s) => s.topics)) {
    for (const prerequisiteId of topic.prerequisiteTopicIds) {
      if (!uniqueIds.has(prerequisiteId)) {
        throw new Error(`Temat ${topic.id}: brak prerequisite ${prerequisiteId}.`);
      }
    }
  }
}

export const plMath5Classic2026: ProgramCurriculum = {
  id: "pl-math-5-2026-classic",
  version: 1,
  title: "Matematyka — klasa V (2026/2027, ścieżka classic)",
  grade: 5,
  subject: "math",
  schoolYearLabel: "2026/2027",
  effectiveFrom: "2026-09-01",
  sections: math5ClassicSections,
  totalTopics: MATH5_CLASSIC_TOPIC_COUNT,
};

validateProgramCurriculum(plMath4Classic2026);
validateProgramCurriculum(plMath5Classic2026);
validateProgramCurriculum(plMath6Classic2026);

export const programCurricula = [plMath4Classic2026, plMath5Classic2026, plMath6Classic2026] as const;

export function getProgramCurriculum(curriculumId: string): ProgramCurriculum | null {
  return programCurricula.find((curriculum) => curriculum.id === curriculumId) ?? null;
}

export function getProgramCurriculumForGrade(grade: number): ProgramCurriculum | null {
  return programCurricula.find((curriculum) => curriculum.grade === grade) ?? null;
}

export function getProgramSection(
  curriculumId: string,
  sectionId: string,
): ProgramSection | null {
  const curriculum = getProgramCurriculum(curriculumId);
  return curriculum?.sections.find((section) => section.id === sectionId) ?? null;
}

export function getProgramTopic(
  curriculumId: string,
  topicId: string,
): { section: ProgramSection; topic: ProgramTopic } | null {
  const curriculum = getProgramCurriculum(curriculumId);
  if (!curriculum) return null;

  for (const section of curriculum.sections) {
    const topic = section.topics.find((item) => item.id === topicId);
    if (topic) {
      return { section, topic };
    }
  }

  return null;
}

export function countTopicsByStatus(curriculum: ProgramCurriculum) {
  const topics = curriculum.sections.flatMap((s) => s.topics);
  return {
    total: topics.length,
    metadataOnly: topics.filter((t) => t.contentStatus === "metadata-only").length,
    published: topics.filter((t) => t.contentStatus === "published").length,
  };
}
