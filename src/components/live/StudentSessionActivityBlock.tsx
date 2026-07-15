"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { StudentOrderDirectorActivity } from "@/components/live/StudentOrderDirectorActivity";
import { Card } from "@/components/ui/Card";
import {
  requestLessonSessionHelpAction,
  submitLessonStageResponseAction,
} from "@/lib/actions/lessonSessions";
import { clearStudentDraft, readStudentDraft, writeStudentDraft } from "@/lib/live/studentDraft";
import {
  clearLocalWorkTrace,
  readLocalWorkTrace,
  writeLocalWorkDraft,
  type LocalWorkIdentity,
  type LocalWorkTrace,
} from "@/lib/lessons/localWorkTrace";
import { useIdempotentSubmission } from "@/lib/lessons/useIdempotentSubmission";
import type { LessonSessionStageQuestion, LessonSessionStudentResponse } from "@/types/lessonSession";
import { celebrateCorrectAnswer } from "@/components/rewards/StudentRewardExperience";

interface StudentSessionActivityBlockProps {
  sessionId: string;
  stageId: string;
  stageTitle: string;
  stageInstruction?: string;
  question: LessonSessionStageQuestion;
  submitted?: LessonSessionStudentResponse;
  helpStatus: "none" | "requested";
  onRefresh: () => Promise<unknown>;
}

export function StudentSessionActivityBlock({
  sessionId,
  stageId,
  stageTitle,
  stageInstruction,
  question,
  submitted,
  helpStatus,
  onRefresh,
}: StudentSessionActivityBlockProps) {
  const workIdentity = useMemo<LocalWorkIdentity>(() => ({
    channel: "live",
    scopeId: sessionId,
    stageId,
    itemId: question.questionInstanceId,
  }), [question.questionInstanceId, sessionId, stageId]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(() => {
    if (submitted) return submitted.selectedOperatorIndex;
    const localTrace = readLocalWorkTrace<{ selectedOperatorIndex: number | null }>(workIdentity);
    return localTrace?.payload.selectedOperatorIndex
      ?? readStudentDraft(sessionId, stageId, question.questionInstanceId)?.selectedOperatorIndex
      ?? null;
  });
  const [helpPending, startHelpTransition] = useTransition();
  const sendSubmission = useCallback((trace: LocalWorkTrace<{ selectedOperatorIndex: number | null }>) => (
    submitLessonStageResponseAction({
      sessionId,
      stageId,
      questionInstanceId: question.questionInstanceId,
      clientAttemptId: trace.clientAttemptId,
      selectedOperatorIndex: trace.payload.selectedOperatorIndex,
    })
  ), [question.questionInstanceId, sessionId, stageId]);
  const handleSubmissionSuccess = useCallback(async (
    result: Awaited<ReturnType<typeof submitLessonStageResponseAction>>,
  ) => {
    clearStudentDraft(sessionId, stageId, question.questionInstanceId);
    if (result.score === result.maxScore) celebrateCorrectAnswer();
    await onRefresh();
  }, [onRefresh, question.questionInstanceId, sessionId, stageId]);
  const submission = useIdempotentSubmission<
    { selectedOperatorIndex: number | null },
    Awaited<ReturnType<typeof submitLessonStageResponseAction>>
  >({
    identity: workIdentity,
    disabled: Boolean(submitted),
    send: sendSubmission,
    onSuccess: handleSubmissionSuccess,
  });
  const submitPending = submission.pending || submission.queued;

  const handleSelect = useCallback(
    (index: number) => {
      if (submitted || submitPending) return;
      setSelectedIndex(index);
      writeStudentDraft(sessionId, stageId, question.questionInstanceId, index);
      writeLocalWorkDraft(workIdentity, { selectedOperatorIndex: index });
    },
    [question.questionInstanceId, sessionId, stageId, submitPending, submitted, workIdentity],
  );

  const handleClear = useCallback(() => {
    if (submitted || submitPending) return;
    setSelectedIndex(null);
    clearStudentDraft(sessionId, stageId, question.questionInstanceId);
    clearLocalWorkTrace(workIdentity);
  }, [question.questionInstanceId, sessionId, stageId, submitPending, submitted, workIdentity]);

  const handleSubmit = useCallback(() => {
    if (submitted || selectedIndex === null || submitPending) return;
    submission.submit({ selectedOperatorIndex: selectedIndex });
  }, [selectedIndex, submission, submitPending, submitted]);

  const handleHelp = useCallback(
    (cancel: boolean) => {
      startHelpTransition(async () => {
        await requestLessonSessionHelpAction(sessionId, cancel);
        await onRefresh();
      });
    },
    [onRefresh, sessionId, startHelpTransition],
  );

  return (
    <Card className="live-student-slide space-y-5 p-4 sm:p-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stageTitle}</p>
        {stageInstruction ? <p className="text-sm font-medium text-slate-800">{stageInstruction}</p> : null}
      </div>

      {submitted ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-8 text-center" role="status">
          <p className="text-lg font-bold text-emerald-900">Odpowiedź wysłana</p>
          <p className="mt-2 text-sm text-emerald-800">
            Dziękujemy! Poczekaj na kolejny etap — nauczyciel poprowadzi dalej.
          </p>
        </div>
      ) : (
        <>
          <StudentOrderDirectorActivity
            question={question}
            selectedIndex={selectedIndex}
            disabled={submitPending}
            onSelect={handleSelect}
          />

          {submission.error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {submission.error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={helpPending || helpStatus === "requested"}
              onClick={() => handleHelp(false)}
              className="min-h-12 flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-900 disabled:opacity-60 sm:flex-none sm:px-4"
            >
              {helpStatus === "requested" ? "Prośba wysłana" : "Podpowiedź"}
            </button>
            {helpStatus === "requested" ? (
              <button
                type="button"
                disabled={helpPending}
                onClick={() => handleHelp(true)}
                className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Anuluj prośbę
              </button>
            ) : null}
            <button
              type="button"
              disabled={submitPending}
              onClick={handleClear}
              className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Wyczyść
            </button>
            <button
              type="button"
              disabled={submitPending || selectedIndex === null}
              onClick={handleSubmit}
              className="min-h-12 flex-1 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 sm:flex-none"
            >
              {submission.pending ? "Wysyłanie…" : submission.queued ? "Czeka na połączenie" : "Wyślij"}
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
