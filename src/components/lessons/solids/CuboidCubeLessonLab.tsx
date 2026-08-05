"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type CuboidCubeActivity =
  | "explore"
  | "net"
  | "elements"
  | "relations"
  | "edge-formulas"
  | "edge-practice"
  | "area-formulas"
  | "area-practice"
  | "mixed-practice";

export function cuboidCubeActivityFromStageId(stageId: string): CuboidCubeActivity {
  if (stageId.includes("mixed-practice")) return "mixed-practice";
  if (stageId.includes("area-practice")) return "area-practice";
  if (stageId.includes("area-formulas")) return "area-formulas";
  if (stageId.includes("edge-practice")) return "edge-practice";
  if (stageId.includes("edge-formulas")) return "edge-formulas";
  if (stageId.includes("relations")) return "relations";
  if (stageId.includes("elements")) return "elements";
  if (stageId.includes("net")) return "net";
  return "explore";
}

type SolidKind = "cuboid" | "cube";
type Highlight = "none" | "face" | "edge" | "vertex" | "parallel" | "perpendicular" | "wire";

const VERTEX_SIGNS = [
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
] as const;

const EDGES = [
  [0, 1, "AB", "x"], [1, 2, "BC", "y"], [2, 3, "CD", "x"], [3, 0, "DA", "y"],
  [4, 5, "EF", "x"], [5, 6, "FG", "y"], [6, 7, "GH", "x"], [7, 4, "HE", "y"],
  [0, 4, "AE", "z"], [1, 5, "BF", "z"], [2, 6, "CG", "z"], [3, 7, "DH", "z"],
] as const;

function EdgeCylinder({ start, end, color, radius = 0.045 }: { start: THREE.Vector3; end: THREE.Vector3; color: string; radius?: number }) {
  const transform = useMemo(() => {
    const direction = end.clone().sub(start);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return { midpoint, quaternion, length: direction.length() };
  }, [start, end]);
  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion}>
      <cylinderGeometry args={[radius, radius, transform.length, 12]} />
      <meshStandardMaterial color={color} roughness={0.35} />
    </mesh>
  );
}

interface FacePose { position: [number, number, number]; rotation: [number, number, number]; size: [number, number]; color: string }

