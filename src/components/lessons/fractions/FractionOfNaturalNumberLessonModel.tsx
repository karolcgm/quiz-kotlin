"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { greatestCommonDivisor, normalizeFraction } from "@/lib/math/fractions/fractionMath";
import type { FractionOperationsLevel, FractionOperationsPhase } from "@/lib/math/fractions/fractionOperationsLesson";
import type { FractionDigit, FractionValue, MixedFractionValue } from "@/types/fractions";

interface FractionOfNumberTask {
  id: string;
  fraction: FractionValue;
  natural: number;
  prompt: string;
  story?: string;
  answerLead?: string;
  answerSuffix?: string;
  unit?: string;
}

const COMPUTATION_TASKS: readonly FractionOfNumberTask[] = [
  { id: "calculation-1", fraction: { numerator: 1, denominator: 6 }, natural: 20, prompt: "Oblicz ułamek liczby." },
];

const STORY_TASKS: readonly FractionOfNumberTask[] = [
  { id: "story-1", fraction: { numerator: 3, denominator: 7 }, natural: 28, prompt: "Oblicz liczbę sadzonek przeznaczonych do szklarni.", story: "Ogrodnik ma 28 sadzonek. Trzy siódme wszystkich sadzonek posadzi w szklarni. Ile sadzonek trafi do szklarni?", answerLead: "Do szklarni trafi", answerSuffix: "sadzonek.", unit: "sadzonek" },
  { id: "story-2", fraction: { numerator: 5, denominator: 8 }, natural: 32, prompt: "Oblicz liczbę czerwonych koralików.", story: "W pudełku są 32 koraliki. Pięć ósmych z nich jest czerwonych. Ile jest czerwonych koralików?", answerLead: "W pudełku jest", answerSuffix: "czerwonych koralików.", unit: "koralików" },
  { id: "story-3", fraction: { numerator: 2, denominator: 9 }, natural: 45, prompt: "Oblicz długość leśnego odcinka trasy.", story: "Trasa rajdu ma 45 kilometrów. Dwie dziewiąte trasy prowadzą przez las. Ile kilometrów prowadzi przez las?", answerLead: "Przez las prowadzi", answerSuffix: "km trasy.", unit: "km" },
];

const FINAL_STORIES: readonly FractionOfNumberTask[] = [
  ...STORY_TASKS,
  { id: "final-1", fraction: { numerator: 4, denominator: 5 }, natural: 35, prompt: "Oblicz liczbę przeczytanych książek.", story: "Na półce jest 35 książek. Uczniowie przeczytali cztery piąte z nich. Ile książek przeczytali?", answerLead: "Uczniowie przeczytali", answerSuffix: "książek.", unit: "książek" },
  { id: "final-3", fraction: { numerator: 5, denominator: 12 }, natural: 48, prompt: "Oblicz liczbę niebieskich flag.", story: "Przygotowano 48 flag. Pięć dwunastych flag jest niebieskich. Ile jest niebieskich flag?", answerLead: "Niebieskich jest", answerSuffix: "flag.", unit: "flag" },
];

const L2_COMPUTATION_TASKS: readonly FractionOfNumberTask[] = [
  { id: "l2-calculation-1", fraction: { numerator: 7, denominator: 12 }, natural: 84, prompt: "Oblicz siedem dwunastych liczby 84." },
  { id: "l2-calculation-2", fraction: { numerator: 5, denominator: 9 }, natural: 126, prompt: "Oblicz pięć dziewiątych liczby 126." },
  { id: "l2-calculation-3", fraction: { numerator: 11, denominator: 15 }, natural: 90, prompt: "Oblicz jedenaście piętnastych liczby 90." },
  { id: "l2-calculation-4", fraction: { numerator: 13, denominator: 20 }, natural: 360, prompt: "Oblicz trzynaście dwudziestych liczby 360." },
];

