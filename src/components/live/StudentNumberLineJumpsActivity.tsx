"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { celebrateCorrectAnswer } from "@/components/rewards/StudentRewardExperience";
import { submitLessonStageResponseAction } from "@/lib/actions/lessonSessions";
import type { LessonSessionStageQuestion, LessonSessionStudentResponse } from "@/types/lessonSession";

interface Props { sessionId: string; stageId: string; station: number; question: LessonSessionStageQuestion; submitted?: LessonSessionStudentResponse; questionNumber: number; questionCount: number; onRefresh: () => Promise<unknown>; }

export function StudentNumberLineJumpsActivity({ sessionId, stageId, station, question, submitted, questionNumber, questionCount, onRefresh }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const sendingRef = useRef(false);

  const handleResult = useCallback((correct: boolean | null, answer?: string) => {
    if (correct === null || sendingRef.current) return;

    sendingRef.current = true;
    startTransition(async () => {
      setError(null);
      const response = await submitLessonStageResponseAction({
        sessionId,
        stageId,
        questionInstanceId: question.questionInstanceId,
        clientAttemptId: crypto.randomUUID(),
        selectedOperatorIndex: correct ? 1 : 0,
        answerLabel: answer ?? "",
      });

      if (!response.ok) {
        sendingRef.current = false;
        setError(response.error ?? "Nie udało się zapisać odpowiedzi.");
        return;
      }

      if (response.score === response.maxScore) celebrateCorrectAnswer();
      await onRefresh();
      sendingRef.current = false;
    });
  }, [onRefresh, question.questionInstanceId, sessionId, stageId, startTransition]);

  if (submitted) return <div className="rounded-3xl bg-emerald-50 px-5 py-10 text-center"><p className="text-xl font-black text-emerald-950">Slajd ukończony</p><p className="mt-2 text-sm text-emerald-800">Wysłano {questionCount}/{questionCount} odpowiedzi. Poczekaj na kolejny slajd.</p></div>;
  return <div className="space-y-4">
    <NumberLineJumpsModel seed={station} taskSeed={question.seed} questionNumber={questionNumber} questionCount={questionCount} onResultChange={handleResult} />
    {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p> : null}
    {pending ? <p className="rounded-xl bg-indigo-50 p-3 text-center text-sm font-black text-indigo-900" role="status">Sprawdzanie i przejście do następnego zadania…</p> : null}
  </div>;
}
