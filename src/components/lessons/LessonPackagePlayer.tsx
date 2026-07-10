"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { LessonStageRail } from "@/components/lessons/LessonStageRail";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { TeacherGuidePanel } from "@/components/lessons/TeacherGuidePanel";
import type { OrderDirectorModelState } from "@/components/lessons/models/OrderDirectorModel";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { LessonPackage, LessonViewChannel } from "@/types/lessonPackage";

type PlayerMode = "play" | "prep";

interface LessonPackagePlayerProps {
  lesson: LessonPackage;
  mode: PlayerMode;
}

const CHANNELS: { id: LessonViewChannel; label: string }[] = [
  { id: "board", label: "Tablica" },
  { id: "student", label: "Uczeń" },
  { id: "print", label: "Druk" },
];

export function LessonPackagePlayer({ lesson, mode }: LessonPackagePlayerProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [completedThrough, setCompletedThrough] = useState(0);
  const [channel, setChannel] = useState<LessonViewChannel>("board");
  const [revealByStage, setRevealByStage] = useState<Record<string, number>>({});
  const [modelStateByStage, setModelStateByStage] = useState<Record<string, OrderDirectorModelState>>({});

  const stage = lesson.stages[stageIndex];
  const revealIndex = revealByStage[stage.id] ?? 0;
  const maxReveal = Math.max(0, stage.revealSteps.length - 1);

  const goStage = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, lesson.stages.length - 1));
      setStageIndex(clamped);
      if (clamped > completedThrough) setCompletedThrough(clamped);
    },
    [completedThrough, lesson.stages.length],
  );

  const updateModelState = useCallback((stageId: string, state: OrderDirectorModelState) => {
    setModelStateByStage((current) => ({ ...current, [stageId]: state }));
  }, []);

  const prepHref = `/nauczyciel/lekcje/${lesson.id}/przygotuj`;
  const playHref = `/nauczyciel/lekcje/${lesson.id}`;

  const stageNote = lesson.teacherGuide.stageNotes[stage.id];

  const headerMeta = useMemo(
    () => `${lesson.topicId} · ${lesson.estimatedMinutes} min · v${lesson.version}`,
    [lesson],
  );

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="learn">Pakiet lekcji</Badge>
          <Badge tone="brand">{lesson.topicId}</Badge>
          {mode === "prep" ? <Badge tone="assess">Przygotowanie</Badge> : <Badge tone="success">Prowadzenie</Badge>}
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[var(--ink)]">{lesson.title}</h2>
            <p className="text-sm text-[var(--ink-muted)]">{lesson.studentGoal}</p>
            <p className="font-mono text-xs text-[var(--ink-muted)]">{headerMeta}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {mode === "prep" ? (
              <Link
                href={playHref}
                className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] bg-[var(--brand-600)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-700)]"
              >
                Podgląd prowadzenia
              </Link>
            ) : (
              <Link
                href={prepHref}
                className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Przygotuj lekcję
              </Link>
            )}
            <Link
              href={`/nauczyciel/lekcje/${lesson.id}/druk`}
              className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Materiały drukowane
            </Link>
            <Link
              href={`/nauczyciel/lekcje/${lesson.id}/generator`}
              className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-900 hover:bg-violet-100"
            >
              Generator A/B
            </Link>
            {mode === "play" ? (
              <Link
                href={`/nauczyciel/lekcje/${lesson.id}/sesja`}
                className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Rozpocznij na żywo
              </Link>
            ) : null}
            <Link
              href="/nauczyciel/lekcje"
              className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Biblioteka
            </Link>
          </div>
        </div>
      </header>

      {mode === "prep" ? <TeacherGuidePanel lesson={lesson} activeStageId={stage.id} /> : null}

      <LessonStageRail
        stages={lesson.stages}
        activeIndex={stageIndex}
        completedThrough={completedThrough}
        onSelect={goStage}
      />

      <div className="flex flex-wrap gap-2">
        {CHANNELS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setChannel(item.id)}
            className={`min-h-12 rounded-xl px-4 text-sm font-bold ${
              channel === item.id
                ? "bg-[var(--brand-600)] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <LessonStageView
            lessonId={lesson.id}
            stage={stage}
            channel={channel}
            revealIndex={revealIndex}
            readOnly={mode === "prep" && channel === "student"}
            showHints={mode === "prep" && channel === "board"}
            showDebug={mode === "prep"}
            modelState={modelStateByStage[stage.id]}
            onModelStateChange={(state) => updateModelState(stage.id, state)}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={stageIndex === 0}
              onClick={() => goStage(stageIndex - 1)}
              className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold disabled:opacity-40"
            >
              ← Wstecz
            </button>

            {stage.revealSteps.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={revealIndex === 0}
                  onClick={() =>
                    setRevealByStage((c) => ({ ...c, [stage.id]: Math.max(0, revealIndex - 1) }))
                  }
                  className="min-h-10 rounded-lg border border-slate-200 px-3 text-xs font-bold disabled:opacity-40"
                >
                  Cofnij krok
                </button>
                <span className="text-xs text-slate-500">
                  {stage.revealSteps[revealIndex]?.label ?? "Start"}
                </span>
                <button
                  type="button"
                  disabled={revealIndex >= maxReveal}
                  onClick={() =>
                    setRevealByStage((c) => ({
                      ...c,
                      [stage.id]: Math.min(maxReveal, revealIndex + 1),
                    }))
                  }
                  className="min-h-10 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white disabled:opacity-40"
                >
                  Odsłoń
                </button>
              </div>
            ) : null}

            <button
              type="button"
              disabled={stageIndex >= lesson.stages.length - 1}
              onClick={() => goStage(stageIndex + 1)}
              className="min-h-12 rounded-xl bg-[var(--brand-600)] px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              Dalej →
            </button>
          </div>
        </div>

        <aside className="space-y-3">
          <Card className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Instrukcja etapu</p>
            <p className="text-sm font-medium text-slate-900">{stage.teacherInstruction}</p>
            {stageNote ? <p className="text-xs text-slate-600">{stageNote}</p> : null}
          </Card>

          {mode === "prep" ? (
            <Card muted className="space-y-2 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Różnicowanie</p>
              <p>
                <strong>Start:</strong> {lesson.teacherGuide.differentiation.support}
              </p>
              <p>
                <strong>Rdzeń:</strong> {lesson.teacherGuide.differentiation.core}
              </p>
              <p>
                <strong>Mistrzowskie:</strong> {lesson.teacherGuide.differentiation.challenge}
              </p>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
