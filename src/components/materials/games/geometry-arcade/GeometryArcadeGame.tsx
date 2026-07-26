"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { claimGeometryGameScoreAction } from "@/lib/actions/rewards";
import type { GeometryGameKey } from "./geometryGameKeys";
import type { LaserLevel, MirrorKind } from "./LaserLabScene";

const LaserLabScene = dynamic(
  () => import("./LaserLabScene").then((module) => module.LaserLabScene),
  {
    ssr: false,
    loading: () => (
      <div className="grid aspect-[16/10] place-items-center rounded-[1.75rem] bg-slate-900 font-black text-cyan-200">
        Uruchamiam laboratorium…
      </div>
    ),
  },
);

type GameMeta = {
  title: string;
  eyebrow: string;
  description: string;
  action: string;
  success: string;
  hints: string[];
};

const GEOMETRY_SCENES: Record<GeometryGameKey, string> = {
  "laser-lab": "/materials/geometry-arcade/laser-lab-v2.webp",
  "polygon-forge": "/materials/geometry-arcade/polygon-forge-v2.webp",
  "triangle-shipyard": "/materials/geometry-arcade/triangle-shipyard-v2.webp",
  "quadrilateral-arena": "/materials/geometry-arcade/quadrilateral-arena-v2.webp",
  "symmetry-temple": "/materials/geometry-arcade/symmetry-temple-v2.webp",
  "geometry-inspector": "/materials/geometry-arcade/geometry-inspector-v2.webp",
};

export const GEOMETRY_GAMES: Record<GeometryGameKey, GameMeta> = {
  "laser-lab": {
    title: "Laboratorium laserów",
    eyebrow: "Optyczna łamigłówka",
    description: "Umieszczaj i obracaj zwierciadła. Poprowadź wiązkę przez kryształy do portalu.",
    action: "Uruchom laser",
    success: "Wiązka dotarła do portalu!",
    hints: [
      "Dotknij oprawy zwierciadła. Pierwsze dotknięcie je umieszcza, kolejne je obraca.",
      "Wiązka musi skręcić dwa razy i przejść przez kryształ.",
      "Zacznij od zwierciadła najbliższego emiterowi.",
      "Prowadź wiązkę najpierw w dół, a potem w stronę portalu.",
      "Nie każde dostępne miejsce musi zawierać zwierciadło.",
    ],
  },
  "polygon-forge": {
    title: "Kuźnia wielokątów",
    eyebrow: "Budowanie figur",
    description: "Łącz wierzchołki na siatce i wykuj figurę zgodną z zamówieniem.",
    action: "Sprawdź konstrukcję",
    success: "Wielokąt gotowy do hartowania!",
    hints: [
      "Wybierz trzy różne punkty.",
      "Czworokąt potrzebuje czterech wierzchołków.",
      "Wklęsły wielokąt ma co najmniej jeden kąt skierowany do wnętrza figury.",
      "Nie prowadź boków przez środek figury.",
      "Sześciokąt musi mieć sześć boków i sześć wierzchołków.",
    ],
  },
  "triangle-shipyard": {
    title: "Stocznia trójkątów",
    eyebrow: "Projektowanie kadłuba",
    description: "Dobieraj długości trzech belek i buduj wskazany rodzaj trójkąta.",
    action: "Zbuduj kadłub",
    success: "Kadłub przeszedł próbę wytrzymałości!",
    hints: [
      "W trójkącie równobocznym wszystkie trzy boki są równe.",
      "Trójkąt równoramienny ma dwa równe boki.",
      "Każdy bok trójkąta różnobocznego ma inną długość.",
      "Poszukaj trzech liczb spełniających zależność a² + b² = c².",
      "Dwie krótsze belki muszą mieć razem większą długość niż najdłuższa.",
    ],
  },
  "quadrilateral-arena": {
    title: "Arena czworokątów",
    eyebrow: "Sterowanie wierzchołkami",
    description: "Przeciągaj pylony po siatce i zmieniaj kształt areny.",
    action: "Oceń arenę",
    success: "Arena ma wszystkie wymagane własności!",
    hints: [
      "Prostokąt ma cztery kąty proste.",
      "Kwadrat ma cztery kąty proste i cztery równe boki.",
      "W równoległoboku przeciwległe boki są równoległe.",
      "Romb ma cztery równe boki.",
      "Trapez ma parę równoległych podstaw.",
    ],
  },
  "symmetry-temple": {
    title: "Świątynia symetrii",
    eyebrow: "Mozaika lustrzana",
    description: "Odtwórz prawą połowę mozaiki jako odbicie lewej strony.",
    action: "Aktywuj zwierciadło",
    success: "Mozaika jest idealnie symetryczna!",
    hints: [
      "Każdy kryształ umieść w tej samej odległości od osi.",
      "Zwróć uwagę jednocześnie na rząd i odległość od osi.",
      "Kryształ leżący bliżej osi po odbiciu nadal leży bliżej osi.",
      "Odbicie nie zmienia wysokości kryształu.",
      "Sprawdź wszystkie rzędy od góry do dołu.",
    ],
  },
  "geometry-inspector": {
    title: "Inspektor geometrii",
    eyebrow: "Misja diagnostyczna",
    description: "Obejrzyj cztery konstrukcje i dotknij bezpośrednio tej, która ma usterkę.",
    action: "Uruchom skaner",
    success: "Usterka znaleziona i naprawiona!",
    hints: [
      "Proste równoległe zachowują jednakową odległość.",
      "Kąt ostry ma mniej niż 90°.",
      "Wielokąt musi być zamknięty.",
      "Równoległobok ma dwie pary boków równoległych.",
      "Odbite punkty leżą w tej samej odległości od osi.",
    ],
  },
};

