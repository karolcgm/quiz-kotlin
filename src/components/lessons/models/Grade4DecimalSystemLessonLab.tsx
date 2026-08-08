"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4DecimalSystemActivity = "information" | "groups" | "digits" | "words" | "cipher";

export function grade4DecimalSystemActivityFromStageId(stageId: string): Grade4DecimalSystemActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-groups")) return "groups";
  if (stageId.endsWith("-words")) return "words";
  if (stageId.endsWith("-cipher")) return "cipher";
  return "digits";
}

interface Props {
  activity: Grade4DecimalSystemActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type NumericTask = {
  prompt: string;
  answer: string;
};

const DIGIT_TASKS: readonly NumericTask[] = [
  { prompt: "czterdzieści dwa", answer: "42" },
  { prompt: "osiemset siedem", answer: "807" },
  { prompt: "pięć tysięcy trzydzieści", answer: "5030" },
  { prompt: "siedemdziesiąt dwa tysiące czterysta sześć", answer: "72406" },
  { prompt: "trzy miliony osiem tysięcy dziewięć", answer: "3008009" },
  { prompt: "dwa miliardy pięć milionów czterdzieści tysięcy sto", answer: "2005040100" },
];

type WordTask = {
  value: string;
  answer: readonly string[];
  bank: readonly string[];
};

const WORD_TASKS: readonly WordTask[] = [
  { value: "25", answer: ["dwadzieścia", "pięć"], bank: ["pięć", "dwadzieścia", "pięćdziesiąt"] },
  { value: "308", answer: ["trzysta", "osiem"], bank: ["osiem", "trzydzieści", "trzysta"] },
  { value: "1 204", answer: ["tysiąc", "dwieście", "cztery"], bank: ["cztery", "dwadzieścia", "tysiąc", "dwieście"] },
  { value: "12 040", answer: ["dwanaście", "tysięcy", "czterdzieści"], bank: ["czterdzieści", "dwanaście", "tysięcy", "cztery"] },
  { value: "2 403 018", answer: ["dwa", "miliony", "czterysta", "trzy", "tysiące", "osiemnaście"], bank: ["osiemnaście", "trzy", "miliony", "czterysta", "dwa", "tysiące", "trzydzieści"] },
];

type CipherTask = NumericTask & {
  label: string;
  letter: string;
  slot: number;
};

// Zadania są celowo ułożone w innej kolejności niż litery hasła.
const CIPHER_TASKS: readonly CipherTask[] = [
  { label: "Teleskop", prompt: "Teleskop przesłał kod 7 mln. Zapisz ten kod cyframi.", answer: "7000000", letter: "C", slot: 2 },
  { label: "Sonda", prompt: "Sonda przeleciała 3 tys. km. Zapisz 3 tys. cyframi.", answer: "3000", letter: "A", slot: 5 },
  { label: "Muzeum", prompt: "Na tablicy widnieje liczba dwa miliardy. Zapisz ją cyframi.", answer: "2000000000", letter: "L", slot: 0 },
  { label: "Komputer", prompt: "Komputer wyświetlił 5 mln 40 tys. Zapisz całą liczbę cyframi.", answer: "5040000", letter: "B", slot: 4 },
  { label: "Mapa", prompt: "Na mapie zapisano 12 tys. 8. Zapisz całą liczbę cyframi.", answer: "12008", letter: "I", slot: 1 },
  { label: "Archiwum", prompt: "Archiwum zawiera 9 mln 6 tys. 20 rekordów. Zapisz tę liczbę cyframi.", answer: "9006020", letter: "Z", slot: 3 },
];

type Feedback = "correct" | "incorrect" | "missing" | null;

function formatDigits(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function InformationSlide() {
  return <LessonTaskFrame eyebrow="Dział 2 · Temat 1" heading="System dziesiątkowy" description="Liczby naturalne zapisujemy za pomocą dziesięciu cyfr.">
    <div className="space-y-5">
      <section className="rounded-3xl bg-cyan-50 p-5 text-center ring-2 ring-cyan-200">
        <h3 className="text-2xl font-black text-cyan-950">Liczby naturalne</h3>
        <p className="mt-2 text-lg font-bold leading-relaxed text-slate-800">Liczby <b>0, 1, 2, 3, 4, …</b> służą między innymi do liczenia i ustalania kolejności. Nazywamy je liczbami naturalnymi.</p>
      </section>

      <section className="rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200">
        <h3 className="text-center text-xl font-black text-violet-950">Każdą liczbę naturalną zapisujemy za pomocą cyfr:</h3>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="Dziesięć cyfr systemu dziesiątkowego">
          {Array.from({ length: 10 }, (_, digit) => <span key={digit} className="grid min-h-14 place-items-center rounded-2xl bg-white text-3xl font-black text-violet-800 shadow ring-2 ring-violet-200">{digit}</span>)}
        </div>
        <p className="mt-4 text-center text-lg font-black text-violet-950">Mamy <b className="text-rose-600">10 cyfr</b>: od 0 do 9.</p>
      </section>

      <p className="rounded-3xl bg-amber-50 p-5 text-center text-xl font-black leading-relaxed text-amber-950 ring-2 ring-amber-200">System zapisywania liczb, którego używamy na co dzień, nazywamy <b className="text-violet-700">systemem dziesiątkowym</b>.</p>
    </div>
  </LessonTaskFrame>;
}

const GROUPS = [
  { name: "miliardów", digits: "7", color: "bg-rose-100 ring-rose-300 text-rose-950" },
  { name: "milionów", digits: "432", color: "bg-violet-100 ring-violet-300 text-violet-950" },
  { name: "tysięcy", digits: "105", color: "bg-cyan-100 ring-cyan-300 text-cyan-950" },
  { name: "jedności", digits: "806", color: "bg-emerald-100 ring-emerald-300 text-emerald-950" },
] as const;

function GroupsSlide() {
  return <LessonTaskFrame eyebrow="Dział 2 · Temat 1" heading="Grupy cyfr i skróty" description="Czytając dużą liczbę, dzielimy jej cyfry od prawej strony na grupy po trzy.">
    <div className="space-y-5">
      <section className="rounded-3xl bg-slate-50 p-5 ring-2 ring-slate-200">
        <p className="text-center text-lg font-black text-slate-800">Liczba 7 432 105 806</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {GROUPS.map((group) => <div key={group.name} className={`rounded-2xl p-4 text-center ring-2 ${group.color}`}>
            <p className="text-sm font-black uppercase tracking-wide">grupa {group.name}</p>
            <p className="mt-2 text-4xl font-black tracking-wider">{group.digits}</p>
          </div>)}
        </div>
        <p className="mt-4 text-center font-bold text-slate-700">W każdej pełnej grupie są kolejno: setki, dziesiątki i jedności tej grupy.</p>
      </section>

      <section className="rounded-3xl bg-indigo-50 p-5 ring-2 ring-indigo-200">
        <h3 className="text-center text-xl font-black text-indigo-950">Przy dużych liczbach możemy używać skrótów</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow"><b className="text-3xl text-violet-700">tys.</b><p className="mt-1 font-black">tysiąc</p><p>4 tys. = 4 000</p></div>
          <div className="rounded-2xl bg-white p-4 text-center shadow"><b className="text-3xl text-cyan-700">mln</b><p className="mt-1 font-black">milion</p><p>8 mln = 8 000 000</p></div>
          <div className="rounded-2xl bg-white p-4 text-center shadow"><b className="text-3xl text-rose-700">mld</b><p className="mt-1 font-black">miliard</p><p>2 mld = 2 000 000 000</p></div>
        </div>
      </section>
    </div>
  </LessonTaskFrame>;
}

function NumericAnswerSlide({ task, mode, questionNumber, questionCount, readOnly, onResultChange }: { task: NumericTask | CipherTask; mode: "digits" | "cipher"; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const cipherTask = mode === "cipher" ? task as CipherTask : null;

  const edit = (key: string) => {
    if (locked) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 12 ? current : `${current}${key}`);
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (!answer) {
      setFeedback("missing");
      return;
    }
    const correct = answer === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answer);
  };

  const revealedSlots = Array.from({ length: 6 }, () => "?");
  if (cipherTask) {
    CIPHER_TASKS.slice(0, questionNumber - 1).forEach((item) => { revealedSlots[item.slot] = item.letter; });
    if (feedback === "correct" || feedback === "incorrect") revealedSlots[cipherTask.slot] = cipherTask.letter;
  }

  return <LessonTaskFrame eyebrow="Dział 2 · Temat 1" heading={mode === "cipher" ? "Szyfr badaczy" : "Zapisz liczbę cyframi"} description={mode === "cipher" ? "Rozwiąż zagadkę. Litery odsłaniają się w pomieszanej kolejności i tworzą hasło." : "Przeczytaj liczbę zapisaną słownie i wpisz ją cyframi."} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      {cipherTask ? <section aria-label="Odszyfrowane hasło" className="rounded-3xl bg-indigo-950 p-4 text-center text-white">
        <p className="text-sm font-black uppercase tracking-[.16em] text-indigo-200">Hasło badaczy</p>
        <div className="mt-3 flex justify-center gap-2">{revealedSlots.map((letter, index) => <span key={index} className="grid h-11 w-10 place-items-center rounded-lg bg-white text-xl font-black text-indigo-950">{letter}</span>)}</div>
      </section> : null}

      <section className="rounded-3xl bg-amber-50 p-6 text-center ring-2 ring-amber-200">
        {cipherTask ? <p className="text-sm font-black uppercase tracking-wide text-amber-700">{cipherTask.label}</p> : null}
        <p className="mt-2 text-xl font-black leading-relaxed text-amber-950">{mode === "digits" ? <>Zapisz cyframi: „{task.prompt}”.</> : task.prompt}</p>
        <label className="mt-5 flex flex-wrap items-center justify-center gap-3 font-black text-slate-950">
          <span>Odpowiedź:</span>
          <input aria-label="Liczba zapisana cyframi" value={answer} inputMode="none" readOnly className="h-16 w-full max-w-xs rounded-xl border-2 border-violet-400 bg-white px-3 text-center text-2xl font-black outline-none focus:border-violet-700 focus:ring-4 focus:ring-violet-200" />
        </label>
      </section>

      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do zapisywania liczb" helperText="Wpisz wszystkie cyfry bez spacji i zatwierdź." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Wpisz liczbę w kratce.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! Poprawny zapis to {formatDigits(task.answer)}.{cipherTask ? ` Odsłaniasz literę ${cipherTask.letter}.` : ""}</p> : null}
      {feedback === "incorrect" ? <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {formatDigits(task.answer)}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div> : null}
    </div>
  </LessonTaskFrame>;
}

function WordAnswerSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: WordTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const addWord = (word: string) => {
    if (locked || chosen.includes(word)) return;
    setChosen((current) => [...current, word]);
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (chosen.length === 0) {
      setFeedback("missing");
      return;
    }
    const answer = chosen.join(" ");
    const correct = answer === task.answer.join(" ");
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answer);
  };

  return <LessonTaskFrame eyebrow="Dział 2 · Temat 1" heading="Zapisz liczbę słownie" description="Dotykaj wyrazów w takiej kolejności, w jakiej zapisujemy liczbę." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200">
        <p className="text-lg font-black text-cyan-950">Zapisz słownie liczbę:</p>
        <p className="mt-2 text-5xl font-black tracking-wide text-slate-950">{task.value}</p>
      </section>

      <section className="min-h-20 rounded-2xl border-2 border-violet-300 bg-white p-4" aria-label="Ułożony zapis słowny">
        <p className="flex min-h-12 flex-wrap items-center justify-center gap-2 text-lg font-black text-violet-950">{chosen.length ? chosen.map((word, index) => <span key={`${word}-${index}`} className="rounded-xl bg-violet-100 px-3 py-2">{word}</span>) : <span className="text-slate-400">Tutaj pojawi się zapis słowny</span>}</p>
      </section>

      <section aria-label="Bank wyrazów" className="rounded-2xl bg-slate-900 p-4 text-white">
        <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-200">Bank wyrazów</p>
        <div className="flex flex-wrap justify-center gap-2">{task.bank.map((word) => <button key={word} type="button" disabled={locked || chosen.includes(word)} onClick={() => addWord(word)} className="min-h-11 rounded-xl bg-white px-4 font-black text-slate-950 disabled:opacity-30">{word}</button>)}</div>
        {!readOnly ? <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" disabled={locked || chosen.length === 0} onClick={() => setChosen((current) => current.slice(0, -1))} className="min-h-11 rounded-xl bg-rose-300 font-black text-rose-950 disabled:opacity-35">← Usuń ostatni</button><button type="button" disabled={locked} onClick={check} className="min-h-11 rounded-xl bg-cyan-200 font-black text-cyan-950 disabled:opacity-35">Zatwierdź</button></div> : null}
      </section>

      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Ułóż zapis z wyrazów.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! {task.value} zapisujemy: {task.answer.join(" ")}.</p> : null}
      {feedback === "incorrect" ? <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny zapis to: {task.answer.join(" ")}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade4DecimalSystemLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  if (activity === "groups") return <GroupsSlide />;

  if (activity === "words") {
    const task = WORD_TASKS[Math.max(0, (questionNumber - 1) % WORD_TASKS.length)] ?? WORD_TASKS[Math.abs(taskSeed) % WORD_TASKS.length]!;
    return <WordAnswerSlide key={`words-${questionNumber}-${task.value}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }

  const tasks = activity === "cipher" ? CIPHER_TASKS : DIGIT_TASKS;
  const task = tasks[Math.max(0, (questionNumber - 1) % tasks.length)] ?? tasks[Math.abs(taskSeed) % tasks.length]!;
  return <NumericAnswerSlide key={`${activity}-${questionNumber}-${task.answer}`} task={task} mode={activity} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
