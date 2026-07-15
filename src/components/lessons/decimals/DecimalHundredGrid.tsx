"use client";

import { useRef } from "react";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import styles from "@/components/lessons/decimals/decimals.module.css";

export interface DecimalHundredGridProps {
  shaded: number;
  onChange?: (shaded: number) => void;
  readOnly?: boolean;
  label?: string;
}

/** Kratownica 10×10: gest malowania i równoważne sterowanie dokładną liczbą pól. */
export function DecimalHundredGrid({ shaded, onChange, readOnly = false, label = "Kratownica dziesiętna 10 na 10" }: DecimalHundredGridProps) {
  if (!Number.isInteger(shaded) || shaded < 0 || shaded > 100) throw new Error("Liczba zaznaczonych pól musi mieścić się od 0 do 100.");
  const paintingRef = useRef<boolean | null>(null);
  const updateCell = (index: number, shouldShade: boolean) => {
    if (readOnly || !onChange) return;
    if (shouldShade && index >= shaded) onChange(index + 1);
    if (!shouldShade && index < shaded) onChange(index);
  };
  return (
    <section className="space-y-4 rounded-3xl border-2 border-slate-200 bg-white p-4" aria-label={label}>
      <div className={styles.workspace}>
        <div className="mx-auto grid w-fit grid-cols-10" role="grid" aria-label={`${shaded} ze 100 pól zaznaczonych`} onPointerLeave={() => { paintingRef.current = null; }} onPointerUp={() => { paintingRef.current = null; }}>
          {Array.from({ length: 100 }, (_, index) => {
          const active = index < shaded;
          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-label={`Pole ${index + 1}, ${active ? "zaznaczone" : "niezaznaczone"}`}
              aria-selected={active}
              data-shaded={active}
              disabled={readOnly}
              className={`${styles.hundredCell} min-h-11 min-w-11 focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-600 disabled:opacity-100`}
              onClick={() => updateCell(index, !active)}
              onPointerDown={(event) => {
                if (event.pointerType !== "mouse" || event.button === 0) {
                  paintingRef.current = !active;
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                }
              }}
              onPointerEnter={() => { if (paintingRef.current !== null) updateCell(index, paintingRef.current); }}
            />
          );
          })}
        </div>
      </div>
      <p className="text-center text-lg font-black tabular-nums" aria-live="polite">
        {shaded}/100 = 0,{String(shaded).padStart(2, "0")}
      </p>
      {!readOnly && onChange ? (
        <InteractionAlternativePanel title="Ustaw liczbę pól bez malowania" instruction="Przyciski zmieniają dokładnie jedno pole, a pole tekstowe pozwala podać liczbę od 0 do 100.">
          <button type="button" className="min-h-12 rounded-xl border-2 bg-white px-4 font-black" disabled={shaded === 0} onClick={() => onChange(shaded - 1)}>− 1 pole</button>
          <label className="font-bold">Zaznaczonych pól <input type="text" inputMode="numeric" value={shaded} aria-label="Liczba zaznaczonych pól" className="ml-2 min-h-12 w-24 rounded-xl border-2 px-3" onChange={(event) => { const next = Number(event.target.value); if (Number.isInteger(next) && next >= 0 && next <= 100) onChange(next); }} /></label>
          <button type="button" className="min-h-12 rounded-xl border-2 bg-white px-4 font-black" disabled={shaded === 100} onClick={() => onChange(shaded + 1)}>+ 1 pole</button>
        </InteractionAlternativePanel>
      ) : null}
    </section>
  );
}
