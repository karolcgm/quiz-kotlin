"use client";

import { useMemo, useState } from "react";
import { LessonTaskChoice } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { getCircleLessonActivity } from "@/lib/math/geometry/circles";
import type { GeometryLabMode } from "@/types/geometry";

interface CircleGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type CircleElement = "radius" | "diameter" | "chord";
type TangencyKind = "external" | "internal";

interface ChoiceTask {
  prompt: string;
  choices: readonly string[];
  answer: number;
  explanation: string;
}

interface TangencyTask {
  kind: TangencyKind;
  prompt: string;
  radiusA: number;
  radiusB: number;
  distance?: number;
  answer: number;
  unit: string;
  unknown: "distance" | "radiusA" | "radiusB";
}

const CHOICE_TASKS: readonly ChoiceTask[] = [
  {
    prompt: "Który opis dotyczy okręgu?",
    choices: ["Tylko linia brzegowa", "Linia brzegowa i całe wnętrze", "Tylko punkt S"],
    answer: 0,
    explanation: "Okrąg jest linią brzegową. Nie obejmuje wnętrza.",
  },
  {
    prompt: "Który opis dotyczy koła?",
    choices: ["Tylko środek", "Tylko linia brzegowa", "Linia brzegowa wraz z wnętrzem"],
    answer: 2,
    explanation: "Koło obejmuje okrąg i wszystkie punkty znajdujące się wewnątrz.",
  },
  {
    prompt: "Jak nazywa się odcinek łączący środek S z punktem okręgu?",
    choices: ["Promień", "Średnica", "Cięciwa"],
    answer: 0,
    explanation: "Taki odcinek jest promieniem i oznaczamy jego długość literą r.",
  },
  {
    prompt: "Który odcinek jest średnicą?",
    choices: ["Dowolny odcinek wewnątrz koła", "Cięciwa przechodząca przez środek S", "Odcinek od środka do okręgu"],
    answer: 1,
    explanation: "Średnica jest cięciwą przechodzącą przez środek. Ma długość 2 · r.",
  },
  {
    prompt: "Gdzie leżą końce cięciwy?",
    choices: ["Na okręgu", "W środku koła", "Jeden w środku, drugi na okręgu"],
    answer: 0,
    explanation: "Oba końce każdej cięciwy leżą na okręgu.",
  },
  {
    prompt: "Które zdanie jest prawdziwe?",
    choices: ["Każda cięciwa jest średnicą", "Każda średnica jest cięciwą", "Promień jest dwa razy dłuższy od średnicy"],
    answer: 1,
    explanation: "Każda średnica jest szczególną cięciwą, ale nie każda cięciwa przechodzi przez środek.",
  },
  {
    prompt: "Promień okręgu ma 6 cm. Jaką długość ma średnica?",
    choices: ["3 cm", "6 cm", "12 cm"],
    answer: 2,
    explanation: "Średnica ma długość dwóch promieni: 2 · 6 cm = 12 cm.",
  },
];

const TANGENCY_TASKS: readonly TangencyTask[] = [
  { kind: "external", prompt: "Promienie mają 4 cm i 7 cm. Oblicz odległość między środkami.", radiusA: 4, radiusB: 7, answer: 11, unit: "cm", unknown: "distance" },
  { kind: "external", prompt: "Środki są oddalone o 15 cm. Pierwszy promień ma 6 cm. Oblicz drugi promień.", radiusA: 6, radiusB: 9, distance: 15, answer: 9, unit: "cm", unknown: "radiusB" },
  { kind: "internal", prompt: "Promienie mają 12 cm i 5 cm. Oblicz odległość między środkami.", radiusA: 12, radiusB: 5, answer: 7, unit: "cm", unknown: "distance" },
  { kind: "internal", prompt: "Mniejszy promień ma 3 cm, a środki są oddalone o 8 cm. Oblicz większy promień.", radiusA: 11, radiusB: 3, distance: 8, answer: 11, unit: "cm", unknown: "radiusA" },
  { kind: "external", prompt: "Dwa jednakowe okręgi mają średnice po 10 cm. Oblicz odległość między środkami.", radiusA: 5, radiusB: 5, answer: 10, unit: "cm", unknown: "distance" },
  { kind: "internal", prompt: "Większy okrąg ma średnicę 20 cm, a mniejszy promień 4 cm. Oblicz odległość między środkami.", radiusA: 10, radiusB: 4, answer: 6, unit: "cm", unknown: "distance" },
  { kind: "external", prompt: "Promienie mają 18 mm i 12 mm. Oblicz długość odcinka łączącego środki.", radiusA: 18, radiusB: 12, answer: 30, unit: "mm", unknown: "distance" },
  { kind: "internal", prompt: "Większy promień ma 14 m, a środki są oddalone o 9 m. Oblicz mniejszy promień.", radiusA: 14, radiusB: 5, distance: 9, answer: 5, unit: "m", unknown: "radiusB" },
];