const L2_STORIES: readonly FractionOfNumberTask[] = [
  { id: "l2-story-1", fraction: { numerator: 3, denominator: 8 }, natural: 240, prompt: "Oblicz wykorzystaną część budżetu.", story: "Budżet wycieczki wynosi 240 zł. Na bilety przeznaczono trzy ósme budżetu. Ile złotych przeznaczono na bilety?", answerLead: "Na bilety przeznaczono", answerSuffix: "zł.", unit: "zł" },
  { id: "l2-story-2", fraction: { numerator: 11, denominator: 18 }, natural: 162, prompt: "Oblicz liczbę ukończonych okrążeń.", story: "Zespół zaplanował 162 okrążenia. Ukończył jedenaście osiemnastych planu. Ile okrążeń ukończył?", answerLead: "Zespół ukończył", answerSuffix: "okrążeń.", unit: "okrążeń" },
  { id: "l2-story-3", fraction: { numerator: 13, denominator: 25 }, natural: 200, prompt: "Oblicz liczbę zapakowanych paczek.", story: "W magazynie jest 200 paczek. Zapakowano trzynaście dwudziestych piątych wszystkich paczek. Ile paczek zapakowano?", answerLead: "Zapakowano", answerSuffix: "paczek.", unit: "paczek" },
];

const L2_FINAL_STORIES: readonly FractionOfNumberTask[] = [
  ...L2_STORIES,
  { id: "l2-final-4", fraction: { numerator: 7, denominator: 12 }, natural: 144, prompt: "Oblicz liczbę miejsc zarezerwowanych.", story: "Kino ma 144 miejsca. Zarezerwowano siedem dwunastych miejsc. Ile miejsc zarezerwowano?", answerLead: "Zarezerwowano", answerSuffix: "miejsc.", unit: "miejsc" },
  { id: "l2-final-5", fraction: { numerator: 17, denominator: 24 }, natural: 120, prompt: "Oblicz długość ukończonego odcinka.", story: "Trasa ma 120 kilometrów. Rowerzysta przejechał siedemnaście dwudziestych czwartych trasy. Ile kilometrów przejechał?", answerLead: "Rowerzysta przejechał", answerSuffix: "km.", unit: "km" },
];

function StaticFraction({ value }: { value: FractionValue }) {
  return <span className="inline-grid min-w-10 shrink-0 text-center font-black leading-none"><b>{value.numerator}</b><i className="my-1 border-t-2 border-slate-950" /><b>{value.denominator}</b></span>;
}

function CancelledNumber({ value, replacement }: { value: number; replacement?: number }) {
  return <span className="relative inline-grid min-w-8 place-items-center px-1" data-fraction-of-number-cancelled><b>{value}</b><i className="pointer-events-none absolute left-0 top-1/2 h-0.5 w-full -rotate-12 bg-rose-600" aria-hidden />{replacement === undefined ? null : <small className="absolute -right-3 -top-3 rounded bg-white px-1 text-sm font-black text-rose-700">{replacement}</small>}</span>;
}

function CancelledFraction({ value, denominatorReplacement }: { value: FractionValue; denominatorReplacement?: number }) {
  return <span className="inline-grid min-w-10 shrink-0 text-center font-black leading-none"><b>{value.numerator}</b><i className="my-1 border-t-2 border-slate-950" /><CancelledNumber value={value.denominator} replacement={denominatorReplacement} /></span>;
}

type FieldPart = "integer" | "wholePart" | "numerator" | "denominator";
type WorkField =
  | { id: string; label: string; kind: "integer"; target: number }
  | { id: string; label: string; kind: "fraction"; target: FractionValue }
  | { id: string; label: string; kind: "mixed"; target: MixedFractionValue };

interface FieldEntry {
  integer: FractionDigit[];
  wholePart: FractionDigit[];
  numerator: FractionDigit[];
  denominator: FractionDigit[];
}

function digitCount(value: number): number {
  return String(Math.abs(value)).length;
}

function taskResult(task: FractionOfNumberTask): FractionValue {
  const value = normalizeFraction({ numerator: task.fraction.numerator * task.natural, denominator: task.fraction.denominator });
  return { numerator: value.numerator, denominator: value.denominator };
}

function asMixed(value: FractionValue): MixedFractionValue {
  return { wholePart: Math.floor(value.numerator / value.denominator), numerator: value.numerator % value.denominator, denominator: value.denominator };
}

