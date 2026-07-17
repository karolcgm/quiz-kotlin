"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { greatestCommonDivisor, normalizeFraction } from "@/lib/math/fractions/fractionMath";
import type { FractionOperationsLevel, FractionOperationsPhase } from "@/lib/math/fractions/fractionOperationsLesson";
import type { FractionDigit, FractionValue, MixedFractionValue } from "@/types/fractions";

interface MultiplicationTask {
  id: string;
  left: MixedFractionValue;
  right: FractionValue;
  prompt: string;
  story?: string;
  unit?: string;
}

const fraction = (numerator: number, denominator: number): MixedFractionValue => ({ wholePart: 0, numerator, denominator });
const mixed = (wholePart: number, numerator: number, denominator: number): MixedFractionValue => ({ wholePart, numerator, denominator });

const L1_BASIC: readonly MultiplicationTask[] = [
  { id: "l1-basic-1", left: fraction(1, 2), right: { numerator: 1, denominator: 3 }, prompt: "Pomnóż licznik przez licznik i mianownik przez mianownik." },
  { id: "l1-basic-2", left: fraction(2, 5), right: { numerator: 3, denominator: 7 }, prompt: "Wpisz oba ułamki, a następnie ich iloczyn." },
  { id: "l1-basic-3", left: fraction(4, 9), right: { numerator: 2, denominator: 7 }, prompt: "Wykonaj mnożenie bez skracania po skosie." },
];

const L1_CANCEL: readonly MultiplicationTask[] = [
  { id: "l1-cancel-1", left: fraction(3, 8), right: { numerator: 4, denominator: 7 }, prompt: "Skróć mianownik pierwszego ułamka z licznikiem drugiego." },
  { id: "l1-cancel-2", left: fraction(2, 3), right: { numerator: 5, denominator: 8 }, prompt: "Skróć licznik pierwszego ułamka z mianownikiem drugiego." },
  { id: "l1-cancel-3", left: fraction(5, 12), right: { numerator: 6, denominator: 25 }, prompt: "Wykonaj dwa skrócenia po skosie." },
];

const L1_STORIES: readonly MultiplicationTask[] = [
  { id: "l1-story-1", left: fraction(4, 7), right: { numerator: 7, denominator: 9 }, prompt: "Oblicz pomalowaną część całego muralu.", story: "Artysta pomalował siedem dziewiątych muralu. Cztery siódme pomalowanej części są niebieskie. Jaka część całego muralu jest niebieska?" },
  { id: "l1-story-2", left: fraction(3, 5), right: { numerator: 10, denominator: 11 }, prompt: "Oblicz wykorzystaną część całej wstążki.", story: "Do dekoracji przeznaczono dziesięć jedenastych wstążki. Zużyto trzy piąte tej części. Jaka część całej wstążki została zużyta?" },
  { id: "l1-story-3", left: fraction(7, 12), right: { numerator: 8, denominator: 21 }, prompt: "Oblicz część całego zbiornika.", story: "W zbiorniku było osiem dwudziestych pierwszych jego pojemności. Zużyto siedem dwunastych tej ilości. Jaką część pojemności zbiornika zużyto?" },
];

const L1_INDEPENDENT: readonly MultiplicationTask[] = [
  { id: "l1-independent-1", left: fraction(3, 7), right: { numerator: 5, denominator: 8 }, prompt: "Wykonaj mnożenie bez skracania." },
  { id: "l1-independent-2", left: fraction(4, 9), right: { numerator: 5, denominator: 14 }, prompt: "Skróć jedną parę po skosie." },
  { id: "l1-independent-3", left: fraction(6, 7), right: { numerator: 14, denominator: 15 }, prompt: "Wykonaj dwa skrócenia przed mnożeniem." },
  { id: "l1-independent-4", left: fraction(5, 14), right: { numerator: 7, denominator: 15 }, prompt: "Wpisz wszystkie cztery liczby po skróceniu." },
  { id: "l1-independent-5", left: fraction(8, 11), right: { numerator: 33, denominator: 40 }, prompt: "Skróć wygodnie i podaj najprostszą postać wyniku." },
];

