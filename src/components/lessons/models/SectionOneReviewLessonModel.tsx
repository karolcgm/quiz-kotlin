"use client";

import { useEffect, useMemo, useState } from "react";
import { NumericLessonKeypad } from "@/components/lessons/models/NumericLessonKeypad";

interface Props {
  seed?: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

interface ChoiceTask {
  eyebrow: string;
  prompt: string;
  display: string;
  choices: readonly string[];
  correct: string;
  explanation: string;
}

export const NUMBER_DECODER_TASKS: readonly ChoiceTask[] = [
  {
    eyebrow: "Sygnał bez odstępów",
    prompt: "Wybierz poprawny podział na grupy i poprawny zapis słowny.",
    display: "12542385412",
    choices: [
      "12 542 385 412 — dwanaście miliardów pięćset czterdzieści dwa miliony trzysta osiemdziesiąt pięć tysięcy czterysta dwanaście",
      "125 423 854 12 — sto dwadzieścia pięć miliardów czterysta dwadzieścia trzy miliony osiemset pięćdziesiąt cztery tysiące dwanaście",
      "1 254 238 541 2 — jeden miliard dwieście pięćdziesiąt cztery miliony dwieście trzydzieści osiem tysięcy pięćset czterdzieści jeden",
      "12 542 358 412 — dwanaście miliardów pięćset czterdzieści dwa miliony trzysta pięćdziesiąt osiem tysięcy czterysta dwanaście",
    ],
    correct:
      "12 542 385 412 — dwanaście miliardów pięćset czterdzieści dwa miliony trzysta osiemdziesiąt pięć tysięcy czterysta dwanaście",
    explanation: "Cyfry dzielimy od prawej strony na grupy po trzy: jedności, tysiące, miliony i miliardy.",
  },
  {
    eyebrow: "Tłumacz liczb",
    prompt: "Który zapis słowny odpowiada liczbie na ekranie?",
    display: "3 258 412",
    choices: [
      "trzy miliony dwieście pięćdziesiąt osiem tysięcy czterysta dwanaście",
      "trzy miliony dwieście pięćdziesiąt osiem tysięcy czterysta dwadzieścia jeden",
      "trzy miliardy dwieście pięćdziesiąt osiem milionów czterysta dwanaście",
      "trzysta dwadzieścia pięć tysięcy osiemset czterdzieści dwa",
    ],
    correct: "trzy miliony dwieście pięćdziesiąt osiem tysięcy czterysta dwanaście",
    explanation: "Pierwsza grupa oznacza miliony, druga tysiące, a ostatnia jedności.",
  },
  {
    eyebrow: "Słowa zamień na cyfry",
    prompt: "Wybierz liczbę zapisaną słowami.",
    display: "trzy miliardy pięćset tysięcy",
    choices: ["3 000 500 000", "3 500 000 000", "3 000 000 500", "3 500 000"],
    correct: "3 000 500 000",
    explanation: "Brak milionów i jedności zapisujemy zerami: 3 | 000 | 500 | 000.",
  },
  {
    eyebrow: "Skaner pozycyjny",
    prompt: "Jaka jest cyfra setek miliardów w tej liczbie?",
    display: "879 006 412 003",
    choices: ["8", "7", "9", "6"],
    correct: "8",
    explanation: "Grupa miliardów to 879, więc cyfra setek miliardów to 8.",
  },
] as const;

export interface ReviewNumberLineTask {
  start: number;
  step: number;
  markerIndex: number;
  known: readonly { index: number; value: number }[];
  choices: readonly number[];
}

export const REVIEW_NUMBER_LINE_TASKS: readonly ReviewNumberLineTask[] = [
  { start: 80, step: 5, markerIndex: 2, known: [{ index: 0, value: 80 }, { index: 3, value: 95 }], choices: [85, 90, 100, 105] },
  { start: 30, step: 3, markerIndex: 1, known: [{ index: 4, value: 42 }, { index: 7, value: 51 }], choices: [31, 33, 36, 39] },
  { start: 400, step: 200, markerIndex: 5, known: [{ index: 2, value: 800 }, { index: 6, value: 1600 }], choices: [1200, 1400, 1800, 2000] },
  { start: 1250, step: 250, markerIndex: 7, known: [{ index: 1, value: 1500 }, { index: 5, value: 2500 }], choices: [2750, 3000, 3250, 3500] },
] as const;

export const REVIEW_SORT_TASKS = [
  [53_210, 44_201, 20_234, 3_341, 22_034],
  [22_304, 33_014, 50_321, 2_234, 5_231],
  [3_258_412, 3_258_421, 3_459, 3_495, 506_000],
  [3_500_000_500, 3_000_500_000, 3_500_000, 500_000_003, 3_050_000_000],
] as const;

export const REVIEW_MENTAL_TASKS = [
  { expression: "850 + 330", answer: 1180, hint: "Dodaj najpierw setki, potem dziesiątki." },
  { expression: "4050 − 100", answer: 3950, hint: "Odejmujesz dokładnie jedną setkę." },
  { expression: "40 × 500", answer: 20_000, hint: "Najpierw 4 × 5, potem dopisz trzy zera." },
  { expression: "770 000 ÷ 100", answer: 7700, hint: "Dzielenie przez 100 usuwa dwa zera." },
] as const;

export const REVIEW_ORDER_TASKS: readonly ChoiceTask[] = [
  {
    eyebrow: "Dwa silniki mnożenia",
    prompt: "Oblicz zgodnie z kolejnością działań.",
    display: "4 × 7 − 3 × 5",
    choices: ["13", "25", "97", "5"],
    correct: "13",
    explanation: "Najpierw 4 × 7 = 28 i 3 × 5 = 15, potem 28 − 15 = 13.",
  },
  {
    eyebrow: "Moduł nawiasów",
    prompt: "Oblicz zgodnie z kolejnością działań.",
    display: "8 × (2 + 6) − 18",
    choices: ["46", "28", "62", "34"],
    correct: "46",
    explanation: "Najpierw nawias: 2 + 6 = 8. Potem 8 × 8 = 64 i 64 − 18 = 46.",
  },
  {
    eyebrow: "Dziel i mnóż od lewej",
    prompt: "Oblicz zgodnie z kolejnością działań.",
    display: "48 − 24 ÷ 6 × 4",
    choices: ["32", "44", "16", "8"],
    correct: "32",
    explanation: "Dzielenie i mnożenie wykonujemy od lewej: 24 ÷ 6 = 4, 4 × 4 = 16, 48 − 16 = 32.",
  },
  {
    eyebrow: "Komora potęg",
    prompt: "Oblicz zgodnie z kolejnością działań.",
    display: "6² − 3³",
    choices: ["9", "27", "33", "3"],
    correct: "9",
    explanation: "Najpierw potęgi: 6² = 36 i 3³ = 27. Na końcu 36 − 27 = 9.",
  },
] as const;

export const REVIEW_REMAINDER_TASKS = [
  { total: 22, divisor: 6, quotient: 3, remainder: 4, cargo: "kryształy" },
  { total: 71, divisor: 8, quotient: 8, remainder: 7, cargo: "gwiezdne nasiona" },
  { total: 33, divisor: 5, quotient: 6, remainder: 3, cargo: "energożetony" },
  { total: 77, divisor: 9, quotient: 8, remainder: 5, cargo: "księżycowe kamienie" },
] as const;

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  let state = Math.abs(seed) + 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 48271) % 2_147_483_647;
    const target = state % (index + 1);
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}

