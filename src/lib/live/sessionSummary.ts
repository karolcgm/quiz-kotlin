import type {
  LessonSessionHistogramBucket,
  LessonSessionRevisitStudent,
  LessonSessionSkillStat,
  LessonSessionStageStat,
  LessonSessionStudentEvidenceSource,
  LessonSessionStudentSummary,
  LessonSessionStudentSummaryItem,
  LessonSessionTeacherSummary,
  LessonSessionStatus,
} from "@/types/lessonSession";

export function mapTeacherSummaryPayload(payload: Record<string, unknown>): LessonSessionTeacherSummary {
  const stageStatsRaw = (payload.stageStats as Array<Record<string, unknown>>) ?? [];
  const skillStatsRaw = (payload.skillStats as Array<Record<string, unknown>>) ?? [];
  const revisitRaw = (payload.revisitStudents as Array<Record<string, unknown>>) ?? [];
  const histogramRaw = (payload.strategyHistogram as Array<Record<string, unknown>>) ?? [];

  const stageStats: LessonSessionStageStat[] = stageStatsRaw.map((row) => ({
    stageId: row.stageId as string,
    stageTitle: row.stageTitle as string,
    submittedCount: Number(row.submittedCount ?? 0),
    correctCount: Number(row.correctCount ?? 0),
    correctRate: row.correctRate != null ? Number(row.correctRate) : null,
  }));

  const skillStats: LessonSessionSkillStat[] = skillStatsRaw.map((row) => ({
    skillId: row.skillId as string,
    responseCount: Number(row.responseCount ?? 0),
    correctRate: row.correctRate != null ? Number(row.correctRate) : null,
    evidenceWeight: Number(row.evidenceWeight ?? 0.25),
  }));

  const revisitStudents: LessonSessionRevisitStudent[] = revisitRaw.map((row) => ({
    studentId: row.studentId as string,
    displayName: row.displayName as string,
    submittedCount: Number(row.submittedCount ?? 0),
    correctRate: row.correctRate != null ? Number(row.correctRate) : null,
  }));

  const strategyHistogram: LessonSessionHistogramBucket[] = histogramRaw.map((row) => ({
    selectedOperatorIndex: Number(row.selectedOperatorIndex),
    count: Number(row.count),
  }));

  return {
    sessionId: payload.sessionId as string,
    lessonTitle: (payload.lessonTitle as string) ?? "",
    topicId: (payload.topicId as string) ?? "",
    endedAt: (payload.endedAt as string | null) ?? null,
    recordSkillEvidence: Boolean(payload.recordSkillEvidence),
    evidenceRecordedAt: (payload.evidenceRecordedAt as string | null) ?? null,
    textbookPage: payload.textbookPage == null ? null : Number(payload.textbookPage),
    coveredExercises: Array.isArray(payload.coveredExercises) ? payload.coveredExercises.map(String) : [],
    participantCount: Number(payload.participantCount ?? 0),
    responseCount: Number(payload.responseCount ?? 0),
    correctRate: payload.correctRate != null ? Number(payload.correctRate) : null,
    stageStats,
    skillStats,
    revisitStudents,
    strategyHistogram,
  };
}

export function mapStudentSummaryPayload(payload: Record<string, unknown>): LessonSessionStudentSummary {
  const itemsRaw = (payload.items as Array<Record<string, unknown>>) ?? [];
  const sourcesRaw = (payload.evidenceSources as Array<Record<string, unknown>>) ?? [];

  const items: LessonSessionStudentSummaryItem[] = itemsRaw.map((row) => ({
    responseId: row.responseId as string,
    stageId: row.stageId as string,
    stageTitle: row.stageTitle as string,
    questionInstanceId: row.questionInstanceId as string,
    expression: row.expression as string,
    score: Number(row.score ?? 0),
    maxScore: Number(row.maxScore ?? 0),
    submittedAt: row.submittedAt as string,
  }));

  const evidenceSources: LessonSessionStudentEvidenceSource[] = sourcesRaw.map((row) => ({
    evidenceId: row.evidenceId as string,
    skillId: row.skillId as string,
    sourceType: row.sourceType as string,
    sourceId: row.sourceId as string,
    rawScore: Number(row.rawScore ?? 0),
    rawMax: Number(row.rawMax ?? 0),
    weight: Number(row.weight ?? 0.25),
    occurredAt: row.occurredAt as string,
  }));

  return {
    sessionId: payload.sessionId as string,
    lessonTitle: (payload.lessonTitle as string) ?? "",
    topicId: (payload.topicId as string) ?? "",
    status: payload.status as LessonSessionStatus,
    endedAt: (payload.endedAt as string | null) ?? null,
    responseCount: Number(payload.responseCount ?? 0),
    correctRate: payload.correctRate != null ? Number(payload.correctRate) : null,
    items,
    evidenceSources,
  };
}
