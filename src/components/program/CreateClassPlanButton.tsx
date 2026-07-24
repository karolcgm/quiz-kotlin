"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClassCurriculumPlanAction } from "@/lib/actions/curriculumPlans";

export function CreateClassPlanButton({ classId, label = "Utwórz plan tej klasy" }: { classId: string; label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => {
        await createClassCurriculumPlanAction({ classId });
        router.refresh();
      })}
      className="mt-4 min-h-12 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
    >
      {pending ? "Tworzenie planu…" : label}
    </button>
  );
}
