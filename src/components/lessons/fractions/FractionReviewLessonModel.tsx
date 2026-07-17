"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { greatestCommonDivisor, normalizeFraction } from "@/lib/math/fractions/fractionMath";
import type { FractionOperationsPhase } from "@/lib/math/fractions/fractionOperationsLesson";
import type { FractionDigit, FractionValue, MixedFractionValue } from "@/types/fractions";

type FieldPart = "integer" | "wholePart" | "numerator" | "denominator";
type ReviewField =
  | { id: string; label: string; kind: "integer"; target: number }
  | { id: string; label: string; kind: "fraction"; target: FractionValue }
  | { id: string; label: string; kind: "mixed"; target: MixedFractionValue };

interface FieldEntry {
  integer: FractionDigit[];
  wholePart: FractionDigit[];
  numerator: FractionDigit[];
  denominator: FractionDigit[];
}

type ReviewTask =
  | { id: string; kind: "to-mixed"; prompt: string; value: FractionValue }
  | { id: string; kind: "to-improper"; prompt: string; value: MixedFractionValue }
  | { id: string; kind: "reduce"; prompt: string; value: FractionValue }
  | { id: string; kind: "add-sub"; prompt: string; left: MixedFractionValue; right: MixedFractionValue; operator: "+" | "−" }
  | { id: string; kind: "fraction-of"; prompt: string; fraction: FractionValue; natural: number; story?: string; answerLead?: string; answerSuffix?: string }
  | { id: string; kind: "multiply"; prompt: string; left: MixedFractionValue; right: MixedFractionValue }
  | { id: string; kind: "divide"; prompt: string; left: MixedFractionValue; right: MixedFractionValue; story?: string; answerLead?: string; answerSuffix?: string };

const fraction = (numerator: number, denominator: number): MixedFractionValue => ({ wholePart: 0, numerator, denominator });
const mixed = (wholePart: number, numerator: number, denominator: number): MixedFractionValue => ({ wholePart, numerator, denominator });

const FOUNDATIONS: readonly ReviewTask[] = [
  { id: "review-foundation-1", kind: "to-mixed", value: { numerator: 11, denominator: 4 }, prompt: "Zapisz ułamek niewłaściwy jako liczbę mieszaną." },
  { id: "review-foundation-2", kind: "to-improper", value: mixed(3, 5, 7), prompt: "Zamień liczbę mieszaną na ułamek niewłaściwy. Pokaż obliczenie licznika." },
  { id: "review-foundation-3", kind: "reduce", value: { numerator: 18, denominator: 24 }, prompt: "Wpisz wspólny dzielnik, a następnie skróć ułamek do postaci nieskracalnej." },
];

const ADD_SUBTRACT: readonly ReviewTask[] = [
  { id: "review-add-1", kind: "add-sub", left: fraction(2, 3), right: fraction(3, 7), operator: "+", prompt: "Sprowadź oba ułamki do wspólnego mianownika, dodaj i zapisz liczbę mieszaną." },
  { id: "review-subtract-1", kind: "add-sub", left: fraction(5, 6), right: fraction(2, 9), operator: "−", prompt: "Sprowadź ułamki do wspólnego mianownika i odejmij." },
  { id: "review-add-mixed", kind: "add-sub", left: mixed(2, 1, 4), right: mixed(1, 2, 3), operator: "+", prompt: "Najpierw zamień obie liczby mieszane, a potem wykonaj dodawanie." },
];

const MULTIPLY_DIVIDE: readonly ReviewTask[] = [
  { id: "review-fraction-of", kind: "fraction-of", fraction: { numerator: 3, denominator: 8 }, natural: 120, prompt: "Zapisz działanie z literą „z”, zamień je na mnożenie i skróć przed obliczeniem." },
  { id: "review-multiply", kind: "multiply", left: fraction(7, 9), right: fraction(3, 14), prompt: "Skróć obie pary po skosie przed mnożeniem." },
  { id: "review-divide", kind: "divide", left: fraction(4, 5), right: fraction(2, 3), prompt: "Zamień dzielenie na mnożenie przez odwrotność, skróć i zapisz liczbę mieszaną." },
];