function useResultReset(onResultChange: Props["onResultChange"]) {
  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);
}

function MissionStatus({ correct, success, error }: { correct: boolean | null; success: string; error: string }) {
  if (correct === null) return null;
  return (
    <p
      role="status"
      className={`mt-4 rounded-2xl p-4 text-center font-black ${
        correct ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"
      }`}
    >
      {correct ? success : error}
    </p>
  );
}

function ChoiceMission({
  task,
  taskSeed,
  readOnly,
  onResultChange,
  theme,
}: {
  task: ChoiceTask;
  taskSeed: number;
  readOnly: boolean;
  onResultChange: Props["onResultChange"];
  theme: "decoder" | "circuit";
}) {
  const choices = useMemo(() => seededShuffle(task.choices, taskSeed), [task.choices, taskSeed]);
  const [selected, setSelected] = useState<string | null>(null);
  useResultReset(onResultChange);
  const correct = selected === null ? null : selected === task.correct;
  const decoder = theme === "decoder";

  return (
    <article className={`rounded-[2rem] p-5 shadow-2xl sm:p-8 ${decoder ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 text-white" : "bg-gradient-to-br from-amber-100 via-orange-50 to-fuchsia-100 text-slate-950"}`}>
      <p className={`text-xs font-black uppercase tracking-[.18em] ${decoder ? "text-cyan-200" : "text-fuchsia-700"}`}>{task.eyebrow}</p>
      <h4 className="mt-2 text-2xl font-black sm:text-3xl">{task.prompt}</h4>
      <div className={`mt-5 rounded-3xl border-4 p-5 text-center font-mono font-black tabular-nums shadow-inner [font-size:clamp(1.5rem,5vw,3.4rem)] ${decoder ? "border-cyan-400/40 bg-black/30 text-cyan-200" : "border-amber-300 bg-slate-950 text-amber-200"}`}>
        {task.display}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            disabled={readOnly}
            aria-pressed={selected === choice}
            onClick={() => {
              setSelected(choice);
              onResultChange?.(choice === task.correct, choice);
            }}
            className={`min-h-20 rounded-2xl border-2 p-4 text-left font-bold leading-relaxed transition ${
              selected === choice
                ? choice === task.correct
                  ? "border-emerald-600 bg-emerald-300 text-emerald-950"
                  : "border-rose-600 bg-rose-300 text-rose-950"
                : decoder
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "border-white bg-white/85 hover:border-fuchsia-300"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
      <MissionStatus
        correct={correct}
        success={task.explanation}
        error="Ten wybór nie uruchamia stacji. Sprawdź zapis krok po kroku i spróbuj ponownie."
      />
    </article>
  );
}

function NumberLineMission({ task, taskSeed, readOnly, onResultChange }: { task: ReviewNumberLineTask; taskSeed: number; readOnly: boolean; onResultChange: Props["onResultChange"] }) {
  const choices = useMemo(() => seededShuffle(task.choices, taskSeed), [task.choices, taskSeed]);
  const [selected, setSelected] = useState<number | null>(null);
  useResultReset(onResultChange);
  const answer = task.start + task.step * task.markerIndex;
  const correct = selected === null ? null : selected === answer;

  return (
    <article className="rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-violet-100 p-5 text-slate-950 shadow-2xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.18em] text-violet-700">Kosmiczna kolejka</p>
      <h4 className="mt-2 text-3xl font-black">Na jakiej liczbie zatrzymał się wagon?</h4>
      <p className="mt-2 font-bold text-slate-600">Odstęp między sąsiednimi kreskami jest zawsze taki sam.</p>
      <div className="mt-8 overflow-x-auto rounded-3xl border-4 border-sky-200 bg-sky-950 px-5 pb-7 pt-10 text-white shadow-inner">
        <div className="relative grid min-w-[44rem] grid-cols-11">
          <div className="absolute left-0 right-0 top-7 h-2 rounded-full bg-gradient-to-r from-cyan-300 via-white to-violet-300" aria-hidden />
          {Array.from({ length: 11 }, (_, index) => {
            const known = task.known.find((item) => item.index === index);
            const marker = task.markerIndex === index;
            return (
              <div key={index} className="relative z-10 flex min-h-24 flex-col items-center">
                {marker ? <span className="absolute -top-9 text-3xl" aria-label="Szukany przystanek">🚀</span> : null}
                <span className={`mt-4 h-7 w-1.5 rounded-full ${marker ? "bg-amber-300" : "bg-white"}`} aria-hidden />
                <span className={`mt-2 min-h-8 rounded-lg px-2 py-1 text-sm font-black ${marker ? "bg-amber-300 text-slate-950" : known ? "bg-white/15" : "text-white/40"}`}>
                  {marker ? "?" : known?.value ?? ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            aria-label={`Odpowiedź ${choice}`}
            disabled={readOnly}
            aria-pressed={selected === choice}
            onClick={() => {
              setSelected(choice);
              onResultChange?.(choice === answer, String(choice));
            }}
            className={`min-h-16 rounded-2xl border-4 text-xl font-black ${selected === choice ? choice === answer ? "border-emerald-600 bg-emerald-300" : "border-rose-600 bg-rose-300" : "border-white bg-white"}`}
          >
            {choice.toLocaleString("pl-PL")}
          </button>
        ))}
      </div>
      <MissionStatus correct={correct} success={`Tak — każdy krok ma wartość ${task.step}, więc rakieta stoi na liczbie ${answer}.`} error="Sprawdź różnicę między dwiema podpisanymi kreskami i policz równe kroki." />
    </article>
  );
}

function SortMission({ numbers, taskSeed, readOnly, onResultChange }: { numbers: readonly number[]; taskSeed: number; readOnly: boolean; onResultChange: Props["onResultChange"] }) {
  const candidates = useMemo(() => seededShuffle(numbers, taskSeed), [numbers, taskSeed]);
  const expected = useMemo(() => [...numbers].sort((a, b) => a - b), [numbers]);
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  useResultReset(onResultChange);

  const change = (next: number[]) => {
    setSelected(next);
    setChecked(null);
    onResultChange?.(null);
  };
  const check = () => {
    const correct = selected.length === expected.length && expected.every((value, index) => selected[index] === value);
    setChecked(correct);
    onResultChange?.(correct, selected.map((value) => value.toLocaleString("pl-PL")).join(" < "));
  };

  return (
    <article className="rounded-[2rem] bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-5 text-white shadow-2xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-200">Sortownia ładunków</p>
      <h4 className="mt-2 text-3xl font-black">Ustaw kontenery od najmniejszej liczby do największej</h4>
      <p className="mt-2 text-emerald-100">Klikaj liczby w takiej kolejności, w jakiej mają wjechać na taśmę.</p>
      <div className="mt-6 grid min-h-24 grid-cols-2 gap-2 rounded-3xl border-2 border-dashed border-emerald-300/50 bg-black/20 p-3 sm:grid-cols-5">
        {Array.from({ length: numbers.length }, (_, index) => (
          <div key={index} className="grid min-h-16 place-items-center rounded-2xl bg-white/10 px-2 text-center font-black">
            {selected[index]?.toLocaleString("pl-PL") ?? <span className="text-white/30">{index + 1}</span>}
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {candidates.map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Wybierz liczbę ${value}`}
            disabled={readOnly || selected.includes(value)}
            onClick={() => change([...selected, value])}
            className="min-h-16 rounded-2xl border-2 border-emerald-200 bg-emerald-100 px-2 font-black text-emerald-950 disabled:opacity-25"
          >
            {value.toLocaleString("pl-PL")}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={readOnly || selected.length === 0} onClick={() => change(selected.slice(0, -1))} className="min-h-12 rounded-2xl border border-white/30 font-black disabled:opacity-30">Cofnij ostatni kontener</button>
        <button type="button" disabled={readOnly || selected.length !== numbers.length} onClick={check} className="min-h-12 rounded-2xl bg-emerald-300 font-black text-emerald-950 disabled:opacity-30">Sprawdź kolejność</button>
      </div>
      <MissionStatus correct={checked} success="Taśma działa — wszystkie kontenery stoją rosnąco." error="Co najmniej dwa kontenery są zamienione miejscami. Porównuj liczby od najwyższego rzędu." />
    </article>
  );
}

