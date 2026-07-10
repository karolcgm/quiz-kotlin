import { OrderDirectorModel } from "@/components/lessons/models/OrderDirectorModel";
import { PlaceValueFactoryModel } from "@/components/lessons/models/PlaceValueFactoryModel";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { MultiplicationGridModel } from "@/components/lessons/models/MultiplicationGridModel";
import { DiagnosticStationsModel } from "@/components/lessons/models/DiagnosticStationsModel";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";
import { ClassFourReviewModel } from "@/components/lessons/models/ClassFourReviewModel";
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
  const revealSteps = stage.revealSteps ?? [];
  const revealIndex =
    solutionRevealed && revealSteps.length > 0 ? revealSteps.length - 1 : 0;
  const reveal = revealSteps[revealIndex];

  const headline = reveal?.boardHeadline ?? stage.boardHeadline ?? stage.title;
  const body = reveal?.boardBody ?? stage.boardBody;
  const hasSelfContainedVisual = stage.modelId === "class4-review" || stage.modelId === "place-value-factory" || stage.modelId === "diagnostic-stations" || stage.modelId === "exercise-board";

  const modelSeed =
    stage.modelSeed ??
    stage.modelSeedPool?.[0] ??
    stage.questions[0]?.seed ??
    1;
  const modelDifficulty = (stage.modelDifficulty ?? stage.questions[0]?.difficulty ?? "core") as LessonDifficulty;

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
          <ExerciseBoardModel seed={modelSeed} readOnly={!interactive} presentationMode />
        </div>
      ) : stage.modelId === "class4-review" ? (
        <div className="mx-auto w-full max-w-6xl"><ClassFourReviewModel seed={modelSeed} readOnly={!interactive} presentationMode /></div>
      ) : stage.questions[0] ? (
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="font-mono font-black tabular-nums text-white [font-size:clamp(2rem,6vw,5rem)]">
            {stage.questions[0].expression}
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