type BoardProps = {
  level: number;
  onStateChange: (ready: boolean, solved: boolean, status: string) => void;
};

type GridPoint = { x: number; y: number };

const LASER_LEVELS: LaserLevel[] = [
  { start: [0, 2], direction: [1, 0], target: [3, 4], sockets: [[3, 2], [1, 1], [5, 3]], crystals: [[3, 3]], obstacles: [[5, 1]] },
  { start: [0, 4], direction: [1, 0], target: [6, 1], sockets: [[2, 4], [2, 1], [4, 3], [5, 0]], crystals: [[2, 2]], obstacles: [[4, 2]] },
  { start: [6, 4], direction: [-1, 0], target: [6, 0], sockets: [[4, 4], [4, 0], [1, 2], [2, 3]], crystals: [[4, 2]], obstacles: [[2, 1]] },
  { start: [0, 0], direction: [0, 1], target: [5, 0], sockets: [[0, 3], [5, 3], [2, 1], [6, 4]], crystals: [[3, 3]], obstacles: [[3, 1]] },
  { start: [6, 2], direction: [-1, 0], target: [6, 4], sockets: [[4, 2], [4, 4], [1, 0], [2, 3], [5, 1]], crystals: [[4, 3]], obstacles: [[2, 1]] },
];

function reflect([dx, dy]: [number, number], mirror: MirrorKind): [number, number] {
  return mirror === "/" ? [-dy, -dx] : [dy, dx];
}

function evaluateLaser(level: LaserLevel, mirrors: Record<string, MirrorKind>) {
  let [x, y] = level.start;
  let direction = level.direction;
  const visited = new Set<string>();
  const crystals = new Set<string>();
  for (let step = 0; step < 70; step += 1) {
    x += direction[0];
    y += direction[1];
    if (x < 0 || x > 6 || y < 0 || y > 4) break;
    const key = `${x}-${y}`;
    if (level.obstacles.some(([ox, oy]) => ox === x && oy === y)) break;
    if (level.crystals.some(([cx, cy]) => cx === x && cy === y)) crystals.add(key);
    if (x === level.target[0] && y === level.target[1]) {
      return { hit: true, collected: crystals.size === level.crystals.length };
    }
    const mirror = mirrors[key];
    if (mirror) {
      const state = `${key}-${direction[0]}-${direction[1]}-${mirror}`;
      if (visited.has(state)) break;
      visited.add(state);
      direction = reflect(direction, mirror);
    }
  }
  return { hit: false, collected: false };
}

