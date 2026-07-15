"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { createDecimalDiagnosticResult, parseDecimalInput } from "@/lib/math/decimals";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode, DecimalParseResult } from "@/types/decimals";
import styles from "@/components/lessons/decimals/decimals.module.css";

export interface DecimalDigitInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (parsed: DecimalParseResult & { ok: true }) => void;
  label?: string;
  readOnly?: boolean;
  showKeypad?: boolean;
  allowNegative?: boolean;
  diagnosticCode?: DecimalFeedbackCode;
}

/** Pole tekstowe zamiast input[type=number], aby przecinek był niezależny od locale. */
export function DecimalDigitInput({
  value,
  onChange,
  onSubmit,
  label = "Liczba dziesiętna",
  readOnly = false,
  showKeypad = true,
  allowNegative = false,
  diagnosticCode,
}: DecimalDigitInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalDiagnostic, setInternalDiagnostic] = useState<DecimalFeedbackCode | null>(null);

  const update = (next: string, caret?: number) => {
    const normalized = next.replace(/\./gu, ",");
    onChange(normalized);
    if (caret !== undefined) requestAnimationFrame(() => inputRef.current?.setSelectionRange(caret, caret));
  };

  const insert = (text: string) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    if (text === "," && value.includes(",")) return;
    if (text === "-" && (!allowNegative || value.includes("-") || start !== 0)) return;
    update(`${value.slice(0, start)}${text}${value.slice(end)}`, start + text.length);
    input?.focus();
  };

  const remove = () => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    if (start !== end) update(`${value.slice(0, start)}${value.slice(end)}`, start);
    else if (start > 0) update(`${value.slice(0, start - 1)}${value.slice(end)}`, start - 1);
    input?.focus();
  };

  const submit = () => {
    if (readOnly) return;
    const parsed = parseDecimalInput(value);
    if (!parsed.ok) {
      setInternalDiagnostic(parsed.error.code === "DEC_EMPTY" ? DECIMAL_FEEDBACK_CODES.empty : DECIMAL_FEEDBACK_CODES.placeValue);
      inputRef.current?.focus();
      return;
    }
    setInternalDiagnostic(null);
    if (parsed.trace.display !== value) onChange(parsed.trace.display);
    onSubmit?.(parsed);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => update(event.target.value);
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === ".") {
      event.preventDefault();
      insert(",");
    }
  };

  const diagnostic = diagnosticCode ?? internalDiagnostic;
  const presentation = diagnostic ? createDecimalDiagnosticResult(diagnostic, { memberIds: ["decimal-input"] }) : null;

  return (
    <section className="space-y-3" aria-label={`${label} — inteligentny zapis`}>
      <label className="block font-bold text-slate-900">
        <span className="mb-1 block">{label}</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          readOnly={readOnly}
          aria-label={label}
          aria-describedby="decimal-input-format"
          className={`${styles.digitCell} w-full max-w-sm px-4 text-left`}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </label>
      <p id="decimal-input-format" className="text-sm font-semibold text-slate-600">
        Użyj polskiego przecinka. Kropka z klawiatury zostanie zamieniona na przecinek; zera pozostaną w śladzie pracy.
      </p>

      {showKeypad && !readOnly ? (
        <InteractionAlternativePanel title="Klawiatura liczby dziesiętnej" instruction="Wstaw cyfrę w miejscu kursora. Strzałki fizycznej klawiatury przesuwają kursor.">
          <div className={`${styles.interactiveOnly} grid w-full grid-cols-4 gap-2`} aria-label="Klawiatura ekranowa liczby dziesiętnej">
            {Array.from({ length: 10 }, (_, digit) => (
              <button key={digit} type="button" className="min-h-[52px] rounded-xl border-2 bg-white text-lg font-black" onClick={() => insert(String(digit))}>{digit}</button>
            ))}
            <button type="button" className="min-h-[52px] rounded-xl border-2 bg-violet-50 text-lg font-black" onClick={() => insert(",")} aria-label="Przecinek">,</button>
            <button type="button" className="min-h-[52px] rounded-xl border-2 bg-white px-2 font-black" onClick={remove}>Usuń</button>
            <button type="button" className="min-h-[52px] rounded-xl border-2 bg-white font-black" onClick={() => { const input = inputRef.current; const caret = Math.max(0, (input?.selectionStart ?? value.length) - 1); input?.focus(); input?.setSelectionRange(caret, caret); }} aria-label="W lewo">←</button>
            <button type="button" className="min-h-[52px] rounded-xl border-2 bg-white font-black" onClick={() => { const input = inputRef.current; const caret = Math.min(value.length, (input?.selectionStart ?? value.length) + 1); input?.focus(); input?.setSelectionRange(caret, caret); }} aria-label="W prawo">→</button>
            {allowNegative ? <button type="button" className="min-h-[52px] rounded-xl border-2 bg-white font-black" onClick={() => insert("-")}>−</button> : null}
            <button type="button" className="col-span-2 min-h-[52px] rounded-xl bg-indigo-700 px-4 font-black text-white" onClick={submit}>Zatwierdź</button>
          </div>
        </InteractionAlternativePanel>
      ) : null}

      <p className="sr-only" aria-live="polite">Aktualny zapis: {value || "puste pole"}.</p>
      {presentation ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(presentation.result)} copy={presentation.copy} highlights={presentation.highlights} mode="practice" submitted /> : null}
    </section>
  );
}
