"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createLessonSessionAction } from "@/lib/actions/lessonSessions";
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
}

export function StartLiveLessonForm({ lessonId, classes, lockedClassId }: StartLiveLessonFormProps) {
  const router = useRouter();
  const [classId, setClassId] = useState(lockedClassId ?? classes[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
