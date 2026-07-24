"use client";

import { useEffect, useRef, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export type VolumeReviewActivity = "unit-cubes" | "solid-volume" | "conversions" | "stories" | "challenge";

interface VolumeReviewLabProps {
  activity: VolumeReviewActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

interface AnswerField {
  id: string;
  label: string;
  unit: string;
  answer: number;
}

interface ReviewTask {
  id: string;
  prompt: string;
  detail?: string;
  hint: string;
  success: string;
  fields: AnswerField[];
  visual: "layers" | "cuboid" | "cube" | "capacity" | "story" | "mission";
  dimensions?: [number, number, number];
  visualUnit?: string;
  fill?: number;
  icon?: string;
}

const UNIT_CUBE_TASKS: ReviewTask[] = [
  { id: "cubes-1", prompt: "Bryła ma 3 klocki w rzędzie, 2 rzędy w warstwie i 2 warstwy. Oblicz jej objętość.", hint: "Najpierw policz klocki w jednej warstwie, a potem pomnóż przez liczbę warstw.", success: "Dobrze! 3 · 2 · 2 = 12.", fields: [{ id: "volume", label: "Objętość bryły", unit: "cm³", answer: 12 }], visual: "layers", dimensions: [3, 2, 2] },
  { id: "cubes-2", prompt: "Bryła z klocków ma 4 klocki w rzędzie, 3 rzędy i 2 warstwy. Oblicz jej objętość.", hint: "Pomnóż trzy wymiary bryły z klocków.", success: "Dobrze! Bryła mieści 24 klocki jednostkowe.", fields: [{ id: "volume", label: "Objętość bryły", unit: "cm³", answer: 24 }], visual: "layers", dimensions: [4, 3, 2] },
  { id: "cubes-3", prompt: "W jednej warstwie jest prostokąt 5 na 2 klocki. Bryła ma 3 takie warstwy. Oblicz jej objętość.", hint: "W jednej warstwie jest 5 · 2 klocków.", success: "Dobrze! 10 klocków w warstwie i 3 warstwy dają 30.", fields: [{ id: "volume", label: "Objętość bryły", unit: "cm³", answer: 30 }], visual: "layers", dimensions: [5, 2, 3] },
  { id: "cubes-4", prompt: "Ile sześcianów jednostkowych tworzy bryłę o wymiarach 4 · 4 · 2 klocki?", hint: "Każdy mały klocek ma objętość 1 cm³.", success: "Dobrze! 4 · 4 · 2 = 32.", fields: [{ id: "volume", label: "Liczba klocków", unit: "", answer: 32 }], visual: "layers", dimensions: [4, 4, 2] },
  { id: "cubes-5", prompt: "Bryła ma 2 klocki w rzędzie, 3 rzędy i 5 warstw. Oblicz jej objętość.", hint: "Mnożymy liczbę klocków wzdłuż, wszerz i w górę.", success: "Dobrze! Bryła ma objętość 30 cm³.", fields: [{ id: "volume", label: "Objętość bryły", unit: "cm³", answer: 30 }], visual: "layers", dimensions: [2, 3, 5] },
  { id: "cubes-6", prompt: "W każdej warstwie jest 6 klocków, a bryła ma 4 warstwy. Oblicz objętość.", hint: "Pomnóż liczbę klocków w warstwie przez liczbę warstw.", success: "Dobrze! 6 · 4 = 24.", fields: [{ id: "volume", label: "Objętość bryły", unit: "cm³", answer: 24 }], visual: "layers", dimensions: [3, 2, 4] },
];

const SOLID_VOLUME_TASKS: ReviewTask[] = [
  { id: "solid-1", prompt: "Oblicz objętość prostopadłościanu o podanych krawędziach.", detail: "Wybierz wzór V = a · b · c.", hint: "Pomnóż trzy długości krawędzi.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość", unit: "cm³", answer: 120 }], visual: "cuboid", dimensions: [5, 4, 6] },
  { id: "solid-2", prompt: "Oblicz objętość sześcianu o krawędzi 7 cm.", detail: "W sześcianie wszystkie trzy krawędzie mają tę samą długość.", hint: "Oblicz 7 · 7 · 7.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość", unit: "cm³", answer: 343 }], visual: "cube", dimensions: [7, 7, 7] },
  { id: "solid-3", prompt: "Oblicz objętość prostopadłościanu o krawędziach 12 cm, 5 cm i 4 cm.", hint: "Mnożymy wszystkie trzy krawędzie.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość", unit: "cm³", answer: 240 }], visual: "cuboid", dimensions: [12, 5, 4] },
  { id: "solid-4", prompt: "Sześcian ma krawędź długości 4 dm. Oblicz jego objętość.", hint: "W sześcianie oblicz 4 · 4 · 4.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość", unit: "dm³", answer: 64 }], visual: "cube", dimensions: [4, 4, 4], visualUnit: "dm" },
  { id: "solid-5", prompt: "Oblicz objętość prostopadłościanu o wymiarach 8 cm, 3 cm i 9 cm.", hint: "Pomnóż 8, 3 i 9.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość", unit: "cm³", answer: 216 }], visual: "cuboid", dimensions: [8, 3, 9] },
  { id: "solid-6", prompt: "Pudełko ma długość 20 cm, szerokość 10 cm i wysokość 5 cm. Oblicz jego objętość.", hint: "Wykonaj mnożenie 20 · 10 · 5.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość", unit: "cm³", answer: 1000 }], visual: "cuboid", dimensions: [20, 10, 5] },
];

