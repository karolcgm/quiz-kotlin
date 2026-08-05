"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type PrismNetsActivity = "unfold" | "recognize" | "draw";

export function prismNetsActivityFromStageId(stageId: string): PrismNetsActivity {
  if (stageId.includes("recognize")) return "recognize";
  if (stageId.includes("draw")) return "draw";
  return "unfold";
}

const PRISM_LABELS: Record<number, string> = {
  3: "graniastosłup trójkątny",
  4: "graniastosłup czworokątny",
  5: "graniastosłup pięciokątny",
  6: "graniastosłup sześciokątny",
};

function mix(a: number, b: number, progress: number) {
  return a + (b - a) * progress;
}

function mixPoint(a: [number, number, number], b: [number, number, number], progress: number): [number, number, number] {
  return [mix(a[0], b[0], progress), mix(a[1], b[1], progress), mix(a[2], b[2], progress)];
}

export function prismFoldedSidePose(sides: number, index: number, radius = 1.15) {
  const angle = (vertexIndex: number) => -Math.PI / 2 + (vertexIndex * Math.PI * 2) / sides;
  const start = { x: Math.cos(angle(index)) * radius, z: Math.sin(angle(index)) * radius };
  const end = { x: Math.cos(angle((index + 1) % sides)) * radius, z: Math.sin(angle((index + 1) % sides)) * radius };
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  return {
    start,
    end,
    width: Math.hypot(dx, dz),
    position: [(start.x + end.x) / 2, 0, (start.z + end.z) / 2] as [number, number, number],
    rotationY: Math.atan2(-dz, dx),
  };
}

function RegularPolygonFace({ sides, position, rotation, color }: { sides: number; position: [number, number, number]; rotation: [number, number, number]; color: string }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 1.15;
    for (let index = 0; index < sides; index += 1) {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [sides]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useEffect(() => () => {
    edges.dispose();
    geometry.dispose();
  }, [edges, geometry]);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.45} />
      </mesh>
      <lineSegments geometry={edges} position={[0, 0, 0.012]}>
        <lineBasicMaterial color="#312e81" />
      </lineSegments>
    </group>
  );
}

function RectangleFace({ width, height, position, rotation, color }: { width: number; height: number; position: [number, number, number]; rotation: [number, number, number]; color: string }) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(width, height), [height, width]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  useEffect(() => () => {
    edges.dispose();
    geometry.dispose();
  }, [edges, geometry]);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.9} roughness={0.5} />
      </mesh>
      <lineSegments geometry={edges} position={[0, 0, 0.012]}>
        <lineBasicMaterial color="#172554" />
      </lineSegments>
    </group>
  );
}

function UnfoldingPrism({ sides, progress }: { sides: number; progress: number }) {
  const radius = 1.15;
  const height = 2.35;
  const faceWidth = 2 * radius * Math.sin(Math.PI / sides);
  const apothem = radius * Math.cos(Math.PI / sides);
  const firstX = -((sides - 1) * faceWidth) / 2;
  const lastX = ((sides - 1) * faceWidth) / 2;

  return (
    <group rotation={[0, 0.55 * (1 - progress), 0]} scale={progress > 0.8 ? 0.92 : 1}>
      {Array.from({ length: sides }, (_, index) => {
        const pose = prismFoldedSidePose(sides, index, radius);
        const flatPosition: [number, number, number] = [firstX + index * faceWidth, 0, 0];
        return (
          <RectangleFace
            key={`side-${index}`}
            width={faceWidth}
            height={height}
            position={mixPoint(pose.position, flatPosition, progress)}
            rotation={[0, mix(pose.rotationY, 0, progress), 0]}
            color={index % 2 ? "#67e8f9" : "#a78bfa"}
          />
        );
      })}
      <RegularPolygonFace
        sides={sides}
        position={mixPoint([0, height / 2, 0], [firstX, height / 2 + apothem, 0], progress)}
        rotation={[mix(Math.PI / 2, 0, progress), 0, mix(0, Math.PI / sides, progress)]}
        color="#fbbf24"
      />
      <RegularPolygonFace
        sides={sides}
        position={mixPoint([0, -height / 2, 0], [lastX, -height / 2 - apothem, 0], progress)}
        rotation={[mix(Math.PI / 2, 0, progress), 0, mix(0, Math.PI / sides + Math.PI, progress)]}
        color="#fb7185"
      />
    </group>
  );
}

