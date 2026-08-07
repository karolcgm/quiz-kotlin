"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StudentSessionActivityBlock } from "@/components/live/StudentSessionActivityBlock";
import { StudentClassFourReviewActivity } from "@/components/live/StudentClassFourReviewActivity";
import { StudentNaturalNumbersActivity } from "@/components/live/StudentNaturalNumbersActivity";
import { StudentMentalAddSubActivity } from "@/components/live/StudentMentalAddSubActivity";
import { StudentNumberLineJumpsActivity } from "@/components/live/StudentNumberLineJumpsActivity";
import { StudentDecimalMentalArithmeticActivity } from "@/components/live/StudentDecimalMentalArithmeticActivity";
import { StudentMentalMulDivActivity } from "@/components/live/StudentMentalMulDivActivity";
import { StudentOrderOfOperationsActivity } from "@/components/live/StudentOrderOfOperationsActivity";
import { StudentLessonModelActivity } from "@/components/live/StudentLessonModelActivity";
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
import { Grade4AddSubLessonLab, grade4AddSubActivityFromStageId } from "@/components/lessons/models/Grade4AddSubLessonLab";
import { Grade4MoreLessLessonLab, grade4MoreLessActivityFromStageId } from "@/components/lessons/models/Grade4MoreLessLessonLab";
import { Grade4MulDivLessonLab, grade4MulDivActivityFromStageId } from "@/components/lessons/models/Grade4MulDivLessonLab";
import { SectionOneReviewLessonModel } from "@/components/lessons/models/SectionOneReviewLessonModel";
import { SectionTwoReviewLessonModel } from "@/components/lessons/models/SectionTwoReviewLessonModel";
import { PlaceValueFactoryModel } from "@/components/lessons/models/PlaceValueFactoryModel";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { MultiplicationGridModel } from "@/components/lessons/models/MultiplicationGridModel";
import { DiagnosticStationsModel } from "@/components/lessons/models/DiagnosticStationsModel";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";
import { GeometryLab } from "@/components/lessons/geometry";
import { FractionLessonL1Model } from "@/components/lessons/fractions";
import { fractionLessonL1ActivityFromStageId } from "@/lib/math/fractions/fractionLessonL1";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";
import { IntegerNumbersLessonLab, integerNumbersActivityFromStageId } from "@/components/lessons/models/IntegerNumbersLessonLab";
import { IntegerAddSubtractLessonLab, integerAddSubtractActivityFromStageId } from "@/components/lessons/models/IntegerAddSubtractLessonLab";
import { IntegerMulDivLessonLab, integerMulDivActivityFromStageId } from "@/components/lessons/models/IntegerMulDivLessonLab";
import { IntegerReviewLessonLab, integerReviewActivityFromStageId } from "@/components/lessons/models/IntegerReviewLessonLab";
import { AreaReviewLab, AreaUnitConversionLab, CompositeAreaLab, ParallelogramAreaLab, RectangleSquareAreaLab, RhombusAreaLab, TrapezoidAreaLab, TriangleAreaLab } from "@/components/lessons/area";
import { CuboidVolumeLab, cuboidVolumeActivityFromStageId, LitersMillilitersLab, litersMillilitersActivityFromStageId, VolumeUnitsLab, volumeUnitsActivityFromStageId } from "@/components/lessons/volume";
import { CuboidCubeLessonLab, cuboidCubeActivityFromStageId, PrismNetsLessonLab, prismNetsActivityFromStageId, PrismSurfaceAreaLessonLab, prismSurfaceAreaActivityFromStageId, PrismVolumeLessonLab, prismVolumeActivityFromStageId, PyramidLessonLab, pyramidActivityFromStageId, RightPrismLessonLab, rightPrismActivityFromStageId, SolidRecognitionLessonLab, SolidReviewLessonLab, solidReviewActivityFromStageId } from "@/components/lessons/solids";
import { rectangleSquareAreaActivityFromStageId } from "@/lib/math/area/rectangleSquareArea";
import { areaUnitConversionActivityFromStageId } from "@/lib/math/area/unitConversion";
import { parallelogramAreaActivityFromStageId } from "@/lib/math/area/parallelogramArea";
import { rhombusAreaActivityFromStageId } from "@/lib/math/area/rhombusArea";
import { triangleAreaActivityFromStageId } from "@/lib/math/area/triangleArea";
import { trapezoidAreaActivityFromStageId } from "@/lib/math/area/trapezoidArea";
import { compositeAreaActivityFromStageId } from "@/lib/math/area/compositeArea";
import { areaReviewActivityFromStageId } from "@/lib/math/area/areaReview";
import { DistanceLessonLab } from "@/components/lessons/everyday/DistanceLessonLab";
import { distanceActivityFromStageId } from "@/lib/math/everyday/distance";
import { AlgebraLessonLab } from "@/components/lessons/algebra";
import { algebraActivityFromStageId, algebraTopicNumberFromStageId } from "@/lib/math/algebra/grade6Algebra";
import { Card } from "@/components/ui/Card";
import { LiveUnderstandingCheck } from "@/components/live/LiveUnderstandingCheck";
import {
  LessonAccessibilityControls,
  LessonRuntimeAccessibilityProvider,
  LessonStageFocusRegion,
} from "@/components/lessons/LessonRuntimeAccessibility";
import { findSubmittedResponse, isStageInteractive } from "@/lib/live/studentView";
import { buildUnderstandingAssessment } from "@/lib/lessons/understandingAssessment";
import { sectionTaskEyebrow } from "@/lib/lessons/sectionTaskEyebrow";
import { useStudentSessionSync, type StudentConnectionState } from "@/lib/live/useStudentSessionSync";
import type { LessonSessionStageQuestion, LessonSessionStudentView } from "@/types/lessonSession";
import type { UnderstandingLevel } from "@/types/understanding";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface StudentSessionClientProps {
  sessionId: string;
  initialView: LessonSessionStudentView;
  initialUnderstanding?: UnderstandingLevel | null;
}