const INDEPENDENT: readonly ReviewTask[] = [
  { id: "review-independent-1", kind: "add-sub", left: fraction(7, 9), right: fraction(5, 12), operator: "+", prompt: "Dodaj ułamki o różnych mianownikach i zapisz liczbę mieszaną." },
  { id: "review-independent-2", kind: "add-sub", left: mixed(3, 1, 5), right: mixed(1, 7, 10), operator: "−", prompt: "Odejmij liczby mieszane, skróć wynik i zapisz go jako liczbę mieszaną." },
  { id: "review-independent-3", kind: "fraction-of", fraction: { numerator: 5, denominator: 8 }, natural: 96, prompt: "Oblicz liczbę przeczytanych stron i zapisz odpowiedź.", story: "Książka ma 96 stron. Zosia przeczytała pięć ósmych książki. Ile stron przeczytała?", answerLead: "Zosia przeczytała", answerSuffix: "stron." },
  { id: "review-independent-4", kind: "multiply", left: mixed(2, 1, 4), right: fraction(2, 3), prompt: "Zamień liczbę mieszaną, skróć przed mnożeniem i zapisz wynik jako liczbę mieszaną." },
  { id: "review-independent-5", kind: "divide", left: mixed(1, 5, 6), right: fraction(11, 12), prompt: "Zapisz mnożenie przez odwrotność i oblicz liczbę odcinków.", story: "Wstążkę długości jednego i pięciu szóstych metra podzielono na odcinki po jedenaście dwunastych metra. Ile odcinków otrzymano?", answerLead: "Otrzymano", answerSuffix: "odcinki." },
];

function improper(value: MixedFractionValue): FractionValue {
  return { numerator: value.wholePart * value.denominator + value.numerator, denominator: value.denominator };
}

function asMixed(value: FractionValue): MixedFractionValue {
  return { wholePart: Math.floor(value.numerator / value.denominator), numerator: value.numerator % value.denominator, denominator: value.denominator };
}

function leastCommonMultiple(first: number, second: number): number {
  return first / greatestCommonDivisor(first, second) * second;
}

function digitCount(value: number): number {
  return String(Math.abs(value)).length;
}

function sameFraction(first: FractionValue, second: FractionValue): boolean {
  return first.numerator === second.numerator && first.denominator === second.denominator;
}

