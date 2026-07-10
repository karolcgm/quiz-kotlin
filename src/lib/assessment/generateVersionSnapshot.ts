import {
  generateOrderExpression,
  tokensToDisplay,
  type OrderExpressionProblem,
} from "@/lib/math/orderOfOperations";
import type {
  AnswerKeyItem,
  AssessmentBlueprint,
  AssessmentVersionBundle,
  AssessmentVersionCode,
  AssessmentVersionSnapshot,
  BlueprintSlot,
  PublicSnapshotItem,
  SkillCoverageEntry,
} from "@/types/assessmentBlueprint";
import { assessmentBlueprintSchema } from "@/lib/assessment/blueprintSchema";
import { computeChecksum } from "@/lib/assessment/checksum";
import { deriveSlotSeed } from "@/lib/assessment/deriveSlotSeed";

function describeFirstStep(problem: OrderExpressionProblem): string {
  const index = problem.validNextOperatorIndices[0];
  if (index === undefined) return "brak działań";
  const token = problem.tokens[index];
  if (token.type !== "operator") return "—";
  const left = problem.tokens[index - 1];
  const right = problem.tokens[index + 1];
  const leftVal = left?.type === "number" ? left.value : "?";
  const rightVal = right?.type === "number" ? right.value : "?";
  return `najpierw ${leftVal} ${token.value} ${rightVal}`;
}

function rubricForSlot(slot: BlueprintSlot): string {
  return `${slot.maxScore} pkt — poprawne wskazanie pierwszego działania z uzasadnieniem (${slot.difficulty}).`;
}

function generateSlotItem(
  slot: BlueprintSlot,
  position: number,
  versionCode: AssessmentVersionCode,
  versionSeed: number,
): { publicItem: PublicSnapshotItem; answerKey: AnswerKeyItem } {
  const seed = deriveSlotSeed(versionSeed, versionCode, slot.slotId, position - 1);
  const problem = generateOrderExpression(seed, slot.difficulty);

  const publicItem: PublicSnapshotItem = {
    slotId: slot.slotId,
    position,
    skillId: slot.skillId,
    difficulty: slot.difficulty,
    maxScore: slot.maxScore,
    generatorId: slot.generatorId,
    generatorVersion: slot.generatorVersion,
    seed,
    expression: tokensToDisplay(problem.tokens),
    prompt: slot.prompt,
  };

  const firstStepOperatorIndex = problem.validNextOperatorIndices[0] ?? -1;

  const answerKey: AnswerKeyItem = {
    slotId: slot.slotId,
    position,
    maxScore: slot.maxScore,
    rubric: rubricForSlot(slot),
    answerSpec: {
      validNextOperatorIndices: problem.validNextOperatorIndices,
      firstStepOperatorIndex,
      firstStepLabel: describeFirstStep(problem),
      finalValue: problem.finalValue,
    },
  };

  return { publicItem, answerKey };
}

export function generateVersionSnapshot(
  blueprint: AssessmentBlueprint,
  versionCode: AssessmentVersionCode,
  versionSeed: number,
  assessmentId?: string,
): AssessmentVersionBundle {
  const parsed = assessmentBlueprintSchema.parse(blueprint);

  const items: PublicSnapshotItem[] = [];
  const answerKey: AnswerKeyItem[] = [];

  parsed.slots.forEach((slot, index) => {
    const generated = generateSlotItem(slot, index + 1, versionCode, versionSeed);
    items.push(generated.publicItem);
    answerKey.push(generated.answerKey);
  });

  const maxScore = parsed.slots.reduce((sum, slot) => sum + slot.maxScore, 0);
  const resolvedAssessmentId = assessmentId ?? `${parsed.id}-${versionCode}-${versionSeed}`;

  const checksumPayload = {
    assessmentId: resolvedAssessmentId,
    blueprintId: parsed.id,
    blueprintVersion: parsed.version,
    versionCode,
    versionSeed,
    maxScore,
    items,
    answerKey,
  };

  const checksum = computeChecksum(checksumPayload);

  const snapshot: AssessmentVersionSnapshot = {
    assessmentId: resolvedAssessmentId,
    blueprintId: parsed.id,
    blueprintVersion: parsed.version,
    versionCode,
    versionSeed,
    generatedAt: new Date(0).toISOString(),
    title: parsed.title,
    kind: parsed.kind,
    maxScore,
    items,
    checksum,
  };

  return { snapshot, answerKey };
}

/** Deterministyczny snapshot — ten sam checksum przy każdym wywołaniu */
export function generateFrozenVersionSnapshot(
  blueprint: AssessmentBlueprint,
  versionCode: AssessmentVersionCode,
  versionSeed: number,
  assessmentId?: string,
): AssessmentVersionBundle {
  const bundle = generateVersionSnapshot(blueprint, versionCode, versionSeed, assessmentId);
  return {
    ...bundle,
    snapshot: {
      ...bundle.snapshot,
      generatedAt: "1970-01-01T00:00:00.000Z",
    },
  };
}

export function resolveVersionSeed(
  blueprint: AssessmentBlueprint,
  versionCode: AssessmentVersionCode,
  overrideSeed?: number,
): number {
  if (overrideSeed !== undefined) return overrideSeed;
  const defaultSeed = blueprint.defaultVersionSeeds[versionCode];
  if (defaultSeed === undefined) {
    throw new Error(`Brak domyślnego seeda dla wersji ${versionCode}`);
  }
  return defaultSeed;
}

export function computeSkillCoverage(blueprint: AssessmentBlueprint): SkillCoverageEntry[] {
  const map = new Map<string, SkillCoverageEntry>();

  for (const slot of blueprint.slots) {
    const current = map.get(slot.skillId) ?? {
      skillId: slot.skillId,
      slotCount: 0,
      maxScore: 0,
      difficulties: { support: 0, core: 0, challenge: 0 },
    };
    current.slotCount += 1;
    current.maxScore += slot.maxScore;
    current.difficulties[slot.difficulty] += 1;
    map.set(slot.skillId, current);
  }

  return [...map.values()].sort((a, b) => a.skillId.localeCompare(b.skillId));
}

export function verifySnapshotChecksum(bundle: AssessmentVersionBundle): boolean {
  const { snapshot, answerKey } = bundle;
  const payload = {
    assessmentId: snapshot.assessmentId,
    blueprintId: snapshot.blueprintId,
    blueprintVersion: snapshot.blueprintVersion,
    versionCode: snapshot.versionCode,
    versionSeed: snapshot.versionSeed,
    maxScore: snapshot.maxScore,
    items: snapshot.items,
    answerKey,
  };
  return computeChecksum(payload) === snapshot.checksum;
}

/** Audyt deterministyczności — ten sam seed daje ten sam checksum */
export function auditSnapshotDeterminism(
  blueprint: AssessmentBlueprint,
  versionCode: AssessmentVersionCode,
  versionSeed: number,
): { ok: boolean; checksumA: string; checksumB: string } {
  const a = generateFrozenVersionSnapshot(blueprint, versionCode, versionSeed);
  const b = generateFrozenVersionSnapshot(blueprint, versionCode, versionSeed);
  return {
    ok: a.snapshot.checksum === b.snapshot.checksum && verifySnapshotChecksum(a),
    checksumA: a.snapshot.checksum,
    checksumB: b.snapshot.checksum,
  };
}