const L2_CANCEL: readonly MultiplicationTask[] = [
  { id: "l2-cancel-1", left: fraction(7, 12), right: { numerator: 18, denominator: 35 }, prompt: "Znajdź dwie pary do skrócenia po skosie." },
  { id: "l2-cancel-2", left: fraction(14, 15), right: { numerator: 25, denominator: 28 }, prompt: "Skróć liczby na obu przekątnych." },
  { id: "l2-cancel-3", left: fraction(9, 16), right: { numerator: 8, denominator: 27 }, prompt: "Wpisz cztery wartości po skróceniu, a potem wynik." },
];

const L2_MIXED: readonly MultiplicationTask[] = [
  { id: "l2-mixed-1", left: mixed(2, 1, 3), right: { numerator: 9, denominator: 14 }, prompt: "Najpierw zamień liczbę mieszaną na ułamek niewłaściwy." },
  { id: "l2-mixed-2", left: mixed(1, 3, 4), right: { numerator: 8, denominator: 21 }, prompt: "Zapisz ułamek niewłaściwy i wykonaj dwa skrócenia." },
  { id: "l2-mixed-3", left: mixed(3, 1, 5), right: { numerator: 15, denominator: 16 }, prompt: "Po zamianie skróć obie przekątne." },
];

const L2_STORIES: readonly MultiplicationTask[] = [
  { id: "l2-story-1", left: mixed(1, 1, 2), right: { numerator: 4, denominator: 9 }, prompt: "Oblicz zużytą część arkusza.", story: "Na projekt przeznaczono cztery dziewiąte arkusza. Do wykonania wzoru potrzeba półtora raza tyle materiału. Jaką część arkusza wykorzystano?" },
  { id: "l2-story-2", left: mixed(2, 1, 4), right: { numerator: 8, denominator: 15 }, prompt: "Oblicz długość ozdobnej taśmy.", story: "Jeden element dekoracji wymaga ośmiu piętnastych metra taśmy. Przygotowano dwa i jedną czwartą takiego elementu. Ile metrów taśmy zużyto?", unit: "m" },
  { id: "l2-story-3", left: mixed(1, 2, 3), right: { numerator: 9, denominator: 20 }, prompt: "Oblicz ilość wykorzystanej farby.", story: "Jedna warstwa wymaga dziewięciu dwudziestych litra farby. Na fragment ściany zużyto jedną i dwie trzecie takiej porcji. Ile litra farby zużyto?", unit: "l" },
];

