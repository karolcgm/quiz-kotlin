export type LengthUnit = "mm" | "cm" | "m" | "km";

const UNIT_ORDER: LengthUnit[] = ["mm", "cm", "m", "km"];

export function unitToMillimeters(unit: LengthUnit): number {
  if (unit === "mm") return 1;
  if (unit === "cm") return 10;
  if (unit === "m") return 1000;
  return 1_000_000;
}

export function convertLengthValue(value: number, fromUnit: LengthUnit, toUnit: LengthUnit): number {
  return (value * unitToMillimeters(fromUnit)) / unitToMillimeters(toUnit);
}

export function formatNumericAnswer(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1).replace(/\.0$/, "");
}

export function unitLabel(unit: LengthUnit): string {
  return unit;
}

export { UNIT_ORDER };