function buildFields(task: ReviewTask): ReviewField[] {
  if (task.kind === "to-mixed") return [{ id: "result-mixed", label: "Liczba mieszana", kind: "mixed", target: asMixed(task.value) }];
  if (task.kind === "to-improper") {
    const converted = improper(task.value);
    return [
      { id: "calculated-numerator", label: "Obliczony licznik", kind: "integer", target: converted.numerator },
      { id: "result-fraction", label: "Ułamek niewłaściwy", kind: "fraction", target: converted },
    ];
  }
  if (task.kind === "reduce") {
    const divisor = greatestCommonDivisor(task.value.numerator, task.value.denominator);
    return [
      { id: "common-divisor", label: "Wspólny dzielnik", kind: "integer", target: divisor },
      { id: "result-fraction", label: "Ułamek po skróceniu", kind: "fraction", target: normalizeFraction(task.value) },
    ];
  }
  if (task.kind === "add-sub") {
    const left = improper(task.left);
    const right = improper(task.right);
    const commonDenominator = leastCommonMultiple(left.denominator, right.denominator);
    const commonLeft = { numerator: left.numerator * commonDenominator / left.denominator, denominator: commonDenominator };
    const commonRight = { numerator: right.numerator * commonDenominator / right.denominator, denominator: commonDenominator };
    const rawResult = { numerator: task.operator === "+" ? commonLeft.numerator + commonRight.numerator : commonLeft.numerator - commonRight.numerator, denominator: commonDenominator };
    const result = normalizeFraction(rawResult);
    const fields: ReviewField[] = [];
    if (task.left.wholePart > 0) fields.push({ id: "converted-left", label: "Pierwszy ułamek niewłaściwy", kind: "fraction", target: left });
    if (task.right.wholePart > 0) fields.push({ id: "converted-right", label: "Drugi ułamek niewłaściwy", kind: "fraction", target: right });
    fields.push(
      { id: "common-left", label: "Pierwszy ułamek ze wspólnym mianownikiem", kind: "fraction", target: commonLeft },
      { id: "common-right", label: "Drugi ułamek ze wspólnym mianownikiem", kind: "fraction", target: commonRight },
      { id: "raw-result", label: "Wynik przed skróceniem", kind: "fraction", target: rawResult },
    );
    if (!sameFraction(rawResult, result)) fields.push({ id: "simplified-result", label: "Wynik po skróceniu", kind: "fraction", target: result });
    if (result.numerator > result.denominator) fields.push({ id: "mixed-result", label: "Wynik jako liczba mieszana", kind: "mixed", target: asMixed(result) });
    return fields;
  }
  if (task.kind === "fraction-of") {
    const divisor = greatestCommonDivisor(task.natural, task.fraction.denominator);
    const result = normalizeFraction({ numerator: task.fraction.numerator * task.natural, denominator: task.fraction.denominator });
    const fields: ReviewField[] = [
      { id: "given-fraction", label: "Ułamek z treści", kind: "fraction", target: task.fraction },
      { id: "given-natural", label: "Liczba z treści", kind: "integer", target: task.natural },
      { id: "multiplication-fraction", label: "Ułamek w mnożeniu", kind: "fraction", target: task.fraction },
      { id: "multiplication-natural", label: "Liczba w mnożeniu", kind: "integer", target: task.natural },
      { id: "reduced-fraction", label: "Ułamek po skróceniu", kind: "fraction", target: { numerator: task.fraction.numerator, denominator: task.fraction.denominator / divisor } },
      { id: "reduced-natural", label: "Liczba po skróceniu", kind: "integer", target: task.natural / divisor },
    ];
    fields.push(result.denominator === 1
      ? { id: "result", label: "Wynik działania", kind: "integer", target: result.numerator }
      : { id: "result", label: "Wynik działania", kind: "fraction", target: result });
    if (task.story) fields.push({ id: "answer", label: "Odpowiedź", kind: "integer", target: result.numerator });
    return fields;
  }
  const left = improper(task.left);
  const right = improper(task.right);
  const workRight = task.kind === "divide" ? { numerator: right.denominator, denominator: right.numerator } : right;
  const firstDivisor = greatestCommonDivisor(left.numerator, workRight.denominator);
  const secondDivisor = greatestCommonDivisor(left.denominator, workRight.numerator);
  const reducedLeft = { numerator: left.numerator / firstDivisor, denominator: left.denominator / secondDivisor };
  const reducedRight = { numerator: workRight.numerator / secondDivisor, denominator: workRight.denominator / firstDivisor };
  const result = normalizeFraction({ numerator: left.numerator * workRight.numerator, denominator: left.denominator * workRight.denominator });
  const fields: ReviewField[] = [];
  if (task.left.wholePart > 0) fields.push({ id: "converted-left", label: "Pierwszy ułamek niewłaściwy", kind: "fraction", target: left });
  if (task.right.wholePart > 0) fields.push({ id: "converted-right", label: "Drugi ułamek niewłaściwy", kind: "fraction", target: right });
  fields.push(
    { id: "work-left", label: "Przepisany pierwszy ułamek", kind: "fraction", target: left },
    { id: "work-right", label: task.kind === "divide" ? "Przepisany dzielnik" : "Przepisany drugi ułamek", kind: "fraction", target: right },
  );
  if (task.kind === "divide") fields.push(
    { id: "multiplication-left", label: "Dzielna w mnożeniu", kind: "fraction", target: left },
    { id: "reciprocal", label: "Mnożenie przez odwrotność", kind: "fraction", target: workRight },
  );
  fields.push(
    { id: "reduced-left", label: "Pierwszy ułamek po skróceniu", kind: "fraction", target: reducedLeft },
    { id: "reduced-right", label: "Drugi ułamek po skróceniu", kind: "fraction", target: reducedRight },
  );
  fields.push(result.denominator === 1
    ? { id: "result", label: "Wynik działania", kind: "integer", target: result.numerator }
    : { id: "result", label: "Wynik działania", kind: "fraction", target: result });
  if (result.denominator > 1 && result.numerator > result.denominator) fields.push({ id: "mixed-result", label: "Wynik jako liczba mieszana", kind: "mixed", target: asMixed(result) });
  if (task.kind === "divide" && task.story) fields.push(result.denominator === 1
    ? { id: "answer", label: "Odpowiedź", kind: "integer", target: result.numerator }
    : { id: "answer", label: "Odpowiedź", kind: "fraction", target: result });
  return fields;
}