function CircleShape({ filled, element }: { filled: boolean; element?: CircleElement }) {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label={filled ? "Koło o środku S i promieniu r" : "Okrąg o środku S i promieniu r"} className="mx-auto w-full max-w-2xl">
      <defs>
        <radialGradient id="circle-fill">
          <stop offset="0" stopColor="#bae6fd" stopOpacity=".9" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity=".45" />
        </radialGradient>
      </defs>
      <circle cx="260" cy="150" r="112" fill={filled ? "url(#circle-fill)" : "white"} stroke="#2563eb" strokeWidth="6" />
      <circle cx="260" cy="150" r="7" fill="#1e293b" />
      <text x="273" y="145" fontSize="22" fontWeight="800" fill="#172554">S</text>
      <line x1="260" y1="150" x2="353" y2="87" stroke={element === "radius" || !element ? "#e11d48" : "#94a3b8"} strokeWidth="6" strokeLinecap="round" />
      <text x="311" y="105" fontSize="22" fontWeight="800" fill="#be123c">r</text>
      {element === "diameter" ? (
        <>
          <line x1="148" y1="150" x2="372" y2="150" stroke="#7c3aed" strokeWidth="7" strokeLinecap="round" />
          <circle cx="148" cy="150" r="6" fill="#7c3aed" /><circle cx="372" cy="150" r="6" fill="#7c3aed" />
          <text x="245" y="185" fontSize="22" fontWeight="900" fill="#6d28d9">d</text>
        </>
      ) : null}
      {element === "chord" ? (
        <>
          <line x1="174" y1="78" x2="355" y2="204" stroke="#0f766e" strokeWidth="7" strokeLinecap="round" />
          <circle cx="174" cy="78" r="6" fill="#0f766e" /><circle cx="355" cy="204" r="6" fill="#0f766e" />
        </>
      ) : null}
    </svg>
  );
}

