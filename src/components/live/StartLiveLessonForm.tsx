"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createLessonSessionAction, endLessonSessionAction } from "@/lib/actions/lessonSessions";
import { storeJoinCode } from "@/lib/live/teacherView";

interface ClassOption {
  id: string;
  name: string;
  group_name: string;
  school_name: string;
}

interface StartLiveLessonFormProps {
  lessonId: string;
  classes: ClassOption[];
  lockedClassId?: string;
  activeSession?: {
    id: string;
    lessonId: string;
    lessonTitle: string;
    status: "draft" | "lobby" | "live" | "paused";
    startedAt: string | null;
    expiresAt: string | null;
    classLabel: string;
  };
}

export function StartLiveLessonForm({ lessonId, classes, lockedClassId, activeSession }: StartLiveLessonFormProps) {
  const router = useRouter();
  const [classId, setClassId] = useState(lockedClassId ?? classes[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (activeSession) {
    return <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 shadow-sm">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-amber-800">Masz aktywną sesję</p>
        <h2 className="mt-1 text-xl font-black text-amber-950">{activeSession.lessonTitle}</h2>
        <p className="mt-1 text-sm text-amber-900">{activeSession.classLabel} · status: {activeSession.status}</p>
        <p className="mt-2 text-sm text-amber-800">Nie możesz utworzyć nowej sesji, dopóki ta nie zostanie zakończona. Po rozpoczęciu obowiązuje limit 45 minut.</p>
      </div>
      {error ? <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-900" role="alert">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={pending} onClick={() => router.push(`/nauczyciel/sesje/${activeSession.id}/prowadz`)} className="min-h-14 rounded-xl bg-indigo-600 px-4 text-base font-black text-white hover:bg-indigo-700 disabled:opacity-60">Wróć do sesji</button>
        <button type="button" disabled={pending} onClick={() => startTransition(async () => {
          setError(null);
          const result = await endLessonSessionAction(activeSession.id, false);
          if (!result.ok) { setError(result.error ?? "Nie udało się zakończyć sesji."); return; }
          router.refresh();
        })} className="min-h-14 rounded-xl border-2 border-rose-300 bg-white px-4 text-base font-black text-rose-700 hover:bg-rose-50 disabled:opacity-60">{pending ? "Zamykanie…" : "Zamknij sesję"}</button>
      </div>
    </div>;
  }

  if (classes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
        Najpierw dodaj klasę w sekcji Uczniowie, aby rozpocząć sesję na żywo.
      </p>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createLessonSessionAction({ classId, lessonId });
      if (!result.ok || !result.sessionId || !result.joinCode) {
        setError(result.error ?? "Nie udało się utworzyć sesji.");
        return;
      }

      storeJoinCode(result.sessionId, result.joinCode);
      router.push(
        `/nauczyciel/sesje/${result.sessionId}/prowadz?code=${encodeURIComponent(result.joinCode)}`,
      );
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {lockedClassId ? (
        <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-950">
          <p className="font-semibold">Aktywność zostanie przypisana całej wybranej klasie.</p>
          <p className="mt-1">{classes[0] ? `${classes[0].school_name} · ${classes[0].name} / ${classes[0].group_name}` : "Wybrana klasa"}</p>
        </div>
      ) : (
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Klasa / grupa</span>
          <select
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            required
          >
            {classes.map((teacherClass) => (
              <option key={teacherClass.id} value={teacherClass.id}>
                {teacherClass.school_name} · {teacherClass.name} / {teacherClass.group_name}
              </option>
            ))}
          </select>
        </label>
      )}

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !classId}
        className="min-h-12 w-full rounded-xl bg-[var(--brand-600)] text-sm font-bold text-white hover:bg-[var(--brand-700)] disabled:opacity-60"
      >
        {pending ? "Tworzenie aktywności…" : "Uruchom aktywność live"}
      </button>
    </form>
  );
}
