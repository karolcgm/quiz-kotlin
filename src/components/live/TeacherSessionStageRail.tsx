"use client";

import { cn } from "@/lib/cn";
import type { LessonSessionStageSnapshot } from "@/types/lessonSession";
import { LESSON_STAGE_KIND_LABELS, type LessonStageKind } from "@/types/lessonPackage";

interface TeacherSessionStageRailProps {
  stages: LessonSessionStageSnapshot[];
  activeIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function TeacherSessionStageRail({
  stages,
  activeIndex,
  onSelect,
  disabled = false,
}: TeacherSessionStageRailProps) {
  return (
    <nav aria-label="Etapy lekcji" className="overflow-x-auto pb-1">
      <ol className="flex min-w-max gap-2">
        {stages.map((stage, index) => {
          const isActive = index === activeIndex;
          const kindLabel =
            stage.kind in LESSON_STAGE_KIND_LABELS
              ? LESSON_STAGE_KIND_LABELS[stage.kind as LessonStageKind]
              : stage.kind;

          return (
            <li key={stage.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(index)}
                className={cn(
                  "flex min-h-12 flex-col items-start rounded-xl border px-3 py-2 text-left transition sm:min-w-[7.5rem]",
                  isActive
                    ? "border-[var(--brand-600)] bg-indigo-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300",
                  disabled && "opacity-60",
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{kindLabel}</span>
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