function mixTuple(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function SolidScene({ kind, unfold, highlight, rotation }: { kind: SolidKind; unfold: number; highlight: Highlight; rotation: [number, number] }) {
  const [a, b, c] = kind === "cube" ? [2.7, 2.7, 2.7] : [3.6, 2.6, 2.2];
  const gap = 0.05;
  const folded: FacePose[] = [
    { position: [0, 0, b / 2], rotation: [0, 0, 0], size: [a, c], color: "#67e8f9" },
    { position: [0, 0, -b / 2], rotation: [0, Math.PI, 0], size: [a, c], color: "#c4b5fd" },
    { position: [-a / 2, 0, 0], rotation: [0, -Math.PI / 2, 0], size: [b, c], color: "#f9a8d4" },
    { position: [a / 2, 0, 0], rotation: [0, Math.PI / 2, 0], size: [b, c], color: "#86efac" },
    { position: [0, c / 2, 0], rotation: [-Math.PI / 2, 0, 0], size: [a, b], color: "#fde68a" },
    { position: [0, -c / 2, 0], rotation: [Math.PI / 2, 0, 0], size: [a, b], color: "#fdba74" },
  ];
  const flat: FacePose[] = [
    { ...folded[0], position: [0, 0, 0], rotation: [0, 0, 0] },
    { ...folded[1], position: [a + b + gap * 3, 0, 0], rotation: [0, 0, 0] },
    { ...folded[2], position: [-(a + b) / 2 - gap, 0, 0], rotation: [0, 0, 0] },
    { ...folded[3], position: [(a + b) / 2 + gap, 0, 0], rotation: [0, 0, 0] },
    { ...folded[4], position: [0, (b + c) / 2 + gap, 0], rotation: [0, 0, 0] },
    { ...folded[5], position: [0, -(b + c) / 2 - gap, 0], rotation: [0, 0, 0] },
  ];
  const vertices = VERTEX_SIGNS.map(([sx, sy, sz]) => new THREE.Vector3(sx * a / 2, sy * c / 2, sz * b / 2));
  const parallel = new Set(["CD", "EF", "GH"]);
  const perpendicular = new Set(["BC", "DA", "AE", "BF"]);
  const scale = 1 - unfold * 0.3;

  return (
    <group rotation={[rotation[0] * (1 - unfold), rotation[1] * (1 - unfold), 0]} scale={scale} position={[unfold ? -0.45 : 0, 0, 0]}>
      {folded.map((face, index) => {
        const to = flat[index];
        const active = highlight === "face" && index === 0;
        const elementStudy = highlight === "face" || highlight === "edge" || highlight === "vertex";
        return (
          <mesh key={index} position={mixTuple(face.position, to.position, unfold)} rotation={mixTuple(face.rotation, to.rotation, unfold)}>
            <planeGeometry args={face.size} />
            <meshStandardMaterial color={active ? "#22d3ee" : elementStudy ? "#64748b" : face.color} side={THREE.DoubleSide} transparent opacity={active ? 0.9 : elementStudy ? 0.13 : 0.86} emissive={active ? "#0891b2" : "#000000"} emissiveIntensity={active ? 0.55 : 0} depthWrite={!elementStudy || active} />
          </mesh>
        );
      })}
      {unfold < 0.08 ? EDGES.map(([from, to, name, axis]) => {
        const isReference = name === "AB" && (highlight === "parallel" || highlight === "perpendicular");
        const active = highlight === "wire" || highlight === "edge" || isReference || (highlight === "parallel" && parallel.has(name)) || (highlight === "perpendicular" && perpendicular.has(name));
        const groupedColor = highlight === "wire" ? (axis === "x" ? "#7c3aed" : axis === "y" ? "#0891b2" : "#ea580c") : highlight === "edge" ? "#facc15" : isReference ? "#e11d48" : active ? "#facc15" : "#475569";
        return <EdgeCylinder key={name} start={vertices[from]} end={vertices[to]} color={groupedColor} radius={active ? 0.095 : highlight === "vertex" ? 0.025 : 0.04} />;
      }) : null}
      {unfold < 0.08 ? vertices.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[highlight === "vertex" ? 0.18 : highlight === "edge" ? 0.06 : 0.095, 20, 20]} />
          <meshStandardMaterial color={highlight === "vertex" ? "#fb7185" : highlight === "edge" ? "#64748b" : "#f8fafc"} emissive={highlight === "vertex" ? "#be123c" : "#000000"} emissiveIntensity={highlight === "vertex" ? 0.7 : 0} />
        </mesh>
      )) : null}
    </group>
  );
}