function UnfoldingCanvas({ sides, progress }: { sides: number; progress: number }) {
  return (
    <div className="h-[270px] overflow-hidden rounded-3xl bg-slate-950" role="img" aria-label={`${PRISM_LABELS[sides]} rozłożony w ${Math.round(progress * 100)} procentach`}>
      <Canvas camera={{ position: [0, 2.1, 7.2], fov: 40 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 6, 8]} intensity={2.1} />
        <UnfoldingPrism sides={sides} progress={progress} />
      </Canvas>
    </div>
  );
}

type InvalidKind = "missing-base" | "missing-side";
type NetBaseShape = "regular" | "rectangle" | "trapezoid";

type NetPoint = { x: number; y: number };

export function netBaseVertices(sides: number, baseShape: NetBaseShape): NetPoint[] {
  if (sides === 4 && baseShape === "rectangle") {
    return [{ x: -1.5, y: -0.8 }, { x: 1.5, y: -0.8 }, { x: 1.5, y: 0.8 }, { x: -1.5, y: 0.8 }];
  }
  if (sides === 4 && baseShape === "trapezoid") {
    return [{ x: -1.5, y: -0.85 }, { x: 1.5, y: -0.85 }, { x: 0.85, y: 0.85 }, { x: -0.85, y: 0.85 }];
  }
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  });
}

function distance(first: NetPoint, second: NetPoint) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function prismNetTargetSideLength(sides: number) {
  if (sides === 6) return 40;
  if (sides === 5) return 46;
  return 52;
}

export function placeBaseOnEdge(vertices: NetPoint[], edgeIndex: number, edgeLeft: number, edgeRight: number, edgeY: number, placement: "above" | "below") {
  const start = vertices[edgeIndex];
  const end = vertices[(edgeIndex + 1) % vertices.length];
  const sourceLength = distance(start, end);
  const targetLength = edgeRight - edgeLeft;
  const scale = targetLength / sourceLength;
  const sourceAngle = Math.atan2(end.y - start.y, end.x - start.x);
  const cosine = Math.cos(-sourceAngle);
  const sine = Math.sin(-sourceAngle);
  const transformed = vertices.map((point) => {
    const sourceX = (point.x - start.x) * scale;
    const sourceY = (point.y - start.y) * scale;
    return {
      x: edgeLeft + sourceX * cosine - sourceY * sine,
      y: edgeY + sourceX * sine + sourceY * cosine,
    };
  });
  const centroidY = transformed.reduce((sum, point) => sum + point.y, 0) / transformed.length;
  const shouldReflect = placement === "above" ? centroidY > edgeY : centroidY < edgeY;
  return shouldReflect ? transformed.map((point) => ({ x: point.x, y: edgeY * 2 - point.y })) : transformed;
}

export function prismNetBasePoints(
  sides: number,
  edgeLeft: number,
  edgeRight: number,
  edgeY: number,
  placement: "above" | "below",
): NetPoint[] {
  const sideLength = edgeRight - edgeLeft;
  const points: NetPoint[] = placement === "above"
    ? [{ x: edgeLeft, y: edgeY }, { x: edgeRight, y: edgeY }]
    : [{ x: edgeRight, y: edgeY }, { x: edgeLeft, y: edgeY }];
  let direction = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);

  for (let index = 2; index < sides; index += 1) {
    direction -= (Math.PI * 2) / sides;
    const previous = points[index - 1];
    points.push({
      x: previous.x + Math.cos(direction) * sideLength,
      y: previous.y + Math.sin(direction) * sideLength,
    });
  }

  return points;
}

function svgPolygonPoints(points: NetPoint[]) {
  return points.map(({ x, y }) => `${x},${y}`).join(" ");
}

