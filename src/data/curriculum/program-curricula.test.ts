import { describe, expect, it } from "vitest";
import {
  getProgramCurriculumForGrade,
  plMath5Classic2026,
  plMath6Classic2026,
} from "@/data/curriculum/pl-math-5-2026-classic";

describe("programy klasowe", () => {
  it("dobiera plan klasy VI zamiast planu klasy V", () => {
    expect(getProgramCurriculumForGrade(5)?.id).toBe(plMath5Classic2026.id);
    expect(getProgramCurriculumForGrade(6)?.id).toBe(plMath6Classic2026.id);
  });

  it("ma gotowe działy i tematy dla klasy VI", () => {
    expect(plMath6Classic2026.grade).toBe(6);
    expect(plMath6Classic2026.sections.length).toBeGreaterThan(0);
    expect(plMath6Classic2026.totalTopics).toBeGreaterThan(0);
  });
});
