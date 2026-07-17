"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { greatestCommonDivisor, normalizeFraction } from "@/lib/math/fractions/fractionMath";
import type { FractionOperationsLevel, FractionOperationsPhase } from "@/lib/math/fractions/fractionOperationsLesson";
import type { FractionDigit, FractionValue, MixedFractionValue } from "@/types/fractions";

interface DivisionTask {
  id: string;
  dividend: MixedFractionValue;
  divisor: number;
  prompt: string;
  story?: string;
  answerLead?: string;
  answerSuffix?: string;
  unit?: string;
}

const fraction = (numerator: number, denominator: number): MixedFractionValue => ({ wholePart: 0, numerator, denominator });
const mixed = (wholePart: number, numerator: number, denominator: number): MixedFractionValue => ({ wholePart, numerator, denominator });

const L1_DIVIDE_NUMERATOR: readonly DivisionTask[] = [
  { id: "l1-divide-1", dividend: fraction(10, 11), divisor: 5, prompt: "Podziel licznik przez 5 i pozostaw mianownik bez zmiany." },
  { id: "l1-divide-2", dividend: fraction(8, 9), divisor: 4, prompt: "Rozdziel osiem dziewiątych na cztery równe części." },
  { id: "l1-divide-3", dividend: fraction(15, 16), divisor: 5, prompt: "Wykorzystaj podzielność licznika przez 5." },
];

const L1_MULTIPLY_DENOMINATOR: readonly DivisionTask[] = [
  { id: "l1-reciprocal-1", dividend: fraction(7, 10), divisor: 2, prompt: "Zapisz dzielenie jako mnożenie przez odwrotność liczby 2." },
  { id: "l1-reciprocal-2", dividend: fraction(7, 8), divisor: 3, prompt: "Licznik nie dzieli się przez 3 — pomnóż mianownik." },
  { id: "l1-reciprocal-3", dividend: fraction(11, 12), divisor: 5, prompt: "Utwórz mniejsze części przez pomnożenie mianownika przez 5." },
];

const L1_STORIES: readonly DivisionTask[] = [
  { id: "l1-story-1", dividend: fraction(3, 4), divisor: 3, prompt: "Oblicz porcję dla jednej osoby.", story: "Trzy czwarte pizzy podzielono równo między 3 osoby. Jaką część pizzy otrzymała każda osoba?", answerLead: "Każda osoba otrzymała", answerSuffix: "pizzy." },
  { id: "l1-story-2", dividend: fraction(5, 6), divisor: 2, prompt: "Oblicz długość jednego kawałka.", story: "Wstążkę długości pięciu szóstych metra przecięto na 2 równe kawałki. Jaką długość ma jeden kawałek?", answerLead: "Jeden kawałek ma długość", answerSuffix: "m.", unit: "m" },
  { id: "l1-story-3", dividend: fraction(7, 10), divisor: 4, prompt: "Oblicz ilość soku w jednej szklance.", story: "Siedem dziesiątych litra soku rozlano równo do 4 szklanek. Ile litra soku wlano do jednej szklanki?", answerLead: "Do jednej szklanki wlano", answerSuffix: "l soku.", unit: "l" },
];

const L1_INDEPENDENT: readonly DivisionTask[] = [
  { id: "l1-independent-1", dividend: fraction(12, 13), divisor: 4, prompt: "Skróć przed mnożeniem i sprawdź wynik." },
  { id: "l1-independent-2", dividend: fraction(7, 9), divisor: 2, prompt: "Zamień dzielenie na mnożenie przez odwrotność." },
  { id: "l1-independent-3", dividend: fraction(18, 25), divisor: 6, prompt: "Podziel licznik po skróceniu." },
  { id: "l1-independent-4", dividend: fraction(5, 14), divisor: 3, prompt: "Pomnóż mianownik i zapisz najprostszą postać." },
  { id: "l1-independent-5", dividend: fraction(21, 32), divisor: 7, prompt: "Wybierz najkrótszą poprawną drogę." },
];

const L2_CANCEL: readonly DivisionTask[] = [
  { id: "l2-cancel-1", dividend: fraction(14, 15), divisor: 7, prompt: "Skróć licznik z dzielnikiem przed mnożeniem." },
  { id: "l2-cancel-2", dividend: fraction(18, 25), divisor: 9, prompt: "Znajdź największy wspólny dzielnik licznika i dzielnika." },
  { id: "l2-cancel-3", dividend: fraction(24, 35), divisor: 8, prompt: "Wpisz wartości po skróceniu, a następnie wynik." },
];

