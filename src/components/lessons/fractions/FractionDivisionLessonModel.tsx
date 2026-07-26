"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { greatestCommonDivisor, normalizeFraction } from "@/lib/math/fractions/fractionMath";
import type { FractionOperationsLevel, FractionOperationsPhase } from "@/lib/math/fractions/fractionOperationsLesson";
import type { FractionDigit, FractionValue, MixedFractionValue } from "@/types/fractions";

interface QuotientTask {
  id: string;
  dividend: MixedFractionValue;
  divisor: MixedFractionValue;
  prompt: string;
  story?: string;
  answerLead?: string;
  answerSuffix?: string;
  unit?: string;
}

const fraction = (numerator: number, denominator: number): MixedFractionValue => ({ wholePart: 0, numerator, denominator });
const mixed = (wholePart: number, numerator: number, denominator: number): MixedFractionValue => ({ wholePart, numerator, denominator });

const L1_MEASURE: readonly QuotientTask[] = [
  { id: "l1-measure-1", dividend: fraction(3, 4), divisor: fraction(1, 4), prompt: "Sprawdź, ile ćwiartek mieści się w trzech czwartych." },
  { id: "l1-measure-2", dividend: fraction(2, 3), divisor: fraction(1, 6), prompt: "Podziel pasek na szóste i policz miary." },
  { id: "l1-measure-3", dividend: fraction(7, 10), divisor: fraction(1, 10), prompt: "Policz dziesiąte części mieszczące się w dzielnej." },
];

const L1_RECIPROCAL: readonly QuotientTask[] = [
  { id: "l1-reciprocal-1", dividend: fraction(3, 5), divisor: fraction(2, 7), prompt: "Zamień dzielenie na mnożenie przez odwrotność i wykonaj działanie." },
  { id: "l1-reciprocal-2", dividend: fraction(5, 8), divisor: fraction(3, 4), prompt: "Zapisz mnożenie przez odwrotność, a następnie skróć." },
  { id: "l1-reciprocal-3", dividend: fraction(7, 12), divisor: fraction(5, 9), prompt: "Wykonaj zmianę działania i podaj wynik także jako liczbę mieszaną." },
];

const L1_STORIES: readonly QuotientTask[] = [
  { id: "l1-story-1", dividend: fraction(3, 4), divisor: fraction(1, 8), prompt: "Oblicz liczbę równych porcji.", story: "Trzy czwarte litra soku rozlano do szklanek po jednej ósmej litra. Ile szklanek napełniono?", answerLead: "Napełniono", answerSuffix: "szklanek.", unit: "szklanek" },
  { id: "l1-story-2", dividend: fraction(5, 6), divisor: fraction(1, 12), prompt: "Oblicz liczbę kawałków wstążki.", story: "Wstążkę długości pięciu szóstych metra pocięto na kawałki po jednej dwunastej metra. Ile kawałków otrzymano?", answerLead: "Otrzymano", answerSuffix: "kawałków.", unit: "kawałków" },
  { id: "l1-story-3", dividend: fraction(7, 10), divisor: fraction(1, 10), prompt: "Oblicz liczbę równych paczek.", story: "Siedem dziesiątych kilograma nasion rozdzielono do paczek po jednej dziesiątej kilograma. Ile paczek przygotowano?", answerLead: "Przygotowano", answerSuffix: "paczek.", unit: "paczek" },
];

const L1_INDEPENDENT: readonly QuotientTask[] = [
  { id: "l1-independent-1", dividend: fraction(4, 5), divisor: fraction(2, 3), prompt: "Zapisz mnożenie przez odwrotność i skróć wynik." },
  { id: "l1-independent-2", dividend: fraction(7, 9), divisor: fraction(14, 15), prompt: "Wykonaj skracanie po zmianie działania." },
  { id: "l1-independent-3", dividend: fraction(11, 12), divisor: fraction(5, 8), prompt: "Zapisz wynik jako ułamek i liczbę mieszaną." },
  { id: "l1-independent-4", dividend: fraction(9, 10), divisor: fraction(3, 20), prompt: "Sprawdź, czy wynik powinien być większy od jedności." },
  { id: "l1-independent-5", dividend: fraction(13, 18), divisor: fraction(26, 27), prompt: "Skróć obie pary przed mnożeniem." },
];

