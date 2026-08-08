"use client";

import Image from "next/image";
import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4LengthUnitsActivity = "information" | "choose-unit" | "conversion-example" | "convert" | "route";

export function grade4LengthUnitsActivityFromStageId(stageId: string): Grade4LengthUnitsActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-choose-unit")) return "choose-unit";
  if (stageId.endsWith("-conversion-example")) return "conversion-example";
  if (stageId.endsWith("-convert")) return "convert";
  return "route";
}

interface Props {
  activity: Grade4LengthUnitsActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type Feedback = "correct" | "incorrect" | "missing" | null;

export const LENGTH_UNIT_TASKS = [
  { icon: "🧍", object: "obwód w pasie", answer: "cm", explanation: "Obwód w pasie najwygodniej podajemy w centymetrach." },
  { icon: "🏢", object: "wysokość budynku", answer: "m", explanation: "Wysokość budynku podajemy w metrach." },
  { icon: "🏞️", object: "długość rzeki", answer: "km", explanation: "Długie odległości geograficzne podajemy w kilometrach." },
  { icon: "🔩", object: "grubość śrubki", answer: "mm", explanation: "Bardzo małe długości mierzymy w milimetrach." },
  { icon: "📏", object: "długość linijki", answer: "cm", explanation: "Długość szkolnej linijki podajemy w centymetrach." },
  { icon: "🚲", object: "długość trasy rowerowej", answer: "km", explanation: "Trasę rowerową najwygodniej podać w kilometrach." },
] as const;

type ConversionTask = {
  prompt: string;
  answers: readonly { unit: string; value: number }[];
  hint: string;
};

export const LENGTH_CONVERSION_TASKS: readonly ConversionTask[] = [
  { prompt: "5 cm =", answers: [{ unit: "mm", value: 50 }], hint: "1 cm = 10 mm" },
  { prompt: "8 dm =", answers: [{ unit: "cm", value: 80 }], hint: "1 dm = 10 cm" },
  { prompt: "4 m =", answers: [{ unit: "cm", value: 400 }], hint: "1 m = 100 cm" },
  { prompt: "3 km =", answers: [{ unit: "m", value: 3000 }], hint: "1 km = 1000 m" },
  { prompt: "35 mm =", answers: [{ unit: "cm", value: 3 }, { unit: "mm", value: 5 }], hint: "30 mm to 3 cm, zostaje 5 mm." },
  { prompt: "127 cm =", answers: [{ unit: "m", value: 1 }, { unit: "cm", value: 27 }], hint: "100 cm to 1 m, zostaje 27 cm." },
  { prompt: "2045 m =", answers: [{ unit: "km", value: 2 }, { unit: "m", value: 45 }], hint: "2000 m to 2 km, zostaje 45 m." },
  { prompt: "6 cm 5 mm =", answers: [{ unit: "mm", value: 65 }], hint: "6 cm to 60 mm. Dodaj jeszcze 5 mm." },
] as const;

function FeedbackMessage({ feedback, answer, explanation }: { feedback: Feedback; answer: string; explanation?: string }) {
  if (feedback === "missing") return <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij odpowiedź.</p>;
  if (feedback === "correct") return <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! {explanation ?? `Poprawny wynik to ${answer}.`}</p>;
  if (feedback === "incorrect") return <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {answer}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div>;
  return null;
}

function InformationSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 5" heading="Jednostki długości" description="Jednostkę dobieramy do wielkości mierzonego obiektu lub odległości.">
      <div className="space-y-5">
        <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
          <h3 className="text-center text-xl font-black text-cyan-950">Od najmniejszej do największej</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ["mm", "milimetr", "grubość"],
              ["cm", "centymetr", "mały przedmiot"],
              ["dm", "decymetr", "10 cm"],
              ["m", "metr", "pokój, budynek"],
              ["km", "kilometr", "daleka trasa"],
            ].map(([symbol, name, example]) => <div key={symbol} className="rounded-2xl bg-white p-3 text-center shadow"><p className="text-3xl font-black text-violet-800">{symbol}</p><p className="font-black">{name}</p><p className="mt-1 text-xs font-bold text-slate-600">{example}</p></div>)}
          </div>
        </section>
        <section className="rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200">
          <h3 className="text-center text-xl font-black text-violet-950">Najważniejsze zależności</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["1 cm = 10 mm", "1 dm = 10 cm", "1 m = 10 dm", "1 m = 100 cm", "1 m = 1000 mm", "1 km = 1000 m"].map((relation) => <p key={relation} className="rounded-2xl bg-white p-3 text-center text-xl font-black shadow">{relation}</p>)}
          </div>
        </section>
        <p className="rounded-2xl bg-amber-100 p-4 text-center font-black text-amber-950">Mniejsza jednostka daje większą liczbę. Większa jednostka daje mniejszą liczbę.</p>
      </div>
    </LessonTaskFrame>
  );
}

function ConversionExampleSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 5" heading="Jak zamieniamy jednostki?" description="Najpierw sprawdź zależność między jednostkami.">
      <div className="space-y-4">
        <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
          <p className="text-center text-lg font-black text-cyan-950">Z większej jednostki na mniejszą</p>
          <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow"><p className="text-3xl font-black">4 cm = 4 · 10 mm = 40 mm</p><p className="mt-2 font-bold text-slate-700">Każdy centymetr ma 10 milimetrów.</p></div>
        </section>
        <section className="rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200">
          <p className="text-center text-lg font-black text-violet-950">Z mniejszej jednostki na zapis łączony</p>
          <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow"><p className="text-3xl font-black">35 mm = 3 cm 5 mm</p><p className="mt-2 font-bold text-slate-700">30 mm tworzy 3 cm, a 5 mm pozostaje.</p></div>
        </section>
        <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200">
          <p className="text-center text-lg font-black text-amber-950">Kilometry i metry</p>
          <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow"><p className="text-3xl font-black">2450 m = 2 km 450 m</p><p className="mt-2 font-bold text-slate-700">2000 m tworzy 2 km, a 450 m pozostaje.</p></div>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function ChooseUnitSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof LENGTH_UNIT_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const check = () => {
    if (!selected) return setFeedback("missing");
    const correct = selected === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, selected);
  };
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 5" heading="Dobierz jednostkę" description="Wybierz jednostkę, w której najwygodniej podać tę długość." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200">
          <span className="text-7xl" aria-hidden>{task.icon}</span>
          <p className="mt-3 text-2xl font-black text-slate-950">{task.object}</p>
        </section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{["mm", "cm", "m", "km"].map((unit) => <LessonTaskChoice key={unit} selected={selected === unit} disabled={locked} onClick={() => { setSelected(unit); setFeedback(null); onResultChange?.(null); }} className="min-h-16 text-xl">{unit}</LessonTaskChoice>)}</div>
        {!readOnly ? <button type="button" disabled={locked} onClick={check} className="min-h-12 w-full rounded-xl bg-violet-700 px-4 font-black text-white disabled:opacity-40">Zatwierdź</button> : null}
        <FeedbackMessage feedback={feedback} answer={task.answer} explanation={task.explanation} />
      </div>
    </LessonTaskFrame>
  );
}

function LengthAnswerFields({ values, units, activeIndex, onSelect }: { values: readonly string[]; units: readonly string[]; activeIndex: number; onSelect: (index: number) => void }) {
  return <div className="flex flex-wrap justify-center gap-4">{units.map((unit, index) => <label key={`${unit}-${index}`} className="flex items-center gap-2 text-xl font-black"><input aria-label={`Wynik ${index + 1} w ${unit}`} value={values[index] ?? ""} inputMode="none" readOnly onClick={() => onSelect(index)} onFocus={() => onSelect(index)} className={`h-16 w-32 rounded-xl border-2 bg-white px-2 text-center text-2xl font-black outline-none ${activeIndex === index ? "border-violet-700 ring-4 ring-violet-200" : "border-violet-300"}`} /><span>{unit}</span></label>)}</div>;
}

function ConversionSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: ConversionTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [values, setValues] = useState<string[]>(() => task.answers.map(() => ""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index === activeIndex ? key === "backspace" ? value.slice(0, -1) : value.length >= 6 ? value : `${value}${key}` : value));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (values.some((value) => value === "")) return setFeedback("missing");
    const correct = task.answers.every((answer, index) => Number(values[index]) === answer.value);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.join("|"));
  };
  const correctAnswer = task.answers.map((answer) => `${answer.value} ${answer.unit}`).join(" ");
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 5" heading="Zamień jednostki" description="Uzupełnij jedną lub dwie kratki." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200">
          <p className="text-4xl font-black text-slate-950">{task.prompt}</p>
          <div className="mt-5"><LengthAnswerFields values={values} units={task.answers.map((answer) => answer.unit)} activeIndex={activeIndex} onSelect={setActiveIndex} /></div>
          <p className="mt-4 font-bold text-violet-800">{task.hint}</p>
        </section>
        {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do zamiany długości" helperText={`Wpisujesz wynik w ${task.answers[activeIndex]?.unit ?? "jednostce"}.`} /> : null}
        <FeedbackMessage feedback={feedback} answer={correctAnswer} />
      </div>
    </LessonTaskFrame>
  );
}

function RouteSlide({ questionNumber, questionCount, readOnly, onResultChange }: { questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const answers = [{ unit: "km", value: 2 }, { unit: "m", value: 750 }] as const;
  const [values, setValues] = useState(["", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index === activeIndex ? key === "backspace" ? value.slice(0, -1) : value.length >= 5 ? value : `${value}${key}` : value));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (values.some((value) => value === "")) return setFeedback("missing");
    const correct = answers.every((answer, index) => Number(values[index]) === answer.value);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.join("|"));
  };
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 5" heading="Trasa przy drogowskazie" description="Połącz odległości zapisane w metrach i kilometrach." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="overflow-hidden rounded-3xl bg-cyan-50 ring-2 ring-cyan-200">
          <div className="relative aspect-[3/2] w-full overflow-hidden">
            <Image src="/images/lessons/grade4/length/route-signpost.png" alt="Turysta przy drogowskazie prowadzącym do wsi, jeziora i lasu" fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" preload />
            <span className="absolute left-[47%] top-[13%] rounded-lg bg-white/90 px-2 py-1 text-[10px] font-black shadow sm:text-sm">Jezioro · 750 m</span>
            <span className="absolute left-[24%] top-[32%] rounded-lg bg-white/90 px-2 py-1 text-[10px] font-black shadow sm:text-sm">Wieś · 2 km 300 m</span>
            <span className="absolute left-[52%] top-[47%] rounded-lg bg-white/90 px-2 py-1 text-[10px] font-black shadow sm:text-sm">Las · 1 km 250 m</span>
          </div>
          <div className="p-5 text-center">
            <p className="text-xl font-black text-slate-950">Antek idzie od drogowskazu nad jezioro, wraca do drogowskazu, a potem idzie do lasu. Jaką drogę przejdzie razem?</p>
            <div className="mt-5"><LengthAnswerFields values={values} units={answers.map((answer) => answer.unit)} activeIndex={activeIndex} onSelect={setActiveIndex} /></div>
          </div>
        </section>
        {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do zadania z trasą" helperText={`Wpisujesz wynik w ${answers[activeIndex]?.unit}.`} /> : null}
        <FeedbackMessage feedback={feedback} answer="2 km 750 m" />
      </div>
    </LessonTaskFrame>
  );
}

export function Grade4LengthUnitsLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  if (activity === "conversion-example") return <ConversionExampleSlide />;
  if (activity === "choose-unit") {
    const task = LENGTH_UNIT_TASKS[(questionNumber - 1) % LENGTH_UNIT_TASKS.length] ?? LENGTH_UNIT_TASKS[Math.abs(taskSeed) % LENGTH_UNIT_TASKS.length]!;
    return <ChooseUnitSlide key={`unit-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  if (activity === "convert") {
    const task = LENGTH_CONVERSION_TASKS[(questionNumber - 1) % LENGTH_CONVERSION_TASKS.length] ?? LENGTH_CONVERSION_TASKS[Math.abs(taskSeed) % LENGTH_CONVERSION_TASKS.length]!;
    return <ConversionSlide key={`convert-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  return <RouteSlide questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
