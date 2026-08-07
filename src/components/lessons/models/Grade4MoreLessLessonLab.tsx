"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4MoreLessActivity = "information" | "practice" | "reverse" | "stories";

export function grade4MoreLessActivityFromStageId(stageId: string): Grade4MoreLessActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-reverse")) return "reverse";
  if (stageId.endsWith("-stories")) return "stories";
  return "practice";
}

type Task = {
  prompt: string;
  answers: number[];
  labels?: Array<{ before: string; after: string; ariaLabel: string }>;
  image?: string;
  imageAlt?: string;
  hint: string;
};

const PRACTICE_TASKS: Task[] = [
  { prompt: "Znajdź liczbę o 9 większą od 35.", answers: [44], hint: "„O 9 większa” oznacza: dodaj 9." },
  { prompt: "Znajdź liczbę o 6 mniejszą od 52.", answers: [46], hint: "„O 6 mniejsza” oznacza: odejmij 6." },
  { prompt: "Znajdź liczbę o 12 większą od 47.", answers: [59], hint: "Do liczby 47 dodaj 12." },
  { prompt: "Znajdź liczbę o 8 mniejszą od 61.", answers: [53], hint: "Od liczby 61 odejmij 8." },
  { prompt: "Jaka liczba jest o 15 większa od 28?", answers: [43], hint: "Wykonaj dodawanie." },
  { prompt: "Jaka liczba jest o 13 mniejsza od 70?", answers: [57], hint: "Wykonaj odejmowanie." },
];

const REVERSE_TASKS: Task[] = [
  { prompt: "to o 8 więcej niż 34.", answers: [42], hint: "Oblicz 34 + 8." },
  { prompt: "to o 7 mniej niż 29.", answers: [22], hint: "Oblicz 29 − 7." },
  { prompt: "to o 15 więcej niż 46.", answers: [61], hint: "Oblicz 46 + 15." },
  { prompt: "to o 18 mniej niż 73.", answers: [55], hint: "Oblicz 73 − 18." },
];

const STORY_TASKS: Task[] = [
  {
    prompt: "Na dolnej półce są 24 książki, a na górnej jest o 7 książek więcej.",
    labels: [
      { before: "a) Na górnej półce jest", after: "książek.", ariaLabel: "Odpowiedź a: liczba książek na górnej półce" },
      { before: "b) Razem na obu półkach jest", after: "książek.", ariaLabel: "Odpowiedź b: liczba książek na obu półkach" },
    ],
    answers: [31, 55], hint: "Najpierw oblicz 24 + 7, potem dodaj wynik do 24.",
    image: "/images/lessons/grade4/more-less/library-shelves.png", imageAlt: "Dwoje dzieci układa książki na dwóch półkach",
  },
  {
    prompt: "W mniejszym koszu jest 16 jabłek, a w większym jest o 9 jabłek więcej.",
    labels: [
      { before: "a) W większym koszu jest", after: "jabłek.", ariaLabel: "Odpowiedź a: liczba jabłek w większym koszu" },
      { before: "b) Razem w obu koszach jest", after: "jabłek.", ariaLabel: "Odpowiedź b: liczba jabłek w obu koszach" },
    ],
    answers: [25, 41], hint: "Najpierw oblicz liczbę jabłek w większym koszu.",
    image: "/images/lessons/grade4/more-less/apple-baskets.png", imageAlt: "Dwoje dzieci przy dwóch koszach jabłek",
  },
  {
    prompt: "Ola zebrała 29 pachołków, a Bartek zebrał o 8 pachołków mniej.",
    labels: [
      { before: "a) Bartek zebrał", after: "pachołków.", ariaLabel: "Odpowiedź a: liczba pachołków Bartka" },
      { before: "b) Razem zebrali", after: "pachołków.", ariaLabel: "Odpowiedź b: łączna liczba pachołków" },
    ],
    answers: [21, 50], hint: "Najpierw od 29 odejmij 8.",
    image: "/images/lessons/grade4/more-less/sports-cones.png", imageAlt: "Dwoje dzieci zbiera pachołki na boisku",
  },
  {
    prompt: "Maja przygotowała 14 balonów, a Kuba przygotował o 6 balonów więcej.",
    labels: [
      { before: "a) Kuba przygotował", after: "balonów.", ariaLabel: "Odpowiedź a: liczba balonów Kuby" },
      { before: "b) Razem przygotowali", after: "balonów.", ariaLabel: "Odpowiedź b: łączna liczba balonów" },
    ],
    answers: [20, 34], hint: "Najpierw oblicz 14 + 6.",
    image: "/images/lessons/grade4/more-less/balloons.png", imageAlt: "Dwoje dzieci z dwoma pękami balonów",
  },
];