const L2_CANCEL: readonly QuotientTask[] = [
  { id: "l2-cancel-1", dividend: fraction(10, 21), divisor: fraction(25, 14), prompt: "Po zapisaniu mnożenia przez odwrotność skróć obie pary po skosie." },
  { id: "l2-cancel-2", dividend: fraction(16, 27), divisor: fraction(40, 9), prompt: "Wpisz cztery liczby po skróceniu, zanim pomnożysz." },
  { id: "l2-cancel-3", dividend: fraction(22, 35), divisor: fraction(44, 15), prompt: "Znajdź największe wygodne dzielniki obu par." },
];

const L2_IMPROPER: readonly QuotientTask[] = [
  { id: "l2-improper-1", dividend: fraction(7, 8), divisor: fraction(1, 4), prompt: "Oblicz i zapisz ułamek niewłaściwy jako liczbę mieszaną." },
  { id: "l2-improper-2", dividend: fraction(5, 6), divisor: fraction(2, 9), prompt: "Skróć przed mnożeniem i zapisz obie postacie wyniku." },
  { id: "l2-improper-3", dividend: fraction(11, 12), divisor: fraction(5, 18), prompt: "Oceń sens wyniku większego od jedności." },
];

const L2_STORIES: readonly QuotientTask[] = [
  { id: "l2-story-1", dividend: fraction(7, 8), divisor: fraction(7, 24), prompt: "Oblicz liczbę odcinków.", story: "Taśmę długości siedmiu ósmych metra pocięto na odcinki po siedem dwudziestych czwartych metra. Ile odcinków otrzymano?", answerLead: "Otrzymano", answerSuffix: "odcinki.", unit: "odcinki" },
  { id: "l2-story-2", dividend: fraction(9, 10), divisor: fraction(3, 20), prompt: "Oblicz liczbę paczek.", story: "Dziewięć dziesiątych kilograma herbaty rozdzielono do paczek po trzy dwudzieste kilograma. Ile paczek przygotowano?", answerLead: "Przygotowano", answerSuffix: "paczek.", unit: "paczek" },
  { id: "l2-story-3", dividend: fraction(11, 12), divisor: fraction(11, 36), prompt: "Oblicz liczbę szklanek.", story: "Jedenaście dwunastych litra napoju rozlano do szklanek po jedenaście trzydziestych szóstych litra. Ile szklanek napełniono?", answerLead: "Napełniono", answerSuffix: "szklanki.", unit: "szklanki" },
];

const L2_INDEPENDENT: readonly QuotientTask[] = [
  { id: "l2-independent-1", dividend: fraction(12, 35), divisor: fraction(18, 49), prompt: "Wykonaj dwa skrócenia po skosie." },
  { id: "l2-independent-2", dividend: fraction(15, 28), divisor: fraction(25, 42), prompt: "Zapisz wszystkie liczby po skróceniu." },
  { id: "l2-independent-3", dividend: fraction(22, 27), divisor: fraction(11, 18), prompt: "Podaj ułamek niewłaściwy i liczbę mieszaną." },
  { id: "l2-independent-4", dividend: fraction(8, 15), divisor: fraction(4, 25), prompt: "Oceń, dlaczego wynik jest większy od jedności." },
  { id: "l2-independent-5", dividend: fraction(17, 24), divisor: fraction(51, 40), prompt: "Skróć duże liczby przed mnożeniem." },
];

