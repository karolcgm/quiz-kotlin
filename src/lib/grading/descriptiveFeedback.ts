import type { SkillScore } from "@/types/submission";
import type { TestSkill } from "@/types/testWidget";

const skillLabels: Record<TestSkill, string> = {
  addition: "dodawaniem",
  subtraction: "odejmowaniem",
  multiplication: "mnożeniem",
  division: "dzieleniem",
  fractions: "ułamkami",
  geometry: "geometrią",
  measurement: "jednostkami i pomiarami",
  algebra: "algebrą",
  statistics: "statystyką",
};

function listSkills(skills: SkillScore[]) {
  return skills.map((skill) => skillLabels[skill.skill]).join(", ");
}

export function buildDescriptiveFeedback(studentName: string, skillScores: SkillScore[]): string {
  if (skillScores.length === 0) {
    return `${studentName} ukończył test. Brakuje jednak danych szczegółowych do opisu umiejętności.`;
  }

  const strong = skillScores.filter((skill) => skill.percentage >= 85);
  const needsPractice = skillScores.filter((skill) => skill.percentage < 60);
  const stable = skillScores.filter((skill) => skill.percentage >= 60 && skill.percentage < 85);

  const parts: string[] = [];

  if (strong.length > 0) {
    parts.push(`${studentName} bardzo dobrze radzi sobie z ${listSkills(strong)}.`);
  }

  if (stable.length > 0) {
    parts.push(`W obszarze ${listSkills(stable)} wynik jest poprawny, ale warto utrwalić kilka przykładów.`);
  }

  if (needsPractice.length > 0) {
    parts.push(
      `Trudności pojawiły się przy ${listSkills(needsPractice)}. Warto wrócić do prostszych przykładów i przećwiczyć je krok po kroku.`,
    );
  }

  return parts.join(" ");
}
