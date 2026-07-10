import type { AssessmentVersionCode } from "@/types/assessmentBlueprint";

const VERSION_SALT: Record<AssessmentVersionCode, number> = {
  A: 0xa5a5_a5a5,
  B: 0x5a5a_5a5a,
  C: 0x3c6c_c6c6,
};

/** Deterministyczny seed pozycji z wersji arkusza (spec §31) */
export function deriveSlotSeed(
  versionSeed: number,
  versionCode: AssessmentVersionCode,
  slotId: string,
  slotIndex: number,
): number {
  let hash = (versionSeed ^ slotIndex ^ VERSION_SALT[versionCode]) >>> 0 || 1;
  const input = `${versionCode}:${slotId}:${slotIndex}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 0x5bd1e995);
    hash = (hash ^ (hash >>> 13)) >>> 0;
  }
  return (hash >>> 0) || 1;
}
