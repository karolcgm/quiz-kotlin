"use client";

import { useRef, useState } from "react";

interface IntegerAnswerInputProps {
  id: string;
  name: string;
  readOnly?: boolean;
  defaultValue?: number | null;
  className?: string;
  step?: number;
}

function normalizeNumericInput(value: string, allowDecimals: boolean): string {
  if (value === "" || value === "-") {
    return value;
  }

  if (allowDecimals) {
    const match = value.match(/^-?\d*(?:[.,]\d*)?/);
    return match?.[0]?.replace(",", ".") ?? "";
  }

  const match = value.match(/^-?\d+/);
  return match?.[0] ?? "";
}

function parseNumeric(value: string): number | null {
  if (value === "" || value === "-") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumeric(value: number, allowDecimals: boolean): string {
  if (allowDecimals) {
    return String(value);
  }

  return String(Math.round(value));
}

export function IntegerAnswerInput({
  id,
  name,
  readOnly = false,
  defaultValue = null,
  className,
  step = 1,
}: IntegerAnswerInputProps) {
  const allowDecimals = step < 1;
  const inputRef = useRef<HTMLInputElement>(null);
  const initial =
    defaultValue === null || defaultValue === undefined || Number.isNaN(defaultValue)
      ? ""
      : String(defaultValue);
  const [value, setValue] = useState(initial);

  function setNextValue(next: string) {
    const normalized = normalizeNumericInput(next, allowDecimals);
    setValue(normalized);
    if (inputRef.current) {
      inputRef.current.value = normalized;
    }
  }

  function stepBy(delta: number) {
    const current = parseNumeric(value) ?? 0;
    setNextValue(formatNumeric(current + delta * step, allowDecimals));
  }

  if (readOnly) {
    return (
      <input
        id={id}
        name={name}
        type="text"
        readOnly
        defaultValue={initial}
        className={className}
      />
    );
  }

  return (
    <div className="flex items-stretch gap-2">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(event) => setNextValue(event.target.value)}
        className={`min-w-0 flex-1 ${className ?? ""}`}
      />
      <div className="flex min-h-[5.5rem] min-w-[3.75rem] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200">
        <button
          type="button"
          aria-label={`Zwiększ o ${step}`}
          onClick={() => stepBy(1)}
          className="flex min-h-[2.75rem] flex-1 items-center justify-center bg-slate-50 px-4 text-2xl font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 active:bg-indigo-100"
        >
          ▲
        </button>
        <button
          type="button"
          aria-label={`Zmniejsz o ${step}`}
          onClick={() => stepBy(-1)}
          className="flex min-h-[2.75rem] flex-1 items-center justify-center border-t border-slate-200 bg-slate-50 px-4 text-2xl font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 active:bg-indigo-100"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
