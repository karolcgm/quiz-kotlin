"use client";

import type { ReactNode } from "react";

interface HomeSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  delay?: string;
  accent?: "indigo" | "violet" | "emerald";
}

const accentMap = {
  indigo: "from-indigo-500 to-violet-500",
  violet: "from-violet-500 to-purple-500",
  emerald: "from-emerald-500 to-teal-500",
};

export function HomeSection({ title, description, children, delay = "0ms", accent = "indigo" }: HomeSectionProps) {
  return (
    <section className="home-section-reveal mt-14 sm:mt-16" style={{ animationDelay: delay }}>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className={`mb-3 h-1 w-12 rounded-full bg-gradient-to-r ${accentMap[accent]}`} />
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-lg text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

interface HomeStepsProps {
  steps: string[];
}

export function HomeSteps({ steps }: HomeStepsProps) {
  return (
    <div className="home-section-reveal mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "400ms" }}>
      {steps.map((step, index) => (
        <div
          key={step}
          className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60"
        >
          <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white shadow-md shadow-indigo-500/30">
            {index + 1}
          </span>
          <p className="font-semibold leading-relaxed text-slate-800">{step}</p>
          <div className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full bg-indigo-200/20 blur-2xl transition group-hover:bg-indigo-300/30" />
        </div>
      ))}
    </div>
  );
}
