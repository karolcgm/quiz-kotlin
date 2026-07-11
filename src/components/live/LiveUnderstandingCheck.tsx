"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { UnderstandingCheck } from "@/components/lessons/UnderstandingCheck";
import { submitLiveLessonUnderstandingAction } from "@/lib/actions/lessonSessions";
import type { UnderstandingLevel } from "@/types/understanding";

export function LiveUnderstandingCheck({
  sessionId,
  initialValue = null,
  onSaved,
}: {
  sessionId: string;
  initialValue?: UnderstandingLevel | null;
  onSaved?: (value: UnderstandingLevel) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState<UnderstandingLevel | null>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (nextValue: UnderstandingLevel) => {
    setValue(nextValue);
    setError(null);
    startTransition(async () => {
      const response = await submitLiveLessonUnderstandingAction(sessionId, nextValue);
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setValue(response.understandingLevel);
      onSaved?.(response.understandingLevel);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <UnderstandingCheck value={value} onChange={submit} disabled={pending} />
      {pending ? <p className="text-center text-sm font-bold text-indigo-700">Zapisuję odpowiedź…</p> : null}
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-center text-sm font-bold text-rose-800">{error}</p> : null}
    </div>
  );
}
