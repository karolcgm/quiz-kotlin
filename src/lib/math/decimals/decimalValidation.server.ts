import "server-only";

import { validateDecimalAnswer } from "@/lib/math/decimals/decimalValidation";
import type { DecimalAnswerSpec, DecimalStudentAnswer } from "@/types/decimals";

export function validateDecimalAnswerOnServer(answer: DecimalStudentAnswer, answerSpec: DecimalAnswerSpec) {
  return validateDecimalAnswer(answer, answerSpec);
}
