import type {
  LessonSessionHelpStatus,
  LessonSessionHistogramBucket,
  LessonSessionParticipantRow,
  LessonSessionTeacherView,
  LessonPaceMode,
  LessonSessionStatus,
} from "@/types/lessonSession";

export function mapTeacherViewPayload(payload: Record<string, unknown>): LessonSessionTeacherView {
  const participantsRaw = (payload.participants as Array<Record<string, unknown>>) ?? [];
  const histogramRaw = (payload.activeStageHistogram as Array<Record<string, unknown>>) ?? [];
  const summaryRaw = (payload.responseSummary as Array<Record<string, unknown>>) ?? [];

  const participants: LessonSessionParticipantRow[] = participantsRaw.map((row) => ({
    participantId: row.participantId as string,
    studentId: row.studentId as string,
    displayName: row.displayName as string,
    helpStatus: row.helpStatus as LessonSessionHelpStatus,
    responseStatus: row.responseStatus as "waiting" | "in_progress" | "submitted",
    responseResult:
      row.responseResult === "correct" || row.responseResult === "incorrect"
        ? row.responseResult
        : null,
    lastSeenAt: row.lastSeenAt as string,
    responseCount: Number(row.responseCount ?? 0),
    responseTotal: Number(row.responseTotal ?? 0),
    correctCount: Number(row.correctCount ?? 0),
    isOnline: Boolean(row.isOnline),
    lastAnswer: (row.lastAnswer as string | null) ?? null,
  }));

  const activeStageHistogram: LessonSessionHistogramBucket[] = histogramRaw.map((row) => ({
    selectedOperatorIndex: Number(row.selectedOperatorIndex),
    count: Number(row.count),
  }));

  return {
    sessionId: payload.sessionId as string,
    classId: payload.classId as string,
    schoolId: payload.schoolId as string,
    className: (payload.className as string) ?? "Klasa",
    groupName: (payload.groupName as string) ?? "",
    schoolName: (payload.schoolName as string) ?? "Szkoła",
    lessonId: payload.lessonId as string,
    lessonVersion: payload.lessonVersion as number,
    lessonTitle: (payload.lessonTitle as string) ?? "",
    topicId: (payload.topicId as string) ?? "",
    status: payload.status as LessonSessionStatus,
    paceMode: payload.paceMode as LessonPaceMode,
    activeStageIndex: payload.activeStageIndex as number,
    activeStageId: (payload.activeStageId as string | null) ?? null,
    solutionRevealed: payload.solutionRevealed as boolean,
    boardOnlyMode: payload.boardOnlyMode as boolean,
    sequenceNumber: Number(payload.sequenceNumber),
    joinCodeExpiresAt: payload.joinCodeExpiresAt as string,
    startedAt: (payload.startedAt as string | null) ?? null,
    endedAt: (payload.endedAt as string | null) ?? null,
    participantCount: Number(payload.participantCount ?? 0),
    helpRequestedCount: Number(payload.helpRequestedCount ?? 0),
    activeStageSubmittedCount: Number(payload.activeStageSubmittedCount ?? 0),
    stageSnapshot: payload.stageSnapshot as LessonSessionTeacherView["stageSnapshot"],
    answerKey: payload.answerKey as LessonSessionTeacherView["answerKey"],
    responseSummary: summaryRaw.map((row) => ({
      stageId: row.stageId as string,
      submittedCount: Number(row.submittedCount ?? 0),
      helpRequestedCount: Number(row.helpRequestedCount ?? 0),
    })),
    participants,
    activeStageHistogram,
  };
}

export function getJoinCodeStorageKey(sessionId: string): string {
  return `lekcjalab-session-join-code-${sessionId}`;
}

export function readStoredJoinCode(sessionId: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(getJoinCodeStorageKey(sessionId));
}

export function storeJoinCode(sessionId: string, joinCode: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(getJoinCodeStorageKey(sessionId), joinCode);
}
