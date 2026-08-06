"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export type PyramidActivity = "explore" | "identify" | "counts" | "nets" | "area";

export function pyramidActivityFromStageId(stageId: string): PyramidActivity {
  if (stageId.includes("identify")) return "identify";
  if (stageId.includes("counts")) return "counts";
  if (stageId.includes("nets")) return "nets";
  if (stageId.includes("area")) return "area";
  return "explore";
}

type Highlight = "all" | "base" | "lateral" | "edges" | "apex";
type RecognitionSolid = "pyramid" | "cuboid" | "cone" | "cylinder";

const PYRAMID_NAMES: Record<number, string> = {
  3: "ostrosłup trójkątny",
  4: "ostrosłup czworokątny",
  5: "ostrosłup pięciokątny",
  6: "ostrosłup sześciokątny",
};

function regularBase(sides: number, radius = 1.35) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return new THREE.Vector3(Math.cos(angle) * radius, -1.15, Math.sin(angle) * radius);
  });
}

function triangleGeometry(triangles: readonly (readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3])[]) {
  const values = triangles.flatMap((triangle) => triangle.flatMap((point) => [point.x, point.y, point.z]));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function pyramidGeometry(sides: number, apexShift = 0) {
  const base = regularBase(sides);
  const apex = new THREE.Vector3(apexShift, 1.55, 0);
  const baseFaces: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [];
  for (let index = 1; index < sides - 1; index += 1) baseFaces.push([base[0], base[index + 1], base[index]]);
  const lateralFaces = base.map((point, index) => [point, base[(index + 1) % sides], apex] as const);
  const edgeValues: number[] = [];
  base.forEach((point, index) => {
    const next = base[(index + 1) % sides];
    edgeValues.push(point.x, point.y, point.z, next.x, next.y, next.z);
    edgeValues.push(point.x, point.y, point.z, apex.x, apex.y, apex.z);
  });
  const edges = new THREE.BufferGeometry();
  edges.setAttribute("position", new THREE.Float32BufferAttribute(edgeValues, 3));
  return { base, apex, baseGeometry: triangleGeometry(baseFaces), lateralGeometry: triangleGeometry(lateralFaces), edges };
}

function PyramidObject({ sides, rotationY, highlight = "all", apexShift = 0 }: { sides: number; rotationY: number; highlight?: Highlight; apexShift?: number }) {
  const geometry = useMemo(() => pyramidGeometry(sides, apexShift), [apexShift, sides]);
  useEffect(() => () => {
    geometry.baseGeometry.dispose();
    geometry.lateralGeometry.dispose();
    geometry.edges.dispose();
  }, [geometry]);
  const baseActive = highlight === "all" || highlight === "base";
  const sidesActive = highlight === "all" || highlight === "lateral";
  const edgesActive = highlight === "all" || highlight === "edges";
  const apexActive = highlight === "all" || highlight === "apex";

  return <group rotation={[0, rotationY, 0]} position={[0, -0.05, 0]}>
    <mesh geometry={geometry.baseGeometry}>
      <meshStandardMaterial color="#8b5cf6" transparent opacity={baseActive ? 0.95 : 0.16} side={THREE.DoubleSide} roughness={0.45} />
    </mesh>
    <mesh geometry={geometry.lateralGeometry}>
      <meshStandardMaterial color="#67e8f9" transparent opacity={sidesActive ? 0.72 : 0.14} side={THREE.DoubleSide} roughness={0.45} />
    </mesh>
    <lineSegments geometry={geometry.edges}>
      <lineBasicMaterial color={edgesActive ? "#facc15" : "#64748b"} transparent opacity={edgesActive ? 1 : 0.3} />
    </lineSegments>
    {geometry.base.map((point, index) => <mesh key={index} position={point}>
      <sphereGeometry args={[0.075, 18, 18]} />
      <meshStandardMaterial color={edgesActive ? "#ffffff" : "#94a3b8"} />
    </mesh>)}
    <mesh position={geometry.apex}>
      <sphereGeometry args={[apexActive ? 0.16 : 0.1, 24, 24]} />
      <meshStandardMaterial color={apexActive ? "#fb923c" : "#94a3b8"} emissive={apexActive ? "#7c2d12" : "#000000"} emissiveIntensity={0.45} />
    </mesh>
  </group>;
}

function SolidCanvas({ sides = 4, rotationY = 0.45, highlight = "all", label, solid = "pyramid" }: { sides?: number; rotationY?: number; highlight?: Highlight; label: string; solid?: RecognitionSolid }) {
  return <div className="h-56 overflow-hidden rounded-3xl bg-slate-950" role="img" aria-label={label}>
    <Canvas camera={{ position: [4.4, 3.2, 5.5], fov: 35 }}>
      <ambientLight intensity={1.45} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} />
      <directionalLight position={[-3, 2, -4]} intensity={0.7} />
      {solid === "pyramid" ? <PyramidObject sides={sides} rotationY={rotationY} highlight={highlight} /> : null}
      {solid === "cuboid" ? <mesh rotation={[0, rotationY, 0]}><boxGeometry args={[2.35, 2.35, 2.1]} /><meshStandardMaterial color="#67e8f9" transparent opacity={0.75} /></mesh> : null}
      {solid === "cone" ? <mesh rotation={[0, rotationY, 0]}><coneGeometry args={[1.35, 2.8, 32]} /><meshStandardMaterial color="#fbbf24" transparent opacity={0.78} /></mesh> : null}
      {solid === "cylinder" ? <mesh rotation={[0, rotationY, 0]}><cylinderGeometry args={[1.25, 1.25, 2.7, 32]} /><meshStandardMaterial color="#a78bfa" transparent opacity={0.78} /></mesh> : null}
    </Canvas>
  </div>;
}

