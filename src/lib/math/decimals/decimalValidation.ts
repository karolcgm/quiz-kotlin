import { areEquivalentDecimals, compareDecimalValues, decimalPlaceStateFromInput, normalizeDecimalUnit, parseDecimalInput } from "@/lib/math/decimals/decimalMath";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalAnswerSpec, DecimalFeedbackCode, DecimalStudentAnswer } from "@/types/decimals";
import type { LessonGradeResult } from "@/types/diagnosticFeedback";

function grade(code: DecimalFeedbackCode, answerSpec: DecimalAnswerSpec, normalizedAnswer: unknown, partial = false): LessonGradeResult {
  return createLessonGradeResult({
    status: partial ? "partially-correct" : "incorrect",
    score: partial ? Math.max(1, answerSpec.maxScore - 1) : 0,
    maxScore: answerSpec.maxScore,
    errorCodes: [code],
    feedbackKey: `decimal.${code.toLocaleLowerCase("en-US")}`,
    normalizedAnswer,
  });
}

/** Czysty walidator. Pełny answerSpec przekazuje wyłącznie moduł serwerowy. */
export function validateDecimalAnswer(answer: DecimalStudentAnswer, answerSpec: DecimalAnswerSpec): LessonGradeResult {
  const parsed = parseDecimalInput(answer.value);
  if (!parsed.ok) return grade(DECIMAL_FEEDBACK_CODES.empty, answerSpec, parsed.error);

  if (answerSpec.minimum && compareDecimalValues(parsed.value, answerSpec.minimum) < 0
    || answerSpec.maximum && compareDecimalValues(parsed.value, answerSpec.maximum) > 0) {
    return grade(DECIMAL_FEEDBACK_CODES.estimateRange, answerSpec, parsed.value);
  }

  if (!areEquivalentDecimals(parsed.value, answerSpec.expected)) {
    return grade(DECIMAL_FEEDBACK_CODES.estimateRange, answerSpec, parsed.value);
  }

  const rawTrimmed = answer.value.trim();
  if (/^[+-]?[,.]/u.test(rawTrimmed)) return grade(DECIMAL_FEEDBACK_CODES.missingZero, answerSpec, parsed.value, true);
  if (answer.strategy?.claimsTrailingZeroChangesValue) return grade(DECIMAL_FEEDBACK_CODES.trailingZeroValue, answerSpec, parsed.value, true);

  if (answerSpec.expectedUnit !== "none") {
    const unit = normalizeDecimalUnit(answer.unit ?? "", [answerSpec.expectedUnit]);
    if (!unit.ok) return grade(DECIMAL_FEEDBACK_CODES.unitMismatch, answerSpec, parsed.value, true);
  }

  const expectedStrategy = answerSpec.strategy;
  const strategy = answer.strategy;
  if (expectedStrategy.commaAligned && strategy?.commaAligned !== true) {
    return grade(DECIMAL_FEEDBACK_CODES.commaMisaligned, answerSpec, parsed.value, true);
  }
  if (expectedStrategy.placedDigits) {
    if (!strategy?.placedDigits) return grade(DECIMAL_FEEDBACK_CODES.empty, answerSpec, parsed.value, true);
    const expectedPlaces = decimalPlaceStateFromInput(answerSpec.expectedDisplay);
    const wrong = Object.entries(expectedPlaces).some(([place, digit]) => strategy.placedDigits?.[place as keyof typeof strategy.placedDigits] !== digit);
    if (wrong) return grade(DECIMAL_FEEDBACK_CODES.placeValue, answerSpec, parsed.value, true);
  }
  if (expectedStrategy.productPlaces !== undefined && strategy?.productPlaces !== expectedStrategy.productPlaces) {
    return grade(DECIMAL_FEEDBACK_CODES.productPlaces, answerSpec, parsed.value, true);
  }
  if (expectedStrategy.partialProductShifts
    && JSON.stringify(strategy?.partialProductShifts) !== JSON.stringify(expectedStrategy.partialProductShifts)) {
    return grade(DECIMAL_FEEDBACK_CODES.partialProductShift, answerSpec, parsed.value, true);
  }
  if (expectedStrategy.partialProducts
    && JSON.stringify(strategy?.partialProducts) !== JSON.stringify(expectedStrategy.partialProducts)) {
    return grade(DECIMAL_FEEDBACK_CODES.placeValue, answerSpec, parsed.value, true);
  }
  if (expectedStrategy.additionColumns
    && JSON.stringify(strategy?.additionColumns) !== JSON.stringify(expectedStrategy.additionColumns)) {
    return grade(DECIMAL_FEEDBACK_CODES.placeValue, answerSpec, parsed.value, true);
  }
  if (expectedStrategy.exchanges?.length
    && JSON.stringify(strategy?.exchanges) !== JSON.stringify(expectedStrategy.exchanges)) {
    return grade(DECIMAL_FEEDBACK_CODES.placeValue, answerSpec, parsed.value, true);
  }
  if (expectedStrategy.divisionScalePower !== undefined) {
    const dividend = strategy?.scaledDividend ? parseDecimalInput(strategy.scaledDividend) : null;
    const divisor = strategy?.scaledDivisor ? parseDecimalInput(strategy.scaledDivisor) : null;
    const expectedDividend = expectedStrategy.scaledDividend ? parseDecimalInput(expectedStrategy.scaledDividend) : null;
    const expectedDivisor = expectedStrategy.scaledDivisor ? parseDecimalInput(expectedStrategy.scaledDivisor) : null;
    const correctScale = strategy?.divisionScalePower === expectedStrategy.divisionScalePower
      && dividend?.ok && divisor?.ok && expectedDividend?.ok && expectedDivisor?.ok
      && areEquivalentDecimals(dividend.value, expectedDividend.value)
      && areEquivalentDecimals(divisor.value, expectedDivisor.value);
    if (!correctScale) return grade(DECIMAL_FEEDBACK_CODES.divisorScale, answerSpec, parsed.value, true);
  }

  return createLessonGradeResult({
    status: "correct",
    score: answerSpec.maxScore,
    maxScore: answerSpec.maxScore,
    errorCodes: [],
    feedbackKey: "decimal.correct",
    normalizedAnswer: { value: parsed.value, trace: parsed.trace, unit: answerSpec.expectedUnit, strategy },
  });
}