const CONVERSION_TASKS: ReviewTask[] = [
  { id: "convert-1", prompt: "Zamień 3 dm³ na litry.", hint: "1 dm³ to 1 l.", success: "Dobrze!", fields: [{ id: "result", label: "Wynik", unit: "l", answer: 3 }], visual: "capacity", fill: 75 },
  { id: "convert-2", prompt: "Zamień 2500 ml na litry.", hint: "1000 ml to 1 l. Użyj przecinka.", success: "Dobrze!", fields: [{ id: "result", label: "Wynik", unit: "l", answer: 2.5 }], visual: "capacity", fill: 80 },
  { id: "convert-3", prompt: "Zamień 4 l na mililitry.", hint: "Jeden litr ma 1000 ml.", success: "Dobrze!", fields: [{ id: "result", label: "Wynik", unit: "ml", answer: 4000 }], visual: "capacity", fill: 55 },
  { id: "convert-4", prompt: "Zamień 1500 cm³ na litry.", hint: "1000 cm³ to 1 l.", success: "Dobrze!", fields: [{ id: "result", label: "Wynik", unit: "l", answer: 1.5 }], visual: "capacity", fill: 70 },
  { id: "convert-5", prompt: "Zamień 6,5 l na mililitry.", hint: "Pomnóż liczbę litrów przez 1000.", success: "Dobrze!", fields: [{ id: "result", label: "Wynik", unit: "ml", answer: 6500 }], visual: "capacity", fill: 65 },
  { id: "convert-6", prompt: "Zamień 800 ml na cm³.", hint: "1 ml odpowiada 1 cm³.", success: "Dobrze!", fields: [{ id: "result", label: "Wynik", unit: "cm³", answer: 800 }], visual: "capacity", fill: 40 },
  { id: "convert-7", prompt: "Zamień 2 dm³ na cm³.", hint: "1 dm³ to 1000 cm³.", success: "Dobrze!", fields: [{ id: "result", label: "Wynik", unit: "cm³", answer: 2000 }], visual: "capacity", fill: 90 },
  { id: "convert-8", prompt: "Zamień 750 ml na litry.", hint: "750 ml to trzy czwarte litra. Użyj przecinka.", success: "Dobrze!", fields: [{ id: "result", label: "Wynik", unit: "l", answer: 0.75 }], visual: "capacity", fill: 75 },
];

