"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4NaturalNumberComparisonActivity = "information" | "compare" | "order" | "digit";

export function grade4NaturalNumberComparisonActivityFromStageId(stageId: string): Grade4NaturalNumberComparisonActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-order")) return "order";
  if (stageId.endsWith("-digit")) return "digit";
  return "compare";
}

interface Props {
  activity: Grade4NaturalNumberComparisonActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type Feedback = "correct" | "incorrect" | "missing" | null;
type ComparisonSign = ">" | "<" | "=";

const formatNumber = (value: number) => new Intl.NumberFormat("pl-PL").format(value);

const COMPARE_TASKS: readonly { left: number; right: number; answer: ComparisonSign; hint: string }[] = [
  { left: 52, right: 47, answer: ">", hint: "Porównaj cyfry dziesiątek." },
  { left: 308, right: 380, answer: "<", hint: "Setki są równe, więc porównaj dziesiątki." },
  { left: 7050, right: 7050, answer: "=", hint: "Sprawdź po kolei wszystkie cyfry." },
  { left: 9909, right: 10000, answer: "<", hint: "Liczba pięciocyfrowa jest większa od czterocyfrowej." },
  { left: 2405018, right: 2405108, answer: "<", hint: "Znajdź pierwszą różną cyfrę od lewej strony." },
  { left: 700030, right: 699999, answer: ">", hint: "Porównaj cyfry setek tysięcy." },
  { left: 12000000, right: 12000001, answer: "<", hint: "Pierwsza różnica pojawia się w grupie jedności." },
];

type OrderTask = {
  direction: "rosnąco" | "malejąco";
  values: readonly number[];
  context: string;
};

const ORDER_TASKS: readonly OrderTask[] = [
  { direction: "rosnąco", values: [42, 7, 105, 89], context: "Ułóż numery kluczy od najmniejszego do największego." },
  { direction: "malejąco", values: [4300, 4030, 3400, 3040], context: "Ułóż wyniki zawodników od największego do najmniejszego." },
  { direction: "rosnąco", values: [50005, 50500, 50050, 55000], context: "Ułóż kody magazynowe rosnąco." },
  { direction: "malejąco", values: [2000400, 2040000, 2004000, 2400000], context: "Ułóż liczby od największej do najmniejszej." },
  { direction: "rosnąco", values: [999999, 1000001, 1000000, 999990], context: "Przeprowadź robota od najmniejszego pola do największego." },
  { direction: "malejąco", values: [78000000, 70800000, 7800000, 70080000], context: "Ułóż odczyty sondy od największego do najmniejszego." },
];

type DigitTask = {
  expression: string;
  prompt: string;
  answer: string;
};

const DIGIT_TASKS: readonly DigitTask[] = [
  { expression: "53□ < 537", prompt: "Wpisz największą cyfrę, która pasuje do kratki.", answer: "6" },
  { expression: "4□2 > 472", prompt: "Wpisz najmniejszą cyfrę, która pasuje do kratki.", answer: "8" },
  { expression: "81□ = 815", prompt: "Wpisz cyfrę, która sprawi, że liczby będą równe.", answer: "5" },
  { expression: "2 □30 < 2 430", prompt: "Wpisz największą cyfrę, która pasuje do kratki.", answer: "3" },
  { expression: "7 5□0 > 7 560", prompt: "Wpisz najmniejszą cyfrę, która pasuje do kratki.", answer: "7" },
  { expression: "9□ 999 < 100 000", prompt: "Wpisz największą cyfrę, która pasuje do kratki.", answer: "9" },
];

function InformationSlide() {
  return <LessonTaskFrame eyebrow="Dział 2 · Temat 2" heading="Porównywanie liczb naturalnych" description="Znaki pokazują, która liczba jest większa, mniejsza albo czy liczby są równe.">
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        {([
          [">", "większe niż", "63 > 48"],
          ["<", "mniejsze niż", "27 < 51"],
          ["=", "równe", "420 = 420"],
        ] as const).map(([sign, label, example]) => <div key={sign} className="rounded-3xl bg-violet-50 p-5 text-center ring-2 ring-violet-200">
          <p className="text-6xl font-black text-violet-700">{sign}</p>
          <p className="mt-1 text-lg font-black text-violet-950">{label}</p>
          <p className="mt-3 rounded-xl bg-white px-3 py-2 text-2xl font-black text-slate-950 shadow">{example}</p>
        </div>)}
      </section>

      <p className="rounded-3xl bg-cyan-50 p-5 text-center text-lg font-black leading-relaxed text-cyan-950 ring-2 ring-cyan-200">Otwarta strona znaku jest zwrócona do <b className="text-violet-700">większej liczby</b>, a ostrze wskazuje <b className="text-rose-600">mniejszą liczbę</b>.</p>

      <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200">
        <h3 className="text-center text-xl font-black text-amber-950">Jak porównujemy duże liczby?</h3>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          <li className="rounded-2xl bg-white p-4 text-center font-bold shadow"><b className="block text-violet-700">1. Policz cyfry</b>Liczba z większą liczbą cyfr jest większa.</li>
          <li className="rounded-2xl bg-white p-4 text-center font-bold shadow"><b className="block text-cyan-700">2. Zacznij od lewej</b>Jeśli cyfr jest tyle samo, porównuj cyfry od lewej.</li>
          <li className="rounded-2xl bg-white p-4 text-center font-bold shadow"><b className="block text-rose-700">3. Znajdź różnicę</b>Decyduje pierwsza para różnych cyfr.</li>
        </ol>
        <p className="mt-4 text-center text-2xl font-black text-slate-950">54 <span className="text-rose-600">3</span>21 &gt; 54<span className="text-rose-600">2</span>19</p>
      </section>
    </div>
  </LessonTaskFrame>;
}

function CompareSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof COMPARE_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [selected, setSelected] = useState<ComparisonSign | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const choose = (sign: ComparisonSign) => {
    if (locked) return;
    setSelected(sign);
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (!selected) return setFeedback("missing");
    const correct = selected === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, selected);
  };

  return <LessonTaskFrame eyebrow="Dział 2 · Temat 2" heading="Wstaw znak" description="Wybierz jeden znak, aby zapis był prawdziwy." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-cyan-50 p-6 ring-2 ring-cyan-200">
        <div className="flex flex-wrap items-center justify-center gap-4 text-3xl font-black text-slate-950 sm:text-5xl">
          <span>{formatNumber(task.left)}</span>
          <span className="grid h-16 min-w-20 place-items-center rounded-2xl border-2 border-dashed border-violet-400 bg-white text-violet-700">{selected ?? "?"}</span>
          <span>{formatNumber(task.right)}</span>
        </div>
        <p className="mt-5 text-center font-bold text-slate-700">{task.hint}</p>
      </section>

      {!readOnly ? <section aria-label="Wybór znaku porównania" className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-900 p-4">
        {([">", "<", "="] as const).map((sign) => <button key={sign} type="button" disabled={locked} onClick={() => choose(sign)} className={`min-h-16 rounded-xl text-4xl font-black shadow ${selected === sign ? "bg-violet-600 text-white ring-4 ring-violet-300" : "bg-white text-slate-950"} disabled:opacity-40`}>{sign}</button>)}
        <button type="button" disabled={locked} onClick={check} className="col-span-3 min-h-12 rounded-xl bg-cyan-200 font-black text-cyan-950 disabled:opacity-40">Zatwierdź</button>
      </section> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Wybierz znak porównania.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! {formatNumber(task.left)} {task.answer} {formatNumber(task.right)}.</p> : null}
      {feedback === "incorrect" ? <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny znak to {task.answer}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div> : null}
    </div>
  </LessonTaskFrame>;
}

function OrderSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: OrderTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [chosen, setChosen] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const expected = [...task.values].sort((a, b) => task.direction === "rosnąco" ? a - b : b - a);
  const sign = task.direction === "rosnąco" ? "<" : ">";

  const add = (value: number) => {
    if (locked || chosen.includes(value)) return;
    setChosen((current) => [...current, value]);
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (chosen.length !== task.values.length) return setFeedback("missing");
    const correct = chosen.every((value, index) => value === expected[index]);
    const answer = chosen.join(",");
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answer);
  };

  const chain = (values: readonly number[]) => values.map(formatNumber).join(` ${sign} `);

  return <LessonTaskFrame eyebrow="Dział 2 · Temat 2" heading={`Ułóż liczby ${task.direction}`} description={task.context} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section aria-label="Ułożony ciąg liczb" className="min-h-24 rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
        <div className="flex min-h-14 flex-wrap items-center justify-center gap-2 text-xl font-black text-slate-950">
          {chosen.length ? chosen.map((value, index) => <span key={value} className="contents"><span className="rounded-xl bg-white px-3 py-2 shadow">{formatNumber(value)}</span>{index < chosen.length - 1 ? <span className="text-violet-700">{sign}</span> : null}</span>) : <span className="text-slate-400">Tutaj ułożysz liczby</span>}
        </div>
      </section>

      {!readOnly ? <section aria-label="Karty liczb" className="rounded-2xl bg-slate-900 p-4 text-white">
        <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-200">Dotykaj kart w odpowiedniej kolejności</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{task.values.map((value) => <button key={value} type="button" disabled={locked || chosen.includes(value)} onClick={() => add(value)} className="min-h-14 rounded-xl bg-white px-2 text-lg font-black text-slate-950 shadow disabled:opacity-25">{formatNumber(value)}</button>)}</div>
        <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={locked || chosen.length === 0} onClick={() => setChosen((current) => current.slice(0, -1))} className="min-h-11 rounded-xl bg-rose-300 font-black text-rose-950 disabled:opacity-35">← Usuń ostatnią</button><button type="button" disabled={locked} onClick={check} className="min-h-11 rounded-xl bg-cyan-200 font-black text-cyan-950 disabled:opacity-35">Zatwierdź</button></div>
      </section> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Ułóż wszystkie liczby.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! {chain(expected)}.</p> : null}
      {feedback === "incorrect" ? <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawna kolejność to {chain(expected)}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div> : null}
    </div>
  </LessonTaskFrame>;
}

function DigitSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: DigitTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const edit = (key: string) => {
    if (locked) return;
    setAnswer(key === "backspace" ? "" : key);
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (!answer) return setFeedback("missing");
    const correct = answer === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answer);
  };

  return <LessonTaskFrame eyebrow="Dział 2 · Temat 2" heading="Sejf cyfr" description="Dobierz cyfrę tak, aby zapis był prawdziwy." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-amber-50 p-6 text-center ring-2 ring-amber-200">
        <p className="text-3xl font-black tracking-wide text-slate-950 sm:text-5xl">{task.expression}</p>
        <p className="mt-5 text-lg font-black text-amber-950">{task.prompt}</p>
        <label className="mt-5 inline-flex items-center gap-3 font-black text-slate-950"><span>Cyfra:</span><input aria-label="Brakująca cyfra" value={answer} inputMode="none" readOnly className="h-16 w-20 rounded-xl border-2 border-violet-400 bg-white text-center text-3xl font-black outline-none" /></label>
      </section>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura sejfu cyfr" helperText="Wybierz jedną cyfrę i zatwierdź." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Wybierz cyfrę.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! Do kratki pasuje cyfra {task.answer}.</p> : null}
      {feedback === "incorrect" ? <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawna cyfra to {task.answer}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade4NaturalNumberComparisonLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  if (activity === "compare") {
    const task = COMPARE_TASKS[(questionNumber - 1) % COMPARE_TASKS.length] ?? COMPARE_TASKS[Math.abs(taskSeed) % COMPARE_TASKS.length]!;
    return <CompareSlide key={`compare-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  if (activity === "order") {
    const task = ORDER_TASKS[(questionNumber - 1) % ORDER_TASKS.length] ?? ORDER_TASKS[Math.abs(taskSeed) % ORDER_TASKS.length]!;
    return <OrderSlide key={`order-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  const task = DIGIT_TASKS[(questionNumber - 1) % DIGIT_TASKS.length] ?? DIGIT_TASKS[Math.abs(taskSeed) % DIGIT_TASKS.length]!;
  return <DigitSlide key={`digit-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
