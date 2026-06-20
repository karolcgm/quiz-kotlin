import type { ComparisonQuestionParams } from "@/types/testWidget";

export type ComparisonRelation = "<" | "=" | ">";

export function comparisonRelation(left: number, right: number): ComparisonRelation {
  if (left < right) return "<";
  if (left > right) return ">";
  return "=";
}

export function digitString(value: number): string {
  return String(Math.max(0, Math.round(value)));
}

export function hiddenDigit(value: number, index: number): number {
  const digits = digitString(value);
  const safeIndex = Math.min(Math.max(0, index), digits.length - 1);
  return Number(digits[safeIndex]);
}

export function formatNumberWithMissing(value: number, missingIndex: number, reveal: boolean): string {
  const digits = digitString(value);
  const safeIndex = Math.min(Math.max(0, missingIndex), digits.length - 1);
  return digits
    .split("")
    .map((digit, index) => {
      if (index !== safeIndex) return digit;
      return reveal ? digit : "?";
    })
    .join("");
}

export function isMissingDigitTask(params: ComparisonQuestionParams): boolean {
  return params.ask === "missingDigit" && params.missingSide != null && params.missingIndex != null;
}

export function missingDigitExpected(params: ComparisonQuestionParams): number {
  const side = params.missingSide === "right" ? params.right : params.left;
  return hiddenDigit(side, params.missingIndex ?? 0);
}

export function balanceTiltDegrees(left: number, right: number): number {
  const diff = right - left;
  if (diff === 0) return 0;
  const magnitude = Math.min(Math.abs(diff) / Math.max(left, right, 1), 1);
  return Math.sign(diff) * (4 + magnitude * 14);
}