function ExploreSlide({ readOnly }: { readOnly: boolean }) {
  const [sides, setSides] = useState(4);
  const [rotation, setRotation] = useState(0.45);
  const [highlight, setHighlight] = useState<Highlight>("all");
  const counts = { faces: sides + 1, vertices: sides + 1, edges: sides * 2 };

  return <LessonTaskFrame eyebrow="Dział 9 · Temat 7" heading="Poznaj ostrosłupy" description="Nazwa ostrosłupa pochodzi od figury znajdującej się w jego podstawie. Wszystkie ściany boczne są trójkątami i spotykają się w jednym wierzchołku.">
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[3, 4, 5].map((value) => <LessonTaskChoice key={value} selected={sides === value} disabled={readOnly} onClick={() => { setSides(value); setHighlight("all"); }}>
          {value === 3 ? "Trójkątny" : value === 4 ? "Czworokątny" : "Pięciokątny"}
        </LessonTaskChoice>)}
      </div>
      <div className="grid gap-4 min-[620px]:grid-cols-[minmax(0,1.25fr)_minmax(230px,.75fr)]">
        <SolidCanvas sides={sides} rotationY={rotation} highlight={highlight} label={`${PYRAMID_NAMES[sides]}. Zaznaczony element: ${highlight}.`} />
        <section className="grid grid-cols-2 gap-2 content-start">
          {([
            ["base", "Podstawa"],
            ["lateral", "Ściany boczne"],
            ["edges", "Krawędzie"],
            ["apex", "Wierzchołek ostrosłupa"],
          ] as const).map(([value, label]) => <LessonTaskChoice key={value} selected={highlight === value} disabled={readOnly} onClick={() => setHighlight(value)}>{label}</LessonTaskChoice>)}
          <div className="col-span-2 rounded-2xl bg-cyan-50 p-3 text-center font-bold text-cyan-950">
            {highlight === "base" ? "Podstawa nadaje nazwę ostrosłupowi." : highlight === "lateral" ? `Ma ${sides} trójkątne ściany boczne.` : highlight === "edges" ? `Ma ${counts.edges} krawędzi.` : highlight === "apex" ? "W tym punkcie spotykają się wszystkie ściany boczne." : "Wybierz element, aby wyraźnie zaznaczyć go na bryle."}
          </div>
        </section>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-violet-100 p-3"><strong className="block text-2xl text-violet-800">{counts.faces}</strong><span className="text-sm font-bold">ścian</span></div>
        <div className="rounded-2xl bg-cyan-100 p-3"><strong className="block text-2xl text-cyan-800">{counts.vertices}</strong><span className="text-sm font-bold">wierzchołków</span></div>
        <div className="rounded-2xl bg-amber-100 p-3"><strong className="block text-2xl text-amber-800">{counts.edges}</strong><span className="text-sm font-bold">krawędzi</span></div>
      </div>
      {sides === 3 ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Czworościan to ostrosłup trójkątny, którego wszystkie cztery ściany są trójkątami.</p> : null}
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" disabled={readOnly} onClick={() => setRotation((value) => value - 0.45)} className="rounded-xl bg-indigo-100 px-4 py-2 font-black text-indigo-950 disabled:opacity-40">↶ Obróć</button>
        <button type="button" disabled={readOnly} onClick={() => setRotation((value) => value + 0.45)} className="rounded-xl bg-indigo-100 px-4 py-2 font-black text-indigo-950 disabled:opacity-40">Obróć ↷</button>
        <button type="button" disabled={readOnly} onClick={() => { setRotation(0.45); setHighlight("all"); }} className="rounded-xl bg-slate-100 px-4 py-2 font-black text-slate-800 disabled:opacity-40">Ustaw od początku</button>
      </div>
    </div>
  </LessonTaskFrame>;
}