function NetDiagram({
  sides,
  invalid,
  className = "",
  baseShape = "regular",
  topAttachIndex = 0,
  bottomAttachIndex = sides - 1,
  showTopBase = true,
  showBottomBase = true,
}: {
  sides: number;
  invalid?: InvalidKind;
  className?: string;
  baseShape?: NetBaseShape;
  topAttachIndex?: number;
  bottomAttachIndex?: number;
  showTopBase?: boolean;
  showBottomBase?: boolean;
}) {
  const faceHeight = 70;
  const visibleSides = invalid === "missing-side" ? sides - 1 : sides;
  const sourceVertices = netBaseVertices(sides, baseShape);
  const sourceEdges = sourceVertices.map((point, index) => distance(point, sourceVertices[(index + 1) % sides]));
  const vertexScale = prismNetTargetSideLength(sides) / sourceEdges[0];
  const vertices = sourceVertices.map((point) => ({ x: point.x * vertexScale, y: point.y * vertexScale }));
  const faceWidths = sourceEdges.map((length) => length * vertexScale).slice(0, visibleSides);
  const stripWidth = faceWidths.reduce((sum, width) => sum + width, 0);
  const startX = (420 - stripWidth) / 2;
  const centerY = 112;
  const topY = centerY - faceHeight / 2;
  const bottomY = centerY + faceHeight / 2;
  const faceStarts = faceWidths.map((_, index) => startX + faceWidths.slice(0, index).reduce((sum, width) => sum + width, 0));
  const safeTopIndex = Math.min(topAttachIndex, visibleSides - 1);
  const safeBottomIndex = Math.min(bottomAttachIndex, visibleSides - 1);
  const topBase = placeBaseOnEdge(vertices, safeTopIndex, faceStarts[safeTopIndex], faceStarts[safeTopIndex] + faceWidths[safeTopIndex], topY, "above");
  const bottomBase = placeBaseOnEdge(vertices, safeBottomIndex, faceStarts[safeBottomIndex], faceStarts[safeBottomIndex] + faceWidths[safeBottomIndex], bottomY, "below");
  return (
    <svg viewBox="0 0 420 230" className={`h-auto w-full ${className}`} role="img" aria-label={`Siatka: ${visibleSides} ścian bocznych i ${invalid === "missing-base" ? 1 : 2} podstawy o ${sides} bokach`}>
      <title>Siatka {PRISM_LABELS[sides]}</title>
      <rect x="1" y="1" width="418" height="228" rx="20" fill="#f8fafc" stroke="#c7d2fe" strokeWidth="2" />
      {faceWidths.map((width, index) => (
        <rect key={index} x={faceStarts[index]} y={centerY - faceHeight / 2} width={width} height={faceHeight} fill={index % 2 ? "#a5f3fc" : "#c4b5fd"} stroke="#312e81" strokeWidth="3" />
      ))}
      {showTopBase ? <polygon points={svgPolygonPoints(topBase)} fill="#fde68a" stroke="#92400e" strokeWidth="3" /> : null}
      {showBottomBase && invalid !== "missing-base" ? (
        <polygon points={svgPolygonPoints(bottomBase)} fill="#fda4af" stroke="#9f1239" strokeWidth="3" />
      ) : null}
    </svg>
  );
}

function UnfoldSlide({ readOnly }: { readOnly: boolean }) {
  const [sides, setSides] = useState(3);
  const [progress, setProgress] = useState(0);
  return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 3" heading="Rozłóż graniastosłup do siatki" description="Każda ściana bryły staje się częścią płaskiej siatki. Dwie podstawy mają taki sam kształt.">
      <div className="space-y-4">
        <UnfoldingCanvas sides={sides} progress={progress} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[3, 4, 5, 6].map((value) => (
            <LessonTaskChoice key={value} selected={sides === value} disabled={readOnly} onClick={() => { setSides(value); setProgress(0); }}>
              {value === 3 ? "Trójkątny" : value === 4 ? "Czworokątny" : value === 5 ? "Pięciokątny" : "Sześciokątny"}
            </LessonTaskChoice>
          ))}
        </div>
        <div className="rounded-2xl bg-cyan-50 p-4">
          <div className="mb-2 flex justify-between text-sm font-black text-cyan-950"><span>Bryła</span><span>Siatka</span></div>
          <input aria-label="Rozłóż graniastosłup do siatki" type="range" min="0" max="100" value={Math.round(progress * 100)} disabled={readOnly} onChange={(event) => setProgress(Number(event.target.value) / 100)} className="w-full accent-violet-700" />
          <p className="mt-2 text-center font-bold text-slate-700">{progress < 0.5 ? "Przesuwaj suwak i obserwuj ściany." : progress < 1 ? "Ściany układają się na jednej płaszczyźnie." : `To jest siatka: ${PRISM_LABELS[sides]}.`}</p>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

