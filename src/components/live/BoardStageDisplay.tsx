import { OrderDirectorModel } from "@/components/lessons/models/OrderDirectorModel";
import { PlaceValueFactoryModel } from "@/components/lessons/models/PlaceValueFactoryModel";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { MultiplicationGridModel } from "@/components/lessons/models/MultiplicationGridModel";
import { DiagnosticStationsModel } from "@/components/lessons/models/DiagnosticStationsModel";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";
import { GeometryLab, PlaneFiguresReviewLessonLab } from "@/components/lessons/geometry";
import { planeFiguresReviewActivityFromStageId } from "@/lib/math/geometry/planeFiguresReview";
import { CalendarTimeLessonLab } from "@/components/lessons/everyday/CalendarTimeLessonLab";
import { calendarTimeActivityFromStageId } from "@/lib/math/everyday/calendarTime";
import { MeasurementUnitsLessonLab } from "@/components/lessons/everyday/MeasurementUnitsLessonLab";
import { measurementUnitsActivityFromStageId } from "@/lib/math/everyday/measurementUnits";
import { MapScaleLessonLab } from "@/components/lessons/everyday/MapScaleLessonLab";
import { mapScaleActivityFromStageId } from "@/lib/math/everyday/mapScale";
import { RoundingLessonLab } from "@/components/lessons/everyday/RoundingLessonLab";
import { roundingActivityFromStageId } from "@/lib/math/everyday/rounding";
import { CalculatorLessonLab } from "@/components/lessons/everyday/CalculatorLessonLab";
import { calculatorActivityFromStageId } from "@/lib/math/everyday/calculator";
import { InformationReadingLessonLab } from "@/components/lessons/everyday/InformationReadingLessonLab";
import { informationReadingActivityFromStageId } from "@/lib/math/everyday/informationReading";
import { DistanceLessonLab } from "@/components/lessons/everyday/DistanceLessonLab";
import { distanceActivityFromStageId } from "@/lib/math/everyday/distance";
import { FractionLessonL1Model } from "@/components/lessons/fractions";
import { fractionLessonL1ActivityFromStageId } from "@/lib/math/fractions/fractionLessonL1";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals";
import { DecimalMentalArithmeticModel, decimalMentalActivityFromStageId } from "@/components/lessons/models/DecimalMentalArithmeticModel";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";
import { IntegerNumbersLessonLab, integerNumbersActivityFromStageId } from "@/components/lessons/models/IntegerNumbersLessonLab";
import { IntegerAddSubtractLessonLab, integerAddSubtractActivityFromStageId } from "@/components/lessons/models/IntegerAddSubtractLessonLab";
import { IntegerMulDivLessonLab, integerMulDivActivityFromStageId } from "@/components/lessons/models/IntegerMulDivLessonLab";
import { IntegerReviewLessonLab, integerReviewActivityFromStageId } from "@/components/lessons/models/IntegerReviewLessonLab";
import { AreaReviewLab, AreaUnitConversionLab, CompositeAreaLab, ParallelogramAreaLab, RectangleSquareAreaLab, RhombusAreaLab, TrapezoidAreaLab, TriangleAreaLab } from "@/components/lessons/area";
import { rectangleSquareAreaActivityFromStageId } from "@/lib/math/area/rectangleSquareArea";
import { areaUnitConversionActivityFromStageId } from "@/lib/math/area/unitConversion";
import { parallelogramAreaActivityFromStageId } from "@/lib/math/area/parallelogramArea";
import { rhombusAreaActivityFromStageId } from "@/lib/math/area/rhombusArea";
import { triangleAreaActivityFromStageId } from "@/lib/math/area/triangleArea";
import { trapezoidAreaActivityFromStageId } from "@/lib/math/area/trapezoidArea";
import { compositeAreaActivityFromStageId } from "@/lib/math/area/compositeArea";
import { areaReviewActivityFromStageId } from "@/lib/math/area/areaReview";
import { CuboidVolumeLab, cuboidVolumeActivityFromStageId, LitersMillilitersLab, litersMillilitersActivityFromStageId, VolumeReviewLab, volumeReviewActivityFromStageId, VolumeUnitsLab, volumeUnitsActivityFromStageId } from "@/components/lessons/volume";
import { CuboidCubeLessonLab, cuboidCubeActivityFromStageId, RightPrismLessonLab, rightPrismActivityFromStageId } from "@/components/lessons/solids";
import { AlgebraLessonLab } from "@/components/lessons/algebra";
import { algebraActivityFromStageId, algebraTopicNumberFromStageId } from "@/lib/math/algebra/grade6Algebra";
import { ClassFourReviewModel } from "@/components/lessons/models/ClassFourReviewModel";
import { SectionOneReviewLessonModel } from "@/components/lessons/models/SectionOneReviewLessonModel";
import { SectionTwoReviewLessonModel } from "@/components/lessons/models/SectionTwoReviewLessonModel";
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
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { useState } from "react";
import Image from "next/image";
import type { BoardStageSummary, BoardUnderstandingSummary, LessonBookwork, LessonSessionStageSnapshot } from "@/types/lessonSession";
import type { LessonDifficulty } from "@/types/lessonPackage";
import { sectionTaskEyebrow } from "@/lib/lessons/sectionTaskEyebrow";

