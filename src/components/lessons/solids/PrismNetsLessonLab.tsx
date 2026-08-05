"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
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
    <group rotation={[-0.22 * (1 - progress), 0.55 * (1 - progress), 0]} scale={progress > 0.8 ? 0.92 : 1}>
      {Array.from({ length: sides }, (_, index) => {
        const angle = (index * Math.PI * 2) / sides;
        const foldedPosition: [number, number, number] = [Math.sin(angle) * radius, 0, Math.cos(angle) * radius];
        const flatPosition: [number, number, number] = [firstX + index * faceWidth, 0, 0];
        return (
          <RectangleFace
            key={`side-${index}`}
            width={faceWidth}
            height={height}
            position={mixPoint(foldedPosition, flatPosition, progress)}
            rotation={[0, mix(angle, 0, progress), 0]}
            color={index % 2 ? "#67e8f9" : "#a78bfa"}
          />
        );
      })}
      <RegularPolygonFace
        sides={sides}
        position={mixPoint([0, height / 2, 0], [firstX, height / 2 + apothem, 0], progress)}
        rotation={[mix(-Math.PI / 2, 0, progress), 0, 0]}
        color="#fbbf24"
      />
      <RegularPolygonFace
        sides={sides}
        position={mixPoint([0, -height / 2, 0], [lastX, -height / 2 - apothem, 0], progress)}
        rotation={[mix(Math.PI / 2, 0, progress), 0, 0]}
        color="#fb7185"
      />
    </group>
  );
}

function UnfoldingCanvas({ sides, progress }: { sides: number; progress: number }) {
  return (
    <div className="h-[270px] overflow-hidden rounded-3xl bg-slate-950" role="img" aria-label={`${PRISM_LABELS[sides]} rozłożony w ${Math.round(progress * 100)} procentach`}>
      <Canvas camera={{ position: [0, 0, 10.5], fov: 40 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 6, 8]} intensity={2.1} />
        <UnfoldingPrism sides={sides} progress={progress} />
      </Canvas>
    </div>
  );
}

type InvalidKind = "missing-base" | "missing-side";

function polygonPoints(sides: number, centerX: number, centerY: number, radius: number) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return `${centerX + Math.cos(angle) * radius},${centerY + Math.sin(angle) * radius}`;
  }).join(" ");
}

