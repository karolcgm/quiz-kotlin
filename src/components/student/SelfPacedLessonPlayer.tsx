"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ClassFourReviewModel } from "@/components/lessons/models/ClassFourReviewModel";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";
import { MentalAddSubLessonModel } from "@/components/lessons/models/MentalAddSubLessonModel";
import { MentalMulDivLessonModel } from "@/components/lessons/models/MentalMulDivLessonModel";
import { NaturalNumbersLessonModel } from "@/components/lessons/models/NaturalNumbersLessonModel";
import { OrderOfOperationsLessonModel } from "@/components/lessons/models/OrderOfOperationsLessonModel";
import { Card } from "@/components/ui/Card";
import { UnderstandingCheck } from "@/components/lessons/UnderstandingCheck";
import { StudentOrderDirectorActivity } from "@/components/live/StudentOrderDirectorActivity";
import { celebrateCorrectAnswer } from "@/components/rewards/StudentRewardExperience";
import { finishStudentLessonReviewAction, submitStudentLessonReviewAnswerAction } from "@/lib/actions/studentLearningPlan";
import type { LessonSessionStageSnapshot } from "@/types/lessonSession";
import type { StudentLessonReviewAnswer, StudentLessonReviewView } from "@/types/studentLearningPlan";
import type { UnderstandingLevel } from "@/types/understanding";

type Result = { correct: boolean; answer: string; selectedOperatorIndex?: number };
const SUPPORTED = new Set(["class4-review", "natural-numbers-lesson", "mental-add-sub-lesson", "mental-mul-div-lesson", "order-of-operations-lesson"]);

function QuestionModel({ stage, seed, questionSeed, questionNumber, questionCount, onResult }: { stage: LessonSessionStageSnapshot; seed: number; questionSeed: number; questionNumber: number; questionCount: number; onResult: (correct: boolean | null, answer?: string) => void }) {
  const props = { seed, taskSeed: questionSeed, questionNumber, questionCount, onResultChange: onResult };
  if (stage.studentModelId === "class4-review") return <ClassFourReviewModel {...props} />;
  if (stage.studentModelId === "natural-numbers-lesson") return <NaturalNumbersLessonModel {...props} />;
  if (stage.studentModelId === "mental-add-sub-lesson") return <MentalAddSubLessonModel {...props} />;
  if (stage.studentModelId === "mental-mul-div-lesson") return <MentalMulDivLessonModel {...props} />;
  if (stage.studentModelId === "order-of-operations-lesson") return <OrderOfOperationsLessonModel {...props} />;
  return <Card className="py-10 text-center"><div className="text-5xl">🧩</div><p className="mt-3 font-black text-slate-950">Ten slajd służy do samodzielnego obejrzenia.</p><p className="mt-1 text-sm text-slate-600">Przejdź dalej, gdy wszystko jest jasne.</p></Card>;
}

