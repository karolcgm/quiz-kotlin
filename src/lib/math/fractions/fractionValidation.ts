import {
  areEquivalentFractions,
  isFractionSimplified,
  normalizeFraction,
  parseFractionInput,
} from "@/lib/math/fractions/fractionMath";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { FractionAnswerSpec } from "@/types/fractions";
import type { LessonGradeResult } from "@/types/diagnosticFeedback";

/** Walidator uruchamiany z prywatnym answerSpec po stronie serwera. */
export function validateFractionAnswer(
  rawAnswer: string,
  answerSpec: FractionAnswerSpec,
): LessonGradeResult {
  const parsed = parseFractionInput(rawAnswer);
  if (!parsed.ok) {
    const code = parsed.error.code === "FRA_ZERO_DENOMINATOR"
      ? FRACTION_FEEDBACK_CODES.zeroDenominator
      : FRACTION_FEEDBACK_CODES.emptyPart;
    return createLessonGradeResult({
      status: "incorrect",
      score: 0,
      maxScore: answerSpec.maxScore,
      errorCodes: [code],
      feedbackKey: `fraction.${code.toLocaleLowerCase("en-US")}`,
      normalizedAnswer: parsed.error,
    });
  }

  const raw = parsed.value;
  const expected = answerSpec.expected;
  const swapped = raw.numerator === expected.denominator
    && raw.denominator === expected.numerator;
  if (swapped) {
    return createLessonGradeResult({
      status: "incorrect",
      score: 0,
      maxScore: answerSpec.maxScore,
      errorCodes: [FRACTION_FEEDBACK_CODES.numeratorDenominatorSwapped],
      feedbackKey: "fraction.numerator-denominator-swapped",
      normalizedAnswer: parsed.normalized,
    });
  }

  const equivalent = areEquivalentFractions(raw, expected);
  if (!equivalent) {
    return createLessonGradeResult({
      status: "incorrect",
      score: 0,
      maxScore: answerSpec.maxScore,
      errorCodes: [FRACTION_FEEDBACK_CODES.notEquivalent],
      feedbackKey: "fraction.not-equivalent",
      normalizedAnswer: parsed.normalized,
    });
  }

  if (answerSpec.requireSimplified && !isFractionSimplified(raw)) {
    return createLessonGradeResult({
      status: "partially-correct",
      score: Math.max(1, answerSpec.maxScore - 1),
      maxScore: answerSpec.maxScore,
      errorCodes: [FRACTION_FEEDBACK_CODES.notSimplified],
      feedbackKey: "fraction.not-simplified",
      normalizedAnswer: normalizeFraction(raw),
    });
  }

  if (!answerSpec.allowEquivalent
      && (raw.numerator !== expected.numerator || raw.denominator !== expected.denominator)) {
    return createLessonGradeResult({
      status: "incorrect",
      score: 0,
      maxScore: answerSpec.maxScore,
      errorCodes: [FRACTION_FEEDBACK_CODES.notSimplified],
      feedbackKey: "fraction.required-form",
      normalizedAnswer: parsed.normalized,
    });
  }

  return createLessonGradeResult({
    status: "correct",
    score: answerSpec.maxScore,
    maxScore: answerSpec.maxScore,
    errorCodes: [],
    feedbackKey: "fraction.correct",
    normalizedAnswer: parsed.normalized,
  });
}