interface Props {
  activity: Grade4MoreLessActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function InformationSlide() {
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 2" heading="O ile więcej? O ile mniej?" description="Słowa w poleceniu podpowiadają działanie.">
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <section className="min-w-0 rounded-3xl bg-emerald-50 p-4 text-center ring-2 ring-emerald-200 sm:p-5">
        <p className="text-lg font-black text-emerald-950">O 5 więcej niż 22</p>
        <p className="mt-4 whitespace-nowrap text-3xl font-black tracking-tight text-slate-950">22 + 5 = 27</p>
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-bold text-emerald-900">„O więcej” → dodajemy</p>
      </section>
      <section className="min-w-0 rounded-3xl bg-amber-50 p-4 text-center ring-2 ring-amber-200 sm:p-5">
        <p className="text-lg font-black text-amber-950">O 7 mniej niż 22</p>
        <p className="mt-4 whitespace-nowrap text-3xl font-black tracking-tight text-slate-950">22 − 7 = 15</p>
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-bold text-amber-900">„O mniej” → odejmujemy</p>
      </section>
    </div>
  </LessonTaskFrame>;
}

export function Grade4MoreLessLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
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
    if (values.some((value) => value === "")) { setFeedback("missing"); return; }
    const correct = task.answers.every((answer, index) => Number(values[index]) === answer);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.join(", "));
  };
  const expected = task.answers.map((answer, index) => `${task.labels?.[index]?.before.slice(0, 2) ?? "wynik"} ${answer}`).join(", ");
  const heading = activity === "stories" ? "Zadanie z treścią" : activity === "reverse" ? "Uzupełnij zdanie" : "O ile więcej? O ile mniej?";

  const description = activity === "stories"
    ? "Przeczytaj treść i uzupełnij oba podpunkty."
    : activity === "reverse"
      ? "Oblicz liczbę, którą należy wpisać w puste miejsce."
      : "Odczytaj, czy liczbę trzeba zwiększyć, czy zmniejszyć.";

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 2" heading={heading} description={description} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      {task.image ? <Image src={task.image} alt={task.imageAlt ?? "Ilustracja do zadania"} width={1536} height={1024} priority className="mx-auto aspect-[3/2] max-h-80 w-full rounded-3xl object-cover" /> : null}
      {activity === "stories" ? <p className="rounded-2xl bg-indigo-50 px-4 py-4 text-center text-xl font-black leading-relaxed text-indigo-950">{task.prompt}</p> : null}
      <div className="space-y-3">
        {task.answers.map((_, index) => <label key={index} className={`flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 p-4 font-black ${activeField === index ? "border-violet-600 bg-violet-50" : "border-slate-200 bg-white"}`}>
          {activity !== "reverse" ? <span>{task.labels?.[index]?.before ?? task.prompt}</span> : null}
          <input aria-label={task.labels?.[index]?.ariaLabel ?? "Wynik"} value={values[index]} onClick={() => setActiveField(index)} inputMode="none" readOnly className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black outline-none" />
          {activity === "reverse" ? <span>{task.prompt}</span> : null}
          {task.labels?.[index]?.after ? <span>{task.labels[index].after}</span> : null}
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
