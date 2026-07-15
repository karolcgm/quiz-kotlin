"use client";

import { useState } from "react";
import {
  canDeliverDiagnosticSolution,
  diagnosticHighlightAttributes,
  diagnosticHighlightLabel,
} from "@/lib/lessons/diagnosticFeedback";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightAccent,
  DiagnosticHighlightPattern,
  DiagnosticHighlightState,
  DiagnosticHighlightTarget,
  DiagnosticSolution,
  PublicLessonGradeResult,
} from "@/types/diagnosticFeedback";

const STATUS_PRESENTATION: Record<
  PublicLessonGradeResult["status"],
  { icon: string; label: string; className: string }
> = {
  correct: {
    icon: "✓",
    label: "Poprawna odpowiedź",
    className: "border-emerald-300 bg-emerald-50 text-emerald-950",
  },
  "partially-correct": {
    icon: "◐",
    label: "Częściowo poprawna odpowiedź",
    className: "border-amber-300 bg-amber-50 text-amber-950",
  },
  incorrect: {
    icon: "!",
    label: "Odpowiedź wymaga poprawy",
    className: "border-rose-300 bg-rose-50 text-rose-950",
  },
  "manual-review": {
    icon: "✎",
    label: "Odpowiedź czeka na ręczną recenzję",
    className: "border-violet-300 bg-violet-50 text-violet-950",
  },
};

const ACCENT_CLASSES: Record<DiagnosticHighlightAccent, string> = {
  indigo: "border-indigo-500 bg-indigo-50 text-indigo-950",
  amber: "border-amber-500 bg-amber-50 text-amber-950",
  cyan: "border-cyan-600 bg-cyan-50 text-cyan-950",
  violet: "border-violet-500 bg-violet-50 text-violet-950",
};

const PATTERN_CLASSES: Record<DiagnosticHighlightPattern, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
  double: "border-double",
};

const STATE_CLASSES: Record<DiagnosticHighlightState, string> = {
  active: "border-2",
  correct: "border-2 ring-2 ring-emerald-600 ring-offset-2",
  attention: "border-4 motion-safe:animate-pulse motion-reduce:animate-none",
  "crossed-out": "border-2 opacity-80",
};

const KIND_LABELS: Record<DiagnosticHighlightTarget["kind"], string> = {
  field: "pole",
  pair: "para",
  edge: "krawędź",
  vertex: "wierzchołek",
};

