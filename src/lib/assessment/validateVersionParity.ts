import type { AssessmentBlueprint, AssessmentVersionBundle } from "@/types/assessmentBlueprint";
import { generateFrozenVersionSnapshot } from "@/lib/assessment/generateVersionSnapshot";

export interface ParityValidationResult {
  ok: boolean;
  errors: string[];
}

/** Weryfikuje równoważność wersji A/B — ta sama macierz umiejętności i punktów (spec §31) */
export function validateVersionParity(
  blueprint: AssessmentBlueprint,
  seedA: number,
  seedB: number,
): ParityValidationResult {
  const errors: string[] = [];
  const bundleA = generateFrozenVersionSnapshot(blueprint, "A", seedA);
  const bundleB = generateFrozenVersionSnapshot(blueprint, "B", seedB);

  compareBundles(bundleA, bundleB, errors);

  if (bundleA.snapshot.maxScore !== bundleB.snapshot.maxScore) {
    errors.push(`Różna suma punktów: A=${bundleA.snapshot.maxScore}, B=${bundleB.snapshot.maxScore}`);
  }

  const expressionsA = bundleA.snapshot.items.map((i) => i.expression).join("|");
  const expressionsB = bundleB.snapshot.items.map((i) => i.expression).join("|");
  if (expressionsA === expressionsB) {
    errors.push("Wersje A i B mają identyczne wyrażenia — wymagane różne dane.");
  }

  return { ok: errors.length === 0, errors };
}

function compareBundles(
  bundleA: AssessmentVersionBundle,
  bundleB: AssessmentVersionBundle,
  errors: string[],
): void {
  if (bundleA.snapshot.items.length !== bundleB.snapshot.items.length) {
    errors.push("Różna liczba pozycji między wersjami.");
    return;
  }

  for (let i = 0; i < bundleA.snapshot.items.length; i += 1) {
    const itemA = bundleA.snapshot.items[i]!;
    const itemB = bundleB.snapshot.items[i]!;
    const keyA = bundleA.answerKey[i]!;
    const keyB = bundleB.answerKey[i]!;

    if (itemA.skillId !== itemB.skillId) {
      errors.push(`Pozycja ${i + 1}: różne skillId (${itemA.skillId} vs ${itemB.skillId})`);
    }
    if (itemA.difficulty !== itemB.difficulty) {
      errors.push(`Pozycja ${i + 1}: różny poziom (${itemA.difficulty} vs ${itemB.difficulty})`);
    }
    if (itemA.maxScore !== itemB.maxScore) {
      errors.push(`Pozycja ${i + 1}: różne punkty (${itemA.maxScore} vs ${itemB.maxScore})`);
    }
    if (keyA.rubric !== keyB.rubric) {
      errors.push(`Pozycja ${i + 1}: różna rubryka`);
    }
  }
}

export function assertPilotParity(blueprint: AssessmentBlueprint): ParityValidationResult {
  const seedA = blueprint.defaultVersionSeeds.A;
  const seedB = blueprint.defaultVersionSeeds.B;
  if (seedA === undefined || seedB === undefined) {
    return { ok: false, errors: ["Blueprint pilota wymaga seedów A i B."] };
  }
  return validateVersionParity(blueprint, seedA, seedB);
}
