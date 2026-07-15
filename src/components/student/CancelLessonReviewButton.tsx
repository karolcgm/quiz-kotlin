"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelStudentLessonReviewAction } from "@/lib/actions/studentLearningPlan";

export function CancelLessonReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function cancelReview() {
    if (!window.confirm("Zamknąć to rozpoczęte podejście? Dotychczasowe odpowiedzi nie zwiększą wyniku.")) return;
    setError(null);
    startTransition(async () => {
      const result = await cancelStudentLessonReviewAction(reviewId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={cancelReview}
        className="min-h-12 rounded-xl border border-rose-200 bg-rose-50 px-5 text-sm font-black text-rose-800 disabled:cursor-wait disabled:opacity-60"
        title="Zamknij to podejście bez zapisywania wyniku"
      >
        {pending ? "Zamykanie…" : "Zamknij podejście"}
      </button>
      {error ? <p role="alert" className="mt-2 max-w-xs text-xs font-bold text-rose-700">{error}</p> : null}
    </div>
  );
}