function SpatialModel({ kind, setKind, unfold = 0, setUnfold, highlight = "none", readOnly = false }: { kind: SolidKind; setKind: (kind: SolidKind) => void; unfold?: number; setUnfold?: (value: number) => void; highlight?: Highlight; readOnly?: boolean }) {
  const [rotation, setRotation] = useState<[number, number]>([0, 0.65]);
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null);
  return (
    <div className="space-y-3" data-solid-spatial-model>
      <div
        className="h-[310px] touch-none overflow-hidden rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 shadow-inner sm:h-[360px]"
        onPointerDown={(event) => { if (!readOnly && unfold < 0.08) { event.currentTarget.setPointerCapture(event.pointerId); setDragPoint({ x: event.clientX, y: event.clientY }); } }}
        onPointerMove={(event) => { if (dragPoint) { setRotation(([, y]) => [0, y + (event.clientX - dragPoint.x) * 0.01]); setDragPoint({ x: event.clientX, y: event.clientY }); } }}
        onPointerUp={() => setDragPoint(null)}
        onPointerCancel={() => setDragPoint(null)}
        aria-label={`Obracany model 3D: ${kind === "cube" ? "sześcian" : "prostopadłościan"}`}
      >
        <Canvas camera={{ position: [0, 3.2, 10.5], fov: 42 }}>
          <ambientLight intensity={1.3} />
          <directionalLight position={[5, 7, 8]} intensity={2.2} />
          <directionalLight position={[-4, -2, 5]} intensity={0.8} color="#67e8f9" />
          <SolidScene kind={kind} unfold={unfold} highlight={highlight} rotation={rotation} />
        </Canvas>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <LessonTaskChoice selected={kind === "cuboid"} disabled={readOnly} onClick={() => setKind("cuboid")}>Prostopadłościan</LessonTaskChoice>
        <LessonTaskChoice selected={kind === "cube"} disabled={readOnly} onClick={() => setKind("cube")}>Sześcian</LessonTaskChoice>
      </div>
      <div className={`grid gap-2 text-center text-sm font-black ${kind === "cube" ? "grid-cols-1" : "grid-cols-3"}`} aria-label="Oznaczenia długości krawędzi">
        <span className="rounded-xl bg-violet-100 px-3 py-2 text-violet-950">a — długość</span>
        {kind === "cuboid" ? <><span className="rounded-xl bg-orange-100 px-3 py-2 text-orange-950">b — szerokość</span><span className="rounded-xl bg-cyan-100 px-3 py-2 text-cyan-950">c — wysokość</span></> : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" disabled={readOnly || unfold >= 0.08} onClick={() => setRotation(([x, y]) => [x, y - Math.PI / 8])} className="min-h-10 rounded-xl bg-indigo-100 px-4 font-black text-indigo-950 disabled:opacity-40">↶ Obróć</button>
        <button type="button" disabled={readOnly || unfold >= 0.08} onClick={() => setRotation(([x, y]) => [x, y + Math.PI / 8])} className="min-h-10 rounded-xl bg-indigo-100 px-4 font-black text-indigo-950 disabled:opacity-40">Obróć ↷</button>
        <button type="button" disabled={readOnly} onClick={() => setRotation([0, 0.65])} className="min-h-10 rounded-xl bg-slate-100 px-4 font-black text-slate-800 disabled:opacity-40">Ustaw od początku</button>
      </div>
      {setUnfold ? (
        <div className="rounded-2xl bg-cyan-50 p-3">
          <div className="mb-2 flex justify-between text-sm font-black text-cyan-950"><span>Bryła</span><span>Siatka</span></div>
          <input aria-label="Rozłóż bryłę do siatki" type="range" min="0" max="100" value={Math.round(unfold * 100)} disabled={readOnly} onChange={(event) => setUnfold(Number(event.target.value) / 100)} className="w-full accent-violet-700" />
          <p className="mt-2 text-center text-sm font-bold text-slate-700">Przesuwaj suwak: sześć ścian bryły rozkłada się w jedną płaską siatkę.</p>
        </div>
      ) : <p className="text-center text-sm font-bold text-slate-600">Przeciągnij model palcem lub myszą, aby obejrzeć go z każdej strony.</p>}
    </div>
  );
}

const EDGE_TASKS = [
  { kind: "cuboid" as const, prompt: "Stelaż prostopadłościanu ma krawędzie 5 cm, 3 cm i 2 cm. Ile centymetrów drutu potrzeba?", answer: "40", unit: "cm", dims: "a = 5 cm, b = 3 cm, c = 2 cm" },
  { kind: "cube" as const, prompt: "Z drutu budujemy szkielet sześcianu o krawędzi 6 cm. Jak długi musi być drut?", answer: "72", unit: "cm", dims: "a = 6 cm" },
  { kind: "cuboid" as const, prompt: "Krawędzie pudełka mają 8 dm, 4 dm i 3 dm. Oblicz sumę długości wszystkich krawędzi.", answer: "60", unit: "dm", dims: "a = 8 dm, b = 4 dm, c = 3 dm" },
  { kind: "cube" as const, prompt: "Sześcian ma krawędź długości 9 mm. Oblicz sumę długości wszystkich jego krawędzi.", answer: "108", unit: "mm", dims: "a = 9 mm" },
];

