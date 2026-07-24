import { grade6PlanSections } from "./plan";
import type { ProgramCurriculum, ProgramSection } from "@/types/program";

export const plMath6Classic2026: ProgramCurriculum = {
  id: "pl-math-6-2026-classic",
  version: 2,
  title: "Matematyka — klasa VI (2026/2027)",
  grade: 6,
  subject: "math",
  schoolYearLabel: "2026/2027",
  effectiveFrom: "2026-09-01",
  sections: grade6PlanSections.map<ProgramSection>((section) => ({
    id: `M6-S${section.number}`,
    number: section.number,
    title: section.title,
    hoursLabel: `${section.topics.length} tematów`,
    goal: section.goal,
    topics: section.topics.map((topic, topicIndex) => ({
      id: `M6-${section.number}.${topicIndex + 1}`,
      title: topic.title,
      hoursLabel: topic.kind === "exam" ? "2 godz." : "1 godz.",
      coreLesson: topic.goal,
      paperEvidence: "Szkielet materiału: slajdy do rozwinięcia w kolejnej iteracji.",
      kind: topic.kind === "review" ? "review" : topic.kind === "exam" ? "exam" : topic.kind === "optional" ? "optional" : "regular",
      requirement: topic.kind === "optional" ? "optional" : "required",
      contentStatus: "draft",
      skillIds: [`M6-${section.number}.${topicIndex + 1}-skill`],
      prerequisiteTopicIds: [],
    })),
  })),
  totalTopics: grade6PlanSections.reduce((total, section) => total + section.topics.length, 0),
};