function blankEntries(fields: readonly ReviewField[]): Record<string, FieldEntry> {
  return Object.fromEntries(fields.map((field) => [field.id, {
    integer: Array.from({ length: field.kind === "integer" ? digitCount(field.target) : 1 }, () => ""),
    wholePart: Array.from({ length: field.kind === "mixed" ? digitCount(field.target.wholePart) : 1 }, () => ""),
    numerator: Array.from({ length: field.kind === "fraction" || field.kind === "mixed" ? digitCount(field.target.numerator) : 1 }, () => ""),
    denominator: Array.from({ length: field.kind === "fraction" || field.kind === "mixed" ? digitCount(field.target.denominator) : 1 }, () => ""),
  }])) as Record<string, FieldEntry>;
}

function partsFor(field: ReviewField): Array<{ part: FieldPart; count: number }> {
  if (field.kind === "integer") return [{ part: "integer", count: digitCount(field.target) }];
  if (field.kind === "fraction") return [{ part: "numerator", count: digitCount(field.target.numerator) }, { part: "denominator", count: digitCount(field.target.denominator) }];
  return [{ part: "wholePart", count: digitCount(field.target.wholePart) }, { part: "numerator", count: digitCount(field.target.numerator) }, { part: "denominator", count: digitCount(field.target.denominator) }];
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

function EntryCell({ value, label, active, locked, small = false, onActivate }: { value: string; label: string; active: boolean; locked: boolean; small?: boolean; onActivate: () => void }) {
  return <input value={value} inputMode="none" readOnly disabled={locked} aria-label={label} onFocus={locked ? undefined : onActivate} onClick={locked ? undefined : onActivate} className={`${small ? "h-8 w-8 text-base" : "h-11 w-11 text-xl"} rounded-lg border-2 text-center font-black opacity-100 ${locked ? "border-slate-300 bg-slate-100 text-slate-700" : active ? "border-indigo-600 bg-white ring-2 ring-indigo-200" : "border-indigo-300 bg-white"}`} />;
}

interface WorkProps {
  task: ReviewTask;
  fields: readonly ReviewField[];
  entries: Record<string, FieldEntry>;
  active?: { fieldId: string; part: FieldPart; digitIndex: number };
  locked: boolean;
  onActivate?: (fieldId: string, part: FieldPart, digitIndex: number) => void;
}

function ReviewWork({ task, fields, entries, active, locked, onActivate }: WorkProps) {
  const renderField = (id: string, small = false) => {
    const field = fields.find((item) => item.id === id)!;
    const entry = entries[id]!;
    const renderPart = (part: FieldPart, count: number) => <span className="flex justify-center gap-1">{Array.from({ length: count }, (_, digitIndex) => <EntryCell key={digitIndex} value={entry[part][digitIndex] ?? ""} label={`${field.label}: ${part === "integer" ? "liczba" : part === "wholePart" ? "część całkowita" : part === "numerator" ? "licznik" : "mianownik"}, cyfra ${digitIndex + 1} z ${count}`} active={!locked && active?.fieldId === id && active.part === part && active.digitIndex === digitIndex} locked={locked} small={small} onActivate={() => onActivate?.(id, part, digitIndex)} />)}</span>;
    if (field.kind === "integer") return <span className="inline-flex shrink-0">{renderPart("integer", digitCount(field.target))}</span>;
    if (field.kind === "fraction") return <span className="inline-grid shrink-0 gap-1 text-center">{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span>;
    return <span className="inline-flex shrink-0 items-center gap-2">{renderPart("wholePart", digitCount(field.target.wholePart))}<span className="inline-grid gap-1 text-center">{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span></span>;
  };

  if (task.kind === "to-mixed") return <div className="flex flex-wrap items-center justify-center gap-3"><StaticFraction value={task.value} /><b>=</b>{renderField("result-mixed")}</div>;
  if (task.kind === "to-improper") return <div className="grid gap-4"><div className="flex flex-wrap items-center justify-center gap-3"><b>{task.value.wholePart}</b><b>·</b><b>{task.value.denominator}</b><b>+</b><b>{task.value.numerator}</b><b>=</b>{renderField("calculated-numerator")}</div><div className="flex flex-wrap items-center justify-center gap-3"><StaticMixed value={task.value} /><b>=</b>{renderField("result-fraction")}</div></div>;
  if (task.kind === "reduce") return <div className="flex flex-wrap items-center justify-center gap-3"><StaticFraction value={task.value} /><b>:</b>{renderField("common-divisor")}<b>=</b>{renderField("result-fraction")}</div>;
  if (task.kind === "add-sub") {
    const hasConversion = task.left.wholePart > 0 || task.right.wholePart > 0;
    const hasSimplified = fields.some((field) => field.id === "simplified-result");
    const hasMixed = fields.some((field) => field.id === "mixed-result");
    return <div className="grid gap-5">{hasConversion ? <div className="flex flex-wrap items-center justify-center gap-3"><StaticValue value={task.left} /><b>{task.operator}</b><StaticValue value={task.right} /><b>=</b>{task.left.wholePart > 0 ? renderField("converted-left") : <StaticValue value={task.left} />}<b>{task.operator}</b>{task.right.wholePart > 0 ? renderField("converted-right") : <StaticValue value={task.right} />}</div> : null}<div className="flex flex-wrap items-center justify-center gap-3">{!hasConversion ? <><StaticValue value={task.left} /><b>{task.operator}</b><StaticValue value={task.right} /><b>=</b></> : null}{renderField("common-left")}<b>{task.operator}</b>{renderField("common-right")}<b>=</b>{renderField("raw-result")}{hasSimplified ? <><b>=</b>{renderField("simplified-result")}</> : null}{hasMixed ? <><b>=</b>{renderField("mixed-result")}</> : null}</div></div>;
  }
  if (task.kind === "fraction-of") return <div className="grid gap-5"><div className="flex flex-wrap items-center justify-center gap-3">{renderField("given-fraction")}<b>z</b>{renderField("given-natural")}<b>=</b>{renderField("multiplication-fraction")}<b>·</b>{renderField("multiplication-natural")}</div><div className="flex flex-wrap items-center justify-center gap-3"><span className="rounded-xl bg-rose-50 p-2">po skróceniu</span>{renderField("reduced-fraction")}<b>·</b>{renderField("reduced-natural")}<b>=</b>{renderField("result")}</div>{task.story ? <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3"><b>Odpowiedź:</b><span>{task.answerLead}</span>{renderField("answer")}<span>{task.answerSuffix}</span></div> : null}</div>;
  const hasConvertedLeft = fields.some((field) => field.id === "converted-left");
  const hasConvertedRight = fields.some((field) => field.id === "converted-right");
  const hasMixedResult = fields.some((field) => field.id === "mixed-result");
  return <div className="grid gap-5">{hasConvertedLeft || hasConvertedRight ? <div className="flex flex-wrap items-center justify-center gap-3"><StaticValue value={task.left} /><b>{task.kind === "divide" ? ":" : "·"}</b><StaticValue value={task.right} /><b>=</b>{hasConvertedLeft ? renderField("converted-left") : <StaticValue value={task.left} />}<b>{task.kind === "divide" ? ":" : "·"}</b>{hasConvertedRight ? renderField("converted-right") : <StaticValue value={task.right} />}</div> : null}<div className="flex flex-wrap items-center justify-center gap-3">{renderField("work-left")}<b>{task.kind === "divide" ? ":" : "·"}</b>{renderField("work-right")}{task.kind === "divide" ? <><b>=</b>{renderField("multiplication-left")}<b>·</b>{renderField("reciprocal")}</> : null}</div><div className="flex flex-wrap items-center justify-center gap-3"><span className="rounded-xl bg-rose-50 p-2">po skróceniu</span>{renderField("reduced-left")}<b>·</b>{renderField("reduced-right")}<b>=</b>{renderField("result")}{hasMixedResult ? <><b>=</b>{renderField("mixed-result")}</> : null}</div>{task.kind === "divide" && task.story ? <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3"><b>Odpowiedź:</b><span>{task.answerLead}</span>{renderField("answer")}<span>{task.answerSuffix}</span></div> : null}</div>;
}

function instructionFor(phase: FractionOperationsPhase) {
  if (phase === "visual") return { title: "Ułamki i liczby mieszane", text: "Przy zamianie liczby mieszanej oblicz licznik: część całkowita · mianownik + licznik. Przy skracaniu dziel licznik i mianownik przez tę samą liczbę." };
  if (phase === "reasoning") return { title: "Dodawanie i odejmowanie", text: "Najpierw zapisz ułamki ze wspólnym mianownikiem. Dopiero potem wykonaj działanie, skróć wynik i — jeśli trzeba — zapisz liczbę mieszaną." };
  if (phase === "context") return { title: "Mnożenie, dzielenie i ułamek liczby", text: "Mnożenie zapisujemy kropką. Przy dzieleniu stosujemy mnożenie przez odwrotność. Wszystkie skrócenia wykonujemy przed mnożeniem." };
  return { title: "Samodzielne powtórzenie", text: "Rozpoznaj rodzaj zadania i pokaż wszystkie etapy. Niczego nie obliczaj wyłącznie w pamięci." };
}

function ReviewRound({ task, locked, onComplete, onIncorrect }: { task: ReviewTask; locked: boolean; onComplete: (entries: Record<string, FieldEntry>, answer: string) => void; onIncorrect: () => void }) {
  const fields = useMemo(() => buildFields(task), [task]);
  const [entries, setEntries] = useState<Record<string, FieldEntry>>(() => blankEntries(fields));
  const cells = useMemo(() => fields.flatMap((field) => partsFor(field).flatMap(({ part, count }) => Array.from({ length: count }, (_, digitIndex) => ({ fieldId: field.id, part, digitIndex })))), [fields]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const active = cells[activeIndex]!;

  const edit = (keyValue: string) => {
    if (locked || keyValue !== "backspace" && !/^[0-9]$/u.test(keyValue)) return;
    setEntries((current) => {
      const fieldEntry = current[active.fieldId]!;
      const nextPart = [...fieldEntry[active.part]];
      nextPart[active.digitIndex] = keyValue === "backspace" ? "" : keyValue as FractionDigit;
      return { ...current, [active.fieldId]: { ...fieldEntry, [active.part]: nextPart } };
    });
    if (keyValue !== "backspace") setActiveIndex((index) => Math.min(cells.length - 1, index + 1));
    setFeedback(null);
  };

  const confirm = () => {
    const correct = fields.every((field) => {
      const entry = entries[field.id]!;
      if (field.kind === "integer") return Number(entry.integer.join("")) === field.target;
      if (field.kind === "fraction") return Number(entry.numerator.join("")) === field.target.numerator && Number(entry.denominator.join("")) === field.target.denominator;
      return Number(entry.wholePart.join("")) === field.target.wholePart && Number(entry.numerator.join("")) === field.target.numerator && Number(entry.denominator.join("")) === field.target.denominator;
    });
    if (!correct) {
      setFeedback("Sprawdź wszystkie kratki. Każdy etap obliczenia musi być uzupełniony przed zatwierdzeniem.");
      onIncorrect();
      return;
    }
    const last = fields.at(-1)!;
    const target = last.target;
    const answer = typeof target === "number" ? String(target) : "wholePart" in target ? `${target.wholePart} ${target.numerator}/${target.denominator}` : `${target.numerator}/${target.denominator}`;
    onComplete(entries, answer);
  };

  const story = "story" in task ? task.story : undefined;
  return <div className="grid gap-4">{story ? <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Zadanie tekstowe</p><p className="mt-2 text-lg font-bold leading-relaxed">{story}</p></section> : null}<section className="grid gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4"><h3 className="font-black">{task.prompt}</h3><div className="max-w-full overflow-x-auto rounded-2xl bg-slate-50 px-3 py-6 text-xl font-black" aria-label="Pełny zapis powtórzeniowy"><ReviewWork task={task} fields={fields} entries={entries} active={active} locked={locked} onActivate={(fieldId, part, digitIndex) => setActiveIndex(cells.findIndex((cell) => cell.fieldId === fieldId && cell.part === part && cell.digitIndex === digitIndex))} /></div><p className="text-center text-sm font-bold text-indigo-800">Wszystkie kratki są aktywne. Zatwierdź rozwiązanie jeden raz na końcu.</p></section>{!locked ? <LessonNumericKeypad label="Kalkulator do powtórzenia ułamków" helperText="Kliknij dowolną kratkę i wpisz kolejno wszystkie etapy rozwiązania." onKey={edit} onConfirm={confirm} /> : null}{feedback ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">{feedback}</p> : null}</div>;
}

export interface FractionReviewLessonModelProps {
  phase: FractionOperationsPhase;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export function FractionReviewLessonModel({ phase, readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: FractionReviewLessonModelProps) {
  const series = phase === "visual" ? FOUNDATIONS : phase === "reasoning" ? ADD_SUBTRACT : phase === "context" ? MULTIPLY_DIVIDE : INDEPENDENT;
  const [roundIndex, setRoundIndex] = useState(0);
  const [completed, setCompleted] = useState<Array<{ task: ReviewTask; entries: Record<string, FieldEntry> }>>([]);
  const selectedIndex = phase === "independent" ? Math.min(series.length - 1, Math.max(0, (questionNumber ?? 1) - 1)) : roundIndex;
  const task = series[selectedIndex]!;
  const locked = readOnly || presentationMode && phase === "independent";
  const instruction = instructionFor(phase);

  useEffect(() => () => onResultChange?.(null), [onResultChange]);

  const complete = (entries: Record<string, FieldEntry>, answer: string) => {
    if (phase !== "independent" && roundIndex < series.length - 1) {
      setCompleted((current) => [...current, { task, entries }]);
      setRoundIndex((index) => index + 1);
      onResultChange?.(null);
      return;
    }
    onResultChange?.(true, answer);
  };

  return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading={instruction.title} description={instruction.text} questionNumber={phase === "independent" ? questionNumber : roundIndex + 1} questionCount={phase === "independent" ? questionCount : series.length} contentClassName="grid gap-4 text-slate-950" data-fraction-review data-phase={phase}><section className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-indigo-800">Przypomnienie</p><p className="mt-2 font-semibold">{instruction.text}</p></section>{completed.length > 0 ? <section className="grid gap-3" aria-label="Ukończone obliczenia"><h3 className="font-black text-emerald-900">Poprzednie obliczenia pozostają widoczne</h3>{completed.map(({ task: completedTask, entries }, index) => { const fields = buildFields(completedTask); return <article key={completedTask.id} className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3"><p className="mb-3 text-sm font-black text-emerald-900">✓ Zadanie {index + 1}</p><div className="max-w-full overflow-x-auto text-lg font-black"><ReviewWork task={completedTask} fields={fields} entries={entries} locked /></div></article>; })}</section> : null}<ReviewRound key={task.id} task={task} locked={locked} onComplete={complete} onIncorrect={() => onResultChange?.(phase === "independent" ? false : null)} /></LessonTaskFrame>;
}
