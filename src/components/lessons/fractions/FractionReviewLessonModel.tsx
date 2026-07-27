"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { greatestCommonDivisor, normalizeFraction } from "@/lib/math/fractions/fractionMath";
import type { FractionOperationsPhase } from "@/lib/math/fractions/fractionOperationsLesson";
import type { FractionDigit, FractionValue, MixedFractionValue } from "@/types/fractions";

type FieldPart = "integer" | "wholePart" | "numerator" | "denominator";
type ReviewOperator = "+" | "−" | "·" | ":";
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
  | { id: string; kind: "add-sub"; prompt: string; left: MixedFractionValue; right: MixedFractionValue; operator: "+" | "−"; story?: string; answerLead?: string; answerSuffix?: string }
  | { id: string; kind: "number-line"; prompt: string; value: FractionValue; ticks: number; wholeCount: number }
  | { id: string; kind: "fraction-of"; prompt: string; fraction: FractionValue; natural: number; story?: string; answerLead?: string; answerSuffix?: string }
  | { id: string; kind: "multiply"; prompt: string; left: MixedFractionValue; right: MixedFractionValue; story?: string; answerLead?: string; answerSuffix?: string }
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
  { id: "review-add-mixed", kind: "add-sub", left: mixed(2, 1, 4), right: mixed(1, 2, 3), operator: "+", prompt: "Sprowadź tylko części ułamkowe do wspólnego mianownika. Części całkowite pozostaw bez zamiany." },
];

const NUMBER_LINE: readonly ReviewTask[] = [
  { id: "review-axis-1", kind: "number-line", value: { numerator: 3, denominator: 8 }, ticks: 8, wholeCount: 1, prompt: "Podpisz punkt A zaznaczony na osi." },
  { id: "review-axis-2", kind: "number-line", value: { numerator: 7, denominator: 6 }, ticks: 6, wholeCount: 2, prompt: "Podpisz punkt B. Punkt leży za jedną całością." },
  { id: "review-axis-3", kind: "number-line", value: { numerator: 11, denominator: 8 }, ticks: 8, wholeCount: 2, prompt: "Podpisz punkt C ułamkiem niewłaściwym." },
];

const COMPARISONS = [
  { id: "review-compare-1", left: { numerator: 5, denominator: 7 }, right: { numerator: 6, denominator: 7 } },
  { id: "review-compare-2", left: { numerator: 7, denominator: 9 }, right: { numerator: 7, denominator: 11 } },
  { id: "review-compare-3", left: { numerator: 5, denominator: 8 }, right: { numerator: 7, denominator: 12 } },
  { id: "review-compare-4", left: { numerator: 11, denominator: 9 }, right: { numerator: 6, denominator: 5 } },
  { id: "review-compare-5", left: { numerator: 14, denominator: 21 }, right: { numerator: 2, denominator: 3 } },
] as const;

const MULTIPLY_DIVIDE: readonly ReviewTask[] = [
  { id: "review-fraction-of", kind: "fraction-of", fraction: { numerator: 3, denominator: 8 }, natural: 120, prompt: "Zapisz działanie z literą „z”, zamień je na mnożenie i skróć przed obliczeniem." },
  { id: "review-multiply", kind: "multiply", left: fraction(7, 9), right: fraction(3, 14), prompt: "Skróć obie pary po skosie przed mnożeniem." },
  { id: "review-divide", kind: "divide", left: fraction(4, 5), right: fraction(2, 3), prompt: "Zamień dzielenie na mnożenie przez odwrotność, skróć i zapisz liczbę mieszaną." },
];

const CROSS_TOPIC_STORIES: readonly ReviewTask[] = [
  {
    id: "review-story-add",
    kind: "add-sub",
    left: mixed(2, 3, 4),
    right: mixed(1, 5, 6),
    operator: "+",
    prompt: "Samodzielnie wybierz działanie, zapisz obliczenia i odpowiedź.",
    story: "Do mieszanki wsypano dwa i trzy czwarte kilograma płatków oraz jeden i pięć szóstych kilograma suszonych owoców. Ile kilogramów waży mieszanka?",
    answerLead: "Mieszanka waży",
    answerSuffix: "kg.",
  },
  {
    id: "review-story-subtract",
    kind: "add-sub",
    left: mixed(5, 1, 4),
    right: mixed(2, 5, 6),
    operator: "−",
    prompt: "Samodzielnie wybierz działanie, zapisz obliczenia i odpowiedź.",
    story: "Trasa miała długość pięć i jedną czwartą kilometra. Turysta przeszedł dwa i pięć szóstych kilometra. Ile kilometrów pozostało?",
    answerLead: "Pozostało",
    answerSuffix: "km.",
  },
  {
    id: "review-story-fraction-of",
    kind: "fraction-of",
    fraction: { numerator: 7, denominator: 12 },
    natural: 180,
    prompt: "Samodzielnie zapisz działanie, obliczenia i odpowiedź.",
    story: "W pracowni przygotowano 180 koralików. Siedem dwunastych wykorzystano do wykonania naszyjników. Ile koralików wykorzystano?",
    answerLead: "Wykorzystano",
    answerSuffix: "koralików.",
  },
  {
    id: "review-story-multiply",
    kind: "multiply",
    left: mixed(1, 3, 5),
    right: mixed(2, 1, 4),
    prompt: "Samodzielnie wybierz działanie, zapisz obliczenia i odpowiedź.",
    story: "Maszyna do dekoracji zużywa jeden i trzy piąte metra wstążki w ciągu minuty. Pracowała przez dwie i jedną czwartą minuty. Ile metrów wstążki zużyła?",
    answerLead: "Maszyna zużyła",
    answerSuffix: "m wstążki.",
  },
  {
    id: "review-story-divide",
    kind: "divide",
    left: mixed(1, 5, 6),
    right: fraction(11, 12),
    prompt: "Samodzielnie wybierz działanie, zapisz obliczenia i odpowiedź.",
    story: "Wstążkę długości jeden i pięć szóstych metra podzielono na odcinki po jedenaście dwunastych metra. Ile odcinków otrzymano?",
    answerLead: "Otrzymano",
    answerSuffix: "odcinki.",
  },
];

