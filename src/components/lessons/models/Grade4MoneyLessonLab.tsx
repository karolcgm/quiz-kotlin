"use client";

import Image from "next/image";
import { useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export type Grade4MoneyActivity = "information" | "example" | "zl-to-gr" | "gr-to-zl-gr" | "story" | "market";

export function grade4MoneyActivityFromStageId(stageId: string): Grade4MoneyActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-example")) return "example";
  if (stageId.endsWith("-zl-to-gr")) return "zl-to-gr";
  if (stageId.endsWith("-gr-to-zl-gr")) return "gr-to-zl-gr";
  if (stageId.endsWith("-market")) return "market";
  return "story";
}

interface Props {
  activity: Grade4MoneyActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type Feedback = "correct" | "incorrect" | "missing" | null;
type ActiveMoneyField = "zl" | "gr";

const ZL_TO_GR_TASKS = [
  { zl: 3, gr: 300 },
  { zl: 7, gr: 700 },
  { zl: 12, gr: 1200 },
  { zl: 25, gr: 2500 },
  { zl: 40, gr: 4000 },
  { zl: 125, gr: 12500 },
] as const;

const GR_TO_ZL_GR_TASKS = [
  { totalGr: 235, zl: 2, gr: 35 },
  { totalGr: 780, zl: 7, gr: 80 },
  { totalGr: 100, zl: 1, gr: 0 },
  { totalGr: 4050, zl: 40, gr: 50 },
  { totalGr: 999, zl: 9, gr: 99 },
  { totalGr: 1200, zl: 12, gr: 0 },
] as const;

export const MONEY_STORY_TASKS = [
  {
    imageSrc: "/images/lessons/grade4/money/bakery-shopping.png",
    imageAlt: "Dziewczynka kupuje chleb i sok w piekarni",
    prompt: "W piekarni chleb kosztuje 5 zł 40 gr, a sok 3 zł 20 gr. Ile trzeba zapłacić razem?",
    zl: 8,
    gr: 60,
    hint: "Dodaj osobno złote i osobno grosze.",
  },
  {
    imageSrc: "/images/lessons/grade4/money/toy-store-change.png",
    imageAlt: "Chłopiec kupuje piłkę w sklepie z zabawkami",
    prompt: "Kuba ma 20 zł. Piłka kosztuje 13 zł 40 gr. Ile reszty otrzyma Kuba?",
    zl: 6,
    gr: 60,
    hint: "Od 20 zł odejmij cenę piłki.",
  },
  {
    imageSrc: "/images/lessons/grade4/money/school-kiosk-juices.png",
    imageAlt: "Dzieci kupują trzy soki w szkolnym sklepiku",
    prompt: "Jeden sok kosztuje 2 zł 50 gr. Ile kosztują 3 takie soki?",
    zl: 7,
    gr: 50,
    hint: "Cenę jednego soku pomnóż przez 3.",
  },
  {
    imageSrc: "/images/lessons/grade4/money/fruit-stand.png",
    imageAlt: "Dziecko wybiera jabłka i gruszki na targu",
    prompt: "Koszyk jabłek kosztuje 8 zł 70 gr, a koszyk gruszek 6 zł 30 gr. Ile kosztują oba koszyki?",
    zl: 15,
    gr: 0,
    hint: "Pamiętaj: 100 gr zamieniamy na 1 zł.",
  },
] as const;

export const MARKET_TASK_PARTS = [
  { label: "a", prompt: "2 kg jabłek i 1 kg bananów", zl: 14, gr: 0 },
  { label: "b", prompt: "półtora kilograma buraków", zl: 4, gr: 50 },
  { label: "c", prompt: "pół kilograma jabłek", zl: 2, gr: 0 },
] as const;

function MoneyInput({ label, value, active, onSelect }: { label: string; value: string; active: boolean; onSelect: () => void }) {
  return (
    <label className="flex items-center gap-2 font-black text-slate-950">
      <input
        aria-label={label}
        value={value}
        inputMode="none"
        readOnly
        onClick={onSelect}
        onFocus={onSelect}
        className={`h-16 w-28 rounded-xl border-2 bg-white px-2 text-center text-2xl font-black outline-none ${active ? "border-violet-700 ring-4 ring-violet-200" : "border-violet-300"}`}
      />
      <span>{label.endsWith("zł") ? "zł" : "gr"}</span>
    </label>
  );
}

function FeedbackMessage({ feedback, correctAnswer }: { feedback: Feedback; correctAnswer: string }) {
  if (feedback === "missing") return <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie kratki.</p>;
  if (feedback === "correct") return <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! Poprawny wynik to {correctAnswer}.</p>;
  if (feedback === "incorrect") return <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {correctAnswer}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div>;
  return null;
}

function InformationSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 4" heading="Złote i grosze" description="W Polsce ceny zapisujemy w złotych i groszach.">
      <div className="space-y-5">
        <section className="rounded-3xl bg-cyan-50 p-5 text-center ring-2 ring-cyan-200">
          <p className="text-lg font-black uppercase tracking-widest text-cyan-900">Najważniejsza zamiana</p>
          <p className="mt-3 text-4xl font-black text-violet-800 sm:text-5xl">1 zł = 100 gr</p>
          <p className="mt-3 font-bold text-slate-700">Złoty dzieli się na 100 groszy.</p>
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200">
            <h3 className="text-center text-xl font-black text-amber-950">Monety groszowe</h3>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["1 gr", "2 gr", "5 gr", "10 gr", "20 gr", "50 gr"].map((value) => <span key={value} className="grid h-16 w-16 place-items-center rounded-full border-4 border-amber-400 bg-amber-100 text-sm font-black shadow">{value}</span>)}
            </div>
          </section>
          <section className="rounded-3xl bg-emerald-50 p-5 ring-2 ring-emerald-200">
            <h3 className="text-center text-xl font-black text-emerald-950">Monety złotowe</h3>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {["1 zł", "2 zł", "5 zł"].map((value) => <span key={value} className="grid h-20 w-20 place-items-center rounded-full border-4 border-emerald-500 bg-emerald-100 text-lg font-black shadow">{value}</span>)}
            </div>
          </section>
        </div>
        <section className="rounded-3xl bg-violet-50 p-5 text-center ring-2 ring-violet-200">
          <p className="text-2xl font-black text-violet-950">7 zł 35 gr</p>
          <p className="mt-2 font-bold text-slate-700">to 7 pełnych złotych i jeszcze 35 groszy</p>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function ExampleSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 4" heading="Zakupy w sklepie" description="Najpierw policz osobno złote, a potem grosze.">
      <div className="space-y-4">
        <Image src="/images/lessons/grade4/money/stationery-example.png" alt="Dziecko wybiera zeszyt i ołówek w sklepie papierniczym" width={1536} height={1024} className="max-h-64 w-full rounded-3xl object-cover object-center ring-2 ring-cyan-200" preload />
        <section className="rounded-3xl bg-amber-50 p-5 text-center ring-2 ring-amber-200">
          <p className="text-xl font-black text-amber-950">Zeszyt kosztuje 4 zł 50 gr, a ołówek 2 zł 30 gr. Ile kosztują razem?</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow"><p className="text-sm font-black uppercase text-cyan-800">Złote</p><p className="mt-1 text-2xl font-black">4 + 2 = 6 zł</p></div>
            <div className="rounded-2xl bg-white p-4 shadow"><p className="text-sm font-black uppercase text-violet-800">Grosze</p><p className="mt-1 text-2xl font-black">50 + 30 = 80 gr</p></div>
          </div>
          <p className="mt-4 rounded-2xl bg-emerald-100 p-4 text-3xl font-black text-emerald-950">Odpowiedź: 6 zł 80 gr</p>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function SingleAnswerSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof ZL_TO_GR_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 6 ? current : `${current}${key}`);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (!answer) return setFeedback("missing");
    const correct = Number(answer) === task.gr;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answer);
  };
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 4" heading="Zamień złote na grosze" description="Każdy 1 zł to 100 gr." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200">
          <p className="text-4xl font-black text-slate-950">{task.zl} zł =</p>
          <label className="mt-5 inline-flex items-center gap-3 text-xl font-black"><input aria-label="Liczba groszy" value={answer} inputMode="none" readOnly className="h-16 w-40 rounded-xl border-2 border-violet-400 bg-white px-3 text-center text-2xl font-black outline-none" /><span>gr</span></label>
        </section>
        {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do zamiany pieniędzy" helperText="Wpisz liczbę groszy i zatwierdź." /> : null}
        <FeedbackMessage feedback={feedback} correctAnswer={`${task.gr} gr`} />
      </div>
    </LessonTaskFrame>
  );
}