function buildFields(task: FractionOfNumberTask): WorkField[] {
  const divisor = greatestCommonDivisor(task.natural, task.fraction.denominator);
  const result = taskResult(task);
  const fields: WorkField[] = task.story ? [
    { id: "given-fraction", label: "Ułamek w zapisie z treści", kind: "fraction", target: task.fraction },
    { id: "given-natural", label: "Liczba w zapisie z treści", kind: "integer", target: task.natural },
    { id: "multiplication-fraction", label: "Ułamek po zamianie na mnożenie", kind: "fraction", target: task.fraction },
    { id: "multiplication-natural", label: "Liczba po zamianie na mnożenie", kind: "integer", target: task.natural },
  ] : [];
  if (divisor > 1) fields.push(
    { id: "reduced-denominator", label: "Mianownik po skróceniu", kind: "integer", target: task.fraction.denominator / divisor },
    { id: "reduced-natural", label: "Liczba naturalna po skróceniu", kind: "integer", target: task.natural / divisor },
  );
  fields.push(result.denominator === 1
    ? { id: "result", label: "Wynik działania", kind: "integer", target: result.numerator }
    : { id: "result", label: "Wynik działania", kind: "fraction", target: result });
  if (result.denominator > 1 && result.numerator > result.denominator) fields.push({ id: "mixed", label: "Liczba mieszana", kind: "mixed", target: asMixed(result) });
  if (task.story) fields.push(result.denominator === 1
    ? { id: "story-answer", label: "Odpowiedź", kind: "integer", target: result.numerator }
    : { id: "story-answer", label: "Odpowiedź", kind: "fraction", target: result });
  return fields;
}

function blankEntries(fields: readonly WorkField[]): Record<string, FieldEntry> {
  return Object.fromEntries(fields.map((field) => [field.id, { integer: [""], wholePart: [""], numerator: [""], denominator: [""] }])) as Record<string, FieldEntry>;
}

function EntryCell({ value, label, active, locked = false, small = false, onActivate }: { value: string; label: string; active: boolean; locked?: boolean; small?: boolean; onActivate: () => void }) {
  return <input value={value} inputMode="none" readOnly disabled={locked} aria-label={label} onFocus={locked ? undefined : onActivate} onClick={locked ? undefined : onActivate} className={`${small ? "h-8 w-8 text-base" : "h-11 w-11 text-xl"} rounded-lg border-2 text-center font-black ${locked ? "border-slate-300 bg-slate-100 text-slate-700" : active ? "border-indigo-600 bg-white ring-2 ring-indigo-200" : "border-indigo-300 bg-white"}`} />;
}

function InstructionCard() {
  return <section className="grid gap-3 rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4"><h3 className="text-lg font-black">Jak obliczamy ułamek danej liczby?</h3><p className="font-semibold">Aby obliczyć ułamek danej liczby, mnożymy ten ułamek przez tę liczbę. Przed mnożeniem możemy skrócić liczbę naturalną z mianownikiem.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><StaticFraction value={{ numerator: 3, denominator: 4 }} /><b>z</b><b>20</b><b>=</b><CancelledFraction value={{ numerator: 3, denominator: 4 }} denominatorReplacement={1} /><b>·</b><CancelledNumber value={20} replacement={5} /><b>=</b><b>15</b></div></section>;
}

