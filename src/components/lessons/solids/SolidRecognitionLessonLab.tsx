"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type SolidRecognitionActivity = "match";

export function solidRecognitionActivityFromStageId(): SolidRecognitionActivity {
  return "match";
}

type SolidKind =
  | "cube"
  | "cuboid"
  | "triangular-prism"
  | "pentagonal-prism"
  | "triangular-pyramid"
  | "quadrilateral-pyramid"
  | "pentagonal-pyramid"
  | "cylinder"
  | "cone"
  | "sphere";

type MatchTask = {
  kind: SolidKind;
  answer: string;
  choices: readonly string[];
  rotation: number;
};

const MATCH_TASKS: readonly MatchTask[] = [
  { kind: "cube", answer: "Sześcian", choices: ["Sześcian", "Prostopadłościan", "Walec", "Ostrosłup czworokątny"], rotation: 0.55 },
  { kind: "cuboid", answer: "Prostopadłościan", choices: ["Sześcian", "Prostopadłościan", "Graniastosłup trójkątny", "Walec"], rotation: -0.55 },
  { kind: "triangular-prism", answer: "Graniastosłup trójkątny", choices: ["Graniastosłup trójkątny", "Ostrosłup trójkątny", "Prostopadłościan", "Stożek"], rotation: 0.6 },
  { kind: "pentagonal-prism", answer: "Graniastosłup pięciokątny", choices: ["Graniastosłup czworokątny", "Graniastosłup pięciokątny", "Ostrosłup pięciokątny", "Walec"], rotation: -0.35 },
  { kind: "triangular-pyramid", answer: "Ostrosłup trójkątny", choices: ["Graniastosłup trójkątny", "Ostrosłup trójkątny", "Ostrosłup czworokątny", "Stożek"], rotation: 0.45 },
  { kind: "quadrilateral-pyramid", answer: "Ostrosłup czworokątny", choices: ["Sześcian", "Graniastosłup czworokątny", "Ostrosłup czworokątny", "Stożek"], rotation: -0.6 },
  { kind: "pentagonal-pyramid", answer: "Ostrosłup pięciokątny", choices: ["Graniastosłup pięciokątny", "Ostrosłup trójkątny", "Ostrosłup pięciokątny", "Stożek"], rotation: 0.35 },
  { kind: "cylinder", answer: "Walec", choices: ["Walec", "Stożek", "Kula", "Prostopadłościan"], rotation: 0.4 },
  { kind: "cone", answer: "Stożek", choices: ["Ostrosłup czworokątny", "Walec", "Stożek", "Kula"], rotation: -0.35 },
  { kind: "sphere", answer: "Kula", choices: ["Koło", "Kula", "Walec", "Stożek"], rotation: 0 },
];

function regularRing(sides: number, y: number, radius = 1.25) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  });
}

