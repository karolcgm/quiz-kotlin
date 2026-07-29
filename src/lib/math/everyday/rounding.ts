export type RoundingActivity = "place-values" | "rounding-guide" | "rounding-series";

export interface RoundingTask {
  id: string;
  value: string;
  place: string;
  targetIndex: number;
  checkIndex: number;
  answer: string;
}

export const ROUNDING_TASKS: RoundingTask[] = [
  { id: "tenths-647", value: "6,47", place: "części dziesiętnych", targetIndex: 2, checkIndex: 3, answer: "6,5" },
  { id: "hundredths-13142", value: "13,142", place: "części setnych", targetIndex: 4, checkIndex: 5, answer: "13,14" },
  { id: "tenths-2865", value: "28,65", place: "części dziesiętnych", targetIndex: 3, checkIndex: 4, answer: "28,7" },
  { id: "hundredths-7995", value: "7,995", place: "części setnych", targetIndex: 3, checkIndex: 4, answer: "8,00" },
  { id: "ones-34249", value: "342,49", place: "jedności", targetIndex: 2, checkIndex: 4, answer: "342" },
  { id: "ones-34250", value: "342,50", place: "jedności", targetIndex: 2, checkIndex: 4, answer: "343" },
  { id: "hundredths-0084", value: "0,084", place: "części setnych", targetIndex: 3, checkIndex: 4, answer: "0,08" },
  { id: "tenths-1996", value: "19,96", place: "części dziesiętnych", targetIndex: 3, checkIndex: 4, answer: "20,0" },
  { id: "tens-14867", value: "1486,7", place: "dziesiątek", targetIndex: 2, checkIndex: 3, answer: "1490" },
  { id: "hundreds-7352", value: "7352", place: "setek", targetIndex: 1, checkIndex: 2, answer: "7400" },
];

export function decimalValuesAreEqual(left: string, right: string): boolean {
  const leftValue = Number(left.trim().replace(",", "."));
  const rightValue = Number(right.trim().replace(",", "."));

  return Number.isFinite(leftValue)
    && Number.isFinite(rightValue)
    && leftValue === rightValue;
}

export function roundingActivityFromStageId(stageId: string): RoundingActivity {
  if (stageId.includes("place-values")) return "place-values";
  if (stageId.includes("rounding-guide")) return "rounding-guide";
  return "rounding-series";
}
