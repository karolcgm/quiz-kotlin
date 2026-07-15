import { describe, expect, it } from "vitest";
import { createDecimalDiagnosticResult, decimalDiagnosticCopy, decimalDiagnosticHighlights } from "@/lib/math/decimals";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";

describe("diagnostyka bazowa WP-S5-F0", () => {
  it.each(Object.values(DECIMAL_FEEDBACK_CODES))("ma pełną sekwencję pomocy i niekolorową warstwę dla %s", (code) => {
    const copy = decimalDiagnosticCopy(code);
    expect(Object.values(copy).every((step) => step.trim().length > 10)).toBe(true);
    const highlights = decimalDiagnosticHighlights(code);
    expect(highlights[0]).toMatchObject({ state: "attention" });
    expect(highlights[0].symbol).not.toBe("");
    expect(highlights[0].pattern).toMatch(/solid|dashed|dotted|double/u);
    expect(createDecimalDiagnosticResult(code).result.errorCodes).toEqual([code]);
  });
});
