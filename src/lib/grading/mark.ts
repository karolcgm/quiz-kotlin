import type { SchoolMark } from "@/types/submission";

export function percentageToMark(percentage: number): SchoolMark {
  if (percentage >= 96) return 6;
  if (percentage >= 86) return 5;
  if (percentage >= 70) return 4;
  if (percentage >= 50) return 3;
  if (percentage >= 30) return 2;
  return 1;
}
