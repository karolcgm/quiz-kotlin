import { describe, expect, it } from "vitest";
import {
  areEquivalentDecimals,
  buildDecimalWrittenAddSubModel,
  buildDecimalWrittenDivideModel,
  buildDecimalWrittenMultiplyModel,
  convertDecimalUnit,
  decimalInputFromPlaceState,
  decimalPlaceStateFromInput,
  formatDecimal,
  normalizeDecimalUnit,
  parseDecimalInput,
} from "@/lib/math/decimals";

function parsed(input: string) {
  const result = parseDecimalInput(input);
  if (!result.ok) throw new Error(result.error.message);
  return result;
}

describe("parser i dokładna semantyka liczb dziesiętnych", () => {
  it.each([
    ["2,5", "2,5", 1],
    ["2.50", "2,50", 2],
    ["  0,0400  ", "0,0400", 4],
    [",5", "0,5", 1],
  ])("normalizuje %s bez utraty zer", (input, display, scale) => {
    const result = parsed(input);
    expect(result.trace.display).toBe(display);
    expect(result.value.scale).toBe(scale);
  });

  it("rozróżnia równą wartość od śladu zer końcowych", () => {
    const short = parsed("2,5");
    const medium = parsed("2,50");
    const long = parsed("2,500");
    expect(areEquivalentDecimals(short.value, medium.value)).toBe(true);
    expect(areEquivalentDecimals(medium.value, long.value)).toBe(true);
    expect([short.trace.trailingZeroCount, medium.trace.trailingZeroCount, long.trace.trailingZeroCount]).toEqual([0, 1, 2]);
  });

  it("nie zamienia pustki, samego przecinka ani niedokończonej części na zero", () => {
    expect(parseDecimalInput("")).toMatchObject({ ok: false, error: { code: "DEC_EMPTY" } });
    expect(parseDecimalInput(",")).toMatchObject({ ok: false, error: { code: "DEC_EMPTY" } });
    expect(parseDecimalInput("2,")).toMatchObject({ ok: false, error: { code: "DEC_EMPTY" } });
    expect(parseDecimalInput("1,2.3")).toMatchObject({ ok: false, error: { code: "DEC_MULTIPLE_SEPARATORS" } });
  });

  it("odrzuca spacje wewnętrzne i format wykładniczy", () => {
    expect(parseDecimalInput("1 2,5")).toMatchObject({ ok: false, error: { code: "DEC_INVALID_FORMAT" } });
    expect(parseDecimalInput("2e3")).toMatchObject({ ok: false, error: { code: "DEC_INVALID_FORMAT" } });
  });
});

describe("tabela pozycyjna i działania pisemne", () => {
  it("odtwarza 1–4 miejsca po przecinku bez uznawania luk za zero", () => {
    for (const value of ["4,1", "4,12", "4,123", "4,1230"]) {
      const state = decimalPlaceStateFromInput(value);
      expect(decimalInputFromPlaceState(state)).toBe(value);
    }
    expect(decimalInputFromPlaceState({ ones: "4", hundredths: "3" })).toBe("4,□3");
  });

  it("wyrównuje przecinki i wyprowadza wymianę oraz pożyczanie", () => {
    const addition = buildDecimalWrittenAddSubModel("2,45", "1,7", "add");
    expect(addition.columns).toEqual([0, -1, -2]);
    expect(addition.exchanges).toContainEqual(expect.objectContaining({ kind: "carry", columnPower: -1 }));
    expect(addition.result.map((cell) => cell.digit).join("")).toBe("415");
    const subtraction = buildDecimalWrittenAddSubModel("5,2", "1,875", "subtract");
    expect(subtraction.exchanges.some((exchange) => exchange.kind === "borrow")).toBe(true);
    expect(subtraction.columns).toEqual([0, -1, -2, -3]);
  });

  it("wyprowadza każdą parę po skosie, przesunięcia i wszystkie kolumny dodawania", () => {
    const model = buildDecimalWrittenMultiplyModel("1,20", "0,35");
    expect(model.productPlaces).toBe(4);
    expect(model.productDisplay).toBe("0,4200");
    expect(model.pairs).toHaveLength(model.integerTop.length * model.integerBottom.length);
    for (const pair of model.pairs) {
      expect(pair.product).toBe(Number(pair.topDigit) * Number(pair.bottomDigit));
      expect(pair.targetColumn).toBe(pair.topPower + pair.bottomPower);
    }
    expect(model.partialProducts.map((partial) => partial.shift)).toEqual([0, 1]);
    const reconstructed = [...model.additionColumns].reverse().map((column) => column.resultDigit).join("").replace(/^0+/u, "");
    expect(reconstructed).toBe((BigInt(model.integerTop) * BigInt(model.integerBottom)).toString());
  });

  it("skaluje dzielną i dzielnik razem bez zmiany ilorazu oraz dopisuje zera bez zmiany wartości", () => {
    const plain = buildDecimalWrittenDivideModel("4,5", "0,15");
    const extended = buildDecimalWrittenDivideModel("4,5", "0,15", 2);
    expect(plain.scalePower).toBe(2);
    expect([plain.scaledDividendDisplay, plain.scaledDivisorDisplay]).toEqual(["450", "15"]);
    expect(plain.quotientDisplay).toBe("30");
    expect(extended.quotientDisplay).toBe("30");
  });
});

describe("jednostki i zakres", () => {
  it("normalizuje aliasy, wymaga dozwolonej jednostki i zachowuje wymiar", () => {
    expect(normalizeDecimalUnit(" PLN ")).toMatchObject({ ok: true, unit: { id: "zł", dimension: "currency" } });
    expect(normalizeDecimalUnit("kg", ["m"])).toMatchObject({ ok: false, error: { code: "DEC_UNIT_MISMATCH" } });
    expect(formatDecimal(convertDecimalUnit(parsed("2,35").value, "m", "cm"))).toBe("235");
    expect(() => convertDecimalUnit(parsed("2").value, "kg", "m")).toThrow(/różne wymiary/u);
  });
});