const CONNECTION_LABELS: Record<StudentConnectionState, string> = {
  live: "Połączono",
  syncing: "Synchronizacja…",
  offline: "Offline",
};

const SCORED_SOLID_MODEL_IDS = new Set([
  "volume-units-lab",
  "cuboid-volume-lab",
  "liters-milliliters-lab",
  "cuboid-cube-lab",
  "right-prism-lab",
  "prism-nets-lab",
  "prism-surface-area-lab",
  "prism-volume-lab",
  "pyramid-lab",
  "solid-recognition-lab",
  "solid-review-lab",
]);

function pickActiveQuestion(view: LessonSessionStudentView, preferredIndex?: number): LessonSessionStageQuestion | null {
  const stage = view.activeStage;
  if (!stage || stage.questions.length === 0) return null;

  const preferred = preferredIndex === undefined ? undefined : stage.questions[preferredIndex];
  if (preferred && !findSubmittedResponse(view, stage.id, preferred.questionInstanceId)) return preferred;

  const unsubmitted = stage.questions.find(
    (item) => !findSubmittedResponse(view, stage.id, item.questionInstanceId),
  );
  return unsubmitted ?? stage.questions[0] ?? null;
}

export function StudentSessionClient({ sessionId, initialView, initialUnderstanding = null }: StudentSessionClientProps) {
  const { view, connection, refresh } = useStudentSessionSync(sessionId, initialView);
  const [understanding, setUnderstanding] = useState<UnderstandingLevel | null>(initialUnderstanding);
  const [questionCursor, setQuestionCursor] = useState<Record<string, number>>({});
  const stage = view.activeStage;
  const question = pickActiveQuestion(view, stage ? questionCursor[stage.id] : undefined);
  const stageId = stage?.id ?? "";
  const assessment = useMemo(() => {
    const config = stage?.understanding;
    if (!config) return undefined;
    const evidence = view.myResponses.flatMap((response) => {
      if (response.stageId !== config.evidenceStageId || response.maxScore === undefined || response.score === undefined) return [];
      const configured = config.evidenceItems.find((item) => item.id === response.questionInstanceId);
      return [{
        evidenceId: response.questionInstanceId,
        skillIds: configured?.skillIds ?? view.activeStage?.understanding?.criteria.map((criterion) => criterion.skillId) ?? [],
        score: response.score,
        maxScore: response.maxScore,
        source: "live" as const,
      }];
    });
    return buildUnderstandingAssessment(config, evidence);
  }, [stage?.understanding, view.activeStage?.understanding?.criteria, view.myResponses]);

  const submitted = question
    ? findSubmittedResponse(view, stageId, question.questionInstanceId)
    : undefined;
  const selectedQuestionIndex = stage && question
    ? Math.max(0, stage.questions.findIndex((item) => item.questionInstanceId === question.questionInstanceId))
    : 0;
  const questionNumber = selectedQuestionIndex + 1;

  const interactive = isStageInteractive(stage);

  const waitingMessage = useMemo(() => {
    if (view.status === "ended") return "Lekcja została zakończona.";
    if (view.status === "lobby") return "Czekaj — nauczyciel zaraz rozpocznie lekcję.";
    if (view.status === "paused") return "Poczekaj na nauczyciela — lekcja jest wstrzymana.";
    if (view.boardOnlyMode) return "Nauczyciel prowadzi lekcję tylko na tablicy. Obserwuj ekran w sali.";
    if (!interactive) return "Patrz na tablicę — na tym etapie pracujecie wspólnie.";
    return null;
  }, [interactive, view.boardOnlyMode, view.status]);

  const showActivity =
    view.status === "live" &&
    !view.boardOnlyMode &&
    interactive &&
    question !== null &&
    question.generatorId === "order-director-v1";
  const showCompanionActivity =
    view.status === "live" &&
    !view.boardOnlyMode &&
    !showActivity &&
    ((stage?.studentModelId === "grade4-mul-div-lab" && question === null) ||
      (stage?.studentModelId === "grade4-more-less-lab" && question === null) ||
      (stage?.studentModelId === "grade4-add-sub-lab" && question === null) ||
      stage?.studentModelId === "place-value-factory" ||
      (stage?.studentModelId === "number-line-jumps" && question === null) ||
      stage?.studentModelId === "multiplication-grid" ||
      stage?.studentModelId === "diagnostic-stations" ||
      stage?.studentModelId === "geometry-lab" ||
      (stage?.studentModelId === "fraction-lesson" && question === null) ||
      (stage?.studentModelId === "decimal-notation-l1" && question === null) ||
      (stage?.studentModelId === "rectangle-square-area-lab" && question === null) ||
      (stage?.studentModelId === "area-unit-conversion-lab" && question === null) ||
      (stage?.studentModelId === "parallelogram-area-lab" && question === null) ||
      (stage?.studentModelId === "rhombus-area-lab" && question === null) ||
      (stage?.studentModelId === "triangle-area-lab" && question === null) ||
      (stage?.studentModelId === "trapezoid-area-lab" && question === null) ||
      (stage?.studentModelId === "composite-area-lab" && question === null) ||
      (stage?.studentModelId === "area-review-lab" && question === null) ||
      (stage?.studentModelId === "distance-motion-lab" && question === null) ||
      (stage?.studentModelId === "cuboid-cube-lab" && question === null) ||
      (stage?.studentModelId === "right-prism-lab" && question === null) ||
      (stage?.studentModelId === "prism-nets-lab" && question === null) ||
      (stage?.studentModelId === "prism-surface-area-lab" && question === null) ||
      (stage?.studentModelId === "prism-volume-lab" && question === null) ||
      (stage?.studentModelId === "pyramid-lab" && question === null) ||
      (stage?.studentModelId === "solid-recognition-lab" && question === null) ||
      (stage?.studentModelId === "solid-review-lab" && question === null) ||
      (stage?.studentModelId === "integer-review-lab" && question === null) ||
      (stage?.studentModelId === "algebra-expressions-lab" && question === null) ||
      stage?.modelId === "exercise-board");
  const showClassFourReview =
    view.status === "live" &&
    !view.boardOnlyMode &&
    stage?.studentModelId === "class4-review" &&
    question?.generatorId === "class4-review-v1";
  const showSectionOneReview =
    view.status === "live" &&
    !view.boardOnlyMode &&
    stage?.studentModelId === "section-one-review-lesson" &&
    question?.generatorId === "section-one-review-v1";
  const showSectionTwoReview =
    view.status === "live" &&
    !view.boardOnlyMode &&
    stage?.studentModelId === "section-two-review-lesson" &&
    question?.generatorId === "section-two-review-v1";
  const showNaturalNumbers =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "natural-numbers-lesson" && question?.generatorId === "natural-numbers-v1";
  const showMentalAddSub =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "mental-add-sub-lesson" && question?.generatorId === "mental-add-sub-v1";
  const showGrade4AddSub =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "grade4-add-sub-lab" && question?.generatorId === "grade4-add-sub-l1-v1";
  const showGrade4MoreLess =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "grade4-more-less-lab" && question?.generatorId === "grade4-more-less-l1-v1";
  const showGrade4MulDiv =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "grade4-mul-div-lab" && question?.generatorId === "grade4-mul-div-l1-v1";
  const showNumberLineJumps =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "number-line-jumps" && question?.generatorId === "number-line-jumps-v1";
  const showDecimalMentalArithmetic = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "decimal-mental-arithmetic-l6" && question?.generatorId === "decimal-mental-l6-v1";
  const showMentalMulDiv =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "mental-mul-div-lesson" && question?.generatorId === "mental-mul-div-v1";
  const showOrderOfOperations =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "order-of-operations-lesson" && question?.generatorId === "order-of-operations-v1";
  const showEstimation = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "estimation-lesson" && question?.generatorId === "estimation-v1";
  const showWrittenAddSub = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "written-add-sub-lesson" && question?.generatorId === "written-add-sub-v1";
  const showWrittenMultiplication = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "written-multiplication-lesson" && question?.generatorId === "written-multiplication-v1";
  const showWrittenDivision = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "written-division-lesson" && question?.generatorId === "written-division-v1";
  const showWrittenStoryProblem = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "written-story-problems-lesson" && question?.generatorId === "written-story-problems-v1";
  const showMultiples = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "multiples-lesson" && question?.generatorId === "multiples-v1";
  const showDivisors = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "divisors-lesson" && question?.generatorId === "divisors-v1";
  const showDivisibilityAnimals = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "divisibility-animals-lesson" && question?.generatorId === "divisibility-animals-v1";
  const showPrimeComposite = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "prime-composite-lesson" && question?.generatorId === "prime-composite-v1";
  const showPrimeFactorization = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "prime-factorization-lesson" && question?.generatorId === "prime-factorization-v1";
  const showGcdLcmFactor = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "gcd-lcm-factor-lesson" && question?.generatorId === "gcd-lcm-factor-v1";
  const showFractionLesson = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "fraction-lesson" && question?.generatorId === "fraction-lesson-l1-v1";
  const showDecimalNotationL1 = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "decimal-notation-l1" && question?.generatorId === "decimal-notation-l1-v1";
  const showDistanceMotion = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "distance-motion-lab" && question !== null;
  const showScoredSolid = view.status === "live"
    && !view.boardOnlyMode
    && question?.generatorId === "interactive-lesson-series-v1"
    && Boolean(stage?.studentModelId && SCORED_SOLID_MODEL_IDS.has(stage.studentModelId));
  const showIntegerNumbers = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "integer-numbers-lab" && question?.generatorId === "integer-numbers-l1-v1";
  const showIntegerAddSubtract = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "integer-add-subtract-lab" && question?.generatorId === "integer-add-subtract-l1-v1";
  const showIntegerMulDiv = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "integer-mul-div-lab" && question?.generatorId === "integer-mul-div-l1-v1";
  const showIntegerReview = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "integer-review-lab" && question?.generatorId === "integer-review-l1-v1";
  const showAlgebra = view.status === "live" && !view.boardOnlyMode && stage?.studentModelId === "algebra-expressions-lab" && question?.generatorId === "algebra-expressions-l1-v1";
  const showLiveUnderstanding =
    view.status === "live" &&
    !view.boardOnlyMode &&
    stage?.liveKind === "quick-check" &&
    stage.questions.length === 0 &&
    (stage.kind === "understanding" || stage.id.endsWith("-understanding"));

  const activityKey = `${stageId}:${question?.questionInstanceId ?? "none"}`;

  return (
    <LessonRuntimeAccessibilityProvider>
    <LessonStageFocusRegion
      stageKey={stageId || view.status}
      announcement={stage ? `Etap ${view.activeStageIndex + 1} z ${view.stageCount}: ${stage.title}` : view.lessonTitle}
    >
    <div className="student-session mx-auto flex w-full max-w-2xl flex-col gap-4 pb-8">
      <header className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:min-h-16">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--ink)]">{view.lessonTitle}</p>
            <p className="text-xs text-[var(--ink-muted)]">
              {view.topicId} · etap {view.activeStageIndex + 1}/{view.stageCount}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              connection === "live"
                ? "bg-emerald-50 text-emerald-800"
                : connection === "syncing"
                  ? "bg-amber-50 text-amber-800"
                  : "bg-rose-50 text-rose-800"
            }`}
            role="status"
          >
            {CONNECTION_LABELS[connection]}
          </span>
        </div>
        <LessonAccessibilityControls className="mt-2 justify-end text-slate-800" />
      </header>

      {connection === "offline" ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          Brak połączenia — zachowujemy Twój zapis lokalny. Przywracamy synchronizację…
        </p>
      ) : null}

      {view.status === "live" && !view.boardOnlyMode && view.topicId.startsWith("M6-") && stage && stage.questions.length > 1 ? (
        <Card className="border-indigo-100 bg-indigo-50/90">
          <p className="text-center text-xs font-black uppercase tracking-[.16em] text-indigo-700">Wybierz zadanie</p>
          <nav aria-label="Zadania na slajdzie" className="mt-3 flex flex-wrap justify-center gap-2">
            {stage.questions.map((item, index) => {
              const answered = Boolean(findSubmittedResponse(view, stage.id, item.questionInstanceId));
              const active = item.questionInstanceId === question?.questionInstanceId;
              return (
                <button
                  key={item.questionInstanceId}
                  type="button"
                  aria-current={active ? "step" : undefined}
                  disabled={answered}
                  onClick={() => setQuestionCursor((current) => ({ ...current, [stage.id]: index }))}
                  className={`grid h-11 min-w-11 place-items-center rounded-xl px-3 font-black transition ${active ? "bg-indigo-700 text-white ring-4 ring-indigo-200" : answered ? "bg-emerald-100 text-emerald-900" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
                >
                  {answered ? `✓ ${index + 1}` : index + 1}
                </button>
              );
            })}
          </nav>
        </Card>
      ) : null}

      {view.status === "ended" ? (
        <div className="space-y-4">
          <Card className="space-y-2 text-center">
            <h2 className="text-xl font-bold text-slate-900">Lekcja zakończona</h2>
            <p className="text-sm text-slate-600">Zanim zobaczysz wynik, wykonaj obowiązkowy ostatni krok.</p>
          </Card>
          <LiveUnderstandingCheck sessionId={sessionId} initialValue={understanding} assessment={assessment} onSaved={setUnderstanding} />
          {understanding ? <div className="flex flex-wrap justify-center gap-2"><Link href={`/uczen/sesja/${sessionId}/podsumowanie`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white">Moje podsumowanie</Link><Link href="/uczen" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800">Panel ucznia</Link></div> : null}
        </div>
      ) : waitingMessage && !showActivity && !showCompanionActivity && !showGrade4MulDiv && !showGrade4MoreLess && !showGrade4AddSub && !showClassFourReview && !showSectionOneReview && !showSectionTwoReview && !showNaturalNumbers && !showMentalAddSub && !showNumberLineJumps && !showMentalMulDiv && !showOrderOfOperations && !showEstimation && !showWrittenAddSub && !showWrittenMultiplication && !showWrittenDivision && !showWrittenStoryProblem && !showMultiples && !showDivisors && !showDivisibilityAnimals && !showPrimeComposite && !showPrimeFactorization && !showGcdLcmFactor && !showFractionLesson && !showDecimalNotationL1 && !showDistanceMotion && !showScoredSolid && !showIntegerNumbers && !showIntegerAddSubtract && !showIntegerMulDiv && !showIntegerReview && !showAlgebra && !showLiveUnderstanding ? (
        <Card className="space-y-2 py-8 text-center">
          <p className="text-lg font-semibold text-slate-900">{stage?.title ?? "Lekcja"}</p>
          <p className="text-sm leading-relaxed text-slate-600">{waitingMessage}</p>
          {stage?.studentInstruction ? (
            <p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900">{stage.studentInstruction}</p>
          ) : null}
        </Card>
      ) : null}

      {showLiveUnderstanding ? (
        <LiveUnderstandingCheck sessionId={sessionId} initialValue={understanding} assessment={assessment} onSaved={setUnderstanding} />
      ) : null}

      {showActivity && question ? (
        <StudentSessionActivityBlock
          key={activityKey}
          sessionId={sessionId}
          stageId={stageId}
          stageTitle={stage?.title ?? "Zadanie"}
          stageInstruction={stage?.studentInstruction}
          question={question}
          submitted={submitted}
          helpStatus={view.helpStatus}
          onRefresh={refresh}
        />
      ) : null}

      {showCompanionActivity && stage ? (
        <Card className="space-y-4 overflow-hidden p-3 sm:p-5">
          <div className="rounded-2xl bg-indigo-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Ćwiczenie na moim tablecie</p>
            <p className="mt-1 text-sm text-indigo-950">{stage.studentInstruction ?? "Pracuj własnym tempem, a potem porównaj sposób z klasą."}</p>
          </div>
          {stage.studentModelId === "grade4-mul-div-lab" ? (
            <Grade4MulDivLessonLab activity={grade4MulDivActivityFromStageId(stage.id)} readOnly />
          ) : null}
          {stage.studentModelId === "grade4-more-less-lab" ? (
            <Grade4MoreLessLessonLab activity={grade4MoreLessActivityFromStageId(stage.id)} readOnly />
          ) : null}
          {stage.studentModelId === "grade4-add-sub-lab" ? (
            <Grade4AddSubLessonLab activity={grade4AddSubActivityFromStageId(stage.id)} readOnly />
          ) : null}
          {stage.studentModelId === "place-value-factory" ? (
            <PlaceValueFactoryModel seed={stage.studentModelSeed ?? stage.studentModelSeedPool?.[0] ?? 1} />
          ) : null}
          {stage.studentModelId === "number-line-jumps" ? (
            <NumberLineJumpsModel seed={stage.studentModelSeed ?? stage.studentModelSeedPool?.[0] ?? 1} />
          ) : null}
          {stage.studentModelId === "multiplication-grid" ? (
            <MultiplicationGridModel seed={stage.studentModelSeed ?? stage.studentModelSeedPool?.[0] ?? 1} />
          ) : null}
          {stage.studentModelId === "diagnostic-stations" ? (
            <DiagnosticStationsModel seed={stage.studentModelSeed ?? stage.studentModelSeedPool?.[0] ?? 1} />
          ) : null}
          {stage.studentModelId === "geometry-lab" ? (
            <GeometryLab seed={stage.studentModelSeed ?? stage.studentModelSeedPool?.[0] ?? 1} mode="practice" />
          ) : null}
          {stage.studentModelId === "fraction-lesson" ? (
            <FractionLessonL1Model
              activity={fractionLessonL1ActivityFromStageId(stage.id)}
              seed={stage.studentModelSeed ?? stage.studentModelSeedPool?.[0] ?? 1}
              difficulty={(stage.studentModelDifficulty ?? "core") as LessonDifficulty}
            />
          ) : null}
          {stage.studentModelId === "decimal-notation-l1" ? (
            <DecimalNotationL1Lab
              activity={decimalNotationL1ActivityFromStageId(stage.id)}
              seed={stage.studentModelSeed ?? stage.studentModelSeedPool?.[0] ?? 1}
              difficulty={(stage.studentModelDifficulty ?? "core") as LessonDifficulty}
            />
          ) : null}
          {stage.studentModelId === "distance-motion-lab" ? (
            <DistanceLessonLab key={stage.id} activity={distanceActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "rectangle-square-area-lab" ? (
            <RectangleSquareAreaLab activity={rectangleSquareAreaActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "area-unit-conversion-lab" ? (
            <AreaUnitConversionLab activity={areaUnitConversionActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "parallelogram-area-lab" ? (
            <ParallelogramAreaLab activity={parallelogramAreaActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "rhombus-area-lab" ? (
            <RhombusAreaLab activity={rhombusAreaActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "triangle-area-lab" ? (
            <TriangleAreaLab activity={triangleAreaActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "trapezoid-area-lab" ? (
            <TrapezoidAreaLab activity={trapezoidAreaActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "composite-area-lab" ? (
            <CompositeAreaLab activity={compositeAreaActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "area-review-lab" ? (
            <AreaReviewLab activity={areaReviewActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "volume-units-lab" ? (
            <VolumeUnitsLab activity={volumeUnitsActivityFromStageId(stage.id)} eyebrow={sectionTaskEyebrow(stage.id) ?? undefined} useSpatialModel={stage.id.startsWith("m6-9-5-")} />
          ) : null}
          {stage.studentModelId === "cuboid-volume-lab" ? (
            <CuboidVolumeLab activity={cuboidVolumeActivityFromStageId(stage.id)} eyebrow={sectionTaskEyebrow(stage.id) ?? undefined} />
          ) : null}
          {stage.studentModelId === "liters-milliliters-lab" ? (
            <LitersMillilitersLab activity={litersMillilitersActivityFromStageId(stage.id)} eyebrow={sectionTaskEyebrow(stage.id) ?? undefined} />
          ) : null}
          {stage.studentModelId === "cuboid-cube-lab" ? (
            <CuboidCubeLessonLab activity={cuboidCubeActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "right-prism-lab" ? (
            <RightPrismLessonLab activity={rightPrismActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "prism-nets-lab" ? (
            <PrismNetsLessonLab activity={prismNetsActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "prism-surface-area-lab" ? (
            <PrismSurfaceAreaLessonLab activity={prismSurfaceAreaActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "prism-volume-lab" ? (
            <PrismVolumeLessonLab activity={prismVolumeActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "pyramid-lab" ? (
            <PyramidLessonLab activity={pyramidActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "solid-recognition-lab" ? (
            <SolidRecognitionLessonLab />
          ) : null}
          {stage.studentModelId === "solid-review-lab" ? (
            <SolidReviewLessonLab activity={solidReviewActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "integer-review-lab" ? (
            <IntegerReviewLessonLab activity={integerReviewActivityFromStageId(stage.id)} />
          ) : null}
          {stage.studentModelId === "algebra-expressions-lab" ? (
            <AlgebraLessonLab activity={algebraActivityFromStageId(stage.id)} topicNumber={algebraTopicNumberFromStageId(stage.id)} seed={stage.studentModelSeed ?? 1} />
          ) : null}
          {stage.modelId === "exercise-board" ? (
            <ExerciseBoardModel seed={stage.modelSeed ?? 1} readOnly lessonTitle={stage.lessonTitle ?? view.lessonTitle} lessonMetric={stage.lessonMetric} lessonTiming={stage.lessonTiming} curriculumCodes={stage.curriculumCodes} learningGoals={stage.learningGoals} />
          ) : null}
          <p className="text-center text-xs font-medium text-slate-500">Nauczyciel steruje tempem i może w każdej chwili włączyć tryb „tylko tablica”.</p>
        </Card>
      ) : null}

      {showClassFourReview && stage && question ? (
        <StudentClassFourReviewActivity
          key={question.questionInstanceId}
          sessionId={sessionId}
          stageId={stageId}
          seed={stage.studentModelSeed ?? 1}
          question={question}
          submitted={submitted}
          questionNumber={questionNumber}
          questionCount={stage.questions.length}
          onRefresh={refresh}
        />
      ) : null}

      {showGrade4AddSub && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <Grade4AddSubLessonLab activity={grade4AddSubActivityFromStageId(stage.id)} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}

      {showGrade4MoreLess && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <Grade4MoreLessLessonLab activity={grade4MoreLessActivityFromStageId(stage.id)} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}

      {showGrade4MulDiv && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <Grade4MulDivLessonLab activity={grade4MulDivActivityFromStageId(stage.id)} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}

      {showSectionOneReview && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <SectionOneReviewLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}

      {showSectionTwoReview && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <SectionTwoReviewLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}

      {showNaturalNumbers && stage && question ? (
        <StudentNaturalNumbersActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} />
      ) : null}

      {showMentalAddSub && stage && question ? (
        <StudentMentalAddSubActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} />
      ) : null}

      {showNumberLineJumps && stage && question ? (
        <StudentNumberLineJumpsActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} />
      ) : null}
      {showDecimalMentalArithmetic && stage && question ? <StudentDecimalMentalArithmeticActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} /> : null}

      {showMentalMulDiv && stage && question ? (
        <StudentMentalMulDivActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} />
      ) : null}

      {showOrderOfOperations && stage && question ? (
        <StudentOrderOfOperationsActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} />
      ) : null}
      {showEstimation && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <EstimationLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showWrittenAddSub && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <WrittenAddSubLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showWrittenMultiplication && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <WrittenMultiplicationLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showWrittenDivision && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <WrittenDivisionLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showWrittenStoryProblem && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <WrittenStoryProblemsLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showMultiples && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <MultiplesLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showDivisors && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <DivisorsLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showDivisibilityAnimals && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <DivisibilityAnimalsLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showPrimeComposite && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <PrimeCompositeLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showPrimeFactorization && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <PrimeFactorizationLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showGcdLcmFactor && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <GcdLcmFactorLessonModel seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showFractionLesson && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <FractionLessonL1Model activity={fractionLessonL1ActivityFromStageId(stage.id)} seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} difficulty={(question.difficulty ?? "core") as LessonDifficulty} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showDecimalNotationL1 && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <DecimalNotationL1Lab activity={decimalNotationL1ActivityFromStageId(stage.id)} seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} difficulty={(question.difficulty ?? "core") as LessonDifficulty} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showDistanceMotion && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <DistanceLessonLab key={stage.id} activity={distanceActivityFromStageId(stage.id)} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}

      {showScoredSolid && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => {
        if (stage.studentModelId === "volume-units-lab") return <VolumeUnitsLab activity={volumeUnitsActivityFromStageId(stage.id)} onResultChange={onResultChange} eyebrow={sectionTaskEyebrow(stage.id) ?? undefined} useSpatialModel={stage.id.startsWith("m6-9-5-")} />;
        if (stage.studentModelId === "cuboid-volume-lab") return <CuboidVolumeLab activity={cuboidVolumeActivityFromStageId(stage.id)} onResultChange={onResultChange} eyebrow={sectionTaskEyebrow(stage.id) ?? undefined} />;
        if (stage.studentModelId === "liters-milliliters-lab") return <LitersMillilitersLab activity={litersMillilitersActivityFromStageId(stage.id)} onResultChange={onResultChange} eyebrow={sectionTaskEyebrow(stage.id) ?? undefined} />;
        if (stage.studentModelId === "cuboid-cube-lab") return <CuboidCubeLessonLab activity={cuboidCubeActivityFromStageId(stage.id)} onResultChange={onResultChange} />;
        if (stage.studentModelId === "right-prism-lab") return <RightPrismLessonLab activity={rightPrismActivityFromStageId(stage.id)} onResultChange={onResultChange} />;
        if (stage.studentModelId === "prism-nets-lab") return <PrismNetsLessonLab activity={prismNetsActivityFromStageId(stage.id)} onResultChange={onResultChange} />;
        if (stage.studentModelId === "prism-surface-area-lab") return <PrismSurfaceAreaLessonLab activity={prismSurfaceAreaActivityFromStageId(stage.id)} onResultChange={onResultChange} />;
        if (stage.studentModelId === "prism-volume-lab") return <PrismVolumeLessonLab activity={prismVolumeActivityFromStageId(stage.id)} onResultChange={onResultChange} />;
        if (stage.studentModelId === "pyramid-lab") return <PyramidLessonLab activity={pyramidActivityFromStageId(stage.id)} onResultChange={onResultChange} />;
        if (stage.studentModelId === "solid-recognition-lab") return <SolidRecognitionLessonLab onResultChange={onResultChange} />;
        if (stage.studentModelId === "solid-review-lab") return <SolidReviewLessonLab activity={solidReviewActivityFromStageId(stage.id)} onResultChange={onResultChange} />;
        return null;
      }}</StudentLessonModelActivity> : null}
      {showIntegerNumbers && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <IntegerNumbersLessonLab activity={integerNumbersActivityFromStageId(stage.id)} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showIntegerAddSubtract && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <IntegerAddSubtractLessonLab activity={integerAddSubtractActivityFromStageId(stage.id)} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showIntegerMulDiv && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <IntegerMulDivLessonLab activity={integerMulDivActivityFromStageId(stage.id)} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showIntegerReview && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <IntegerReviewLessonLab activity={integerReviewActivityFromStageId(stage.id)} taskSeed={question.seed} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
      {showAlgebra && stage && question ? <StudentLessonModelActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh}>{(onResultChange) => <AlgebraLessonLab activity={algebraActivityFromStageId(stage.id)} topicNumber={algebraTopicNumberFromStageId(stage.id)} seed={stage.studentModelSeed ?? 1} taskSeed={question.seed} difficulty={(question.difficulty ?? "core") as LessonDifficulty} questionNumber={questionNumber} questionCount={stage.questions.length} onResultChange={onResultChange} />}</StudentLessonModelActivity> : null}
    </div>
    </LessonStageFocusRegion>
    </LessonRuntimeAccessibilityProvider>
  );
}
