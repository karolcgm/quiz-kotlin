"use client";

import type { PointerEvent } from "react";

interface Props {
  onKey: (key: string) => void;
  onConfirm?: () => void;
  disabled?: boolean;
  allowSeparator?: boolean;
  label?: string;
  helperText?: string;
}

/** Jedyna klawiatura liczbowa lekcji — używana przez działania naturalne i pionowy zapis ułamków. */
export function LessonNumericKeypad({ onKey, onConfirm, disabled = false, allowSeparator = false, label = "Klawiatura ekranowa", helperText }: Props) {
  const keepAnswerCellFocused = (event: PointerEvent<HTMLButtonElement>) => {
    // Przycisk klawiatury nie może przejmować fokusu od wybranej kratki.
    // Dotyczy to również myszy: lekcja jest często prowadzona z komputera,
    // a utrata fokusu wygląda wtedy jak przeskoczenie wpisu do innego pola.
    event.preventDefault();
  };
  return <section className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg" aria-label={label} data-lesson-numeric-keypad="shared">
    <p className="mb-1 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-200">{label}</p>
    {helperText ? <p className="mb-3 text-center text-xs text-slate-300">{helperText}</p> : null}
    <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((key) => <button key={key} type="button" disabled={disabled} onPointerDown={keepAnswerCellFocused} onClick={() => onKey(key)} className="min-h-12 rounded-xl bg-white text-xl font-black text-slate-950 shadow focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300 disabled:opacity-35">{key}</button>)}
      {allowSeparator ? <button type="button" disabled={disabled} onPointerDown={keepAnswerCellFocused} onClick={() => onKey(",")} className="min-h-12 rounded-xl bg-cyan-200 text-lg font-black text-cyan-950 disabled:opacity-35">, przecinek</button> : <span aria-hidden />}
      <button type="button" disabled={disabled} onPointerDown={keepAnswerCellFocused} onClick={() => onKey("backspace")} className="min-h-12 rounded-xl bg-rose-300 px-3 font-black text-rose-950 disabled:opacity-35">← Usuń</button>
      {onConfirm ? <button type="button" disabled={disabled} onPointerDown={keepAnswerCellFocused} onClick={onConfirm} className="col-span-4 min-h-12 rounded-xl bg-cyan-200 px-4 font-black text-cyan-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white disabled:opacity-35">Zatwierdź</button> : null}
    </div>
  </section>;
}
