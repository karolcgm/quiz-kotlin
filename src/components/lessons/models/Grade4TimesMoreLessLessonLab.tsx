"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4TimesMoreLessActivity = "information" | "practice" | "reverse" | "stories";

export function grade4TimesMoreLessActivityFromStageId(stageId: string): Grade4TimesMoreLessActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-reverse")) return "reverse";
  if (stageId.endsWith("-stories")) return "stories";
  return "practice";
}

type Task = {
  prompt: string;
  answers: number[];
  labels?: Array<{ before: string; after: string; ariaLabel: string }>;
  suffix?: string;
  image?: string;
  imageAlt?: string;
  hint: string;
};

const PRACTICE_TASKS: Task[] = [
  { prompt: "Znajdź liczbę 6 razy większą od 7.", answers: [42], hint: "„6 razy większa” oznacza: pomnóż przez 6." },
  { prompt: "Znajdź liczbę 4 razy mniejszą od 36.", answers: [9], hint: "„4 razy mniejsza” oznacza: podziel przez 4." },
  { prompt: "Ile razy liczba 32 jest większa od 8?", answers: [4], suffix: "razy", hint: "Podziel większą liczbę przez mniejszą: 32 : 8." },
  { prompt: "Ile razy liczba 6 jest mniejsza od 42?", answers: [7], suffix: "razy", hint: "Sprawdź, ile razy 6 mieści się w 42." },
  { prompt: "Jaka liczba jest 5 razy większa od 9?", answers: [45], hint: "Oblicz 9 · 5." },
  { prompt: "Jaka liczba jest 8 razy mniejsza od 64?", answers: [8], hint: "Oblicz 64 : 8." },
];

const REVERSE_TASKS: Task[] = [
  { prompt: "to 4 razy więcej niż 6.", answers: [24], hint: "Oblicz 6 · 4." },
  { prompt: "to 3 razy mniej niż 27.", answers: [9], hint: "Oblicz 27 : 3." },
  { prompt: "to 7 razy więcej niż 8.", answers: [56], hint: "Oblicz 8 · 7." },
  { prompt: "to 5 razy mniej niż 45.", answers: [9], hint: "Oblicz 45 : 5." },
];

const STORY_TASKS: Task[] = [
  {
    prompt: "Hania ma 6 naklejek, a Olek ma 4 razy więcej naklejek niż Hania.",
    labels: [
      { before: "a) Olek ma", after: "naklejki.", ariaLabel: "Odpowiedź a: liczba naklejek Olka" },
      { before: "b) Razem mają", after: "naklejek.", ariaLabel: "Odpowiedź b: łączna liczba naklejek" },
    ],
    answers: [24, 30],
    hint: "Najpierw oblicz 6 · 4, a potem dodaj naklejki obojga dzieci.",
    image: "/images/lessons/grade4/times-more-less/stickers.webp",
    imageAlt: "Dwoje dzieci porównuje dwa zestawy naklejek",
  },
  {
    prompt: "Na pierwszej tacy są 4 babeczki, a na drugiej jest ich 5 razy więcej.",
    labels: [
      { before: "a) Na drugiej tacy jest", after: "babeczek.", ariaLabel: "Odpowiedź a: liczba babeczek na drugiej tacy" },
      { before: "b) Na obu tacach są", after: "babeczki.", ariaLabel: "Odpowiedź b: liczba babeczek na obu tacach" },
    ],
    answers: [20, 24],
    hint: "Najpierw oblicz 4 · 5, a potem dodaj zawartość obu tac.",
    image: "/images/lessons/grade4/times-more-less/cupcakes.webp",
    imageAlt: "Dwoje dzieci przy dwóch tacach z babeczkami",
  },
  {
    prompt: "Ala ułożyła 8 książek, a Kuba ułożył 3 razy więcej książek niż Ala.",
    labels: [
      { before: "a) Kuba ułożył", after: "książki.", ariaLabel: "Odpowiedź a: liczba książek Kuby" },
      { before: "b) Razem ułożyli", after: "książki.", ariaLabel: "Odpowiedź b: łączna liczba książek" },
    ],
    answers: [24, 32],
    hint: "Najpierw oblicz 8 · 3.",
    image: "/images/lessons/grade4/times-more-less/library-books.webp",
    imageAlt: "Dwoje dzieci układa książki w bibliotece",
  },
  {
    prompt: "Lena zebrała 20 piłeczek, a Michał zebrał 5 razy mniej piłeczek niż Lena.",
    labels: [
      { before: "a) Michał zebrał", after: "piłeczki.", ariaLabel: "Odpowiedź a: liczba piłeczek Michała" },
      { before: "b) Razem zebrali", after: "piłeczki.", ariaLabel: "Odpowiedź b: łączna liczba piłeczek" },
    ],
    answers: [4, 24],
    hint: "Najpierw oblicz 20 : 5.",
    image: "/images/lessons/grade4/times-more-less/sports-balls.webp",
    imageAlt: "Dwoje dzieci przy dużym i małym koszu z piłeczkami",
  },
];

