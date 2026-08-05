import { describe, expect, it } from "vitest";
import { sectionTaskEyebrow } from "@/lib/lessons/sectionTaskEyebrow";

describe("sectionTaskEyebrow", () => {
  it("buduje tę samą etykietę Temat dla działów 3–8", () => {
    expect(sectionTaskEyebrow("m5-3-1-ulamki-s2")).toBe("Dział 3 · Temat 1");
    expect(sectionTaskEyebrow("m5-8-4-pola-s5")).toBe("Dział 8 · Temat 4");
    expect(sectionTaskEyebrow("m6-9-5-objetosc-prostopadloscianu-definition-s1")).toBe("Dział 9 · Temat 5");
  });

  it("oznacza powtórzenia i odrzuca identyfikatory spoza zakresu", () => {
    expect(sectionTaskEyebrow("m5-6-r-turniej-s2")).toBe("Dział 6 · Powtórzenie");
    expect(sectionTaskEyebrow("m5-2-1-wielokrotnosci-s2")).toBeNull();
  });
});
