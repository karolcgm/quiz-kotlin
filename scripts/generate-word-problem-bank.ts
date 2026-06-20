/**
 * Generuje bank zadań tekstowych — 20 zadań na dział z poziomem trudności.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { mathCurriculum } from "../src/data/mathCurriculum.js";
import { SECTION_KIND } from "./section-kind-map.js";
import { enrichStory } from "./story-enrichment.js";
import { storiesForSection } from "./word-problem-pools.js";

const PROBLEMS_PER_SECTION = 20;

interface BankEntry {
  id: string;
  grade: number;
  sectionId: string;
  sectionTitle: string;
  title: string;
  difficulty: string;
  template: string;
  formula: string;
  skill: string;
  defaults: Record<string, number>;
  variableKeys: string[];
  parts: Array<{ id: string; label: string; formula: string; literalKey?: string }>;
  partialCredit: boolean;
}

const bank: BankEntry[] = [];

for (const section of mathCurriculum) {
  const kind = SECTION_KIND[section.id];
  if (!kind) {
    console.warn(`Brak mapowania rodzaju dla działu: ${section.id}`);
    continue;
  }

  const stories = storiesForSection(kind, section.grade).slice(0, PROBLEMS_PER_SECTION);

  stories.forEach((story, index) => {
    const enriched = enrichStory(story, index, kind, section.title, section.grade);
    bank.push({
      id: `${section.id}-${String(index + 1).padStart(2, "0")}`,
      grade: section.grade,
      sectionId: section.id,
      sectionTitle: section.title,
      title: enriched.title,
      difficulty: enriched.difficulty,
      template: enriched.template,
      formula: enriched.formula,
      skill: enriched.skill,
      defaults: enriched.defaults,
      variableKeys: enriched.variableKeys,
      parts: enriched.parts,
      partialCredit: enriched.partialCredit,
    });
  });
}

const output = `// AUTO-GENERATED — nie edytuj ręcznie. Uruchom: npx tsx scripts/generate-word-problem-bank.ts
import type { WordProblemTemplate } from "@/lib/wordProblems/types";

export const wordProblemBank: WordProblemTemplate[] = ${JSON.stringify(bank, null, 2)} as WordProblemTemplate[];

export const wordProblemCount = ${bank.length};

export const wordProblemsByGrade = ${JSON.stringify(
  [1, 2, 3, 4, 5, 6, 7, 8].map((g) => ({
    grade: g,
    count: bank.filter((p) => p.grade === g).length,
    easy: bank.filter((p) => p.grade === g && p.difficulty === "easy").length,
    medium: bank.filter((p) => p.grade === g && p.difficulty === "medium").length,
    hard: bank.filter((p) => p.grade === g && p.difficulty === "hard").length,
  })),
  null,
  2,
)} as const;
`;

mkdirSync("src/data/wordProblems", { recursive: true });
writeFileSync("src/data/wordProblems/bank.ts", output, "utf8");
console.log(`Generated ${bank.length} enriched word problems`);
