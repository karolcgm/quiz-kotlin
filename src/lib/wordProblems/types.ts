import type { GradeLevel } from "@/types/curriculum";
import type {
  TestSkill,
  WordProblemAnswerPartConfig,
  WordProblemDifficulty,
  WordProblemFormula,
} from "@/types/testWidget";

export type { WordProblemFormula, WordProblemDifficulty, WordProblemAnswerPartConfig };

export interface WordProblemTemplate {
  id: string;
  grade: GradeLevel;
  sectionId: string;
  sectionTitle: string;
  title: string;
  difficulty: WordProblemDifficulty;
  template: string;
  formula: WordProblemFormula;
  skill: TestSkill;
  defaults: Record<string, number>;
  variableKeys: string[];
  parts: WordProblemAnswerPartConfig[];
  partialCredit: boolean;
}

export type { WordProblemQuestionParams } from "@/types/testWidget";

export const DIFFICULTY_LABELS: Record<WordProblemDifficulty, string> = {
  easy: "Łatwe",
  medium: "Średnie",
  hard: "Trudne",
};

export const DIFFICULTY_COLORS: Record<WordProblemDifficulty, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-900",
  hard: "bg-rose-100 text-rose-900",
};
