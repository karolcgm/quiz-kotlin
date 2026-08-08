"use client";

import Image from "next/image";
import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4StoryProblemsOneActivity = "information" | "practice";

export function grade4StoryProblemsOneActivityFromStageId(stageId: string): Grade4StoryProblemsOneActivity {
  return stageId.endsWith("-information") ? "information" : "practice";
}

type StoryTask = {
  image: string;
  imageAlt: string;
  questionKind: "o ile więcej" | "ile razem" | "ile razy więcej" | "6 razy więcej";
  prompt: string;
  firstNumber: number;
  secondNumber: number;
  operator: "+" | "−" | "·" | ":";
  answer: number;
  answerLead: string;
  answerTail: string;
};

const STORY_TASKS: StoryTask[] = [
  {
    image: "/images/lessons/grade4/story-problems-1/classes-comparison.webp",
    imageAlt: "Dwie grupy uczniów porównujące liczebność klas",
    questionKind: "o ile więcej",
    prompt: "W klasie IV A jest 35 uczniów, a w klasie IV B jest 27 uczniów. O ilu uczniów więcej jest w klasie IV A?",
    firstNumber: 35,
    secondNumber: 27,
    operator: "−",
    answer: 8,
    answerLead: "W klasie IV A jest o",
    answerTail: "uczniów więcej.",
  },
  {
    image: "/images/lessons/grade4/story-problems-1/balls-baskets.webp",
    imageAlt: "Duży i mały kosz z kolorowymi piłeczkami",
    questionKind: "ile razem",
    prompt: "W dużym koszu jest 27 czerwonych piłeczek, a w małym 15 niebieskich. Ile piłeczek jest razem w obu koszach?",
    firstNumber: 27,
    secondNumber: 15,
    operator: "+",
    answer: 42,
    answerLead: "W obu koszach są razem",
    answerTail: "piłeczki.",
  },
  {
    image: "/images/lessons/grade4/story-problems-1/library-shelves.webp",
    imageAlt: "Dwie półki z różną liczbą książek",
    questionKind: "ile razy więcej",
    prompt: "Na górnej półce jest 48 książek, a na dolnej 8. Ile razy więcej książek jest na górnej półce?",
    firstNumber: 48,
    secondNumber: 8,
    operator: ":",
    answer: 6,
    answerLead: "Na górnej półce jest",
    answerTail: "razy więcej książek.",
  },
  {
    image: "/images/lessons/grade4/story-problems-1/chestnuts-comparison.webp",
    imageAlt: "Lena i Jan porównują zebrane kasztany",
    questionKind: "6 razy więcej",
    prompt: "Jan zebrał 9 kasztanów, a Lena 6 razy więcej. Ile kasztanów zebrała Lena?",
    firstNumber: 9,
    secondNumber: 6,
    operator: "·",
    answer: 54,
    answerLead: "Lena zebrała",
    answerTail: "kasztany.",
  },
];