function NumericMission({ task, readOnly, onResultChange }: { task: (typeof REVIEW_MENTAL_TASKS)[number]; readOnly: boolean; onResultChange: Props["onResultChange"] }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);
  useResultReset(onResultChange);
  const reset = () => {
    setChecked(null);
    onResultChange?.(null);
  };
  const update = (value: string) => {
    setAnswer(value.replace(/\D/g, "").slice(0, 9));
    reset();
  };
  const check = () => {
    const correct = Number(answer) === task.answer;
    setChecked(correct);
    onResultChange?.(correct, answer);
  };

  return (
    <article className="rounded-[2rem] bg-gradient-to-br from-fuchsia-950 via-violet-950 to-indigo-950 p-5 text-white shadow-2xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.18em] text-fuchsia-200">Reaktor pamięciowy</p>
      <h4 className="mt-2 text-3xl font-black">Naładuj rdzeń bez pisemnego algorytmu</h4>
      <div className="mx-auto mt-7 max-w-2xl rounded-[2rem] border-4 border-fuchsia-300/40 bg-black/30 p-6 text-center shadow-inner">
        <p className="font-mono font-black tabular-nums text-fuchsia-100 [font-size:clamp(2.4rem,8vw,5rem)]">{task.expression}</p>
        <div className="mx-auto mt-5 h-4 max-w-md overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-300 transition-all" style={{ width: answer ? `${Math.min(100, 25 + answer.length * 18)}%` : "8%" }} />
        </div>
      </div>
      <label className="mx-auto mt-6 block max-w-md text-center text-lg font-black">
        Wynik
        <input aria-label="Wynik działania pamięciowego" inputMode="none" disabled={readOnly} value={answer} onChange={(event) => update(event.target.value)} className="mt-2 min-h-14 w-full rounded-2xl border-2 border-fuchsia-300 bg-white px-3 text-center text-3xl font-black text-slate-950" />
      </label>
      <div className="mx-auto mt-4 max-w-xl rounded-3xl bg-white p-3 text-slate-950">
        <NumericLessonKeypad onKey={(key) => update(key === "backspace" ? answer.slice(0, -1) : `${answer}${key}`)} disabled={readOnly} label="Klawiatura reaktora" />
      </div>
      <button type="button" disabled={readOnly || !answer} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-fuchsia-300 text-lg font-black text-fuchsia-950 disabled:opacity-30">Uruchom reaktor</button>
      <MissionStatus correct={checked} success={`Rdzeń pracuje! ${task.expression} = ${task.answer.toLocaleString("pl-PL")}.`} error={task.hint} />
    </article>
  );
}