interface BoardStageDisplayProps {
  stage: LessonSessionStageSnapshot;
  stageIndex: number;
  stageCount: number;
  solutionRevealed: boolean;
  summary?: BoardStageSummary;
  understandingSummary?: BoardUnderstandingSummary;
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
  understandingSummary,
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
  const hasSelfContainedVisual = stage.modelId === "class4-review" || stage.modelId === "section-one-review-lesson" || stage.modelId === "section-two-review-lesson" || stage.modelId === "natural-numbers-lesson" || stage.modelId === "mental-add-sub-lesson" || stage.modelId === "mental-mul-div-lesson" || stage.modelId === "order-of-operations-lesson" || stage.modelId === "estimation-lesson" || stage.modelId === "written-add-sub-lesson" || stage.modelId === "written-multiplication-lesson" || stage.modelId === "written-division-lesson" || stage.modelId === "written-story-problems-lesson" || stage.modelId === "multiples-lesson" || stage.modelId === "divisors-lesson" || stage.modelId === "divisibility-animals-lesson" || stage.modelId === "prime-composite-lesson" || stage.modelId === "prime-factorization-lesson" || stage.modelId === "gcd-lcm-factor-lesson" || stage.modelId === "place-value-factory" || stage.modelId === "number-line-jumps" || stage.modelId === "diagnostic-stations" || stage.modelId === "exercise-board" || stage.modelId === "geometry-lab" || stage.modelId === "plane-figures-review-lab" || stage.modelId === "calendar-time-lab" || stage.modelId === "everyday-units-lab" || stage.modelId === "map-scale-lab" || stage.modelId === "rounding-lab" || stage.modelId === "calculator-lab" || stage.modelId === "information-reading-lab" || stage.modelId === "distance-motion-lab" || stage.modelId === "fraction-lesson" || stage.modelId === "decimal-notation-l1" || stage.modelId === "decimal-mental-arithmetic-l6" || stage.modelId === "integer-numbers-lab" || stage.modelId === "integer-add-subtract-lab" || stage.modelId === "integer-mul-div-lab" || stage.modelId === "integer-review-lab" || stage.modelId === "rectangle-square-area-lab" || stage.modelId === "area-unit-conversion-lab" || stage.modelId === "parallelogram-area-lab" || stage.modelId === "rhombus-area-lab" || stage.modelId === "triangle-area-lab" || stage.modelId === "trapezoid-area-lab" || stage.modelId === "composite-area-lab" || stage.modelId === "area-review-lab" || stage.modelId === "volume-units-lab" || stage.modelId === "cuboid-volume-lab" || stage.modelId === "liters-milliliters-lab" || stage.modelId === "volume-review-lab" || stage.modelId === "algebra-expressions-lab";
  const unifiedTaskModel = stage.modelId === "cuboid-cube-lab" || stage.modelId === "geometry-lab" || stage.modelId === "plane-figures-review-lab" || stage.modelId === "calendar-time-lab" || stage.modelId === "everyday-units-lab" || stage.modelId === "map-scale-lab" || stage.modelId === "rounding-lab" || stage.modelId === "calculator-lab" || stage.modelId === "information-reading-lab" || stage.modelId === "distance-motion-lab" || stage.modelId === "fraction-lesson" || stage.modelId === "decimal-notation-l1" || stage.modelId === "integer-numbers-lab" || stage.modelId === "integer-add-subtract-lab" || stage.modelId === "integer-mul-div-lab" || stage.modelId === "integer-review-lab" || stage.modelId === "rectangle-square-area-lab" || stage.modelId === "area-unit-conversion-lab" || stage.modelId === "parallelogram-area-lab" || stage.modelId === "rhombus-area-lab" || stage.modelId === "triangle-area-lab" || stage.modelId === "trapezoid-area-lab" || stage.modelId === "composite-area-lab" || stage.modelId === "area-review-lab" || stage.modelId === "volume-units-lab" || stage.modelId === "cuboid-volume-lab" || stage.modelId === "liters-milliliters-lab" || stage.modelId === "volume-review-lab" || stage.modelId === "algebra-expressions-lab";
  const sectionNumber = /^m5-([3-8])-/u.exec(stage.id)?.[1];

