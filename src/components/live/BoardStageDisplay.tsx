import { OrderDirectorModel } from "@/components/lessons/models/OrderDirectorModel";
import { PlaceValueFactoryModel } from "@/components/lessons/models/PlaceValueFactoryModel";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { MultiplicationGridModel } from "@/components/lessons/models/MultiplicationGridModel";
import { DiagnosticStationsModel } from "@/components/lessons/models/DiagnosticStationsModel";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";
import { ClassFourReviewModel } from "@/components/lessons/models/ClassFourReviewModel";
import { SectionOneReviewLessonModel } from "@/components/lessons/models/SectionOneReviewLessonModel";
import { NaturalNumbersLessonModel } from "@/components/lessons/models/NaturalNumbersLessonModel";
import { MentalAddSubLessonModel } from "@/components/lessons/models/MentalAddSubLessonModel";
import { MentalMulDivLessonModel } from "@/components/lessons/models/MentalMulDivLessonModel";
import { OrderOfOperationsLessonModel } from "@/components/lessons/models/OrderOfOperationsLessonModel";
import { EstimationLessonModel } from "@/components/lessons/models/EstimationLessonModel";
import { WrittenAddSubLessonModel } from "@/components/lessons/models/WrittenAddSubLessonModel";
import { WrittenMultiplicationLessonModel } from "@/components/lessons/models/WrittenMultiplicationLessonModel";
import { WrittenDivisionLessonModel } from "@/components/lessons/models/WrittenDivisionLessonModel";
import { WrittenStoryProblemsLessonModel } from "@/components/lessons/models/WrittenStoryProblemsLessonModel";
import { MultiplesLessonModel } from "@/components/lessons/models/MultiplesLessonModel";
import { DivisorsLessonModel } from "@/components/lessons/models/DivisorsLessonModel";
import { DivisibilityAnimalsLessonModel } from "@/components/lessons/models/DivisibilityAnimalsLessonModel";
import { PrimeCompositeLessonModel } from "@/components/lessons/models/PrimeCompositeLessonModel";
import { PrimeFactorizationLessonModel } from "@/components/lessons/models/PrimeFactorizationLessonModel";
import { GcdLcmFactorLessonModel } from "@/components/lessons/models/GcdLcmFactorLessonModel";
import { useState } from "react";
import Image from "next/image";
import type { BoardStageSummary, LessonBookwork, LessonSessionStageSnapshot } from "@/types/lessonSession";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface BoardStageDisplayProps {
  stage: LessonSessionStageSnapshot;
  stageIndex: number;
  stageCount: number;
  solutionRevealed: boolean;
  summary?: BoardStageSummary;
  interactive?: boolean;
  bookwork?: LessonBookwork;
  onBookworkChange?: (bookwork: LessonBookwork) => void;
}

export function BoardStageDisplay({
  stage,
  stageIndex,
  stageCount,
  solutionRevealed,
  summary,
  interactive = true,
  bookwork,
  onBookworkChange,
}: BoardStageDisplayProps) {
  const [questionSelection, setQuestionSelection] = useState({ stageId: stage.id, index: 0 });
  const questionIndex = questionSelection.stageId === stage.id ? questionSelection.index : 0;
  const selectQuestion = (index: number) => setQuestionSelection({ stageId: stage.id, index });
  const questionCount = stage.questions.length;
  const question = stage.questions[questionIndex] ?? stage.questions[0];
  const revealSteps = stage.revealSteps ?? [];
  const revealIndex =
    solutionRevealed && revealSteps.length > 0 ? revealSteps.length - 1 : 0;
  const reveal = revealSteps[revealIndex];

  const headline = reveal?.boardHeadline ?? stage.boardHeadline ?? stage.title;
  const body = reveal?.boardBody ?? stage.boardBody;
  const hasSelfContainedVisual = stage.modelId === "class4-review" || stage.modelId === "section-one-review-lesson" || stage.modelId === "natural-numbers-lesson" || stage.modelId === "mental-add-sub-lesson" || stage.modelId === "mental-mul-div-lesson" || stage.modelId === "order-of-operations-lesson" || stage.modelId === "estimation-lesson" || stage.modelId === "written-add-sub-lesson" || stage.modelId === "written-multiplication-lesson" || stage.modelId === "written-division-lesson" || stage.modelId === "written-story-problems-lesson" || stage.modelId === "multiples-lesson" || stage.modelId === "divisors-lesson" || stage.modelId === "divisibility-animals-lesson" || stage.modelId === "prime-composite-lesson" || stage.modelId === "prime-factorization-lesson" || stage.modelId === "gcd-lcm-factor-lesson" || stage.modelId === "place-value-factory" || stage.modelId === "diagnostic-stations" || stage.modelId === "exercise-board";

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

      {stage.illustrationSrc ? <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl"><Image src={stage.illustrationSrc} alt={stage.illustrationAlt ?? "Ilustracja do lekcji"} width={1536} height={1024} className="h-auto w-full object-cover" /></div> : null}

      {questionCount > 1 ? <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3"><button type="button" disabled={questionIndex===0} onClick={()=>selectQuestion(Math.max(0,questionIndex-1))} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm font-bold text-white disabled:opacity-40">← Poprzedni przykład</button><b className="rounded-xl bg-cyan-300 px-4 py-2 text-sm text-cyan-950">Przykład {questionIndex+1} z {questionCount}</b><button type="button" disabled={questionIndex===questionCount-1} onClick={()=>selectQuestion(Math.min(questionCount-1,questionIndex+1))} className="min-h-11 rounded-xl bg-white px-4 text-sm font-bold text-slate-950 disabled:opacity-40">Następny przykład →</button></div> : null}

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
          <ExerciseBoardModel seed={modelSeed} readOnly={!interactive} presentationMode lessonTitle={stage.lessonTitle} learningGoals={stage.learningGoals} initialPage={bookwork?.textbookPage} initialExercises={bookwork?.coveredExercises} onBookworkChange={onBookworkChange} />
        </div>
      ) : stage.modelId === "class4-review" ? (
        <div className="mx-auto w-full max-w-6xl"><ClassFourReviewModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} presentationMode questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "section-one-review-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><SectionOneReviewLessonModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionIndex+1} questionCount={questionCount}/></div>
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
        <div className="mx-auto w-full max-w-6xl"><WrittenMultiplicationLessonModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} /></div>
      ) : stage.modelId === "written-division-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><WrittenDivisionLessonModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} /></div>
      ) : stage.modelId === "written-story-problems-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><WrittenStoryProblemsLessonModel key={`${stage.id}-${modelSeed}`} readOnly={!interactive} seed={modelSeed} /></div>
      ) : stage.modelId === "multiples-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><MultiplesLessonModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} /></div>
      ) : stage.modelId === "divisors-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><DivisorsLessonModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} /></div>
      ) : stage.modelId === "divisibility-animals-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><DivisibilityAnimalsLessonModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} /></div>
      ) : stage.modelId === "prime-composite-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><PrimeCompositeLessonModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} /></div>
      ) : stage.modelId === "prime-factorization-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><PrimeFactorizationLessonModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} /></div>
      ) : stage.modelId === "gcd-lcm-factor-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><GcdLcmFactorLessonModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} /></div>
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
