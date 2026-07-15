"use client";

import { useEffect, useRef, useState } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { createFractionDiagnosticResult } from "@/lib/math/fractions";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import type {
  DiagnosticHighlightAccent,
  DiagnosticHighlightPattern,
  DiagnosticHighlightTarget,
} from "@/types/diagnosticFeedback";
import type { FractionFeedbackCode } from "@/types/fractions";
import styles from "@/components/lessons/fractions/fractions.module.css";

export interface FractionOperationItem {
  id: string;
  label: string;
  numerator: number;
  denominator: number;
  wholePart?: number;
}
export interface FractionOperationConnector {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  symbol: string;
  pattern: DiagnosticHighlightPattern;
  accent: DiagnosticHighlightAccent;
}

export interface FractionOperationCrossOut {
  memberId: string;
  oldValue: number;
  newValue: number;
  label: string;
}

export interface FractionOperationStep {
  id: string;
  label: string;
  explanation: string;
  highlights?: DiagnosticHighlightTarget[];
  connectors?: FractionOperationConnector[];
  crossOuts?: FractionOperationCrossOut[];
  feedbackCode?: FractionFeedbackCode;
  feedbackMemberIds?: string[];
}

export interface FractionOperationDirectorProps {
  items: FractionOperationItem[];
  operator: "+" | "−" | "×" | ":" | "=";
  steps: FractionOperationStep[];
  activeStep?: number;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  title?: string;
}

const ACCENT = {
  indigo: "border-indigo-600 bg-indigo-50 text-indigo-950",
  amber: "border-amber-600 bg-amber-50 text-amber-950",
  cyan: "border-cyan-700 bg-cyan-50 text-cyan-950",
  violet: "border-violet-600 bg-violet-50 text-violet-950",
} as const;

const PATTERN: Record<DiagnosticHighlightPattern, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
  double: "border-double",
};

function operationMemberId(itemId: string, part: "whole" | "numerator" | "denominator") {
  return `${itemId}-${part}`;
}

function highlightFor(memberId: string, highlights: DiagnosticHighlightTarget[]) {
  return highlights.find((highlight) => highlight.memberIds.includes(memberId));
}

function MemberValue({
  memberId,
  value,
  highlights,
  crossOuts,
}: {
  memberId: string;
  value: number;
  highlights: DiagnosticHighlightTarget[];
  crossOuts: FractionOperationCrossOut[];
}) {
  const highlight = highlightFor(memberId, highlights);
  const crossOut = crossOuts.find((entry) => entry.memberId === memberId);
  const highlightClass = highlight
    ? `${ACCENT[highlight.accent]} ${PATTERN[highlight.pattern]} ${highlight.state === "attention" ? "border-4" : "border-2"}`
    : "border-2 border-slate-300 bg-white text-slate-950";
  return (
    <span
      className={`relative inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl px-2 text-xl font-black ${highlightClass}`}
      data-operation-member={memberId}
      data-highlight-symbol={highlight?.symbol}
      aria-label={highlight ? `${memberId}: ${value}. ${highlight.label}. Symbol ${highlight.symbol}.` : `${memberId}: ${value}`}
    >
      {crossOut ? (
        <span className="flex items-center gap-2">
          <span className={styles.crossedValue}>{crossOut.oldValue}</span>
          <span aria-hidden>→</span>
          <span className="grid min-h-10 min-w-10 place-items-center rounded-lg border-2 border-current bg-white px-2" aria-label={`Nowa wartość: ${crossOut.newValue}`}>
            {crossOut.newValue}
          </span>
          <span className="sr-only">{crossOut.label}</span>
        </span>
      ) : value}
      {highlight ? <span className="absolute -right-2 -top-3 grid size-7 place-items-center rounded-full border-2 border-current bg-white text-xs">{highlight.symbol}</span> : null}
    </span>
  );
}

