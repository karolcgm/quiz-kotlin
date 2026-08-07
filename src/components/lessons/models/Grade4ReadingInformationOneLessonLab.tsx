"use client";

import { useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4ReadingInformationOneActivity = "information" | "practice";

export function grade4ReadingInformationOneActivityFromStageId(stageId: string): Grade4ReadingInformationOneActivity {
  return stageId.endsWith("-information") ? "information" : "practice";
}

type VisualKind = "room-steps" | "tableware" | "ages" | "playground" | "notice" | "weather";

type ReadingTask = {
  visual: VisualKind;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
  clue: string;
};

const TASKS: ReadingTask[] = [
  {
    visual: "room-steps",
    prompt: "Ewa i Lena zmierzyły krokami tę samą długość sali. Ewa zrobiła 28 kroków, a Lena 35 kroków. Która dziewczynka ma krótszy krok?",
    choices: ["Ewa", "Lena", "Mają równe kroki", "Nie można ustalić"],
    answer: "Lena",
    explanation: "Na tej samej drodze więcej kroków oznacza krótszy pojedynczy krok. Lena zrobiła ich więcej.",
    clue: "Obie dziewczynki pokonały tę samą odległość. Porównaj liczbę kroków.",
  },
  {
    visual: "tableware",
    prompt: "W szkolnej stołówce przygotowano 24 łyżki, 19 widelców, 22 łyżeczki i 20 noży. Dla ilu najwyżej osób wystarczy pełny komplet sztućców?",
    choices: ["19 osób", "20 osób", "22 osoby", "24 osoby"],
    answer: "19 osób",
    explanation: "Każda osoba potrzebuje każdego rodzaju sztućca. Najmniej jest widelców — 19 — i to one ograniczają liczbę kompletów.",
    clue: "Pełny komplet musi zawierać po jednej rzeczy każdego rodzaju. Znajdź najmniejszy zapas.",
  },
  {
    visual: "ages",
    prompt: "Hania ma 11 lat i jest o 27 lat młodsza od swojej mamy. Ile lat miała mama, gdy urodziła się Hania?",
    choices: ["11 lat", "16 lat", "27 lat", "38 lat"],
    answer: "27 lat",
    explanation: "Różnica wieku mamy i Hani zawsze wynosi 27 lat. Gdy Hania miała 0 lat, mama miała 27 lat.",
    clue: "Różnica wieku dwóch osób nie zmienia się z upływem czasu.",
  },
  {
    visual: "playground",
    prompt: "Czworo dzieci przeszło tę samą drogę przez boisko. Ada zrobiła 48 kroków, Bartek 57, Celina 51, a Dawid 60. Kto ma najdłuższy krok?",
    choices: ["Ada", "Bartek", "Celina", "Dawid"],
    answer: "Ada",
    explanation: "Przy tej samej drodze najdłuższy krok ma osoba, która potrzebowała najmniej kroków. Najmniej, czyli 48, zrobiła Ada.",
    clue: "Nie wybieraj największej liczby. Najdłuższy krok oznacza najmniejszą liczbę kroków na tej samej drodze.",
  },
  {
    visual: "notice",
    prompt: "W ogłoszeniu zapisano: „W konkursie mogą uczestniczyć uczniowie klas IV–VI”. Zosia jest w klasie III. Czy może wziąć udział?",
    choices: ["Tak", "Nie", "Tak, jeśli przyjdzie z koleżanką", "Nie można ustalić"],
    answer: "Nie",
    explanation: "Klasa III nie należy do podanego zakresu klas IV–VI.",
    clue: "Sprawdź warunek udziału i porównaj go z klasą Zosi.",
  },
  {
    visual: "weather",
    prompt: "W sobotę było cieplej niż w niedzielę. Czy w sobotę temperatura wynosiła dokładnie 18°C?",
    choices: ["Tak", "Nie", "Tylko rano", "Nie można ustalić"],
    answer: "Nie można ustalić",
    explanation: "Wiemy jedynie, który dzień był cieplejszy. Nie podano żadnej temperatury.",
    clue: "Sprawdź, czy w treści pojawia się konkretna liczba stopni.",
  },
];

interface Props {
  activity: Grade4ReadingInformationOneActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function BoardGameExample() {
  return <LessonTaskFrame
    eyebrow="Dział 1 · Temat 10"
    heading="Czytaj warunki, nie szukaj działania"
    description="W niektórych zadaniach wystarczy uporządkować informacje i sprawdzić, czy wszystkie warunki są spełnione."
  >
    <div className="space-y-5">
      <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200">
        <p className="text-center text-xl font-black leading-relaxed text-amber-950">
          W grę planszową może grać od 3 do 6 osób. Czy 8 dzieci może zagrać jednocześnie, korzystając ze wszystkich 3 plansz?
        </p>
      </section>

      <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
        <p className="mb-4 text-center text-sm font-black uppercase tracking-[.16em] text-cyan-900">Spróbujmy rozdzielić dzieci</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[3, 3, 2].map((count, boardIndex) => <div key={boardIndex} className={`rounded-2xl bg-white p-4 text-center shadow ${count < 3 ? "ring-4 ring-rose-300" : "ring-2 ring-emerald-200"}`}>
            <div className="mx-auto grid h-24 w-24 grid-cols-3 place-items-center rounded-2xl border-4 border-slate-700 bg-gradient-to-br from-violet-200 to-cyan-100 p-2">
              {Array.from({ length: count }, (_, index) => <span key={index} className="h-6 w-6 rounded-full bg-violet-700 ring-2 ring-white" />)}
            </div>
            <p className="mt-3 font-black text-slate-950">Plansza {boardIndex + 1}: {count} osoby</p>
            {count < 3 ? <p className="mt-1 font-black text-rose-700">Za mało graczy</p> : <p className="mt-1 font-black text-emerald-700">Warunek spełniony</p>}
          </div>)}
        </div>
      </section>

      <section className="rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200">
        <p className="text-center text-2xl font-black text-violet-950">Odpowiedź: Nie.</p>
        <p className="mt-2 text-center font-bold leading-relaxed text-violet-900">Na każdej z trzech plansz muszą być przynajmniej 3 osoby. Po rozdzieleniu dzieci przy trzeciej planszy zostałyby tylko 2 osoby.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["1. Znajdź warunki", "Od 3 do 6 osób przy każdej planszy."],
          ["2. Sprawdź dane", "Jest 8 dzieci i mają użyć 3 plansz."],
          ["3. Wyciągnij wniosek", "Jeden warunek nie jest spełniony, więc odpowiedź brzmi: nie."],
        ].map(([title, body]) => <div key={title} className="rounded-2xl bg-slate-100 p-4 text-center">
          <p className="font-black text-slate-950">{title}</p>
          <p className="mt-1 text-sm font-bold text-slate-700">{body}</p>
        </div>)}
      </div>
    </div>
  </LessonTaskFrame>;
}

