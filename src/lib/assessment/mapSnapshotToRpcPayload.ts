import type { AssessmentVersionBundle } from "@/types/assessmentBlueprint";

/** Mapuje publiczny snapshot na payload RPC (bez klucza w params pozycji — spec §26.2) */
export function mapSnapshotToRpcPayload(bundle: AssessmentVersionBundle) {
  return {
    snapshot: bundle.snapshot,
    answer_key: bundle.answerKey,
    content_checksum: bundle.snapshot.checksum,
    max_score: bundle.snapshot.maxScore,
  };
}
