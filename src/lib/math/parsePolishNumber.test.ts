import { describe, expect, it } from "vitest";
import { parsePolishNumber, parsePolishNumberOrNull } from "@/lib/math/parsePolishNumber";

describe("parsePolishNumber", () => {
  it("akceptuje przecinek dziesiętny", () => {
    expect(parsePolishNumber("3,14")).toEqual({ ok: true, value: 3.14 });
  });

  it("akceptuje kropkę dziesiętną", () => {
    expect(parsePolishNumber("2.5")).toEqual({ ok: true, value: 2.5 });
  });

  it("normalizuje spacje (separator tysięcy)", () => {
    expect(parsePolishNumber("1 234,5")).toEqual({ ok: true, value: 1234.5 });
  });

  it("obsługuje liczby ujemne", () => {
    expect(parsePolishNumber("-12,5")).toEqual({ ok: true, value: -12.5 });
  });

  it("nie traktuje pustego pola jako zero", () => {
    expect(parsePolishNumber("")).toEqual({ ok: false, reason: "empty" });
    expect(parsePolishNumber("   ")).toEqual({ ok: false, reason: "empty" });
    expect(parsePolishNumberOrNull("")).toBeNull();
  });

  it("nie traktuje samego minusa jako liczby", () => {
    expect(parsePolishNumber("-")).toEqual({ ok: false, reason: "empty" });
  });

  it("odrzuca niepoprawne wpisy", () => {
    expect(parsePolishNumber("abc")).toEqual({ ok: false, reason: "invalid" });
    expect(parsePolishNumber("12,34,56")).toEqual({ ok: false, reason: "invalid" });
  });
});
