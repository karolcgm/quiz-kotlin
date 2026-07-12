"use client";

import { useCallback, useState, useTransition, type ReactNode } from "react";
import { submitLessonStageResponseAction } from "@/lib/actions/lessonSessions";
import { celebrateCorrectAnswer } from "@/components/rewards/StudentRewardExperience";
import type { LessonSessionStageQuestion, LessonSessionStudentResponse } from "@/types/lessonSession";

interface Props { sessionId: string; stageId: string; question: LessonSessionStageQuestion; submitted?: LessonSessionStudentResponse; questionNumber: number; questionCount: number; onRefresh: () => Promise<unknown>; children: (onResultChange: (correct: boolean | null, answer?: string) => void) => ReactNode; }
export function StudentLessonModelActivity({ sessionId, stageId, question, submitted, questionNumber, questionCount, onRefresh, children }: Props) {
  const [result, setResult] = useState<{ correct: boolean; answer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const onResultChange = useCallback((correct: boolean | null, answer?: string) => setResult(correct === null ? null : { correct, answer: answer ?? "" }), []);
  if (submitted) return <div className="rounded-3xl bg-emerald-50 px-5 py-10 text-center"><p className="text-xl font-black text-emerald-950">Odpowiedź wysłana</p><p className="mt-2 text-sm text-emerald-800">Poczekaj na kolejne zadanie albo następny slajd.</p></div>;
  return <div className="space-y-4">{children(onResultChange)}{error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p> : null}<button type="button" disabled={pending || !result} onClick={() => startTransition(async () => { const response = await submitLessonStageResponseAction({ sessionId, stageId, questionInstanceId: question.questionInstanceId, clientAttemptId: crypto.randomUUID(), selectedOperatorIndex: result?.correct ? 1 : 0, answerLabel: result?.answer }); if (!response.ok) { setError(response.error ?? "Nie udało się wysłać odpowiedzi."); return; } if (response.score === response.maxScore) celebrateCorrectAnswer(); await onRefresh(); })} className="sticky bottom-3 z-20 min-h-16 w-full rounded-2xl bg-indigo-600 px-5 text-lg font-black text-white shadow-2xl ring-4 ring-white disabled:bg-slate-300">{pending ? "Wysyłanie…" : result ? `Wyślij odpowiedź ${questionNumber}/${questionCount}` : "Najpierw wykonaj zadanie"}</button></div>;
}
