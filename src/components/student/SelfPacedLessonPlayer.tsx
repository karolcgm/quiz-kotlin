"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type CSSProperties } from "react";
import { ClassFourReviewModel } from "@/components/lessons/models/ClassFourReviewModel";
import { SectionOneReviewLessonModel } from "@/components/lessons/models/SectionOneReviewLessonModel";
import { SectionTwoReviewLessonModel } from "@/components/lessons/models/SectionTwoReviewLessonModel";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";
import { GeometryLab } from "@/components/lessons/geometry";
import { FractionLessonL1Model } from "@/components/lessons/fractions";
import { fractionLessonL1ActivityFromStageId } from "@/lib/math/fractions/fractionLessonL1";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";
import { IntegerNumbersLessonLab, integerNumbersActivityFromStageId } from "@/components/lessons/models/IntegerNumbersLessonLab";
import { IntegerAddSubtractLessonLab, integerAddSubtractActivityFromStageId } from "@/components/lessons/models/IntegerAddSubtractLessonLab";
import { AreaReviewLab, AreaUnitConversionLab, CompositeAreaLab, ParallelogramAreaLab, RectangleSquareAreaLab, RhombusAreaLab, TrapezoidAreaLab, TriangleAreaLab } from "@/components/lessons/area";
import { rectangleSquareAreaActivityFromStageId } from "@/lib/math/area/rectangleSquareArea";
import { areaUnitConversionActivityFromStageId } from "@/lib/math/area/unitConversion";
import { parallelogramAreaActivityFromStageId } from "@/lib/math/area/parallelogramArea";
import { rhombusAreaActivityFromStageId } from "@/lib/math/area/rhombusArea";
import { triangleAreaActivityFromStageId } from "@/lib/math/area/triangleArea";
import { trapezoidAreaActivityFromStageId } from "@/lib/math/area/trapezoidArea";
import { compositeAreaActivityFromStageId } from "@/lib/math/area/compositeArea";
import { areaReviewActivityFromStageId } from "@/lib/math/area/areaReview";
import { DiagnosticStationsModel } from "@/components/lessons/models/DiagnosticStationsModel";
import { MultiplicationGridModel } from "@/components/lessons/models/MultiplicationGridModel";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { PlaceValueFactoryModel } from "@/components/lessons/models/PlaceValueFactoryModel";
import { MentalAddSubLessonModel } from "@/components/lessons/models/MentalAddSubLessonModel";
import { MentalMulDivLessonModel } from "@/components/lessons/models/MentalMulDivLessonModel";
import { NaturalNumbersLessonModel } from "@/components/lessons/models/NaturalNumbersLessonModel";
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
import { Card } from "@/components/ui/Card";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonSystemKeyboardGuard } from "@/components/lessons/LessonSystemKeyboardGuard";
import { UnderstandingCheck } from "@/components/lessons/UnderstandingCheck";
import { SkillAssessmentSummary } from "@/components/lessons/SkillAssessmentSummary";
import {
  LessonAccessibilityControls,
  LessonRuntimeAccessibilityProvider,
  LessonStageFocusRegion,
} from "@/components/lessons/LessonRuntimeAccessibility";
import { StudentOrderDirectorActivity } from "@/components/live/StudentOrderDirectorActivity";
import { celebrateCorrectAnswer } from "@/components/rewards/StudentRewardExperience";
import { buildUnderstandingAssessment } from "@/lib/lessons/understandingAssessment";
import { clearLocalWorkScope, writeLocalWorkDraft, type LocalWorkIdentity, type LocalWorkTrace } from "@/lib/lessons/localWorkTrace";
import { useIdempotentSubmission } from "@/lib/lessons/useIdempotentSubmission";
import { finishStudentLessonReviewAction, resetStudentLessonReviewAction, submitStudentLessonReviewAnswerAction } from "@/lib/actions/studentLearningPlan";
import type { LessonSessionStageSnapshot } from "@/types/lessonSession";
import type { StudentLessonReviewAnswer, StudentLessonReviewView } from "@/types/studentLearningPlan";
import type { UnderstandingLevel } from "@/types/understanding";
import type { LessonDifficulty } from "@/types/lessonPackage";

