export type WholeFromPercentActivity =
  | "whole-from-percent-example"
  | "whole-from-percent-practice";

export interface WholeFromPercentTask {
  activity: WholeFromPercentActivity;
  knownPercent: number;
  knownValue: number;
  unit: string;
  firstOperation: "multiply" | "divide";
  firstFactor: number;
  intermediatePercent?: number;
  intermediateValue?: number;
  secondFactor?: number;
  answer: number;
  prompt: string;
}

const TASKS = [
  { knownPercent: 50, knownValue: 35, unit: "", firstOperation: "multiply", firstFactor: 2, answer: 70 },
  { knownPercent: 25, knownValue: 18, unit: "", firstOperation: "multiply", firstFactor: 4, answer: 72 },
  { knownPercent: 10, knownValue: 12, unit: "kg", firstOperation: "multiply", firstFactor: 10, answer: 120 },
  { knownPercent: 20, knownValue: 34, unit: "zł", firstOperation: "multiply", firstFactor: 5, answer: 170 },
  { knownPercent: 40, knownValue: 72, unit: "m", firstOperation: "divide", firstFactor: 4, intermediatePercent: 10, intermediateValue: 18, secondFactor: 10, answer: 180 },
  { knownPercent: 75, knownValue: 90, unit: "l", firstOperation: "divide", firstFactor: 3, intermediatePercent: 25, intermediateValue: 30, secondFactor: 4, answer: 120 },
] as const;

export function isWholeFromPercentActivity(value: string): value is WholeFromPercentActivity {
  return value === "whole-from-percent-example" || value === "whole-from-percent-practice";
}

export function createWholeFromPercentTask({ seed, activity }: { seed: number; activity: WholeFromPercentActivity }): WholeFromPercentTask {
  const item = activity === "whole-from-percent-example"
    ? { knownPercent: 50, knownValue: 30, unit: "", firstOperation: "multiply" as const, firstFactor: 2, answer: 60 }
    : TASKS[Math.abs(seed) % TASKS.length]!;

  return {
    activity,
    ...item,
    prompt: `${item.knownPercent}% pewnej liczby to ${item.knownValue}${item.unit ? ` ${item.unit}` : ""}. Oblicz tę liczbę.`,
  };
}
