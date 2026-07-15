import { describe, expect, it } from "vitest";
import {
  buildFractionBarSegments,
  buildFractionCircleSectors,
  fractionAsNumber,
} from "@/lib/math/fractions";

describe("niezmienniki modeli ułamkowych", () => {
  it("dzieli każdą całość paska na równe części w granicy tolerancji", () => {
    const segments = buildFractionBarSegments({ numerator: 7, denominator: 12 }, 360);
    expect(segments).toHaveLength(12);
    expect(segments.every((segment) => Math.abs(segment.size - 30) < 1e-10)).toBe(true);
    expect(segments.filter((segment) => segment.selected)).toHaveLength(7);
  });

  it("utrzymuje równy kąt sektorów i jeden środek logiczny na koło", () => {
    const sectors = buildFractionCircleSectors({ numerator: 7, denominator: 4 });
    expect(sectors).toHaveLength(8);
    expect(new Set(sectors.map((sector) => sector.endAngle - sector.startAngle))).toEqual(new Set([90]));
    expect(sectors.filter((sector) => sector.circleIndex === 0)).toHaveLength(4);
    expect(sectors.filter((sector) => sector.circleIndex === 1)).toHaveLength(4);
    expect(sectors.filter((sector) => sector.selected)).toHaveLength(7);
  });

  it("wylicza poziom cieczy zgodny z wartością", () => {
    expect(fractionAsNumber({ numerator: 7, denominator: 12 })).toBeCloseTo(7 / 12, 12);
    expect(() => fractionAsNumber({ numerator: 1, denominator: 0 })).toThrow(/mianownika/u);
  });
});