type Result = { correct: boolean; answer: string; selectedOperatorIndex?: number };
type SelfPacedAnswerPayload = Result & { stageId: string; questionId: string; stageIndex: number };
const SUPPORTED = new Set(["class4-review", "section-one-review-lesson", "section-two-review-lesson", "natural-numbers-lesson", "mental-add-sub-lesson", "mental-mul-div-lesson", "order-of-operations-lesson", "estimation-lesson", "written-add-sub-lesson", "written-multiplication-lesson", "written-division-lesson", "written-story-problems-lesson", "multiples-lesson", "divisors-lesson", "divisibility-animals-lesson", "prime-composite-lesson", "prime-factorization-lesson", "gcd-lcm-factor-lesson", "fraction-lesson", "decimal-notation-l1", "integer-numbers-lab", "integer-add-subtract-lab", "geometry-lab", "rectangle-square-area-lab", "area-unit-conversion-lab", "parallelogram-area-lab", "rhombus-area-lab", "triangle-area-lab", "trapezoid-area-lab", "composite-area-lab", "area-review-lab"]);

function QuestionModel({ stage, seed, questionSeed, difficulty = "core", questionNumber, questionCount, onResult }: { stage: LessonSessionStageSnapshot; seed: number; questionSeed: number; difficulty?: LessonDifficulty; questionNumber: number; questionCount: number; onResult: (correct: boolean | null, answer?: string) => void }) {
  const props = { seed, taskSeed: questionSeed, questionNumber, questionCount, onResultChange: onResult };
  if (stage.studentModelId === "class4-review") return <ClassFourReviewModel {...props} />;
  if (stage.studentModelId === "section-one-review-lesson") return <SectionOneReviewLessonModel {...props} />;
  if (stage.studentModelId === "section-two-review-lesson") return <SectionTwoReviewLessonModel {...props} />;
  if (stage.studentModelId === "natural-numbers-lesson") return <NaturalNumbersLessonModel {...props} />;
  if (stage.studentModelId === "mental-add-sub-lesson") return <MentalAddSubLessonModel {...props} />;
  if (stage.studentModelId === "mental-mul-div-lesson") return <MentalMulDivLessonModel {...props} />;
  if (stage.studentModelId === "order-of-operations-lesson") return <OrderOfOperationsLessonModel {...props} />;
  if (stage.studentModelId === "estimation-lesson") return <EstimationLessonModel {...props} />;
  if (stage.studentModelId === "written-add-sub-lesson") return <WrittenAddSubLessonModel {...props} />;
  if (stage.studentModelId === "written-multiplication-lesson") return <WrittenMultiplicationLessonModel {...props} />;
  if (stage.studentModelId === "written-division-lesson") return <WrittenDivisionLessonModel {...props} />;
  if (stage.studentModelId === "written-story-problems-lesson") return <WrittenStoryProblemsLessonModel seed={seed} onResultChange={onResult} />;
  if (stage.studentModelId === "multiples-lesson") return <MultiplesLessonModel {...props} />;
  if (stage.studentModelId === "divisors-lesson") return <DivisorsLessonModel {...props} />;
  if (stage.studentModelId === "divisibility-animals-lesson") return <DivisibilityAnimalsLessonModel {...props} />;
  if (stage.studentModelId === "prime-composite-lesson") return <PrimeCompositeLessonModel {...props} />;
  if (stage.studentModelId === "prime-factorization-lesson") return <PrimeFactorizationLessonModel {...props} />;
  if (stage.studentModelId === "gcd-lcm-factor-lesson") return <GcdLcmFactorLessonModel {...props} />;
  if (stage.studentModelId === "fraction-lesson") return <FractionLessonL1Model activity={fractionLessonL1ActivityFromStageId(stage.id)} difficulty={difficulty} {...props} />;
  if (stage.studentModelId === "decimal-notation-l1") return <DecimalNotationL1Lab activity={decimalNotationL1ActivityFromStageId(stage.id)} difficulty={difficulty} {...props} />;
  if (stage.studentModelId === "integer-numbers-lab") return <IntegerNumbersLessonLab activity={integerNumbersActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "integer-add-subtract-lab") return <IntegerAddSubtractLessonLab activity={integerAddSubtractActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "rectangle-square-area-lab") return <RectangleSquareAreaLab activity={rectangleSquareAreaActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "area-unit-conversion-lab") return <AreaUnitConversionLab activity={areaUnitConversionActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "parallelogram-area-lab") return <ParallelogramAreaLab activity={parallelogramAreaActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "rhombus-area-lab") return <RhombusAreaLab activity={rhombusAreaActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "triangle-area-lab") return <TriangleAreaLab activity={triangleAreaActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "trapezoid-area-lab") return <TrapezoidAreaLab activity={trapezoidAreaActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "composite-area-lab") return <CompositeAreaLab activity={compositeAreaActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "area-review-lab") return <AreaReviewLab activity={areaReviewActivityFromStageId(stage.id)} onResultChange={onResult} />;
  if (stage.studentModelId === "geometry-lab") return <GeometryLab seed={questionSeed} mode="assessment" questionNumber={questionNumber} questionCount={questionCount} onResultChange={onResult} />;
  return <LessonTaskFrame eyebrow="Zadanie" heading={stage.title} description={stage.studentInstruction} questionNumber={questionNumber} questionCount={questionCount}><div className="py-6 text-center"><div className="text-5xl">🧩</div><p className="mt-3 font-black text-slate-950">Obejrzyj slajd i nazwij najważniejszą zasadę.</p><p className="mt-1 text-sm text-slate-600">Przejdź dalej, gdy wszystko jest jasne.</p></div></LessonTaskFrame>;
}

