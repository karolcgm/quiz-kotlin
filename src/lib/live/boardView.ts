import type {
  BoardStageAggregate,
  BoardStageSummary,
  LessonSessionBoardView,
  LessonSessionStageSnapshot,
  LessonSessionStatus,
} from "@/types/lessonSession";

export function mapBoardViewPayload(payload: Record<string, unknown>): LessonSessionBoardView {
  const activeStageSummaryRaw = payload.activeStageSummary as Record<string, unknown> | undefined;
  const stageSummariesRaw = payload.stageSummaries as Array<Record<string, unknown>> | undefined;

  let activeStageSummary: BoardStageSummary | undefined;
  if (activeStageSummaryRaw) {
    activeStageSummary = {
      submittedCount: Number(activeStageSummaryRaw.submittedCount ?? 0),
      correctCount:
        activeStageSummaryRaw.correctCount === null || activeStageSummaryRaw.correctCount === undefined
          ? null
          : Number(activeStageSummaryRaw.correctCount),
    };
  }

  const stageSummaries: BoardStageAggregate[] | undefined = stageSummariesRaw?.map((row) => ({
    stageId: row.stageId as string,
    submittedCount: Number(row.submittedCount ?? 0),
    correctCount: Number(row.correctCount ?? 0),
  }));

  return {
    sessionId: payload.sessionId as string,
    status: payload.status as LessonSessionStatus,
    activeStageIndex: payload.activeStageIndex as number,
    stageCount: payload.stageCount as number,
    solutionRevealed: payload.solutionRevealed as boolean,
    boardOnlyMode: payload.boardOnlyMode as boolean,
    sequenceNumber: Number(payload.sequenceNumber),
    lessonTitle: payload.lessonTitle as string,
    topicId: payload.topicId as string,
    studentGoal: payload.studentGoal as string,
    activeStage: (payload.activeStage as LessonSessionStageSnapshot | null) ?? null,
    activeStageSummary,
    stageSummaries,
    participantCount:
      payload.participantCount === null || payload.participantCount === undefined
        ? null
        : Number(payload.participantCount),
  };
}

export function buildStudentJoinUrl(sessionId: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/dolacz/${sessionId}`;
}

export function buildBoardUrl(sessionId: string, joinCode?: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  const url = new URL(`/tablica/${sessionId}`, base);
  if (joinCode) {
    url.searchParams.set("code", joinCode);
  }
  return url.toString();
}