function BeadSelection({ locked, advanced, onComplete, onIncorrect }: { locked: boolean; advanced: boolean; onComplete: () => void; onIncorrect: () => void }) {
  const total = advanced ? 24 : 15;
  const target = advanced ? 9 : 3;
  const fraction = advanced ? { numerator: 3, denominator: 8 } : { numerator: 1, denominator: 5 };
  const calculationTargets = advanced ? [1, 3, 9] : [1, 3, 3];
  const [selected, setSelected] = useState<boolean[]>(() => Array.from({ length: total }, () => false));
  const [calculation, setCalculation] = useState<FractionDigit[][]>(() => calculationTargets.map(() => [""]));
  const [activeCalculationIndex, setActiveCalculationIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const selectedCount = selected.filter(Boolean).length;
  const confirm = () => {
    if (selectedCount !== target) {
      setFeedback(advanced ? "Trzy ósme z 24 koralików to 9 koralików. Sprawdź zaznaczenie." : "Jedna piąta z 15 koralików to jedna z pięciu równych grup. Sprawdź liczbę zaznaczonych koralików.");
      onIncorrect();
      return;
    }
    if (!calculationTargets.every((value, index) => Number(calculation[index]?.join("")) === value)) {
      setFeedback("Uzupełnij wszystkie kratki w obliczeniu pod koralikami.");
      onIncorrect();
      return;
    }
    onComplete();
  };
  const editCalculation = (keyValue: string) => {
    if (keyValue === "backspace") setCalculation((current) => current.map((entry, index) => index === activeCalculationIndex ? [""] : entry));
    else if (/^[0-9]$/u.test(keyValue)) {
      setCalculation((current) => current.map((entry, index) => index === activeCalculationIndex ? [keyValue as FractionDigit] : entry));
      setActiveCalculationIndex((index) => Math.min(calculationTargets.length - 1, index + 1));
    }
    setFeedback(null);
  };
  const calculationCell = (index: number, label: string) => <EntryCell value={calculation[index]?.[0] ?? ""} label={label} active={!locked && activeCalculationIndex === index} onActivate={() => setActiveCalculationIndex(index)} />;
  return <div className="grid gap-4"><InstructionCard /><section className="grid gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><div><h3 className="flex flex-wrap items-center gap-2 text-xl font-black"><span>Zaznacz</span><span data-bead-task-fraction={advanced ? "3-8" : "1-5"}><StaticFraction value={fraction} /></span><span>z {total} koralików</span></h3><p className="mt-1 font-semibold text-slate-700">Zaznacz odpowiednią liczbę koralików, a następnie zapisz obliczenie.</p></div><div className={`grid gap-3 rounded-[2rem] bg-white p-5 ${advanced ? "grid-cols-6" : "grid-cols-5"}`} role="group" aria-label={`${total} koralików do zaznaczenia`}>{selected.map((isSelected, index) => <button key={index} type="button" disabled={locked} aria-pressed={isSelected} aria-label={`Koralik ${index + 1}`} onClick={() => { setSelected((current) => current.map((value, beadIndex) => beadIndex === index ? !value : value)); setFeedback(null); }} className={`aspect-square min-h-12 rounded-full border-4 shadow-md transition ${isSelected ? "border-indigo-800 bg-indigo-500 ring-4 ring-indigo-200" : "border-amber-700 bg-amber-300"}`} />)}</div><p className="text-center font-black">Zaznaczono: {selectedCount} z {total} koralików</p><div className="flex max-w-full flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-indigo-200 bg-white p-3 text-xl font-black" aria-label="Miejsce na obliczenie"><CancelledFraction value={fraction} /><b>·</b><CancelledNumber value={total} /><b>=</b><span className="inline-grid shrink-0 text-center leading-none"><b>{fraction.numerator}</b><i className="my-1 border-t-2 border-slate-950" />{calculationCell(0, "Mianownik po skróceniu")}</span><b>·</b>{calculationCell(1, "Liczba naturalna po skróceniu")}<b>=</b>{calculationCell(2, "Wynik obliczenia")}</div>{feedback ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">{feedback}</p> : null}</section>{!locked ? <LessonNumericKeypad label="Kalkulator do zaznaczania ułamka liczby" helperText="Zaznacz koraliki i uzupełnij po kolei wszystkie kratki obliczenia." onKey={editCalculation} onConfirm={confirm} /> : null}</div>;
}