type IdentifyTask = { solid: RecognitionSolid; sides?: number; label: string; answer: "Tak" | "Nie" };
const IDENTIFY_TASKS: readonly IdentifyTask[] = [
  { solid: "pyramid", sides: 4, label: "Ostrosłup czworokątny", answer: "Tak" },
  { solid: "cuboid", label: "Prostopadłościan", answer: "Nie" },
  { solid: "pyramid", sides: 3, label: "Czworościan", answer: "Tak" },
  { solid: "cone", label: "Stożek", answer: "Nie" },
  { solid: "pyramid", sides: 5, label: "Ostrosłup pięciokątny", answer: "Tak" },
  { solid: "cylinder", label: "Walec", answer: "Nie" },
];

type CountTask = { sides: number; prompt: string; answer: string; choices: readonly string[] };
const COUNT_TASKS: readonly CountTask[] = [
  { sides: 3, prompt: "Ile ścian, krawędzi i wierzchołków ma ostrosłup trójkątny?", answer: "4 ściany, 6 krawędzi, 4 wierzchołki", choices: ["4 ściany, 6 krawędzi, 4 wierzchołki", "5 ścian, 6 krawędzi, 5 wierzchołków", "4 ściany, 9 krawędzi, 6 wierzchołków"] },
  { sides: 4, prompt: "Ile ścian, krawędzi i wierzchołków ma ostrosłup czworokątny?", answer: "5 ścian, 8 krawędzi, 5 wierzchołków", choices: ["5 ścian, 8 krawędzi, 5 wierzchołków", "6 ścian, 12 krawędzi, 8 wierzchołków", "4 ściany, 8 krawędzi, 5 wierzchołków"] },
  { sides: 5, prompt: "Ile ścian, krawędzi i wierzchołków ma ostrosłup pięciokątny?", answer: "6 ścian, 10 krawędzi, 6 wierzchołków", choices: ["6 ścian, 10 krawędzi, 6 wierzchołków", "7 ścian, 15 krawędzi, 10 wierzchołków", "5 ścian, 10 krawędzi, 6 wierzchołków"] },
  { sides: 6, prompt: "Jaki ostrosłup ma 7 ścian?", answer: "Sześciokątny", choices: ["Czworokątny", "Pięciokątny", "Sześciokątny"] },
  { sides: 6, prompt: "Jaki ostrosłup ma 12 krawędzi?", answer: "Sześciokątny", choices: ["Pięciokątny", "Sześciokątny", "Ośmiokątny"] },
  { sides: 5, prompt: "Jaki ostrosłup ma 6 wierzchołków?", answer: "Pięciokątny", choices: ["Czworokątny", "Pięciokątny", "Sześciokątny"] },
];