const STORY_TASKS: ReviewTask[] = [
  { id: "story-1", prompt: "Skrzynka na kredki ma wymiary wewnętrzne 30 cm, 20 cm i 10 cm. Oblicz jej objętość, a potem zapisz ją w litrach.", hint: "Najpierw oblicz objętość w cm³. Potem pamiętaj, że 1000 cm³ to 1 l.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość skrzynki", unit: "cm³", answer: 6000 }, { id: "liters", label: "Ta sama objętość", unit: "l", answer: 6 }], visual: "story", dimensions: [30, 20, 10], icon: "✏️" },
  { id: "story-2", prompt: "Akwarium ma wymiary wewnętrzne 40 cm, 25 cm i 20 cm. Oblicz, ile litrów wody zmieści się w pełnym akwarium.", hint: "Najpierw oblicz objętość w cm³, potem zamień ją na litry.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość akwarium", unit: "cm³", answer: 20000 }, { id: "liters", label: "Pojemność akwarium", unit: "l", answer: 20 }], visual: "story", dimensions: [40, 25, 20], icon: "🐟" },
  { id: "story-3", prompt: "Kostka prezentowa ma krawędź długości 10 cm. Oblicz jej objętość i podaj, ile to mililitrów.", hint: "Najpierw wykonaj 10 · 10 · 10. Liczba cm³ i ml jest taka sama.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość kostki", unit: "cm³", answer: 1000 }, { id: "milliliters", label: "Pojemność", unit: "ml", answer: 1000 }], visual: "story", dimensions: [10, 10, 10], icon: "🎁" },
  { id: "story-4", prompt: "Pudełko ma wymiary 50 cm, 20 cm i 15 cm. Do środka wlewa się wodę. Ile litrów zmieści się w pudełku?", hint: "Oblicz najpierw objętość w cm³, a potem podziel przez 1000.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość pudełka", unit: "cm³", answer: 15000 }, { id: "liters", label: "Pojemność pudełka", unit: "l", answer: 15 }], visual: "story", dimensions: [50, 20, 15], icon: "📦" },
];

const CHALLENGE_TASKS: ReviewTask[] = [
  { id: "mission-1", prompt: "Pakujemy 24 jednakowe kostki o objętości 125 cm³ każda. Oblicz objętość całej paczki i zapisz ją w litrach.", hint: "Najpierw pomnóż 24 przez 125 cm³. Potem zamień cm³ na litry.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość paczki", unit: "cm³", answer: 3000 }, { id: "liters", label: "Objętość paczki", unit: "l", answer: 3 }], visual: "mission", dimensions: [5, 5, 5], icon: "🚚" },
  { id: "mission-2", prompt: "Prostopadłościenny pojemnik ma wymiary 30 cm, 20 cm i 20 cm. Rozlano z niego wodę do 8 jednakowych butelek. Ile mililitrów jest w każdej butelce?", hint: "Najpierw oblicz objętość pojemnika, potem zamień ją na ml i podziel przez 8.", success: "Dobrze!", fields: [{ id: "volume", label: "Objętość pojemnika", unit: "cm³", answer: 12000 }, { id: "bottle", label: "W jednej butelce", unit: "ml", answer: 1500 }], visual: "mission", dimensions: [30, 20, 20], icon: "🧃" },
  { id: "mission-3", prompt: "Sześcienne akwarium ma krawędź 20 cm. Jest napełnione do połowy. Ile litrów wody jest w akwarium?", hint: "Pełne akwarium ma objętość 20 · 20 · 20 cm³. Potem weź połowę i zamień na litry.", success: "Dobrze!", fields: [{ id: "full", label: "Objętość pełnego akwarium", unit: "cm³", answer: 8000 }, { id: "liters", label: "Woda do połowy", unit: "l", answer: 4 }], visual: "mission", dimensions: [20, 20, 20], icon: "🐠" },
  { id: "mission-4", prompt: "Do sześciennego pojemnika wlano 27 l wody. Jaka jest długość jego krawędzi w decymetrach?", hint: "27 l to 27 dm³. Szukaj liczby, która pomnożona przez siebie trzy razy daje 27.", success: "Dobrze!", fields: [{ id: "edge", label: "Długość krawędzi", unit: "dm", answer: 3 }], visual: "mission", dimensions: [3, 3, 3], icon: "🧊" },
];

function CuboidVisual({ dimensions, cube = false, layered = false, icon, unit = "cm" }: { dimensions: [number, number, number]; cube?: boolean; layered?: boolean; icon?: string; unit?: string }) {
  const [a, b, c] = dimensions;
  return (
    <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4">
      <svg role="img" aria-label={`Bryła o wymiarach ${a}, ${b} i ${c}`} viewBox="0 0 620 310" className="mx-auto block h-auto w-full max-w-3xl">
        <polygon points="160,110 390,110 490,55 260,55" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="5" strokeLinejoin="round" />
        <polygon points="390,110 490,55 490,220 390,275" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="5" strokeLinejoin="round" />
        <polygon points="160,110 390,110 390,275 160,275" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="5" strokeLinejoin="round" />
        {layered ? Array.from({ length: Math.min(c - 1, 4) }, (_, index) => <line key={index} x1="160" y1={110 + ((index + 1) * 165) / c} x2="390" y2={110 + ((index + 1) * 165) / c} stroke="#60a5fa" strokeWidth="3" strokeDasharray="8 7" />) : null}
        {icon ? <text x="70" y="70" className="text-[48px]">{icon}</text> : null}
      </svg>
      {layered ? <p className="mt-2 text-center font-black text-indigo-950">W jednej warstwie: {a} · {b} klocków. Liczba warstw: {c}.</p> : null}
      {cube ? <p className="mt-2 text-center font-black text-indigo-950">Sześcian: każda krawędź ma długość {a} {unit}.</p> : null}
      {!layered && !cube ? <p className="mt-2 text-center font-black text-indigo-950">Krawędzie: a = {a} {unit}, b = {b} {unit}, c = {c} {unit}.</p> : null}
    </div>
  );
}