type RemainderField = "quotient" | "remainder";

function RemainderMission({ task, readOnly, onResultChange }: { task: (typeof REVIEW_REMAINDER_TASKS)[number]; readOnly: boolean; onResultChange: Props["onResultChange"] }) {
  const [quotient, setQuotient] = useState("");
  const [remainder, setRemainder] = useState("");
  const [active, setActive] = useState<RemainderField>("quotient");
  const [checked, setChecked] = useState<boolean | null>(null);
  useResultReset(onResultChange);
  const reset = () => {
    setChecked(null);
    onResultChange?.(null);
  };
  const update = (field: RemainderField, value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 2);
    if (field === "quotient") setQuotient(clean);
    else setRemainder(clean);
    reset();
  };
  const applyKey = (key: string) => {
    const current = active === "quotient" ? quotient : remainder;
    update(active, key === "backspace" ? current.slice(0, -1) : `${current}${key}`);
  };
  const check = () => {
    const correct = Number(quotient) === task.quotient && Number(remainder) === task.remainder;
    setChecked(correct);
    onResultChange?.(correct, `${quotient} r ${remainder}`);
  };

  return (
    <article className="rounded-[2rem] bg-gradient-to-br from-amber-100 via-orange-50 to-cyan-100 p-5 text-slate-950 shadow-2xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">Pakowalnia reszt</p>
      <h4 className="mt-2 text-3xl font-black">Zapakuj {task.total} sztuk: po {task.divisor} w każdym pojemniku</h4>
      <p className="mt-2 text-lg font-bold text-slate-700">Ładunek: {task.cargo}. Ile pełnych pojemników powstanie i ile sztuk zostanie?</p>
      <div className="mt-6 grid items-center gap-4 rounded-3xl border-4 border-orange-200 bg-white/80 p-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="grid min-h-28 place-items-center rounded-2xl border-4 border-violet-300 bg-violet-100 p-3 text-center shadow-md">
          <span className="text-4xl" aria-hidden>✨</span>
          <b className="text-2xl">{task.total} sztuk</b>
        </div>
        <span className="text-center text-3xl font-black text-orange-600" aria-hidden>→</span>
        <div className="grid min-h-28 place-items-center rounded-2xl border-4 border-cyan-300 bg-cyan-100 p-3 text-center shadow-md">
          <span className="text-4xl" aria-hidden>📦</span>
          <b className="text-xl">po {task.divisor} w pojemniku</b>
        </div>
        <span className="text-center text-3xl font-black text-orange-600" aria-hidden>→</span>
        <div className="grid min-h-28 place-items-center rounded-2xl border-4 border-dashed border-orange-400 bg-orange-100 p-3 text-center shadow-md">
          <b className="text-xl">? pełnych</b>
          <b className="text-xl">reszta ?</b>
        </div>
      </div>
      <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
        <label className="text-center text-lg font-black">Pełne pojemniki
          <input aria-label="Liczba pełnych pojemników" inputMode="none" disabled={readOnly} value={quotient} onFocus={() => setActive("quotient")} onClick={() => setActive("quotient")} onChange={(event) => update("quotient", event.target.value)} className={`mt-2 min-h-14 w-full rounded-2xl border-4 bg-white text-center text-3xl font-black ${active === "quotient" ? "border-cyan-500" : "border-slate-200"}`} />
        </label>
        <label className="text-center text-lg font-black">Reszta
          <input aria-label="Reszta z dzielenia" inputMode="none" disabled={readOnly} value={remainder} onFocus={() => setActive("remainder")} onClick={() => setActive("remainder")} onChange={(event) => update("remainder", event.target.value)} className={`mt-2 min-h-14 w-full rounded-2xl border-4 bg-white text-center text-3xl font-black ${active === "remainder" ? "border-orange-500" : "border-slate-200"}`} />
        </label>
      </div>
      <div className="mx-auto mt-4 max-w-xl rounded-3xl bg-white p-3">
        <NumericLessonKeypad onKey={applyKey} disabled={readOnly} label="Klawiatura pakowalni" />
      </div>
      <button type="button" disabled={readOnly || !quotient || !remainder} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-slate-950 text-lg font-black text-white disabled:opacity-30">Sprawdź pakowanie</button>
      <MissionStatus correct={checked} success={`${task.total} = ${task.divisor} × ${task.quotient} + ${task.remainder}. Reszta jest mniejsza od dzielnika.`} error="Sprawdź: dzielnik × liczba pełnych pojemników + reszta musi dać cały ładunek, a reszta musi być mniejsza od dzielnika." />
    </article>
  );
}