function ChoiceSeries({ kind, readOnly, onResultChange }: { kind: "identify" | "counts"; readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const tasks = kind === "identify" ? IDENTIFY_TASKS : COUNT_TASKS;
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState<"empty" | "correct" | "wrong" | null>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = tasks[index];
  const answer = task.answer;

  const advance = () => {
    if (index === tasks.length - 1) {
      onResultChange?.(!mistakeMade && feedback !== "wrong", choice);
      return;
    }
    setIndex((value) => value + 1);
    setChoice("");
    setFeedback(null);
  };

  const check = () => {
    if (!choice) { setFeedback("empty"); return; }
    if (choice === answer) {
      setFeedback("correct");
      window.setTimeout(() => {
        if (index === tasks.length - 1) onResultChange?.(!mistakeMade, choice);
        else advance();
      }, 700);
    } else {
      setMistakeMade(true);
      setFeedback("wrong");
    }
  };

  const identifyTask = kind === "identify" ? task as IdentifyTask : null;
  const countTask = kind === "counts" ? task as CountTask : null;
  const choices = identifyTask ? ["Tak", "Nie"] : countTask?.choices ?? [];
  const prompt = identifyTask ? "Czy ta bryła jest ostrosłupem?" : countTask?.prompt ?? "";

  return <LessonTaskFrame eyebrow="Dział 9 · Temat 7" heading={kind === "identify" ? "Czy to jest ostrosłup?" : "Ściany, krawędzie i wierzchołki"} description={kind === "identify" ? "Ostrosłup ma jedną podstawę, a jego trójkątne ściany boczne spotykają się w jednym wierzchołku." : "Nazwa ostrosłupa podpowiada liczbę boków podstawy."} questionNumber={index + 1} questionCount={tasks.length}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-amber-50 p-4 text-center"><p className="text-xl font-black text-amber-950">{prompt}</p></section>
      {identifyTask ? <div className="mx-auto max-w-xl"><SolidCanvas solid={identifyTask.solid} sides={identifyTask.sides} label={identifyTask.label} /></div> : null}
      {countTask ? <div className="mx-auto max-w-xl"><SolidCanvas sides={countTask.sides} label={PYRAMID_NAMES[countTask.sides]} /></div> : null}
      <div className={`grid gap-2 ${choices.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {choices.map((option) => <LessonTaskChoice key={option} selected={choice === option} disabled={readOnly || feedback === "correct" || feedback === "wrong"} onClick={() => { setChoice(option); setFeedback(null); }}>{option}</LessonTaskChoice>)}
      </div>
      {feedback === "empty" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Wybierz odpowiedź.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Poprawna odpowiedź.</p> : null}
      {feedback === "wrong" ? <div className="space-y-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-bold text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to: {answer}. Dziś bez punktu.</p><button type="button" onClick={advance} className="rounded-xl bg-violet-700 px-5 py-3 font-black text-white">Przejdź dalej bez punktu</button></div> : <button type="button" disabled={readOnly || feedback === "correct"} onClick={check} className="w-full rounded-2xl bg-violet-700 px-5 py-3 font-black text-white disabled:opacity-50">Sprawdź odpowiedź</button>}
    </div>
  </LessonTaskFrame>;
}

function polygonPoints(sides: number, radius = 50, cx = 150, cy = 125) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as const;
  });
}

type NetTask = { sides: number; prompt: string; answer: string; choices: readonly string[]; invalid?: "missing-face" | "extra-base" };
const NET_TASKS: readonly NetTask[] = [
  { sides: 3, prompt: "Jaki ostrosłup powstanie z tej siatki?", answer: "Trójkątny", choices: ["Trójkątny", "Czworokątny", "Pięciokątny"] },
  { sides: 4, prompt: "Jaki ostrosłup powstanie z tej siatki?", answer: "Czworokątny", choices: ["Trójkątny", "Czworokątny", "Pięciokątny"] },
  { sides: 5, prompt: "Jaki ostrosłup powstanie z tej siatki?", answer: "Pięciokątny", choices: ["Czworokątny", "Pięciokątny", "Sześciokątny"] },
  { sides: 4, prompt: "Czy to jest poprawna siatka ostrosłupa czworokątnego?", answer: "Tak", choices: ["Tak", "Nie"] },
  { sides: 4, invalid: "missing-face", prompt: "Czy to jest poprawna siatka ostrosłupa czworokątnego?", answer: "Nie", choices: ["Tak", "Nie"] },
  { sides: 3, invalid: "extra-base", prompt: "Czy z tej siatki powstanie czworościan?", answer: "Nie", choices: ["Tak", "Nie"] },
];

function PyramidNet({ task }: { task: NetTask }) {
  const points = polygonPoints(task.sides);
  const visibleFaces = task.invalid === "missing-face" ? task.sides - 1 : task.sides;
  const pointString = points.map(([x, y]) => `${x},${y}`).join(" ");
  return <div className="overflow-hidden rounded-3xl border-2 border-indigo-200 bg-slate-50 p-2" role="img" aria-label={`Siatka z podstawą o liczbie boków: ${task.sides}, oraz z liczbą trójkątnych ścian bocznych: ${visibleFaces}.`}>
    <svg viewBox="0 0 300 250" className="h-auto w-full" aria-hidden="true">
      <polygon points={pointString} fill="#c4b5fd" stroke="#312e81" strokeWidth="4" />
      {points.slice(0, visibleFaces).map((point, index) => {
        const next = points[(index + 1) % task.sides];
        const mx = (point[0] + next[0]) / 2;
        const my = (point[1] + next[1]) / 2;
        const dx = mx - 150;
        const dy = my - 125;
        const length = Math.hypot(dx, dy) || 1;
        const apexX = mx + (dx / length) * 58;
        const apexY = my + (dy / length) * 58;
        return <polygon key={index} points={`${point[0]},${point[1]} ${next[0]},${next[1]} ${apexX},${apexY}`} fill={index % 2 ? "#a5f3fc" : "#fde68a"} stroke="#164e63" strokeWidth="3" />;
      })}
      {task.invalid === "extra-base" ? <polygon points="225,165 272,185 240,225" fill="#fda4af" stroke="#9f1239" strokeWidth="4" /> : null}
    </svg>
  </div>;
}

function NetsSeries({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState<"empty" | "correct" | "wrong" | null>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = NET_TASKS[index];

  const advance = () => {
    if (index === NET_TASKS.length - 1) { onResultChange?.(!mistakeMade && feedback !== "wrong", choice); return; }
    setIndex((value) => value + 1); setChoice(""); setFeedback(null);
  };
  const check = () => {
    if (!choice) { setFeedback("empty"); return; }
    if (choice === task.answer) {
      setFeedback("correct");
      window.setTimeout(() => index === NET_TASKS.length - 1 ? onResultChange?.(!mistakeMade, choice) : advance(), 700);
    } else { setMistakeMade(true); setFeedback("wrong"); }
  };

  return <LessonTaskFrame eyebrow="Dział 9 · Temat 7" heading="Rozpoznaj siatkę ostrosłupa" description="Znajdź jedną podstawę. Do każdego jej boku powinna być dołączona jedna trójkątna ściana boczna." questionNumber={index + 1} questionCount={NET_TASKS.length}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-amber-50 p-4 text-center"><p className="text-xl font-black text-amber-950">{task.prompt}</p></section>
      <PyramidNet task={task} />
      <div className={`grid gap-2 ${task.choices.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>{task.choices.map((option) => <LessonTaskChoice key={option} selected={choice === option} disabled={readOnly || feedback === "correct" || feedback === "wrong"} onClick={() => { setChoice(option); setFeedback(null); }}>{option}</LessonTaskChoice>)}</div>
      {feedback === "empty" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Wybierz odpowiedź.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Poprawna odpowiedź.</p> : null}
      {feedback === "wrong" ? <div className="space-y-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-bold text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to: {task.answer}. Dziś bez punktu.</p><button type="button" onClick={advance} className="rounded-xl bg-violet-700 px-5 py-3 font-black text-white">Przejdź dalej bez punktu</button></div> : <button type="button" disabled={readOnly || feedback === "correct"} onClick={check} className="w-full rounded-2xl bg-violet-700 px-5 py-3 font-black text-white disabled:opacity-50">Sprawdź odpowiedź</button>}
    </div>
  </LessonTaskFrame>;
}

type AreaTask = { sides: number; prompt: string; detail: string; unit: string; answers: { pp: number; pb: number; pc: number } };
const AREA_TASKS: readonly AreaTask[] = [
  { sides: 4, prompt: "Oblicz pole powierzchni ostrosłupa prawidłowego czworokątnego.", detail: "Podstawa jest kwadratem o boku 4 cm. Wysokość każdej trójkątnej ściany bocznej wynosi 3 cm.", unit: "cm²", answers: { pp: 16, pb: 24, pc: 40 } },
  { sides: 4, prompt: "Oblicz pole powierzchni ostrosłupa prawidłowego czworokątnego.", detail: "Bok kwadratowej podstawy ma 6 cm, a wysokość każdej ściany bocznej 5 cm.", unit: "cm²", answers: { pp: 36, pb: 60, pc: 96 } },
  { sides: 5, prompt: "Oblicz pole powierzchni ostrosłupa pięciokątnego.", detail: "Pole podstawy wynosi 35 cm². Każda z pięciu ścian bocznych ma pole 12 cm².", unit: "cm²", answers: { pp: 35, pb: 60, pc: 95 } },
  { sides: 3, prompt: "Oblicz pole powierzchni ostrosłupa trójkątnego.", detail: "Pole podstawy wynosi 18 dm². Każda z trzech ścian bocznych ma pole 8 dm².", unit: "dm²", answers: { pp: 18, pb: 24, pc: 42 } },
];

function parseNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  return /^\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : null;
}

function AreaSeries({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState({ pp: "", pb: "", pc: "" });
  const [active, setActive] = useState<keyof typeof values>("pp");
  const [feedback, setFeedback] = useState<"empty" | "correct" | "wrong" | null>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = AREA_TASKS[index];
  const solved = feedback === "correct" || feedback === "wrong";

  const advance = () => {
    if (index === AREA_TASKS.length - 1) { onResultChange?.(!mistakeMade && feedback !== "wrong", `Pp=${values.pp}, Pb=${values.pb}, Pc=${values.pc}`); return; }
    setIndex((value) => value + 1); setValues({ pp: "", pb: "", pc: "" }); setActive("pp"); setFeedback(null);
  };
  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setValues((current) => ({ ...current, [active]: key === "backspace" ? current[active].slice(0, -1) : `${current[active]}${key}`.slice(0, 7) }));
    setFeedback(null);
  };
  const check = () => {
    if (Object.values(values).some((value) => !value)) { setFeedback("empty"); return; }
    const correct = parseNumber(values.pp) === task.answers.pp && parseNumber(values.pb) === task.answers.pb && parseNumber(values.pc) === task.answers.pc;
    if (correct) {
      setFeedback("correct");
      window.setTimeout(() => index === AREA_TASKS.length - 1 ? onResultChange?.(!mistakeMade, `Pp=${values.pp}, Pb=${values.pb}, Pc=${values.pc}`) : advance(), 700);
    } else { setMistakeMade(true); setFeedback("wrong"); }
  };

  return <LessonTaskFrame eyebrow="Dział 9 · Temat 7" heading="Proste pole powierzchni" description="Pole całkowite ostrosłupa to pole podstawy i pola wszystkich trójkątnych ścian bocznych: Pc = Pp + Pb." questionNumber={index + 1} questionCount={AREA_TASKS.length}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-amber-50 p-4 text-center"><p className="text-xl font-black text-amber-950">{task.prompt}</p><p className="mt-2 font-bold text-slate-700">{task.detail}</p></section>
      <div className="mx-auto max-w-xl"><SolidCanvas sides={task.sides} label={PYRAMID_NAMES[task.sides]} /></div>
      <div className="rounded-2xl bg-violet-100 p-3 text-center text-2xl font-black text-violet-950">Pc = Pp + Pb</div>
      <div className="grid gap-2 sm:grid-cols-3">
        {(["pp", "pb", "pc"] as const).map((field) => <label key={field} className={`rounded-2xl border-2 bg-white p-3 text-center font-black ${active === field ? "border-violet-600 ring-4 ring-violet-100" : "border-slate-200"}`}>
          <span className="mb-2 block">{field === "pp" ? "Pp — pole podstawy" : field === "pb" ? "Pb — pole boczne" : "Pc — pole całkowite"}</span>
          <span className="flex items-center justify-center gap-2"><input aria-label={field === "pp" ? "Pp — pole podstawy" : field === "pb" ? "Pb — pole boczne" : "Pc — pole całkowite"} inputMode="none" readOnly value={values[field]} onFocus={() => setActive(field)} onClick={() => setActive(field)} className="h-12 w-24 rounded-xl border-2 border-violet-300 text-center text-xl font-black" /><span>{task.unit}</span></span>
        </label>)}
      </div>
      {feedback === "empty" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij Pp, Pb oraz Pc.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Wszystkie pola są obliczone poprawnie.</p> : null}
      {feedback === "wrong" ? <div className="space-y-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-bold text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to: Pp = {task.answers.pp} {task.unit}, Pb = {task.answers.pb} {task.unit}, Pc = {task.answers.pc} {task.unit}. Dziś bez punktu.</p><button type="button" onClick={advance} className="rounded-xl bg-violet-700 px-5 py-3 font-black text-white">Przejdź dalej bez punktu</button></div> : null}
      <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={readOnly || solved} label="Kalkulator do pola ostrosłupa" helperText="Dotknij kratki Pp, Pb lub Pc, wpisz wynik i zatwierdź wszystkie odpowiedzi." />
    </div>
  </LessonTaskFrame>;
}

export function PyramidLessonLab({ activity, readOnly = false, onResultChange }: { activity: PyramidActivity; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  if (activity === "explore") return <ExploreSlide readOnly={readOnly} />;
  if (activity === "identify") return <ChoiceSeries kind="identify" readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "counts") return <ChoiceSeries kind="counts" readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "nets") return <NetsSeries readOnly={readOnly} onResultChange={onResultChange} />;
  return <AreaSeries readOnly={readOnly} onResultChange={onResultChange} />;
}