function geometryFromTriangles(triangles: readonly (readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3])[]) {
  const values = triangles.flatMap((triangle) => triangle.flatMap((point) => [point.x, point.y, point.z]));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function exactEdges(pairs: readonly (readonly [THREE.Vector3, THREE.Vector3])[]) {
  const values = pairs.flatMap(([start, end]) => [start.x, start.y, start.z, end.x, end.y, end.z]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
  return geometry;
}

function prismGeometry(sides: number) {
  const bottom = regularRing(sides, -1.15);
  const top = regularRing(sides, 1.15);
  const triangles: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [];
  const pairs: [THREE.Vector3, THREE.Vector3][] = [];
  for (let index = 1; index < sides - 1; index += 1) {
    triangles.push([bottom[0], bottom[index + 1], bottom[index]], [top[0], top[index], top[index + 1]]);
  }
  bottom.forEach((point, index) => {
    const next = (index + 1) % sides;
    triangles.push([point, bottom[next], top[next]], [point, top[next], top[index]]);
    pairs.push([point, bottom[next]], [top[index], top[next]], [point, top[index]]);
  });
  return { surface: geometryFromTriangles(triangles), edges: exactEdges(pairs) };
}

function pyramidGeometry(sides: number) {
  const base = regularRing(sides, -1.15);
  const apex = new THREE.Vector3(0, 1.5, 0);
  const triangles: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [];
  const pairs: [THREE.Vector3, THREE.Vector3][] = [];
  for (let index = 1; index < sides - 1; index += 1) triangles.push([base[0], base[index + 1], base[index]]);
  base.forEach((point, index) => {
    const next = (index + 1) % sides;
    triangles.push([point, base[next], apex]);
    pairs.push([point, base[next]], [point, apex]);
  });
  return { surface: geometryFromTriangles(triangles), edges: exactEdges(pairs) };
}

function Polyhedron({ family, sides, rotation }: { family: "prism" | "pyramid"; sides: number; rotation: number }) {
  const geometry = useMemo(() => family === "prism" ? prismGeometry(sides) : pyramidGeometry(sides), [family, sides]);
  useEffect(() => () => { geometry.surface.dispose(); geometry.edges.dispose(); }, [geometry]);
  return <group rotation={[0, rotation, 0]}>
    <mesh geometry={geometry.surface}><meshStandardMaterial color={family === "prism" ? "#67e8f9" : "#fbbf24"} transparent opacity={0.82} roughness={0.4} side={THREE.DoubleSide} /></mesh>
    <lineSegments geometry={geometry.edges}><lineBasicMaterial color="#172554" /></lineSegments>
  </group>;
}

function BoxSolid({ cube, rotation }: { cube: boolean; rotation: number }) {
  const geometry = useMemo(() => new THREE.BoxGeometry(cube ? 2.25 : 2.9, cube ? 2.25 : 1.75, cube ? 2.25 : 1.55), [cube]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  useEffect(() => () => { geometry.dispose(); edges.dispose(); }, [edges, geometry]);
  return <group rotation={[0, rotation, 0]}><mesh geometry={geometry}><meshStandardMaterial color="#67e8f9" transparent opacity={0.82} roughness={0.42} /></mesh><lineSegments geometry={edges}><lineBasicMaterial color="#172554" /></lineSegments></group>;
}

function RoundedSolid({ kind }: { kind: "cylinder" | "cone" | "sphere" }) {
  if (kind === "sphere") return <mesh><sphereGeometry args={[1.35, 40, 28]} /><meshStandardMaterial color="#a78bfa" roughness={0.3} metalness={0.08} /></mesh>;
  if (kind === "cone") return <mesh><coneGeometry args={[1.3, 2.8, 40]} /><meshStandardMaterial color="#fbbf24" roughness={0.38} /></mesh>;
  return <mesh><cylinderGeometry args={[1.2, 1.2, 2.6, 40]} /><meshStandardMaterial color="#a78bfa" roughness={0.36} /></mesh>;
}

function SolidPicture({ task, rotation }: { task: MatchTask; rotation: number }) {
  return <div className="h-72 overflow-hidden rounded-3xl bg-slate-950" role="img" aria-label="Model bryły przestrzennej do rozpoznania">
    <Canvas camera={{ position: [4.5, 3.3, 5.7], fov: 34 }}>
      <ambientLight intensity={1.45} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.75} />
      {task.kind === "cube" ? <BoxSolid cube rotation={rotation} /> : null}
      {task.kind === "cuboid" ? <BoxSolid cube={false} rotation={rotation} /> : null}
      {task.kind === "triangular-prism" ? <Polyhedron family="prism" sides={3} rotation={rotation} /> : null}
      {task.kind === "pentagonal-prism" ? <Polyhedron family="prism" sides={5} rotation={rotation} /> : null}
      {task.kind === "triangular-pyramid" ? <Polyhedron family="pyramid" sides={3} rotation={rotation} /> : null}
      {task.kind === "quadrilateral-pyramid" ? <Polyhedron family="pyramid" sides={4} rotation={rotation} /> : null}
      {task.kind === "pentagonal-pyramid" ? <Polyhedron family="pyramid" sides={5} rotation={rotation} /> : null}
      {task.kind === "cylinder" || task.kind === "cone" || task.kind === "sphere" ? <RoundedSolid kind={task.kind} /> : null}
    </Canvas>
  </div>;
}

function MatchingSeries({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [rotation, setRotation] = useState(MATCH_TASKS[0].rotation);
  const [feedback, setFeedback] = useState<"empty" | "correct" | "wrong" | null>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = MATCH_TASKS[index];

  const advance = () => {
    if (index === MATCH_TASKS.length - 1) {
      onResultChange?.(!mistakeMade && feedback !== "wrong", choice);
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setChoice("");
    setRotation(MATCH_TASKS[nextIndex].rotation);
    setFeedback(null);
  };

  const check = () => {
    if (!choice) { setFeedback("empty"); return; }
    if (choice === task.answer) {
      setFeedback("correct");
      window.setTimeout(() => index === MATCH_TASKS.length - 1 ? onResultChange?.(!mistakeMade, choice) : advance(), 700);
    } else {
      setMistakeMade(true);
      setFeedback("wrong");
    }
  };

  return <LessonTaskFrame eyebrow="Dział 9 · Temat 8" heading="Dopasuj obrazek do nazwy" description="Obejrzyj bryłę z każdej strony i wybierz jej nazwę." questionNumber={index + 1} questionCount={MATCH_TASKS.length}>
    <div className="space-y-4">
      <SolidPicture task={task} rotation={rotation} />
      <div className="flex justify-center gap-2">
        <button type="button" disabled={readOnly || feedback === "correct" || feedback === "wrong"} onClick={() => setRotation((value) => value - 0.45)} className="rounded-xl bg-indigo-100 px-4 py-2 font-black text-indigo-950 disabled:opacity-40">↶ Obróć</button>
        <button type="button" disabled={readOnly || feedback === "correct" || feedback === "wrong"} onClick={() => setRotation((value) => value + 0.45)} className="rounded-xl bg-indigo-100 px-4 py-2 font-black text-indigo-950 disabled:opacity-40">Obróć ↷</button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {task.choices.map((option) => <LessonTaskChoice key={option} selected={choice === option} disabled={readOnly || feedback === "correct" || feedback === "wrong"} onClick={() => { setChoice(option); setFeedback(null); }}>{option}</LessonTaskChoice>)}
      </div>
      {feedback === "empty" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Wybierz nazwę bryły.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! To jest {task.answer.toLocaleLowerCase("pl-PL")}.</p> : null}
      {feedback === "wrong" ? <div className="space-y-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-bold text-amber-950"><p>Spróbuj innym razem. Poprawna odpowiedź to: {task.answer}. Dziś bez punktu.</p><button type="button" onClick={advance} className="rounded-xl bg-violet-700 px-5 py-3 font-black text-white">Przejdź dalej bez punktu</button></div> : <button type="button" disabled={readOnly || feedback === "correct"} onClick={check} className="w-full rounded-2xl bg-violet-700 px-5 py-3 font-black text-white disabled:opacity-50">Sprawdź odpowiedź</button>}
    </div>
  </LessonTaskFrame>;
}

export function SolidRecognitionLessonLab({ readOnly = false, onResultChange }: { activity?: SolidRecognitionActivity; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  return <MatchingSeries readOnly={readOnly} onResultChange={onResultChange} />;
}