const L2_MIXED: readonly DivisionTask[] = [
  { id: "l2-mixed-1", dividend: mixed(2, 1, 4), divisor: 3, prompt: "Najpierw zamień liczbę mieszaną na ułamek niewłaściwy." },
  { id: "l2-mixed-2", dividend: mixed(3, 1, 3), divisor: 2, prompt: "Po zamianie skróć licznik z dzielnikiem." },
  { id: "l2-mixed-3", dividend: mixed(4, 1, 2), divisor: 6, prompt: "Zamień, skróć i zapisz wynik w najprostszej postaci." },
];

const L2_STORIES: readonly DivisionTask[] = [
  { id: "l2-story-1", dividend: mixed(2, 1, 2), divisor: 5, prompt: "Oblicz pojemność jednej porcji.", story: "Dwa i pół litra zupy rozlano równo do 5 pojemników. Ile zupy znalazło się w jednym pojemniku?", answerLead: "W jednym pojemniku jest", answerSuffix: "l zupy.", unit: "l" },
  { id: "l2-story-2", dividend: mixed(3, 3, 4), divisor: 3, prompt: "Oblicz długość jednej części taśmy.", story: "Taśmę długości trzech i trzech czwartych metra podzielono na 3 równe części. Jaką długość ma jedna część?", answerLead: "Jedna część ma długość", answerSuffix: "m.", unit: "m" },
  { id: "l2-story-3", dividend: mixed(1, 5, 6), divisor: 2, prompt: "Oblicz masę jednej paczki.", story: "Jeden i pięć szóstych kilograma orzechów rozdzielono równo do 2 paczek. Ile waży jedna paczka?", answerLead: "Jedna paczka waży", answerSuffix: "kg.", unit: "kg" },
];

const L2_INDEPENDENT: readonly DivisionTask[] = [
  { id: "l2-independent-1", dividend: fraction(20, 27), divisor: 5, prompt: "Skróć licznik z dzielnikiem." },
  { id: "l2-independent-2", dividend: fraction(11, 12), divisor: 6, prompt: "Gdy nie można skrócić, pomnóż mianownik." },
  { id: "l2-independent-3", dividend: mixed(2, 2, 3), divisor: 4, prompt: "Zamień liczbę mieszaną i wykonaj skracanie." },
  { id: "l2-independent-4", dividend: mixed(3, 3, 5), divisor: 6, prompt: "Połącz zamianę, skracanie i kontrolę mnożeniem." },
  { id: "l2-independent-5", dividend: mixed(5, 1, 4), divisor: 7, prompt: "Zapisz pełne rozwiązanie i najprostszą postać wyniku." },
];

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

function improper(value: MixedFractionValue): FractionValue {
  return { numerator: value.wholePart * value.denominator + value.numerator, denominator: value.denominator };
}

function taskResult(task: DivisionTask): FractionValue {
  const source = improper(task.dividend);
  const result = normalizeFraction({ numerator: source.numerator, denominator: source.denominator * task.divisor });
  return { numerator: result.numerator, denominator: result.denominator };
}

function asMixed(value: FractionValue): MixedFractionValue {
  return { wholePart: Math.floor(value.numerator / value.denominator), numerator: value.numerator % value.denominator, denominator: value.denominator };
}

function digitCount(value: number): number {
  return String(Math.abs(value)).length;
}