function CapacityVisual({ fill = 65 }: { fill?: number }) {
  const waterY = 228 - fill * 1.5;
  return (
    <div className="rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-indigo-50 p-4">
      <svg role="img" aria-label="Pojemnik z wodą i podziałką w mililitrach" viewBox="0 0 500 280" className="mx-auto block h-auto w-full max-w-2xl">
        <defs><clipPath id="review-cup"><path d="M180 32h145l-15 210c-1 12-9 18-20 18h-75c-11 0-19-6-20-18z" /></clipPath></defs>
        <path d="M175 28h155l-16 218c-1 14-11 22-24 22h-75c-13 0-23-8-24-22z" fill="#ecfeff" stroke="#0369a1" strokeWidth="5" />
        <rect x="178" y={waterY} width="150" height={268 - waterY} fill="#38bdf8" clipPath="url(#review-cup)" opacity=".85" />
        <line x1="178" y1={waterY} x2="327" y2={waterY} stroke="#0369a1" strokeWidth="4" />
        {[0, 250, 500, 750, 1000].map((value) => { const y = 240 - (value / 1000) * 180; return <g key={value}><line x1="335" y1={y} x2="365" y2={y} stroke="#334155" strokeWidth="3" /><text x="378" y={y + 7} className="fill-slate-800 text-[17px] font-black">{value} ml</text></g>; })}
        <path d="M331 90c45 0 58 30 58 57s-18 52-58 52" fill="none" stroke="#0369a1" strokeWidth="8" strokeLinecap="round" />
        <text x="250" y="20" textAnchor="middle" className="fill-indigo-950 text-[24px] font-black">1 l = 1000 ml</text>
      </svg>
    </div>
  );
}

function TaskVisual({ task }: { task: ReviewTask }) {
  if (task.visual === "capacity") return <CapacityVisual fill={task.fill} />;
  if (!task.dimensions) return null;
  return <CuboidVisual dimensions={task.dimensions} cube={task.visual === "cube"} layered={task.visual === "layers"} icon={task.icon} unit={task.visualUnit} />;
}

function blankAnswers(task: ReviewTask) {
  return Object.fromEntries(task.fields.map((field) => [field.id, ""])) as Record<string, string>;
}

