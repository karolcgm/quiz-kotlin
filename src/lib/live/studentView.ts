import type {
  LessonSessionHelpStatus,
  LessonSessionStageSnapshot,
  LessonSessionStudentResponse,
  LessonSessionStudentView,
  LessonPaceMode,
  LessonSessionStatus,
} from "@/types/lessonSession";

export function mapStudentViewPayload(payload: Record<string, unknown>): LessonSessionStudentView {
  const responsesRaw = (payload.myResponses as Array<Record<string, unknown>>) ?? [];

  const myResponses: LessonSessionStudentResponse[] = responsesRaw.map((row) => ({
    stageId: row.stageId as string,
    questionInstanceId: row.questionInstanceId as string,
    status: row.status as "submitted",
    selectedOperatorIndex:
      row.selectedOperatorIndex === null || row.selectedOperatorIndex === undefined
        ? null
        : Number(row.selectedOperatorIndex),
    submittedAt: row.submittedAt as string,
  }));

  return {
    sessionId: payload.sessionId as string,
    status: payload.status as LessonSessionStatus,
    paceMode: payload.paceMode as LessonPaceMode,
    boardOnlyMode: payload.boardOnlyMode as boolean,
    activeStageIndex: payload.activeStageIndex as number,
    stageCount: payload.stageCount as number,
    sequenceNumber: Number(payload.sequenceNumber),
    lessonTitle: payload.lessonTitle as string,
    topicId: payload.topicId as string,
    activeStage: (payload.activeStage as LessonSessionStageSnapshot | null) ?? null,
    helpStatus: payload.helpStatus as LessonSessionHelpStatus,
    myResponses,
  };
}

export function isStageInteractive(stage: LessonSessionStageSnapshot | null): boolean {
  if (!stage) return false;
  const mode = stage.studentActivityMode;
  if (mode === "view") return false;
  if (mode === "respond" || mode === "practice") return stage.questions.length > 0;
  return stage.questions.length > 0;
}

export function findSubmittedResponse(
  view: LessonSessionStudentView,
  stageId: string,
  questionInstanceId: string,
): LessonSessionStudentResponse | undefined {
  return view.myResponses.find(
    (response) =>
      response.stageId === stageId &&
      response.questionInstanceId === questionInstanceId &&
      response.status === "submitted",
  );
}