const L2_INDEPENDENT: readonly MultiplicationTask[] = [
  { id: "l2-independent-1", left: fraction(7, 12), right: { numerator: 18, denominator: 35 }, prompt: "Znajdź dwie pary do skrócenia." },
  { id: "l2-independent-2", left: fraction(14, 15), right: { numerator: 25, denominator: 28 }, prompt: "Skróć obie przekątne przed mnożeniem." },
  { id: "l2-independent-3", left: fraction(21, 22), right: { numerator: 33, denominator: 49 }, prompt: "Uniknij obliczania dużych iloczynów." },
  { id: "l2-independent-4", left: mixed(2, 1, 3), right: { numerator: 9, denominator: 14 }, prompt: "Najpierw zamień liczbę mieszaną." },
  { id: "l2-independent-5", left: mixed(1, 3, 5), right: { numerator: 25, denominator: 32 }, prompt: "Połącz zamianę ze skracaniem obu przekątnych." },
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

function taskResult(task: MultiplicationTask): FractionValue {
  const left = improper(task.left);
  const result = normalizeFraction({ numerator: left.numerator * task.right.numerator, denominator: left.denominator * task.right.denominator });
  return { numerator: result.numerator, denominator: result.denominator };
}

function asMixed(value: FractionValue): MixedFractionValue {
  return { wholePart: Math.floor(value.numerator / value.denominator), numerator: value.numerator % value.denominator, denominator: value.denominator };
}

function digitCount(value: number): number {
  return String(Math.abs(value)).length;
}

function cancellation(task: MultiplicationTask) {
  const left = improper(task.left);
  const firstDivisor = greatestCommonDivisor(left.numerator, task.right.denominator);
  const secondDivisor = greatestCommonDivisor(left.denominator, task.right.numerator);
  return {
    left,
    firstDivisor,
    secondDivisor,
    reducedLeftNumerator: left.numerator / firstDivisor,
    reducedLeftDenominator: left.denominator / secondDivisor,
    reducedRightNumerator: task.right.numerator / secondDivisor,
    reducedRightDenominator: task.right.denominator / firstDivisor,
  };
}

function buildFields(task: MultiplicationTask): { fields: WorkField[]; setupIds: Set<string>; workingLeftId: string; workingRightId: string } {
  const setupIds = new Set<string>();
  const fields: WorkField[] = [];
  const left = improper(task.left);
  const workingLeftId = "work-left";
  const workingRightId = "work-right";
  if (task.story) {
    fields.push(
      task.left.wholePart > 0
        ? { id: "story-left", label: "Pierwsza liczba w zapisie z treści", kind: "mixed", target: task.left }
        : { id: "story-left", label: "Pierwszy ułamek w zapisie z treści", kind: "fraction", target: left },
      { id: "story-right", label: "Drugi ułamek w zapisie z treści", kind: "fraction", target: task.right },
      { id: "work-left", label: "Pierwszy ułamek w mnożeniu", kind: "fraction", target: left },
      { id: "work-right", label: "Drugi ułamek w mnożeniu", kind: "fraction", target: task.right },
    );
    ["story-left", "story-right", "work-left", "work-right"].forEach((id) => setupIds.add(id));
  } else if (task.left.wholePart > 0) {
    fields.push(
      { id: "source-left", label: "Liczba mieszana", kind: "mixed", target: task.left },
      { id: "source-right", label: "Drugi ułamek", kind: "fraction", target: task.right },
      { id: "work-left", label: "Ułamek niewłaściwy", kind: "fraction", target: left },
      { id: "work-right", label: "Przepisany drugi ułamek", kind: "fraction", target: task.right },
    );
    ["source-left", "source-right", "work-left", "work-right"].forEach((id) => setupIds.add(id));
  } else {
    fields.push(
      { id: "work-left", label: "Pierwszy ułamek", kind: "fraction", target: left },
      { id: "work-right", label: "Drugi ułamek", kind: "fraction", target: task.right },
    );
    setupIds.add("work-left");
    setupIds.add("work-right");
  }
  const reduced = cancellation(task);
  if (reduced.firstDivisor > 1) fields.push(
    { id: "reduced-left-numerator", label: "Pierwszy licznik po skróceniu", kind: "integer", target: reduced.reducedLeftNumerator },
    { id: "reduced-right-denominator", label: "Drugi mianownik po skróceniu", kind: "integer", target: reduced.reducedRightDenominator },
  );
  if (reduced.secondDivisor > 1) fields.push(
    { id: "reduced-left-denominator", label: "Pierwszy mianownik po skróceniu", kind: "integer", target: reduced.reducedLeftDenominator },
    { id: "reduced-right-numerator", label: "Drugi licznik po skróceniu", kind: "integer", target: reduced.reducedRightNumerator },
  );
  const result = taskResult(task);
  fields.push(result.denominator === 1
    ? { id: "result", label: "Wynik działania", kind: "integer", target: result.numerator }
    : { id: "result", label: "Wynik działania", kind: "fraction", target: result });
  if (result.denominator > 1 && result.numerator > result.denominator) fields.push({ id: "mixed-result", label: "Wynik jako liczba mieszana", kind: "mixed", target: asMixed(result) });
  return { fields, setupIds, workingLeftId, workingRightId };
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

function InstructionCard({ task, phase }: { task: MultiplicationTask; phase: FractionOperationsPhase }) {
  if (task.left.wholePart > 0) return <section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-amber-800">Przykład</p><h3 className="text-lg font-black">Najpierw zamień liczbę mieszaną</h3><p className="font-semibold">Liczbę mieszaną zapisz jako ułamek niewłaściwy. Dopiero wtedy szukaj par do skracania po skosie.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><StaticMixed value={{ wholePart: 1, numerator: 1, denominator: 2 }} /><b>·</b><StaticFraction value={{ numerator: 4, denominator: 9 }} /><b>=</b><StaticFraction value={{ numerator: 3, denominator: 2 }} /><b>·</b><StaticFraction value={{ numerator: 4, denominator: 9 }} /></div></section>;
  if (cancellation(task).firstDivisor > 1 || cancellation(task).secondDivisor > 1) return <section className="grid gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Przykład</p><h3 className="text-lg font-black">Skracanie przed mnożeniem</h3><p className="font-semibold">Skracaj licznik jednego ułamka wyłącznie z mianownikiem drugiego. Po poprawnym zapisaniu działania liczby zostaną zablokowane i przekreślone, a małe kratki przyjmą nowe wartości.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><span className="inline-grid text-center"><b>5</b><i className="my-1 border-t-2 border-slate-950" /><CrossedNumber value={6} replacement={2} /></span><b>·</b><span className="inline-grid text-center"><CrossedNumber value={3} replacement={1} /><i className="my-1 border-t-2 border-slate-950" /><b>7</b></span></div></section>;
  return <section className="grid gap-3 rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-indigo-800">Przykład</p><h3 className="text-lg font-black">Mnożenie ułamka przez ułamek</h3><p className="font-semibold">Pomnóż licznik przez licznik, a mianownik przez mianownik. W tych przykładach nie trzeba skracać przed mnożeniem.</p><div className="flex items-center justify-center gap-3 text-xl font-black"><StaticFraction value={{ numerator: 2, denominator: 5 }} /><b>·</b><StaticFraction value={{ numerator: 3, denominator: 7 }} /><b>=</b><StaticFraction value={{ numerator: 6, denominator: 35 }} /></div>{phase === "visual" ? <p className="text-center text-sm font-bold text-indigo-900">Fioletowe pola w modelu pokazują część części.</p> : null}</section>;
}

function AreaModel({ task }: { task: MultiplicationTask }) {
  const left = improper(task.left);
  const rows = Math.min(12, left.denominator);
  const columns = Math.min(12, task.right.denominator);
  return <section className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4"><div className="mx-auto grid max-w-xl gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-label="Model pola: część części">{Array.from({ length: rows * columns }, (_, index) => { const row = Math.floor(index / columns); const column = index % columns; const overlap = row < left.numerator && column < task.right.numerator; return <span key={index} className={`aspect-square min-h-5 rounded border ${overlap ? "border-violet-700 bg-violet-500" : row < left.numerator ? "border-cyan-500 bg-cyan-200" : column < task.right.numerator ? "border-amber-500 bg-amber-200" : "border-slate-300 bg-white"}`} />; })}</div><p className="mt-3 text-center text-sm font-bold text-violet-900">Fioletowe pola należą jednocześnie do obu zaznaczeń.</p></section>;
}

function EntryCell({ value, label, active, disabled, small, onActivate }: { value: string; label: string; active: boolean; disabled: boolean; small: boolean; onActivate: () => void }) {
  return <input value={value} inputMode="none" readOnly disabled={disabled} aria-label={label} onFocus={disabled ? undefined : onActivate} onClick={disabled ? undefined : onActivate} className={`${small ? "h-8 w-8 text-base" : "h-11 w-11 text-xl"} rounded-lg border-2 text-center font-black ${disabled ? "border-slate-300 bg-slate-100 text-slate-700 opacity-100" : active ? "border-indigo-600 bg-white ring-2 ring-indigo-200" : "border-indigo-300 bg-white"}`} />;
}

function MultiplicationRound({ task, locked, onComplete, onIncorrect }: { task: MultiplicationTask; locked: boolean; onComplete: (answer: string) => void; onIncorrect: () => void }) {
  const structure = useMemo(() => buildFields(task), [task]);
  const { fields, setupIds, workingLeftId, workingRightId } = structure;
  const [entries, setEntries] = useState<Record<string, FieldEntry>>(() => blankEntries(fields));
  const [setupComplete, setSetupComplete] = useState(false);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [activePart, setActivePart] = useState<FieldPart>(fields[0]!.kind === "mixed" ? "wholePart" : fields[0]!.kind === "fraction" ? "numerator" : "integer");
  const [activeDigitIndex, setActiveDigitIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const reduced = cancellation(task);
  const result = taskResult(task);

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
      return <span className="relative inline-flex items-center px-1 pt-1" data-fraction-multiplication-cancelled={part}>{cells}<i className="pointer-events-none absolute left-0 top-1/2 h-0.5 w-full -rotate-12 bg-rose-600" aria-hidden /><span className="absolute -right-3 -top-6 rounded-lg border border-rose-200 bg-rose-50 p-1 shadow-sm" data-fraction-multiplication-replacement>{renderField(replacementId, { small: true })}</span></span>;
    };
    if (field.kind === "integer") return <span className="inline-flex shrink-0" data-multiplication-field={id}>{renderPart("integer", digitCount(field.target))}</span>;
    if (field.kind === "fraction") return <span className="inline-grid shrink-0 gap-1 text-center" data-multiplication-field={id}>{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span>;
    return <span className="inline-flex shrink-0 items-center gap-2" data-multiplication-field={id}>{renderPart("wholePart", digitCount(field.target.wholePart))}<span className="inline-grid gap-1 text-center">{renderPart("numerator", digitCount(field.target.numerator))}<i className="border-t-2 border-slate-950" />{renderPart("denominator", digitCount(field.target.denominator))}</span></span>;
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
        setFeedback(task.story ? "Najpierw uzupełnij zapis z literą „z” i zamień go na mnożenie." : task.left.wholePart > 0 ? "Uzupełnij liczbę mieszaną, drugi ułamek i poprawną zamianę na ułamek niewłaściwy." : "Najpierw wpisz poprawnie oba ułamki działania.");
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
      setFeedback("Uzupełnij małe kratki przy wszystkich skreśleniach, oblicz wynik i dopiero wtedy zatwierdź.");
      onIncorrect();
      return;
    }
    onComplete(`${result.numerator}/${result.denominator}`);
  };

  const leftReplacements: Partial<Record<FieldPart, string>> = {};
  const rightReplacements: Partial<Record<FieldPart, string>> = {};
  if (reduced.firstDivisor > 1) {
    leftReplacements.numerator = "reduced-left-numerator";
    rightReplacements.denominator = "reduced-right-denominator";
  }
  if (reduced.secondDivisor > 1) {
    leftReplacements.denominator = "reduced-left-denominator";
    rightReplacements.numerator = "reduced-right-numerator";
  }
  const work = <>{renderField(workingLeftId, setupComplete ? { replacements: leftReplacements } : {})}<b>·</b>{renderField(workingRightId, setupComplete ? { replacements: rightReplacements } : {})}</>;
  const line = task.story
    ? <>{renderField("story-left")}<b>z</b>{renderField("story-right")}<b>=</b>{work}</>
    : task.left.wholePart > 0
      ? <>{renderField("source-left")}<b>·</b>{renderField("source-right")}<b>=</b>{work}</>
      : work;

  return <div className="grid gap-4">{task.story ? <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Zadanie tekstowe</p><p className="mt-2 text-lg font-bold leading-relaxed">{task.story}</p></section> : null}<section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4">{task.story ? null : <><p className="text-xs font-black uppercase tracking-wide text-indigo-700">Twoje zadanie</p><div className="grid justify-items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-3" aria-label="Działanie do rozwiązania"><span className="text-sm font-black text-indigo-900">Działanie do rozwiązania</span><div className="flex flex-wrap items-center justify-center gap-3 text-2xl font-black"><span data-given-multiplication-left>{task.left.wholePart > 0 ? <StaticMixed value={task.left} /> : <StaticFraction value={improper(task.left)} />}</span><b>·</b><span data-given-multiplication-right><StaticFraction value={task.right} /></span></div></div></>}<h3 className="font-black">{task.prompt}</h3><div className="flex max-w-full flex-wrap items-center justify-center gap-3 overflow-x-auto px-3 py-7 text-xl font-black" aria-label="Pełny zapis mnożenia ułamków">{line}{setupComplete ? <><b>=</b>{renderField("result")}{fields.some((field) => field.id === "mixed-result") ? <><b>=</b>{renderField("mixed-result")}</> : null}{task.unit ? <b>{task.unit}</b> : null}</> : null}</div><p className={`text-center text-sm font-bold ${setupComplete ? "text-emerald-800" : "text-indigo-800"}`}>{setupComplete ? Object.keys(leftReplacements).length + Object.keys(rightReplacements).length > 0 ? "Zapis jest zablokowany. Wpisz w małych kratkach liczby po skróceniu, a następnie oblicz wynik." : "Zapis jest zablokowany. Pomnóż liczniki i mianowniki, a następnie wpisz wynik." : task.story ? "Etap 1: zapisz ułamek z ułamka i zamień ten zapis na mnożenie." : task.left.wholePart > 0 ? "Etap 1: przepisz podane działanie, a potem zamień liczbę mieszaną na ułamek niewłaściwy." : "Etap 1: przepisz do kratek oba ułamki z działania powyżej."}</p></section>{!locked ? <LessonNumericKeypad label="Kalkulator do mnożenia ułamków" helperText={setupComplete ? "Uzupełnij wartości po skróceniu i wynik." : task.story ? "Najpierw uzupełnij cały pierwszy etap." : "Przepisz do kratek działanie pokazane nad nimi."} onKey={edit} onConfirm={confirm} /> : null}{feedback ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">{feedback}</p> : null}</div>;
}

