import type { SkillScore } from "@/types/submission";
import type { TestSkill } from "@/types/testWidget";

export const skillLabels: Record<TestSkill, string> = {
  addition: "Dodawanie",
  subtraction: "Odejmowanie",
  multiplication: "Mnożenie",
  division: "Dzielenie",
  fractions: "Ułamki",
  geometry: "Geometria",
  measurement: "Jednostki i miary",
  algebra: "Algebra",
  statistics: "Statystyka",
};

export type ProgressSource = "classwork" | "practice";

export interface ProgressAnswerInput {
  skill: string;
  score: number;
  max_score: number;
  source?: ProgressSource;
}

export interface SkillProgress extends SkillScore {
  label: string;
  classworkScore: number;
  classworkMaxScore: number;
  practiceScore: number;
  practiceMaxScore: number;
}

export function aggregateProgress(answers: ProgressAnswerInput[]): SkillProgress[] {
  const grouped = new Map<TestSkill, Omit<SkillProgress, "label" | "percentage">>();

  for (const answer of answers) {
    const skill = answer.skill as TestSkill;
    const current = grouped.get(skill) ?? {
      skill,
      score: 0,
      maxScore: 0,
      classworkScore: 0,
      classworkMaxScore: 0,
      practiceScore: 0,
      practiceMaxScore: 0,
    };

    current.score += Number(answer.score);
    current.maxScore += Number(answer.max_score);

    if (answer.source === "practice") {
      current.practiceScore += Number(answer.score);
      current.practiceMaxScore += Number(answer.max_score);
    } else {
      current.classworkScore += Number(answer.score);
      current.classworkMaxScore += Number(answer.max_score);
    }

    grouped.set(skill, current);
  }

  return Array.from(grouped.values())
    .map((value) => ({
      ...value,
      label: skillLabels[value.skill] ?? value.skill,
      percentage: value.maxScore > 0 ? Math.round((value.score / value.maxScore) * 100) : 0,
    }))
    .sort((left, right) => right.percentage - left.percentage);
}
