import { describe, expect, it } from "vitest";
import { createGeometryDiagnosticResult } from "@/lib/math/geometry";
import { GEOMETRY_FEEDBACK_CODES } from "@/types/geometry";

describe("diagnostyka geometrii", () => {
  it("mapuje wszystkie kody planu na pełną sekwencję pomocy i warstwę symboli", () => {
    for (const code of Object.values(GEOMETRY_FEEDBACK_CODES)) {
      const diagnostic = createGeometryDiagnosticResult(code, { memberIds: ["A", "B"] });
      expect(diagnostic.result.errorCodes).toEqual([code]);
      expect(diagnostic.copy.area.length).toBeGreaterThan(20);
      expect(diagnostic.copy.guidingQuestion).toContain("?");
      expect(diagnostic.copy.visualHint.length).toBeGreaterThan(20);
      expect(diagnostic.copy.analogousExample.length).toBeGreaterThan(20);
      expect(diagnostic.solution.steps.length).toBeGreaterThanOrEqual(3);
      expect(diagnostic.highlights[0].symbol).not.toBe("");
      expect(diagnostic.highlights[0].memberIds).toEqual(["A", "B"]);
    }
  });

  it("przyznaje część punktu za poprawną klasyfikację bez dowodu", () => {
    const diagnostic = createGeometryDiagnosticResult(GEOMETRY_FEEDBACK_CODES.classificationEvidence);
    expect(diagnostic.result).toMatchObject({ status: "partially-correct", score: 1, maxScore: 2 });
  });
});