const AREA_TASKS = [
  { kind: "cuboid" as const, prompt: "Oblicz pole powierzchni prostopadłościanu o wymiarach 6 cm, 4 cm i 2 cm.", answer: "88", unit: "cm²", dims: "a = 6 cm, b = 4 cm, c = 2 cm" },
  { kind: "cube" as const, prompt: "Oblicz pole powierzchni sześcianu o krawędzi 4 cm.", answer: "96", unit: "cm²", dims: "a = 4 cm" },
  { kind: "cuboid" as const, prompt: "Oblicz pole powierzchni prostopadłościanu o wymiarach 7 dm, 3 dm i 2 dm.", answer: "82", unit: "dm²", dims: "a = 7 dm, b = 3 dm, c = 2 dm" },
  { kind: "cube" as const, prompt: "Oblicz pole powierzchni sześcianu o krawędzi 7 mm.", answer: "294", unit: "mm²", dims: "a = 7 mm" },
];

const MIXED_TASKS = [
  { kind: "cube" as const, prompt: "Suma długości wszystkich krawędzi sześcianu wynosi 84 cm. Jaką długość ma jedna krawędź?", answer: "7", unit: "cm", dims: "12a = 84 cm" },
  { kind: "cuboid" as const, prompt: "Suma długości krawędzi prostopadłościanu wynosi 72 cm. Dwie krawędzie wychodzące z jednego wierzchołka mają 5 cm i 4 cm. Oblicz trzecią.", answer: "9", unit: "cm", dims: "4(a + 5 + 4) = 72 cm" },
  { kind: "cube" as const, prompt: "Pole powierzchni sześcianu wynosi 150 cm². Jaką długość ma jego krawędź?", answer: "5", unit: "cm", dims: "6a² = 150 cm²" },
];

