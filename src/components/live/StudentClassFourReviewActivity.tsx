"use client";

import { useCallback, useState, useTransition } from "react";
import { ClassFourReviewModel } from "@/components/lessons/models/ClassFourReviewModel";
import { submitLessonStageResponseAction } from "@/lib/actions/lessonSessions";
import type { LessonSessionStageQuestion, LessonSessionStudentResponse } from "@/types/lessonSession";

interface Props {
  sessionId: string;
  stageId: string;
  seed: number;
  question: LessonSessionStageQuestion;
  submitted?: LessonSessionStudentResponse;
  questionNumber: number;
  questionCount: number;
  onRefresh: () => Promise<unknown>;
}

export function StudentClassFourReviewActivity({ sessionId, stageId, seed, question, submitted, questionNumber, questionCount, onRefresh }: Props) {
  const [result, setResult] = useState<{ correct: boolean; answerLabel: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const handleResult = useCallback((correct: boolean | null, answerLabel?: string) => {
    setResult(correct === null ? null : { correct, answerLabel: answerLabel ?? "" });
  }, []);

  if (submitted) {
    return <div className="rounded-3xl bg-emerald-50 px-5 py-10 text-center"><p className="text-xl font-black text-emerald-950">Stacja ukończona</p><p className="mt-2 text-sm text-emerald-800">Wysłano {questionCount} z {questionCount} odpowiedzi. Poczekaj na następną stację.</p></div>;
  }

  return <div className="space-y-4">
    <div className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-950">
      <span>Zadanie {questionNumber} z {questionCount}</span>
      <span>{Math.round(((questionNumber - 1) / questionCount) * 100)}% ukończone</span>
    </div>
    <ClassFourReviewModel seed={seed} taskSeed={question.seed} onResultChange={handleResult} />
    {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p> : null}
    <button
      type="button"
      disabled={pending || result === null}
      onClick={() => startTransition(async () => {
        setError(null);
        const response = await submitLessonStageResponseAction({
          sessionId,
          stageId,
          questionInstanceId: question.questionInstanceId,
          clientAttemptId: crypto.randomUUID(),
          selectedOperatorIndex: result?.correct ? 1 : 0,
          answerLabel: result?.answerLabel,
        });
        if (!response.ok) { setError(response.error ?? "Nie udało się wysłać odpowiedzi."); return; }
        await onRefresh();
      })}
      className="touch-manipulation min-h-14 w-full rounded-2xl bg-indigo-600 px-5 text-base font-black text-white disabled:opacity-40"
    >
      {pending ? "Wysyłanie…" : "Wyślij odpowiedź nauczycielowi"}
    </button>
  </div>;
}
