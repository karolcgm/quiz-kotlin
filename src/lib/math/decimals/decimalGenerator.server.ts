import "server-only";

import { buildGeneratedDecimalQuestion, toDecimalPublicQuestion } from "@/lib/math/decimals/decimalGeneratorCore";
import type { DecimalGeneratorConfig, DecimalPublicQuestion, GeneratedDecimalQuestion } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

export function createDecimalQuestionForServer(input: { seed: number; difficulty: LessonDifficulty; config: DecimalGeneratorConfig }): GeneratedDecimalQuestion {
  return buildGeneratedDecimalQuestion(input);
}

export function createPublicDecimalQuestion(input: { seed: number; difficulty: LessonDifficulty; config: DecimalGeneratorConfig }): DecimalPublicQuestion {
  return toDecimalPublicQuestion(createDecimalQuestionForServer(input));
}