const STATION_TITLES = [
  "Dekoder wielkich liczb",
  "Kosmiczna kolejka na osi",
  "Sortownia liczb",
  "Reaktor rachunku pamięciowego",
  "Sterownia kolejności działań",
  "Pakowalnia dzielenia z resztą",
] as const;

export function SectionOneReviewLessonModel({ seed = 1, taskSeed = 1, readOnly = false, questionNumber = 1, questionCount = 4, onResultChange }: Props) {
  const station = Math.min(6, Math.max(1, seed));
  const taskIndex = Math.max(0, questionNumber - 1) % 4;
  const stableTaskSeed = taskSeed + station * 1009 + taskIndex * 97;

  return (
    <section data-section-one-review-station={station} className="rounded-[2.25rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-cyan-600 p-3 shadow-2xl sm:p-5">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 px-2 text-white">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Powtórzenie Działu I · Misja {station}/6</p>
          <h3 className="mt-1 text-2xl font-black sm:text-4xl">{STATION_TITLES[station - 1]}</h3>
        </div>
        <b className="rounded-2xl bg-white/20 px-4 py-2">Mini-stacja {questionNumber}/{questionCount}</b>
      </header>
      {station === 1 ? <ChoiceMission key={taskIndex} task={NUMBER_DECODER_TASKS[taskIndex]!} taskSeed={stableTaskSeed} readOnly={readOnly} onResultChange={onResultChange} theme="decoder" /> : null}
      {station === 2 ? <NumberLineMission key={taskIndex} task={REVIEW_NUMBER_LINE_TASKS[taskIndex]!} taskSeed={stableTaskSeed} readOnly={readOnly} onResultChange={onResultChange} /> : null}
      {station === 3 ? <SortMission key={taskIndex} numbers={REVIEW_SORT_TASKS[taskIndex]!} taskSeed={stableTaskSeed} readOnly={readOnly} onResultChange={onResultChange} /> : null}
      {station === 4 ? <NumericMission key={taskIndex} task={REVIEW_MENTAL_TASKS[taskIndex]!} readOnly={readOnly} onResultChange={onResultChange} /> : null}
      {station === 5 ? <ChoiceMission key={taskIndex} task={REVIEW_ORDER_TASKS[taskIndex]!} taskSeed={stableTaskSeed} readOnly={readOnly} onResultChange={onResultChange} theme="circuit" /> : null}
      {station === 6 ? <RemainderMission key={taskIndex} task={REVIEW_REMAINDER_TASKS[taskIndex]!} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    </section>
  );
}
