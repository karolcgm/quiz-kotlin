import type { FractionValue } from "@/types/fractions";

export interface FractionBarSegment {
  index: number;
  wholeIndex: number;
  partIndex: number;
  start: number;
  size: number;
  selected: boolean;
}
export interface FractionCircleSector {
  index: number;
  circleIndex: number;
  partIndex: number;
  startAngle: number;
  endAngle: number;
  selected: boolean;
}

export function assertVisualFraction(value: FractionValue): void {
  if (!Number.isSafeInteger(value.numerator) || value.numerator < 0) {
    throw new Error("Model ułamka wymaga nieujemnego, całkowitego licznika.");
  }
  if (!Number.isSafeInteger(value.denominator) || value.denominator <= 0) {
    throw new Error("Model ułamka wymaga dodatniego, niezerowego mianownika.");
  }
}

export function fractionAsNumber(value: FractionValue): number {
  assertVisualFraction(value);
  return value.numerator / value.denominator;
}

export function buildFractionBarSegments(
  value: FractionValue,
  wholeSize: number,
  wholeCount = Math.max(1, Math.ceil(value.numerator / value.denominator)),
): FractionBarSegment[] {
  assertVisualFraction(value);
  if (!(wholeSize > 0) || !Number.isFinite(wholeSize)) throw new Error("Długość całości musi być dodatnia.");
  if (!Number.isSafeInteger(wholeCount) || wholeCount < 1) throw new Error("Liczba całości musi być dodatnia.");
  const size = wholeSize / value.denominator;
  return Array.from({ length: wholeCount * value.denominator }, (_, index) => ({
    index,
    wholeIndex: Math.floor(index / value.denominator),
    partIndex: index % value.denominator,
    start: index * size,
    size,
    selected: index < value.numerator,
  }));
}

export function buildFractionCircleSectors(value: FractionValue): FractionCircleSector[] {
  assertVisualFraction(value);
  const circleCount = Math.max(1, Math.ceil(value.numerator / value.denominator));
  const sectorAngle = 360 / value.denominator;
  return Array.from({ length: circleCount * value.denominator }, (_, index) => ({
    index,
    circleIndex: Math.floor(index / value.denominator),
    partIndex: index % value.denominator,
    startAngle: (index % value.denominator) * sectorAngle - 90,
    endAngle: ((index % value.denominator) + 1) * sectorAngle - 90,
    selected: index < value.numerator,
  }));
}
