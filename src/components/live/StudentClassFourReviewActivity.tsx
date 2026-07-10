"use client";

import { useState, useTransition } from "react";
import { ClassFourReviewModel } from "@/components/lessons/models/ClassFourReviewModel";
import { submitLessonStageResponseAction } from "@/lib/actions/lessonSessions";
import type { LessonSessionStageQuestion, LessonSessionStudentResponse } from "@/types/lessonSession";

interface Props {
  sessionId: string;
  stageId: string;
  seed: number;
  question: LessonSessionStageQuestion;
  submitted?: LessonSessionStudentResponse;
  onRefresh: () => Promise<unknown>;
}

export function StudentClassFourReviewActivity({ sessionId, stageId, seed, question, submitted, onRefresh }: Props) {
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return <div className="rounded-3xl bg-emerald-50 px-5 py-10 text-center"><p className="text-xl font-black text-emerald-950">Odpowiedź wysłana</p><p className="mt-2 text-sm text-emerald-800">Poczekaj na następny widget nauczyciela.</p></div>;
  }

  return <div className="space-y-4">
    <ClassFourReviewModel seed={seed} onResultChange={setResult} />
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
          selectedOperatorIndex: result ? 1 : 0,
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