function LaserBoard({ level, onStateChange }: BoardProps) {
  const spec = LASER_LEVELS[level];
  const [mirrors, setMirrors] = useState<Record<string, MirrorKind>>({});

  const cycleMirror = (x: number, y: number) => {
    const key = `${x}-${y}`;
    setMirrors((current) => {
      const next = { ...current };
      if (!next[key]) next[key] = "/";
      else if (next[key] === "/") next[key] = "\\";
      else delete next[key];
      queueMicrotask(() => {
        const outcome = evaluateLaser(spec, next);
        onStateChange(
          Object.keys(next).length > 0,
          outcome.hit && outcome.collected,
          outcome.hit && !outcome.collected ? "Portal świeci, ale wiązka ominęła kryształ." : "Dotknij oprawy: pusta → / → \\ → pusta.",
        );
      });
      return next;
    });
  };

  return (
    <div>
      <LaserLabScene level={spec} mirrors={mirrors} onCycleMirror={cycleMirror} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
        <span>🪞 Dotknij oprawy, aby wstawić lub obrócić zwierciadło.</span>
        <button
          type="button"
          onClick={() => {
            setMirrors({});
            onStateChange(false, false, "Plansza wyczyszczona.");
          }}
          className="min-h-11 rounded-xl bg-white/10 px-4"
        >
          Wyczyść planszę
        </button>
      </div>
    </div>
  );
}

const FORGE_POINTS: GridPoint[] = [
  { x: 80, y: 55 }, { x: 170, y: 45 }, { x: 270, y: 65 }, { x: 360, y: 45 },
  { x: 55, y: 145 }, { x: 150, y: 125 }, { x: 250, y: 150 }, { x: 370, y: 135 },
  { x: 85, y: 235 }, { x: 185, y: 250 }, { x: 285, y: 230 }, { x: 350, y: 255 },
];

const POLYGON_TARGETS = [
  { count: 3, label: "Wykuj trójkąt z trzech wybranych punktów.", concave: false },
  { count: 4, label: "Wykuj wypukły czworokąt.", concave: false },
  { count: 5, label: "Wykuj wklęsły pięciokąt.", concave: true },
  { count: 5, label: "Wykuj wypukły pięciokąt bez krzyżujących się boków.", concave: false },
  { count: 6, label: "Wykuj sześciokąt.", concave: false },
];

function isConcave(points: GridPoint[]) {
  if (points.length < 4) return false;
  let sign = 0;
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    const c = points[(index + 2) % points.length];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (cross !== 0) {
      const nextSign = Math.sign(cross);
      if (sign && nextSign !== sign) return true;
      sign = nextSign;
    }
  }
  return false;
}