export function SelfPacedLessonPlayer({
  initialReview,
  initialThemeId = "sky",
  slideBrightnessOffset = 0,
}: {
  initialReview: StudentLessonReviewView;
  initialThemeId?: string;
  slideBrightnessOffset?: number;
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
  const [resetNonce, setResetNonce] = useState(0);
  const [pending, startTransition] = useTransition();
  const stage = stages[stageIndex];
  const unifiedSectionNumber = /^M5-S([3-8])$/u.exec(initialReview.stageSnapshot.sectionId)?.[1];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= initialReview.maxScore;
  const stageAnswered = stage?.questions.filter((question) => Boolean(answers[question.questionInstanceId])).length ?? 0;
  const question = stage?.questions.find((item) => !answers[item.questionInstanceId]) ?? null;
  const workIdentity = useMemo<LocalWorkIdentity>(() => ({
    channel: "self_paced",
    scopeId: initialReview.reviewId,
    stageId: stage?.id ?? "no-stage",
    itemId: question?.questionInstanceId ?? "no-question",
  }), [initialReview.reviewId, question?.questionInstanceId, stage?.id]);
  const stageComplete = !stage || stage.questions.length === 0 || stageAnswered === stage.questions.length;
  const modelSeed = stage?.studentModelSeed ?? stage?.studentModelSeedPool?.[0] ?? 1;
  const genericOrderQuestion = question?.generatorId === "order-director-v1";
  const canAnswer = Boolean(question && ((stage?.studentModelId && SUPPORTED.has(stage.studentModelId)) || genericOrderQuestion));
  const stageStatuses = useMemo(() => stages.map((item) => item.questions.length === 0 || item.questions.every((q) => Boolean(answers[q.questionInstanceId]))), [answers, stages]);
  const understandingConfig = stages.at(-1)?.understanding;
  const assessment = useMemo(() => {
    if (!understandingConfig) return null;
    const evidenceStage = stages.find((item) => item.id === understandingConfig.evidenceStageId);
    const evidence = (evidenceStage?.questions ?? []).flatMap((item) => {
      const answer = answers[item.questionInstanceId];
      if (!answer) return [];
      const configured = understandingConfig.evidenceItems.find((entry) => entry.id === item.questionInstanceId);
      return [{
        evidenceId: item.questionInstanceId,
        skillIds: item.skillIds ?? configured?.skillIds ?? initialReview.stageSnapshot.skillIds,
        score: answer.correct ? item.maxScore : 0,
        maxScore: item.maxScore,
        source: "self_paced" as const,
      }];
    });
    return buildUnderstandingAssessment(understandingConfig, evidence);
  }, [answers, initialReview.stageSnapshot.skillIds, stages, understandingConfig]);
  const understandingDraftKey = `lekcjalab:review-understanding:${initialReview.reviewId}`;
  const sendSelfPacedAnswer = useCallback((trace: LocalWorkTrace<SelfPacedAnswerPayload>) => (
    submitStudentLessonReviewAnswerAction({
      reviewId: initialReview.reviewId,
      stageId: trace.payload.stageId,
      questionId: trace.payload.questionId,
      stageIndex: trace.payload.stageIndex,
      clientAttemptId: trace.clientAttemptId,
      correct: trace.payload.correct,
      answerLabel: trace.payload.answer,
      selectedOperatorIndex: trace.payload.selectedOperatorIndex,
    })
  ), [initialReview.reviewId]);
  const handleSelfPacedAnswerSuccess = useCallback((
    response: Awaited<ReturnType<typeof submitStudentLessonReviewAnswerAction>>,
    trace: LocalWorkTrace<SelfPacedAnswerPayload>,
  ) => {
    const nextAnswer: StudentLessonReviewAnswer = {
      stageId: trace.payload.stageId,
      correct: Boolean(response.correct),
      answerLabel: trace.payload.answer,
      submittedAt: new Date().toISOString(),
    };
    setAnswers((current) => ({ ...current, [trace.payload.questionId]: nextAnswer }));
    setScore(response.score ?? 0);
    setResult(null);
    if (response.correct) celebrateCorrectAnswer();
    const answeredInStage = stages[trace.payload.stageIndex]?.questions.filter((item) => Boolean(answers[item.questionInstanceId])).length ?? 0;
    const taskCount = stages[trace.payload.stageIndex]?.questions.length ?? 0;
    if (answeredInStage + 1 >= taskCount && trace.payload.stageIndex < stages.length - 1) {
      setStageIndex(trace.payload.stageIndex + 1);
    }
  }, [answers, stages]);
  const answerSubmission = useIdempotentSubmission<SelfPacedAnswerPayload, Awaited<ReturnType<typeof submitStudentLessonReviewAnswerAction>>>({
    identity: workIdentity,
    disabled: !question || Boolean(answers[question.questionInstanceId]),
    send: sendSelfPacedAnswer,
    onSuccess: handleSelfPacedAnswerSuccess,
  });

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === presentationRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (understanding || typeof window === "undefined") return;
    const restoreDraft = window.setTimeout(() => {
      const draft = window.localStorage.getItem(understandingDraftKey);
      if (draft === "understood" || draft === "partial" || draft === "not_understood") setUnderstanding(draft);
    }, 0);
    return () => window.clearTimeout(restoreDraft);
  }, [understanding, understandingDraftKey]);

  const chooseUnderstanding = (value: UnderstandingLevel) => {
    setUnderstanding(value);
    window.localStorage.setItem(understandingDraftKey, value);
  };

  const toggleFullscreen = useCallback(async () => {
    if (!presentationRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await presentationRef.current.requestFullscreen();
  }, []);

  const moveNext = () => { setResult(null); setError(null); setStageIndex((current) => Math.min(stages.length - 1, current + 1)); };
  const handleResult = useCallback(
    (correct: boolean | null, answer?: string) => {
      if (correct === null) {
        setResult(null);
        return;
      }
      const next = { correct, answer: answer ?? "" };
      setResult(next);
      if (stage && question) writeLocalWorkDraft(workIdentity, {
        ...next,
        stageId: stage.id,
        questionId: question.questionInstanceId,
        stageIndex,
      });
    },
    [question, stage, stageIndex, workIdentity],
  );

  if (finished) return <div className="mx-auto max-w-3xl space-y-5">{assessment ? <SkillAssessmentSummary assessment={assessment} /> : null}<section className="rounded-[2.5rem] bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-700 p-8 text-center text-white shadow-2xl"><div className="text-8xl">🎉🏆⭐</div><h1 className="mt-4 text-4xl font-black">Lekcja zaliczona!</h1><p className="mt-3 text-xl font-bold">Wynik: {score}/{initialReview.maxScore} punktów</p><p className="mt-2 text-cyan-50">Samoocena została zapisana osobno i nie zmieniła punktów.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/uczen/plan" className="rounded-xl bg-white px-5 py-3 font-black text-indigo-700">Wróć do planu</Link><Link href="/uczen/klaser" className="rounded-xl bg-slate-950/30 px-5 py-3 font-black text-white">Sprawdź nagrody</Link></div></section></div>;

  const safeSlideOffset = Math.max(-50, Math.min(50, slideBrightnessOffset));
  const lessonStyle = {
    "--lesson-presentation-dim": String(Math.max(0, Math.min(.85, .30 - safeSlideOffset / 100))),
    "--lesson-frame-dim": String(Math.max(0, Math.min(.85, .40 - safeSlideOffset / 100))),
  } as CSSProperties;

  return <LessonRuntimeAccessibilityProvider>
    <LessonStageFocusRegion
      stageKey={stage?.id ?? "completed"}
      announcement={stage ? `Slajd ${stageIndex + 1} z ${stages.length}: ${stage.title}` : initialReview.stageSnapshot.title}
    >
    <div className={`self-paced-lesson lesson-theme-${initialThemeId} space-y-5`} style={lessonStyle} data-fullscreen={isFullscreen || undefined}>
    <Card><p className="text-xs font-black uppercase tracking-wide text-indigo-600">Slajdy lekcji</p><nav className="mt-3 grid auto-cols-[minmax(9.5rem,1fr)] grid-flow-col gap-2 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible lg:pb-0">{stages.map((item, index) => <button type="button" key={item.id} onClick={() => { setStageIndex(index); setResult(null); setError(null); }} className={`flex min-h-16 items-center gap-2 rounded-xl px-3 text-left text-xs font-bold sm:text-sm ${index === stageIndex ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${stageStatuses[index] ? "bg-emerald-400 text-emerald-950" : index === stageIndex ? "bg-white/20" : "bg-white text-slate-700"}`}>{stageStatuses[index] ? "✓" : index + 1}</span><span className="leading-tight">{item.title}</span></button>)}</nav></Card>

    <main className="min-w-0 space-y-4"><header className="rounded-[2rem] bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-5 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-100">{initialReview.stageSnapshot.topicId} · podejście {initialReview.attemptNumber}</p><h1 className="mt-1 text-2xl font-black">{initialReview.stageSnapshot.title}</h1><p className="mt-2 text-sm text-indigo-100">Wybieraj slajdy powyżej albo przechodź przyciskiem „Dalej”.</p></div><button type="button" onClick={() => void toggleFullscreen()} className="inline-flex min-h-11 items-center rounded-xl bg-white/15 px-4 text-sm font-black text-white ring-1 ring-white/30 hover:bg-white/25">⛶ Pełny ekran slajdu</button></div><LessonAccessibilityControls className="mt-3 justify-end text-white" /></header>
      <LessonSystemKeyboardGuard><div ref={presentationRef} className="self-paced-presentation space-y-4" data-lesson-presentation>
      {isFullscreen ? <button type="button" onClick={() => void toggleFullscreen()} className="fullscreen-exit-button fixed right-3 top-3 z-50 min-h-11 rounded-xl bg-slate-950/80 px-4 text-sm font-black text-white shadow-xl">⤓ Wyjdź</button> : null}
      {stage ? <>{!unifiedSectionNumber ? <Card data-slide-meta className="border-transparent"><p className="text-xs font-black uppercase text-white/75">Slajd {stageIndex + 1}/{stages.length}</p><h2 className="mt-1 text-xl font-black text-white">{stage.id.endsWith("-trace-0") ? "Cele lekcji" : stage.title}</h2><p className="mt-1 text-sm text-white/85">{stage.studentInstruction ?? stage.boardBody ?? "Zapoznaj się ze slajdem i przejdź dalej."}</p></Card> : null}
      {stage.questions.length === 0 && stage.modelId === "exercise-board" ? <ExerciseBoardModel seed={stage.modelSeed ?? 1} readOnly presentationMode lessonTitle={stage.lessonTitle ?? initialReview.stageSnapshot.title} lessonMetric={stage.lessonMetric} lessonTiming={stage.lessonTiming} curriculumCodes={stage.curriculumCodes} learningGoals={stage.learningGoals} initialPage={initialReview.textbookPage} initialExercises={initialReview.coveredExercises} /> : null}
      {stage.questions.length === 0 && stage.studentModelId && SUPPORTED.has(stage.studentModelId) ? <QuestionModel key={stage.id} stage={stage} seed={modelSeed} questionSeed={stage.studentModelSeed ?? 1} difficulty={(stage.studentModelDifficulty ?? "core") as LessonDifficulty} questionNumber={1} questionCount={1} onResult={() => undefined} /> : null}
      {stage.questions.length === 0 && stage.studentModelId === "place-value-factory" ? <PlaceValueFactoryModel key={stage.id} seed={stage.studentModelSeed ?? 1} /> : null}
      {stage.questions.length === 0 && stage.studentModelId === "number-line-jumps" ? <NumberLineJumpsModel key={stage.id} seed={stage.studentModelSeed ?? 1} /> : null}
      {stage.questions.length === 0 && stage.studentModelId === "multiplication-grid" ? <MultiplicationGridModel key={stage.id} seed={stage.studentModelSeed ?? 1} /> : null}
      {stage.questions.length === 0 && stage.studentModelId === "diagnostic-stations" ? <DiagnosticStationsModel key={stage.id} seed={stage.studentModelSeed ?? 1} /> : null}
      {stage.modelId !== "exercise-board" && (stage.boardHeadline || stage.boardBody || stage.boardBullets?.length || stage.illustrationSrc) && !(unifiedSectionNumber && stage.studentModelId && SUPPORTED.has(stage.studentModelId)) ? (unifiedSectionNumber ? <LessonTaskFrame eyebrow={`Dział ${unifiedSectionNumber} · Slajd ${stageIndex + 1}`} heading={stage.boardHeadline || stage.title} description={stage.studentInstruction ?? stage.boardBody}><div className="space-y-3">{stage.boardBullets?.length ? <ul className="space-y-3">{stage.boardBullets.map((item) => <li key={item} className="rounded-xl bg-indigo-50 px-4 py-3 font-semibold leading-relaxed text-indigo-950">{item}</li>)}</ul> : null}{stage.illustrationSrc ? <Image src={stage.illustrationSrc} alt={stage.illustrationAlt ?? "Ilustracja do lekcji"} width={1536} height={1024} className="h-auto w-full rounded-2xl object-cover" /> : null}</div></LessonTaskFrame> : <Card className="overflow-hidden"><div className="space-y-3"><p className="text-xs font-black uppercase tracking-wide text-indigo-600">Treść slajdu</p><h3 className="text-2xl font-black text-slate-950">{stage.boardHeadline}</h3>{stage.boardBody ? <p className="leading-relaxed text-slate-700">{stage.boardBody}</p> : null}{stage.boardBullets?.length ? <ul className="space-y-3">{stage.boardBullets.map((item) => <li key={item} className="rounded-xl bg-indigo-50 px-4 py-3 font-semibold leading-relaxed text-indigo-950">{item}</li>)}</ul> : null}{stage.illustrationSrc ? <Image src={stage.illustrationSrc} alt={stage.illustrationAlt ?? "Ilustracja do lekcji"} width={1536} height={1024} className="h-auto w-full rounded-2xl object-cover" /> : null}</div></Card>) : null}
      {question && canAnswer && genericOrderQuestion ? <Card><StudentOrderDirectorActivity question={question} selectedIndex={result?.selectedOperatorIndex ?? null} onSelect={(index) => { const next = { correct: false, answer: String(index), selectedOperatorIndex: index }; setResult(next); writeLocalWorkDraft(workIdentity, { ...next, stageId: stage.id, questionId: question.questionInstanceId, stageIndex }); }} /></Card> : null}
      {question && canAnswer && !genericOrderQuestion ? <QuestionModel key={`${question.questionInstanceId}-${resetNonce}`} stage={stage} seed={modelSeed} questionSeed={stage.studentModelId === "geometry-lab" ? question.seed : question.seed + initialReview.attemptNumber * 100003} difficulty={(question.difficulty ?? "core") as LessonDifficulty} questionNumber={stageAnswered + 1} questionCount={stage.questions.length} onResult={handleResult} /> : null}
      {stage.questions.length > 0 && !canAnswer && !stageComplete ? <QuestionModel stage={stage} seed={modelSeed} questionSeed={question?.seed ?? 1} questionNumber={stageAnswered + 1} questionCount={stage.questions.length} onResult={handleResult} /> : null}
      {stageComplete ? <Card className="border-emerald-200 bg-emerald-50 text-center"><div className="text-5xl">✅</div><p className="mt-2 text-xl font-black text-emerald-950">Ten slajd jest gotowy</p></Card> : null}
      {stageIndex === stages.length - 1 && allAnswered ? <UnderstandingCheck value={understanding} onChange={chooseUnderstanding} disabled={pending} assessment={assessment ?? undefined} /> : null}
      {error || answerSubmission.error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800" role="alert">{error ?? answerSubmission.error}</p> : null}
      <div className="flex flex-wrap gap-3" data-lesson-navigation><button type="button" disabled={pending || answerSubmission.pending || answerSubmission.queued} onClick={() => startTransition(async () => { const response = await resetStudentLessonReviewAction(initialReview.reviewId); if (!response.ok) { setError(response.error); return; } clearLocalWorkScope("self_paced", initialReview.reviewId); setAnswers({}); setScore(0); setStageIndex(0); setResult(null); setUnderstanding(null); window.localStorage.removeItem(understandingDraftKey); setError(null); setResetNonce((value) => value + 1); })} className="min-h-14 rounded-xl border border-amber-300 bg-amber-50 px-5 font-black text-amber-900 disabled:opacity-40">Od nowa</button><button type="button" disabled={stageIndex === 0 || pending || answerSubmission.pending || answerSubmission.queued} onClick={() => { setStageIndex((current) => Math.max(0, current - 1)); setResult(null); }} className="min-h-14 rounded-xl border border-slate-200 bg-white px-5 font-black text-slate-700 disabled:opacity-40">← Wstecz</button>
      {question && canAnswer ? <button type="button" disabled={!result || pending || answerSubmission.pending || answerSubmission.queued} onClick={() => { if (!result) return; setError(null); answerSubmission.submit({ ...result, stageId: stage.id, questionId: question.questionInstanceId, stageIndex }); }} className="min-h-14 flex-1 rounded-xl bg-indigo-600 px-5 text-lg font-black text-white disabled:bg-slate-300">{answerSubmission.pending ? "Zapisywanie…" : answerSubmission.queued ? "Czeka na połączenie" : result ? "Zapisz odpowiedź i dalej →" : "Najpierw wykonaj zadanie"}</button> : stageIndex < stages.length - 1 ? <button type="button" onClick={moveNext} className="min-h-14 flex-1 rounded-xl bg-indigo-600 px-5 text-lg font-black text-white">Dalej →</button> : null}
      {stageIndex === stages.length - 1 && allAnswered ? <button type="button" disabled={pending || !understanding} onClick={() => startTransition(async () => { if (!understanding) { setError("Wybierz jedną z trzech odpowiedzi, aby zakończyć lekcję."); return; } setError(null); const response = await finishStudentLessonReviewAction(initialReview.reviewId, understanding); if (!response.ok) { setError(`${response.error} Wybór zachowaliśmy na tym urządzeniu — spróbuj ponownie po odzyskaniu połączenia.`); return; } window.localStorage.removeItem(understandingDraftKey); setScore(response.score); setFinished(true); })} className="min-h-14 flex-1 rounded-xl bg-emerald-600 px-5 text-lg font-black text-white disabled:bg-slate-300">{pending ? "Kończenie lekcji…" : understanding ? "Zapisz samoocenę i zakończ" : "Najpierw wybierz samoocenę"}</button> : null}</div></> : null}
      </div></LessonSystemKeyboardGuard>
    </main>
  </div>
  </LessonStageFocusRegion>
  </LessonRuntimeAccessibilityProvider>;
}
