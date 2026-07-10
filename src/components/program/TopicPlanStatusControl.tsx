"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTopicPlanEntryStatusAction } from "@/lib/actions/curriculumPlans";
import type { TopicPlanEntryStatus } from "@/types/program";

interface TopicPlanStatusControlProps {
  entryId: string;
  status: TopicPlanEntryStatus;
}

export function TopicPlanStatusControl({ entryId, status }: TopicPlanStatusControlProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isCompleted = status === "completed";

  function update(nextStatus: TopicPlanEntryStatus) {
    startTransition(async () => {
      await updateTopicPlanEntryStatusAction({ entryId, status: nextStatus });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isCompleted ? "bg-emerald-50 text-emerald-900" : "bg-slate-100 text-slate-700"}`}>
        {isCompleted ? "Wykonany" : status === "in_progress" ? "W toku" : "Zaplanowany"}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => update(isCompleted ? "in_progress" : "completed")}
        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
      >
        {pending ? "Zapisywanie…" : isCompleted ? "Cofnij wykonanie" : "Oznacz jako wykonany"}
      </button>
    </div>
  );
}
