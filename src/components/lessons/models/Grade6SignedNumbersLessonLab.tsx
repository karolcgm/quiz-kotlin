"use client";

import { Grade6SignedNumbersV2Lab } from "@/components/lessons/models/Grade6SignedNumbersV2Lab";

export type Grade6SignedNumbersActivity =
  | "g6-number-sets" | "g6-absolute-value" | "g6-number-line" | "g6-select" | "g6-compare" | "g6-opposites"
  | "g6-sign-rules" | "g6-add-different" | "g6-add-same" | "g6-subtract" | "g6-axis" | "g6-add-stories"
  | "g6-sign-table" | "g6-multiply" | "g6-divide" | "g6-cipher" | "g6-mul-stories"
  | "g6-review-sets" | "g6-review-absolute" | "g6-review-operations" | "g6-review-stories" | "g6-review-challenge"
  | "g6-context-integers" | "g6-integer-line" | "g6-integer-compare" | "g6-rational-line" | "g6-rational-compare" | "g6-absolute-opposites"
  | "g6-add-model" | "g6-add-integers-same" | "g6-add-integers-different" | "g6-subtract-integers" | "g6-add-fractions" | "g6-add-decimals"
  | "g6-sign-discovery" | "g6-integer-mul-div" | "g6-multiply-integers" | "g6-divide-integers"
  | "g6-fraction-mul-div" | "g6-multiply-fractions" | "g6-divide-fractions" | "g6-decimal-mul-div"
  | "g6-review-map" | "g6-review-order-natural" | "g6-review-order-integers" | "g6-review-order-fractions" | "g6-review-escape";

interface Props {
  activity: Grade6SignedNumbersActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

/** Wspólny punkt wejścia utrzymuje zgodność starszych odwołań, a wszystkie lekcje klasy VI renderuje nowy model V2. */
export function Grade6SignedNumbersLessonLab(props: Props) {
  return <Grade6SignedNumbersV2Lab {...props} />;
}