function ConceptLesson() {
  const [filled, setFilled] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-3">
        <LessonTaskChoice selected={!filled} onClick={() => setFilled(false)}>Okrąg</LessonTaskChoice>
        <LessonTaskChoice selected={filled} onClick={() => setFilled(true)}>Koło</LessonTaskChoice>
      </div>
      <CircleShape filled={filled} />
      <div className="grid gap-3 md:grid-cols-2">
        <article className={`rounded-2xl border-2 p-4 ${!filled ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}>
          <h3 className="text-xl font-black text-blue-900">Okrąg</h3>
          <p className="mt-2 font-semibold">Okrąg o środku w punkcie S i promieniu r to linia złożona z punktów oddalonych od S o r.</p>
        </article>
        <article className={`rounded-2xl border-2 p-4 ${filled ? "border-cyan-500 bg-cyan-50" : "border-slate-200 bg-white"}`}>
          <h3 className="text-xl font-black text-cyan-900">Koło</h3>
          <p className="mt-2 font-semibold">Koło to okrąg razem z całym jego wnętrzem.</p>
        </article>
      </div>
      <p className="rounded-2xl bg-amber-100 p-4 text-center text-lg font-black text-amber-950">Okrąg jest brzegiem. Koło to brzeg i wnętrze.</p>
    </div>
  );
}

function ElementsLesson() {
  const [element, setElement] = useState<CircleElement>("radius");
  const descriptions: Record<CircleElement, string> = {
    radius: "Promień łączy środek S z dowolnym punktem okręgu.",
    diameter: "Średnica jest cięciwą przechodzącą przez środek S. Jej długość to 2 · r.",
    chord: "Cięciwa łączy dwa punkty leżące na okręgu.",
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-center gap-3">
        {(["radius", "diameter", "chord"] as const).map((value) => (
          <LessonTaskChoice key={value} selected={element === value} onClick={() => setElement(value)}>
            {{ radius: "Promień", diameter: "Średnica", chord: "Cięciwa" }[value]}
          </LessonTaskChoice>
        ))}
      </div>
      <CircleShape filled element={element} />
      <p className="rounded-2xl bg-indigo-50 p-4 text-center text-lg font-black text-indigo-950">{descriptions[element]}</p>
    </div>
  );
}

function KnowledgeQuiz({ readOnly, onResultChange }: Pick<CircleGeometryLabProps, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const task = CHOICE_TASKS[index];

  const next = () => {
    if (index === CHOICE_TASKS.length - 1) return;
    setIndex((value) => value + 1);
    setSelected(null);
    setFeedback(null);
    onResultChange?.(null);
  };

  const confirm = () => {
    if (selected === null) {
      setFeedback({ correct: false, text: "Wybierz jedną odpowiedź przed zatwierdzeniem." });
      return;
    }
    const correct = selected === task.answer;
    setFeedback({ correct, text: correct ? `Dobrze. ${task.explanation}` : `Jeszcze nie. ${task.explanation}` });
    onResultChange?.(correct, task.choices[selected]);
    if (correct && index < CHOICE_TASKS.length - 1) window.setTimeout(next, 500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <b className="text-lg text-indigo-950">Pytanie {index + 1} z {CHOICE_TASKS.length}</b>
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-black text-cyan-950">A, B albo C</span>
      </div>
      <div className="rounded-2xl bg-slate-50 p-5">
        <p className="text-xl font-black text-slate-950">{task.prompt}</p>
        <div className="mt-4 grid gap-3">
          {task.choices.map((choice, choiceIndex) => (
            <LessonTaskChoice key={choice} selected={selected === choiceIndex} disabled={readOnly || feedback?.correct} onClick={() => { setSelected(choiceIndex); setFeedback(null); }}>
              {String.fromCharCode(65 + choiceIndex)}. {choice}
            </LessonTaskChoice>
          ))}
        </div>
      </div>
      {feedback ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${feedback.correct ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{feedback.text}</p> : null}
      <button type="button" disabled={readOnly || feedback?.correct} onClick={confirm} className="min-h-12 w-full rounded-2xl bg-violet-700 px-5 font-black text-white disabled:opacity-40">
        Zatwierdź odpowiedź
      </button>
      {feedback && !feedback.correct && selected !== null && index < CHOICE_TASKS.length - 1 ? (
        <button type="button" onClick={next} className="min-h-11 w-full rounded-2xl border-2 border-violet-400 bg-white font-black text-violet-950">Przejdź dalej bez punktu</button>
      ) : null}
    </div>
  );
}

function TangencyDiagram({ kind, radiusA, radiusB }: { kind: TangencyKind; radiusA: number; radiusB: number }) {
  const maxRadius = Math.max(radiusA, radiusB);
  const scale = 112 / maxRadius;
  const largeR = radiusA * scale;
  const smallR = radiusB * scale;
  const x1 = kind === "external" ? 165 : 255;
  const x2 = kind === "external" ? x1 + largeR + smallR : x1 + largeR - smallR;
  const tangentX = kind === "external" ? x1 + largeR : x1 + largeR;
  return (
    <svg viewBox="0 0 560 300" role="img" aria-label={kind === "external" ? "Dwa okręgi styczne zewnętrznie" : "Dwa okręgi styczne wewnętrznie"} className="mx-auto w-full max-w-2xl">
      <line x1={x1} y1="150" x2={x2} y2="150" stroke="#64748b" strokeWidth="4" strokeDasharray="9 8" />
      <circle cx={x1} cy="150" r={largeR} fill="#dbeafe" fillOpacity=".75" stroke="#2563eb" strokeWidth="6" />
      <circle cx={x2} cy="150" r={smallR} fill="#fce7f3" fillOpacity=".75" stroke="#db2777" strokeWidth="6" />
      <circle cx={x1} cy="150" r="6" fill="#172554" /><circle cx={x2} cy="150" r="6" fill="#831843" />
      <text x={x1 - 12} y="179" fontSize="20" fontWeight="900">S₁</text>
      <text x={x2 - 12} y="179" fontSize="20" fontWeight="900">S₂</text>
      <circle cx={tangentX} cy="150" r="8" fill="#f97316" />
      <text x={tangentX - 8} y="126" fontSize="18" fontWeight="900" fill="#9a3412">T</text>
      <text x={(x1 + x2) / 2 - 12} y="137" fontSize="18" fontWeight="900" fill="#334155">?</text>
    </svg>
  );
}

function TangencyRuleLesson() {
  const [kind, setKind] = useState<TangencyKind>("external");
  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-3">
        <LessonTaskChoice selected={kind === "external"} onClick={() => setKind("external")}>Styczność zewnętrzna</LessonTaskChoice>
        <LessonTaskChoice selected={kind === "internal"} onClick={() => setKind("internal")}>Styczność wewnętrzna</LessonTaskChoice>
      </div>
      <TangencyDiagram kind={kind} radiusA={kind === "external" ? 7 : 10} radiusB={4} />
      {kind === "external" ? (
        <div className="rounded-2xl bg-blue-50 p-5 text-center">
          <p className="text-lg font-bold">Okręgi leżą na zewnątrz siebie i mają jeden punkt wspólny T.</p>
          <p className="mt-2 text-2xl font-black text-blue-950">S₁S₂ = r₁ + r₂</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-pink-50 p-5 text-center">
          <p className="text-lg font-bold">Mniejszy okrąg leży wewnątrz większego i mają jeden punkt wspólny T.</p>
          <p className="mt-2 text-2xl font-black text-pink-950">S₁S₂ = R − r</p>
        </div>
      )}
    </div>
  );
}

function TangencyTasks({ readOnly, onResultChange }: Pick<CircleGeometryLabProps, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const task = TANGENCY_TASKS[index];
  const distance = task.distance ?? (task.kind === "external" ? task.radiusA + task.radiusB : task.radiusA - task.radiusB);

  const next = () => {
    if (index === TANGENCY_TASKS.length - 1) return;
    setIndex((value) => value + 1);
    setAnswer("");
    setFeedback(null);
    onResultChange?.(null);
  };
  const confirm = () => {
    if (!answer) {
      setFeedback({ correct: false, text: "Uzupełnij wynik przed zatwierdzeniem." });
      return;
    }
    const correct = Number(answer) === task.answer;
    const rule = task.kind === "external" ? "Przy styczności zewnętrznej dodajemy promienie." : "Przy styczności wewnętrznej odejmujemy promienie.";
    setFeedback({ correct, text: correct ? `Dobrze. ${rule}` : `To nie jest poprawny wynik. ${rule}` });
    onResultChange?.(correct, answer);
    if (correct && index < TANGENCY_TASKS.length - 1) window.setTimeout(next, 500);
  };
  const handleKey = (key: string) => {
    if (key === "backspace") setAnswer((value) => value.slice(0, -1));
    else if (/^\d$/.test(key) && answer.length < 3) setAnswer((value) => `${value}${key}`);
    setFeedback(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <b className="text-lg text-indigo-950">Zadanie {index + 1} z {TANGENCY_TASKS.length}</b>
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-black text-cyan-950">{task.kind === "external" ? "styczność zewnętrzna" : "styczność wewnętrzna"}</span>
      </div>
      <p className="rounded-2xl bg-slate-50 p-4 text-center text-xl font-black">{task.prompt}</p>
      <TangencyDiagram kind={task.kind} radiusA={task.radiusA} radiusB={task.radiusB} />
      <div className="grid gap-3 rounded-2xl bg-indigo-50 p-4 text-center sm:grid-cols-3">
        <p><b>r₁</b><br />{task.unknown === "radiusA" ? "?" : `${task.radiusA} ${task.unit}`}</p>
        <p><b>r₂</b><br />{task.unknown === "radiusB" ? "?" : `${task.radiusB} ${task.unit}`}</p>
        <p><b>S₁S₂</b><br />{task.unknown === "distance" ? "?" : `${distance} ${task.unit}`}</p>
      </div>
      <label className="flex items-center justify-center gap-3 text-lg font-black">
        Wynik:
        <input aria-label="Wynik zadania" value={answer} inputMode="none" readOnly className="h-14 w-24 rounded-xl border-2 border-violet-400 bg-white text-center text-2xl font-black" />
        {task.unit}
      </label>
      {feedback ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${feedback.correct ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{feedback.text}</p> : null}
      <LessonNumericKeypad onKey={handleKey} onConfirm={confirm} disabled={readOnly || feedback?.correct} label="Klawiatura do obliczeń" helperText="Wpisz wynik i zatwierdź." />
      {feedback && !feedback.correct && answer && index < TANGENCY_TASKS.length - 1 ? (
        <button type="button" onClick={next} className="min-h-11 w-full rounded-2xl border-2 border-violet-400 bg-white font-black text-violet-950">Przejdź dalej bez punktu</button>
      ) : null}
    </div>
  );
}

export function CircleGeometryLab({ seed, readOnly = false, onResultChange }: CircleGeometryLabProps) {
  const activity = useMemo(() => getCircleLessonActivity(seed), [seed]);
  if (activity === "circleAndDisk") return <ConceptLesson />;
  if (activity === "elements") return <ElementsLesson />;
  if (activity === "knowledgeQuiz") return <KnowledgeQuiz readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "tangencyRule") return <TangencyRuleLesson />;
  return <TangencyTasks readOnly={readOnly} onResultChange={onResultChange} />;
}