function TaskVisual({ kind }: { kind: VisualKind }) {
  if (kind === "room-steps") return <div className="grid gap-3 sm:grid-cols-2">{[["Ewa", 28], ["Lena", 35]].map(([name, steps]) => <div key={name} className="rounded-2xl bg-white p-4 text-center shadow ring-2 ring-cyan-200"><p className="font-black text-slate-950">{name}</p><div className="my-3 border-b-4 border-dashed border-cyan-500" /><p className="text-3xl font-black text-violet-800">{steps} kroków</p></div>)}</div>;
  if (kind === "tableware") return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Łyżki", 24, "🥄"], ["Widelce", 19, "🍴"], ["Łyżeczki", 22, "🥄"], ["Noże", 20, "🔪"]].map(([label, count, icon]) => <div key={label} className="rounded-2xl bg-white p-3 text-center shadow ring-2 ring-violet-200"><p className="text-3xl" aria-hidden>{icon}</p><p className="font-black text-slate-700">{label}</p><p className="text-2xl font-black text-violet-800">{count}</p></div>)}</div>;
  if (kind === "ages") return <div className="flex flex-wrap items-center justify-center gap-4"><div className="rounded-2xl bg-amber-100 p-5 text-center ring-2 ring-amber-300"><p className="font-black text-amber-950">Hania</p><p className="text-3xl font-black">11 lat</p></div><span className="text-3xl font-black text-violet-700">27 lat różnicy</span><div className="rounded-2xl bg-violet-100 p-5 text-center ring-2 ring-violet-300"><p className="font-black text-violet-950">Mama</p><p className="text-3xl font-black">starsza</p></div></div>;
  if (kind === "playground") return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Ada", 48], ["Bartek", 57], ["Celina", 51], ["Dawid", 60]].map(([name, steps]) => <div key={name} className="rounded-2xl bg-white p-3 text-center shadow ring-2 ring-emerald-200"><p className="font-black text-slate-700">{name}</p><p className="mt-2 text-2xl font-black text-emerald-800">{steps}</p><p className="text-xs font-bold text-slate-500">kroków</p></div>)}</div>;
  if (kind === "notice") return <div className="mx-auto max-w-md rounded-2xl border-4 border-amber-500 bg-amber-50 p-5 text-center shadow"><p className="text-xs font-black uppercase tracking-widest text-amber-800">Ogłoszenie</p><p className="mt-2 text-xl font-black text-slate-950">Konkurs dla klas IV–VI</p><p className="mt-2 font-bold text-slate-700">Zosia: klasa III</p></div>;
  return <div className="grid grid-cols-2 gap-4 text-center"><div className="rounded-2xl bg-amber-100 p-5 ring-2 ring-amber-300"><p className="font-black text-amber-950">Sobota</p><p className="mt-2 text-3xl font-black">cieplej</p></div><div className="rounded-2xl bg-blue-100 p-5 ring-2 ring-blue-300"><p className="font-black text-blue-950">Niedziela</p><p className="mt-2 text-3xl font-black">chłodniej</p></div></div>;
}

function PracticeSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: {
  task: ReadingTask;
  questionNumber: number;
  questionCount: number;
  readOnly: boolean;
  onResultChange?: Props["onResultChange"];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const choose = (choice: string) => {
    if (locked) return;
    setSelected(choice);
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (!selected) {
      setFeedback("missing");
      return;
    }
    const correct = selected === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, selected);
  };

  return <LessonTaskFrame
    eyebrow="Dział 1 · Temat 10"
    heading="Przeanalizuj informacje"
    description="Nie szukaj działania na siłę. Sprawdź warunki, zależności i to, czy danych jest wystarczająco dużo."
    questionNumber={questionNumber}
    questionCount={questionCount}
  >
    <div className="space-y-4">
      <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200"><TaskVisual kind={task.visual} /></section>
      <p className="rounded-3xl bg-amber-50 px-5 py-5 text-center text-xl font-black leading-relaxed text-amber-950 ring-2 ring-amber-200">{task.prompt}</p>
      <p className="rounded-2xl bg-slate-100 px-4 py-3 text-center font-bold text-slate-700"><span className="font-black text-slate-950">Na co zwrócić uwagę:</span> {task.clue}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {task.choices.map((choice) => <LessonTaskChoice key={choice} selected={selected === choice} disabled={locked} onClick={() => choose(choice)}>{choice}</LessonTaskChoice>)}
      </div>
      {!readOnly ? <button type="button" onClick={check} disabled={locked} className="min-h-12 w-full rounded-2xl bg-violet-700 px-4 font-black text-white shadow focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300 disabled:opacity-40">Sprawdź odpowiedź</button> : null}

      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Wybierz jedną odpowiedź.</p> : null}
      {feedback === "correct" ? <div role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950"><p>Brawo! Właściwie odczytujesz informacje.</p><p className="mt-1">{task.explanation}</p></div> : null}
      {feedback === "incorrect" ? <div role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawna odpowiedź to: {task.answer}. Dziś bez punktu.</p><p className="mt-1">{task.explanation}</p></div> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade4ReadingInformationOneLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = TASKS.length, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <BoardGameExample />;
  const task = TASKS[Math.max(0, (questionNumber - 1) % TASKS.length)] ?? TASKS[Math.abs(taskSeed) % TASKS.length]!;
  return <PracticeSlide key={`${questionNumber}-${task.prompt}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
