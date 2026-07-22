"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonSystemKeyboardGuard } from "@/components/lessons/LessonSystemKeyboardGuard";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { MultiplicationGridModel } from "@/components/lessons/models/MultiplicationGridModel";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { OrderDirectorModel, type OrderDirectorModelState } from "@/components/lessons/models/OrderDirectorModel";
import { PlaceValueFactoryModel } from "@/components/lessons/models/PlaceValueFactoryModel";
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
import { rectangleSquareAreaActivityFromStageId } from "@/lib/math/area/rectangleSquareArea";
import { areaUnitConversionActivityFromStageId } from "@/lib/math/area/unitConversion";
import { parallelogramAreaActivityFromStageId } from "@/lib/math/area/parallelogramArea";
import { rhombusAreaActivityFromStageId } from "@/lib/math/area/rhombusArea";
import { triangleAreaActivityFromStageId } from "@/lib/math/area/triangleArea";
import { trapezoidAreaActivityFromStageId } from "@/lib/math/area/trapezoidArea";
import { compositeAreaActivityFromStageId } from "@/lib/math/area/compositeArea";
import { areaReviewActivityFromStageId } from "@/lib/math/area/areaReview";
import { VolumeUnitsLab, volumeUnitsActivityFromStageId } from "@/components/lessons/volume";
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
import { M514_QUESTION_INSTANCES } from "@/data/lessons/m5-1-4-instances";
import type { LessonStage, LessonViewChannel } from "@/types/lessonPackage";
import { sectionTaskEyebrow } from "@/lib/lessons/sectionTaskEyebrow";

interface LessonStageViewProps {
  lessonId: string;
  stage: LessonStage;
  channel: LessonViewChannel;
  revealIndex: number;
  modelState?: OrderDirectorModelState;
  onModelStateChange?: (state: OrderDirectorModelState) => void;
  readOnly?: boolean;
  showHints?: boolean;
  showDebug?: boolean;
}