const INDEPENDENT: readonly ReviewTask[] = [
  { id: "review-independent-1", kind: "add-sub", left: mixed(4, 2, 9), right: mixed(2, 5, 6), operator: "+", prompt: "Dodaj liczby mieszane bez zamieniania ich na ułamki niewłaściwe." },
  { id: "review-independent-2", kind: "add-sub", left: mixed(5, 1, 4), right: mixed(2, 5, 6), operator: "−", prompt: "Oblicz, ile trasy pozostało, i zapisz odpowiedź.", story: "Trasa miała długość pięć i jedną czwartą kilometra. Turysta przeszedł dwa i pięć szóstych kilometra. Ile kilometrów pozostało?", answerLead: "Pozostało", answerSuffix: "km." },
  { id: "review-independent-3", kind: "fraction-of", fraction: { numerator: 5, denominator: 8 }, natural: 96, prompt: "Oblicz liczbę przeczytanych stron i zapisz odpowiedź.", story: "Książka ma 96 stron. Zosia przeczytała pięć ósmych książki. Ile stron przeczytała?", answerLead: "Zosia przeczytała", answerSuffix: "stron." },
  { id: "review-independent-4", kind: "multiply", left: mixed(3, 1, 5), right: fraction(15, 28), prompt: "Zamień liczbę mieszaną, wykonaj dwa skrócenia i zapisz najprostszą postać wyniku." },
  { id: "review-independent-5", kind: "divide", left: mixed(1, 5, 6), right: fraction(11, 12), prompt: "Zapisz mnożenie przez odwrotność i oblicz liczbę odcinków.", story: "Wstążkę długości jednego i pięciu szóstych metra podzielono na odcinki po jedenaście dwunastych metra. Ile odcinków otrzymano?", answerLead: "Otrzymano", answerSuffix: "odcinki." },
  { id: "review-independent-6", kind: "add-sub", left: mixed(2, 3, 4), right: mixed(1, 5, 6), operator: "+", prompt: "Oblicz łączną masę składników i zapisz odpowiedź w najprostszej postaci.", story: "Do mieszanki wsypano dwa i trzy czwarte kilograma płatków oraz jeden i pięć szóstych kilograma suszonych owoców. Ile kilogramów waży mieszanka?", answerLead: "Mieszanka waży", answerSuffix: "kg." },
  { id: "review-independent-7", kind: "fraction-of", fraction: { numerator: 7, denominator: 12 }, natural: 180, prompt: "Oblicz liczbę wykorzystanych elementów i zapisz odpowiedź.", story: "W pracowni przygotowano 180 koralików. Siedem dwunastych wykorzystano do wykonania naszyjników. Ile koralików wykorzystano?", answerLead: "Wykorzystano", answerSuffix: "koralików." },
  { id: "review-independent-8", kind: "multiply", left: mixed(1, 3, 5), right: mixed(2, 1, 4), prompt: "Zamień obie liczby mieszane, skróć przed mnożeniem i zapisz wynik jako liczbę mieszaną." },
  { id: "review-independent-9", kind: "divide", left: mixed(4, 1, 2), right: mixed(1, 1, 5), prompt: "Zamień obie liczby mieszane, zastosuj mnożenie przez odwrotność i oblicz." },
  { id: "review-independent-10", kind: "add-sub", left: mixed(6, 1, 8), right: mixed(2, 5, 12), operator: "−", prompt: "Wykonaj odejmowanie z zamianą jednej całości i podaj odpowiedź.", story: "Z rolki długości sześć i jedną ósmą metra odcięto dwa i pięć dwunastych metra materiału. Ile materiału pozostało?", answerLead: "Pozostało", answerSuffix: "m materiału." },
];

type ReviewStoryVisual = "trail" | "book" | "ribbon-machine" | "ribbon-cutting" | "mixture" | "beads" | "fabric";

const REVIEW_STORY_VISUALS: Partial<Record<ReviewTask["id"], ReviewStoryVisual>> = {
  "review-story-add": "mixture",
  "review-story-subtract": "trail",
  "review-story-fraction-of": "beads",
  "review-story-multiply": "ribbon-machine",
  "review-story-divide": "ribbon-cutting",
  "review-independent-2": "trail",
  "review-independent-3": "book",
  "review-independent-5": "ribbon-cutting",
  "review-independent-6": "mixture",
  "review-independent-7": "beads",
  "review-independent-10": "fabric",
};

const REVIEW_STORY_VISUAL_LABELS: Record<ReviewStoryVisual, string> = {
  trail: "Turysta na górskiej trasie",
  book: "Otwarta książka z zakładką",
  "ribbon-machine": "Maszyna dekoracyjna zużywająca wstążkę",
  "ribbon-cutting": "Wstążka dzielona na równe odcinki",
  mixture: "Miska płatków i suszonych owoców",
  beads: "Kolorowe koraliki i naszyjnik",
  fabric: "Rolka materiału i nożyczki",
};

const REVIEW_STORY_VISUAL_PATHS: Record<ReviewStoryVisual, string> = {
  trail: "/lessons/illustrations/fractions/review/trail.png",
  book: "/lessons/illustrations/fractions/review/book.png",
  "ribbon-machine": "/lessons/illustrations/fractions/review/ribbon-machine.png",
  "ribbon-cutting": "/lessons/illustrations/fractions/review/ribbon-cutting.png",
  mixture: "/lessons/illustrations/fractions/review/mixture.png",
  beads: "/lessons/illustrations/fractions/review/beads.png",
  fabric: "/lessons/illustrations/fractions/review/fabric.png",
};

function ReviewStoryIllustration({ taskId }: { taskId: ReviewTask["id"] }) {
  const visual = REVIEW_STORY_VISUALS[taskId];
  if (!visual) return null;

  return <Image
    src={REVIEW_STORY_VISUAL_PATHS[visual]}
    alt={REVIEW_STORY_VISUAL_LABELS[visual]}
    data-review-story-visual={visual}
    width={640}
    height={640}
    sizes="(max-width: 768px) 55vw, 240px"
    className="mx-auto h-auto w-full max-w-[240px] object-contain"
  />;
}

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

function reviewValueField(id: string, label: string, value: MixedFractionValue): ReviewField {
  return value.wholePart > 0
    ? { id, label, kind: "mixed", target: value }
    : { id, label, kind: "fraction", target: { numerator: value.numerator, denominator: value.denominator } };
}

