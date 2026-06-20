import type { SkillScore, SubmissionAnswer } from "@/types/submission";

export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}

export function groupScoresBySkill(answers: SubmissionAnswer[]): SkillScore[] {
  const grouped = new Map<string, { score: number; maxScore: number }>();

  for (const answer of answers) {
    const current = grouped.get(answer.skill) ?? { score: 0, maxScore: 0 };
    grouped.set(answer.skill, {
      score: current.score + answer.score,
      maxScore: current.maxScore + answer.maxScore,
    });
  }

  return Array.from(grouped.entries()).map(([skill, value]) => ({
    skill: skill as SkillScore["skill"],
    score: value.score,
    maxScore: value.maxScore,
    percentage: calculatePercentage(value.score, value.maxScore),
  }));
}
