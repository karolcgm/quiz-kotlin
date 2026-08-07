import {
  GRADE4_TOPIC_COUNT,
  grade4PlanSections,
} from "@/data/curriculum/pl-math-4-2026-classic/plan";
import type { ProgramCurriculum, ProgramSection, TopicKind } from "@/types/program";

const hoursLabel = (hours: number) => {
  if (hours === 1) return "1 godz.";
  return `${hours} godz.`;
};

const mapKind = (kind: "regular" | "review" | "exam"): TopicKind => kind;

export const plMath4Classic2026: ProgramCurriculum = {
  id: "pl-math-4-2026-classic",
  version: 1,
  title: "Matematyka — klasa IV (2026/2027)",
  grade: 4,
  subject: "math",
  schoolYearLabel: "2026/2027",
  effectiveFrom: "2026-09-01",
  sections: grade4PlanSections.map<ProgramSection>((section) => ({
    id: `M4-S${section.number}`,
    number: section.number,
    title: section.title,
    hoursLabel: hoursLabel(section.hours),
    goal: section.goal,
    topics: section.topics.map((topic, topicIndex) => {
      const topicId = `M4-${section.number}.${topicIndex + 1}`;
      return {
        id: topicId,
        title: topic.title,
        hoursLabel: hoursLabel(topic.hours),
        coreLesson: topic.goal.charAt(0).toUpperCase() + topic.goal.slice(1),
        paperEvidence: topic.kind === "exam"
          ? "Pozycja planu przeznaczona na pracę klasową i jej omówienie."
          : "Szkielet scenariusza gotowy do uzupełnienia treścią, modelem i serią zadań.",
        kind: mapKind(topic.kind),
        requirement: "required",
        contentStatus: "draft",
        skillIds: [`${topicId}-skill`],
        prerequisiteTopicIds: [],
      };
    }),
  })),
  totalTopics: GRADE4_TOPIC_COUNT,
};

export {
  GRADE4_ALLOCATED_HOURS,
  GRADE4_TOTAL_HOURS,
  GRADE4_TOPIC_COUNT,
  grade4PlanSections,
} from "./plan";
