"use client";

import { cn } from "@/lib/cn";
import type { LessonStage, LessonStageKind } from "@/types/lessonPackage";
import { LESSON_STAGE_KIND_LABELS } from "@/types/lessonPackage";

interface LessonStageRailProps {
  stages: LessonStage[];
  activeIndex: number;
  completedThrough: number;
  onSelect: (index: number) => void;
}

export function LessonStageRail({
  stages,
  activeIndex,
  completedThrough,
  onSelect,
}: LessonStageRailProps) {
  return (
    <nav aria-label="Etapy lekcji" className="overflow-x-auto pb-1">
      <ol className="flex min-w-max gap-2">
        {stages.map((stage, index) => {
          const isActive = index === activeIndex;
          const isDone = index < completedThrough;
          return (
            <li key={stage.id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "flex min-h-12 flex-col items-start rounded-xl border px-3 py-2 text-left transition sm:min-w-[7.5rem]",
                  isActive
                    ? "border-[var(--brand-600)] bg-indigo-50 shadow-sm"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50/80"
                      : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {LESSON_STAGE_KIND_LABELS[stage.kind as LessonStageKind]}
                </span>
                <span className="text-xs font-semibold text-slate-900">{stage.title}</span>
                <span className="text-[10px] text-slate-500">{stage.estimatedMinutes} min</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