function buildFields(task: DivisionTask): { fields: WorkField[]; setupIds: Set<string> } {
  const source = improper(task.dividend);
  const result = taskResult(task);
  const divisor = greatestCommonDivisor(source.numerator, task.divisor);
  const setupIds = new Set(["source", "divisor", "work", "reciprocal"]);
  const fields: WorkField[] = [
    task.dividend.wholePart > 0
      ? { id: "source", label: "Liczba mieszana", kind: "mixed", target: task.dividend }
      : { id: "source", label: "Dzielony ułamek", kind: "fraction", target: source },
    { id: "divisor", label: "Dzielnik", kind: "integer", target: task.divisor },
    { id: "work", label: task.dividend.wholePart > 0 ? "Ułamek niewłaściwy" : "Przepisany ułamek", kind: "fraction", target: source },
    { id: "reciprocal", label: "Odwrotność dzielnika", kind: "fraction", target: { numerator: 1, denominator: task.divisor } },
  ];
  if (divisor > 1) fields.push(
    { id: "reduced-numerator", label: "Licznik po skróceniu", kind: "integer", target: source.numerator / divisor },
    { id: "reduced-divisor", label: "Dzielnik po skróceniu", kind: "integer", target: task.divisor / divisor },
  );
  fields.push(result.denominator === 1
    ? { id: "result", label: "Wynik dzielenia", kind: "integer", target: result.numerator }
    : { id: "result", label: "Wynik dzielenia", kind: "fraction", target: result });
  if (result.denominator > 1 && result.numerator > result.denominator) fields.push({ id: "mixed-result", label: "Wynik jako liczba mieszana", kind: "mixed", target: asMixed(result) });
  fields.push({ id: "check", label: "Wynik sprawdzenia", kind: "fraction", target: source });
  if (task.story) fields.push(result.denominator === 1
    ? { id: "story-answer", label: "Odpowiedź", kind: "integer", target: result.numerator }
    : result.numerator > result.denominator
      ? { id: "story-answer", label: "Odpowiedź", kind: "mixed", target: asMixed(result) }
      : { id: "story-answer", label: "Odpowiedź", kind: "fraction", target: result });
  return { fields, setupIds };
}

function blankEntries(fields: readonly WorkField[]): Record<string, FieldEntry> {
  return Object.fromEntries(fields.map((field) => [field.id, { integer: [""], wholePart: [""], numerator: [""], denominator: [""] }])) as Record<string, FieldEntry>;
}

function StaticFraction({ value }: { value: FractionValue }) {
  return <span className="inline-grid min-w-10 shrink-0 text-center font-black leading-none"><b>{value.numerator}</b><i className="my-1 border-t-2 border-slate-950" /><b>{value.denominator}</b></span>;
}

function StaticMixed({ value }: { value: MixedFractionValue }) {
  return <span className="inline-flex shrink-0 items-center gap-2"><b>{value.wholePart}</b><StaticFraction value={value} /></span>;
}

function CrossedNumber({ value, replacement }: { value: number; replacement: number }) {
  return <span className="relative inline-grid min-w-8 place-items-center px-1"><b>{value}</b><i className="absolute left-0 top-1/2 h-0.5 w-full -rotate-12 bg-rose-600" aria-hidden /><small className="absolute -right-3 -top-3 rounded bg-white px-1 text-sm font-black text-rose-700">{replacement}</small></span>;
}

function EntryCell({ value, label, active, disabled, small, onActivate }: { value: string; label: string; active: boolean; disabled: boolean; small: boolean; onActivate: () => void }) {
  return <input value={value} inputMode="none" readOnly disabled={disabled} aria-label={label} onFocus={disabled ? undefined : onActivate} onClick={disabled ? undefined : onActivate} className={`${small ? "h-8 w-8 text-base" : "h-11 w-11 text-xl"} rounded-lg border-2 text-center font-black ${disabled ? "border-slate-300 bg-slate-100 text-slate-700 opacity-100" : active ? "border-indigo-600 bg-white ring-2 ring-indigo-200" : "border-indigo-300 bg-white"}`} />;
}

function InstructionCard({ task }: { task: DivisionTask }) {
  if (task.dividend.wholePart > 0) return <section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-amber-800">Przykład</p><h3 className="text-lg font-black">Najpierw zamień liczbę mieszaną</h3><p className="font-semibold">Liczbę mieszaną zamień na ułamek niewłaściwy, a dzielenie przez liczbę naturalną — na mnożenie przez jej odwrotność.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><StaticMixed value={mixed(1, 1, 2)} /><b>:</b><b>3</b><b>=</b><StaticFraction value={{ numerator: 3, denominator: 2 }} /><b>·</b><StaticFraction value={{ numerator: 1, denominator: 3 }} /><b>=</b><StaticFraction value={{ numerator: 1, denominator: 2 }} /></div></section>;
  const source = improper(task.dividend);
  const divisor = greatestCommonDivisor(source.numerator, task.divisor);
  if (divisor > 1) return <section className="grid gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Przykład</p><h3 className="text-lg font-black">Dziel licznik, gdy możesz</h3><p className="font-semibold">Dzielenie przez liczbę naturalną zapisz jako mnożenie przez jej odwrotność. Następnie skróć licznik z mianownikiem drugiego ułamka.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><StaticFraction value={{ numerator: 6, denominator: 7 }} /><b>:</b><b>3</b><b>=</b><span className="inline-grid text-center"><CrossedNumber value={6} replacement={2} /><i className="my-1 border-t-2 border-slate-950" /><b>7</b></span><b>·</b><span className="inline-grid text-center"><b>1</b><i className="my-1 border-t-2 border-slate-950" /><CrossedNumber value={3} replacement={1} /></span><b>=</b><StaticFraction value={{ numerator: 2, denominator: 7 }} /></div></section>;
  return <section className="grid gap-3 rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-indigo-800">Przykład</p><h3 className="text-lg font-black">Pomnóż przez odwrotność dzielnika</h3><p className="font-semibold">Jeśli licznika nie można podzielić przez dzielnik, pomnóż mianownik przez tę liczbę.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><StaticFraction value={{ numerator: 5, denominator: 6 }} /><b>:</b><b>2</b><b>=</b><StaticFraction value={{ numerator: 5, denominator: 6 }} /><b>·</b><StaticFraction value={{ numerator: 1, denominator: 2 }} /><b>=</b><StaticFraction value={{ numerator: 5, denominator: 12 }} /></div></section>;
}

