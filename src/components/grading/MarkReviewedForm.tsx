"use client";

import { markSubmissionReviewedAction } from "@/lib/actions/grades";

interface MarkReviewedFormProps {
  submissionId: string;
  reviewed: boolean;
}

export function MarkReviewedForm({ submissionId, reviewed }: MarkReviewedFormProps) {
  if (reviewed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
        Sprawdzone — praca odhaczona w dzienniku.
      </div>
    );
  }

  return (
    <form action={markSubmissionReviewedAction} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-950">Czeka na sprawdzenie</p>
      <p className="mt-1 text-sm text-amber-900">
        Odhacz, gdy przejrzysz pracę — zniknie z listy „Do sprawdzenia” na panelu.
      </p>
      <input type="hidden" name="submissionId" value={submissionId} />
      <button
        type="submit"
        className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Odhacz jako sprawdzone
      </button>
    </form>
  );
}
