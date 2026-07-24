import { describe, expect, it } from "vitest";
import {
  getProgramCurriculumForGrade,
  plMath5Classic2026,
  plMath6Classic2026,
} from "@/data/curriculum/pl-math-5-2026-classic";
import { grade6SkeletonLessons } from "@/data/lessons/grade6-skeleton";

describe("programy klasowe", () => {
  it("dobiera plan klasy VI zamiast planu klasy V", () => {
    expect(getProgramCurriculumForGrade(5)?.id).toBe(plMath5Classic2026.id);
    expect(getProgramCurriculumForGrade(6)?.id).toBe(plMath6Classic2026.id);
  });

  it("ma gotowe działy i tematy dla klasy VI", () => {
    expect(plMath6Classic2026.grade).toBe(6);
    expect(plMath6Classic2026.sections).toHaveLength(9);
    expect(plMath6Classic2026.totalTopics).toBe(71);
  });

  it("tworzy niezmienny slajd otwierający i końcową ocenę dla każdego tematu", () => {
    expect(grade6SkeletonLessons).toHaveLength(plMath6Classic2026.totalTopics);
    for (const lesson of grade6SkeletonLessons) {
      expect(lesson.curriculumId).toBe("pl-math-6-2026-classic");
      expect(lesson.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
      expect(lesson.stages.at(-1)?.kind).toBe("understanding");
    }
  });
});
