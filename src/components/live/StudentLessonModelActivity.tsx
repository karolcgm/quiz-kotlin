"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { submitLessonStageResponseAction } from "@/lib/actions/lessonSessions";
import { celebrateCorrectAnswer } from "@/components/rewards/StudentRewardExperience";
import type { LessonSessionStageQuestion, LessonSessionStudentResponse } from "@/types/lessonSession";
import { clearLocalWorkTrace, readLocalWorkTrace, writeLocalWorkDraft, type LocalWorkIdentity, type LocalWorkTrace } from "@/lib/lessons/localWorkTrace";
import { useIdempotentSubmission } from "@/lib/lessons/useIdempotentSubmission";

interface Props { sessionId: string; stageId: string; question: LessonSessionStageQuestion; submitted?: LessonSessionStudentResponse; questionNumber: number; questionCount: number; onRefresh: () => Promise<unknown>; children: (onResultChange: (correct: boolean | null, answer?: string) => void) => ReactNode; }
export function StudentLessonModelActivity({ sessionId, stageId, question, submitted, questionNumber, questionCount, onRefresh, children }: Props) {
  type Payload = { correct: boolean; answer: string };
  const workIdentity = useMemo<LocalWorkIdentity>(() => ({
    channel: "live",
    scopeId: sessionId,
    stageId,
    itemId: question.questionInstanceId,
  }), [question.questionInstanceId, sessionId, stageId]);
  const [result, setResult] = useState<Payload | null>(() => readLocalWorkTrace<Payload>(workIdentity)?.payload ?? null);
  const sendSubmission = useCallback((trace: LocalWorkTrace<Payload>) => submitLessonStageResponseAction({
    sessionId,
    stageId,
    questionInstanceId: question.questionInstanceId,
    clientAttemptId: trace.clientAttemptId,
    selectedOperatorIndex: trace.payload.correct ? 1 : 0,
    answerLabel: trace.payload.answer,
  }), [question.questionInstanceId, sessionId, stageId]);
  const handleSubmissionSuccess = useCallback(async (
    response: Awaited<ReturnType<typeof submitLessonStageResponseAction>>,
  ) => {
    if (response.score === response.maxScore) celebrateCorrectAnswer();
    await onRefresh();
  }, [onRefresh]);
  const submission = useIdempotentSubmission<Payload, Awaited<ReturnType<typeof submitLessonStageResponseAction>>>({
    identity: workIdentity,
    disabled: Boolean(submitted),
    send: sendSubmission,
    onSuccess: handleSubmissionSuccess,
  });
  const onResultChange = useCallback((correct: boolean | null, answer?: string) => {
    if (correct === null) {
      setResult(null);
      if (!submission.queued) clearLocalWorkTrace(workIdentity);
      return;
    }
    const next = { correct, answer: answer ?? "" };
    setResult(next);
    writeLocalWorkDraft(workIdentity, next);
    // Zakończenie zadania jest równocześnie jego oceną i wysłaniem.
    // Nie tworzymy drugiego, mylącego kroku „Wyślij odpowiedź”.
    submission.submit(next);
  }, [submission, workIdentity]);
  if (submitted) return <div className="rounded-3xl bg-emerald-50 px-5 py-10 text-center"><p className="text-xl font-black text-emerald-950">Odpowiedź wysłana</p><p className="mt-2 text-sm text-emerald-800">Poczekaj na kolejne zadanie albo następny slajd.</p></div>;
  return <div className="space-y-4">{children(onResultChange)}{submission.error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800" role="alert">{submission.error}</p> : null}{submission.pending || submission.queued ? <p className="sticky bottom-3 z-20 rounded-2xl bg-indigo-600 px-5 py-4 text-center text-lg font-black text-white shadow-2xl ring-4 ring-white">{submission.pending ? "Przesyłanie zadania…" : "Zadanie czeka na połączenie"}</p> : null}</div>;
}
