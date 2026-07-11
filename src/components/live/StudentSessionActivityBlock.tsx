"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { StudentOrderDirectorActivity } from "@/components/live/StudentOrderDirectorActivity";
import { Card } from "@/components/ui/Card";
import {
  requestLessonSessionHelpAction,
  submitLessonStageResponseAction,
} from "@/lib/actions/lessonSessions";
import {
  clearStoredAttemptId,
  clearStudentDraft,
  readStoredAttemptId,
  readStudentDraft,
  storeAttemptId,
  writeStudentDraft,
} from "@/lib/live/studentDraft";
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(() => {
    if (submitted) return submitted.selectedOperatorIndex;
    return readStudentDraft(sessionId, stageId, question.questionInstanceId)?.selectedOperatorIndex ?? null;
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [helpPending, startHelpTransition] = useTransition();
  const [submitPending, startSubmitTransition] = useTransition();
  const submittingRef = useRef(false);

  const handleSelect = useCallback(
    (index: number) => {
      if (submitted || submitPending) return;
      setSelectedIndex(index);
      writeStudentDraft(sessionId, stageId, question.questionInstanceId, index);
    },
    [question.questionInstanceId, sessionId, stageId, submitPending, submitted],
  );

  const handleClear = useCallback(() => {
    if (submitted || submitPending) return;
    setSelectedIndex(null);
    clearStudentDraft(sessionId, stageId, question.questionInstanceId);
    clearStoredAttemptId(sessionId, stageId, question.questionInstanceId);
  }, [question.questionInstanceId, sessionId, stageId, submitPending, submitted]);

  const handleSubmit = useCallback(() => {
    if (submitted || selectedIndex === null || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitError(null);

    startSubmitTransition(async () => {
      let attemptId = readStoredAttemptId(sessionId, stageId, question.questionInstanceId);
      if (!attemptId) {
        attemptId = crypto.randomUUID();
        storeAttemptId(sessionId, stageId, question.questionInstanceId, attemptId);
      }

      const result = await submitLessonStageResponseAction({
        sessionId,
        stageId,
        questionInstanceId: question.questionInstanceId,
        clientAttemptId: attemptId,
        selectedOperatorIndex: selectedIndex,
      });

      submittingRef.current = false;

      if (!result.ok) {
        setSubmitError(result.error ?? "Nie udało się wysłać odpowiedzi.");
        return;
      }

      clearStudentDraft(sessionId, stageId, question.questionInstanceId);
      if (result.score === result.maxScore) celebrateCorrectAnswer();
      await onRefresh();
    });
  }, [onRefresh, question.questionInstanceId, selectedIndex, sessionId, stageId, startSubmitTransition, submitted]);

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

          {submitError ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {submitError}
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
              {submitPending ? "Wysyłanie…" : "Wyślij"}
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
