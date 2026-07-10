import { z } from "zod";
import type { ProgramCurriculum, ProgramSection, ProgramTopic } from "@/types/program";
import { math5ClassicSections, MATH5_CLASSIC_TOPIC_COUNT } from "./sections";

const topicKindSchema = z.enum(["regular", "review", "exam", "optional", "diagnostic"]);
const contentStatusSchema = z.enum(["metadata-only", "draft", "review", "published", "retired"]);
const requirementSchema = z.enum(["required", "recommended", "optional", "extension"]);

export const programTopicSchema = z.object({
  id: z.string().regex(/^M5-/),
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
  id: z.string().regex(/^M5-S\d+$/),
  number: z.number().int().min(0).max(8),
  title: z.string().min(2),
  hoursLabel: z.string().min(1),
  goal: z.string().min(4),
  topics: z.array(programTopicSchema).min(1),
});

export const programCurriculumSchema = z.object({
  id: z.literal("pl-math-5-2026-classic"),
  title: z.string().min(4),
  grade: z.literal(5),
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
  title: "Matematyka — klasa V (2026/2027, ścieżka classic)",
  grade: 5,
  subject: "math",
  schoolYearLabel: "2026/2027",
  effectiveFrom: "2026-09-01",
  sections: math5ClassicSections,
  totalTopics: MATH5_CLASSIC_TOPIC_COUNT,
};

validateProgramCurriculum(plMath5Classic2026);

export function getProgramCurriculum(curriculumId: string): ProgramCurriculum | null {
  if (curriculumId === plMath5Classic2026.id) {
    return plMath5Classic2026;
  }
  return null;
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
