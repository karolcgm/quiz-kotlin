import "server-only";

import {
  buildGeneratedFractionQuestion,
  toFractionPublicQuestion,
} from "@/lib/math/fractions/fractionGeneratorCore";
import type {
  FractionGeneratorConfig,
  FractionPublicQuestion,
  GeneratedFractionQuestion,
} from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Tworzy pełny rekord pytania wyłącznie w module serwerowym. */
export function createFractionQuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  config: FractionGeneratorConfig;
}): GeneratedFractionQuestion {
  return buildGeneratedFractionQuestion(input);
}
/** Payload bez klucza, przeznaczony do snapshotu ucznia/tablicy. */
export function createPublicFractionQuestion(input: {
  seed: number;
  difficulty: LessonDifficulty;
  config: FractionGeneratorConfig;
}): FractionPublicQuestion {
  return toFractionPublicQuestion(createFractionQuestionForServer(input));
}
