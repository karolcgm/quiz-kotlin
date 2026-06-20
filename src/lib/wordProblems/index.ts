import { wordProblemBank } from "@/data/wordProblems/bank";
import type { GradeLevel } from "@/types/curriculum";
import type { WordProblemTemplate } from "@/lib/wordProblems/types";

export function getWordProblemsForGrade(grade: GradeLevel): WordProblemTemplate[] {
  return wordProblemBank.filter((item) => item.grade === grade);
}

export function getWordProblemsForSection(sectionId: string): WordProblemTemplate[] {
  return wordProblemBank.filter((item) => item.sectionId === sectionId);
}

export function getWordProblemById(id: string): WordProblemTemplate | undefined {
  return wordProblemBank.find((item) => item.id === id);
}

export function getWordProblemSectionsForGrade(grade: GradeLevel) {
  const bySection = new Map<string, { sectionId: string; sectionTitle: string; problems: WordProblemTemplate[] }>();

  for (const problem of getWordProblemsForGrade(grade)) {
    const existing = bySection.get(problem.sectionId);
    if (existing) {
      existing.problems.push(problem);
    } else {
      bySection.set(problem.sectionId, {
        sectionId: problem.sectionId,
        sectionTitle: problem.sectionTitle,
        problems: [problem],
      });
    }
  }

  return Array.from(bySection.values());
}

export { wordProblemBank };