const L3_MIXED_FRACTION: readonly QuotientTask[] = [
  { id: "l3-mixed-fraction-1", dividend: mixed(2, 1, 4), divisor: fraction(3, 5), prompt: "Zamień dzielną na ułamek niewłaściwy, potem zapisz mnożenie przez odwrotność." },
  { id: "l3-mixed-fraction-2", dividend: mixed(3, 1, 3), divisor: fraction(5, 6), prompt: "Po zamianie wykonaj dwa skrócenia." },
  { id: "l3-mixed-fraction-3", dividend: mixed(1, 7, 8), divisor: fraction(3, 4), prompt: "Zapisz wynik także jako liczbę mieszaną." },
];

const L3_MIXED_BOTH: readonly QuotientTask[] = [
  { id: "l3-mixed-both-1", dividend: mixed(3, 1, 3), divisor: mixed(1, 1, 9), prompt: "Zamień obie liczby mieszane przed zapisaniem mnożenia przez odwrotność." },
  { id: "l3-mixed-both-2", dividend: mixed(4, 2, 5), divisor: mixed(1, 1, 10), prompt: "Wykonaj dwie zamiany i skracanie po skosie." },
  { id: "l3-mixed-both-3", dividend: mixed(2, 5, 6), divisor: mixed(1, 8, 9), prompt: "Zapisz pełne rozwiązanie oraz liczbę mieszaną." },
];

const L3_STORIES: readonly QuotientTask[] = [
  { id: "l3-story-1", dividend: mixed(2, 1, 2), divisor: fraction(5, 8), prompt: "Oblicz liczbę porcji.", story: "Dwa i pół litra zupy rozlano do pojemników po pięć ósmych litra. Ile pojemników napełniono?", answerLead: "Napełniono", answerSuffix: "pojemniki.", unit: "pojemniki" },
  { id: "l3-story-2", dividend: mixed(3, 3, 4), divisor: mixed(1, 1, 4), prompt: "Oblicz liczbę części taśmy.", story: "Taśmę długości trzech i trzech czwartych metra pocięto na części po jeden i jedną czwartą metra. Ile części otrzymano?", answerLead: "Otrzymano", answerSuffix: "części.", unit: "części" },
  { id: "l3-story-3", dividend: mixed(4, 1, 2), divisor: fraction(3, 4), prompt: "Oblicz liczbę paczek.", story: "Cztery i pół kilograma karmy rozdzielono do paczek po trzy czwarte kilograma. Ile paczek przygotowano?", answerLead: "Przygotowano", answerSuffix: "paczek.", unit: "paczek" },
];

