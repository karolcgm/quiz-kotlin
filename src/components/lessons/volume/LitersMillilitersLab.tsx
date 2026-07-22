"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export type LitersMillilitersActivity = "meaning" | "measuring-cup" | "conversions" | "practical-tasks";

interface LitersMillilitersLabProps {
  activity: LitersMillilitersActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

interface ConversionTask {
  id: string;
  expression: string;
  targetUnit: string;
  answer: number;
  hint: string;
}

interface PracticalTask extends ConversionTask {
  title: string;
  visual: "jug" | "ice" | "aquarium" | "bottles";
  story: string;
}

const CONVERSION_TASKS: ConversionTask[] = [
  { id: "conversion-1", expression: "1 dm³ =", targetUnit: "l", answer: 1, hint: "Jeden litr to dokładnie jeden decymetr sześcienny." },
  { id: "conversion-2", expression: "1 cm³ =", targetUnit: "ml", answer: 1, hint: "Jeden mililitr to dokładnie jeden centymetr sześcienny." },
  { id: "conversion-3", expression: "500 ml =", targetUnit: "cm³", answer: 500, hint: "Liczba mililitrów i centymetrów sześciennych jest taka sama." },
  { id: "conversion-4", expression: "2 l =", targetUnit: "dm³", answer: 2, hint: "Litry i decymetry sześcienne mają tę samą liczbę." },
  { id: "conversion-5", expression: "750 ml =", targetUnit: "l", answer: 0.75, hint: "1000 ml to 1 l. 750 ml to trzy czwarte litra." },
  { id: "conversion-6", expression: "1,5 l =", targetUnit: "ml", answer: 1500, hint: "Jeden litr to 1000 ml, więc pół litra to 500 ml." },
  { id: "conversion-7", expression: "250 ml =", targetUnit: "cm³", answer: 250, hint: "Mililitry i centymetry sześcienne odpowiadają sobie jeden do jednego." },
  { id: "conversion-8", expression: "2000 cm³ =", targetUnit: "l", answer: 2, hint: "1000 cm³ to 1 l." },
  { id: "conversion-9", expression: "0,6 l =", targetUnit: "ml", answer: 600, hint: "0,6 litra to sześć setek mililitrów." },
  { id: "conversion-10", expression: "3 dm³ =", targetUnit: "l", answer: 3, hint: "Decymetr sześcienny i litr oznaczają tę samą pojemność." },
];

const PRACTICAL_TASKS: PracticalTask[] = [
  {
    id: "practical-1", title: "Dzbanek z wodą", visual: "jug", expression: "1000 ml − 650 ml =", targetUnit: "ml", answer: 350,
    story: "Dzbanek ma pojemność 1 l. Wlano do niego 650 ml wody. Ile mililitrów wody brakuje do pełna?",
    hint: "1 l = 1000 ml. Oblicz, ile brakuje do 1000 ml.",
  },
  {
    id: "practical-2", title: "Foremka do lodu", visual: "ice", expression: "12 · 20 ml =", targetUnit: "ml", answer: 240,
    story: "Foremka ma 12 jednakowych miejsc. Do każdego wlewa się 20 ml wody. Ile mililitrów wody mieści cała foremka?",
    hint: "Jest 12 takich samych miejsc po 20 ml.",
  },
  {
    id: "practical-3", title: "Małe akwarium", visual: "aquarium", expression: "1000 cm³ =", targetUnit: "l", answer: 1,
    story: "W małym akwarium mieści się 1000 cm³ wody. Ile to litrów?",
    hint: "Pamiętaj: 1 l = 1000 cm³.",
  },
  {
    id: "practical-4", title: "Butelki na wycieczkę", visual: "bottles", expression: "2 l : 4 =", targetUnit: "ml", answer: 500,
    story: "Do czterech jednakowych butelek rozlano równo 2 l soku. Ile mililitrów soku jest w każdej butelce?",
    hint: "Najpierw zamień 2 l na mililitry, a potem podziel przez 4.",
  },
];

function toLiters(value: number) {
  const formatted = (value / 1000).toFixed(2).replace(".", ",").replace(/,00$/u, "").replace(/0$/u, "");
  return `${formatted} l`;
}

function UnitCube({ volumeLabel, sideLabel }: { volumeLabel: string; sideLabel: string }) {
  return (
    <div className="rounded-3xl border-2 border-sky-200 bg-white p-4 text-center shadow-sm">
      <svg viewBox="0 0 150 115" className="mx-auto h-28 w-full max-w-40" role="img" aria-label={`Sześcian o objętości ${volumeLabel}`}>
        <polygon points="31,38 87,38 115,21 59,21" fill="#c4f1fa" stroke="#0369a1" strokeWidth="3" />
        <polygon points="87,38 87,95 115,78 115,21" fill="#93e5f4" stroke="#0369a1" strokeWidth="3" />
        <rect x="31" y="38" width="56" height="57" fill="#e0f2fe" stroke="#0369a1" strokeWidth="3" />
      </svg>
      <p className="mt-1 text-2xl font-black text-indigo-950">{volumeLabel}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">krawędź: {sideLabel}</p>
    </div>
  );
}

function VolumeToCapacityAnimation() {
  const [filled, setFilled] = useState(false);
  const cubes = Array.from({ length: 12 }, (_, index) => ({
    index,
    startX: 166 + (index % 4) * 19,
    startY: 137 + Math.floor(index / 4) * 18,
    endX: 432 + (index % 4) * 32,
    endY: 175 + Math.floor(index / 4) * 22,
  }));

  return (
    <section className="space-y-4 rounded-3xl bg-gradient-to-r from-cyan-50 via-white to-indigo-50 p-5 text-center">
      <svg viewBox="0 0 720 280" className="mx-auto block h-auto w-full max-w-4xl" role="img" aria-label={filled ? "Symboliczne kosteczki po 1 mililitrze wypełniają dzbanek o pojemności 1 litra" : "Jedna kosteczka ma objętość 1 centymetra sześciennego, czyli 1 mililitra"}>
        <defs>
          <linearGradient id="cube-top" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#cffafe" /><stop offset="1" stopColor="#67e8f9" /></linearGradient>
          <linearGradient id="cup-water" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#67e8f9" /><stop offset="1" stopColor="#0284c7" /></linearGradient>
          <clipPath id="liter-cup-clip"><path d="M479 43h132l-12 185c-1 13-10 20-23 20h-62c-13 0-22-7-23-20z" /></clipPath>
        </defs>
        <text x="180" y="35" textAnchor="middle" className="fill-indigo-950 text-[23px] font-black">jedna mała kosteczka</text>
        <polygon points="105,115 202,115 247,87 150,87" fill="url(#cube-top)" stroke="#0369a1" strokeWidth="4" />
        <polygon points="202,115 202,204 247,176 247,87" fill="#67e8f9" stroke="#0369a1" strokeWidth="4" />
        <rect x="105" y="115" width="97" height="89" fill="#e0f2fe" stroke="#0369a1" strokeWidth="4" />
        <text x="153" y="164" textAnchor="middle" className="fill-indigo-950 text-[26px] font-black">1 cm³</text>
        <text x="180" y="238" textAnchor="middle" className="fill-slate-700 text-[20px] font-black">to dokładnie 1 ml</text>
        <path d="M282 145h112" stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" />
        <path d="M394 145l-18-12v24z" fill="#4f46e5" />
        <text x="338" y="122" textAnchor="middle" className="fill-indigo-700 text-[18px] font-black">1000 takich kosteczek</text>
        <path d="M474 39h142l-14 192c-1 16-12 25-27 25h-60c-15 0-26-9-27-25z" fill="#ecfeff" stroke="#075985" strokeWidth="5" />
        <rect x="476" y={filled ? 71 : 224} width="140" height={filled ? 165 : 20} fill="url(#cup-water)" clipPath="url(#liter-cup-clip)" style={{ transition: "y 850ms ease-out, height 850ms ease-out" }} opacity=".85" />
        <line x1="478" y1={filled ? 71 : 224} x2="612" y2={filled ? 71 : 224} stroke="#0369a1" strokeWidth="4" style={{ transition: "y 850ms ease-out" }} />
        <path d="M618 85c36 0 48 26 48 51s-17 48-48 48" fill="none" stroke="#075985" strokeWidth="8" strokeLinecap="round" />
        <text x="545" y="35" textAnchor="middle" className="fill-indigo-950 text-[23px] font-black">dzbanek o pojemności 1 l</text>
        <text x="545" y="155" textAnchor="middle" className="fill-indigo-950 text-[28px] font-black">{filled ? "1 l" : "0 ml"}</text>
        {cubes.map((cube) => (
          <rect
            key={cube.index}
            x={cube.startX}
            y={cube.startY}
            width="14"
            height="14"
            rx="3"
            fill="#06b6d4"
            stroke="#0e7490"
            strokeWidth="1.5"
            style={{
              transform: filled ? `translate(${cube.endX - cube.startX}px, ${cube.endY - cube.startY}px)` : "translate(0, 0)",
              transition: `transform 620ms ease-in ${cube.index * 45}ms, opacity 300ms ease-in ${cube.index * 45}ms`,
              opacity: filled ? 0.55 : 1,
            }}
          />
        ))}
      </svg>
      <button type="button" onClick={() => setFilled((current) => !current)} className="rounded-2xl bg-indigo-700 px-5 py-3 text-lg font-black text-white shadow-sm transition hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-200">
        {filled ? "Pokaż ponownie kosteczki" : "Napełnij dzbanek kosteczkami"}
      </button>
      <p className="mx-auto max-w-3xl text-lg font-black leading-relaxed text-slate-800">Jedna kosteczka ma objętość <span className="text-sky-800">1 cm³</span>, więc odpowiada <span className="text-sky-800">1 ml</span>. Tysiąc takich kosteczek wypełnia 1 litr.</p>
    </section>
  );
}

function MeaningSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 8 · Temat 3" heading="Objętość, litry i mililitry" description="Objętość mówi, ile miejsca jest wewnątrz bryły. Pojemność mówi, ile płynu może zmieścić się w naczyniu.">
      <div className="space-y-5">
        <VolumeToCapacityAnimation />
        <section className="grid gap-4 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm"><div className="mx-auto max-w-xs"><UnitCube volumeLabel="1 cm³" sideLabel="1 cm" /></div><p className="mt-3 font-bold leading-relaxed text-slate-800">Tyle miejsca odpowiada dokładnie 1 ml płynu.</p></div>
          <div className="self-center rounded-2xl bg-indigo-100 px-5 py-4 text-center text-lg font-black leading-relaxed text-indigo-950"><p>1 dm³ = 1 l</p><p className="mt-3">1000 ml = 1 l</p></div>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function MeasuringCup({ value }: { value: number }) {
  const fillTop = 235 - value * 0.18;
  const ticks = Array.from({ length: 11 }, (_, index) => index * 100);
  return (
    <svg viewBox="0 0 360 290" className="mx-auto block h-auto w-full max-w-lg" role="img" aria-label={`Miarka z ${value} mililitrami płynu`}>
      <defs>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#67e8f9" /><stop offset="1" stopColor="#0284c7" /></linearGradient>
        <clipPath id="cup-clip"><path d="M89 39h146l-14 200c-1 10-8 16-18 16h-82c-10 0-17-6-18-16z" /></clipPath>
      </defs>
      <path d="M84 33h156l-15 208c-1 13-10 20-22 20h-82c-12 0-21-7-22-20z" fill="#ecfeff" stroke="#075985" strokeWidth="4" />
      <rect x="88" y={fillTop} width="148" height={255 - fillTop} fill="url(#water)" clipPath="url(#cup-clip)" opacity=".85" />
      <line x1="86" y1={fillTop} x2="236" y2={fillTop} stroke="#0369a1" strokeWidth="3" />
      {ticks.map((tick) => {
        const y = 235 - tick * 0.18;
        const major = tick % 200 === 0;
        return <g key={tick}><line x1="248" y1={y} x2={major ? 282 : 270} y2={y} stroke="#0f172a" strokeWidth={major ? "2.5" : "1.5"} />{major ? <text x="290" y={y + 5} className="fill-slate-900 text-[14px] font-black">{tick}</text> : null}</g>;
      })}
      <text x="270" y="24" textAnchor="middle" className="fill-slate-900 text-[15px] font-black">ml</text>
      <path d="M242 78c29 0 40 22 40 43s-14 38-40 38" fill="none" stroke="#075985" strokeWidth="6" strokeLinecap="round" />
      <text x="160" y="155" textAnchor="middle" className="fill-slate-950 text-[32px] font-black">{value} ml</text>
    </svg>
  );
}

function MeasuringCupSlide({ readOnly }: { readOnly: boolean }) {
  const [value, setValue] = useState(500);
  return (
    <LessonTaskFrame eyebrow="Dział 8 · Temat 3" heading="Odczytaj pojemność z miarki" description="Przesuwaj suwak. Poziom wody i wynik zmieniają się razem — objętość w cm³ odpowiada liczbie mililitrów.">
      <div className="space-y-6">
        <section className="rounded-3xl bg-cyan-50 p-4"><MeasuringCup value={value} /></section>
        <section className="mx-auto max-w-3xl space-y-5 rounded-3xl bg-indigo-50 p-5">
          <label className="block text-lg font-black text-indigo-950">Ile wody wlać? <span className="text-2xl">{value} ml</span>
            <input aria-label="Ilość wody w miarce" type="range" min="0" max="1000" step="50" value={value} disabled={readOnly} onChange={(event) => setValue(Number(event.target.value))} className="mt-3 w-full accent-indigo-700" />
          </label>
          <div className="rounded-3xl bg-white p-5 text-center shadow-sm" aria-live="polite">
            <p className="text-3xl font-black text-indigo-950">{value} ml = {value} cm<sup>3</sup></p>
            <p className="mt-2 text-3xl font-black text-emerald-700">{toLiters(value)}</p>
          </div>
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center font-bold leading-relaxed text-amber-950">Kreska 1000 ml oznacza pełny litr. Kreska 500 ml oznacza pół litra.</p>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function Feedback({ text, solved }: { text: string | null; solved: boolean }) {
  return text ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{text}</p> : null;
}

function NumericSeries({ tasks, title, description, mode, readOnly, onResultChange }: { tasks: ConversionTask[]; title: string; description: string; mode: "conversion" | "practical"; readOnly: boolean; onResultChange?: LitersMillilitersLabProps["onResultChange"] }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`.slice(0, 6));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (!answer) {
      setFeedback("Wpisz wynik z klawiatury ekranowej.");
      return;
    }
    if (Number(answer.replace(",", ".")) !== task.answer) {
      setFeedback(task.hint);
      onResultChange?.(false, answer);
      return;
    }
    const last = index === tasks.length - 1;
    setSolved(true);
    setFeedback(last ? `Brawo! ${task.expression} ${task.answer.toString().replace(".", ",")} ${task.targetUnit}. Cała seria jest ukończona.` : `Dobrze! ${task.answer.toString().replace(".", ",")} ${task.targetUnit}. Za chwilę kolejne zadanie.`);
    onResultChange?.(last ? true : null, `${task.answer} ${task.targetUnit}`);
    if (!last) {
      timer.current = window.setTimeout(() => {
        setIndex((current) => current + 1);
        setAnswer("");
        setFeedback(null);
        setSolved(false);
        onResultChange?.(null);
      }, 750);
    }
  };

  const practical = mode === "practical" ? task as PracticalTask : null;
  return (
    <LessonTaskFrame eyebrow="Dział 8 · Temat 3" heading={title} description={description} questionNumber={index + 1} questionCount={tasks.length} data-liters-series={mode}>
      <div className="space-y-5">
        {practical ? <PracticalVisual task={practical} /> : (
          <section className="grid gap-3 rounded-3xl bg-gradient-to-r from-cyan-50 via-white to-indigo-50 p-5 text-center sm:grid-cols-2">
            <p className="rounded-2xl bg-white px-4 py-4 text-2xl font-black text-sky-800 shadow-sm">1 l = 1 dm<sup>3</sup></p>
            <p className="rounded-2xl bg-white px-4 py-4 text-2xl font-black text-indigo-800 shadow-sm">1 ml = 1 cm<sup>3</sup></p>
          </section>
        )}
        <section className="rounded-3xl bg-indigo-50 p-5 text-center">
          {practical ? <><p className="text-sm font-black uppercase tracking-[.16em] text-indigo-700">{practical.title}</p><p className="mt-3 text-xl font-black leading-relaxed text-slate-950">{practical.story}</p></> : <p className="text-3xl font-black text-indigo-950">{task.expression} <span className="inline-flex items-center gap-2"><input aria-label="Wynik zamiany" inputMode="none" readOnly value={answer} className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none" /> {task.targetUnit}</span></p>}
          {practical ? <p className="mt-4 text-3xl font-black text-indigo-950">{task.expression} <span className="inline-flex items-center gap-2"><input aria-label="Wynik zadania tekstowego" inputMode="none" readOnly value={answer} className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none" /> {task.targetUnit}</span></p> : null}
        </section>
        <LessonNumericKeypad onKey={onKey} onConfirm={check} allowSeparator disabled={readOnly || solved} label="Kalkulator do objętości i pojemności" helperText="Wpisz wynik. Użyj przecinka, gdy wynik jest liczbą dziesiętną." />
        <Feedback text={feedback} solved={solved} />
      </div>
    </LessonTaskFrame>
  );
}

function PracticalVisual({ task }: { task: PracticalTask }) {
  const content: Record<PracticalTask["visual"], ReactNode> = {
    jug: <><path d="M72 35h130v20h15v170c0 14-10 23-25 23H82c-15 0-25-9-25-23V55h15z" fill="#e0f2fe" stroke="#0369a1" strokeWidth="4" /><path d="M59 112h156v113c0 13-10 21-23 21H82c-13 0-23-8-23-21z" fill="#67e8f9" opacity=".85" /><path d="M217 82c45 0 55 30 55 56s-20 51-55 51" fill="none" stroke="#0369a1" strokeWidth="8" /></>,
    ice: <><rect x="45" y="55" width="230" height="150" rx="20" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="4" />{Array.from({ length: 12 }, (_, index) => <rect key={index} x={60 + (index % 4) * 52} y={72 + Math.floor(index / 4) * 42} width="38" height="29" rx="7" fill="#93c5fd" stroke="#2563eb" strokeWidth="2" />)}</>,
    aquarium: <><rect x="43" y="58" width="242" height="145" fill="#e0f2fe" stroke="#0369a1" strokeWidth="5" /><path d="M48 126h232v72H48z" fill="#67e8f9" opacity=".8" /><path d="M97 153c14-16 28-16 42 0-14 16-28 16-42 0m106 20c13-14 26-14 39 0-13 14-26 14-39 0" fill="#facc15" stroke="#a16207" strokeWidth="3" /></>,
    bottles: <>{[70, 130, 190, 250].map((x) => <g key={x}><rect x={x} y="70" width="38" height="128" rx="12" fill="#e0f2fe" stroke="#0369a1" strokeWidth="4" /><rect x={x + 9} y="45" width="20" height="26" rx="4" fill="#bae6fd" stroke="#0369a1" strokeWidth="3" /><rect x={x + 3} y="134" width="32" height="60" rx="8" fill="#67e8f9" opacity=".8" /></g>)}</>,
  };
  return <svg viewBox="0 0 330 280" className="mx-auto block h-auto w-full max-w-md rounded-3xl bg-gradient-to-br from-cyan-50 to-indigo-50 p-4" role="img" aria-label={`Ilustracja: ${task.title}`}>{content[task.visual]}</svg>;
}

export function litersMillilitersActivityFromStageId(stageId: string): LitersMillilitersActivity {
  if (stageId.endsWith("-s1")) return "meaning";
  if (stageId.endsWith("-s2")) return "measuring-cup";
  if (stageId.endsWith("-s3")) return "conversions";
  return "practical-tasks";
}

export function LitersMillilitersLab({ activity, readOnly = false, onResultChange }: LitersMillilitersLabProps) {
  if (activity === "meaning") return <MeaningSlide />;
  if (activity === "measuring-cup") return <MeasuringCupSlide readOnly={readOnly} />;
  if (activity === "conversions") return <NumericSeries tasks={CONVERSION_TASKS} title="Zamieniaj litry i mililitry" description="Zastosuj zależności między litrami, mililitrami i objętością bryły. Rozwiąż całą serię na tym samym slajdzie." mode="conversion" readOnly={readOnly} onResultChange={onResultChange} />;
  return <NumericSeries tasks={PRACTICAL_TASKS} title="Pojemność w sytuacjach codziennych" description="Przeczytaj zadanie, dobierz działanie i zapisz wynik w podanej jednostce." mode="practical" readOnly={readOnly} onResultChange={onResultChange} />;
}