function parseAnswer(value: string) {
  if (!value.trim() || value === ",") return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function ReviewSeries({ tasks, heading, description, readOnly, onResultChange }: { tasks: ReviewTask[]; heading: string; description: string; readOnly: boolean; onResultChange?: VolumeReviewLabProps["onResultChange"] }) {
  const [index, setIndex] = useState(0);
  const [answersByTask, setAnswersByTask] = useState<Record<number, Record<string, string>>>(() => ({ 0: blankAnswers(tasks[0]!) }));
  const [activeField, setActiveField] = useState(tasks[0]!.fields[0]!.id);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;
  const answers = answersByTask[index] ?? blankAnswers(task);

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswersByTask((current) => {
      const currentTaskAnswers = current[index] ?? blankAnswers(task);
      const previous = currentTaskAnswers[activeField] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : key === "," ? previous.includes(",") ? previous : `${previous},` : `${previous}${key}`.slice(0, 8);
      return { ...current, [index]: { ...currentTaskAnswers, [activeField]: next } };
    });
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (task.fields.some((field) => parseAnswer(answers[field.id] ?? "") === null)) {
      setFeedback("Uzupełnij wszystkie kratki, a potem zatwierdź rozwiązanie.");
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    const correct = task.fields.every((field) => Math.abs((parseAnswer(answers[field.id] ?? "") ?? Number.NaN) - field.answer) < 0.000001);
    if (!correct) {
      setFeedback(`Jeszcze nie. ${task.hint}`);
      onResultChange?.(false, task.fields.map((field) => answers[field.id]).join(", "));
      return;
    }
    const last = index === tasks.length - 1;
    setSolved(true);
    setFeedback(last ? `${task.success} Cała seria jest ukończona.` : `${task.success} Za chwilę kolejne zadanie.`);
    if (last) { onResultChange?.(true, task.fields.map((field) => answers[field.id]).join(", ")); return; }
    onResultChange?.(null);
    timer.current = window.setTimeout(() => {
      const nextIndex = index + 1;
      const nextTask = tasks[nextIndex]!;
      setIndex(nextIndex);
      setAnswersByTask((current) => current[nextIndex] ? current : { ...current, [nextIndex]: blankAnswers(nextTask) });
      setActiveField(nextTask.fields[0]!.id);
      setFeedback(null);
      setSolved(false);
    }, 750);
  };

  return (
    <LessonTaskFrame eyebrow="Dział 8 · Powtórzenie" heading={heading} description={description} questionNumber={index + 1} questionCount={tasks.length} data-volume-review-series="true">
      <div className="space-y-5">
        <TaskVisual task={task} />
        <section className="rounded-3xl bg-amber-50 p-5 text-center">
          <p className="text-lg font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
          {task.detail ? <p className="mt-2 font-bold text-amber-800">{task.detail}</p> : null}
        </section>
        <div className={`grid gap-3 ${task.fields.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-xl"}`}>
          {task.fields.map((field) => <label key={field.id} className={`flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 text-center font-black ${activeField === field.id ? "border-violet-700 ring-4 ring-violet-100" : "border-slate-200"}`}>
            <span className="w-full text-sm text-slate-700 sm:text-base">{field.label}</span>
            <input aria-label={field.label} inputMode="none" readOnly value={answers[field.id] ?? ""} onFocus={() => setActiveField(field.id)} onClick={() => setActiveField(field.id)} className="h-14 w-32 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700" />
            {field.unit ? <span className="text-xl text-slate-950">{field.unit}</span> : null}
          </label>)}
        </div>
        <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={readOnly || solved} allowSeparator label="Kalkulator do powtórzenia objętości" helperText="Kliknij wybraną kratkę, wpisz liczbę z klawiatury i zatwierdź całe rozwiązanie." />
        {feedback ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
      </div>
    </LessonTaskFrame>
  );
}

export function volumeReviewActivityFromStageId(stageId: string): VolumeReviewActivity {
  if (stageId.endsWith("-s1")) return "unit-cubes";
  if (stageId.endsWith("-s2")) return "solid-volume";
  if (stageId.endsWith("-s3")) return "conversions";
  if (stageId.endsWith("-s4")) return "stories";
  return "challenge";
}

export function VolumeReviewLab({ activity, readOnly = false, onResultChange }: VolumeReviewLabProps) {
  if (activity === "unit-cubes") return <ReviewSeries key="volume-review-cubes" tasks={UNIT_CUBE_TASKS} heading="Bryły z kostek jednostkowych" description="Policz klocki w warstwie i liczbę warstw. Każdy klocek ma objętość 1 cm³." readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "solid-volume") return <ReviewSeries key="volume-review-solids" tasks={SOLID_VOLUME_TASKS} heading="Objętość sześcianu i prostopadłościanu" description="Samodzielnie dobierz wzór i oblicz objętość bryły." readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "conversions") return <ReviewSeries key="volume-review-conversions" tasks={CONVERSION_TASKS} heading="Litry, mililitry i jednostki objętości" description="Zamieniaj l, ml, cm³ i dm³. W razie potrzeby użyj przecinka." readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "stories") return <ReviewSeries key="volume-review-stories" tasks={STORY_TASKS} heading="Zadania z treścią" description="Odczytaj dane, oblicz objętość i zapisz pojemność w dobrej jednostce." readOnly={readOnly} onResultChange={onResultChange} />;
  return <ReviewSeries key="volume-review-challenge" tasks={CHALLENGE_TASKS} heading="Misja objętości" description="Rozwiąż wieloetapowe zadania: oblicz objętość, zamień jednostkę i wyciągnij wniosek." readOnly={readOnly} onResultChange={onResultChange} />;
}
