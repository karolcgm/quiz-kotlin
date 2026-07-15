import type { UnderstandingStageConfig } from "@/types/lessonPackage";
import type {
  UnderstandingAssessmentResult,
  UnderstandingCriterionStatus,
  UnderstandingEvidenceScore,
} from "@/types/understanding";

function statusFor(score: number, maxScore: number): UnderstandingCriterionStatus {
  if (maxScore <= 0) return "no_evidence";
  return score === maxScore ? "mastered" : "needs_work";
}

export function buildUnderstandingAssessment(
  config: UnderstandingStageConfig,
  evidence: UnderstandingEvidenceScore[],
): UnderstandingAssessmentResult {
  const safeEvidence = evidence.filter(
    (item) => Number.isFinite(item.score) && Number.isFinite(item.maxScore) && item.maxScore > 0,
  );
  const score = safeEvidence.reduce((sum, item) => sum + Math.max(0, Math.min(item.score, item.maxScore)), 0);
  const maxScore = safeEvidence.reduce((sum, item) => sum + item.maxScore, 0);
  const criteria = config.criteria.map((criterion) => {
    const matching = safeEvidence.filter((item) => item.skillIds.includes(criterion.skillId));
    const criterionScore = matching.reduce(
      (sum, item) => sum + Math.max(0, Math.min(item.score, item.maxScore)),
      0,
    );
    const criterionMax = matching.reduce((sum, item) => sum + item.maxScore, 0);
    return {
      ...criterion,
      status: statusFor(criterionScore, criterionMax),
      score: criterionScore,
      maxScore: criterionMax,
    };
  });
  const mastered = criteria.filter((item) => item.status === "mastered");
  const needsWork = criteria.filter((item) => item.status === "needs_work");
  const missing = criteria.filter((item) => item.status === "no_evidence");

  return {
    source: safeEvidence[0]?.source ?? null,
    score,
    maxScore,
    criteria,
    correctFeedback: mastered.length > 0
      ? `Poprawnie: ${mastered.map((item) => item.label).join("; ")}.`
      : "Nie ma jeszcze potwierdzonego kryterium z ostatniej próby.",
    improvementFeedback: needsWork.length > 0
      ? `Do poprawy: ${needsWork.map((item) => item.label).join("; ")}.`
      : missing.length > 0
        ? "Brakuje wyniku samodzielnej próby dla części kryteriów."
        : "W ostatniej próbie nie ma kryterium wymagającego poprawy.",
    nextStep: needsWork.length > 0
      ? `Następny krok: wróć do kryterium „${needsWork[0]!.label}” i rozwiąż podobny przykład.`
      : missing.length > 0
        ? "Następny krok: wykonaj samodzielne zadanie albo poproś nauczyciela o wpisanie wyniku papierowego."
        : "Następny krok: wyjaśnij swoją strategię na nowym przykładzie.",
  };
}

export function paperResultItemsToUnderstandingEvidence(
  items: Array<{
    slotId: string;
    skillId: string;
    score: number;
    maxScore: number;
  }>,
): UnderstandingEvidenceScore[] {
  return items.map((item) => ({
    evidenceId: item.slotId,
    skillIds: [item.skillId],
    score: item.score,
    maxScore: item.maxScore,
    source: "paper_manual",
  }));
}