interface Props {
  activity: Grade4StoryProblemsOneActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function InformationSlide() {
  return <LessonTaskFrame
    eyebrow="Dział 1 · Temat 9"
    heading="O ile czy ile razy?"
    description="Najpierw przeczytaj pytanie. To ono podpowiada działanie."
  >
    <div className="space-y-4">
      <div className="relative h-52 overflow-hidden rounded-3xl ring-2 ring-cyan-200 sm:h-64">
        <Image
          src="/images/lessons/grade4/story-problems-1/stickers-comparison.webp"
          alt="Ola i Kuba porównują swoje kolekcje naklejek"
          fill
          priority
          sizes="(max-width: 768px) 92vw, 720px"
          className="object-cover"
        />
      </div>

      <p className="rounded-2xl bg-slate-100 px-5 py-4 text-center text-xl font-black leading-relaxed text-slate-950">
        Ola ma 24 naklejki, a Kuba 8 naklejek.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <h3 className="rounded-2xl bg-white p-3 text-lg font-black text-emerald-950">O ile więcej naklejek ma Ola?</h3>
            <h3 className="rounded-2xl bg-white p-3 text-lg font-black text-emerald-950">O ile mniej naklejek ma Kuba?</h3>
          </div>
          <p className="mt-2 font-bold text-emerald-900">Odejmujemy mniejszą liczbę od większej.</p>
          <p className="mt-4 whitespace-nowrap text-4xl font-black text-slate-950">24 − 8 = 16</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <p className="rounded-xl bg-emerald-100 p-3 font-black text-emerald-950">Ola ma o 16 naklejek więcej.</p>
            <p className="rounded-xl bg-emerald-100 p-3 font-black text-emerald-950">Kuba ma o 16 naklejek mniej.</p>
          </div>
        </section>

        <section className="rounded-3xl bg-violet-50 p-5 text-center ring-2 ring-violet-200">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <h3 className="rounded-2xl bg-white p-3 text-lg font-black text-violet-950">Ile razy więcej naklejek ma Ola?</h3>
            <h3 className="rounded-2xl bg-white p-3 text-lg font-black text-violet-950">Ile razy mniej naklejek ma Kuba?</h3>
          </div>
          <p className="mt-2 font-bold text-violet-900">Dzielimy większą liczbę przez mniejszą.</p>
          <p className="mt-4 whitespace-nowrap text-4xl font-black text-slate-950">24 : 8 = 3</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <p className="rounded-xl bg-violet-100 p-3 font-black text-violet-950">Ola ma 3 razy więcej naklejek.</p>
            <p className="rounded-xl bg-violet-100 p-3 font-black text-violet-950">Kuba ma 3 razy mniej naklejek.</p>
          </div>
        </section>
      </div>

      <section className="grid gap-3 rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200 sm:grid-cols-2">
        <p className="rounded-2xl bg-white px-4 py-3 text-center font-black text-cyan-950">„O ile więcej?” lub „o ile mniej?” → odejmowanie</p>
        <p className="rounded-2xl bg-white px-4 py-3 text-center font-black text-cyan-950">„Ile razy więcej?” lub „ile razy mniej?” → dzielenie</p>
      </section>
    </div>
  </LessonTaskFrame>;
}

function PracticeSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: {
  task: StoryTask;
  questionNumber: number;
  questionCount: number;
  readOnly: boolean;
  onResultChange?: Props["onResultChange"];
}) {
  const [values, setValues] = useState(["", "", ""]);
  const [selectedOperator, setSelectedOperator] = useState<StoryTask["operator"] | "">("");
  const [activeField, setActiveField] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const edit = (key: string) => {
    if (locked) return;
    if (key === "+" || key === "−" || key === "·" || key === ":") {
      setSelectedOperator(key);
      setFeedback(null);
      onResultChange?.(null);
      return;
    }
    setValues((current) => current.map((value, index) => {
      if (index !== activeField) return value;
      if (key === "backspace") return value.slice(0, -1);
      return value.length >= 3 ? value : `${value}${key}`;
    }));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (values.some((value) => value === "") || selectedOperator === "") {
      setFeedback("missing");
      return;
    }
    const expected = [task.firstNumber, task.secondNumber, task.answer];
    const correct = selectedOperator === task.operator && values.every((value, index) => Number(value) === expected[index]);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, `${values[0]} ${selectedOperator} ${values[1]} = ${values[2]}`);
  };

  const field = (index: number, label: string) => <input
    aria-label={label}
    value={values[index]}
    inputMode="none"
    readOnly
    onClick={() => !locked && setActiveField(index)}
    className={`h-16 w-24 rounded-2xl border-2 bg-white text-center text-3xl font-black text-slate-950 outline-none transition sm:w-28 ${activeField === index && !locked ? "border-violet-700 ring-4 ring-violet-200" : "border-violet-300"}`}
  />;

  return <LessonTaskFrame
    eyebrow="Dział 1 · Temat 9"
    heading="Zadania tekstowe"
    description="Zapisz całe działanie, oblicz wynik i przeczytaj odpowiedź."
    questionNumber={questionNumber}
    questionCount={questionCount}
  >
    <div className="space-y-4">
      <div className="relative h-48 overflow-hidden rounded-3xl ring-2 ring-cyan-200 sm:h-60">
        <Image src={task.image} alt={task.imageAlt} fill sizes="(max-width: 768px) 92vw, 720px" className="object-cover" />
      </div>

      <section className="rounded-3xl bg-amber-50 px-5 py-5 text-center text-amber-950 ring-2 ring-amber-200">
        <p className="mx-auto mb-3 w-fit rounded-full bg-amber-200 px-4 py-2 text-sm font-black uppercase tracking-[.12em]">
          Pytanie: {task.questionKind}
        </p>
        <p className="text-xl font-black leading-relaxed">{task.prompt}</p>
      </section>

      <section className="rounded-3xl bg-indigo-50 p-5 ring-2 ring-indigo-200">
        <p className="mb-4 text-center text-sm font-black uppercase tracking-[.16em] text-indigo-800">Działanie</p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-4xl font-black text-slate-950">
          {field(0, "Pierwsza liczba działania")}
          <span aria-label="Wybrany znak działania" className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-4xl font-black ${selectedOperator ? "border-violet-600 bg-violet-600 text-white" : "border-dashed border-violet-400 bg-white text-violet-500"}`}>{selectedOperator || "?"}</span>
          {field(1, "Druga liczba działania")}
          <span aria-hidden>=</span>
          {field(2, "Wynik działania")}
        </div>
      </section>

      <section className="rounded-2xl bg-emerald-50 px-4 py-4 text-center text-lg font-black text-emerald-950 ring-2 ring-emerald-200">
        <span>{task.answerLead} </span>
        <span className="inline-flex min-w-12 justify-center rounded-lg bg-white px-2 py-1 ring-2 ring-emerald-300">{values[2] || "?"}</span>
        <span> {task.answerTail}</span>
      </section>

      {!readOnly ? <LessonNumericKeypad
        onKey={edit}
        onConfirm={check}
        disabled={locked}
        operationKeys={["+", "−", "·", ":"]}
        selectedOperation={selectedOperator}
        label="Klawiatura do zapisu działania"
        helperText="Wpisz liczby, wybierz znak działania na klawiaturze i uzupełnij wynik."
      /> : null}

      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Wpisz obie liczby i wynik oraz wybierz znak działania.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Poprawnie odczytujesz pytanie, wybierasz działanie i zapisujesz odpowiedź.</p> : null}
      {feedback === "incorrect" ? <div role="status" className="space-y-2 rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">
        <p>Spróbuj innym razem. Poprawne działanie to {task.firstNumber} {task.operator} {task.secondNumber} = {task.answer}. Dziś bez punktu.</p>
        <p>{task.answerLead} {task.answer} {task.answerTail}</p>
      </div> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade4StoryProblemsOneLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = STORY_TASKS.length, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  const task = STORY_TASKS[Math.max(0, (questionNumber - 1) % STORY_TASKS.length)] ?? STORY_TASKS[Math.abs(taskSeed) % STORY_TASKS.length]!;
  return <PracticeSlide
    key={`${questionNumber}-${task.image}`}
    task={task}
    questionNumber={questionNumber}
    questionCount={questionCount}
    readOnly={readOnly}
    onResultChange={onResultChange}
  />;
}
