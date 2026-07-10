"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { joinLessonSessionAction } from "@/lib/actions/lessonSessions";

interface StudentJoinSessionFormProps {
  sessionId: string;
  initialCode?: string;
}

export function StudentJoinSessionForm({ sessionId, initialCode = "" }: StudentJoinSessionFormProps) {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await joinLessonSessionAction({
        sessionId,
        joinCode: joinCode.trim(),
      });

      if (!result.ok) {
        setError(result.error ?? "Nie udało się dołączyć.");
        return;
      }

      router.push(`/uczen/sesja/${sessionId}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Kod dołączenia (6 cyfr)</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={joinCode}
          onChange={(event) => setJoinCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          autoComplete="one-time-code"
          aria-invalid={error ? true : undefined}
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || joinCode.length !== 6}
        className="min-h-12 w-full rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Dołączanie…" : "Dołącz"}
      </button>
    </form>
  );
}
