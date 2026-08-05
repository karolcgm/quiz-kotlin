"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type RightPrismActivity = "classification" | "bases" | "counts";

export function rightPrismActivityFromStageId(stageId: string): RightPrismActivity {
  if (stageId.includes("counts")) return "counts";
  if (stageId.includes("bases")) return "bases";
  return "classification";
}

type SolidVariant = "right-prism" | "oblique-prism" | "pyramid";
type BaseShape = "regular" | "rectangle" | "trapezoid" | "rhombus";

function prismBaseVertices(sides: number, baseShape: BaseShape) {
  if (sides === 4 && baseShape === "rectangle") {
    return [[-1.55, -0.8], [1.55, -0.8], [1.55, 0.8], [-1.55, 0.8]] as const;
  }
  if (sides === 4 && baseShape === "trapezoid") {
    return [[-1.5, -0.85], [1.5, -0.85], [0.85, 0.85], [-0.85, 0.85]] as const;
  }
  if (sides === 4 && baseShape === "rhombus") {
    return [[0, -1.4], [1.15, 0], [0, 1.4], [-1.15, 0]] as const;
  }
  const radius = sides === 4 ? 1.25 : 1.35;
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
  });
}

function triangleGeometry(points: readonly THREE.Vector3[], triangles: readonly [number, number, number][]) {
  const values: number[] = [];
  triangles.forEach(([a, b, c]) => {
    [points[a], points[b], points[c]].forEach((point) => values.push(point.x, point.y, point.z));
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function prismGeometry(sides: number, variant: SolidVariant, baseShape: BaseShape) {
  const height = 2.5;
  const shift = variant === "oblique-prism" ? 0.85 : 0;
  const bottom = prismBaseVertices(sides, baseShape).map(([x, z]) => new THREE.Vector3(x, -height / 2, z));
  const top = variant === "pyramid"
    ? [new THREE.Vector3(0.2, height / 2, 0)]
    : bottom.map((point) => new THREE.Vector3(point.x + shift, height / 2, point.z));

  const baseTriangles: [number, number, number][] = [];
  for (let index = 1; index < sides - 1; index += 1) baseTriangles.push([0, index + 1, index]);

  const sidePoints = [...bottom, ...top];
  const sideTriangles: [number, number, number][] = [];
  const edgePairs: [THREE.Vector3, THREE.Vector3][] = [];

  for (let index = 0; index < sides; index += 1) {
    const next = (index + 1) % sides;
    edgePairs.push([bottom[index], bottom[next]]);
    if (variant === "pyramid") {
      sideTriangles.push([index, next, sides]);
      edgePairs.push([bottom[index], top[0]]);
    } else {
      sideTriangles.push([index, next, sides + next], [index, sides + next, sides + index]);
      edgePairs.push([top[index], top[next]], [bottom[index], top[index]]);
    }
  }

  const topGeometry = variant === "pyramid"
    ? null
    : triangleGeometry(top, Array.from({ length: Math.max(0, sides - 2) }, (_, index) => [0, index + 1, index + 2] as [number, number, number]));

  const edgeValues = edgePairs.flatMap(([start, end]) => [start.x, start.y, start.z, end.x, end.y, end.z]);
  const edges = new THREE.BufferGeometry();
  edges.setAttribute("position", new THREE.Float32BufferAttribute(edgeValues, 3));

  return {
    base: triangleGeometry(bottom, baseTriangles),
    top: topGeometry,
    sides: triangleGeometry(sidePoints, sideTriangles),
    edges,
  };
}

function SpatialSolid({ sides, variant, rotationY = 0, baseShape = "regular" }: { sides: number; variant: SolidVariant; rotationY?: number; baseShape?: BaseShape }) {
  const geometry = useMemo(() => prismGeometry(sides, variant, baseShape), [baseShape, sides, variant]);
  useEffect(() => () => {
    geometry.base.dispose();
    geometry.top?.dispose();
    geometry.sides.dispose();
    geometry.edges.dispose();
  }, [geometry]);

  return (
    <group rotation={[0, rotationY + 0.45, 0]} position={[0, 0.1, 0]}>
      <mesh geometry={geometry.base}>
        <meshStandardMaterial color="#a78bfa" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {geometry.top ? (
        <mesh geometry={geometry.top}>
          <meshStandardMaterial color="#c4b5fd" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
      <mesh geometry={geometry.sides}>
        <meshStandardMaterial color={variant === "pyramid" ? "#fbbf24" : "#67e8f9"} transparent opacity={0.78} roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={geometry.edges}>
        <lineBasicMaterial color="#172554" linewidth={2} />
      </lineSegments>
    </group>
  );
}

function SolidCanvas({ sides, variant, rotationY = 0, label, compact = false, baseShape = "regular" }: { sides: number; variant: SolidVariant; rotationY?: number; label: string; compact?: boolean; baseShape?: BaseShape }) {
  return (
    <div className={`${compact ? "h-36" : "h-44"} overflow-hidden rounded-2xl bg-slate-950`} role="img" aria-label={label}>
      <Canvas camera={{ position: compact ? [5.8, 4.6, 7.5] : [4.5, 3.6, 5.8], fov: compact ? 38 : 35 }}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />
        <directionalLight position={[-4, 2, -3]} intensity={0.8} />
        <SpatialSolid sides={sides} variant={variant} rotationY={rotationY} baseShape={baseShape} />
      </Canvas>
    </div>
  );
}

const PRISM_NAMES: Record<number, string> = {
  3: "graniastosłup trójkątny",
  4: "graniastosłup czworokątny",
  5: "graniastosłup pięciokątny",
  6: "graniastosłup sześciokątny",
};

const BASE_NAMES: Record<number, string> = {
  3: "trójkąt",
  4: "czworokąt",
  5: "pięciokąt",
  6: "sześciokąt",
};

function ClassificationSlide({ readOnly }: { readOnly: boolean }) {
  const [rotation, setRotation] = useState(0);
  return (
    <LessonTaskFrame
      eyebrow="Dział 9 · Temat 2"
      heading="Jak dzielimy bryły przestrzenne?"
      description="Spójrz na schemat i porównaj położenie ścian bocznych oraz kształt podstawy."
    >
      <div className="space-y-4">
        <div className="mx-auto w-fit rounded-2xl bg-violet-700 px-6 py-3 text-center text-lg font-black text-white">Bryły przestrzenne</div>
        <div className="text-center text-3xl font-black text-violet-500" aria-hidden="true">↓</div>
        <div className="space-y-2" data-classification-layout="three-column">
          <div className="hidden grid-cols-3 gap-2 min-[480px]:grid">
            <h3 className="col-span-2 rounded-xl bg-cyan-100 px-3 py-2 text-center text-lg font-black text-cyan-950">Graniastosłupy</h3>
            <h3 className="rounded-xl bg-amber-100 px-3 py-2 text-center text-lg font-black text-amber-950">Ostrosłupy</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
            <section className="rounded-2xl border-4 border-violet-600 bg-violet-50 p-2 shadow-md">
              <p className="mb-2 text-center text-xs font-black uppercase tracking-wide text-violet-700 min-[480px]:hidden">Graniastosłupy</p>
              <SolidCanvas compact sides={4} variant="right-prism" rotationY={rotation} label="Prosty graniastosłup czworokątny" />
              <p className="mt-2 text-center text-lg font-black text-violet-950">Proste</p>
              <p className="min-h-10 text-center text-xs font-bold leading-snug text-slate-700">np. prostopadłościan i sześcian</p>
              <p className="mt-2 rounded-lg bg-violet-700 px-2 py-1 text-center text-xs font-black text-white">TEGO SIĘ UCZYMY</p>
            </section>
            <section className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-2">
              <p className="mb-2 text-center text-xs font-black uppercase tracking-wide text-slate-500 min-[480px]:hidden">Graniastosłupy</p>
              <SolidCanvas compact sides={4} variant="oblique-prism" rotationY={rotation} label="Pochyły graniastosłup czworokątny" />
              <p className="mt-2 text-center text-lg font-black text-slate-800">Pochyłe</p>
              <p className="min-h-10 text-center text-xs font-bold leading-snug text-slate-500">informacja dodatkowa</p>
            </section>
            <section className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-2">
              <p className="mb-2 text-center text-xs font-black uppercase tracking-wide text-slate-500 min-[480px]:hidden">Ostrosłupy</p>
              <SolidCanvas compact sides={4} variant="pyramid" rotationY={rotation} label="Ostrosłup czworokątny" />
              <p className="mt-2 text-center text-lg font-black text-slate-800">Ostrosłupy</p>
              <p className="min-h-10 text-center text-xs font-bold leading-snug text-slate-500">informacja dodatkowa</p>
            </section>
          </div>
        </div>
        <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-center font-black text-cyan-950">W tym temacie uczysz się tylko graniastosłupów prostych.</p>
        <div className="flex justify-center gap-2">
          <button type="button" disabled={readOnly} onClick={() => setRotation((value) => value - 0.45)} className="rounded-xl bg-indigo-100 px-4 py-2 font-black text-indigo-950 disabled:opacity-40">↶ Obróć</button>
          <button type="button" disabled={readOnly} onClick={() => setRotation((value) => value + 0.45)} className="rounded-xl bg-indigo-100 px-4 py-2 font-black text-indigo-950 disabled:opacity-40">Obróć ↷</button>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function BasesSlide({ readOnly }: { readOnly: boolean }) {
  const [sides, setSides] = useState(4);
  const [baseShape, setBaseShape] = useState<BaseShape>("trapezoid");
  const [rotation, setRotation] = useState(0);
  const baseDetail = sides === 4
    ? baseShape === "regular" ? "kwadrat" : baseShape === "rectangle" ? "prostokąt" : baseShape === "trapezoid" ? "trapez" : "romb"
    : BASE_NAMES[sides];
  return (
    <LessonTaskFrame
      eyebrow="Dział 9 · Temat 2"
      heading="Nazwa graniastosłupa i jego podstawa"
      description="Graniastosłup trójkątny ma w podstawie trójkąt, czworokątny — czworokąt, a pięciokątny — pięciokąt."
    >
      <div className="space-y-4">
        <div className="mx-auto max-w-xl">
          <SolidCanvas sides={sides} variant="right-prism" rotationY={rotation} baseShape={baseShape} label={`${PRISM_NAMES[sides]} z podstawą: ${baseDetail}`} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[3, 4, 5, 6].map((value) => (
            <LessonTaskChoice key={value} selected={sides === value} disabled={readOnly} onClick={() => { setSides(value); setBaseShape(value === 4 ? "trapezoid" : "regular"); }}>
              {value === 3 ? "Trójkątny" : value === 4 ? "Czworokątny" : value === 5 ? "Pięciokątny" : "Sześciokątny"}
            </LessonTaskChoice>
          ))}
        </div>
        {sides === 4 ? (
          <div className="space-y-2 rounded-2xl bg-amber-50 p-3">
            <p className="text-center font-black text-amber-950">Podstawa może być dowolnym czworokątem — nie tylko kwadratem.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["regular", "rectangle", "trapezoid", "rhombus"] as const).map((shape) => (
                <LessonTaskChoice key={shape} selected={baseShape === shape} disabled={readOnly} onClick={() => setBaseShape(shape)}>
                  {shape === "regular" ? "Kwadrat" : shape === "rectangle" ? "Prostokąt" : shape === "trapezoid" ? "Trapez" : "Romb"}
                </LessonTaskChoice>
              ))}
            </div>
          </div>
        ) : null}
        <div className="rounded-2xl bg-cyan-50 p-4 text-center">
          <p className="text-xl font-black text-cyan-950">{PRISM_NAMES[sides]}</p>
          <p className="mt-1 font-bold text-slate-700">Ma dwie jednakowe, równoległe podstawy. Każda podstawa to {BASE_NAMES[sides]}{sides === 4 ? ` — na rysunku jest to ${baseDetail}` : ""}.</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div><strong className="block text-2xl text-violet-700">{sides + 2}</strong><span className="text-sm font-bold">ścian</span></div>
            <div><strong className="block text-2xl text-cyan-700">{2 * sides}</strong><span className="text-sm font-bold">wierzchołków</span></div>
            <div><strong className="block text-2xl text-amber-700">{3 * sides}</strong><span className="text-sm font-bold">krawędzi</span></div>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <button type="button" disabled={readOnly} onClick={() => setRotation((value) => value - 0.45)} className="rounded-xl bg-indigo-100 px-4 py-2 font-black text-indigo-950 disabled:opacity-40">↶ Obróć</button>
          <button type="button" disabled={readOnly} onClick={() => setRotation((value) => value + 0.45)} className="rounded-xl bg-indigo-100 px-4 py-2 font-black text-indigo-950 disabled:opacity-40">Obróć ↷</button>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

type CountTask = {
  kind: "counts";
  sides: number;
  prompt: string;
  answer: { faces: number; vertices: number; edges: number };
} | {
  kind: "inverse";
  prompt: string;
  answer: string;
  choices: readonly string[];
};

const COUNT_TASKS: readonly CountTask[] = [
  { kind: "counts", sides: 3, prompt: "Ile ścian, wierzchołków i krawędzi ma graniastosłup trójkątny?", answer: { faces: 5, vertices: 6, edges: 9 } },
  { kind: "counts", sides: 4, prompt: "Ile ścian, wierzchołków i krawędzi ma graniastosłup czworokątny?", answer: { faces: 6, vertices: 8, edges: 12 } },
  { kind: "counts", sides: 5, prompt: "Ile ścian, wierzchołków i krawędzi ma graniastosłup pięciokątny?", answer: { faces: 7, vertices: 10, edges: 15 } },
  { kind: "inverse", prompt: "Jaki graniastosłup ma 10 wierzchołków?", answer: "Pięciokątny", choices: ["Trójkątny", "Czworokątny", "Pięciokątny", "Sześciokątny"] },
  { kind: "inverse", prompt: "Jaki graniastosłup ma 8 ścian?", answer: "Sześciokątny", choices: ["Czworokątny", "Pięciokątny", "Sześciokątny", "Ośmiokątny"] },
  { kind: "inverse", prompt: "Jaki graniastosłup ma dokładnie 10 krawędzi?", answer: "Żaden", choices: ["Trójkątny", "Czworokątny", "Pięciokątny", "Żaden"] },
];

function correctTaskAnswer(task: CountTask) {
  if (task.kind === "inverse") return task.answer;
  return `${task.answer.faces} ścian, ${task.answer.vertices} wierzchołków i ${task.answer.edges} krawędzi`;
}

function CountsPractice({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [faces, setFaces] = useState("");
  const [vertices, setVertices] = useState("");
  const [edges, setEdges] = useState("");
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "empty" | null>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = COUNT_TASKS[taskIndex];

  const resetAnswer = () => {
    setFaces("");
    setVertices("");
    setEdges("");
    setChoice("");
    setFeedback(null);
  };

  const advance = () => {
    if (taskIndex >= COUNT_TASKS.length - 1) {
      onResultChange?.(!mistakeMade && feedback !== "wrong", task.kind === "inverse" ? choice : `${faces},${vertices},${edges}`);
      return;
    }
    setTaskIndex((index) => index + 1);
    resetAnswer();
  };

  const check = () => {
    const answer = task.kind === "inverse" ? choice : `${faces},${vertices},${edges}`;
    const empty = task.kind === "inverse" ? !choice : !faces || !vertices || !edges;
    if (empty) {
      setFeedback("empty");
      return;
    }
    const correct = task.kind === "inverse"
      ? choice === task.answer
      : Number(faces) === task.answer.faces && Number(vertices) === task.answer.vertices && Number(edges) === task.answer.edges;
    if (correct) {
      setFeedback("correct");
      window.setTimeout(() => {
        if (taskIndex >= COUNT_TASKS.length - 1) onResultChange?.(!mistakeMade, answer);
        else {
          setTaskIndex((index) => index + 1);
          resetAnswer();
        }
      }, 700);
    } else {
      setMistakeMade(true);
      setFeedback("wrong");
      onResultChange?.(false, answer);
    }
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 9 · Temat 2"
      heading="Ściany, krawędzie i wierzchołki"
      description="Przyjrzyj się podstawie graniastosłupa i policz wskazane elementy."
      questionNumber={taskIndex + 1}
      questionCount={COUNT_TASKS.length}
    >
      <div className="space-y-4">
        <div className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
          <h3 className="text-xl font-black text-slate-950 sm:text-2xl">{task.prompt}</h3>
        </div>
        {task.kind === "counts" ? (
          <>
            <div className="mx-auto max-w-lg"><SolidCanvas sides={task.sides} variant="right-prism" label={PRISM_NAMES[task.sides]} /></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {([
                ["Ściany", faces, setFaces, ["5", "6", "7", "8"]],
                ["Wierzchołki", vertices, setVertices, ["6", "8", "10", "12"]],
                ["Krawędzie", edges, setEdges, ["9", "10", "12", "15", "18"]],
              ] as const).map(([label, value, setter, options]) => (
                <label key={label} className="rounded-2xl bg-indigo-50 p-3 text-center font-black text-indigo-950">
                  <span className="mb-2 block">{label}</span>
                  <select aria-label={label} value={value} disabled={readOnly || feedback === "correct" || feedback === "wrong"} onChange={(event) => setter(event.target.value)} className="h-12 w-full rounded-xl border-2 border-indigo-300 bg-white px-3 text-center text-lg font-black">
                    <option value="">wybierz</option>
                    {options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {task.choices.map((option) => (
              <LessonTaskChoice key={option} selected={choice === option} disabled={readOnly || feedback === "correct" || feedback === "wrong"} onClick={() => setChoice(option)}>{option}</LessonTaskChoice>
            ))}
          </div>
        )}
        {feedback === "empty" ? <p className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij wszystkie wymagane pola.</p> : null}
        {feedback === "correct" ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Poprawna odpowiedź.</p> : null}
        {feedback === "wrong" ? (
          <div className="space-y-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-bold text-amber-950">
            <p>Spróbuj innym razem. Poprawny wynik to {correctTaskAnswer(task)}. Dziś bez punktu.</p>
            <button type="button" onClick={advance} className="rounded-xl bg-violet-700 px-5 py-3 font-black text-white">Przejdź dalej bez punktu</button>
          </div>
        ) : null}
        {feedback !== "wrong" ? (
          <button type="button" disabled={readOnly || feedback === "correct"} onClick={check} className="w-full rounded-2xl bg-violet-700 px-5 py-3 font-black text-white disabled:opacity-50">Sprawdź odpowiedź</button>
        ) : null}
      </div>
    </LessonTaskFrame>
  );
}

export function RightPrismLessonLab({
  activity,
  readOnly = false,
  onResultChange,
}: {
  activity: RightPrismActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}) {
  if (activity === "classification") return <ClassificationSlide readOnly={readOnly} />;
  if (activity === "bases") return <BasesSlide readOnly={readOnly} />;
  return <CountsPractice readOnly={readOnly} onResultChange={onResultChange} />;
}
