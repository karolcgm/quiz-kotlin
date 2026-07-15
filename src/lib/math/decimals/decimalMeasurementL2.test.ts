import { describe, expect, it } from "vitest";
import {
  REALISTIC_MASS_RANGES_IN_GRAMS,
  convertMeasurementParts,
  createPublicDecimalMeasurementL2Task,
  expectedMeasurementDisplay,
  isMassClaimRealistic,
  itemScaleOperation,
  massDisplaysFromWeights,
  measurementScaleOperation,
  totalGramsFromWeights,
  validateMeasurementL2Conversion,
} from "@/lib/math/decimals/decimalMeasurementL2";

describe("decimalMeasurementL2", () => {
  it("składa odważniki kg, dag i g dokładnie oraz formatuje polski przecinek", () => {
    expect(totalGramsFromWeights({ kg: 1, dag: 24, g: 5 })).toBe(1245);
    expect(massDisplaysFromWeights({ kg: 1, dag: 24, g: 5 })).toEqual({ g: "1245", dag: "124,5", kg: "1,245" });
    expect(massDisplaysFromWeights({ kg: 0, dag: 7, g: 5 })).toEqual({ g: "75", dag: "7,5", kg: "0,075" });
  });

  it("wylicza mnożnik z jednostek i nie pozwala mieszać wymiarów", () => {
    expect(measurementScaleOperation("kg", "dag")).toBe("×100");
    expect(measurementScaleOperation("g", "kg")).toBe("÷1000");
    expect(measurementScaleOperation("km", "m")).toBe("×1000");
    expect(() => measurementScaleOperation("kg", "m")).toThrow("różne wymiary");
    expect(() => convertMeasurementParts([{ value: "1", unit: "kg" }], "m")).toThrow("długości i masy");
  });

  it("ocenia osobno mnożnik, pozycję przecinka, jednostkę i realizm", () => {
    const scaleTask = createPublicDecimalMeasurementL2Task({ seed: 553202, difficulty: "core", activity: "unit-scale-mass" });
    const scaleItem = scaleTask.items[0]!;
    expect(itemScaleOperation(scaleItem)).toBe("×100");
    expect(expectedMeasurementDisplay(scaleItem)).toBe("235");
    expect(validateMeasurementL2Conversion({ item: scaleItem, value: "235", unit: "dag", scaleOperation: "×100" })).toMatchObject({ correct: true, code: null, issue: null });
    expect(validateMeasurementL2Conversion({ item: scaleItem, value: "23,5", unit: "dag", scaleOperation: "×100" })).toMatchObject({ code: "DEC_PLACE_VALUE", issue: "value" });
    expect(validateMeasurementL2Conversion({ item: scaleItem, value: "235", unit: "dag", scaleOperation: "×10" })).toMatchObject({ code: "DEC_ESTIMATE_RANGE", issue: "scale" });
    expect(validateMeasurementL2Conversion({ item: scaleItem, value: "235", unit: "kg", scaleOperation: "×100" })).toMatchObject({ code: "DEC_UNIT_MISMATCH", issue: "unit" });

    const medicine = createPublicDecimalMeasurementL2Task({ seed: 553207, difficulty: "core", activity: "medicine-packing" }).items[0]!;
    expect(expectedMeasurementDisplay(medicine)).toBe("0,045");
    expect(medicine.realismClaim && isMassClaimRealistic(medicine.realismClaim)).toBe(false);
    expect(validateMeasurementL2Conversion({ item: medicine, value: "0.045", unit: "kg", scaleOperation: "÷1000", realismChoice: "realistic" })).toMatchObject({ code: "DEC_ESTIMATE_RANGE", issue: "realism", normalizedDisplay: "0,045" });
    expect(validateMeasurementL2Conversion({ item: medicine, value: "0,045", unit: "kg", scaleOperation: "÷1000", realismChoice: "absurd" })).toMatchObject({ correct: true });
  });

  it("utrzymuje jawną listę realistycznych zakresów i dokładne zadania mieszane", () => {
    expect(REALISTIC_MASS_RANGES_IN_GRAMS).toEqual({
      "medicine-packet": { minimum: "5", maximum: "500" },
      "veterinary-kit": { minimum: "100", maximum: "3000" },
    });
    const mixed = createPublicDecimalMeasurementL2Task({ seed: 553204, difficulty: "core", activity: "mixed-measurements" });
    expect(mixed.items.map((conversion) => conversion.dimension)).toEqual(["length", "mass"]);
    expect(mixed.items.map(expectedMeasurementDisplay)).toEqual(["1,25", "2,35"]);
    expect(mixed.items.map(itemScaleOperation)).toEqual(["÷1000", "÷100"]);
  });

  it("tworzy deterministyczne warianty support/core/challenge bez answerSpec", () => {
    const first = createPublicDecimalMeasurementL2Task({ seed: 553205, difficulty: "challenge", activity: "independent-mixed" });
    const second = createPublicDecimalMeasurementL2Task({ seed: 553205, difficulty: "challenge", activity: "independent-mixed" });
    const support = createPublicDecimalMeasurementL2Task({ seed: 553202, difficulty: "support", activity: "independent-mixed" });
    expect(first).toEqual(second);
    expect(first.generatorVersion).toBe(5);
    expect(first.items.map(expectedMeasurementDisplay)).toEqual(["0,075", "2075"]);
    expect(support.items.map(expectedMeasurementDisplay)).toEqual(["0,65"]);
    expect(first).not.toHaveProperty("answerSpec");
    expect(JSON.stringify(first)).not.toContain("answerSpec");
  });
});
