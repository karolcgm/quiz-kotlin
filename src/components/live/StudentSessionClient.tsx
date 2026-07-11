"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StudentSessionActivityBlock } from "@/components/live/StudentSessionActivityBlock";
import { StudentClassFourReviewActivity } from "@/components/live/StudentClassFourReviewActivity";
import { StudentNaturalNumbersActivity } from "@/components/live/StudentNaturalNumbersActivity";
import { StudentMentalAddSubActivity } from "@/components/live/StudentMentalAddSubActivity";
import { StudentMentalMulDivActivity } from "@/components/live/StudentMentalMulDivActivity";
import { StudentOrderOfOperationsActivity } from "@/components/live/StudentOrderOfOperationsActivity";
import { PlaceValueFactoryModel } from "@/components/lessons/models/PlaceValueFactoryModel";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { MultiplicationGridModel } from "@/components/lessons/models/MultiplicationGridModel";
import { DiagnosticStationsModel } from "@/components/lessons/models/DiagnosticStationsModel";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";
import { Card } from "@/components/ui/Card";
import { LiveUnderstandingCheck } from "@/components/live/LiveUnderstandingCheck";
import { findSubmittedResponse, isStageInteractive } from "@/lib/live/studentView";
import { useStudentSessionSync, type StudentConnectionState } from "@/lib/live/useStudentSessionSync";
import type { LessonSessionStageQuestion, LessonSessionStudentView } from "@/types/lessonSession";
import type { UnderstandingLevel } from "@/types/understanding";

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

function pickActiveQuestion(view: LessonSessionStudentView): LessonSessionStageQuestion | null {
  const stage = view.activeStage;
  if (!stage || stage.questions.length === 0) return null;

  const unsubmitted = stage.questions.find(
    (item) => !findSubmittedResponse(view, stage.id, item.questionInstanceId),
  );
  return unsubmitted ?? stage.questions[0] ?? null;
}

export function StudentSessionClient({ sessionId, initialView, initialUnderstanding = null }: StudentSessionClientProps) {
  const { view, connection, refresh } = useStudentSessionSync(sessionId, initialView);
  const [understanding, setUnderstanding] = useState<UnderstandingLevel | null>(initialUnderstanding);
  const stage = view.activeStage;
  const question = pickActiveQuestion(view);
  const stageId = stage?.id ?? "";

  const submitted = question
    ? findSubmittedResponse(view, stageId, question.questionInstanceId)
    : undefined;
  const completedQuestionCount = stage
    ? stage.questions.filter((item) => Boolean(findSubmittedResponse(view, stage.id, item.questionInstanceId))).length
    : 0;
  const questionNumber = Math.min(completedQuestionCount + 1, stage?.questions.length ?? 1);

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
    (stage?.studentModelId === "place-value-factory" ||
      stage?.studentModelId === "number-line-jumps" ||
      stage?.studentModelId === "multiplication-grid" ||
      stage?.studentModelId === "diagnostic-stations" ||
      stage?.modelId === "exercise-board");
  const showClassFourReview =
    view.status === "live" &&
    !view.boardOnlyMode &&
    stage?.studentModelId === "class4-review" &&
    question?.generatorId === "class4-review-v1";
  const showNaturalNumbers =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "natural-numbers-lesson" && question?.generatorId === "natural-numbers-v1";
  const showMentalAddSub =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "mental-add-sub-lesson" && question?.generatorId === "mental-add-sub-v1";
  const showMentalMulDiv =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "mental-mul-div-lesson" && question?.generatorId === "mental-mul-div-v1";
  const showOrderOfOperations =
    view.status === "live" && !view.boardOnlyMode &&
    stage?.studentModelId === "order-of-operations-lesson" && question?.generatorId === "order-of-operations-v1";

  const activityKey = `${stageId}:${question?.questionInstanceId ?? "none"}`;

  return (
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
      </header>

      {connection === "offline" ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          Brak połączenia — zachowujemy Twój zapis lokalny. Przywracamy synchronizację…
        </p>
      ) : null}

      {view.status === "ended" ? (
        <div className="space-y-4">
          <Card className="space-y-2 text-center">
            <h2 className="text-xl font-bold text-slate-900">Lekcja zakończona</h2>
            <p className="text-sm text-slate-600">Zanim zobaczysz wynik, wykonaj obowiązkowy ostatni krok.</p>
          </Card>
          {!understanding ? <LiveUnderstandingCheck sessionId={sessionId} onSaved={setUnderstanding} /> : (
            <Card className="space-y-3 text-center">
              <div className="text-5xl" aria-hidden>🎉</div>
              <h2 className="text-xl font-bold text-slate-900">Dziękujemy za szczerą odpowiedź!</h2>
              <p className="text-sm text-slate-600">Samoocena została zapisana. Teraz możesz zobaczyć swoje odpowiedzi i wskazówki.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href={`/uczen/sesja/${sessionId}/podsumowanie`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white">Moje podsumowanie</Link>
                <Link href="/uczen" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800">Panel ucznia</Link>
              </div>
            </Card>
          )}
        </div>
      ) : waitingMessage && !showActivity && !showCompanionActivity && !showClassFourReview && !showNaturalNumbers && !showMentalAddSub && !showMentalMulDiv && !showOrderOfOperations ? (
        <Card className="space-y-2 py-8 text-center">
          <p className="text-lg font-semibold text-slate-900">{stage?.title ?? "Lekcja"}</p>
          <p className="text-sm leading-relaxed text-slate-600">{waitingMessage}</p>
          {stage?.studentInstruction ? (
            <p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900">{stage.studentInstruction}</p>
          ) : null}
        </Card>
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
          {stage.modelId === "exercise-board" ? (
            <ExerciseBoardModel seed={stage.modelSeed ?? 1} readOnly lessonTitle={stage.lessonTitle ?? view.lessonTitle} learningGoals={stage.learningGoals} />
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

      {showNaturalNumbers && stage && question ? (
        <StudentNaturalNumbersActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} />
      ) : null}

      {showMentalAddSub && stage && question ? (
        <StudentMentalAddSubActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} />
      ) : null}

      {showMentalMulDiv && stage && question ? (
        <StudentMentalMulDivActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} />
      ) : null}

      {showOrderOfOperations && stage && question ? (
        <StudentOrderOfOperationsActivity key={question.questionInstanceId} sessionId={sessionId} stageId={stageId} station={stage.studentModelSeed ?? 1} question={question} submitted={submitted} questionNumber={questionNumber} questionCount={stage.questions.length} onRefresh={refresh} />
      ) : null}
    </div>
  );
}
