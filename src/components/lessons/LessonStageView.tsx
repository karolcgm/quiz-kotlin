"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { MultiplicationGridModel } from "@/components/lessons/models/MultiplicationGridModel";
import { NumberLineJumpsModel } from "@/components/lessons/models/NumberLineJumpsModel";
import { OrderDirectorModel, type OrderDirectorModelState } from "@/components/lessons/models/OrderDirectorModel";
import { PlaceValueFactoryModel } from "@/components/lessons/models/PlaceValueFactoryModel";
import { DiagnosticStationsModel } from "@/components/lessons/models/DiagnosticStationsModel";
import { M514_QUESTION_INSTANCES } from "@/data/lessons/m5-1-4-instances";
import type { LessonStage, LessonViewChannel } from "@/types/lessonPackage";

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

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
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
      </Card>

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
    </div>
  );
}