function PolygonForgeBoard({ level, onStateChange }: BoardProps) {
  const target = POLYGON_TARGETS[level];
  const [selected, setSelected] = useState<number[]>([]);
  const points = selected.map((index) => FORGE_POINTS[index]);
  const solved = selected.length === target.count && isConcave(points) === target.concave;

  const toggle = (index: number) => {
    setSelected((current) => {
      const next = current.includes(index)
        ? current.filter((item) => item !== index)
        : current.length < target.count
          ? [...current, index]
          : current;
      const nextPoints = next.map((item) => FORGE_POINTS[item]);
      onStateChange(
        next.length === target.count,
        next.length === target.count && isConcave(nextPoints) === target.concave,
        `${next.length}/${target.count} wierzchołków. Dotknij wybranego punktu ponownie, aby go usunąć.`,
      );
      return next;
    });
  };

  return (
    <div>
      <div className="mb-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">{target.label}</div>
      <svg viewBox="0 0 420 300" className="w-full rounded-[1.75rem] bg-slate-950 shadow-2xl" role="img" aria-label="Siatka kuźni wielokątów">
        <defs>
          <pattern id="forge-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#334155" strokeWidth="1" />
          </pattern>
          <linearGradient id="forged-metal" x1="0" x2="1">
            <stop offset="0" stopColor="#22d3ee" stopOpacity=".55" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity=".72" />
          </linearGradient>
        </defs>
        <image href={GEOMETRY_SCENES["polygon-forge"]} width="420" height="300" preserveAspectRatio="xMidYMid slice" opacity=".6" />
        <rect width="420" height="300" fill="#020617" opacity=".42" />
        <rect width="420" height="300" fill="url(#forge-grid)" />
        {points.length >= 2 && (
          <polygon
            points={points.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="url(#forged-metal)"
            stroke="#67e8f9"
            strokeWidth="7"
            strokeLinejoin="round"
          />
        )}
        {FORGE_POINTS.map((point, index) => {
          const order = selected.indexOf(index);
          return (
            <g key={index} onClick={() => toggle(index)} className="cursor-pointer">
              <circle cx={point.x} cy={point.y} r="18" fill={order >= 0 ? "#fbbf24" : "#0e7490"} stroke="white" strokeWidth="4" />
              {order >= 0 && <text x={point.x} y={point.y + 6} textAnchor="middle" fill="#422006" fontSize="17" fontWeight="900">{order + 1}</text>}
              <circle cx={point.x} cy={point.y} r="30" fill="transparent" />
            </g>
          );
        })}
      </svg>
      <p className="mt-3 text-center text-sm font-bold text-slate-600">
        Kolejność wyboru punktów wyznacza kolejność boków. {solved ? "Konstrukcja pasuje do zamówienia." : ""}
      </p>
    </div>
  );
}

const TRIANGLE_TARGETS = [
  { label: "Zbuduj trójkąt równoboczny.", test: (a: number, b: number, c: number) => a === b && b === c },
  { label: "Zbuduj trójkąt równoramienny, ale nie równoboczny.", test: (a: number, b: number, c: number) => (a === b || b === c || a === c) && !(a === b && b === c) },
  { label: "Zbuduj trójkąt różnoboczny.", test: (a: number, b: number, c: number) => a !== b && b !== c && a !== c && a + b > c && a + c > b && b + c > a },
  { label: "Zbuduj trójkąt prostokątny.", test: (a: number, b: number, c: number) => {
    const [x, y, z] = [a, b, c].sort((m, n) => m - n);
    return x * x + y * y === z * z;
  } },
  { label: "Ustaw belki tak, aby trójkąta nie dało się zbudować.", test: (a: number, b: number, c: number) => {
    const [x, y, z] = [a, b, c].sort((m, n) => m - n);
    return x + y <= z;
  } },
];

function TriangleShipyardBoard({ level, onStateChange }: BoardProps) {
  const target = TRIANGLE_TARGETS[level];
  const [sides, setSides] = useState<[number, number, number]>([3, 4, 5]);
  const validTriangle = sides[0] + sides[1] > sides[2] && sides[0] + sides[2] > sides[1] && sides[1] + sides[2] > sides[0];
  const longest = Math.max(...sides);
  const [a, b] = sides.filter((side) => side !== longest || sides.filter((candidate) => candidate === longest).length > 1).slice(0, 2);
  const c = longest;
  const x = validTriangle ? (a * a + c * c - b * b) / (2 * c) : c / 2;
  const height = validTriangle ? Math.sqrt(Math.max(0, a * a - x * x)) : 0;

  const change = (index: number, delta: number) => {
    setSides((current) => {
      const next = [...current] as [number, number, number];
      next[index] = Math.max(1, Math.min(9, next[index] + delta));
      onStateChange(true, target.test(...next), `Belki: ${next.join(" cm, ")} cm.`);
      return next;
    });
  };

  return (
    <div>
      <div className="mb-3 rounded-2xl bg-cyan-100 px-4 py-3 text-center font-black text-cyan-950">{target.label}</div>
      <svg viewBox="0 0 420 245" className="w-full rounded-[1.75rem] bg-slate-950 shadow-2xl" role="img" aria-label="Projektowany trójkąt">
        <image href={GEOMETRY_SCENES["triangle-shipyard"]} width="420" height="245" preserveAspectRatio="xMidYMid slice" opacity=".75" />
        <rect width="420" height="245" fill="#082f49" opacity=".28" />
        <path d="M40 210 H380" stroke="#dbeafe" strokeWidth="5" />
        {validTriangle ? (
          <polygon
            points={`70,210 ${70 + (x / c) * 280},${210 - (height / c) * 280} 350,210`}
            fill="#22d3ee55"
            stroke="#f8fafc"
            strokeWidth="8"
            strokeLinejoin="round"
          />
        ) : (
          <g>
            <path d="M70 190 L190 170" stroke="#fb7185" strokeWidth="9" />
            <path d="M215 170 L350 190" stroke="#fb7185" strokeWidth="9" />
            <text x="210" y="90" textAnchor="middle" fill="white" fontSize="18" fontWeight="900">Belki nie domykają kadłuba</text>
          </g>
        )}
      </svg>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {sides.map((side, index) => (
          <div key={index} className="rounded-2xl bg-slate-100 p-3 text-center">
            <p className="text-xs font-black uppercase text-slate-500">Belka {String.fromCharCode(65 + index)}</p>
            <p className="my-2 text-3xl font-black text-slate-950">{side} cm</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => change(index, -1)} className="min-h-12 rounded-xl bg-slate-800 text-2xl font-black text-white">−</button>
              <button type="button" onClick={() => change(index, 1)} className="min-h-12 rounded-xl bg-cyan-500 text-2xl font-black text-slate-950">+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type QuadTarget = "prostokąt" | "kwadrat" | "równoległobok" | "romb" | "trapez";
const QUAD_TARGETS: QuadTarget[] = ["prostokąt", "kwadrat", "równoległobok", "romb", "trapez"];
const INITIAL_QUAD: GridPoint[] = [{ x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 5 }, { x: 1, y: 5 }];

function vector(a: GridPoint, b: GridPoint) {
  return { x: b.x - a.x, y: b.y - a.y };
}
function parallel(a: GridPoint, b: GridPoint, c: GridPoint, d: GridPoint) {
  const first = vector(a, b);
  const second = vector(c, d);
  return first.x * second.y === first.y * second.x;
}
function lengthSquared(a: GridPoint, b: GridPoint) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}
function classifyQuad(points: GridPoint[], target: QuadTarget) {
  const [a, b, c, d] = points;
  const ab = vector(a, b);
  const bc = vector(b, c);
  const right = ab.x * bc.x + ab.y * bc.y === 0;
  const bothParallel = parallel(a, b, d, c) && parallel(a, d, b, c);
  const lengths = [lengthSquared(a, b), lengthSquared(b, c), lengthSquared(c, d), lengthSquared(d, a)];
  const allEqual = lengths.every((value) => value === lengths[0]);
  if (target === "kwadrat") return right && allEqual;
  if (target === "prostokąt") return right && bothParallel && !allEqual;
  if (target === "romb") return allEqual && !right;
  if (target === "równoległobok") return bothParallel && !right && !allEqual;
  return parallel(a, b, d, c) !== parallel(a, d, b, c);
}

function QuadrilateralArenaBoard({ level, onStateChange }: BoardProps) {
  const target = QUAD_TARGETS[level];
  const [points, setPoints] = useState(INITIAL_QUAD);
  const [dragging, setDragging] = useState<number | null>(null);

  const movePoint = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragging === null) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(6, Math.round(((event.clientX - bounds.left) / bounds.width) * 6)));
    const y = Math.max(0, Math.min(6, Math.round(((event.clientY - bounds.top) / bounds.height) * 6)));
    setPoints((current) => {
      const next = current.map((point, index) => index === dragging ? { x, y } : point);
      onStateChange(true, classifyQuad(next, target), `Przesuwasz pylon ${String.fromCharCode(65 + dragging)}. Wszystkie pylony przyciągają się do siatki.`);
      return next;
    });
  };

  return (
    <div>
      <div className="mb-3 rounded-2xl bg-fuchsia-100 px-4 py-3 text-center font-black text-fuchsia-950">
        Zbuduj: <span className="uppercase">{target}</span>
      </div>
      <svg
        viewBox="0 0 420 420"
        className="mx-auto aspect-square w-full max-w-[520px] touch-none rounded-[1.75rem] bg-slate-950 shadow-2xl"
        onPointerMove={movePoint}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
        role="img"
        aria-label={`Siatka do budowy figury: ${target}`}
      >
        <defs>
          <pattern id="arena-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0 H0 V60" fill="none" stroke="#475569" strokeWidth="2" />
          </pattern>
        </defs>
        <image href={GEOMETRY_SCENES["quadrilateral-arena"]} width="420" height="420" preserveAspectRatio="xMidYMid slice" opacity=".58" />
        <rect width="420" height="420" fill="#020617" opacity=".48" />
        <rect x="30" y="30" width="360" height="360" fill="url(#arena-grid)" />
        <polygon
          points={points.map((point) => `${30 + point.x * 60},${30 + point.y * 60}`).join(" ")}
          fill="#a855f755"
          stroke="#e879f9"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <g
            key={index}
            transform={`translate(${30 + point.x * 60} ${30 + point.y * 60})`}
            onPointerDown={(event) => {
              event.stopPropagation();
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragging(index);
            }}
            className="cursor-grab"
          >
            <circle r="25" fill="#fbbf24" stroke="white" strokeWidth="5" />
            <text y="7" textAnchor="middle" fontSize="21" fontWeight="900" fill="#422006">{String.fromCharCode(65 + index)}</text>
          </g>
        ))}
      </svg>
      <p className="mt-3 text-center text-sm font-bold text-slate-600">Przeciągaj żółte pylony. Każdy ruch zatrzymuje się na najbliższym punkcie siatki.</p>
    </div>
  );
}

