"use client";

import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { buildDecimalWrittenDivideModel, createDecimalDiagnosticResult } from "@/lib/math/decimals";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode } from "@/types/decimals";
import styles from "@/components/lessons/decimals/decimals.module.css";

export interface DecimalWrittenDivideProps {
  dividend: string;
  divisor: string;
  quotient?: string;
  onQuotientChange?: (value: string) => void;
  appendedZeros?: number;
  onAppendedZerosChange?: (count: number) => void;
  appliedScalePower?: number;
  onApplyScale?: (power: number, scaledDividend: string, scaledDivisor: string) => void;
  activeDividendIndex?: number;
  activeQuotientIndex?: number;
  showSolution?: boolean;
  diagnosticCode?: DecimalFeedbackCode;
}

function displayDigits(value: string): string[] {
  return [...value.replace(/\./gu, ",")];
}

export function DecimalWrittenDivide({
  dividend,
  divisor,
  quotient = "",
  onQuotientChange,
  appendedZeros = 0,
  onAppendedZerosChange,
  appliedScalePower,
  onApplyScale,
  activeDividendIndex = 0,
  activeQuotientIndex = 0,
  showSolution = false,
  diagnosticCode,
}: DecimalWrittenDivideProps) {
  const model = buildDecimalWrittenDivideModel(dividend, divisor, appendedZeros);
  const scaleIncomplete = appliedScalePower !== undefined && appliedScalePower !== model.scalePower;
  const activeDiagnostic = diagnosticCode ?? (scaleIncomplete ? DECIMAL_FEEDBACK_CODES.divisorScale : undefined);
  const presentation = activeDiagnostic
    ? createDecimalDiagnosticResult(activeDiagnostic, { memberIds: activeDiagnostic === DECIMAL_FEEDBACK_CODES.divisorScale ? ["dividend-scale", "divisor-scale"] : ["division-workspace"] })
    : null;
  const dividendDisplay = appendedZeros > 0
    ? `${model.dividend.trace.display}${model.dividend.trace.display.includes(",") ? "" : ","}${"0".repeat(appendedZeros)}`
    : model.dividend.trace.display;
  const quotientDisplay = showSolution ? model.quotientDisplay ?? "iloraz okresowy" : quotient;

  return (
    <section className="space-y-5 rounded-3xl border-2 border-slate-200 bg-white p-4" aria-label="Dzielenie pisemne liczb dziesiętnych">
      <section className="rounded-2xl border-2 border-violet-300 bg-violet-50 p-4" aria-label="Skalowanie obu liczb">
        <h3 className="font-black text-violet-950">Ta sama skala dla dzielnej i dzielnika</h3>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xl font-black tabular-nums">
          <span id="dividend-scale" className="rounded-xl border-2 border-violet-600 bg-white px-4 py-3">{model.dividend.trace.display}</span>
          <span>:</span>
          <span id="divisor-scale" className="rounded-xl border-2 border-violet-600 bg-white px-4 py-3">{model.divisor.trace.display}</span>
          <span className="rounded-full border-2 border-violet-600 px-3 py-2">×{10 ** model.scalePower} obie liczby</span>
          <span aria-hidden>→</span>
          <span>{model.scaledDividendDisplay} : {model.scaledDivisorDisplay}</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-violet-900">Iloraz nie zmienia się, ponieważ obie liczby mnożymy przez tę samą potęgę 10.</p>
      </section>

      <div className={`${styles.workspace} rounded-2xl bg-slate-50 p-4`}>
        <div className="mx-auto grid w-fit grid-cols-[auto_auto] grid-rows-[auto_auto] text-xl font-black tabular-nums">
          <div className="flex items-end justify-end border-r-4 border-slate-900 px-3 py-2" aria-label={`Dzielna ${dividendDisplay}`}>
            {displayDigits(dividendDisplay).map((character, index) => (
              <span
                key={`${character}-${index}`}
                className={`${character === "," ? styles.commaColumn : `${styles.digitCell} inline-grid place-items-center`} ${index === activeDividendIndex ? styles.activeColumn : ""} ${character === "0" && index >= model.dividend.trace.display.length ? styles.auxiliaryZero : ""}`}
                data-dividend-index={index}
                data-auxiliary-zero={character === "0" && index >= model.dividend.trace.display.length || undefined}
              >{character}{index === activeDividendIndex ? <span className="sr-only"> aktywna część, symbol D</span> : null}</span>
            ))}
          </div>
          <div className="border-b-4 border-slate-900 px-3 py-2" aria-label={`Dzielnik ${model.divisor.trace.display}`}>{model.divisor.trace.display}</div>
          <div className="min-h-20 border-r-4 border-slate-900 p-3 text-slate-500" aria-label="Miejsce obliczeń cząstkowych">− …</div>
          <label className="p-3">
            <span className="sr-only">Iloraz</span>
            <input
              type="text"
              inputMode="decimal"
              value={quotientDisplay}
              readOnly={showSolution || !onQuotientChange}
              aria-label={`Iloraz, aktywna cyfra ${activeQuotientIndex + 1}, wspólny symbol D`}
              className={`${styles.digitCell} w-44 px-3 text-left ${styles.activeColumn}`}
              data-quotient-index={activeQuotientIndex}
              onChange={(event) => onQuotientChange?.(event.target.value.replace(/\./gu, ","))}
            />
          </label>
        </div>
      </div>

      <InteractionAlternativePanel title="Sterowanie dzieleniem" instruction="Dopisane zero zachowuje wartość dzielnej. Skalowanie zawsze obejmuje obie liczby, nigdy tylko dzielnik.">
        <button type="button" className={`${styles.interactiveOnly} min-h-12 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 font-black`} disabled={appendedZeros >= 8} onClick={() => onAppendedZerosChange?.(appendedZeros + 1)}>Dopisz zero pomocnicze</button>
        <button type="button" className={`${styles.interactiveOnly} min-h-12 rounded-xl border-2 bg-white px-4 font-black`} disabled={appendedZeros === 0} onClick={() => onAppendedZerosChange?.(Math.max(0, appendedZeros - 1))}>Usuń ostatnie zero</button>
        <button type="button" className={`${styles.interactiveOnly} min-h-12 rounded-xl bg-indigo-700 px-4 font-black text-white`} onClick={() => onApplyScale?.(model.scalePower, model.scaledDividendDisplay, model.scaledDivisorDisplay)}>Zastosuj ×{10 ** model.scalePower} do obu liczb</button>
      </InteractionAlternativePanel>

      <p className="sr-only" aria-live="polite">Aktywna część dzielnej i cyfra ilorazu mają wspólny symbol D. Dopisano zer pomocniczych: {appendedZeros}.</p>
      {presentation ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(presentation.result)} copy={presentation.copy} highlights={presentation.highlights} mode="practice" submitted /> : null}
    </section>
  );
}