export function DiagnosticHighlightLayer({ targets }: { targets: DiagnosticHighlightTarget[] }) {
  if (targets.length === 0) return null;

  return (
    <section aria-labelledby="diagnostic-highlights-heading" className="rounded-2xl border border-slate-200 bg-white p-4">
      <h4 id="diagnostic-highlights-heading" className="text-sm font-black text-slate-950">
        Elementy wskazane na modelu
      </h4>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="Dostępne etykiety podświetleń">
        {targets.map((target) => (
          <li
            key={target.id}
            {...diagnosticHighlightAttributes(target)}
            className={`relative min-h-14 overflow-hidden rounded-xl px-3 py-2 ${ACCENT_CLASSES[target.accent]} ${PATTERN_CLASSES[target.pattern]} ${STATE_CLASSES[target.state]}`}
          >
            {target.state === "crossed-out" ? (
              <span aria-hidden className="pointer-events-none absolute left-[-10%] top-1/2 h-0.5 w-[120%] -rotate-12 bg-current" />
            ) : null}
            <span className="relative flex items-center gap-3">
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-current bg-white font-black">
                {target.state === "correct" ? "✓" : target.symbol}
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-black uppercase tracking-wide">{KIND_LABELS[target.kind]} · {target.symbol}</span>
                <span className="block text-sm font-bold">{target.label}</span>
              </span>
            </span>
            <span className="sr-only">{diagnosticHighlightLabel(target)} Elementy: {target.memberIds.join(", ")}.</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const HELP_STEPS: Array<{
  key: keyof DiagnosticFeedbackCopy;
  label: string;
}> = [
  { key: "area", label: "1. Miejsce wymagające uwagi" },
  { key: "guidingQuestion", label: "2. Pytanie naprowadzające" },
  { key: "visualHint", label: "3. Podpowiedź wizualna" },
  { key: "analogousExample", label: "4. Analogiczny przykład" },
];

interface DiagnosticFeedbackPanelBaseProps {
  result: PublicLessonGradeResult;
  copy: DiagnosticFeedbackCopy;
  highlights?: DiagnosticHighlightTarget[];
}

type DiagnosticFeedbackPanelProps = DiagnosticFeedbackPanelBaseProps & (
  | {
      mode: "practice";
      submitted: boolean;
      assessmentEnded?: boolean;
      solution?: DiagnosticSolution;
    }
  | {
      mode: "assessment";
      submitted: false;
      assessmentEnded?: false;
      /** Zakaz kompilacyjny: rozwiązanie nie może wejść do propsów klienta przed oddaniem. */
      solution?: never;
    }
  | {
      mode: "assessment";
      submitted: true;
      assessmentEnded?: boolean;
      solution?: DiagnosticSolution;
    }
  | {
      mode: "assessment";
      submitted: boolean;
      assessmentEnded: true;
      solution?: DiagnosticSolution;
    }
);

interface HelpProgress {
  feedbackKey: string;
  visibleStep: number;
  solutionRequested: boolean;
}

export function DiagnosticFeedbackPanel({
  result,
  copy,
  highlights = [],
  mode,
  submitted,
  assessmentEnded = false,
  solution,
}: DiagnosticFeedbackPanelProps) {
  const [storedProgress, setStoredProgress] = useState<HelpProgress>({
    feedbackKey: result.feedbackKey,
    visibleStep: 0,
    solutionRequested: false,
  });
  const progress = storedProgress.feedbackKey === result.feedbackKey
    ? storedProgress
    : { feedbackKey: result.feedbackKey, visibleStep: 0, solutionRequested: false };
  const status = STATUS_PRESENTATION[result.status];
  const canRequestSolution = Boolean(solution) && canDeliverDiagnosticSolution({ mode, submitted, assessmentEnded });
  const mayNeedHelp = result.status !== "correct";

  const showNextStep = () => {
    setStoredProgress({
      feedbackKey: result.feedbackKey,
      visibleStep: Math.min(HELP_STEPS.length - 1, progress.visibleStep + 1),
      solutionRequested: false,
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-labelledby={`diagnostic-feedback-${result.feedbackKey}`}>
      <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${status.className}`}>
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-current text-lg font-black">{status.icon}</span>
        <div>
          <h3 id={`diagnostic-feedback-${result.feedbackKey}`} className="font-black">{status.label}</h3>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">Wynik: {result.score}/{result.maxScore} pkt</p>
          {result.errorCodes.length > 0 ? <p className="sr-only">Kody diagnostyczne: {result.errorCodes.join(", ")}</p> : null}
        </div>
      </div>

      <DiagnosticHighlightLayer targets={highlights} />

      <ol className="space-y-2" aria-live="polite" aria-atomic="false">
        {HELP_STEPS.slice(0, progress.visibleStep + 1).map((step) => (
          <li key={step.key} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">{step.label}</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-800">{copy[step.key]}</p>
          </li>
        ))}
      </ol>

      {mayNeedHelp && progress.visibleStep < HELP_STEPS.length - 1 ? (
        <button
          type="button"
          onClick={showNextStep}
          className="min-h-12 rounded-xl border-2 border-indigo-300 bg-white px-4 text-sm font-black text-indigo-800 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          Potrzebuję następnej wskazówki
        </button>
      ) : null}

      {mayNeedHelp && progress.visibleStep === HELP_STEPS.length - 1 && canRequestSolution && !progress.solutionRequested ? (
        <button
          type="button"
          onClick={() => setStoredProgress({ ...progress, solutionRequested: true })}
          className="min-h-12 rounded-xl bg-indigo-700 px-4 text-sm font-black text-white hover:bg-indigo-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          Pokaż rozwiązanie krok po kroku
        </button>
      ) : null}

      {mayNeedHelp && mode === "assessment" && !canRequestSolution ? (
        <p className="rounded-xl bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-950">
          Rozwiązanie będzie dostępne po oddaniu odpowiedzi lub zakończeniu oceniania.
        </p>
      ) : null}

      {solution && progress.solutionRequested && canRequestSolution ? (
        <section className="rounded-xl border-2 border-indigo-300 bg-indigo-50 px-4 py-3" aria-label="Rozwiązanie krok po kroku">
          <h4 className="font-black text-indigo-950">5. Rozwiązanie na żądanie</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-semibold text-indigo-950">
            {solution.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </section>
      ) : null}
    </section>
  );
}