function sameMixed(first: MixedFractionValue, second: MixedFractionValue): boolean {
  return first.wholePart === second.wholePart && first.numerator === second.numerator && first.denominator === second.denominator;
}

function operationForTask(task: ReviewTask): ReviewOperator | null {
  if (task.kind === "add-sub") return task.operator;
  if (task.kind === "fraction-of" || task.kind === "multiply") return "·";
  if (task.kind === "divide") return ":";
  return null;
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
  if (task.kind === "number-line") return [{ id: "axis-value", label: "Ułamek przy punkcie", kind: "fraction", target: task.value }];
  if (task.kind === "add-sub") {
    const commonDenominator = leastCommonMultiple(task.left.denominator, task.right.denominator);
    const commonLeft: MixedFractionValue = { wholePart: task.left.wholePart, numerator: task.left.numerator * commonDenominator / task.left.denominator, denominator: commonDenominator };
    const commonRight: MixedFractionValue = { wholePart: task.right.wholePart, numerator: task.right.numerator * commonDenominator / task.right.denominator, denominator: commonDenominator };
    const needsBorrowing = task.operator === "−" && commonLeft.numerator < commonRight.numerator;
    const workingLeft: MixedFractionValue = needsBorrowing
      ? { wholePart: commonLeft.wholePart - 1, numerator: commonLeft.numerator + commonDenominator, denominator: commonDenominator }
      : commonLeft;
    const rawResult: MixedFractionValue = {
      wholePart: task.operator === "+" ? workingLeft.wholePart + commonRight.wholePart : workingLeft.wholePart - commonRight.wholePart,
      numerator: task.operator === "+" ? workingLeft.numerator + commonRight.numerator : workingLeft.numerator - commonRight.numerator,
      denominator: commonDenominator,
    };
    const normalized = normalizeFraction({ numerator: rawResult.wholePart * commonDenominator + rawResult.numerator, denominator: commonDenominator });
    const finalResult = asMixed(normalized);
    const fields: ReviewField[] = task.story ? [
      reviewValueField("operation-left", "Pierwsza liczba w działaniu", task.left),
      reviewValueField("operation-right", "Druga liczba w działaniu", task.right),
    ] : [];
    fields.push(
      reviewValueField("common-left", "Pierwsza liczba ze wspólnym mianownikiem", commonLeft),
      reviewValueField("common-right", "Druga liczba ze wspólnym mianownikiem", commonRight),
    );
    if (needsBorrowing) fields.push(reviewValueField("borrowed-left", "Pierwsza liczba po zamianie jednej całości", workingLeft));
    fields.push(reviewValueField("raw-result", "Wynik przed skróceniem", rawResult));
    if (!sameMixed(rawResult, finalResult)) fields.push(reviewValueField("simplified-result", "Wynik w najprostszej postaci", finalResult));
    if (task.story) fields.push(reviewValueField("answer", "Odpowiedź", finalResult));
    return fields;
  }
  if (task.kind === "fraction-of") {
    const divisor = greatestCommonDivisor(task.natural, task.fraction.denominator);
    const result = normalizeFraction({ numerator: task.fraction.numerator * task.natural, denominator: task.fraction.denominator });
    const fields: ReviewField[] = [
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
  const fields: ReviewField[] = task.story ? [
    reviewValueField("operation-left", "Pierwsza liczba w działaniu", task.left),
    reviewValueField("operation-right", "Druga liczba w działaniu", task.right),
  ] : [];
  if (task.left.wholePart > 0) fields.push({ id: "converted-left", label: "Pierwszy ułamek niewłaściwy", kind: "fraction", target: left });
  else if (task.story) fields.push({ id: "calculation-left", label: "Pierwszy ułamek w dalszym obliczeniu", kind: "fraction", target: left });
  if (task.right.wholePart > 0) fields.push({ id: "converted-right", label: "Drugi ułamek niewłaściwy", kind: "fraction", target: right });
  else if (task.story) fields.push({ id: "calculation-right", label: "Drugi ułamek w dalszym obliczeniu", kind: "fraction", target: right });
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
  if (task.story) fields.push(result.denominator === 1
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
  selectedOperator?: ReviewOperator | null;
  locked: boolean;
  onActivate?: (fieldId: string, part: FieldPart, digitIndex: number) => void;
  onSelectOperator?: (operator: ReviewOperator) => void;
}

function OperationPicker({ value, locked, onSelect }: { value?: ReviewOperator | null; locked: boolean; onSelect?: (operator: ReviewOperator) => void }) {
  return <span className="inline-flex shrink-0 gap-1" role="group" aria-label="Wybierz działanie">{(["+", "−", "·", ":"] as const).map((operator) => <button key={operator} type="button" disabled={locked} aria-pressed={value === operator} onClick={() => onSelect?.(operator)} className={`grid size-10 place-items-center rounded-lg border-2 text-lg font-black ${value === operator ? "border-indigo-700 bg-indigo-700 text-white" : "border-indigo-300 bg-white text-indigo-950"}`}>{operator}</button>)}</span>;
}

function ReviewWork({ task, fields, entries, active, selectedOperator, locked, onActivate, onSelectOperator }: WorkProps) {
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
  if (task.kind === "number-line") {
    const segments = task.ticks * task.wholeCount;
    const point = task.value.numerator / task.value.denominator * task.ticks;
    return <div className="grid gap-4"><svg viewBox="0 0 760 150" className="mx-auto h-auto w-full max-w-3xl" role="img" aria-label={`Oś liczbowa od zera do ${task.wholeCount}, punkt na pozycji ${task.value.numerator}/${task.value.denominator}`}><line x1="55" y1="72" x2="705" y2="72" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />{Array.from({ length: segments + 1 }, (_, index) => { const x = 55 + index / segments * 650; const major = index % task.ticks === 0; return <g key={index}><line x1={x} y1={major ? 48 : 58} x2={x} y2={major ? 96 : 86} stroke="#0f172a" strokeWidth={major ? 4 : 2} />{major ? <text x={x} y="126" textAnchor="middle" fontSize="24" fontWeight="800">{index / task.ticks}</text> : null}</g>; })}<circle cx={55 + point / segments * 650} cy="72" r="12" fill="#4f46e5" /><text x={55 + point / segments * 650} y="35" textAnchor="middle" fontSize="26" fontWeight="900" fill="#3730a3">{task.id.endsWith("1") ? "A" : task.id.endsWith("2") ? "B" : "C"}</text></svg><div className="flex items-center justify-center gap-3"><b>=</b>{renderField("axis-value")}</div></div>;
  }
  if (task.kind === "add-sub") {
    const hasBorrowing = fields.some((field) => field.id === "borrowed-left");
    const hasSimplified = fields.some((field) => field.id === "simplified-result");
    const hasAnswer = fields.some((field) => field.id === "answer");
    const operationMark = selectedOperator ?? "?";
    return <div className="grid gap-5">
      {task.story ? <>
        <div className="flex flex-wrap items-center justify-center gap-3"><span className="rounded-xl bg-indigo-50 p-2 text-sm">zapis działania</span>{renderField("operation-left")}<OperationPicker value={selectedOperator} locked={locked} onSelect={onSelectOperator} />{renderField("operation-right")}</div>
        <div className="flex flex-wrap items-center justify-center gap-3"><b>=</b>{renderField("common-left")}<b>{operationMark}</b>{renderField("common-right")}</div>
      </> : <div className="flex flex-wrap items-center justify-center gap-3"><StaticValue value={task.left} /><b>{task.operator}</b><StaticValue value={task.right} /><b>=</b>{renderField("common-left")}<b>{task.operator}</b>{renderField("common-right")}</div>}
      {hasBorrowing ? <div className="flex flex-wrap items-center justify-center gap-3"><span className="rounded-xl bg-amber-50 p-2 text-sm">zamiana jednej całości</span>{renderField("borrowed-left")}<b>{task.story ? operationMark : task.operator}</b>{renderField("common-right")}</div> : null}
      <div className="flex flex-wrap items-center justify-center gap-3"><span className="rounded-xl bg-indigo-50 p-2 text-sm">po dodaniu lub odjęciu</span><b>=</b>{renderField("raw-result")}</div>
      {hasSimplified ? <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-3"><span className="rounded-xl bg-white px-3 py-2 text-sm">wyłącz całość i zapisz najprostszą postać</span><b>=</b>{renderField("simplified-result")}</div> : null}
      {hasAnswer ? <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3"><b>Odpowiedź:</b><span>{task.answerLead}</span>{renderField("answer")}<span>{task.answerSuffix}</span></div> : null}
    </div>;
  }
  if (task.kind === "fraction-of") return <div className="grid gap-5"><div className="flex flex-wrap items-center justify-center gap-3">{task.story ? <>{renderField("multiplication-fraction")}<OperationPicker value={selectedOperator} locked={locked} onSelect={onSelectOperator} />{renderField("multiplication-natural")}</> : <><StaticFraction value={task.fraction} /><b>z</b><b>{task.natural}</b><b>=</b>{renderField("multiplication-fraction")}<b>·</b>{renderField("multiplication-natural")}</>}</div><div className="flex flex-wrap items-center justify-center gap-3"><span className="rounded-xl bg-rose-50 p-2">po skróceniu</span>{renderField("reduced-fraction")}<b>·</b>{renderField("reduced-natural")}<b>=</b>{renderField("result")}</div>{task.story ? <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3"><b>Odpowiedź:</b><span>{task.answerLead}</span>{renderField("answer")}<span>{task.answerSuffix}</span></div> : null}</div>;
  const hasConvertedLeft = fields.some((field) => field.id === "converted-left");
  const hasConvertedRight = fields.some((field) => field.id === "converted-right");
  const hasMixedResult = fields.some((field) => field.id === "mixed-result");
  const operationMark = selectedOperator ?? "?";
  const calculationLeft = hasConvertedLeft ? renderField("converted-left") : task.story ? renderField("calculation-left") : <StaticValue value={task.left} />;
  const calculationRight = hasConvertedRight ? renderField("converted-right") : task.story ? renderField("calculation-right") : <StaticValue value={task.right} />;
  return <div className="grid gap-5">
    {task.story ? <div className="flex flex-wrap items-center justify-center gap-3"><span className="rounded-xl bg-indigo-50 p-2 text-sm">zapis działania</span>{renderField("operation-left")}<OperationPicker value={selectedOperator} locked={locked} onSelect={onSelectOperator} />{renderField("operation-right")}</div> : <div className="flex flex-wrap items-center justify-center gap-3"><StaticValue value={task.left} /><b>{task.kind === "divide" ? ":" : "·"}</b><StaticValue value={task.right} /></div>}
    {hasConvertedLeft || hasConvertedRight ? <div className="flex flex-wrap items-center justify-center gap-3"><b>=</b>{calculationLeft}<b>{task.story ? operationMark : task.kind === "divide" ? ":" : "·"}</b>{calculationRight}</div> : null}
    {task.kind === "divide" ? <div className="flex flex-wrap items-center justify-center gap-3"><b>=</b>{renderField("multiplication-left")}<b>·</b>{renderField("reciprocal")}</div> : null}
    <div className="flex flex-wrap items-center justify-center gap-3"><span className="rounded-xl bg-rose-50 p-2">po skróceniu</span>{renderField("reduced-left")}<b>·</b>{renderField("reduced-right")}<b>=</b>{renderField("result")}{hasMixedResult ? <><b>=</b>{renderField("mixed-result")}</> : null}</div>
    {task.story ? <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3"><b>Odpowiedź:</b><span>{task.answerLead}</span>{renderField("answer")}<span>{task.answerSuffix}</span></div> : null}
  </div>;
}

interface OrderTask {
  id: string;
  steps: readonly FractionValue[];
}

const ORDER_TASKS: readonly OrderTask[] = [
  {
    id: "order-1",
    steps: [
      { numerator: 2, denominator: 4 },
      { numerator: 3, denominator: 4 },
      { numerator: 3, denominator: 4 },
      { numerator: 1, denominator: 2 },
    ],
  },
  {
    id: "order-2",
    steps: [
      { numerator: 1, denominator: 3 },
      { numerator: 9, denominator: 12 },
      { numerator: 4, denominator: 12 },
      { numerator: 5, denominator: 12 },
    ],
  },
  {
    id: "order-3",
    steps: [
      { numerator: 4, denominator: 5 },
      { numerator: 8, denominator: 15 },
    ],
  },
  {
    id: "order-4",
    steps: [
      { numerator: 2, denominator: 8 },
      { numerator: 5, denominator: 8 },
      { numerator: 4, denominator: 3 },
      { numerator: 5, denominator: 6 },
    ],
  },
  {
    id: "order-5",
    steps: [
      { numerator: 1, denominator: 2 },
      { numerator: 2, denominator: 6 },
      { numerator: 3, denominator: 6 },
      { numerator: 5, denominator: 6 },
    ],
  },
];

interface OrderEntry {
  numerator: FractionDigit[];
  denominator: FractionDigit[];
}

type OrderCell = { step: number; part: "numerator" | "denominator"; digitIndex: number };

function blankOrderEntries(task: OrderTask): OrderEntry[] {
  return task.steps.map((value) => ({
    numerator: Array.from({ length: digitCount(value.numerator) }, () => ""),
    denominator: Array.from({ length: digitCount(value.denominator) }, () => ""),
  }));
}

function OrderStepInput({ step, target, entry, active, locked, onActivate }: {
  step: number;
  target: FractionValue;
  entry: OrderEntry;
  active?: OrderCell;
  locked: boolean;
  onActivate: (part: "numerator" | "denominator", digitIndex: number) => void;
}) {
  const cells = (part: "numerator" | "denominator", targetValue: number) => <span className="flex justify-center gap-1">{Array.from({ length: digitCount(targetValue) }, (_, digitIndex) => <EntryCell key={digitIndex} value={entry[part][digitIndex] ?? ""} label={`Krok ${step + 1}: ${part === "numerator" ? "licznik" : "mianownik"}, cyfra ${digitIndex + 1} z ${digitCount(targetValue)}`} active={!locked && active?.step === step && active.part === part && active.digitIndex === digitIndex} locked={locked} onActivate={() => onActivate(part, digitIndex)} />)}</span>;
  return <span className="inline-grid shrink-0 gap-1 text-center align-middle"><span>{cells("numerator", target.numerator)}</span><i className="border-t-2 border-slate-950" /><span>{cells("denominator", target.denominator)}</span></span>;
}

function OrderTaskExpression({ taskId }: { taskId: string }) {
  const fraction = (numerator: number, denominator: number) => <StaticFraction value={{ numerator, denominator }} />;
  const expressionClass = "flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-indigo-300 bg-indigo-50 px-4 py-5 text-2xl font-black text-slate-950";

  if (taskId === "order-1") return <div className={expressionClass} aria-label="Działanie: w nawiasie jedna druga dodać jedną czwartą, razy dwie trzecie"><b>(</b>{fraction(1, 2)}<b>+</b>{fraction(1, 4)}<b>)</b><b>·</b>{fraction(2, 3)}</div>;
  if (taskId === "order-2") return <div className={expressionClass} aria-label="Działanie: trzy czwarte odjąć jedną drugą razy dwie trzecie">{fraction(3, 4)}<b>−</b>{fraction(1, 2)}<b>·</b>{fraction(2, 3)}</div>;
  if (taskId === "order-3") return <div className={expressionClass} aria-label="Działanie: dwie trzecie razy, w nawiasie trzy piąte dodać jedną piątą">{fraction(2, 3)}<b>·</b><b>(</b>{fraction(3, 5)}<b>+</b>{fraction(1, 5)}<b>)</b></div>;
  if (taskId === "order-4") return <div className={expressionClass} aria-label="Działanie: w nawiasie siedem ósmych odjąć jedną czwartą, podzielić przez trzy czwarte"><b>(</b>{fraction(7, 8)}<b>−</b>{fraction(1, 4)}<b>)</b><b>:</b>{fraction(3, 4)}</div>;
  return <div className={expressionClass} aria-label="Działanie: jedna trzecia dodać trzy czwarte podzielić przez trzy drugie">{fraction(1, 3)}<b>+</b>{fraction(3, 4)}<b>:</b>{fraction(3, 2)}</div>;
}

function OrderExpression({ taskId, step }: { taskId: string; step: (index: number) => ReactNode }) {
  const rowClass = "flex min-h-20 flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-indigo-100 bg-white px-3 py-4 text-xl font-black";
  const row = (label: string, content: ReactNode) => <div className={rowClass}><span className="mr-auto rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-900">{label}</span>{content}<span className="mr-auto hidden sm:block" aria-hidden /></div>;
  if (taskId === "order-1") return <div className="grid gap-3">
    {row("Sprowadź do mianownika 4", <><StaticFraction value={{ numerator: 1, denominator: 2 }} /><b>=</b>{step(0)}</>)}
    {row("Oblicz w nawiasie", <>{step(0)}<b>+</b><StaticFraction value={{ numerator: 1, denominator: 4 }} /><b>=</b>{step(1)}</>)}
    {row("Wykonaj mnożenie", <>{step(2)}<b>·</b><StaticFraction value={{ numerator: 2, denominator: 3 }} /><b>=</b>{step(3)}</>)}
  </div>;
  if (taskId === "order-2") return <div className="grid gap-3">
    {row("Najpierw mnożenie", <><StaticFraction value={{ numerator: 1, denominator: 2 }} /><b>·</b><StaticFraction value={{ numerator: 2, denominator: 3 }} /><b>=</b>{step(0)}</>)}
    {row("Sprowadź pierwszy ułamek", <><StaticFraction value={{ numerator: 3, denominator: 4 }} /><b>=</b>{step(1)}</>)}
    {row("Sprowadź wynik mnożenia", <><StaticFraction value={{ numerator: 1, denominator: 3 }} /><b>=</b>{step(2)}</>)}
    {row("Wykonaj odejmowanie", <>{step(1)}<b>−</b>{step(2)}<b>=</b>{step(3)}</>)}
  </div>;
  if (taskId === "order-3") return <div className="grid gap-3">
    {row("Oblicz w nawiasie", <><StaticFraction value={{ numerator: 3, denominator: 5 }} /><b>+</b><StaticFraction value={{ numerator: 1, denominator: 5 }} /><b>=</b>{step(0)}</>)}
    {row("Wykonaj mnożenie", <><StaticFraction value={{ numerator: 2, denominator: 3 }} /><b>·</b>{step(0)}<b>=</b>{step(1)}</>)}
  </div>;
  if (taskId === "order-4") return <div className="grid gap-3">
    {row("Sprowadź do mianownika 8", <><StaticFraction value={{ numerator: 1, denominator: 4 }} /><b>=</b>{step(0)}</>)}
    {row("Oblicz w nawiasie", <><StaticFraction value={{ numerator: 7, denominator: 8 }} /><b>−</b>{step(0)}<b>=</b>{step(1)}</>)}
    {row("Zapisz odwrotność dzielnika", <><StaticFraction value={{ numerator: 3, denominator: 4 }} /><b>→</b>{step(2)}</>)}
    {row("Wykonaj mnożenie", <>{step(1)}<b>·</b>{step(2)}<b>=</b>{step(3)}</>)}
  </div>;
  return <div className="grid gap-3">
    {row("Najpierw dzielenie", <><StaticFraction value={{ numerator: 3, denominator: 4 }} /><b>:</b><StaticFraction value={{ numerator: 3, denominator: 2 }} /><b>=</b>{step(0)}</>)}
    {row("Sprowadź pierwszy ułamek", <><StaticFraction value={{ numerator: 1, denominator: 3 }} /><b>=</b>{step(1)}</>)}
    {row("Sprowadź wynik dzielenia", <><StaticFraction value={{ numerator: 1, denominator: 2 }} /><b>=</b>{step(2)}</>)}
    {row("Wykonaj dodawanie", <>{step(1)}<b>+</b>{step(2)}<b>=</b>{step(3)}</>)}
  </div>;
}

function FractionOrderRound({ task, locked, onComplete, onIncorrect }: { task: OrderTask; locked: boolean; onComplete: (answer: string) => void; onIncorrect: () => void }) {
  const [entries, setEntries] = useState<OrderEntry[]>(() => blankOrderEntries(task));
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const cells = useMemo<OrderCell[]>(() => task.steps.flatMap((target, step) => ([
    ...Array.from({ length: digitCount(target.numerator) }, (_, digitIndex) => ({ step, part: "numerator" as const, digitIndex })),
    ...Array.from({ length: digitCount(target.denominator) }, (_, digitIndex) => ({ step, part: "denominator" as const, digitIndex })),
  ])), [task]);
  const active = cells[activeIndex]!;
  const activate = (step: number, part: "numerator" | "denominator", digitIndex: number) => setActiveIndex(cells.findIndex((cell) => cell.step === step && cell.part === part && cell.digitIndex === digitIndex));
  const edit = (keyValue: string) => {
    if (locked || (keyValue !== "backspace" && !/^[0-9]$/u.test(keyValue))) return;
    setEntries((current) => {
      const next = current.map((entry) => ({ numerator: [...entry.numerator], denominator: [...entry.denominator] }));
      next[active.step][active.part][active.digitIndex] = keyValue === "backspace" ? "" : keyValue as FractionDigit;
      return next;
    });
    if (keyValue !== "backspace") setActiveIndex((current) => Math.min(cells.length - 1, current + 1));
    setFeedback(null);
  };
  const confirm = () => {
    const complete = entries.every((entry) => entry.numerator.every(Boolean) && entry.denominator.every(Boolean));
    if (!complete) {
      setFeedback("Uzupełnij wszystkie kratki w każdym etapie obliczenia.");
      return;
    }
    const correct = task.steps.every((target, step) => Number(entries[step]!.numerator.join("")) === target.numerator && Number(entries[step]!.denominator.join("")) === target.denominator);
    if (!correct) {
      setFeedback("Sprawdź wszystkie kratki. Najpierw wykonaj nawias albo mnożenie czy dzielenie, a na końcu dodawanie lub odejmowanie.");
      onIncorrect();
      return;
    }
    const final = task.steps.at(-1)!;
    onComplete(`${final.numerator}/${final.denominator}`);
  };
  const renderStep = (step: number) => <OrderStepInput step={step} target={task.steps[step]!} entry={entries[step]!} active={active} locked={locked} onActivate={(part, digitIndex) => activate(step, part, digitIndex)} />;
  return <div className="grid gap-4"><section className="grid gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-indigo-700">Oblicz działanie</p><OrderTaskExpression taskId={task.id} /></div><p className="font-black">Najpierw nawiasy, potem mnożenie i dzielenie, a na końcu dodawanie albo odejmowanie.</p><div className="max-w-full overflow-x-auto rounded-2xl bg-slate-50 px-3 py-4" aria-label="Obliczenia krok po kroku"><OrderExpression taskId={task.id} step={renderStep} /></div><p className="text-center text-sm font-bold text-indigo-800">Po każdym znaku „=” wpisz wynik danego kroku. Uzupełnij wszystkie kratki i zatwierdź rozwiązanie jeden raz na końcu.</p></section>{!locked ? <LessonNumericKeypad label="Kalkulator do kolejności działań na ułamkach" helperText="Kliknij kratkę i uzupełnij wyniki kolejnych kroków." onKey={edit} onConfirm={confirm} /> : null}{feedback ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">{feedback}</p> : null}</div>;
}

function FractionOrderLesson({ readOnly = false, presentationMode = false, onResultChange }: FractionReviewLessonModelProps) {
  const [index, setIndex] = useState(0);
  const task = ORDER_TASKS[index]!;
  const locked = readOnly || presentationMode;
  useEffect(() => () => onResultChange?.(null), [onResultChange]);
  const complete = (answer: string) => {
    if (index < ORDER_TASKS.length - 1) {
      setIndex((current) => current + 1);
      onResultChange?.(null);
      return;
    }
    onResultChange?.(true, answer);
  };
  return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading="Kolejność działań na ułamkach" description="Zapisuj wyniki pośrednie w pustych kratkach." questionNumber={index + 1} questionCount={ORDER_TASKS.length} contentClassName="grid gap-4 text-slate-950" data-fraction-review data-phase="order"><FractionOrderRound key={task.id} task={task} locked={locked} onComplete={complete} onIncorrect={() => onResultChange?.(false)} /></LessonTaskFrame>;
}

function instructionFor(phase: FractionOperationsPhase) {
  if (phase === "visual") return { title: "Sprawność z ułamkami", text: "Wykonaj trzy krótkie zadania." };
  if (phase === "compare") return { title: "Który ułamek jest większy?", text: "Wybierz właściwy znak w pięciu porównaniach." };
  if (phase === "number-line") return { title: "Ułamki na osi liczbowej", text: "Podpisz trzy wskazane punkty." };
  if (phase === "reasoning") return { title: "Dodawanie i odejmowanie", text: "Sprowadź części ułamkowe do wspólnego mianownika. Części całkowite pozostaw bez zamiany." };
  if (phase === "context") return { title: "Mnożenie i dzielenie", text: "Uzupełnij obliczenia do trzech podanych przykładów." };
  if (phase === "stories") return { title: "Zadania tekstowe", text: "Wybierz działanie, zapisz obliczenia i odpowiedź." };
  return { title: "Trudniejsze zadania", text: "Dobierz metodę, wykonaj obliczenia i zapisz odpowiedź." };
}

function FractionComparisonReview({ readOnly, presentationMode, onResultChange }: Pick<FractionReviewLessonModelProps, "readOnly" | "presentationMode" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<"<" | "=" | ">" | null>(null);
  const [completed, setCompleted] = useState<Array<{ left: FractionValue; right: FractionValue; sign: "<" | "=" | ">" }>>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const task = COMPARISONS[index]!;
  const locked = readOnly || presentationMode;
  const expected = task.left.numerator * task.right.denominator === task.right.numerator * task.left.denominator
    ? "="
    : task.left.numerator * task.right.denominator < task.right.numerator * task.left.denominator ? "<" : ">";
  const submit = () => {
    if (!selected || selected !== expected) {
      setFeedback(selected ? "Sprawdź porównanie i wybierz poprawny znak." : "Najpierw wybierz znak.");
      onResultChange?.(false, selected ?? "brak znaku");
      return;
    }
    const next = [...completed, { left: task.left, right: task.right, sign: selected }];
    setCompleted(next);
    setFeedback(null);
    if (index === COMPARISONS.length - 1) onResultChange?.(true, "5 poprawnych porównań");
    else {
      setIndex((value) => value + 1);
      setSelected(null);
      onResultChange?.(null);
    }
  };
  return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading="Który ułamek jest większy?" description="Wybierz znak <, > albo =." questionNumber={index + 1} questionCount={COMPARISONS.length} contentClassName="grid gap-4 text-slate-950" data-fraction-review data-phase="compare">{completed.length ? <section className="flex flex-wrap gap-2" aria-label="Poprawnie porównane ułamki">{completed.map((item, itemIndex) => <span key={itemIndex} className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2"><StaticFraction value={item.left} /><b>{item.sign}</b><StaticFraction value={item.right} /></span>)}</section> : null}<section className="grid gap-5 rounded-2xl border-2 border-indigo-200 bg-white p-5"><div className="flex items-center justify-center gap-5 text-3xl"><StaticFraction value={task.left} /><b className="grid size-14 place-items-center rounded-xl border-2 border-dashed border-indigo-400">{selected ?? ""}</b><StaticFraction value={task.right} /></div><div className="flex justify-center gap-3" role="group" aria-label="Wybierz znak porównania">{(["<", "=", ">"] as const).map((sign) => <button key={sign} type="button" disabled={locked} aria-pressed={selected === sign} onClick={() => { setSelected(sign); setFeedback(null); }} className={`size-14 rounded-xl border-2 text-2xl font-black ${selected === sign ? "border-indigo-700 bg-indigo-700 text-white" : "border-indigo-300 bg-indigo-50"}`}>{sign}</button>)}</div>{!locked ? <button type="button" onClick={submit} className="min-h-14 rounded-2xl bg-cyan-300 px-5 font-black text-cyan-950">Zatwierdź</button> : null}{feedback ? <p role="status" className="rounded-xl bg-rose-50 p-3 font-black text-rose-900">{feedback}</p> : null}</section></LessonTaskFrame>;
}

function ReviewRound({ task, locked, onComplete, onIncorrect }: { task: ReviewTask; locked: boolean; onComplete: (entries: Record<string, FieldEntry>, answer: string) => void; onIncorrect: () => void }) {
  const fields = useMemo(() => buildFields(task), [task]);
  const story = "story" in task ? task.story : undefined;
  const expectedOperator = operationForTask(task);
  const [entries, setEntries] = useState<Record<string, FieldEntry>>(() => blankEntries(fields));
  const cells = useMemo(() => fields.flatMap((field) => partsFor(field).flatMap(({ part, count }) => Array.from({ length: count }, (_, digitIndex) => ({ fieldId: field.id, part, digitIndex })))), [fields]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOperator, setSelectedOperator] = useState<ReviewOperator | null>(null);
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
    const fieldIsCorrect = (field: ReviewField) => {
      const entry = entries[field.id]!;
      if (field.kind === "integer") return Number(entry.integer.join("")) === field.target;
      if (field.kind === "fraction") return Number(entry.numerator.join("")) === field.target.numerator && Number(entry.denominator.join("")) === field.target.denominator;
      return Number(entry.wholePart.join("")) === field.target.wholePart && Number(entry.numerator.join("")) === field.target.numerator && Number(entry.denominator.join("")) === field.target.denominator;
    };
    const incorrectField = fields.find((field) => !fieldIsCorrect(field));
    const correct = (!story || selectedOperator === expectedOperator) && !incorrectField;
    if (!correct) {
      if (story && !selectedOperator) {
        setFeedback("Najpierw wpisz działanie i wybierz właściwy znak.");
      } else if (task.kind === "add-sub" && incorrectField?.id === "raw-result") {
        const left = fields.find((field) => field.id === "common-left");
        const right = fields.find((field) => field.id === "common-right");
        const leftNumerator = left?.kind === "mixed" || left?.kind === "fraction" ? left.target.numerator : 0;
        const rightNumerator = right?.kind === "mixed" || right?.kind === "fraction" ? right.target.numerator : 0;
        const expectedNumerator = task.operator === "+" ? leftNumerator + rightNumerator : leftNumerator - rightNumerator;
        setFeedback(`Sprawdź działanie na licznikach: ${leftNumerator} ${task.operator} ${rightNumerator} = ${expectedNumerator}. Dopiero potem wyłącz całość i zapisz wynik w najprostszej postaci.`);
      } else if (task.kind === "add-sub" && incorrectField?.id === "simplified-result") {
        setFeedback("W osobnym wierszu wpisz wynik po wyłączeniu całości i w najprostszej postaci.");
      } else {
        setFeedback("Sprawdź wszystkie kratki i wybrane działanie. Każdy etap musi być uzupełniony przed zatwierdzeniem.");
      }
      onIncorrect();
      return;
    }
    const last = fields.at(-1)!;
    const target = last.target;
    const answer = typeof target === "number" ? String(target) : "wholePart" in target ? `${target.wholePart} ${target.numerator}/${target.denominator}` : `${target.numerator}/${target.denominator}`;
    onComplete(entries, answer);
  };

  return <div className="grid gap-4">{story ? <section className="grid items-center gap-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 md:grid-cols-[minmax(0,1fr)_240px]"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Zadanie tekstowe</p><p className="mt-2 text-lg font-bold leading-relaxed">{story}</p></div><ReviewStoryIllustration taskId={task.id} /></section> : null}<section className="grid gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4"><h3 className="font-black">{task.prompt}</h3><div className="max-w-full overflow-x-auto rounded-2xl bg-slate-50 px-3 py-6 text-xl font-black" aria-label="Pełny zapis powtórzeniowy"><ReviewWork task={task} fields={fields} entries={entries} active={active} selectedOperator={selectedOperator} locked={locked} onSelectOperator={(operator) => { setSelectedOperator(operator); setFeedback(null); }} onActivate={(fieldId, part, digitIndex) => setActiveIndex(cells.findIndex((cell) => cell.fieldId === fieldId && cell.part === part && cell.digitIndex === digitIndex))} /></div><p className="text-center text-sm font-bold text-indigo-800">{story ? "Najpierw zapisz działanie i wybierz znak. Wszystkie kratki uzupełnij przed zatwierdzeniem." : "Wszystkie kratki są aktywne. Zatwierdź rozwiązanie jeden raz na końcu."}</p></section>{!locked ? <LessonNumericKeypad label="Kalkulator do powtórzenia ułamków" helperText="Kliknij dowolną kratkę i wpisz kolejno wszystkie etapy rozwiązania." onKey={edit} onConfirm={confirm} /> : null}{feedback ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">{feedback}</p> : null}</div>;
}

export interface FractionReviewLessonModelProps {
  phase: FractionOperationsPhase;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export function FractionReviewLessonModel(props: FractionReviewLessonModelProps) {
  const { phase, readOnly = false, presentationMode = false, onResultChange } = props;
  if (phase === "compare") return <FractionComparisonReview readOnly={readOnly} presentationMode={presentationMode} onResultChange={onResultChange} />;
  if (phase === "order") return <FractionOrderLesson {...props} />;
  return <FractionReviewTaskLessonModel {...props} />;
}

function FractionReviewTaskLessonModel({ phase, readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: FractionReviewLessonModelProps) {
  const series = phase === "visual" ? FOUNDATIONS : phase === "number-line" ? NUMBER_LINE : phase === "reasoning" ? ADD_SUBTRACT : phase === "stories" ? CROSS_TOPIC_STORIES : phase === "context" ? MULTIPLY_DIVIDE : INDEPENDENT;
  const [roundIndex, setRoundIndex] = useState(0);
  const [completed, setCompleted] = useState<Array<{ task: ReviewTask; entries: Record<string, FieldEntry> }>>([]);
  const selectedIndex = phase === "independent" ? Math.min(series.length - 1, Math.max(0, (questionNumber ?? 1) - 1)) : roundIndex;
  const task = series[selectedIndex]!;
  const locked = readOnly || presentationMode && phase === "independent";
  const instruction = instructionFor(phase);

  useEffect(() => () => onResultChange?.(null), [onResultChange]);

  const complete = (entries: Record<string, FieldEntry>, answer: string) => {
    if (phase !== "independent" && roundIndex < series.length - 1) {
      if (phase !== "stories") setCompleted((current) => [...current, { task, entries }]);
      setRoundIndex((index) => index + 1);
      onResultChange?.(null);
      return;
    }
    onResultChange?.(true, answer);
  };

  const browseStory = (nextIndex: number) => {
    setRoundIndex(Math.min(series.length - 1, Math.max(0, nextIndex)));
    onResultChange?.(null);
  };

  return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading={instruction.title} description={instruction.text} questionNumber={phase === "independent" ? questionNumber : roundIndex + 1} questionCount={phase === "independent" ? questionCount : series.length} contentClassName="grid gap-4 text-slate-950" data-fraction-review data-phase={phase}>{phase === "stories" && presentationMode ? <nav aria-label="Nawigacja nauczyciela między zadaniami tekstowymi" className="grid grid-cols-2 gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-3"><button type="button" disabled={roundIndex === 0} onClick={() => browseStory(roundIndex - 1)} className="min-h-11 rounded-xl bg-white px-3 font-black text-indigo-950 shadow-sm disabled:opacity-35">← Poprzednie zadanie</button><button type="button" disabled={roundIndex === series.length - 1} onClick={() => browseStory(roundIndex + 1)} className="min-h-11 rounded-xl bg-indigo-700 px-3 font-black text-white shadow-sm disabled:opacity-35">Następne zadanie →</button></nav> : null}{completed.length > 0 ? <section className="grid gap-3" aria-label="Ukończone obliczenia"><h3 className="font-black text-emerald-900">Poprzednie obliczenia pozostają widoczne</h3>{completed.map(({ task: completedTask, entries }, index) => { const fields = buildFields(completedTask); return <article key={completedTask.id} className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3"><p className="mb-3 text-sm font-black text-emerald-900">✓ Zadanie {index + 1}</p><div className="max-w-full overflow-x-auto text-lg font-black"><ReviewWork task={completedTask} fields={fields} entries={entries} locked /></div></article>; })}</section> : null}<ReviewRound key={task.id} task={task} locked={locked} onComplete={complete} onIncorrect={() => onResultChange?.(phase === "independent" ? false : null)} /></LessonTaskFrame>;
}
