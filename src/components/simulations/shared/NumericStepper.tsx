"use client";

function formatValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1).replace(/\.0$/, "");
}

const PLACE_VALUE_STEPS = [1, 10, 100] as const;

interface NumericStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  fineStep?: number;
  min?: number;
  max?: number;
  highlight?: boolean;
  suffix?: string;
  disabled?: boolean;
  /** Przyciski −100/−10/−1 oraz +1/+10/+100 — dla liczb do setek (dziesiątki, jedności, liczmany). */
  placeValue?: boolean;
}

export function NumericStepper({
  label,
  value,
  onChange,
  step = 1,
  fineStep,
  min = 0,
  max,
  highlight = false,
  suffix,
  disabled = false,
  placeValue = false,
}: NumericStepperProps) {
  const buttonClass =
    "flex h-10 min-w-[2.75rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-sm font-black hover:bg-slate-50 disabled:opacity-40 sm:min-w-[3rem] sm:text-base";

  const clamp = (next: number) => {
    let safe = Math.max(min, next);
    if (max !== undefined) safe = Math.min(max, safe);
    return safe;
  };

  if (placeValue) {
    return (
      <div
        className={`rounded-2xl p-3 ${highlight ? "bg-indigo-50 ring-2 ring-indigo-300" : "bg-white ring-1 ring-slate-200"} ${disabled ? "opacity-70" : ""}`}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-center text-3xl font-black text-indigo-700">
          {formatValue(value)}
          {suffix ? <span className="text-base font-bold">{suffix}</span> : null}
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[...PLACE_VALUE_STEPS].reverse().map((delta) => (
              <button
                key={`minus-${delta}`}
                type="button"
                disabled={disabled}
                onClick={() => onChange(clamp(value - delta))}
                className={buttonClass}
                aria-label={`Odejmij ${delta}`}
              >
                −{delta}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PLACE_VALUE_STEPS.map((delta) => (
              <button
                key={`plus-${delta}`}
                type="button"
                disabled={disabled}
                onClick={() => onChange(clamp(value + delta))}
                className={buttonClass}
                aria-label={`Dodaj ${delta}`}
              >
                +{delta}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-3 ${highlight ? "bg-indigo-50 ring-2 ring-indigo-300" : "bg-white ring-1 ring-slate-200"} ${disabled ? "opacity-70" : ""}`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {fineStep !== undefined && (
          <button type="button" disabled={disabled} onClick={() => onChange(clamp(value - fineStep))} className={buttonClass}>
            −{fineStep}
          </button>
        )}
        <button type="button" disabled={disabled} onClick={() => onChange(clamp(value - step))} className={buttonClass}>
          −{step > 1 ? step : ""}
        </button>
        <span className="min-w-[4rem] text-center text-3xl font-black text-indigo-700">
          {formatValue(value)}
          {suffix ? <span className="text-base font-bold">{suffix}</span> : null}
        </span>
        <button type="button" disabled={disabled} onClick={() => onChange(clamp(value + step))} className={buttonClass}>
          +{step > 1 ? step : ""}
        </button>
        {fineStep !== undefined && (
          <button type="button" disabled={disabled} onClick={() => onChange(clamp(value + fineStep))} className={buttonClass}>
            +{fineStep}
          </button>
        )}
      </div>
    </div>
  );
}

interface TaskAnswerPanelProps {
  mode: "demo" | "task";
  label: string;
  value: number;
  onChange: (value: number) => void;
  showSolution: boolean;
  expected: number | null;
  step?: number;
  fineStep?: number;
  suffix?: string;
  compactChrome?: boolean;
  placeValue?: boolean;
  min?: number;
  max?: number;
}

export function TaskAnswerPanel({
  mode,
  label,
  value,
  onChange,
  showSolution,
  expected,
  step = 1,
  fineStep,
  suffix,
  compactChrome = false,
  placeValue = false,
  min = 0,
  max,
}: TaskAnswerPanelProps) {
  if (compactChrome && mode === "demo") {
    return null;
  }

  if (mode === "demo") {
    return (
      <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
        <p className="text-xs font-bold uppercase text-emerald-700">Wynik</p>
        <p className="mt-1 text-center text-3xl font-black text-emerald-800">
          {expected !== null ? formatValue(expected) : "?"}
          {suffix ? ` ${suffix}` : ""}
        </p>
      </div>
    );
  }

  return (
    <>
      <NumericStepper
        label={label}
        value={value}
        onChange={onChange}
        step={step}
        fineStep={fineStep}
        highlight
        suffix={suffix}
        placeValue={placeValue}
        min={min}
        max={max}
      />
      {showSolution && expected !== null && !compactChrome && (
        <div className="rounded-xl bg-emerald-50 p-3 text-center font-bold text-emerald-800">
          Rozwiązanie: {formatValue(expected)}
          {suffix ? ` ${suffix}` : ""}
        </div>
      )}
    </>
  );
}
