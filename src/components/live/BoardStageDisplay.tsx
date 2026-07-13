import { OrderDirectorModel } from "@/components/lessons/models/OrderDirectorModel";
import { PlaceValueFactoryModel } from "@/components/lessons/models/PlaceValueFactoryModel";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { MultiplicationGridModel } from "@/components/lessons/models/MultiplicationGridModel";
import { DiagnosticStationsModel } from "@/components/lessons/models/DiagnosticStationsModel";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";
import { ClassFourReviewModel } from "@/components/lessons/models/ClassFourReviewModel";
import { NaturalNumbersLessonModel } from "@/components/lessons/models/NaturalNumbersLessonModel";
import { MentalAddSubLessonModel } from "@/components/lessons/models/MentalAddSubLessonModel";
import { MentalMulDivLessonModel } from "@/components/lessons/models/MentalMulDivLessonModel";
import { OrderOfOperationsLessonModel } from "@/components/lessons/models/OrderOfOperationsLessonModel";
import { EstimationLessonModel } from "@/components/lessons/models/EstimationLessonModel";
import { WrittenAddSubLessonModel } from "@/components/lessons/models/WrittenAddSubLessonModel";
import { WrittenMultiplicationLessonModel } from "@/components/lessons/models/WrittenMultiplicationLessonModel";
import { WrittenStoryProblemsLessonModel } from "@/components/lessons/models/WrittenStoryProblemsLessonModel";
import { useEffect, useState } from "react";
import type { BoardStageSummary, LessonSessionStageSnapshot } from "@/types/lessonSession";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface BoardStageDisplayProps {
  stage: LessonSessionStageSnapshot;
  stageIndex: number;
  stageCount: number;
  solutionRevealed: boolean;
  summary?: BoardStageSummary;
  interactive?: boolean;
}