type RecognitionTask = {
  sides: number;
  invalid?: InvalidKind;
  baseShape?: NetBaseShape;
  topAttachIndex?: number;
  bottomAttachIndex?: number;
  prompt: string;
  choices: readonly string[];
  answer: string;
};

const RECOGNITION_TASKS: readonly RecognitionTask[] = [
  { sides: 3, topAttachIndex: 0, bottomAttachIndex: 1, prompt: "Jaki graniastosłup powstanie z tej siatki?", choices: ["Trójkątny", "Czworokątny", "Pięciokątny"], answer: "Trójkątny" },
  { sides: 5, topAttachIndex: 2, bottomAttachIndex: 4, prompt: "Jaki graniastosłup powstanie z tej siatki?", choices: ["Czworokątny", "Pięciokątny", "Sześciokątny"], answer: "Pięciokątny" },
  { sides: 6, topAttachIndex: 1, bottomAttachIndex: 4, prompt: "Jaki graniastosłup powstanie z tej siatki?", choices: ["Trójkątny", "Pięciokątny", "Sześciokątny"], answer: "Sześciokątny" },
  { sides: 4, baseShape: "trapezoid", topAttachIndex: 0, bottomAttachIndex: 2, prompt: "Czy z tej siatki można złożyć graniastosłup czworokątny?", choices: ["Tak", "Nie"], answer: "Tak" },
  { sides: 3, invalid: "missing-base", topAttachIndex: 1, prompt: "Czy to jest poprawna siatka graniastosłupa trójkątnego?", choices: ["Tak", "Nie"], answer: "Nie" },
  { sides: 5, invalid: "missing-side", topAttachIndex: 1, bottomAttachIndex: 3, prompt: "Czy to jest poprawna siatka graniastosłupa pięciokątnego?", choices: ["Tak", "Nie"], answer: "Nie" },
];