function CalculationRound({ task, locked, onComplete, onIncorrect }: { task: FractionOfNumberTask; locked: boolean; onComplete: (answer: string) => void; onIncorrect: () => void }) {
  const fields = useMemo(() => buildFields(task), [task]);
  const [entries, setEntries] = useState<Record<string, FieldEntry>>(() => blankEntries(fields));
  const [storySetupComplete, setStorySetupComplete] = useState(false);
  const [cancellationRevealed, setCancellationRevealed] = useState(false);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [activePart, setActivePart] = useState<FieldPart>(fields[0]!.kind === "integer" ? "integer" : fields[0]!.kind === "mixed" ? "wholePart" : "numerator");
  const [activeDigitIndex, setActiveDigitIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const divisor = greatestCommonDivisor(task.natural, task.fraction.denominator);
  const result = taskResult(task);
  const storySetupFieldIds = new Set(["given-fraction", "given-natural", "multiplication-fraction", "multiplication-natural"]);

  const isFieldLocked = (fieldId: string) => locked
    || Boolean(task.story && (storySetupComplete ? storySetupFieldIds.has(fieldId) : !storySetupFieldIds.has(fieldId)))
    || Boolean(!task.story && !cancellationRevealed);

  const partsFor = (field: WorkField): Array<{ part: FieldPart; count: number }> => field.kind === "integer"
    ? [{ part: "integer", count: digitCount(field.target) }]
    : field.kind === "fraction"
      ? [{ part: "numerator", count: digitCount(field.target.numerator) }, { part: "denominator", count: digitCount(field.target.denominator) }]
      : [{ part: "wholePart", count: digitCount(field.target.wholePart) }, { part: "numerator", count: digitCount(field.target.numerator) }, { part: "denominator", count: digitCount(field.target.denominator) }];

  const renderField = (id: string, options: { cancelledPart?: FieldPart; replacementId?: string; small?: boolean } = {}) => {
    const fieldIndex = fields.findIndex((field) => field.id === id);
    const field = fields[fieldIndex]!;
    const entry = entries[id]!;
    const fieldLocked = isFieldLocked(id);
    const renderPart = (part: FieldPart, count: number) => {
      const cells = <span className="flex justify-center gap-1">{Array.from({ length: count }, (_, digitIndex) => <EntryCell key={digitIndex} value={entry[part][digitIndex] ?? ""} label={`${field.label}: ${part === "integer" ? "liczba" : part === "wholePart" ? "część całkowita" : part === "numerator" ? "licznik" : "mianownik"}, cyfra ${digitIndex + 1} z ${count}`} active={!fieldLocked && activeFieldIndex === fieldIndex && activePart === part && activeDigitIndex === digitIndex} locked={fieldLocked} small={options.small} onActivate={() => { setActiveFieldIndex(fieldIndex); setActivePart(part); setActiveDigitIndex(digitIndex); }} />)}</span>;
      if (options.cancelledPart !== part) return cells;
      return <span className="relative inline-flex items-center px-1 pt-1" data-fraction-of-number-cancelled={part}>{cells}<i className="pointer-events-none absolute left-0 top-1/2 h-0.5 w-full -rotate-12 bg-rose-600" aria-hidden />{options.replacementId ? <span className="absolute -right-3 -top-6 rounded-lg border border-rose-200 bg-rose-50 p-1 shadow-sm" data-fraction-of-number-replacement>{renderField(options.replacementId, { small: true })}</span> : null}</span>;
    };
    if (field.kind === "integer") return <span className="inline-flex shrink-0" data-fraction-of-number-field={id}>{renderPart("integer", digitCount(field.target))}</span>;
    if (field.kind === "fraction") return <span className="inline-grid shrink-0 gap-1 text-center" data-fraction-of-number-field={id}>{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span>;
    return <span className="inline-flex shrink-0 items-center gap-2" data-fraction-of-number-field={id}>{renderPart("wholePart", digitCount(field.target.wholePart))}<span className="inline-grid gap-1 text-center">{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span></span>;
  };

  const edit = (keyValue: string) => {
    const field = fields[activeFieldIndex]!;
    if (isFieldLocked(field.id)) return;
    if (keyValue !== "backspace" && !/^[0-9]$/u.test(keyValue)) return;
    setEntries((current) => {
      const next = { ...current, [field.id]: { ...current[field.id]!, [activePart]: [...current[field.id]![activePart]] } };
      next[field.id]![activePart][activeDigitIndex] = keyValue === "backspace" ? "" : keyValue as FractionDigit;
      return next;
    });
    if (keyValue !== "backspace") {
      const order = partsFor(field).flatMap((item) => Array.from({ length: item.count }, (_, index) => ({ part: item.part, index })));
      const currentIndex = order.findIndex((cell) => cell.part === activePart && cell.index === activeDigitIndex);
      const next = order[Math.min(order.length - 1, currentIndex + 1)]!;
      setActivePart(next.part);
      setActiveDigitIndex(next.index);
    }
    setFeedback(null);
  };

  const confirm = () => {
    const fieldIsCorrect = (field: WorkField) => {
      const entry = entries[field.id]!;
      if (field.kind === "integer") return Number(entry.integer.join("")) === field.target;
      if (field.kind === "fraction") return Number(entry.numerator.join("")) === field.target.numerator && Number(entry.denominator.join("")) === field.target.denominator;
      return Number(entry.wholePart.join("")) === field.target.wholePart && Number(entry.numerator.join("")) === field.target.numerator && Number(entry.denominator.join("")) === field.target.denominator;
    };
    if (task.story && !storySetupComplete) {
      const setupCorrect = fields.filter((field) => storySetupFieldIds.has(field.id)).every(fieldIsCorrect);
      if (!setupCorrect) {
        setFeedback("Najpierw uzupełnij poprawnie zapis z literą „z” i jego zamianę na mnożenie.");
        onIncorrect();
        return;
      }
      setStorySetupComplete(true);
      const nextFieldIndex = fields.findIndex((field) => field.id === (divisor > 1 ? "reduced-denominator" : "result"));
      setActiveFieldIndex(nextFieldIndex);
      setActivePart("integer");
      setActiveDigitIndex(0);
      setFeedback(null);
      return;
    }
    const correct = fields.every(fieldIsCorrect);
    if (!correct) {
      setFeedback(task.story ? "Uzupełnij małe kratki przy skreśleniach, wynik działania oraz zdanie odpowiedzi." : "Sprawdź wszystkie aktywne kratki. Zatwierdzamy całe rozwiązanie dopiero po uzupełnieniu każdego kroku.");
      onIncorrect();
      return;
    }
    onComplete(`${result.numerator}/${result.denominator}`);
  };

  const workingLine = task.story ? <>
    {renderField("given-fraction")}<b>z</b>{renderField("given-natural")}<b>=</b>
    {storySetupComplete && divisor > 1
      ? renderField("multiplication-fraction", { cancelledPart: "denominator", replacementId: "reduced-denominator" })
      : renderField("multiplication-fraction")}
    <b>·</b>
    {storySetupComplete && divisor > 1
      ? renderField("multiplication-natural", { cancelledPart: "integer", replacementId: "reduced-natural" })
      : renderField("multiplication-natural")}
    {storySetupComplete ? <><b>=</b>{renderField("result")}{task.unit ? <b>{task.unit}</b> : null}</> : null}
  </> : cancellationRevealed ? <>
    <span className="relative inline-flex items-center px-2 pt-2">
      <CancelledFraction value={task.fraction} />
      <span className="absolute -right-3 -top-5 rounded-lg border border-rose-200 bg-rose-50 p-1 shadow-sm" data-fraction-of-number-replacement>{renderField("reduced-denominator", { small: true })}</span>
    </span>
    <b>·</b>
    <span className="relative inline-flex items-center px-2 pt-2">
      <CancelledNumber value={task.natural} />
      <span className="absolute -right-3 -top-5 rounded-lg border border-rose-200 bg-rose-50 p-1 shadow-sm" data-fraction-of-number-replacement>{renderField("reduced-natural", { small: true })}</span>
    </span>
    <b>=</b>
    {renderField("result")}
    {fields.some((field) => field.id === "mixed") ? <><b>=</b>{renderField("mixed")}</> : null}
  </> : <>
    <StaticFraction value={task.fraction} /><b>z</b><b>{task.natural}</b>
  </>;

  const helperText = task.story
    ? storySetupComplete
      ? "Zapis jest poprawny i zablokowany. Uzupełnij małe kratki przy skreśleniach, a potem wynik."
      : "Etap 1: wpisz ułamek z liczby, a po znaku równości zamień ten zapis na mnożenie."
    : cancellationRevealed
      ? "Wpisz liczby po skróceniu oraz wynik. Zatwierdź jeden raz na końcu."
      : "Najpierw zdecyduj, które liczby można skrócić.";

  return <div className="grid gap-4">{task.story ? <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Zadanie tekstowe</p><p className="mt-2 text-lg font-bold leading-relaxed">{task.story}</p></section> : null}<section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4">{task.story ? <h3 className="font-black">{task.prompt}</h3> : null}<div className="flex max-w-full flex-wrap items-center justify-center gap-3 overflow-x-auto px-3 py-6 text-xl font-black" aria-label="Pełny zapis obliczenia">{workingLine}</div>{!task.story && !cancellationRevealed && !locked ? <button type="button" className="mx-auto min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white" onClick={() => { setCancellationRevealed(true); setFeedback(null); }}>Skróć</button> : null}{task.story ? <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-lg font-bold" aria-label="Odpowiedź do zadania tekstowego"><b>Odpowiedź:</b><span>{task.answerLead}</span>{renderField("story-answer")}<span>{task.answerSuffix}</span></div> : null}<p className={`text-center text-sm font-bold ${storySetupComplete ? "text-emerald-800" : "text-indigo-800"}`}>{helperText}</p></section>{!locked && (task.story || cancellationRevealed) ? <LessonNumericKeypad label="Kalkulator do ułamka liczby naturalnej" helperText={task.story ? storySetupComplete ? "Wpisz wartości po skróceniu, wynik i odpowiedź." : "Najpierw uzupełnij zapis z literą z i mnożenie." : "Uzupełnij kratki po uruchomieniu skracania."} onKey={edit} onConfirm={confirm} /> : null}{feedback ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">{feedback}</p> : null}</div>;
}

export interface FractionOfNaturalNumberLessonModelProps {
  phase: FractionOperationsPhase;
  level?: FractionOperationsLevel;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionOfNaturalNumberLessonModel({ phase, level = "L1", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: FractionOfNaturalNumberLessonModelProps) {
  const advanced = level === "L2";
  const series = phase === "reasoning" ? advanced ? L2_COMPUTATION_TASKS : COMPUTATION_TASKS : advanced ? L2_FINAL_STORIES : FINAL_STORIES;
  const [roundIndex, setRoundIndex] = useState(0);
  const selectedIndex = phase === "independent" ? Math.min(series.length - 1, Math.max(0, (questionNumber ?? 1) - 1)) : roundIndex;
  const task = series[selectedIndex]!;
  const locked = readOnly || presentationMode && phase === "independent";

  useEffect(() => () => onResultChange?.(null), [onResultChange]);

  const complete = (answer: string) => {
    if (phase !== "independent" && roundIndex < series.length - 1) {
      setRoundIndex((index) => index + 1);
      onResultChange?.(null);
      return;
    }
    onResultChange?.(true, answer);
  };

  if (phase === "visual") return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading={advanced ? "Zaznacz ułamek liczby" : "Jedna piąta z 15 koralików"} description="Zaznacz wskazany ułamek zbioru i zapisz obliczenie." questionNumber={1} questionCount={1} contentClassName="grid gap-4" data-fraction-of-natural-number data-phase="visual"><BeadSelection locked={locked} advanced={advanced} onComplete={() => onResultChange?.(true, advanced ? "9 koralików" : "3 koraliki")} onIncorrect={() => onResultChange?.(false)} /></LessonTaskFrame>;

  const heading = phase === "reasoning" ? "Oblicz ułamek liczby" : "Zadania tekstowe";
  return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading={heading} description={phase === "reasoning" ? "Oblicz jedną szóstą z 20. Pokaż kolejne etapy w pustych kratkach." : "Odczytaj, jaką część całości trzeba obliczyć, i pokaż pełne działanie."} questionNumber={phase === "independent" ? questionNumber : roundIndex + 1} questionCount={phase === "independent" ? questionCount : series.length} contentClassName="grid gap-4" data-fraction-of-natural-number data-phase={phase}><CalculationRound key={task.id} task={task} locked={locked} onComplete={complete} onIncorrect={() => onResultChange?.(phase === "independent" ? false : null)} /></LessonTaskFrame>;
}