function NetDiagram({ sides, invalid, className = "" }: { sides: number; invalid?: InvalidKind; className?: string }) {
  const faceWidth = 52;
  const faceHeight = 70;
  const visibleSides = invalid === "missing-side" ? sides - 1 : sides;
  const stripWidth = visibleSides * faceWidth;
  const startX = (420 - stripWidth) / 2;
  const centerY = 112;
  const baseRadius = sides >= 6 ? 30 : sides === 5 ? 32 : 34;
  return (
    <svg viewBox="0 0 420 230" className={`h-auto w-full ${className}`} role="img" aria-label={`Siatka: ${visibleSides} ścian bocznych i ${invalid === "missing-base" ? 1 : 2} podstawy o ${sides} bokach`}>
      <title>Siatka {PRISM_LABELS[sides]}</title>
      <rect x="1" y="1" width="418" height="228" rx="20" fill="#f8fafc" stroke="#c7d2fe" strokeWidth="2" />
      {Array.from({ length: visibleSides }, (_, index) => (
        <rect key={index} x={startX + index * faceWidth} y={centerY - faceHeight / 2} width={faceWidth} height={faceHeight} fill={index % 2 ? "#a5f3fc" : "#c4b5fd"} stroke="#312e81" strokeWidth="3" />
      ))}
      <polygon points={polygonPoints(sides, startX + faceWidth / 2, centerY - faceHeight / 2 - baseRadius + 2, baseRadius)} fill="#fde68a" stroke="#92400e" strokeWidth="3" />
      {invalid !== "missing-base" ? (
        <polygon points={polygonPoints(sides, startX + (visibleSides - 0.5) * faceWidth, centerY + faceHeight / 2 + baseRadius - 2, baseRadius)} fill="#fda4af" stroke="#9f1239" strokeWidth="3" />
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
  prompt: string;
  choices: readonly string[];
  answer: string;
};

const RECOGNITION_TASKS: readonly RecognitionTask[] = [
  { sides: 3, prompt: "Jaki graniastosłup powstanie z tej siatki?", choices: ["Trójkątny", "Czworokątny", "Pięciokątny"], answer: "Trójkątny" },
  { sides: 5, prompt: "Jaki graniastosłup powstanie z tej siatki?", choices: ["Czworokątny", "Pięciokątny", "Sześciokątny"], answer: "Pięciokątny" },
  { sides: 6, prompt: "Jaki graniastosłup powstanie z tej siatki?", choices: ["Trójkątny", "Pięciokątny", "Sześciokątny"], answer: "Sześciokątny" },
  { sides: 4, prompt: "Czy z tej siatki można złożyć graniastosłup czworokątny?", choices: ["Tak", "Nie"], answer: "Tak" },
  { sides: 3, invalid: "missing-base", prompt: "Czy to jest poprawna siatka graniastosłupa trójkątnego?", choices: ["Tak", "Nie"], answer: "Nie" },
  { sides: 5, invalid: "missing-side", prompt: "Czy to jest poprawna siatka graniastosłupa pięciokątnego?", choices: ["Tak", "Nie"], answer: "Nie" },
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
        <NetDiagram sides={task.sides} invalid={task.invalid} />
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

type Point = { x: number; y: number };

function DrawingBoard({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [sides, setSides] = useState(3);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [active, setActive] = useState<Point[] | null>(null);
  const [showExample, setShowExample] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const pointFromEvent = (event: ReactPointerEvent<SVGSVGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return { x: ((event.clientX - bounds.left) / bounds.width) * 420, y: ((event.clientY - bounds.top) / bounds.height) * 300 };
  };
  const start = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (readOnly) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setActive([pointFromEvent(event)]);
  };
  const move = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!active) return;
    setActive((points) => points ? [...points, pointFromEvent(event)] : null);
  };
  const finish = () => {
    if (active?.length) setStrokes((items) => [...items, active]);
    setActive(null);
  };
  const path = (points: Point[]) => points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");

  return (
    <LessonTaskFrame eyebrow="Dział 9 · Temat 3" heading="Narysuj siatkę" description={`Narysuj siatkę: ${PRISM_LABELS[sides]}. Pamiętaj o dwóch jednakowych podstawach.`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[3, 4, 5, 6].map((value) => <LessonTaskChoice key={value} selected={sides === value} disabled={readOnly} onClick={() => { setSides(value); setStrokes([]); setShowExample(false); }}>{value === 3 ? "Trójkątny" : value === 4 ? "Czworokątny" : value === 5 ? "Pięciokątny" : "Sześciokątny"}</LessonTaskChoice>)}
        </div>
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-300 bg-white">
          {showExample ? <div className="pointer-events-none absolute inset-0 z-20 opacity-25"><NetDiagram sides={sides} className="h-full" /></div> : null}
          <svg ref={svgRef} viewBox="0 0 420 300" className="relative z-10 h-[300px] w-full touch-none" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} aria-label="Plansza do rysowania siatki palcem lub myszą">
            <defs><pattern id="prism-net-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="1" /></pattern></defs>
            <rect width="420" height="300" fill="url(#prism-net-grid)" />
            {strokes.map((points, index) => <path key={index} d={path(points)} fill="none" stroke="#6d28d9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />)}
            {active ? <path d={path(active)} fill="none" stroke="#6d28d9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /> : null}
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" disabled={readOnly || !strokes.length} onClick={() => setStrokes((items) => items.slice(0, -1))} className="rounded-xl bg-indigo-100 px-3 py-2 font-black text-indigo-950 disabled:opacity-40">Cofnij</button>
          <button type="button" disabled={readOnly || !strokes.length} onClick={() => setStrokes([])} className="rounded-xl bg-rose-100 px-3 py-2 font-black text-rose-950 disabled:opacity-40">Wyczyść</button>
          <button type="button" disabled={readOnly} onClick={() => setShowExample((value) => !value)} className="rounded-xl bg-cyan-100 px-3 py-2 font-black text-cyan-950 disabled:opacity-40">{showExample ? "Ukryj wzór" : "Pokaż wzór"}</button>
        </div>
        <button type="button" disabled={readOnly || !strokes.length} onClick={() => onResultChange?.(true, `Narysowana siatka: ${PRISM_LABELS[sides]}`)} className="w-full rounded-2xl bg-violet-700 px-5 py-3 font-black text-white disabled:opacity-50">Moja siatka jest gotowa</button>
      </div>
    </LessonTaskFrame>
  );
}

export function PrismNetsLessonLab({ activity, readOnly = false, onResultChange }: { activity: PrismNetsActivity; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  if (activity === "unfold") return <UnfoldSlide readOnly={readOnly} />;
  if (activity === "recognize") return <RecognizeSlide readOnly={readOnly} onResultChange={onResultChange} />;
  return <DrawingBoard readOnly={readOnly} onResultChange={onResultChange} />;
}