const L3_INDEPENDENT: readonly QuotientTask[] = [
  { id: "l3-independent-1", dividend: mixed(2, 2, 3), divisor: fraction(4, 9), prompt: "Zamień dzielną i wykonaj skracanie." },
  { id: "l3-independent-2", dividend: mixed(3, 3, 5), divisor: mixed(1, 1, 5), prompt: "Zamień obie liczby mieszane." },
  { id: "l3-independent-3", dividend: mixed(5, 1, 4), divisor: fraction(7, 8), prompt: "Zapisz pełne rozwiązanie krok po kroku." },
  { id: "l3-independent-4", dividend: mixed(1, 5, 6), divisor: fraction(11, 12), prompt: "Wykonaj zamianę, mnożenie przez odwrotność i kontrolę." },
  { id: "l3-independent-5", dividend: mixed(4, 2, 7), divisor: mixed(1, 3, 7), prompt: "Rozwiąż działanie z dwoma różnymi liczbami mieszanymi." },
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

function quotient(task: QuotientTask): FractionValue {
  const dividend = improper(task.dividend);
  const divisor = improper(task.divisor);
  const result = normalizeFraction({ numerator: dividend.numerator * divisor.denominator, denominator: dividend.denominator * divisor.numerator });
  return { numerator: result.numerator, denominator: result.denominator };
}

function asMixed(value: FractionValue): MixedFractionValue {
  return { wholePart: Math.floor(value.numerator / value.denominator), numerator: value.numerator % value.denominator, denominator: value.denominator };
}

function digitCount(value: number): number {
  return String(Math.abs(value)).length;
}

function buildFields(task: QuotientTask) {
  const dividend = improper(task.dividend);
  const divisor = improper(task.divisor);
  const result = quotient(task);
  const setupIds = new Set(["source-dividend", "source-divisor", "work-dividend", "reciprocal"]);
  const fields: WorkField[] = [
    task.dividend.wholePart > 0
      ? { id: "source-dividend", label: "Dzielna", kind: "mixed", target: task.dividend }
      : { id: "source-dividend", label: "Dzielna", kind: "fraction", target: dividend },
    task.divisor.wholePart > 0
      ? { id: "source-divisor", label: "Dzielnik", kind: "mixed", target: task.divisor }
      : { id: "source-divisor", label: "Dzielnik", kind: "fraction", target: divisor },
  ];
  if (task.dividend.wholePart > 0) {
    fields.push({ id: "converted-dividend", label: "Ułamek niewłaściwy – dzielna", kind: "fraction", target: dividend });
    setupIds.add("converted-dividend");
  }
  if (task.divisor.wholePart > 0) {
    fields.push({ id: "converted-divisor", label: "Ułamek niewłaściwy – dzielnik", kind: "fraction", target: divisor });
    setupIds.add("converted-divisor");
  }
  fields.push(
    { id: "work-dividend", label: "Przepisana dzielna", kind: "fraction", target: dividend },
    { id: "reciprocal", label: "Mnożenie przez odwrotność", kind: "fraction", target: { numerator: divisor.denominator, denominator: divisor.numerator } },
  );
  const firstGcd = greatestCommonDivisor(dividend.numerator, divisor.numerator);
  const secondGcd = greatestCommonDivisor(dividend.denominator, divisor.denominator);
  if (firstGcd > 1) fields.push(
    { id: "reduced-first-numerator", label: "Pierwszy licznik po skróceniu", kind: "integer", target: dividend.numerator / firstGcd },
    { id: "reduced-second-denominator", label: "Drugi mianownik po skróceniu", kind: "integer", target: divisor.numerator / firstGcd },
  );
  if (secondGcd > 1) fields.push(
    { id: "reduced-first-denominator", label: "Pierwszy mianownik po skróceniu", kind: "integer", target: dividend.denominator / secondGcd },
    { id: "reduced-second-numerator", label: "Drugi licznik po skróceniu", kind: "integer", target: divisor.denominator / secondGcd },
  );
  fields.push(result.denominator === 1
    ? { id: "result", label: "Wynik dzielenia", kind: "integer", target: result.numerator }
    : { id: "result", label: "Wynik dzielenia", kind: "fraction", target: result });
  if (result.denominator > 1 && result.numerator > result.denominator) fields.push({ id: "mixed-result", label: "Wynik jako liczba mieszana", kind: "mixed", target: asMixed(result) });
  fields.push({ id: "check", label: "Wynik sprawdzenia", kind: "fraction", target: dividend });
  if (task.story) fields.push(result.denominator === 1
    ? { id: "story-answer", label: "Odpowiedź", kind: "integer", target: result.numerator }
    : result.numerator > result.denominator
      ? { id: "story-answer", label: "Odpowiedź", kind: "mixed", target: asMixed(result) }
      : { id: "story-answer", label: "Odpowiedź", kind: "fraction", target: result });
  return { fields, setupIds, firstGcd, secondGcd };
}

function blankEntries(fields: readonly WorkField[]): Record<string, FieldEntry> {
  return Object.fromEntries(fields.map((field) => [field.id, { integer: [""], wholePart: [""], numerator: [""], denominator: [""] }])) as Record<string, FieldEntry>;
}

function prefilledSetupEntries(fields: readonly WorkField[], setupIds: ReadonlySet<string>): Record<string, FieldEntry> {
  const entries = blankEntries(fields);
  for (const field of fields) {
    if (!setupIds.has(field.id)) continue;
    if (field.kind === "integer") entries[field.id] = { ...entries[field.id]!, integer: String(field.target).split("") as FractionDigit[] };
    if (field.kind === "fraction") entries[field.id] = { ...entries[field.id]!, numerator: String(field.target.numerator).split("") as FractionDigit[], denominator: String(field.target.denominator).split("") as FractionDigit[] };
    if (field.kind === "mixed") entries[field.id] = { ...entries[field.id]!, wholePart: String(field.target.wholePart).split("") as FractionDigit[], numerator: String(field.target.numerator).split("") as FractionDigit[], denominator: String(field.target.denominator).split("") as FractionDigit[] };
  }
  return entries;
}

function StaticFraction({ value }: { value: FractionValue }) {
  return <span className="inline-grid min-w-10 shrink-0 text-center font-black leading-none"><b>{value.numerator}</b><i className="my-1 border-t-2 border-slate-950" /><b>{value.denominator}</b></span>;
}

function StaticMixed({ value }: { value: MixedFractionValue }) {
  return <span className="inline-flex shrink-0 items-center gap-2"><b>{value.wholePart}</b><StaticFraction value={value} /></span>;
}

function StaticValue({ value }: { value: MixedFractionValue }) {
  return value.wholePart > 0 ? <StaticMixed value={value} /> : <StaticFraction value={improper(value)} />;
}

function CrossedNumber({ value, replacement }: { value: number; replacement: number }) {
  return <span className="relative inline-grid min-w-8 place-items-center px-1"><b>{value}</b><i className="absolute left-0 top-1/2 h-0.5 w-full -rotate-12 bg-rose-600" aria-hidden /><small className="absolute -right-3 -top-3 rounded bg-white px-1 text-sm font-black text-rose-700">{replacement}</small></span>;
}

function EntryCell({ value, label, active, disabled, small, onActivate }: { value: string; label: string; active: boolean; disabled: boolean; small: boolean; onActivate: () => void }) {
  return <input value={value} inputMode="none" readOnly disabled={disabled} aria-label={label} onFocus={disabled ? undefined : onActivate} onClick={disabled ? undefined : onActivate} className={`${small ? "h-8 w-8 text-base" : "h-11 w-11 text-xl"} rounded-lg border-2 text-center font-black ${disabled ? "border-slate-300 bg-slate-100 text-slate-700 opacity-100" : active ? "border-indigo-600 bg-white ring-2 ring-indigo-200" : "border-indigo-300 bg-white"}`} />;
}

function InstructionCard({ level }: { level: FractionOperationsLevel }) {
  if (level === "L3") return <section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-amber-800">Przykład</p><h3 className="text-lg font-black">Najpierw zamień liczby mieszane</h3><p className="font-semibold">Każdą liczbę mieszaną zamień na ułamek niewłaściwy. Następnie zapisz mnożenie przez odwrotność.</p><div className="grid gap-3 text-lg font-black sm:text-xl"><div className="flex items-center justify-center gap-3"><StaticMixed value={mixed(2, 1, 4)} /><b>:</b><StaticMixed value={mixed(1, 1, 2)} /></div><div className="flex items-center justify-center gap-3"><b>=</b><StaticFraction value={{ numerator: 9, denominator: 4 }} /><b>:</b><StaticFraction value={{ numerator: 3, denominator: 2 }} /></div><div className="flex items-center justify-center gap-3"><b>=</b><StaticFraction value={{ numerator: 9, denominator: 4 }} /><b>·</b><StaticFraction value={{ numerator: 2, denominator: 3 }} /><b>=</b><StaticFraction value={{ numerator: 3, denominator: 2 }} /></div></div></section>;
  if (level === "L2") return <section className="grid gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Przykład</p><h3 className="text-lg font-black">Skracaj przed mnożeniem przez odwrotność</h3><p className="font-semibold">Zamień dzielenie na mnożenie przez odwrotność. Następnie przekreśl pary po skosie i wpisz ich nowe wartości.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><StaticFraction value={{ numerator: 6, denominator: 7 }} /><b>:</b><StaticFraction value={{ numerator: 9, denominator: 14 }} /><b>=</b><span className="inline-grid text-center"><CrossedNumber value={6} replacement={2} /><i className="my-1 border-t-2 border-slate-950" /><CrossedNumber value={7} replacement={1} /></span><b>·</b><span className="inline-grid text-center"><CrossedNumber value={14} replacement={2} /><i className="my-1 border-t-2 border-slate-950" /><CrossedNumber value={9} replacement={3} /></span><b>=</b><StaticFraction value={{ numerator: 4, denominator: 3 }} /></div></section>;
  return <section className="grid gap-3 rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-indigo-800">Przykład</p><h3 className="text-lg font-black">Mnożenie przez odwrotność</h3><p className="font-semibold">Dzielenie przez ułamek zastąp mnożeniem przez odwrotność. Dzielna pozostaje bez zmiany.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><StaticFraction value={{ numerator: 2, denominator: 3 }} /><b>:</b><StaticFraction value={{ numerator: 1, denominator: 3 }} /><b>=</b><StaticFraction value={{ numerator: 2, denominator: 3 }} /><b>·</b><StaticFraction value={{ numerator: 3, denominator: 1 }} /><b>=</b><b>2</b></div></section>;
}

function MeasureStrip({ task }: { task: QuotientTask }) {
  const dividend = improper(task.dividend);
  const divisor = improper(task.divisor);
  const commonDenominator = dividend.denominator * divisor.denominator / greatestCommonDivisor(dividend.denominator, divisor.denominator);
  const totalUnits = dividend.numerator * (commonDenominator / dividend.denominator);
  const measureUnits = divisor.numerator * (commonDenominator / divisor.denominator);
  const count = totalUnits / measureUnits;
  return <section className="grid gap-4 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-4" aria-label="Model pomiarowy dzielenia ułamków"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-black">Ile razy miara mieści się w dzielnej?</h3><div className="flex items-center gap-2 font-black"><StaticFraction value={dividend} /><b>:</b><StaticFraction value={divisor} /></div></div><div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${totalUnits}, minmax(0, 1fr))` }}>{Array.from({ length: totalUnits }, (_, index) => <span key={index} className={`h-14 border-2 ${index % measureUnits === 0 ? "border-l-cyan-950" : "border-l-cyan-500"} ${Math.floor(index / measureUnits) % 2 === 0 ? "bg-cyan-300" : "bg-amber-300"}`} />)}</div><div className="flex flex-wrap items-center justify-center gap-2 font-black"><span>Miara</span><StaticFraction value={divisor} /><span>mieści się</span><b className="rounded-xl bg-white px-3 py-2 text-xl">{count}</b><span>razy.</span></div></section>;
}

function QuotientRound({ task, locked, directCalculation = false, onComplete, onIncorrect }: { task: QuotientTask; locked: boolean; directCalculation?: boolean; onComplete: (answer: string) => void; onIncorrect: () => void }) {
  const structure = useMemo(() => buildFields(task), [task]);
  const { fields, setupIds, firstGcd, secondGcd } = structure;
  const directLockedIds = new Set(["source-dividend", "source-divisor", "work-dividend", "reciprocal"]);
  const firstCalculationFieldIndex = Math.max(0, fields.findIndex((field) => directCalculation ? !directLockedIds.has(field.id) : !setupIds.has(field.id)));
  const initialField = fields[directCalculation ? firstCalculationFieldIndex : 0]!;
  const [entries, setEntries] = useState<Record<string, FieldEntry>>(() => directCalculation ? prefilledSetupEntries(fields, directLockedIds) : blankEntries(fields));
  const [setupComplete, setSetupComplete] = useState(directCalculation);
  const [activeFieldIndex, setActiveFieldIndex] = useState(directCalculation ? firstCalculationFieldIndex : 0);
  const [activePart, setActivePart] = useState<FieldPart>(initialField.kind === "mixed" ? "wholePart" : initialField.kind === "integer" ? "integer" : "numerator");
  const [activeDigitIndex, setActiveDigitIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const result = quotient(task);
  const isFieldDisabled = (fieldId: string) => locked || (directCalculation ? directLockedIds.has(fieldId) : setupComplete ? setupIds.has(fieldId) : !setupIds.has(fieldId));

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
      return <span className="relative inline-flex items-center px-1 pt-1" data-fraction-division-cancelled={part}>{cells}<i className="pointer-events-none absolute left-0 top-1/2 h-0.5 w-full -rotate-12 bg-rose-600" aria-hidden /><span className="absolute -right-3 -top-6 rounded-lg border border-rose-200 bg-rose-50 p-1 shadow-sm" data-fraction-division-replacement>{renderField(replacementId, { small: true })}</span></span>;
    };
    if (field.kind === "integer") return <span className="inline-flex shrink-0" data-fraction-division-field={id}>{renderPart("integer", digitCount(field.target))}</span>;
    if (field.kind === "fraction") return <span className="inline-grid shrink-0 gap-1 text-center" data-fraction-division-field={id}>{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span>;
    return <span className="inline-flex shrink-0 items-center gap-2" data-fraction-division-field={id}>{renderPart("wholePart", digitCount(field.target.wholePart))}<span className="inline-grid gap-1 text-center">{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span></span>;
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
        setFeedback("Uzupełnij dzielną, dzielnik, potrzebne zamiany oraz mnożenie przez odwrotność.");
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
      setFeedback(task.story ? "Uzupełnij skracanie, wynik, sprawdzenie i pełną odpowiedź." : "Uzupełnij skracanie, wynik oraz sprawdzenie mnożeniem.");
      onIncorrect();
      return;
    }
    onComplete(`${result.numerator}/${result.denominator}`);
  };

  const firstReplacements: Partial<Record<FieldPart, string>> = {};
  const reciprocalReplacements: Partial<Record<FieldPart, string>> = {};
  if (firstGcd > 1) {
    firstReplacements.numerator = "reduced-first-numerator";
    reciprocalReplacements.denominator = "reduced-second-denominator";
  }
  if (secondGcd > 1) {
    firstReplacements.denominator = "reduced-first-denominator";
    reciprocalReplacements.numerator = "reduced-second-numerator";
  }

  const sourceLine = <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-xl font-black" aria-label="Dane do dzielenia ułamków">{renderField("source-dividend")}<b>:</b>{renderField("source-divisor")}</div>;
  const conversionLine = task.dividend.wholePart > 0 || task.divisor.wholePart > 0 ? <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 font-black" aria-label="Zamiana liczb mieszanych">{task.dividend.wholePart > 0 ? <><span>Dzielna =</span>{renderField("converted-dividend")}</> : null}{task.divisor.wholePart > 0 ? <><span>Dzielnik =</span>{renderField("converted-divisor")}</> : null}</div> : null;
  const workLine = <div className="flex max-w-full flex-wrap items-center justify-center gap-3 overflow-x-auto px-3 py-7 text-xl font-black" aria-label="Pełny zapis dzielenia ułamków">{renderField("work-dividend", setupComplete ? { replacements: firstReplacements } : {})}<b>·</b>{renderField("reciprocal", setupComplete ? { replacements: reciprocalReplacements } : {})}{setupComplete ? <><b>=</b>{renderField("result")}{fields.some((field) => field.id === "mixed-result") ? <><b>=</b>{renderField("mixed-result")}</> : null}{task.unit ? <b>{task.unit}</b> : null}</> : null}</div>;
  const answerLine = task.story ? <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-lg font-bold" aria-label="Odpowiedź do zadania tekstowego"><b>Odpowiedź:</b><span>{task.answerLead}</span>{renderField("story-answer")}<span>{task.answerSuffix}</span></div> : null;

  return <div className="grid gap-4">{task.story ? <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Zadanie tekstowe</p><p className="mt-2 text-lg font-bold leading-relaxed">{task.story}</p></section> : <section className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-indigo-700">Twoje zadanie</p><div className="mt-3 flex items-center justify-center gap-3 text-2xl font-black" aria-label="Działanie do rozwiązania"><StaticValue value={task.dividend} /><b>:</b><StaticValue value={task.divisor} /></div></section>}<section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4"><h3 className="font-black">{task.prompt}</h3><p className="text-sm font-black text-indigo-800">1. Wpisz dzielną i dzielnik.</p>{sourceLine}{conversionLine}<p className="text-sm font-black text-indigo-800">2. Zapisz mnożenie przez odwrotność.</p>{workLine}{setupComplete ? <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4 font-black"><span>3. Sprawdzenie: otrzymany wynik ·</span><StaticValue value={task.divisor} /><b>=</b>{renderField("check")}</div> : null}{answerLine}<p className={`text-center text-sm font-bold ${setupComplete ? "text-emerald-800" : "text-indigo-800"}`}>{setupComplete ? firstGcd > 1 || secondGcd > 1 ? "Wpisz liczby po skróceniu, wynik i sprawdzenie. Poprawne wcześniejsze kroki pozostają widoczne." : "Wpisz wynik i wykonaj sprawdzenie mnożeniem." : "Najpierw uzupełnij wszystkie kratki w etapach 1 i 2."}</p></section>{!locked ? <LessonNumericKeypad label="Kalkulator do dzielenia ułamków" helperText={setupComplete ? task.story ? "Uzupełnij skracanie, wynik, sprawdzenie i odpowiedź." : "Uzupełnij skracanie, wynik i sprawdzenie." : "Uzupełnij dane, zamiany i mnożenie przez odwrotność."} onKey={edit} onConfirm={confirm} /> : null}{feedback ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">{feedback}</p> : null}</div>;
}

export interface FractionDivisionLessonModelProps {
  phase: FractionOperationsPhase;
  level?: FractionOperationsLevel;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function tasksFor(phase: FractionOperationsPhase, level: FractionOperationsLevel): readonly QuotientTask[] {
  if (level === "L3") return phase === "visual" ? L3_MIXED_FRACTION : phase === "reasoning" ? L3_MIXED_BOTH : phase === "context" ? L3_STORIES : L3_INDEPENDENT;
  if (level === "L2") return phase === "visual" ? L2_CANCEL : phase === "reasoning" ? L2_IMPROPER : phase === "context" ? L2_STORIES : L2_INDEPENDENT;
  return phase === "visual" ? L1_MEASURE : phase === "reasoning" ? L1_RECIPROCAL : phase === "context" ? L1_STORIES : L1_INDEPENDENT;
}

function headingFor(phase: FractionOperationsPhase, level: FractionOperationsLevel): string {
  if (level === "L3") return phase === "visual" ? "Liczba mieszana : ułamek" : phase === "reasoning" ? "Dwie liczby mieszane" : phase === "context" ? "Zadania tekstowe z liczbami mieszanymi" : "Dzielenie ułamków";
  if (level === "L2") return phase === "visual" ? "Skracanie przed mnożeniem" : phase === "reasoning" ? "Wynik większy od jedności" : phase === "context" ? "Trudniejsze zadania tekstowe" : "Dzielenie ułamków";
  return phase === "visual" ? "Ile razy mieści się miara?" : phase === "reasoning" ? "Mnożenie przez odwrotność" : phase === "context" ? "Zadania tekstowe" : "Dzielenie ułamków";
}

export function FractionDivisionLessonModel({ phase, level = "L1", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: FractionDivisionLessonModelProps) {
  const series = tasksFor(phase, level);
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

  return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading={headingFor(phase, level)} description={task.prompt} questionNumber={phase === "independent" ? questionNumber : roundIndex + 1} questionCount={phase === "independent" ? questionCount : series.length} contentClassName="grid gap-4" data-fraction-division data-level={level.toLowerCase()}><InstructionCard level={level} />{phase === "visual" && level === "L1" ? <MeasureStrip task={task} /> : null}<QuotientRound key={task.id} task={task} locked={locked} directCalculation={phase === "independent"} onComplete={complete} onIncorrect={() => onResultChange?.(phase === "independent" ? false : null)} /></LessonTaskFrame>;
}
