import { describe, expect, it } from "vitest";
import {
  convertLengthParts,
  createPublicDecimalMeasurementTask,
  expectedLengthDisplay,
  lengthDisplaysFromMillimeters,
  lengthScaleOperation,
  taskScaleOperation,
  validateLengthConversion,
} from "@/lib/math/decimals/decimalMeasurementL1";
import { formatDecimal } from "@/lib/math/decimals";

describe("decimalMeasurementL1", () => {
  it("przelicza miarkę dokładnie i zawsze formatuje polski przecinek", () => {
    expect(lengthDisplaysFromMillimeters(2350)).toEqual({ mm: "2350", cm: "235", m: "2,35" });
    expect(lengthDisplaysFromMillimeters(75)).toEqual({ mm: "75", cm: "7,5", m: "0,075" });
    expect(formatDecimal(convertLengthParts([{ value: "1,25", unit: "km" }], "m"), { trimTrailingZeros: true })).toBe("1250");
  });

  it("wylicza mnożnik z jednostek, a nie z zapamiętanego przesuwania przecinka", () => {
    expect(lengthScaleOperation("m", "cm")).toBe("×100");
    expect(lengthScaleOperation("cm", "m")).toBe("÷100");
    expect(lengthScaleOperation("km", "m")).toBe("×1000");
    const twoPart = createPublicDecimalMeasurementTask({ seed: 553102, difficulty: "core", activity: "two-part-length" });
    expect(taskScaleOperation(twoPart)).toBe("÷100");
    expect(expectedLengthDisplay(twoPart)).toBe("2,35");
  });

  it("ocenia osobno pozycję przecinka, mnożnik i jednostkę", () => {
    const task = createPublicDecimalMeasurementTask({ seed: 553107, difficulty: "core", activity: "unit-scale-length" });
    expect(expectedLengthDisplay(task)).toBe("405");
    expect(validateLengthConversion({ task, value: "405", unit: "cm", scaleOperation: "×100" })).toMatchObject({ correct: true, code: null });
    expect(validateLengthConversion({ task, value: "40,5", unit: "cm", scaleOperation: "×100" })).toMatchObject({ correct: false, code: "DEC_PLACE_VALUE" });
    expect(validateLengthConversion({ task, value: "405", unit: "cm", scaleOperation: "×10" })).toMatchObject({ correct: false, code: "DEC_ESTIMATE_RANGE" });
    expect(validateLengthConversion({ task, value: "405", unit: "m", scaleOperation: "×100" })).toMatchObject({ correct: false, code: "DEC_UNIT_MISMATCH" });
  });

  it("akceptuje równoważne zera końcowe i kropkę z klawiatury fizycznej", () => {
    const task = createPublicDecimalMeasurementTask({ seed: 553102, difficulty: "support", activity: "independent-length" });
    expect(expectedLengthDisplay(task)).toBe("8,5");
    expect(validateLengthConversion({ task, value: "8.500", unit: "m", scaleOperation: "÷100" })).toMatchObject({
      correct: true,
      normalizedDisplay: "8,500",
    });
    expect(validateLengthConversion({ task, value: "", unit: "m", scaleOperation: "÷100" })).toMatchObject({ correct: false, code: "DEC_EMPTY" });
  });

  it("tworzy realistyczne deterministyczne warianty publiczne bez klucza", () => {
    const first = createPublicDecimalMeasurementTask({ seed: 553105, difficulty: "challenge", activity: "independent-length" });
    const second = createPublicDecimalMeasurementTask({ seed: 553105, difficulty: "challenge", activity: "independent-length" });
    const support = createPublicDecimalMeasurementTask({ seed: 553102, difficulty: "support", activity: "independent-length" });
    expect(first).toEqual(second);
    expect(first.generatorVersion).toBe(4);
    expect(first.story).toContain("1,275 km");
    expect(support.story).toContain("850 cm");
    expect(first).not.toHaveProperty("answerSpec");
    expect(JSON.stringify(first)).not.toContain("answerSpec");
  });
});