/** Steruje dydaktycznymi krokami bez automatycznego ujawniania następnych warstw. */
export function FractionOperationDirector({
  items,
  operator,
  steps,
  activeStep,
  initialStep = 0,
  onStepChange,
  title = "Działanie na ułamkach krok po kroku",
}: FractionOperationDirectorProps) {
  if (items.length === 0) throw new Error("Director wymaga co najmniej jednego ułamka.");
  if (steps.length === 0) throw new Error("Director wymaga co najmniej jednego kroku.");
  const [internalStep, setInternalStep] = useState(Math.max(0, Math.min(steps.length - 1, initialStep)));
  const currentIndex = Math.max(0, Math.min(steps.length - 1, activeStep ?? internalStep));
  const current = steps[currentIndex];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef(currentIndex);
  const highlights = current.highlights ?? [];
  const crossOuts = current.crossOuts ?? [];

  useEffect(() => {
    if (previousStepRef.current === currentIndex) return;
    previousStepRef.current = currentIndex;
    headingRef.current?.focus({ preventScroll: true });
  }, [currentIndex]);

  const chooseStep = (next: number) => {
    const bounded = Math.max(0, Math.min(steps.length - 1, next));
    if (activeStep === undefined) setInternalStep(bounded);
    onStepChange?.(bounded);
  };

  const diagnostic = current.feedbackCode
    ? createFractionDiagnosticResult(current.feedbackCode, { memberIds: current.feedbackMemberIds })
    : null;

  return (
    <section className="space-y-5 rounded-3xl border-2 border-slate-200 bg-white p-4 sm:p-6" aria-label={title}>
      <header>
        <p className="text-xs font-black uppercase tracking-[.16em] text-indigo-700">Krok {currentIndex + 1} z {steps.length}</p>
        <h3 ref={headingRef} tabIndex={-1} className="mt-1 text-xl font-black text-slate-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-600">
          {current.label}
        </h3>
        <p className="mt-2 font-semibold leading-relaxed text-slate-700" aria-live="polite">{current.explanation}</p>
      </header>

      <div className={`${styles.operationWorkspace} flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-slate-50 p-4`}>
        {items.map((item, index) => (
          <div key={item.id} className="contents">
            {index > 0 ? <span className="text-3xl font-black text-slate-800" aria-label={`operator ${operator}`}>{operator}</span> : null}
            <div className="flex items-center gap-2" data-operation-item={item.id}>
              {item.wholePart !== undefined ? (
                <MemberValue memberId={operationMemberId(item.id, "whole")} value={item.wholePart} highlights={highlights} crossOuts={crossOuts} />
              ) : null}
              <div className="grid justify-items-stretch gap-1">
                <MemberValue memberId={operationMemberId(item.id, "numerator")} value={item.numerator} highlights={highlights} crossOuts={crossOuts} />
                <span className="h-[3px] min-w-12 rounded-full bg-slate-950" aria-hidden />
                <MemberValue memberId={operationMemberId(item.id, "denominator")} value={item.denominator} highlights={highlights} crossOuts={crossOuts} />
              </div>
              <span className="sr-only">{item.label}: {item.wholePart !== undefined ? `${item.wholePart} ` : ""}{item.numerator}/{item.denominator}</span>
            </div>
          </div>
        ))}
      </div>

      {current.connectors?.length ? (
        <section aria-label="Łączniki aktywnego kroku" className="grid gap-3 md:grid-cols-2">
          {current.connectors.map((connector) => (
            <div
              key={connector.id}
              className={`rounded-xl border-2 p-3 ${ACCENT[connector.accent]} ${PATTERN[connector.pattern]}`}
              data-connector-from={connector.fromId}
              data-connector-to={connector.toId}
            >
              <div className="flex items-center gap-3" aria-label={`${connector.label}. Od ${connector.fromId} do ${connector.toId}. Symbol ${connector.symbol}.`}>
                <span className="text-xs font-black">{connector.fromId}</span>
                <span className={`h-0 flex-1 border-t-[3px] ${PATTERN[connector.pattern]}`} aria-hidden />
                <span className="grid size-8 place-items-center rounded-full border-2 border-current bg-white font-black" aria-hidden>{connector.symbol}</span>
                <span className="text-xs font-black">{connector.toId}</span>
              </div>
              <p className="mt-2 text-sm font-bold">{connector.label}</p>
            </div>
          ))}
        </section>
      ) : null}

      <InteractionAlternativePanel
        title="Sterowanie krokami"
        instruction="Użyj przycisków zamiast gestu. Po zmianie kroku focus przechodzi do jego nagłówka."
      >
        <div className={`${styles.directorControls} flex w-full flex-wrap gap-2`}>
          <button type="button" disabled={currentIndex === 0} onClick={() => chooseStep(currentIndex - 1)} className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-4 font-black text-slate-800 disabled:opacity-40">← Poprzedni krok</button>
          <button type="button" disabled={currentIndex === steps.length - 1} onClick={() => chooseStep(currentIndex + 1)} className="min-h-12 flex-1 rounded-xl bg-indigo-700 px-4 font-black text-white disabled:bg-slate-300">Następny krok →</button>
          <button type="button" onClick={() => chooseStep(0)} className="min-h-12 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 font-black text-amber-950">Resetuj</button>
        </div>
      </InteractionAlternativePanel>

      {diagnostic ? (
        <DiagnosticFeedbackPanel
          result={toPublicLessonGradeResult(diagnostic.result)}
          copy={diagnostic.copy}
          highlights={diagnostic.highlights}
          mode="practice"
          submitted
        />
      ) : null}
    </section>
  );
}