function NumberPad({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) {
  return (
    <div className="grid grid-cols-5 gap-2 rounded-2xl bg-slate-950 p-3" aria-label="Kalkulator lekcyjny">
      {[1,2,3,4,5,6,7,8,9,0].map((digit) => <button key={digit} type="button" disabled={disabled} onClick={() => onChange(`${value}${digit}`)} className="min-h-11 rounded-xl bg-white text-lg font-black text-slate-950 disabled:opacity-40">{digit}</button>)}
      <button type="button" disabled={disabled || !value} onClick={() => onChange(value.slice(0, -1))} className="col-span-5 min-h-11 rounded-xl bg-rose-300 font-black text-rose-950 disabled:opacity-40">← Usuń</button>
    </div>
  );
}

function CalculationSeries({ activity, readOnly, onResultChange }: { activity: "edge-practice" | "area-practice" | "mixed-practice"; readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const tasks = activity === "edge-practice" ? EDGE_TASKS : activity === "area-practice" ? AREA_TASKS : MIXED_TASKS;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "empty" | null>(null);
  const [lostPoint, setLostPoint] = useState(false);
  const task = tasks[index];
  const title = activity === "edge-practice" ? "Ile drutu potrzeba?" : activity === "area-practice" ? "Oblicz pole powierzchni" : "Połącz poznane umiejętności";
  const proceed = () => {
    if (index === tasks.length - 1) { onResultChange?.(!lostPoint && feedback !== "wrong", answer); return; }
    setIndex((current) => current + 1); setAnswer(""); setFeedback(null);
  };
  const check = () => {
    if (!answer) { setFeedback("empty"); return; }
    if (answer === task.answer) {
      setFeedback("correct");
      if (index === tasks.length - 1) onResultChange?.(!lostPoint, answer);
      return;
    }
    setLostPoint(true); setFeedback("wrong"); onResultChange?.(false, answer);
  };
  useEffect(() => {
    if (feedback !== "correct" || index === tasks.length - 1) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => current + 1);
      setAnswer("");
      setFeedback(null);
    }, 750);
    return () => window.clearTimeout(timer);
  }, [feedback, index, tasks.length]);
  return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 1" heading={title} questionNumber={index + 1} questionCount={tasks.length} data-solid-series={activity}>
      <div className="space-y-5" data-solid-layout="model-first">
        <div className="mx-auto w-full max-w-4xl" data-solid-model-position="top">
          <SpatialModel kind={task.kind} setKind={() => undefined} highlight={activity === "edge-practice" ? "wire" : "none"} readOnly />
        </div>
        <div className="mx-auto w-full max-w-4xl space-y-3">
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
            <p className="text-lg font-black leading-relaxed text-slate-950">{task.prompt}</p>
            <p className="mt-2 rounded-xl bg-white px-3 py-2 font-black text-violet-900">{task.dims}</p>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-4 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-700">Twój wynik</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <input aria-label="Wynik" inputMode="none" readOnly value={answer} className="min-h-14 w-40 rounded-2xl border-2 border-violet-400 bg-white text-center text-2xl font-black outline-none" />
              <b>{task.unit}</b>
            </div>
          </div>
          <NumberPad value={answer} onChange={(value) => { setAnswer(value); setFeedback(null); }} disabled={readOnly || feedback === "correct" || feedback === "wrong"} />
          {feedback === "empty" ? <p className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wynik.</p> : null}
          {feedback === "correct" ? <div className="space-y-2 rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950"><p>Brawo! Poprawny wynik to {task.answer} {task.unit}.</p>{index < tasks.length - 1 ? <p className="text-sm">Za chwilę pojawi się kolejne zadanie.</p> : null}</div> : null}
          {feedback === "wrong" ? <div className="space-y-2 rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {task.answer} {task.unit}. Dziś bez punktu.</p><button type="button" onClick={proceed} className="min-h-11 rounded-xl bg-amber-700 px-5 text-white">Przejdź dalej bez punktu</button></div> : null}
          {!feedback || feedback === "empty" ? <button type="button" disabled={readOnly} onClick={check} className="min-h-12 w-full rounded-xl bg-violet-700 px-5 font-black text-white disabled:opacity-40">Sprawdź odpowiedź</button> : null}
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function ElementsLab({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [kind, setKind] = useState<SolidKind>("cuboid");
  const [highlight, setHighlight] = useState<Highlight>("face");
  const counts = { face: 6, edge: 12, vertex: 8 } as const;
  return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 1" heading="Ściana, krawędź i wierzchołek" description="Wybierz element. Model podświetli dokładnie to miejsce na bryle.">
      <div className="space-y-5" data-solid-layout="model-first">
        <div className="mx-auto w-full max-w-4xl" data-solid-model-position="top">
          <SpatialModel kind={kind} setKind={setKind} highlight={highlight} readOnly={readOnly} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["face", "edge", "vertex"] as const).map((item) => <LessonTaskChoice key={item} selected={highlight === item} disabled={readOnly} onClick={() => { setHighlight(item); onResultChange?.(null, item); }} className="w-full min-h-16 text-lg">{item === "face" ? "Ściana" : item === "edge" ? "Krawędzie" : "Wierzchołki"}</LessonTaskChoice>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-cyan-50 p-3 text-center">
            <div><b className="block text-3xl text-violet-700">6</b><span className="text-sm font-bold">ścian</span></div>
            <div><b className="block text-3xl text-cyan-700">12</b><span className="text-sm font-bold">krawędzi</span></div>
            <div><b className="block text-3xl text-amber-600">8</b><span className="text-sm font-bold">wierzchołków</span></div>
          </div>
          <p className="grid min-h-20 place-items-center rounded-2xl bg-indigo-50 p-4 text-center font-bold text-indigo-950">Podświetlony element: <b>{highlight === "face" ? "jedna z 6 ścian" : highlight === "edge" ? "wszystkie 12 krawędzi" : "wszystkie 8 wierzchołków"}</b>.</p>
        </div>
        <p className="text-center text-sm font-bold text-slate-600">Zarówno sześcian, jak i prostopadłościan mają {counts.face} ścian, {counts.edge} krawędzi i {counts.vertex} wierzchołków.</p>
      </div>
    </LessonTaskFrame>
  );
}

function RelationsLab({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [kind, setKind] = useState<SolidKind>("cuboid");
  const [mode, setMode] = useState<"parallel" | "perpendicular">("parallel");
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const options = ["BC", "CD", "DA", "EF", "GH", "AE", "BF"];
  const correct = mode === "parallel" ? ["CD", "EF", "GH"] : ["BC", "DA", "AE", "BF"];
  const check = () => {
    if (!selected.length) { setFeedback("Najpierw wybierz krawędzie."); return; }
    const ok = selected.length === correct.length && correct.every((edge) => selected.includes(edge));
    setFeedback(ok ? "Brawo! Zaznaczone krawędzie mają właściwe położenie względem AB." : `Spróbuj innym razem. Poprawny wybór to: ${correct.join(", ")}. Dziś bez punktu.`);
    onResultChange?.(ok, selected.join(","));
  };
  return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 1" heading="Krawędzie równoległe i prostopadłe" description="Czerwona krawędź AB jest krawędzią odniesienia. Obracaj bryłę i znajdź właściwe krawędzie.">
      <div className="space-y-5" data-solid-layout="model-first">
        <div className="mx-auto w-full max-w-4xl" data-solid-model-position="top">
          <SpatialModel kind={kind} setKind={setKind} highlight={mode} readOnly={readOnly} />
        </div>
        <div className="mx-auto w-full max-w-4xl space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <LessonTaskChoice selected={mode === "parallel"} disabled={readOnly} onClick={() => { setMode("parallel"); setSelected([]); setFeedback(null); }}>Równoległe do AB</LessonTaskChoice>
            <LessonTaskChoice selected={mode === "perpendicular"} disabled={readOnly} onClick={() => { setMode("perpendicular"); setSelected([]); setFeedback(null); }}>Prostopadłe do AB</LessonTaskChoice>
          </div>
          <p className="rounded-xl bg-rose-50 p-3 text-center font-black text-rose-900">Wybierz wszystkie krawędzie {mode === "parallel" ? "równoległe" : "prostopadłe"} do AB.</p>
          <div className="grid grid-cols-3 gap-2">{options.map((edge) => <LessonTaskChoice key={edge} selected={selected.includes(edge)} disabled={readOnly || feedback !== null} onClick={() => setSelected((current) => current.includes(edge) ? current.filter((item) => item !== edge) : [...current, edge])} className="text-lg">{edge}</LessonTaskChoice>)}</div>
          <button type="button" disabled={readOnly || feedback !== null} onClick={check} className="min-h-12 w-full rounded-xl bg-violet-700 font-black text-white disabled:opacity-40">Sprawdź wybór</button>
          {feedback ? <p className={`rounded-xl p-3 text-center font-black ${feedback.startsWith("Brawo") ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
          <div className="space-y-2 text-sm font-bold text-slate-700"><p><b>Równoległe</b> biegną w tym samym kierunku i się nie przecinają.</p><p><b>Prostopadłe</b> spotykają się pod kątem prostym.</p></div>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function FormulaLab({ area, readOnly }: { area: boolean; readOnly: boolean }) {
  const [kind, setKind] = useState<SolidKind>("cuboid");
  const [unfold, setUnfold] = useState(area ? 1 : 0);
  return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 1" heading={area ? "Pole powierzchni bryły" : "Suma długości wszystkich krawędzi"} description={area ? "Rozłóż bryłę do siatki. Pole powierzchni to suma pól wszystkich sześciu ścian." : "Wyobraź sobie, że każda krawędź jest kawałkiem drutu. Dodajemy długości wszystkich dwunastu krawędzi."}>
      <div className="space-y-5" data-solid-layout="model-first">
        <div className="mx-auto w-full max-w-4xl" data-solid-model-position="top">
          <SpatialModel kind={kind} setKind={setKind} unfold={area ? unfold : 0} setUnfold={area ? setUnfold : undefined} highlight={area ? "none" : "wire"} readOnly={readOnly} />
        </div>
        <div className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-violet-300 bg-violet-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-violet-700">Prostopadłościan</p>
            {area ? <p className="mt-2 whitespace-nowrap text-center text-xl font-black text-slate-950 sm:text-2xl">P = 2ab + 2ac + 2bc</p> : <><p className="mt-2 text-center text-2xl font-black text-slate-950">4a + 4b + 4c</p><p className="text-center text-lg font-black text-violet-800">czyli 4(a + b + c)</p></>}
          </div>
          <div className="rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-700">Sześcian</p>
            <p className="mt-2 text-center text-2xl font-black text-slate-950">{area ? "P = 6a²" : "12a"}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 font-bold leading-relaxed text-amber-950 sm:col-span-2">{area ? "W prostopadłościanie są po dwie jednakowe ściany o polach ab, ac i bc. W sześcianie wszystkie 6 ścian ma pole a²." : "W prostopadłościanie są cztery krawędzie długości a, cztery długości b i cztery długości c. W sześcianie wszystkie 12 krawędzi ma długość a."}</div>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

export function CuboidCubeLessonLab({ activity, readOnly = false, onResultChange }: { activity: CuboidCubeActivity; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [kind, setKind] = useState<SolidKind>("cuboid");
  const [unfold, setUnfold] = useState(0);
  if (activity === "edge-practice" || activity === "area-practice" || activity === "mixed-practice") return <CalculationSeries activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "elements") return <ElementsLab readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "relations") return <RelationsLab readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "edge-formulas") return <FormulaLab area={false} readOnly={readOnly} />;
  if (activity === "area-formulas") return <FormulaLab area readOnly={readOnly} />;
  if (activity === "net") return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 1" heading="Od bryły do siatki" description="Obracaj bryłę, a następnie rozłóż jej sześć ścian na płaszczyźnie.">
      <div data-solid-layout="model-first">
        <div className="mx-auto w-full max-w-4xl" data-solid-model-position="top">
          <SpatialModel kind={kind} setKind={setKind} unfold={unfold} setUnfold={setUnfold} readOnly={readOnly} />
        </div>
      </div>
    </LessonTaskFrame>
  );
  return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 1" heading="Prostopadłościan i sześcian" description="Obejrzyj obie bryły z każdej strony. Sześcian jest szczególnym prostopadłościanem: wszystkie jego krawędzie mają tę samą długość.">
      <div className="space-y-5" data-solid-layout="model-first">
        <div className="mx-auto w-full max-w-4xl" data-solid-model-position="top">
          <SpatialModel kind={kind} setKind={setKind} readOnly={readOnly} />
        </div>
        <div className="mx-auto grid w-full max-w-4xl gap-3 sm:grid-cols-2"><p className="rounded-2xl bg-violet-50 p-4 font-bold text-violet-950"><b>Prostopadłościan:</b> przeciwległe ściany są jednakowymi prostokątami.</p><p className="rounded-2xl bg-cyan-50 p-4 font-bold text-cyan-950"><b>Sześcian:</b> wszystkie ściany są jednakowymi kwadratami.</p></div>
      </div>
    </LessonTaskFrame>
  );
}
