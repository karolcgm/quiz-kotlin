"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { UnderstandingCheck } from "@/components/lessons/UnderstandingCheck";
import { submitLiveLessonUnderstandingAction } from "@/lib/actions/lessonSessions";
import type { UnderstandingAssessmentResult, UnderstandingLevel } from "@/types/understanding";

export function LiveUnderstandingCheck({
  sessionId,
  initialValue = null,
  assessment,
  onSaved,
}: {
  sessionId: string;
  initialValue?: UnderstandingLevel | null;
  assessment?: UnderstandingAssessmentResult;
  onSaved?: (value: UnderstandingLevel) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState<UnderstandingLevel | null>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(Boolean(initialValue));
  const [queued, setQueued] = useState(false);
  const [pending, startTransition] = useTransition();
  const storageKey = `lekcjalab:understanding:${sessionId}`;

  useEffect(() => {
    if (initialValue || typeof window === "undefined") return;
    const restoreDraft = window.setTimeout(() => {
      const draft = window.localStorage.getItem(storageKey);
      if (draft === "understood" || draft === "partial" || draft === "not_understood") setValue(draft);
      setQueued(window.localStorage.getItem(`${storageKey}:queued`) === "1");
    }, 0);
    return () => window.clearTimeout(restoreDraft);
  }, [initialValue, storageKey]);

  const choose = (nextValue: UnderstandingLevel) => {
    setValue(nextValue);
    setSaved(false);
    setError(null);
    window.localStorage.setItem(storageKey, nextValue);
  };

  const submit = useCallback(() => {
    if (!value || pending) return;
    setQueued(true);
    window.localStorage.setItem(`${storageKey}:queued`, "1");
    startTransition(async () => {
      const response = await submitLiveLessonUnderstandingAction(sessionId, value);
      if (!response.ok) {
        setError(`${response.error} Odpowiedź została zachowana na tym urządzeniu; spróbujemy ponownie po odzyskaniu połączenia.`);
        return;
      }
      setValue(response.understandingLevel);
      setSaved(true);
      setQueued(false);
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(`${storageKey}:queued`);
      onSaved?.(response.understandingLevel);
      router.refresh();
    });
  }, [onSaved, pending, router, sessionId, storageKey, value]);

  useEffect(() => {
    if (!queued || saved) return;
    const retry = () => submit();
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [queued, saved, submit]);

  return (
    <div className="space-y-3">
      <UnderstandingCheck value={value} onChange={choose} disabled={pending || saved} assessment={assessment} />
      <button
        type="button"
        disabled={!value || pending || saved}
        onClick={submit}
        className="min-h-14 w-full rounded-xl bg-indigo-600 px-5 text-lg font-black text-white disabled:bg-slate-300"
      >
        {pending ? "Zapisuję odpowiedź…" : saved ? "Odpowiedź zapisana" : "Zapisz samoocenę"}
      </button>
      <div aria-live="polite">
        {saved ? <p className="rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-900">Samoocena zapisana. Punkty za zadanie nie zostały zmienione.</p> : null}
        {error ? <p className="rounded-xl bg-amber-50 p-3 text-center text-sm font-bold text-amber-900">{error}</p> : null}
      </div>
    </div>
  );
}