interface Props {
  activity: Grade4TimesMoreLessActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function InformationSlide() {
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 6" heading="Ile razy więcej? Ile razy mniej?" description="Słowa w poleceniu podpowiadają mnożenie albo dzielenie.">
    <div className="space-y-4">
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200">
          <p className="text-lg font-black text-emerald-950">4 razy więcej niż 6</p>
          <p className="mt-4 whitespace-nowrap text-3xl font-black tracking-tight text-slate-950">6 · 4 = 24</p>
          <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-bold text-emerald-900">„Razy więcej” → mnożymy</p>
        </section>
        <section className="min-w-0 rounded-3xl bg-amber-50 p-5 text-center ring-2 ring-amber-200">
          <p className="text-lg font-black text-amber-950">4 razy mniej niż 24</p>
          <p className="mt-4 whitespace-nowrap text-3xl font-black tracking-tight text-slate-950">24 : 4 = 6</p>
          <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-bold text-amber-900">„Razy mniej” → dzielimy</p>
        </section>
      </div>
      <section className="rounded-3xl bg-cyan-50 p-5 text-center ring-2 ring-cyan-200">
        <p className="font-black text-cyan-950">Aby sprawdzić, ile razy 24 jest większe od 6, dzielimy:</p>
        <p className="mt-3 whitespace-nowrap text-3xl font-black text-slate-950">24 : 6 = 4</p>
        <p className="mt-2 font-bold text-cyan-900">Liczba 24 jest 4 razy większa od 6.</p>
      </section>
    </div>
  </LessonTaskFrame>;
}

export function Grade4TimesMoreLessLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  const tasks = activity === "reverse" ? REVERSE_TASKS : activity === "stories" ? STORY_TASKS : PRACTICE_TASKS;
  const task = useMemo(() => tasks[Math.max(0, (questionNumber - 1) % tasks.length)] ?? tasks[Math.abs(taskSeed) % tasks.length]!, [questionNumber, taskSeed, tasks]);
  const [values, setValues] = useState(() => task.answers.map(() => ""));
  const [activeField, setActiveField] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);

  if (activity === "information") return <InformationSlide />;

  const edit = (key: string) => {
    if (readOnly || feedback === "correct" || feedback === "incorrect") return;
    setValues((current) => current.map((value, index) => index === activeField
      ? key === "backspace" ? value.slice(0, -1) : value.length >= 3 ? value : `${value}${key}`
      : value));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (values.some((value) => value === "")) {
      setFeedback("missing");
      return;
    }
    const correct = task.answers.every((answer, index) => Number(values[index]) === answer);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.join(", "));
  };

  const expected = task.answers.map((answer, index) => task.labels ? `${String.fromCharCode(97 + index)}) ${answer}` : `${answer}`).join(", ");
  const heading = activity === "stories" ? "Zadanie z treścią" : activity === "reverse" ? "Uzupełnij zdanie" : "Ile razy więcej? Ile razy mniej?";
  const description = activity === "stories"
    ? "Przeczytaj treść i uzupełnij oba podpunkty."
    : activity === "reverse"
      ? "Oblicz liczbę, którą należy wpisać w kratkę."
      : "Rozpoznaj, czy należy pomnożyć, podzielić, czy porównać liczby.";

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 6" heading={heading} description={description} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      {task.image ? <Image src={task.image} alt={task.imageAlt ?? "Ilustracja do zadania"} width={1536} height={1024} priority className="mx-auto aspect-[3/2] max-h-80 w-full rounded-3xl object-cover" /> : null}
      {activity !== "reverse" ? <p className="rounded-2xl bg-indigo-50 px-4 py-4 text-center text-xl font-black leading-relaxed text-indigo-950">{task.prompt}</p> : null}
      <div className="space-y-3">
        {task.answers.map((_, index) => <label key={index} className={`flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 p-4 font-black ${activeField === index ? "border-violet-600 bg-violet-50" : "border-slate-200 bg-white"}`}>
          {activity === "stories" ? <span>{task.labels?.[index]?.before}</span> : activity !== "reverse" ? <span>Odpowiedź:</span> : null}
          <input aria-label={task.labels?.[index]?.ariaLabel ?? "Wynik"} value={values[index]} onClick={() => setActiveField(index)} inputMode="none" readOnly className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black outline-none" />
          {activity === "reverse" ? <span>{task.prompt}</span> : null}
          {activity === "stories" && task.labels?.[index]?.after ? <span>{task.labels[index].after}</span> : null}
          {activity !== "stories" && task.suffix ? <span>{task.suffix}</span> : null}
        </label>)}
      </div>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={feedback === "correct" || feedback === "incorrect"} label="Klawiatura do odpowiedzi" helperText={task.answers.length > 1 ? "Dotknij kratki a) lub b), wpisz liczbę i zatwierdź oba wyniki." : "Wpisz liczbę i zatwierdź."} /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij wszystkie wymagane pola.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Odpowiedź jest poprawna.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {expected}. Dziś bez punktu.</p> : null}
      {!feedback ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">Podpowiedź: {task.hint}</p> : null}
    </div>
  </LessonTaskFrame>;
}
