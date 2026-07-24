"use client";

import { useCallback, useState, useTransition } from "react";
import { OrderOfOperationsLessonModel } from "@/components/lessons/models/OrderOfOperationsLessonModel";
import { submitLessonStageResponseAction } from "@/lib/actions/lessonSessions";
import type { LessonSessionStageQuestion, LessonSessionStudentResponse } from "@/types/lessonSession";
import { celebrateCorrectAnswer } from "@/components/rewards/StudentRewardExperience";

interface Props {
  sessionId: string;
  stageId: string;
  station: number;
  question: LessonSessionStageQuestion;
  submitted?: LessonSessionStudentResponse;
  questionNumber: number;
  questionCount: number;
  onRefresh: () => Promise<unknown>;
}

export function StudentOrderOfOperationsActivity({ sessionId, stageId, station, question, submitted, questionNumber, questionCount, onRefresh }: Props) {
  const [result, setResult] = useState<{ correct: boolean; answer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();
  const handleResult = useCallback((correct: boolean | null, answer?: string) => { setFeedback(null); setResult(correct === null ? null : { correct, answer: answer ?? "" }); }, []);

  if (submitted) return <div className="rounded-3xl bg-emerald-50 px-5 py-10 text-center"><p className="text-xl font-black text-emerald-950">Slajd ukończony</p><p className="mt-2 text-sm text-emerald-800">Wysłano {questionCount}/{questionCount} odpowiedzi.</p></div>;

  return <div className="space-y-4">
    <OrderOfOperationsLessonModel seed={station} taskSeed={question.seed} questionNumber={questionNumber} questionCount={questionCount} onResultChange={handleResult} />
    {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p> : null}
    <button type="button" disabled={pending || !result || feedback !== null} onClick={() => startTransition(async () => {
      setError(null);
      const response = await submitLessonStageResponseAction({ sessionId, stageId, questionInstanceId: question.questionInstanceId, clientAttemptId: crypto.randomUUID(), selectedOperatorIndex: result?.correct ? 1 : 0, answerLabel: result?.answer });
      if (!response.ok) { setError(response.error ?? "Nie udało się wysłać odpowiedzi."); return; }
      if (response.score === response.maxScore) celebrateCorrectAnswer();
      setFeedback(response.score === response.maxScore);
    })} className="sticky bottom-3 z-20 min-h-16 w-full rounded-2xl bg-indigo-600 px-5 text-lg font-black text-white shadow-2xl ring-4 ring-white disabled:bg-slate-300 disabled:text-slate-600">{pending ? "Sprawdzanie…" : result ? `Zatwierdź ${questionNumber}/${questionCount}` : "Uzupełnij wynik"}</button>
    {feedback !== null ? <div className={`rounded-2xl p-4 text-center font-black ${feedback ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`} role="status"><p>{feedback ? "Dobrze! Punkt został zapisany." : "Tym razem nie. Zadanie zostało zapisane bez punktu."}</p><button type="button" onClick={() => void onRefresh()} className="mt-3 min-h-12 rounded-xl bg-slate-950 px-5 text-white">Dalej</button></div> : null}
  </div>;
}