function TwoAnswerSlide({ mode, task, questionNumber, questionCount, readOnly, onResultChange }: { mode: "conversion" | "story"; task: (typeof GR_TO_ZL_GR_TASKS)[number] | (typeof MONEY_STORY_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [zl, setZl] = useState("");
  const [gr, setGr] = useState("");
  const [activeField, setActiveField] = useState<ActiveMoneyField>("zl");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const expectedZl = task.zl;
  const expectedGr = task.gr;
  const edit = (key: string) => {
    if (locked) return;
    const setter = activeField === "zl" ? setZl : setGr;
    setter((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 5 ? current : `${current}${key}`);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (zl === "" || gr === "") return setFeedback("missing");
    const correct = Number(zl) === expectedZl && Number(gr) === expectedGr;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, `${zl}|${gr}`);
  };
  const story = mode === "story" ? task as (typeof MONEY_STORY_TASKS)[number] : null;
  const conversion = mode === "conversion" ? task as (typeof GR_TO_ZL_GR_TASKS)[number] : null;
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 4" heading={story ? "Zakupy i pieniądze" : "Zamień grosze na złote i grosze"} description={story ? "Przeczytaj zadanie i wpisz pełną odpowiedź." : "W każdej pełnej setce groszy ukrywa się 1 zł."} questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="overflow-hidden rounded-3xl bg-cyan-50 ring-2 ring-cyan-200">
          {story ? <Image src={story.imageSrc} alt={story.imageAlt} width={1536} height={1024} className="max-h-60 w-full object-cover object-center" /> : null}
          <div className="p-5 text-center">
            <p className="text-xl font-black text-slate-950 sm:text-2xl">{story ? story.prompt : `${conversion?.totalGr} gr =`}</p>
            {story ? <p className="mt-3 font-bold text-slate-700">{story.hint}</p> : null}
            <div className="mt-5 flex flex-wrap justify-center gap-5">
              <MoneyInput label="Wynik w zł" value={zl} active={activeField === "zl"} onSelect={() => setActiveField("zl")} />
              <MoneyInput label="Wynik w gr" value={gr} active={activeField === "gr"} onSelect={() => setActiveField("gr")} />
            </div>
            <p className="mt-3 text-sm font-bold text-violet-800">Dotknij kratki zł albo gr, a następnie użyj klawiatury.</p>
          </div>
        </section>
        {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do pieniędzy" helperText={`Teraz wpisujesz: ${activeField === "zl" ? "złote" : "grosze"}.`} /> : null}
        <FeedbackMessage feedback={feedback} correctAnswer={`${expectedZl} zł ${expectedGr} gr`} />
      </div>
    </LessonTaskFrame>
  );
}

function MarketSlide({ questionNumber, questionCount, readOnly, onResultChange }: { questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [answers, setAnswers] = useState(() => MARKET_TASK_PARTS.map(() => ({ zl: "", gr: "" })));
  const [active, setActive] = useState<{ index: number; field: ActiveMoneyField }>({ index: 0, field: "zl" });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setAnswers((current) => current.map((answer, index) => {
      if (index !== active.index) return answer;
      const value = answer[active.field];
      const nextValue = key === "backspace" ? value.slice(0, -1) : value.length >= 4 ? value : `${value}${key}`;
      return { ...answer, [active.field]: nextValue };
    }));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (answers.some((answer) => answer.zl === "" || answer.gr === "")) return setFeedback("missing");
    const correct = MARKET_TASK_PARTS.every((part, index) => Number(answers[index]?.zl) === part.zl && Number(answers[index]?.gr) === part.gr);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answers.map((answer) => `${answer.zl}|${answer.gr}`).join(";"));
  };
  const correctAnswer = "a) 14 zł 0 gr; b) 4 zł 50 gr; c) 2 zł 0 gr";
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 4" heading="Zakupy na straganie" description="Skorzystaj z cennika i oblicz trzy osobne kwoty." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="overflow-hidden rounded-3xl bg-cyan-50 ring-2 ring-cyan-200">
          <Image src="/images/lessons/grade4/money/greengrocer-market.png" alt="Stragan z jabłkami, bananami i burakami" width={1536} height={1024} className="max-h-56 w-full object-cover object-center" />
          <div className="p-4">
            <h3 className="text-center text-xl font-black text-cyan-950">Cennik za 1 kg</h3>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <p className="rounded-2xl bg-rose-100 p-3 font-black text-rose-950"><span className="block text-2xl" aria-hidden>🍎</span>jabłka<br />4 zł</p>
              <p className="rounded-2xl bg-yellow-100 p-3 font-black text-yellow-950"><span className="block text-2xl" aria-hidden>🍌</span>banany<br />6 zł</p>
              <p className="rounded-2xl bg-fuchsia-100 p-3 font-black text-fuchsia-950"><span className="block text-2xl" aria-hidden>🫜</span>buraki<br />3 zł</p>
            </div>
          </div>
        </section>
        <section className="space-y-3 rounded-3xl bg-violet-50 p-4 ring-2 ring-violet-200">
          <h3 className="text-center text-xl font-black text-violet-950">Ile zapłacisz za każdy zakup?</h3>
          {MARKET_TASK_PARTS.map((part, index) => (
            <div key={part.label} className="grid items-center gap-3 rounded-2xl bg-white p-3 shadow sm:grid-cols-[1fr_auto]">
              <p className="font-black"><span className="mr-2 text-violet-800">{part.label})</span>{part.prompt}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <MoneyInput label={`Podpunkt ${part.label}, wynik w zł`} value={answers[index]?.zl ?? ""} active={active.index === index && active.field === "zl"} onSelect={() => setActive({ index, field: "zl" })} />
                <MoneyInput label={`Podpunkt ${part.label}, wynik w gr`} value={answers[index]?.gr ?? ""} active={active.index === index && active.field === "gr"} onSelect={() => setActive({ index, field: "gr" })} />
              </div>
            </div>
          ))}
          <p className="text-center text-sm font-bold text-violet-800">Przy połowie kilograma płacisz połowę ceny za 1 kg.</p>
        </section>
        {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do zakupów na straganie" helperText={`Teraz wpisujesz podpunkt ${MARKET_TASK_PARTS[active.index]?.label}: ${active.field === "zl" ? "złote" : "grosze"}.`} /> : null}
        <FeedbackMessage feedback={feedback} correctAnswer={correctAnswer} />
      </div>
    </LessonTaskFrame>
  );
}

export function Grade4MoneyLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  if (activity === "example") return <ExampleSlide />;
  if (activity === "zl-to-gr") {
    const task = ZL_TO_GR_TASKS[(questionNumber - 1) % ZL_TO_GR_TASKS.length] ?? ZL_TO_GR_TASKS[Math.abs(taskSeed) % ZL_TO_GR_TASKS.length]!;
    return <SingleAnswerSlide key={`zl-to-gr-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  if (activity === "gr-to-zl-gr") {
    const task = GR_TO_ZL_GR_TASKS[(questionNumber - 1) % GR_TO_ZL_GR_TASKS.length] ?? GR_TO_ZL_GR_TASKS[Math.abs(taskSeed) % GR_TO_ZL_GR_TASKS.length]!;
    return <TwoAnswerSlide key={`gr-to-zl-gr-${questionNumber}`} mode="conversion" task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  if (activity === "market") return <MarketSlide questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  const task = MONEY_STORY_TASKS[(questionNumber - 1) % MONEY_STORY_TASKS.length] ?? MONEY_STORY_TASKS[Math.abs(taskSeed) % MONEY_STORY_TASKS.length]!;
  return <TwoAnswerSlide key={`story-${questionNumber}`} mode="story" task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