function DivisionStrip({ task }: { task: DivisionTask }) {
  const source = improper(task.dividend);
  const perGroup = source.numerator / task.divisor;
  return <section className="grid gap-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-4"><h3 className="font-black">Podział na {task.divisor} równe części</h3><div className="grid gap-3">{Array.from({ length: task.divisor }, (_, groupIndex) => <div key={groupIndex} className="grid items-center gap-2 sm:grid-cols-[6rem_1fr]"><b>część {groupIndex + 1}</b><div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${source.denominator}, minmax(0, 1fr))` }}>{Array.from({ length: source.denominator }, (_, index) => <span key={index} className={`h-9 rounded border-2 ${index < perGroup ? "border-cyan-700 bg-cyan-400" : "border-slate-300 bg-white"}`} />)}</div></div>)}</div><div className="flex items-center justify-center gap-2 font-black"><span>Każda część:</span><StaticFraction value={{ numerator: perGroup, denominator: source.denominator }} /></div></section>;
}

function DivisionRound({ task, locked, onComplete, onIncorrect }: { task: DivisionTask; locked: boolean; onComplete: (answer: string) => void; onIncorrect: () => void }) {
  const structure = useMemo(() => buildFields(task), [task]);
  const { fields, setupIds } = structure;
  const [entries, setEntries] = useState<Record<string, FieldEntry>>(() => blankEntries(fields));
  const [setupComplete, setSetupComplete] = useState(false);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [activePart, setActivePart] = useState<FieldPart>(fields[0]!.kind === "mixed" ? "wholePart" : "numerator");
  const [activeDigitIndex, setActiveDigitIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const source = improper(task.dividend);
  const result = taskResult(task);
  const divisor = greatestCommonDivisor(source.numerator, task.divisor);
  const isFieldDisabled = (fieldId: string) => locked || (setupComplete ? setupIds.has(fieldId) : !setupIds.has(fieldId));

  const partsFor = (field: WorkField): Array<{ part: FieldPart; count: number }> => field.kind === "integer"
    ? [{ part: "integer", count: digitCount(field.target) }]
    : field.kind === "fraction"
      ? [{ part: "numerator", count: digitCount(field.target.numerator) }, { part: "denominator", count: digitCount(field.target.denominator) }]
      : [{ part: "wholePart", count: digitCount(field.target.wholePart) }, { part: "numerator", count: digitCount(field.target.numerator) }, { part: "denominator", count: digitCount(field.target.denominator) }];

  const renderField = (id: string, options: { replacements?: Partial<Record<FieldPart, string>>; small?: boolean } = {}): ReactNode => {
    const fieldIndex = fields.findIndex((field) => field.id === id);
    const field = fields[fieldIndex]!;
    const entry = entries[id]!;
    const disabled = isFieldDisabled(id);
    const renderPart = (part: FieldPart, count: number) => {
      const cells = <span className="flex justify-center gap-1">{Array.from({ length: count }, (_, digitIndex) => <EntryCell key={digitIndex} value={entry[part][digitIndex] ?? ""} label={`${field.label}: ${part === "integer" ? "liczba" : part === "wholePart" ? "część całkowita" : part === "numerator" ? "licznik" : "mianownik"}, cyfra ${digitIndex + 1} z ${count}`} active={!disabled && fieldIndex === activeFieldIndex && part === activePart && digitIndex === activeDigitIndex} disabled={disabled} small={Boolean(options.small)} onActivate={() => { setActiveFieldIndex(fieldIndex); setActivePart(part); setActiveDigitIndex(digitIndex); }} />)}</span>;
      const replacementId = options.replacements?.[part];
      if (!replacementId) return cells;
      return <span className="relative inline-flex items-center px-1 pt-1" data-natural-division-cancelled={part}>{cells}<i className="pointer-events-none absolute left-0 top-1/2 h-0.5 w-full -rotate-12 bg-rose-600" aria-hidden /><span className="absolute -right-3 -top-6 rounded-lg border border-rose-200 bg-rose-50 p-1 shadow-sm" data-natural-division-replacement>{renderField(replacementId, { small: true })}</span></span>;
    };
    if (field.kind === "integer") return <span className="inline-flex shrink-0" data-natural-division-field={id}>{renderPart("integer", digitCount(field.target))}</span>;
    if (field.kind === "fraction") return <span className="inline-grid shrink-0 gap-1 text-center" data-natural-division-field={id}>{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span>;
    return <span className="inline-flex shrink-0 items-center gap-2" data-natural-division-field={id}>{renderPart("wholePart", digitCount(field.target.wholePart))}<span className="inline-grid gap-1 text-center">{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span></span>;
  };

  const edit = (keyValue: string) => {
    const field = fields[activeFieldIndex]!;
    if (isFieldDisabled(field.id) || keyValue !== "backspace" && !/^[0-9]$/u.test(keyValue)) return;
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

  const fieldIsCorrect = (field: WorkField) => {
    const entry = entries[field.id]!;
    if (field.kind === "integer") return Number(entry.integer.join("")) === field.target;
    if (field.kind === "fraction") return Number(entry.numerator.join("")) === field.target.numerator && Number(entry.denominator.join("")) === field.target.denominator;
    return Number(entry.wholePart.join("")) === field.target.wholePart && Number(entry.numerator.join("")) === field.target.numerator && Number(entry.denominator.join("")) === field.target.denominator;
  };

  const confirm = () => {
    if (!setupComplete) {
      if (!fields.filter((field) => setupIds.has(field.id)).every(fieldIsCorrect)) {
        setFeedback(task.dividend.wholePart > 0 ? "Uzupełnij liczbę mieszaną, dzielnik, ułamek niewłaściwy i odwrotność dzielnika." : "Uzupełnij dzielony ułamek, dzielnik oraz zapis mnożenia przez odwrotność.");
        onIncorrect();
        return;
      }
      setSetupComplete(true);
      const nextFieldIndex = fields.findIndex((field) => !setupIds.has(field.id));
      setActiveFieldIndex(nextFieldIndex);
      setActivePart(fields[nextFieldIndex]!.kind === "fraction" ? "numerator" : fields[nextFieldIndex]!.kind === "mixed" ? "wholePart" : "integer");
      setActiveDigitIndex(0);
      setFeedback(null);
      return;
    }
    if (!fields.every(fieldIsCorrect)) {
      setFeedback(task.story ? "Uzupełnij wartości po skróceniu, wynik, sprawdzenie i pełną odpowiedź." : "Uzupełnij wartości po skróceniu, wynik oraz sprawdzenie mnożeniem.");
      onIncorrect();
      return;
    }
    onComplete(`${result.numerator}/${result.denominator}`);
  };

  const workReplacements: Partial<Record<FieldPart, string>> = {};
  const reciprocalReplacements: Partial<Record<FieldPart, string>> = {};
  if (divisor > 1) {
    workReplacements.numerator = "reduced-numerator";
    reciprocalReplacements.denominator = "reduced-divisor";
  }
  const line = <>{renderField("source")}<b>:</b>{renderField("divisor")}<b>=</b>{renderField("work", setupComplete ? { replacements: workReplacements } : {})}<b>·</b>{renderField("reciprocal", setupComplete ? { replacements: reciprocalReplacements } : {})}{setupComplete ? <><b>=</b>{renderField("result")}{fields.some((field) => field.id === "mixed-result") ? <><b>=</b>{renderField("mixed-result")}</> : null}{task.unit ? <b>{task.unit}</b> : null}</> : null}</>;
  const answerLine = task.story ? <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-lg font-bold" aria-label="Odpowiedź do zadania tekstowego"><b>Odpowiedź:</b><span>{task.answerLead}</span>{renderField("story-answer")}<span>{task.answerSuffix}</span></div> : null;

  return <div className="grid gap-4">{task.story ? <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Zadanie tekstowe</p><p className="mt-2 text-lg font-bold leading-relaxed">{task.story}</p></section> : null}<section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4">{task.story ? null : <><p className="text-xs font-black uppercase tracking-wide text-indigo-700">Twoje zadanie</p><div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-2xl font-black" aria-label="Działanie do rozwiązania">{task.dividend.wholePart > 0 ? <StaticMixed value={task.dividend} /> : <StaticFraction value={source} />}<b>:</b><b>{task.divisor}</b></div></>}<h3 className="font-black">{task.prompt}</h3><div className="flex max-w-full flex-wrap items-center justify-center gap-3 overflow-x-auto px-3 py-7 text-xl font-black" aria-label="Pełny zapis dzielenia ułamka przez liczbę naturalną">{line}</div>{setupComplete ? <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4 font-black"><span>Sprawdzenie: otrzymany wynik · {task.divisor} =</span>{renderField("check")}</div> : null}{answerLine}<p className={`text-center text-sm font-bold ${setupComplete ? "text-emerald-800" : "text-indigo-800"}`}>{setupComplete ? divisor > 1 ? "Wpisz liczby po skróceniu, wynik, a następnie wykonaj sprawdzenie mnożeniem." : "Wpisz wynik mnożenia przez odwrotność, a następnie wykonaj sprawdzenie." : task.dividend.wholePart > 0 ? "Etap 1: przepisz działanie, zamień liczbę mieszaną i zapisz odwrotność dzielnika." : "Etap 1: przepisz działanie i zamień dzielenie na mnożenie przez odwrotność."}</p></section>{!locked ? <LessonNumericKeypad label="Kalkulator do dzielenia ułamków" helperText={setupComplete ? task.story ? "Uzupełnij skracanie, wynik, sprawdzenie i odpowiedź." : "Uzupełnij skracanie, wynik i sprawdzenie." : "Uzupełnij cały pierwszy etap zapisu."} onKey={edit} onConfirm={confirm} /> : null}{feedback ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">{feedback}</p> : null}</div>;
}

export interface FractionByNaturalDivisionLessonModelProps {
  phase: FractionOperationsPhase;
  level?: FractionOperationsLevel;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function tasksFor(phase: FractionOperationsPhase, advanced: boolean): readonly DivisionTask[] {
  if (advanced) return phase === "visual" ? L2_CANCEL : phase === "reasoning" ? L2_MIXED : phase === "context" ? L2_STORIES : L2_INDEPENDENT;
  return phase === "visual" ? L1_DIVIDE_NUMERATOR : phase === "reasoning" ? L1_MULTIPLY_DENOMINATOR : phase === "context" ? L1_STORIES : L1_INDEPENDENT;
}

export function FractionByNaturalDivisionLessonModel({ phase, level = "L1", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: FractionByNaturalDivisionLessonModelProps) {
  const advanced = level === "L2";
  const series = tasksFor(phase, advanced);
  const [roundIndex, setRoundIndex] = useState(0);
  const selectedIndex = phase === "independent" ? Math.min(series.length - 1, Math.max(0, (questionNumber ?? 1) - 1)) : roundIndex;
  const task = series[selectedIndex]!;
  const locked = readOnly || presentationMode && phase === "independent";
  const heading = advanced
    ? phase === "visual" ? "Skracaj przed mnożeniem" : phase === "reasoning" ? "Liczba mieszana : liczba naturalna" : phase === "context" ? "Trudniejsze zadania tekstowe" : "Trudniejsze ćwiczenia"
    : phase === "visual" ? "Dziel licznik, gdy możesz" : phase === "reasoning" ? "Pomnóż przez odwrotność" : phase === "context" ? "Zadania tekstowe" : "Samodzielne ćwiczenia";

  useEffect(() => () => onResultChange?.(null), [onResultChange]);

  const complete = (answer: string) => {
    if (phase !== "independent" && roundIndex < series.length - 1) {
      setRoundIndex((index) => index + 1);
      onResultChange?.(null);
      return;
    }
    onResultChange?.(true, answer);
  };

  return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading={heading} description={task.prompt} questionNumber={phase === "independent" ? questionNumber : roundIndex + 1} questionCount={phase === "independent" ? questionCount : series.length} contentClassName="grid gap-4" data-fraction-by-natural-division data-level={advanced ? "advanced" : "basic"}><InstructionCard task={task} />{phase === "visual" ? <DivisionStrip task={task} /> : null}<DivisionRound key={task.id} task={task} locked={locked} onComplete={complete} onIncorrect={() => onResultChange?.(phase === "independent" ? false : null)} /></LessonTaskFrame>;
}
