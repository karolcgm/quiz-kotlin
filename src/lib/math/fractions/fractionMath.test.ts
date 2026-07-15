import { describe, expect, it } from "vitest";
import {
  areEquivalentFractions,
  fractionStackValueFromFraction,
  isFractionSimplified,
  mixedToImproper,
  normalizeFraction,
  parseFractionInput,
  parseFractionStackValue,
  toMixedFraction,
} from "@/lib/math/fractions";

describe("parser i normalizator ułamków", () => {
  it.each([
    ["3/4", { numerator: 3, denominator: 4 }, "fraction"],
    [" 12 / 25 ", { numerator: 12, denominator: 25 }, "fraction"],
    ["1 3/4", { numerator: 7, denominator: 4 }, "mixed"],
    ["-1 3/4", { numerator: -7, denominator: 4 }, "mixed"],
    ["8", { numerator: 8, denominator: 1 }, "integer"],
    ["2⁄6", { numerator: 1, denominator: 3 }, "fraction"],
  ] as const)("parsuje %s", (input, expected, kind) => {
    const result = parseFractionInput(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.kind).toBe(kind);
      expect(result.normalized).toMatchObject(expected);
    }
  });

  it.each([
    ["", "FRA_EMPTY_PART", "fraction"],
    ["/4", "FRA_EMPTY_PART", "numerator"],
    ["4/", "FRA_EMPTY_PART", "denominator"],
    ["4/0", "FRA_ZERO_DENOMINATOR", "denominator"],
    ["1/2/3", "FRA_AMBIGUOUS_INPUT", "fraction"],
    ["1 2 3/4", "FRA_AMBIGUOUS_INPUT", "fraction"],
  ] as const)("zwraca ustrukturyzowany błąd dla %s", (input, code, part) => {
    const result = parseFractionInput(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatchObject({ code, part });
  });

  it("nie zamienia pustej kratki na zero i zachowuje zero jako poprawny licznik", () => {
    const incomplete = parseFractionStackValue({ numerator: [""], denominator: ["5"] });
    expect(incomplete).toMatchObject({ ok: false, error: { code: "FRA_EMPTY_PART", part: "numerator" } });

    const zero = parseFractionStackValue({ numerator: ["0"], denominator: ["5"] });
    expect(zero).toMatchObject({ ok: true, normalized: { numerator: 0, denominator: 1 } });
  });

  it("blokuje mianownik zero, lecz wynik parsera zachowuje surowe wejście", () => {
    const result = parseFractionInput("12 / 0");
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "FRA_ZERO_DENOMINATOR",
        input: "12 / 0",
        message: "Na zero części nie można podzielić całości.",
      },
    });
  });
});
describe("wartość i równoważność", () => {
  it("normalizuje znak mianownika i skraca", () => {
    expect(normalizeFraction({ numerator: 12, denominator: -18 })).toEqual({
      numerator: -2,
      denominator: 3,
      normalized: true,
    });
  });

  it("zamienia liczbę mieszaną w obie strony bez zmiany wartości", () => {
    const improper = mixedToImproper({ wholePart: 2, numerator: 3, denominator: 5 });
    expect(improper).toEqual({ numerator: 13, denominator: 5 });
    expect(toMixedFraction(improper)).toEqual({ wholePart: 2, numerator: 3, denominator: 5 });
  });

  it("rozpoznaje odpowiedzi równoważne i postać nieskracalną", () => {
    expect(areEquivalentFractions({ numerator: 3, denominator: 4 }, { numerator: 21, denominator: 28 })).toBe(true);
    expect(areEquivalentFractions({ numerator: 3, denominator: 4 }, { numerator: 4, denominator: 3 })).toBe(false);
    expect(isFractionSimplified({ numerator: 21, denominator: 28 })).toBe(false);
    expect(isFractionSimplified({ numerator: 3, denominator: 4 })).toBe(true);
  });

  it("buduje osobne kratki jedno- i dwucyfrowych ułamków oraz liczby mieszanej", () => {
    expect(fractionStackValueFromFraction({ numerator: 3, denominator: 7 })).toEqual({ numerator: ["3"], denominator: ["7"] });
    expect(fractionStackValueFromFraction({ numerator: 12, denominator: 25 })).toEqual({ numerator: ["1", "2"], denominator: ["2", "5"] });
    expect(fractionStackValueFromFraction({ numerator: 7, denominator: 4 }, { mixed: true })).toEqual({
      wholePart: ["1"], numerator: ["3"], denominator: ["4"],
    });
  });
});