export function BoardStageDisplay({
  stage,
  stageIndex,
  stageCount,
  solutionRevealed,
  summary,
  interactive = true,
}: BoardStageDisplayProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  useEffect(() => setQuestionIndex(0), [stage.id]);
  const questionCount = stage.questions.length;
  const question = stage.questions[questionIndex] ?? stage.questions[0];
  const revealSteps = stage.revealSteps ?? [];
  const revealIndex =
    solutionRevealed && revealSteps.length > 0 ? revealSteps.length - 1 : 0;
  const reveal = revealSteps[revealIndex];

  const headline = reveal?.boardHeadline ?? stage.boardHeadline ?? stage.title;
  const body = reveal?.boardBody ?? stage.boardBody;
  const hasSelfContainedVisual = stage.modelId === "class4-review" || stage.modelId === "natural-numbers-lesson" || stage.modelId === "mental-add-sub-lesson" || stage.modelId === "mental-mul-div-lesson" || stage.modelId === "order-of-operations-lesson" || stage.modelId === "estimation-lesson" || stage.modelId === "written-add-sub-lesson" || stage.modelId === "written-multiplication-lesson" || stage.modelId === "written-story-problems-lesson" || stage.modelId === "place-value-factory" || stage.modelId === "diagnostic-stations" || stage.modelId === "exercise-board";

  const modelSeed =
    stage.modelSeed ??
    stage.modelSeedPool?.[0] ??
    question?.seed ??
    1;
  const modelDifficulty = (stage.modelDifficulty ?? question?.difficulty ?? "core") as LessonDifficulty;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
      <header className={`space-y-3 text-center ${hasSelfContainedVisual ? "sr-only" : ""}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
          Etap {stageIndex + 1} z {stageCount} · {stage.title}
        </p>
        <h1 className="font-black leading-tight text-white [font-size:clamp(2rem,5vw,4.5rem)]">{headline}</h1>
        {body ? (
          <p className="mx-auto max-w-4xl text-lg leading-relaxed text-slate-200 sm:text-2xl">{body}</p>
        ) : null}
      </header>

      {stage.boardBullets?.length ? (
        <ul className="mx-auto max-w-3xl space-y-2 text-left text-lg text-slate-200 sm:text-xl">
          {stage.boardBullets.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-indigo-400" aria-hidden>
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {questionCount > 1 ? <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3"><button type="button" disabled={questionIndex===0} onClick={()=>setQuestionIndex(index=>Math.max(0,index-1))} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm font-bold text-white disabled:opacity-40">← Poprzedni przykład</button><b className="rounded-xl bg-cyan-300 px-4 py-2 text-sm text-cyan-950">Przykład {questionIndex+1} z {questionCount}</b><button type="button" disabled={questionIndex===questionCount-1} onClick={()=>setQuestionIndex(index=>Math.min(questionCount-1,index+1))} className="min-h-11 rounded-xl bg-white px-4 text-sm font-bold text-slate-950 disabled:opacity-40">Następny przykład →</button></div> : null}

      {stage.modelId === "order-director" ? (
        <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white/95 p-6 shadow-2xl sm:p-8">
          <OrderDirectorModel
            seed={modelSeed}
            seedPool={stage.modelSeedPool}
            difficulty={modelDifficulty}
            readOnly={!interactive}
            presentationMode={!solutionRevealed}
            showHints={false}
          />
        </div>
      ) : stage.modelId === "place-value-factory" ? (
        <div className="mx-auto w-full max-w-5xl">
          <PlaceValueFactoryModel seed={modelSeed} readOnly={!interactive} presentationMode />
        </div>
      ) : stage.modelId === "number-line-jumps" ? (
        <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white/95 p-6 shadow-2xl sm:p-8">
          <NumberLineJumpsModel seed={modelSeed} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "multiplication-grid" ? (
        <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white/95 p-6 shadow-2xl sm:p-8">
          <MultiplicationGridModel seed={modelSeed} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "diagnostic-stations" ? (
        <div className="mx-auto w-full max-w-6xl">
          <DiagnosticStationsModel seed={modelSeed} readOnly={!interactive} presentationMode />
        </div>
      ) : stage.modelId === "exercise-board" ? (
        <div className="mx-auto w-full max-w-6xl">
          <ExerciseBoardModel seed={modelSeed} readOnly={!interactive} presentationMode lessonTitle={stage.lessonTitle} learningGoals={stage.learningGoals} />
        </div>
      ) : stage.modelId === "class4-review" ? (
        <div className="mx-auto w-full max-w-6xl"><ClassFourReviewModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} presentationMode questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "natural-numbers-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><NaturalNumbersLessonModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} presentationMode questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "mental-add-sub-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><MentalAddSubLessonModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "mental-mul-div-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><MentalMulDivLessonModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "order-of-operations-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><OrderOfOperationsLessonModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "estimation-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><EstimationLessonModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "written-add-sub-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><WrittenAddSubLessonModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "written-multiplication-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><WrittenMultiplicationLessonModel seed={modelSeed} readOnly={!interactive} /></div>
      ) : stage.modelId === "written-story-problems-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><WrittenStoryProblemsLessonModel readOnly={!interactive} seed={modelSeed} /></div>
      ) : question ? (
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="font-mono font-black tabular-nums text-white [font-size:clamp(2rem,6vw,5rem)]">
            {question.expression}
          </p>
        </div>
      ) : null}

      {summary && summary.submittedCount > 0 ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Podsumowanie etapu</p>
          <p className="mt-2 text-lg text-slate-100">
            {summary.submittedCount}{" "}
            {summary.submittedCount === 1 ? "odpowiedź wysłana" : "odpowiedzi wysłanych"}
            {solutionRevealed && summary.correctCount !== null ? (
              <>
                {" "}
                · {summary.correctCount} poprawnych (
                {Math.round((summary.correctCount / Math.max(summary.submittedCount, 1)) * 100)}%)
              </>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-slate-500">Wyniki anonimowe — bez imion uczniów.</p>
        </div>
      ) : null}
    </div>
  );
}