function RecognizeSlide({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "empty" | null>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = RECOGNITION_TASKS[index];

  const advance = () => {
    if (index === RECOGNITION_TASKS.length - 1) {
      onResultChange?.(false, choice);
      return;
    }
    setIndex((value) => value + 1);
    setChoice("");
    setFeedback(null);
  };

  const check = () => {
    if (!choice) {
      setFeedback("empty");
      return;
    }
    if (choice === task.answer) {
      setFeedback("correct");
      window.setTimeout(() => {
        if (index === RECOGNITION_TASKS.length - 1) onResultChange?.(!mistakeMade, choice);
        else {
          setIndex((value) => value + 1);
          setChoice("");
          setFeedback(null);
        }
      }, 700);
    } else {
      setMistakeMade(true);
      setFeedback("wrong");
      onResultChange?.(false, choice);
    }
  };

  return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 3" heading="Rozpoznaj i sprawdź siatkę" description="Najpierw znajdź dwie podstawy, a potem policz ściany boczne." questionNumber={index + 1} questionCount={RECOGNITION_TASKS.length}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-xl font-black text-slate-950">{task.prompt}</div>
        <NetDiagram sides={task.sides} invalid={task.invalid} baseShape={task.baseShape} topAttachIndex={task.topAttachIndex} bottomAttachIndex={task.bottomAttachIndex} />
        <div className={`grid gap-2 ${task.choices.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {task.choices.map((option) => <LessonTaskChoice key={option} selected={choice === option} disabled={readOnly || feedback === "correct" || feedback === "wrong"} onClick={() => setChoice(option)}>{option}</LessonTaskChoice>)}
        </div>
        {feedback === "empty" ? <p className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Wybierz odpowiedź.</p> : null}
        {feedback === "correct" ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Poprawna odpowiedź.</p> : null}
        {feedback === "wrong" ? (
          <div className="space-y-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-bold text-amber-950">
            <p>Spróbuj innym razem. Poprawny wynik to: {task.answer}. Dziś bez punktu.</p>
            <button type="button" onClick={advance} className="rounded-xl bg-violet-700 px-5 py-3 font-black text-white">Przejdź dalej bez punktu</button>
          </div>
        ) : <button type="button" disabled={readOnly || feedback === "correct"} onClick={check} className="w-full rounded-2xl bg-violet-700 px-5 py-3 font-black text-white disabled:opacity-50">Sprawdź odpowiedź</button>}
      </div>
    </LessonTaskFrame>
  );
}

function DrawingBoard({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const tasks = [
    { sides: 3, baseShape: "regular" as const, baseLabel: "trójkąty" },
    { sides: 4, baseShape: "trapezoid" as const, baseLabel: "trapezy" },
    { sides: 5, baseShape: "regular" as const, baseLabel: "pięciokąty" },
    { sides: 6, baseShape: "regular" as const, baseLabel: "sześciokąty" },
  ];
  const [index, setIndex] = useState(0);
  const [topAttach, setTopAttach] = useState<number | null>(null);
  const [bottomAttach, setBottomAttach] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"empty" | "correct" | null>(null);
  const task = tasks[index];

  const check = () => {
    if (topAttach === null || bottomAttach === null) {
      setFeedback("empty");
      return;
    }
    setFeedback("correct");
    window.setTimeout(() => {
      if (index === tasks.length - 1) {
        onResultChange?.(true, "Ułożono cztery poprawne siatki z gotowych elementów");
        return;
      }
      setIndex((value) => value + 1);
      setTopAttach(null);
      setBottomAttach(null);
      setFeedback(null);
    }, 700);
  };

  return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 3" heading="Ułóż siatkę z gotowych elementów" description={`Ułóż siatkę: ${PRISM_LABELS[task.sides]}. Do gotowego paska ścian bocznych dołącz dwie jednakowe podstawy.`} questionNumber={index + 1} questionCount={tasks.length}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-center font-bold text-cyan-950">
          <span className="font-black">Gotowe elementy:</span> {task.sides} ścian bocznych oraz 2 podstawy — {task.baseLabel}.
        </div>
        <NetDiagram sides={task.sides} baseShape={task.baseShape} topAttachIndex={topAttach ?? 0} bottomAttachIndex={bottomAttach ?? task.sides - 1} showTopBase={topAttach !== null} showBottomBase={bottomAttach !== null} />
        <div className="space-y-2 rounded-2xl bg-violet-50 p-3">
          <p className="text-center font-black text-violet-950">Dotknij ściany, do której dołączysz górną podstawę.</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${task.sides}, minmax(0, 1fr))` }}>
            {Array.from({ length: task.sides }, (_, faceIndex) => (
              <LessonTaskChoice key={`top-${faceIndex}`} selected={topAttach === faceIndex} disabled={readOnly || feedback === "correct"} onClick={() => { setTopAttach(faceIndex); setFeedback(null); }}>
                {faceIndex + 1}
              </LessonTaskChoice>
            ))}
          </div>
          <p className="pt-2 text-center font-black text-violet-950">Dotknij ściany, do której dołączysz dolną podstawę.</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${task.sides}, minmax(0, 1fr))` }}>
            {Array.from({ length: task.sides }, (_, faceIndex) => (
              <LessonTaskChoice key={`bottom-${faceIndex}`} selected={bottomAttach === faceIndex} disabled={readOnly || feedback === "correct"} onClick={() => { setBottomAttach(faceIndex); setFeedback(null); }}>
                {faceIndex + 1}
              </LessonTaskChoice>
            ))}
          </div>
        </div>
        {feedback === "empty" ? <p className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Dołącz obie podstawy.</p> : null}
        {feedback === "correct" ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! To jest poprawna siatka.</p> : null}
        <button type="button" disabled={readOnly || feedback === "correct"} onClick={check} className="w-full rounded-2xl bg-violet-700 px-5 py-3 font-black text-white disabled:opacity-50">Sprawdź ułożoną siatkę</button>
      </div>
    </LessonTaskFrame>
  );
}

export function PrismNetsLessonLab({ activity, readOnly = false, onResultChange }: { activity: PrismNetsActivity; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  if (activity === "unfold") return <UnfoldSlide readOnly={readOnly} />;
  if (activity === "recognize") return <RecognizeSlide readOnly={readOnly} onResultChange={onResultChange} />;
  return <DrawingBoard readOnly={readOnly} onResultChange={onResultChange} />;
}
