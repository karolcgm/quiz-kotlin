import type { GradeLevel } from "@/types/curriculum";
import type { TestSkill, WordProblemFormula } from "@/types/testWidget";

export type { WordProblemFormula };

export interface WordProblemTemplate {
  id: string;
  grade: GradeLevel;
  sectionId: string;
  sectionTitle: string;
  title: string;
  /** Szablon treści z placeholderami {a}, {b}, {name}, {item} itd. */
  template: string;
  formula: WordProblemFormula;
  skill: TestSkill;
  defaults: Record<string, number>;
  /** Klucze liczbowe edytowalne przez nauczyciela */
  variableKeys: string[];
}

export type { WordProblemQuestionParams } from "@/types/testWidget";
