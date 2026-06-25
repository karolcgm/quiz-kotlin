"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type PremiumSimulationMode = "demo" | "task" | "exercise";

interface PremiumSimulationFrameProps {
  title: string;
  subtitle: string;
  mode: PremiumSimulationMode;
  onModeChange: (mode: PremiumSimulationMode) => void;
  children: ReactNode;
  controls?: ReactNode;
  feedback?: string | null;
  feedbackSuccess?: boolean;
  slug: string;
  score?: { correct: number; total: number };
}

const MODE_LABELS: Record<PremiumSimulationMode, string> = {
  demo: "Prezentacja",
  task: "Zadanie",
  exercise: "Ćwiczenie",
};

export function PremiumSimulationFrame({
  title,
  subtitle,
  mode,
  onModeChange,
  children,
  controls,
  feedback,
  feedbackSuccess,
  slug,
  score,
}: PremiumSimulationFrameProps) {
  return (
    <div className="premium-sim space-y-6">
      <section className="premium-sim-hero relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="premium-sim-aurora pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-200">LekcjaLab</p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h2>
            <p className="mt-2 max-w-xl text-sm text-indigo-100/90 sm:text-base">{subtitle}</p>
          </div>
          {score && mode === "exercise" && (
            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-center backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Wynik</p>
              <p className="text-3xl font-black text-emerald-300">
                {score.correct}/{score.total}
              </p>
            </div>
          )}
        </div>

        <div className="relative z-10 mt-6 flex flex-wrap gap-2">
          {(["demo", "task", "exercise"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onModeChange(item)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                mode === item
                  ? "bg-white text-indigo-700 shadow-lg"
                  : "border border-white/25 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {MODE_LABELS[item]}
            </button>
          ))}
          <Link
            href={`/nauczyciel/testy/nowy?widget=${slug}&purpose=exercise`}
            className="rounded-xl border border-emerald-300/40 bg-emerald-400/20 px-4 py-2.5 text-sm font-bold text-emerald-100 transition hover:bg-emerald-400/30"
          >
            Utwórz test →
          </Link>
        </div>
      </section>

      <div className="premium-sim-visual assignment-glass overflow-hidden rounded-[1.75rem] p-4 sm:p-6">
        {children}
      </div>

      {controls && (
        <div className="assignment-glass rounded-[1.75rem] p-5 sm:p-6">{controls}</div>
      )}

      {feedback && (
        <div
          className={`premium-sim-feedback rounded-2xl p-5 text-center text-lg font-bold ${
            feedbackSuccess
              ? "border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900"
              : "border border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {feedbackSuccess && <span className="mr-2 text-2xl">🎉</span>}
          {feedback}
        </div>
      )}
    </div>
  );
}
