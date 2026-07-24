import { mathCurriculum } from "@/data/mathCurriculum";
import type { ProgramCurriculum, ProgramSection } from "@/types/program";

const grade6Sections = mathCurriculum.filter((section) => section.grade === 6);

export const plMath6Classic2026: ProgramCurriculum = {
  id: "pl-math-6-2026-classic",
  title: "Matematyka — klasa VI (2026/2027, ścieżka classic)",
  grade: 6,
  subject: "math",
  schoolYearLabel: "2026/2027",
  effectiveFrom: "2026-09-01",
  sections: grade6Sections.map<ProgramSection>((section, sectionIndex) => ({
    id: `M6-S${sectionIndex + 1}`,
    number: sectionIndex + 1,
    title: section.title,
    hoursLabel: `${section.topics.length} godz.`,
    goal: section.description,
    topics: section.topics.map((topic, topicIndex) => ({
      id: `M6-S${sectionIndex + 1}.T${topicIndex + 1}`,
      title: topic.title,
      hoursLabel: "1 godz.",
      coreLesson: topic.description,
      paperEvidence: "Materiały do uzupełnienia przez nauczyciela.",
      kind: "regular",
      requirement: "required",
      contentStatus: "metadata-only",
      skillIds: [topic.id],
      prerequisiteTopicIds: [],
    })),
  })),
  totalTopics: grade6Sections.reduce((total, section) => total + section.topics.length, 0),
};