  const modelSeed =
    (stage.modelId === "geometry-lab" ? question?.seed : undefined) ??
    stage.modelSeed ??
    stage.modelSeedPool?.[0] ??
    question?.seed ??
    1;
  const modelDifficulty = (stage.modelDifficulty ?? question?.difficulty ?? "core") as LessonDifficulty;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
      <header className={`space-y-3 text-center ${hasSelfContainedVisual || stage.modelId === "cuboid-cube-lab" || stage.modelId === "right-prism-lab" ? "sr-only" : ""}`}>
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

      {questionCount > 1 ? <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3"><button type="button" disabled={questionIndex===0} onClick={()=>selectQuestion(Math.max(0,questionIndex-1))} className="min-h-10 rounded-xl border border-white/20 px-3 text-sm font-bold text-white disabled:opacity-40">← Poprzednie</button>{unifiedTaskModel ? null : <b className="rounded-xl bg-cyan-300 px-4 py-2 text-sm text-cyan-950">Przykład {questionIndex+1} z {questionCount}</b>}<button type="button" disabled={questionIndex===questionCount-1} onClick={()=>selectQuestion(Math.min(questionCount-1,questionIndex+1))} className="min-h-10 rounded-xl bg-white px-3 text-sm font-bold text-slate-950 disabled:opacity-40">Następne →</button></div> : null}

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
          <NumberLineJumpsModel key={question?.questionInstanceId ?? `${stage.id}-${questionIndex}`} seed={modelSeed} taskSeed={question?.seed} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} readOnly={!interactive} />
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
          <ExerciseBoardModel seed={modelSeed} readOnly={!interactive} presentationMode lessonTitle={stage.lessonTitle} lessonMetric={stage.lessonMetric} lessonTiming={stage.lessonTiming} curriculumCodes={stage.curriculumCodes} learningGoals={stage.learningGoals} initialPage={bookwork?.textbookPage} initialExercises={bookwork?.coveredExercises} onBookworkChange={onBookworkChange} />
        </div>
      ) : stage.modelId === "geometry-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <GeometryLab seed={modelSeed} mode="demo" readOnly={!interactive} questionNumber={question ? questionIndex + 1 : undefined} questionCount={question ? questionCount : undefined} />
        </div>
      ) : stage.modelId === "plane-figures-review-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <PlaneFiguresReviewLessonLab activity={planeFiguresReviewActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "calendar-time-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <CalendarTimeLessonLab activity={calendarTimeActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "everyday-units-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <MeasurementUnitsLessonLab activity={measurementUnitsActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "map-scale-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <MapScaleLessonLab activity={mapScaleActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "rounding-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <RoundingLessonLab activity={roundingActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "calculator-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <CalculatorLessonLab key={stage.id} slideId={stage.id} activity={calculatorActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "information-reading-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <InformationReadingLessonLab key={stage.id} slideId={stage.id} activity={informationReadingActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "distance-motion-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <DistanceLessonLab key={stage.id} activity={distanceActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "fraction-lesson" ? (
        <div className="mx-auto w-full max-w-6xl">
          <FractionLessonL1Model
            key={question?.questionInstanceId ?? stage.id}
            activity={fractionLessonL1ActivityFromStageId(stage.id)}
            seed={modelSeed}
            taskSeed={question?.seed}
            difficulty={modelDifficulty}
            readOnly={!interactive}
            teacherNavigationMode
            questionNumber={question ? questionIndex + 1 : undefined}
            questionCount={question ? questionCount : undefined}
          />
        </div>
      ) : stage.modelId === "decimal-notation-l1" ? (
        <div className="mx-auto w-full max-w-6xl">
          <DecimalNotationL1Lab
            key={question?.questionInstanceId ?? stage.id}
            activity={decimalNotationL1ActivityFromStageId(stage.id)}
            seed={modelSeed}
            taskSeed={question?.seed}
            difficulty={modelDifficulty}
            readOnly={!interactive}
            presentationMode
            questionNumber={question ? questionIndex + 1 : undefined}
            questionCount={question ? questionCount : undefined}
          />
        </div>
      ) : stage.modelId === "decimal-mental-arithmetic-l6" ? (
        <div className="mx-auto w-full max-w-6xl"><DecimalMentalArithmeticModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} activity={decimalMentalActivityFromStageId(stage.id)} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={question ? questionIndex + 1 : undefined} questionCount={question ? questionCount : undefined} /></div>
      ) : stage.modelId === "integer-numbers-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <IntegerNumbersLessonLab key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} activity={integerNumbersActivityFromStageId(stage.id)} taskSeed={question?.seed} questionNumber={question ? questionIndex + 1 : undefined} questionCount={question ? questionCount : undefined} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "integer-add-subtract-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <IntegerAddSubtractLessonLab key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} activity={integerAddSubtractActivityFromStageId(stage.id)} taskSeed={question?.seed} questionNumber={question ? questionIndex + 1 : undefined} questionCount={question ? questionCount : undefined} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "integer-mul-div-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <IntegerMulDivLessonLab key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} activity={integerMulDivActivityFromStageId(stage.id)} taskSeed={question?.seed} questionNumber={question ? questionIndex + 1 : undefined} questionCount={question ? questionCount : undefined} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "integer-review-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <IntegerReviewLessonLab key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} activity={integerReviewActivityFromStageId(stage.id)} taskSeed={question?.seed} questionNumber={question ? questionIndex + 1 : undefined} questionCount={question ? questionCount : undefined} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "rectangle-square-area-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <RectangleSquareAreaLab activity={rectangleSquareAreaActivityFromStageId(stage.id)} readOnly={!interactive} presentationMode />
        </div>
      ) : stage.modelId === "area-unit-conversion-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <AreaUnitConversionLab activity={areaUnitConversionActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "parallelogram-area-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <ParallelogramAreaLab activity={parallelogramAreaActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "rhombus-area-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <RhombusAreaLab activity={rhombusAreaActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "triangle-area-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <TriangleAreaLab activity={triangleAreaActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "trapezoid-area-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <TrapezoidAreaLab activity={trapezoidAreaActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "composite-area-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <CompositeAreaLab activity={compositeAreaActivityFromStageId(stage.id)} readOnly={!interactive} allowFreeNavigation />
        </div>
      ) : stage.modelId === "area-review-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <AreaReviewLab activity={areaReviewActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "volume-units-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <VolumeUnitsLab key={`${stage.id}-${modelSeed}`} activity={volumeUnitsActivityFromStageId(stage.id)} readOnly={!interactive} eyebrow={sectionTaskEyebrow(stage.id) ?? undefined} useSpatialModel={stage.id.startsWith("m6-9-5-")} />
        </div>
      ) : stage.modelId === "cuboid-volume-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <CuboidVolumeLab key={`${stage.id}-${modelSeed}`} activity={cuboidVolumeActivityFromStageId(stage.id)} readOnly={!interactive} eyebrow={sectionTaskEyebrow(stage.id) ?? undefined} />
        </div>
      ) : stage.modelId === "liters-milliliters-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <LitersMillilitersLab key={`${stage.id}-${modelSeed}`} activity={litersMillilitersActivityFromStageId(stage.id)} readOnly={!interactive} eyebrow={sectionTaskEyebrow(stage.id) ?? undefined} />
        </div>
      ) : stage.modelId === "volume-review-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <VolumeReviewLab key={`${stage.id}-${modelSeed}`} activity={volumeReviewActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "cuboid-cube-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <CuboidCubeLessonLab key={`${stage.id}-${modelSeed}`} activity={cuboidCubeActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "right-prism-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <RightPrismLessonLab key={`${stage.id}-${modelSeed}`} activity={rightPrismActivityFromStageId(stage.id)} readOnly={!interactive} />
        </div>
      ) : stage.modelId === "algebra-expressions-lab" ? (
        <div className="mx-auto w-full max-w-6xl">
          <AlgebraLessonLab key={question?.questionInstanceId ?? stage.id} activity={algebraActivityFromStageId(stage.id)} topicNumber={algebraTopicNumberFromStageId(stage.id)} seed={modelSeed} taskSeed={question?.seed} difficulty={modelDifficulty} readOnly={!interactive} presentationMode questionNumber={question ? questionIndex + 1 : undefined} questionCount={question ? questionCount : undefined} />
        </div>
      ) : stage.modelId === "class4-review" ? (
        <div className="mx-auto w-full max-w-6xl"><ClassFourReviewModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} presentationMode questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "section-one-review-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><SectionOneReviewLessonModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionIndex+1} questionCount={questionCount}/></div>
      ) : stage.modelId === "section-two-review-lesson" ? (
        <div className="mx-auto w-full max-w-6xl"><SectionTwoReviewLessonModel key={question?.questionInstanceId} seed={modelSeed} taskSeed={question?.seed} readOnly={!interactive} questionNumber={questionIndex+1} questionCount={questionCount}/></div>
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
        <div className="mx-auto w-full max-w-6xl"><WrittenStoryProblemsLessonModel key={question?.questionInstanceId ?? `${stage.id}-${modelSeed}`} readOnly={!interactive} seed={modelSeed} taskSeed={question?.seed} questionNumber={questionCount > 0 ? questionIndex + 1 : undefined} questionCount={questionCount || undefined} /></div>
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
      ) : question ? sectionNumber ? (
        <LessonTaskFrame eyebrow={sectionTaskEyebrow(stage.id) ?? `Dział ${sectionNumber}`} heading={headline} description={question.prompt || body} questionNumber={questionIndex + 1} questionCount={questionCount} className="mx-auto w-full max-w-3xl">
          <p className="text-center font-mono font-black tabular-nums text-slate-950 [font-size:clamp(2rem,6vw,5rem)]">
            {question.expression}
          </p>
        </LessonTaskFrame>
      ) : (
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center"><p className="font-mono font-black tabular-nums text-white [font-size:clamp(2rem,6vw,5rem)]">{question.expression}</p></div>
      ) : null}

      {stage.kind === "understanding" || stage.understanding ? (
        <section className="mx-auto w-full max-w-4xl rounded-3xl border border-white/15 bg-white/5 p-6 text-white" aria-label="Anonimowy rozkład samooceny klasy">
          <p className="text-center text-sm font-black uppercase tracking-[.18em] text-indigo-300">Anonimowy widok klasy</p>
          <h2 className="mt-2 text-center text-2xl font-black">Jak klasa ocenia swoje zrozumienie?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-center"><span className="text-3xl" aria-hidden>✓</span><strong className="mt-2 block text-3xl">{understandingSummary?.understoodCount ?? 0}</strong><span className="text-sm font-bold">Umiem samodzielnie</span></div>
            <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-center"><span className="text-3xl" aria-hidden>💡</span><strong className="mt-2 block text-3xl">{understandingSummary?.partialCount ?? 0}</strong><span className="text-sm font-bold">Potrzebuję jednej wskazówki</span></div>
            <div className="rounded-2xl border border-orange-300/30 bg-orange-400/10 p-4 text-center"><span className="text-3xl" aria-hidden>👥</span><strong className="mt-2 block text-3xl">{understandingSummary?.notUnderstoodCount ?? 0}</strong><span className="text-sm font-bold">Potrzebuję wspólnego przykładu</span></div>
          </div>
          <p className="mt-4 text-center text-sm text-slate-300">Odpowiedziało {understandingSummary?.submittedCount ?? 0} osób. Bez nazwisk i indywidualnych punktów.</p>
        </section>
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