export interface FractionByFractionMultiplicationLessonModelProps {
  phase: FractionOperationsPhase;
  level?: FractionOperationsLevel;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function tasksFor(phase: FractionOperationsPhase, advanced: boolean): readonly MultiplicationTask[] {
  if (advanced) return phase === "visual" ? L2_CANCEL : phase === "reasoning" ? L2_MIXED : phase === "context" ? L2_STORIES : L2_INDEPENDENT;
  return phase === "visual" ? L1_BASIC : phase === "reasoning" ? L1_CANCEL : phase === "context" ? L1_STORIES : L1_INDEPENDENT;
}

export function FractionByFractionMultiplicationLessonModel({ phase, level = "L1", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: FractionByFractionMultiplicationLessonModelProps) {
  const advanced = level === "L2";
  const series = tasksFor(phase, advanced);
  const [roundIndex, setRoundIndex] = useState(0);
  const selectedIndex = phase === "independent" ? Math.min(series.length - 1, Math.max(0, (questionNumber ?? 1) - 1)) : roundIndex;
  const task = series[selectedIndex]!;
  const locked = readOnly || presentationMode && phase === "independent";
  const heading = advanced
    ? phase === "visual" ? "Dwie pary do skracania" : phase === "reasoning" ? "Liczba mieszana · ułamek" : phase === "context" ? "Trudniejsze zadania tekstowe" : "Trudniejsze ćwiczenia"
    : phase === "visual" ? "Ułamek · ułamek" : phase === "reasoning" ? "Skracanie przed mnożeniem" : phase === "context" ? "Zadania tekstowe — część części" : "Samodzielne ćwiczenia";

  useEffect(() => () => onResultChange?.(null), [onResultChange]);

  const complete = (answer: string) => {
    if (phase !== "independent" && roundIndex < series.length - 1) {
      setRoundIndex((index) => index + 1);
      onResultChange?.(null);
      return;
    }
    onResultChange?.(true, answer);
  };

  return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading={heading} description={phase === "visual" && !advanced ? "Najpierw zobacz część części, potem samodzielnie zapisz i wykonaj mnożenie." : task.prompt} questionNumber={phase === "independent" ? questionNumber : roundIndex + 1} questionCount={phase === "independent" ? questionCount : series.length} contentClassName="grid gap-4" data-fraction-by-fraction-multiplication data-level={advanced ? "advanced" : "basic"}>
    <InstructionCard task={task} phase={phase} />
    {phase === "visual" && !advanced ? <AreaModel task={task} /> : null}
    <MultiplicationRound key={task.id} task={task} locked={locked} onComplete={complete} onIncorrect={() => onResultChange?.(phase === "independent" ? false : null)} />
  </LessonTaskFrame>;
}