export function LessonStageView({
  lessonId,
  stage,
  channel,
  revealIndex,
  modelState,
  onModelStateChange,
  readOnly = false,
  showHints = false,
  showDebug = false,
}: LessonStageViewProps) {
  const reveal = stage.revealSteps[revealIndex];

  if (channel === "print" && stage.print) {
    const keyItems =
      stage.print.showKey && stage.questions.length > 0
        ? stage.questions
            .map((q) => M514_QUESTION_INSTANCES.find((i) => i.id === q.id))
            .filter((i): i is NonNullable<typeof i> => Boolean(i))
        : undefined;

    return (
      <Card className="space-y-3 border-dashed">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Podgląd druku</p>
        <LessonPrintWorksheet
          title={stage.print.worksheetTitle}
          instructions={stage.print.instructions}
          items={stage.print.items ?? []}
          showInlineKey={stage.print.showKey}
          keyItems={keyItems}
        />
        {stage.print.printableResourceId ? (
          <Link
            href={`/nauczyciel/lekcje/${lessonId}/druk?resource=${stage.print.printableResourceId}`}
            className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
          >
            Otwórz pełny podgląd A4 →
          </Link>
        ) : null}
      </Card>
    );
  }

  const boardConfig = stage.board;
  const studentConfig = stage.student;

  const headline = reveal?.boardHeadline ?? boardConfig.headline ?? stage.title;
  const body =
    reveal?.boardBody ??
    boardConfig.body ??
    (channel === "student" ? studentConfig?.instruction : stage.teacherInstruction);

  const modelId = channel === "student" ? studentConfig?.modelId : boardConfig.modelId;
  const modelSeed = channel === "student" ? studentConfig?.modelSeed : boardConfig.modelSeed;
  const modelSeedPool =
    channel === "student" ? studentConfig?.modelSeedPool : boardConfig.modelSeedPool;
  const modelDifficulty =
    channel === "student" ? studentConfig?.modelDifficulty : boardConfig.modelDifficulty;
  const unifiedSectionNumber = /^m5-([3-8])-/u.exec(lessonId)?.[1];
  const unifiedEyebrow = sectionTaskEyebrow(stage.id) ?? `Dział ${unifiedSectionNumber ?? "—"}`;
  const modelOwnsTaskFrame = modelId === "fraction-lesson" || modelId === "geometry-lab" || modelId === "decimal-notation-l1" || modelId === "integer-numbers-lab" || modelId === "integer-add-subtract-lab" || modelId === "integer-mul-div-lab" || modelId === "integer-review-lab" || modelId === "rectangle-square-area-lab" || modelId === "area-unit-conversion-lab" || modelId === "parallelogram-area-lab" || modelId === "rhombus-area-lab" || modelId === "triangle-area-lab" || modelId === "trapezoid-area-lab" || modelId === "composite-area-lab" || modelId === "area-review-lab" || modelId === "volume-units-lab";

  return (
    <LessonSystemKeyboardGuard><div className="space-y-4">
      {unifiedSectionNumber && modelOwnsTaskFrame ? null : unifiedSectionNumber ? (
        <LessonTaskFrame
          eyebrow={unifiedEyebrow}
          heading={headline}
          description={body}
        >
          <div className="space-y-3">
            {boardConfig.bullets?.length && channel === "board" ? (
              <ul className="space-y-2 text-sm font-semibold text-slate-700">
                {boardConfig.bullets.map((item) => <li key={item} className="rounded-xl bg-indigo-50 px-4 py-3">{item}</li>)}
              </ul>
            ) : null}
            {channel === "student" && studentConfig ? <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-bold text-teal-950">{studentConfig.instruction}</p> : null}
            {boardConfig.illustrationSrc ? <Image src={boardConfig.illustrationSrc} alt={boardConfig.illustrationAlt ?? "Ilustracja do lekcji"} width={1536} height={1024} className="h-auto w-full rounded-2xl object-cover" /> : null}
          </div>
        </LessonTaskFrame>
      ) : <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          {channel === "board" ? "Tablica" : "Tablet ucznia"}
        </p>
        <h3 className="text-xl font-bold text-[var(--ink)]">{headline}</h3>
        {body ? <p className="text-sm leading-relaxed text-[var(--ink-muted)]">{body}</p> : null}
        {boardConfig.bullets?.length && channel === "board" ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--ink-muted)]">
            {boardConfig.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {channel === "student" && studentConfig ? (
          <p className="rounded-xl bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900">
            {studentConfig.instruction}
          </p>
        ) : null}
        {boardConfig.illustrationSrc ? <Image src={boardConfig.illustrationSrc} alt={boardConfig.illustrationAlt ?? "Ilustracja do lekcji"} width={1536} height={1024} className="h-auto w-full rounded-2xl object-cover" /> : null}
      </Card>}

      {modelId === "order-director" && (modelSeed !== undefined || modelSeedPool?.length) ? (
        <OrderDirectorModel
          seed={modelSeed ?? modelSeedPool?.[0] ?? 1}
          seedPool={modelSeedPool}
          difficulty={modelDifficulty ?? "core"}
          readOnly={readOnly}
          presentationMode={channel === "board"}
          showHints={showHints}
          showDebug={showDebug}
          state={modelState}
          onStateChange={onModelStateChange}
        />
      ) : null}

      {modelId === "place-value-factory" ? (
        <PlaceValueFactoryModel
          seed={modelSeed ?? modelSeedPool?.[0] ?? 1}
          readOnly={readOnly}
          presentationMode={channel === "board"}
        />
      ) : null}

      {modelId === "number-line-jumps" ? (
        <NumberLineJumpsModel
          seed={modelSeed ?? modelSeedPool?.[0] ?? 1}
          readOnly={readOnly || channel === "board"}
        />
      ) : null}

      {modelId === "multiplication-grid" ? (
        <MultiplicationGridModel
          seed={modelSeed ?? modelSeedPool?.[0] ?? 1}
          readOnly={readOnly || channel === "board"}
        />
      ) : null}

      {modelId === "diagnostic-stations" ? (
        <DiagnosticStationsModel seed={modelSeed ?? 1} readOnly={readOnly} presentationMode={channel === "board"} />
      ) : null}

      {modelId === "exercise-board" ? (
        <ExerciseBoardModel seed={modelSeed ?? 1} readOnly={readOnly} presentationMode={channel === "board"} />
      ) : null}
      {modelId === "geometry-lab" ? (
        <GeometryLab seed={modelSeed ?? 1} mode={channel === "board" ? "demo" : "practice"} readOnly={readOnly} />
      ) : null}
      {modelId === "fraction-lesson" ? (
        <FractionLessonL1Model
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={fractionLessonL1ActivityFromStageId(stage.id)}
          seed={modelSeed ?? modelSeedPool?.[0] ?? 1}
          difficulty={modelDifficulty ?? "core"}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "decimal-notation-l1" ? (
        <DecimalNotationL1Lab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={decimalNotationL1ActivityFromStageId(stage.id)}
          seed={modelSeed ?? modelSeedPool?.[0] ?? 1}
          difficulty={modelDifficulty ?? "core"}
          readOnly={readOnly}
          presentationMode={channel === "board"}
        />
      ) : null}
      {modelId === "integer-numbers-lab" ? (
        <IntegerNumbersLessonLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={integerNumbersActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "integer-add-subtract-lab" ? (
        <IntegerAddSubtractLessonLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={integerAddSubtractActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "integer-mul-div-lab" ? (
        <IntegerMulDivLessonLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={integerMulDivActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "integer-review-lab" ? (
        <IntegerReviewLessonLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={integerReviewActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "rectangle-square-area-lab" ? (
        <RectangleSquareAreaLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={rectangleSquareAreaActivityFromStageId(stage.id)}
          readOnly={readOnly}
          presentationMode={channel === "board"}
        />
      ) : null}
      {modelId === "area-unit-conversion-lab" ? (
        <AreaUnitConversionLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={areaUnitConversionActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "parallelogram-area-lab" ? (
        <ParallelogramAreaLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={parallelogramAreaActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "rhombus-area-lab" ? (
        <RhombusAreaLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={rhombusAreaActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "triangle-area-lab" ? (
        <TriangleAreaLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={triangleAreaActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "trapezoid-area-lab" ? (
        <TrapezoidAreaLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={trapezoidAreaActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "composite-area-lab" ? (
        <CompositeAreaLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={compositeAreaActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "area-review-lab" ? (
        <AreaReviewLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={areaReviewActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "volume-units-lab" ? (
        <VolumeUnitsLab
          key={`${stage.id}-${modelSeed ?? 1}`}
          activity={volumeUnitsActivityFromStageId(stage.id)}
          readOnly={readOnly}
        />
      ) : null}
      {modelId === "class4-review" ? <ClassFourReviewModel seed={modelSeed ?? 1} readOnly={readOnly} presentationMode={channel === "board"} /> : null}
      {modelId === "section-one-review-lesson" ? <SectionOneReviewLessonModel seed={modelSeed ?? 1} readOnly={readOnly} /> : null}
      {modelId === "section-two-review-lesson" ? <SectionTwoReviewLessonModel seed={modelSeed ?? 1} readOnly={readOnly} /> : null}
      {modelId === "natural-numbers-lesson" ? <NaturalNumbersLessonModel seed={modelSeed ?? 1} readOnly={readOnly} presentationMode={channel === "board"} /> : null}
      {modelId === "mental-add-sub-lesson" ? <MentalAddSubLessonModel key={stage.id} seed={modelSeed ?? 1} readOnly={readOnly} /> : null}
      {modelId === "mental-mul-div-lesson" ? <MentalMulDivLessonModel seed={modelSeed ?? 1} readOnly={readOnly} /> : null}
      {modelId === "order-of-operations-lesson" ? <OrderOfOperationsLessonModel seed={modelSeed ?? 1} readOnly={readOnly} /> : null}
      {modelId === "estimation-lesson" ? <EstimationLessonModel seed={modelSeed ?? 1} readOnly={readOnly} /> : null}
      {modelId === "written-add-sub-lesson" ? <WrittenAddSubLessonModel seed={modelSeed ?? 1} readOnly={readOnly} /> : null}
      {modelId === "written-multiplication-lesson" ? <WrittenMultiplicationLessonModel key={stage.id} seed={modelSeed ?? 1} readOnly={readOnly} /> : null}
      {modelId === "written-division-lesson" ? <WrittenDivisionLessonModel key={stage.id} seed={modelSeed ?? 1} readOnly={readOnly} /> : null}
      {modelId === "written-story-problems-lesson" ? <WrittenStoryProblemsLessonModel key={stage.id} readOnly={readOnly} seed={modelSeed ?? 1} /> : null}
      {modelId === "multiples-lesson" ? <MultiplesLessonModel key={stage.id} readOnly={readOnly} seed={modelSeed ?? 1} /> : null}
      {modelId === "divisors-lesson" ? <DivisorsLessonModel key={stage.id} readOnly={readOnly} seed={modelSeed ?? 1} /> : null}
      {modelId === "divisibility-animals-lesson" ? <DivisibilityAnimalsLessonModel key={stage.id} readOnly={readOnly} seed={modelSeed ?? 1} /> : null}
      {modelId === "prime-composite-lesson" ? <PrimeCompositeLessonModel key={stage.id} readOnly={readOnly} seed={modelSeed ?? 1} /> : null}
      {modelId === "prime-factorization-lesson" ? <PrimeFactorizationLessonModel key={stage.id} readOnly={readOnly} seed={modelSeed ?? 1} /> : null}
      {modelId === "gcd-lcm-factor-lesson" ? <GcdLcmFactorLessonModel key={stage.id} readOnly={readOnly} seed={modelSeed ?? 1} /> : null}


      {stage.discussionPrompts.length > 0 && channel === "board" ? (
        <Card muted className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pytania do rozmowy</p>
          <ul className="space-y-1 text-sm text-slate-700">
            {stage.discussionPrompts.map((prompt) => (
              <li key={prompt}>• {prompt}</li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div></LessonSystemKeyboardGuard>
  );
}
