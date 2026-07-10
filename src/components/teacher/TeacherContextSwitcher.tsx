"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setTeacherContextAction,
  type SelectedTeacherContext,
  type TeacherClassContext,
} from "@/lib/teacher/context";

interface TeacherContextSwitcherProps {
  classes: TeacherClassContext[];
  selected: SelectedTeacherContext;
}

function classLabel(item: TeacherClassContext) {
  return `${item.name}${item.groupName ? ` · ${item.groupName}` : ""}`;
}

export function TeacherContextSwitcher({ classes, selected }: TeacherContextSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(!selected.selectedByUser && classes.length > 0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const currentLabel = selected.mode === "class" ? classLabel(selected.class) : "Ogólne";
  const currentSchool = selected.mode === "class" ? selected.class.schoolName : "Wszystkie Twoje szkoły";

  function choose(value: "general" | `class:${string}`) {
    setError(null);
    startTransition(async () => {
      try {
        await setTeacherContextAction(value);
        setOpen(false);
        router.push(value === "general" ? "/nauczyciel" : `/nauczyciel?classId=${value.slice("class:".length)}`);
        router.refresh();
      } catch {
        setError("Nie udało się zmienić kontekstu. Spróbuj ponownie.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm transition hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Kontekst pracy</span>
        <span className="block font-bold text-slate-900">{currentLabel}</span>
        <span className="block text-xs text-slate-500">{currentSchool}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-context-title"
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Po zalogowaniu</p>
            <h2 id="teacher-context-title" className="mt-2 text-2xl font-black text-slate-950">
              Wybierz kontekst pracy
            </h2>
            <p className="mt-2 text-slate-600">
              Wybór klasy ustawia uczniów, plan tematów i aktywności live. W trybie ogólnym przygotujesz materiały i zarządzisz klasami.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => choose("general")}
                className="rounded-2xl border-2 border-slate-200 p-5 text-left transition hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-60"
              >
                <span className="block text-lg font-black text-slate-900">Ogólne</span>
                <span className="mt-1 block text-sm text-slate-600">Klasy, materiały i wiadomości.</span>
              </button>
              {classes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={pending}
                  onClick={() => choose(`class:${item.id}`)}
                  className="rounded-2xl border-2 border-slate-200 p-5 text-left transition hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-60"
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{item.schoolName}</span>
                  <span className="mt-1 block text-lg font-black text-slate-900">{classLabel(item)}</span>
                  <span className="mt-1 block text-sm text-slate-600">Klasa {item.grade} · uczniowie, plan i aktywności.</span>
                </button>
              ))}
            </div>

            {error ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">{error}</p> : null}
            {selected.selectedByUser ? (
              <button type="button" onClick={() => setOpen(false)} className="mt-6 text-sm font-semibold text-slate-600 hover:text-slate-900">
                Anuluj
              </button>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
