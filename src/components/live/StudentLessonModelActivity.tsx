"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { submitLessonStageResponseAction } from "@/lib/actions/lessonSessions";
import { celebrateCorrectAnswer } from "@/components/rewards/StudentRewardExperience";
import type { LessonSessionStageQuestion, LessonSessionStudentResponse } from "@/types/lessonSession";
import { clearLocalWorkTrace, readLocalWorkTrace, writeLocalWorkDraft, type LocalWorkIdentity, type LocalWorkTrace } from "@/lib/lessons/localWorkTrace";
import { useIdempotentSubmission } from "@/lib/lessons/useIdempotentSubmission";

interface Props { sessionId: string; stageId: string; question: LessonSessionStageQuestion; submitted?: LessonSessionStudentResponse; questionNumber: number; questionCount: number; onRefresh: () => Promise<unknown>; children: (onResultChange: (correct: boolean | null, answer?: string) => void) => ReactNode; }
export function StudentLessonModelActivity({ sessionId, stageId, question, submitted, questionNumber, questionCount, onRefresh, children }: Props) {
  // Klasa VI pracuje według wspólnego rytmu: najpierw karta sprawdza
  // rozwiązanie, potem uczeń świadomie zatwierdza je dolnym przyciskiem.
  const requiresFinalConfirmation = stageId.startsWith("m6-");
  type Payload = { correct: boolean; answer: string };
  const workIdentity = useMemo<LocalWorkIdentity>(() => ({
    channel: "live",
    scopeId: sessionId,
    stageId,
    itemId: question.questionInstanceId,
  }), [question.questionInstanceId, sessionId, stageId]);
  const [result, setResult] = useState<Payload | null>(() => readLocalWorkTrace<Payload>(workIdentity)?.payload ?? null);
  const [childShowsOutcome, setChildShowsOutcome] = useState(false);
  const childRef = useRef<HTMLDivElement>(null);
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
    setChildShowsOutcome(false);
    if (correct === null) {
      setResult(null);
      if (!submission.queued) clearLocalWorkTrace(workIdentity);
      return;
    }
    const next = { correct, answer: answer ?? "" };
    setResult(next);
    writeLocalWorkDraft(workIdentity, next);
    if (!requiresFinalConfirmation) submission.submit(next);
  }, [requiresFinalConfirmation, submission, workIdentity]);
  useEffect(() => {
    if (!result) return;
    const checkOutcome = window.setTimeout(() => {
      const texts = Array.from(childRef.current?.querySelectorAll("[role='status']") ?? []).map((node) => node.textContent ?? "");
      setChildShowsOutcome(result.correct
        ? texts.some((text) => /brawo|dobrze|poprawnie/iu.test(text))
        : texts.some((text) => /spróbuj innym razem.*dziś bez punktu/iu.test(text)));
    }, 0);
    return () => window.clearTimeout(checkOutcome);
  }, [result]);
  if (submitted) return <div className="rounded-3xl bg-emerald-50 px-5 py-10 text-center"><p className="text-xl font-black text-emerald-950">Odpowiedź wysłana</p><p className="mt-2 text-sm text-emerald-800">Poczekaj na kolejne zadanie albo następny slajd.</p></div>;
  return <div className="space-y-4">
    <div ref={childRef}>{children(onResultChange)}</div>
    {requiresFinalConfirmation && !childShowsOutcome && result?.correct === true ? <p role="status" data-grade6-shared-feedback className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Odpowiedź jest poprawna.</p> : null}
    {requiresFinalConfirmation && !childShowsOutcome && result?.correct === false ? <p role="status" data-grade6-shared-feedback className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to ten pokazany w informacji zwrotnej powyżej. Dziś bez punktu.</p> : null}
    {submission.error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800" role="alert">{submission.error}</p> : null}
    {requiresFinalConfirmation ? (
      <button
        type="button"
        disabled={!result || submission.pending || submission.queued}
        onClick={() => { if (result) submission.submit(result); }}
        className="sticky bottom-3 z-20 min-h-16 w-full rounded-2xl bg-indigo-600 px-5 text-lg font-black text-white shadow-2xl ring-4 ring-white disabled:bg-slate-300 disabled:text-slate-600"
      >
        {submission.pending ? "Sprawdzanie…" : submission.queued ? "Zadanie czeka na połączenie" : result?.correct === false ? "Przejdź dalej bez punktu" : result ? `Zatwierdź ${questionNumber}/${questionCount}` : "Najpierw sprawdź rozwiązanie"}
      </button>
    ) : null}
    {!requiresFinalConfirmation && (submission.pending || submission.queued) ? <p className="sticky bottom-3 z-20 rounded-2xl bg-indigo-600 px-5 py-4 text-center text-lg font-black text-white shadow-2xl ring-4 ring-white">{submission.pending ? "Przesyłanie zadania…" : "Zadanie czeka na połączenie"}</p> : null}
  </div>;
}
