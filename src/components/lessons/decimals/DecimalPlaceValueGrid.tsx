"use client";

import { useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { DECIMAL_PLACES, createDecimalDiagnosticResult, decimalInputFromPlaceState } from "@/lib/math/decimals";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import type { DecimalDigit, DecimalFeedbackCode, DecimalPlaceId, DecimalPlaceValueState } from "@/types/decimals";
import styles from "@/components/lessons/decimals/decimals.module.css";

export interface DecimalPlaceValueGridProps {
  value: DecimalPlaceValueState;
  onChange: (value: DecimalPlaceValueState) => void;
  minimumPower?: -1 | -2 | -3 | -4;
  maximumPower?: 0 | 1 | 2 | 3;
  readOnly?: boolean;
  diagnosticCode?: DecimalFeedbackCode;
  activePlace?: DecimalPlaceId;
}

function lastDigit(value: string): DecimalDigit {
  return ([...value].reverse().find((character) => /^[0-9]$/u.test(character)) ?? "") as DecimalDigit;
}

/** Tabela obsługuje HTML drag dla myszy oraz równoważne wybierz → umieść dla dotyku, rysika i klawiatury. */
export function DecimalPlaceValueGrid({
  value,
  onChange,
  minimumPower = -4,
  maximumPower = 3,
  readOnly = false,
  diagnosticCode,
  activePlace,
}: DecimalPlaceValueGridProps) {
  const [selectedDigit, setSelectedDigit] = useState<DecimalDigit>("0");
  const places = DECIMAL_PLACES.filter((place) => place.power >= minimumPower && place.power <= maximumPower);
  const wholePlaces = places.filter((place) => place.power >= 0);
  const fractionPlaces = places.filter((place) => place.power < 0);

  const setDigit = (placeId: DecimalPlaceId, digit: DecimalDigit) => {
    if (!readOnly) onChange({ ...value, [placeId]: digit });
  };
  const drop = (event: DragEvent<HTMLDivElement>, placeId: DecimalPlaceId) => {
    event.preventDefault();
    setDigit(placeId, lastDigit(event.dataTransfer.getData("text/plain")));
  };
  const moveByKeyboard = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = Math.max(0, Math.min(places.length - 1, index + (event.key === "ArrowLeft" ? -1 : 1)));
    document.querySelector<HTMLInputElement>(`[data-decimal-place="${places[next].id}"]`)?.focus();
  };
  const presentation = diagnosticCode
    ? createDecimalDiagnosticResult(diagnosticCode, { memberIds: activePlace ? [activePlace] : undefined })
    : null;
  const display = decimalInputFromPlaceState(value);

  return (
    <section className="space-y-4 rounded-3xl border-2 border-slate-200 bg-white p-4" aria-label="Tabela wartości pozycyjnych liczby dziesiętnej">
      <div className={styles.workspace}>
        <table className="w-full min-w-[760px] border-separate border-spacing-2 text-center">
          <caption className="sr-only">Cyfry po obu stronach przecinka; jedna cyfra w jednej kolumnie.</caption>
          <thead>
            <tr>
              {wholePlaces.map((place) => <th key={place.id} scope="col" className="p-2 text-xs font-black text-slate-700">{place.label}</th>)}
              <th scope="col" className="w-6 text-violet-800"><span aria-label="przecinek">,</span></th>
              {fractionPlaces.map((place) => <th key={place.id} scope="col" className="p-2 text-xs font-black text-slate-700">{place.label}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              {wholePlaces.map((place, index) => (
                <td key={place.id} className={activePlace === place.id ? styles.activeColumn : ""}>
                  <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, place.id)} data-drop-place={place.id}>
                    <input
                      data-decimal-place={place.id}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={value[place.id] ?? ""}
                      readOnly={readOnly}
                      aria-label={`${place.label}, cyfra`}
                      className={styles.digitCell}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setDigit(place.id, lastDigit(event.target.value))}
                      onKeyDown={(event) => moveByKeyboard(event, index)}
                    />
                  </div>
                </td>
              ))}
              <td className={styles.commaColumn} aria-label="Stała kolumna przecinka">,</td>
              {fractionPlaces.map((place, fractionIndex) => {
                const index = wholePlaces.length + fractionIndex;
                return (
                  <td key={place.id} className={activePlace === place.id ? styles.activeColumn : ""}>
                    <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, place.id)} data-drop-place={place.id}>
                      <input
                        data-decimal-place={place.id}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={value[place.id] ?? ""}
                        readOnly={readOnly}
                        aria-label={`${place.label}, cyfra`}
                        className={styles.digitCell}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setDigit(place.id, lastDigit(event.target.value))}
                        onKeyDown={(event) => moveByKeyboard(event, index)}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-900" aria-live="polite">
        Aktualny zapis: <span className="tabular-nums">{display}</span>
      </p>

      {!readOnly ? (
        <InteractionAlternativePanel title="Wybierz i umieść cyfrę" instruction="Cyfrę można przeciągnąć myszą albo wybrać, a potem umieścić przyciskiem w kolumnie. Ta druga metoda działa dotykiem, rysikiem i klawiaturą.">
          <div className={`${styles.interactiveOnly} w-full space-y-3`}>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Wybierz cyfrę">
              {Array.from({ length: 10 }, (_, digit) => (
                <button
                  key={digit}
                  type="button"
                  draggable
                  aria-pressed={selectedDigit === String(digit)}
                  className="min-h-[52px] min-w-[52px] rounded-xl border-2 bg-white text-lg font-black aria-pressed:border-indigo-700 aria-pressed:bg-indigo-50"
                  onClick={() => setSelectedDigit(String(digit) as DecimalDigit)}
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", String(digit))}
                >{digit}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label={`Umieść cyfrę ${selectedDigit}`}>
              {places.map((place) => <button key={place.id} type="button" className={styles.placeButton} onClick={() => setDigit(place.id, selectedDigit)}>Umieść w: <span className="block text-xs">{place.shortLabel}</span></button>)}
            </div>
          </div>
        </InteractionAlternativePanel>
      ) : null}

      {presentation ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(presentation.result)} copy={presentation.copy} highlights={presentation.highlights} mode="practice" submitted /> : null}
    </section>
  );
}