const SYMMETRY_PATTERNS: Array<Array<[number, number]>> = [
  [[1, 0], [2, 1], [3, 2], [2, 3], [1, 4]],
  [[0, 1], [1, 1], [2, 2], [3, 3], [1, 4]],
  [[2, 0], [3, 1], [1, 2], [3, 3], [2, 4]],
  [[0, 0], [2, 0], [1, 2], [3, 2], [2, 4]],
  [[1, 0], [3, 0], [0, 2], [2, 2], [3, 4], [1, 4]],
];

function SymmetryTempleBoard({ level, onStateChange }: BoardProps) {
  const pattern = SYMMETRY_PATTERNS[level];
  const expected = new Set(pattern.map(([x, y]) => `${8 - x}-${y}`));
  const [placed, setPlaced] = useState<Set<string>>(new Set());

  const toggle = (x: number, y: number) => {
    if (x <= 4) return;
    const key = `${x}-${y}`;
    setPlaced((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      const solved = next.size === expected.size && [...next].every((item) => expected.has(item));
      onStateChange(next.size > 0, solved, `${next.size}/${expected.size} kryształów po prawej stronie osi.`);
      return next;
    });
  };

  return (
    <div>
      <div className="mb-3 rounded-2xl bg-violet-100 px-4 py-3 text-center font-black text-violet-950">
        Odbuduj brakującą połowę mozaiki.
      </div>
      <div
        className="mx-auto grid aspect-[9/5] w-full max-w-[650px] grid-cols-9 gap-1 rounded-[1.75rem] bg-slate-950 bg-cover bg-center p-4 shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,.6), rgba(46,16,101,.68)), url(${GEOMETRY_SCENES["symmetry-temple"]})`,
        }}
      >
        {Array.from({ length: 45 }, (_, index) => {
          const x = index % 9;
          const y = Math.floor(index / 9);
          const source = pattern.some(([px, py]) => px === x && py === y);
          const active = source || placed.has(`${x}-${y}`);
          const axis = x === 4;
          return (
            <button
              type="button"
              key={`${x}-${y}`}
              onClick={() => toggle(x, y)}
              disabled={x <= 4}
              aria-label={axis ? "Oś symetrii" : `Pole ${x + 1}, ${y + 1}`}
              className={`relative min-h-12 rounded-lg border ${axis ? "border-amber-300 bg-amber-300/80" : active ? "border-cyan-200 bg-cyan-400" : "border-slate-700 bg-slate-900"} disabled:cursor-default`}
            >
              {active && !axis && <span className="text-2xl drop-shadow">◆</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-bold text-slate-600">Dotykaj pól po prawej stronie złotej osi. Ponowne dotknięcie usuwa kryształ.</p>
    </div>
  );
}

const INSPECTOR_BAD = [2, 2, 1, 3, 0];
const INSPECTOR_TASKS = [
  "Znajdź parę torów, która nie jest równoległa.",
  "Znajdź kąt, który nie jest ostry.",
  "Znajdź ramę, która nie jest zamkniętym wielokątem.",
  "Znajdź figurę, która nie jest równoległobokiem.",
  "Znajdź układ, który nie jest symetryczny względem osi.",
];

function InspectorGlyph({ level, index }: { level: number; index: number }) {
  const bad = INSPECTOR_BAD[level] === index;
  if (level === 0) return <svg viewBox="0 0 120 80" className="h-24 w-full"><path d="M15 25 H105 M15 55 L105 55" stroke="currentColor" strokeWidth="7" /><path d={bad ? "M15 55 L105 35" : "M15 55 H105"} stroke="currentColor" strokeWidth="7" /></svg>;
  if (level === 1) return <svg viewBox="0 0 120 80" className="h-24 w-full"><path d="M25 65 H105 M25 65 L95 20" stroke="currentColor" strokeWidth="7" /><path d={bad ? "M50 63 A28 28 0 0 1 38 43" : "M50 63 A25 25 0 0 1 58 45"} fill="none" stroke="#fbbf24" strokeWidth="5" /></svg>;
  if (level === 2) return <svg viewBox="0 0 120 80" className="h-24 w-full"><path d={bad ? "M25 65 L25 18 L95 18 L95 65" : "M25 65 L25 18 L95 18 L95 65 Z"} fill="none" stroke="currentColor" strokeWidth="7" /></svg>;
  if (level === 3) return <svg viewBox="0 0 120 80" className="h-24 w-full"><path d={bad ? "M18 65 L35 15 L102 30 L85 65 Z" : "M18 65 L35 15 L102 15 L85 65 Z"} fill="#a78bfa55" stroke="currentColor" strokeWidth="7" /></svg>;
  return <svg viewBox="0 0 120 80" className="h-24 w-full"><path d="M60 8 V72" stroke="#fbbf24" strokeWidth="4" /><circle cx="35" cy="30" r="10" fill="currentColor" /><circle cx="85" cy={bad ? 52 : 30} r="10" fill="currentColor" /></svg>;
}

function GeometryInspectorBoard({ level, onStateChange }: BoardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div>
      <div className="mb-4 rounded-2xl bg-rose-100 px-4 py-3 text-center font-black text-rose-950">{INSPECTOR_TASKS[level]}</div>
      <div
        className="grid grid-cols-2 gap-3 rounded-[1.75rem] bg-cover bg-center p-4 shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,.58), rgba(15,23,42,.78)), url(${GEOMETRY_SCENES["geometry-inspector"]})`,
        }}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => {
              setSelected(index);
              onStateChange(true, index === INSPECTOR_BAD[level], `Skanujesz konstrukcję ${index + 1}.`);
            }}
            className={`min-h-36 rounded-2xl border-4 p-3 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.02] ${selected === index ? "border-amber-300 bg-amber-50/95 text-indigo-900 shadow-[0_0_28px_rgba(251,191,36,.8)]" : "border-cyan-300/60 bg-slate-950/75 text-cyan-200"}`}
          >
            <InspectorGlyph level={level} index={index} />
            <span className="font-black">Konstrukcja {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GameBoard({ gameKey, ...props }: BoardProps & { gameKey: GeometryGameKey }) {
  if (gameKey === "laser-lab") return <LaserBoard {...props} />;
  if (gameKey === "polygon-forge") return <PolygonForgeBoard {...props} />;
  if (gameKey === "triangle-shipyard") return <TriangleShipyardBoard {...props} />;
  if (gameKey === "quadrilateral-arena") return <QuadrilateralArenaBoard {...props} />;
  if (gameKey === "symmetry-temple") return <SymmetryTempleBoard {...props} />;
  return <GeometryInspectorBoard {...props} />;
}

export function GeometryArcadeGame({ gameKey, rewardEnabled = true }: { gameKey: GeometryGameKey; rewardEnabled?: boolean }) {
  const config = GEOMETRY_GAMES[gameKey];
  const [level, setLevel] = useState(0);
  const [ready, setReady] = useState(false);
  const [solved, setSolved] = useState(false);
  const [status, setStatus] = useState("Wykonaj ruch na planszy.");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const total = 5;

  const next = () => {
    const nextScore = score + (solved ? 1 : 0);
    if (solved) setScore(nextScore);
    if (level === total - 1) {
      setDone(true);
      if (!rewardEnabled) {
        setSaved("Gra ukończona w trybie nauczyciela — wynik nie jest zapisywany.");
      } else {
        void claimGeometryGameScoreAction(gameKey, nextScore, total).then((result) => {
          setSaved(result.error ?? (result.awardedPoints > 0 ? `Zdobywasz ${result.awardedPoints} pkt!` : "Najlepszy wynik był już zapisany."));
        });
      }
      return;
    }
    setLevel((current) => current + 1);
    setReady(false);
    setSolved(false);
    setStatus("Wykonaj ruch na planszy.");
    setFeedback(null);
    setMoves(0);
  };

  if (done) {
    return (
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-indigo-950 via-violet-900 to-cyan-800 p-8 text-center text-white shadow-2xl">
        <div className="text-7xl">🏆</div>
        <p className="mt-4 text-sm font-black uppercase tracking-[.22em] text-cyan-200">Misja ukończona</p>
        <h1 className="mt-2 text-4xl font-black">{config.title}</h1>
        <p className="mt-5 text-6xl font-black text-amber-300">{score}/{total}</p>
        <p className="mt-4 font-bold">{saved ?? "Zapisuję najlepszy wynik…"}</p>
        <button
          type="button"
          onClick={() => {
            setLevel(0);
            setScore(0);
            setDone(false);
            setSaved(null);
            setReady(false);
            setSolved(false);
            setFeedback(null);
            setMoves(0);
          }}
          className="mt-6 min-h-12 rounded-xl bg-cyan-300 px-6 font-black text-indigo-950"
        >
          Zagraj ponownie
        </button>
      </section>
    );
  }

  return (
    <section
      className="mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] bg-slate-950 bg-cover bg-center p-4 text-white shadow-2xl sm:p-6"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(2,6,23,.95), rgba(49,46,129,.8), rgba(8,145,178,.6)), url(${GEOMETRY_SCENES[gameKey]})`,
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">Dział 4 · {config.eyebrow}</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">{config.title}</h1>
          <p className="mt-2 font-bold text-indigo-100">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-4 py-2 font-black">Misja {level + 1}/{total}</span>
          <span className="rounded-full bg-amber-300 px-4 py-2 font-black text-amber-950">★ {score}</span>
          <span className="rounded-full bg-cyan-300/20 px-4 py-2 font-black text-cyan-100">⚡ {moves} ruchów</span>
        </div>
      </header>

      <div className="mt-5 rounded-[2rem] bg-white/95 p-4 text-slate-950 shadow-[0_24px_80px_rgba(0,0,0,.38)] backdrop-blur-sm sm:p-6">
        <GameBoard
          key={`${gameKey}-${level}`}
          gameKey={gameKey}
          level={level}
          onStateChange={(nextReady, nextSolved, nextStatus) => {
            setReady(nextReady);
            setSolved(nextSolved);
            setStatus(nextStatus);
            setFeedback(null);
            setMoves((current) => current + 1);
          }}
        />

        <div className="mt-5 rounded-2xl bg-slate-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-slate-700">{status}</p>
            {!feedback && (
              <button
                type="button"
                disabled={!ready}
                onClick={() => setFeedback(solved ? "correct" : "wrong")}
                className="min-h-12 rounded-xl bg-indigo-600 px-6 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {config.action}
              </button>
            )}
          </div>
          {feedback && (
            <div className={`mt-3 rounded-xl p-4 font-bold ${feedback === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>
              <p>{feedback === "correct" ? config.success : "Układ jeszcze nie działa. Zmień elementy i spróbuj ponownie."}</p>
              {feedback === "correct" && (
                <p className="mt-2 text-lg" aria-label={`Ocena misji: ${moves <= 4 ? 3 : moves <= 7 ? 2 : 1} gwiazdki`}>
                  {moves <= 4 ? "⭐⭐⭐ Premia za precyzję!" : moves <= 7 ? "⭐⭐ Dobra robota!" : "⭐ Misja wykonana!"}
                </p>
              )}
              <p className="mt-1 text-sm">{config.hints[level]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {feedback === "wrong" && (
                  <button type="button" onClick={() => setFeedback(null)} className="min-h-11 rounded-xl bg-white px-5 font-black">
                    Popraw układ
                  </button>
                )}
                <button type="button" onClick={next} className="min-h-11 rounded-xl bg-slate-950 px-5 font-black text-white">
                  {level === total - 1 ? "Zakończ misję" : feedback === "correct" ? "Następna misja →" : "Pomiń bez punktu →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