export function SelfPacedLessonPlayer({
  initialReview,
  initialThemeId = "sky",
}: {
  initialReview: StudentLessonReviewView;
  initialThemeId?: string;
}) {
  const presentationRef = useRef<HTMLDivElement>(null);
  const stages = initialReview.stageSnapshot.stages;
  const [stageIndex, setStageIndex] = useState(Math.min(initialReview.currentStageIndex, Math.max(0, stages.length - 1)));
  const [answers, setAnswers] = useState<Record<string, StudentLessonReviewAnswer>>(initialReview.answers ?? {});
  const [score, setScore] = useState(initialReview.score);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(initialReview.status === "completed");
  const [understanding, setUnderstanding] = useState<UnderstandingLevel | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pending, startTransition] = useTransition();
  const stage = stages[stageIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= initialReview.maxScore;
  const stageAnswered = stage?.questions.filter((question) => Boolean(answers[question.questionInstanceId])).length ?? 0;
  const question = stage?.questions.find((item) => !answers[item.questionInstanceId]) ?? null;
  const stageComplete = !stage || stage.questions.length === 0 || stageAnswered === stage.questions.length;
  const modelSeed = stage?.studentModelSeed ?? stage?.studentModelSeedPool?.[0] ?? 1;
  const genericOrderQuestion = question?.generatorId === "order-director-v1";
  const canAnswer = Boolean(question && ((stage?.studentModelId && SUPPORTED.has(stage.studentModelId)) || genericOrderQuestion));
  const stageStatuses = useMemo(() => stages.map((item) => item.questions.length === 0 || item.questions.every((q) => Boolean(answers[q.questionInstanceId]))), [answers, stages]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === presentationRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!presentationRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await presentationRef.current.requestFullscreen();
  }, []);

  const moveNext = () => { setResult(null); setError(null); setStageIndex((current) => Math.min(stages.length - 1, current + 1)); };
  const handleResult = (correct: boolean | null, answer?: string) => setResult(correct === null ? null : { correct, answer: answer ?? "" });

  if (finished) return <div className="mx-auto max-w-3xl space-y-5"><section className="rounded-[2.5rem] bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-700 p-8 text-center text-white shadow-2xl"><div className="text-8xl">🎉🏆⭐</div><h1 className="mt-4 text-4xl font-black">Lekcja zaliczona!</h1><p className="mt-3 text-xl font-bold">Wynik: {score}/{initialReview.maxScore} punktów</p><p className="mt-2 text-cyan-50">Możesz wrócić do planu albo zaliczyć tę lekcję ponownie później.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/uczen/plan" className="rounded-xl bg-white px-5 py-3 font-black text-indigo-700">Wróć do planu</Link><Link href="/uczen/klaser" className="rounded-xl bg-slate-950/30 px-5 py-3 font-black text-white">Sprawdź nagrody</Link></div></section></div>;

  return <div className={`self-paced-lesson lesson-theme-${initialThemeId} space-y-5`} data-fullscreen={isFullscreen || undefined}>
    <Card><p className="text-xs font-black uppercase tracking-wide text-indigo-600">Slajdy lekcji</p><nav className="mt-3 grid auto-cols-[minmax(9.5rem,1fr)] grid-flow-col gap-2 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible lg:pb-0">{stages.map((item, index) => <button type="button" key={item.id} onClick={() => { setStageIndex(index); setResult(null); setError(null); }} className={`flex min-h-16 items-center gap-2 rounded-xl px-3 text-left text-xs font-bold sm:text-sm ${index === stageIndex ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${stageStatuses[index] ? "bg-emerald-400 text-emerald-950" : index === stageIndex ? "bg-white/20" : "bg-white text-slate-700"}`}>{stageStatuses[index] ? "✓" : index + 1}</span><span className="leading-tight">{item.title}</span></button>)}</nav></Card>

    <main className="min-w-0 space-y-4"><header className="rounded-[2rem] bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-5 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-100">{initialReview.stageSnapshot.topicId} · podejście {initialReview.attemptNumber}</p><h1 className="mt-1 text-2xl font-black">{initialReview.stageSnapshot.title}</h1><p className="mt-2 text-sm text-indigo-100">Wybieraj slajdy powyżej albo przechodź przyciskiem „Dalej”.</p></div><button type="button" onClick={() => void toggleFullscreen()} className="inline-flex min-h-11 items-center rounded-xl bg-white/15 px-4 text-sm font-black text-white ring-1 ring-white/30 hover:bg-white/25">⛶ Pełny ekran slajdu</button></div></header>
      <div ref={presentationRef} className="self-paced-presentation space-y-4" data-lesson-presentation>
      {isFullscreen ? <button type="button" onClick={() => void toggleFullscreen()} className="fullscreen-exit-button fixed right-3 top-3 z-50 min-h-11 rounded-xl bg-slate-950/80 px-4 text-sm font-black text-white shadow-xl">⤓ Wyjdź</button> : null}
      {stage ? <><Card data-slide-meta className="border-transparent"><p className="text-xs font-black uppercase text-white/75">Slajd {stageIndex + 1}/{stages.length}</p><h2 className="mt-1 text-xl font-black text-white">{stage.title}</h2><p className="mt-1 text-sm text-white/85">{stage.studentInstruction ?? stage.boardBody ?? "Zapoznaj się ze slajdem i przejdź dalej."}</p></Card>
      {stage.questions.length === 0 && stage.modelId === "exercise-board" ? <ExerciseBoardModel seed={stage.modelSeed ?? 1} readOnly presentationMode lessonTitle={stage.lessonTitle ?? initialReview.stageSnapshot.title} learningGoals={stage.learningGoals} /> : null}
      {question && canAnswer && genericOrderQuestion ? <Card><StudentOrderDirectorActivity question={question} selectedIndex={result?.selectedOperatorIndex ?? null} onSelect={(index) => setResult({ correct: false, answer: String(index), selectedOperatorIndex: index })} /></Card> : null}
      {question && canAnswer && !genericOrderQuestion ? <QuestionModel key={question.questionInstanceId} stage={stage} seed={modelSeed} questionSeed={question.seed + initialReview.attemptNumber * 100003} questionNumber={stageAnswered + 1} questionCount={stage.questions.length} onResult={handleResult} /> : null}
      {stage.questions.length > 0 && !canAnswer && !stageComplete ? <QuestionModel stage={stage} seed={modelSeed} questionSeed={question?.seed ?? 1} questionNumber={stageAnswered + 1} questionCount={stage.questions.length} onResult={handleResult} /> : null}
      {stageComplete ? <Card className="border-emerald-200 bg-emerald-50 text-center"><div className="text-5xl">✅</div><p className="mt-2 text-xl font-black text-emerald-950">Ten slajd jest gotowy</p></Card> : null}
      {stageIndex === stages.length - 1 && allAnswered ? <UnderstandingCheck value={understanding} onChange={setUnderstanding} disabled={pending} /> : null}
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p> : null}
      <div className="flex flex-wrap gap-3" data-lesson-navigation><button type="button" disabled={stageIndex === 0 || pending} onClick={() => { setStageIndex((current) => Math.max(0, current - 1)); setResult(null); }} className="min-h-14 rounded-xl border border-slate-200 bg-white px-5 font-black text-slate-700 disabled:opacity-40">← Wstecz</button>
      {question && canAnswer ? <button type="button" disabled={!result || pending} onClick={() => startTransition(async () => { if (!result) return; setError(null); const response = await submitStudentLessonReviewAnswerAction({ reviewId: initialReview.reviewId, stageId: stage.id, questionId: question.questionInstanceId, stageIndex, correct: result.correct, answerLabel: result.answer, selectedOperatorIndex: result.selectedOperatorIndex }); if (!response.ok) { setError(response.error); return; } const nextAnswer: StudentLessonReviewAnswer = { stageId: stage.id, correct: Boolean(response.correct), answerLabel: result.answer, submittedAt: new Date().toISOString() }; setAnswers((current) => ({ ...current, [question.questionInstanceId]: nextAnswer })); setScore(response.score); setResult(null); if (response.correct) celebrateCorrectAnswer(); const isLastInStage = stageAnswered + 1 >= stage.questions.length; if (isLastInStage && stageIndex < stages.length - 1) setStageIndex(stageIndex + 1); })} className="min-h-14 flex-1 rounded-xl bg-indigo-600 px-5 text-lg font-black text-white disabled:bg-slate-300">{pending ? "Zapisywanie…" : result ? "Zapisz odpowiedź i dalej →" : "Najpierw wykonaj zadanie"}</button> : stageIndex < stages.length - 1 ? <button type="button" onClick={moveNext} className="min-h-14 flex-1 rounded-xl bg-indigo-600 px-5 text-lg font-black text-white">Dalej →</button> : null}
      {stageIndex === stages.length - 1 && allAnswered ? <button type="button" disabled={pending || !understanding} onClick={() => startTransition(async () => { if (!understanding) { setError("Wybierz jedną z trzech kropek, aby zakończyć lekcję."); return; } setError(null); const response = await finishStudentLessonReviewAction(initialReview.reviewId, understanding); if (!response.ok) { setError(response.error); return; } setScore(response.score); setFinished(true); })} className="min-h-14 flex-1 rounded-xl bg-emerald-600 px-5 text-lg font-black text-white disabled:bg-slate-300">{pending ? "Kończenie lekcji…" : understanding ? "Zakończ i zapisz wynik" : "Najpierw wybierz, jak rozumiesz temat"}</button> : null}</div></> : null}
      </div>
    </main>
  </div>;
}
