import { analyzeGeometryPolygon, pointById, polygonEdgeObjects } from "@/lib/math/geometry/geometryMath";
import { createDefaultGeometryState, moveGeometryPoint, resizeGeometryPolygon } from "@/lib/math/geometry/geometryState";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type {
  GeometryLabMode,
  GeometryLabState,
  GeometryPoint,
  GeometryPointCoordinates,
} from "@/types/geometry";

export const POLYGON_BUILDER_GENERATOR_ID = "geometry-polygon-builder-l1-v1" as const;

export type PolygonLessonActivity =
  | "builder"
  | "validity"
  | "elements"
  | "reshape"
  | "stained-glass"
  | "independent";

export type PolygonValidityCase = "open" | "curved" | "self-intersecting" | "valid-concave";

export const POLYGON_LESSON_SEEDS = {
  builder: { support: 450101, core: 450102, challenge: 450103 },
  validity: { support: 450201, core: 450202, challenge: 450203 },
  elements: { support: 450301, core: 450302, challenge: 450303 },
  reshape: { support: 450401, core: 450402, challenge: 450403 },
  "stained-glass": { support: 450501, core: 450502, challenge: 450503 },
  independent: { support: 450601, core: 450602, challenge: 450603 },
} as const satisfies Record<PolygonLessonActivity, Record<LessonDifficulty, number>>;

export interface PolygonSeedConfig {
  seed: number;
  activity: PolygonLessonActivity;
  difficulty: LessonDifficulty;
  initialVertexCount: number;
  targetVertexCount: number;
  startsClosed: boolean;
  validityCase: PolygonValidityCase;
}

export interface PolygonPublicTask extends PolygonSeedConfig {
  generatorId: typeof POLYGON_BUILDER_GENERATOR_ID;
  generatorVersion: 1;
  prompt: string;
  skillIds: readonly [
    "M5-4.5-polygon-recognition",
    "M5-4.5-polygon-elements",
    "M5-4.5-polygon-construction",
    "M5-4.5-polygon-perimeter",
  ];
  invariants: readonly string[];
}

export interface PolygonLessonAnalysis {
  vertexCount: number;
  drawnSegmentCount: number;
  sideCount: number;
  perimeter: number | null;
  closed: boolean;
  hasCurvedEdge: boolean;
  selfIntersecting: boolean;
  degenerate: boolean;
  concave: boolean;
  validPolygon: boolean;
  polygonName: string | null;
  errorCodes: string[];
  offendingEdgeIds: string[];
  offendingVertexIds: string[];
}

const ACTIVITY_BY_FAMILY: Record<number, PolygonLessonActivity> = {
  1: "builder",
  2: "validity",
  3: "elements",
  4: "reshape",
  5: "stained-glass",
  6: "independent",
};

const DIFFICULTY_BY_SUFFIX: Record<number, LessonDifficulty> = {
  1: "support",
  2: "core",
  3: "challenge",
};

const DIFFICULTY_INDEX: Record<LessonDifficulty, number> = { support: 0, core: 1, challenge: 2 };

const VERTEX_COUNTS: Record<PolygonLessonActivity, readonly [number, number, number]> = {
  builder: [3, 5, 8],
  validity: [4, 5, 4],
  elements: [4, 6, 8],
  reshape: [4, 5, 7],
  "stained-glass": [5, 6, 6],
  independent: [4, 5, 8],
};

const VALIDITY_CASES: Record<PolygonLessonActivity, readonly [PolygonValidityCase, PolygonValidityCase, PolygonValidityCase]> = {
  builder: ["open", "open", "open"],
  validity: ["open", "curved", "self-intersecting"],
  elements: ["valid-concave", "valid-concave", "valid-concave"],
  reshape: ["valid-concave", "valid-concave", "valid-concave"],
  "stained-glass": ["valid-concave", "valid-concave", "valid-concave"],
  independent: ["open", "open", "open"],
};

const POLYGON_NAMES: Record<number, string> = {
  3: "trójkąt",
  4: "czworokąt",
  5: "pięciokąt",
  6: "sześciokąt",
  7: "siedmiokąt",
  8: "ośmiokąt",
};

const NAMED_COORDINATES: Partial<Record<PolygonLessonActivity, Partial<Record<LessonDifficulty, GeometryPointCoordinates[]>>>> = {
  validity: {
    support: [{ x: 120, y: 300 }, { x: 240, y: 120 }, { x: 420, y: 140 }, { x: 520, y: 300 }],
    core: [{ x: 300, y: 60 }, { x: 500, y: 170 }, { x: 440, y: 360 }, { x: 190, y: 340 }, { x: 100, y: 160 }],
    challenge: [{ x: 140, y: 100 }, { x: 500, y: 330 }, { x: 140, y: 330 }, { x: 500, y: 100 }],
  },
  reshape: {
    support: [{ x: 160, y: 120 }, { x: 500, y: 160 }, { x: 430, y: 340 }, { x: 120, y: 300 }],
    core: [{ x: 100, y: 120 }, { x: 500, y: 100 }, { x: 340, y: 220 }, { x: 500, y: 340 }, { x: 120, y: 340 }],
    challenge: [{ x: 100, y: 100 }, { x: 500, y: 80 }, { x: 380, y: 180 }, { x: 520, y: 320 }, { x: 340, y: 280 }, { x: 220, y: 360 }, { x: 80, y: 260 }],
  },
  "stained-glass": {
    support: [{ x: 300, y: 60 }, { x: 520, y: 180 }, { x: 420, y: 360 }, { x: 160, y: 340 }, { x: 80, y: 160 }],
    core: [{ x: 180, y: 80 }, { x: 430, y: 60 }, { x: 540, y: 220 }, { x: 410, y: 360 }, { x: 170, y: 340 }, { x: 70, y: 200 }],
    challenge: [{ x: 100, y: 100 }, { x: 500, y: 80 }, { x: 350, y: 210 }, { x: 520, y: 340 }, { x: 260, y: 300 }, { x: 90, y: 340 }],
  },
  independent: {
    support: [{ x: 140, y: 120 }, { x: 480, y: 100 }, { x: 500, y: 320 }, { x: 120, y: 340 }],
    core: [{ x: 300, y: 60 }, { x: 500, y: 170 }, { x: 440, y: 350 }, { x: 180, y: 340 }, { x: 90, y: 160 }],
    challenge: [{ x: 90, y: 100 }, { x: 500, y: 80 }, { x: 390, y: 170 }, { x: 530, y: 300 }, { x: 350, y: 270 }, { x: 260, y: 360 }, { x: 160, y: 280 }, { x: 70, y: 330 }],
  },
};

function promptFor(config: PolygonSeedConfig): string {
  switch (config.activity) {
    case "builder":
      return `Ustaw ${config.targetVertexCount} wierzchołków na siatce. Figura domknie się dopiero po wybraniu pierwszego punktu A.`;
    case "validity":
      return "Rozstrzygnij, czy rysunek jest wielokątem. Wskaż konkretny warunek: domknięcie, wyłącznie odcinki albo brak samoprzecięcia.";
    case "elements":
      return "Nazwij wierzchołki i boki, potem wybierz jeden wierzchołek oraz koniec poprawnej przekątnej.";
    case "reshape":
      return `Przeciągaj wierzchołki. Zachowaj poprawny ${polygonNameForSideCount(config.targetVertexCount)} i obserwuj, co nie zmienia się mimo ukośnego lub wklęsłego kształtu.`;
    case "stained-glass":
      return `Zbuduj witraż: ${polygonNameForSideCount(config.targetVertexCount)} bez prostokątnego prototypu. Sprawdź domknięcie i każde przecięcie boków.`;
    case "independent":
      return "Pracuj samodzielnie: zbuduj figurę, domknij ją przez A, nazwij, wskaż przekątną i odczytaj obwód.";
  }
}

export function isPolygonLessonSeed(seed: number): boolean {
  if (!Number.isSafeInteger(seed) || seed < 450101 || seed > 450603) return false;
  const family = Math.floor((seed - 450000) / 100);
  return Boolean(ACTIVITY_BY_FAMILY[family] && DIFFICULTY_BY_SUFFIX[seed % 100]);
}

export function getPolygonSeedConfig(seed: number): PolygonSeedConfig {
  if (!isPolygonLessonSeed(seed)) throw new Error(`Seed ${seed} nie należy do pakietu M5-4.5 L1.`);
  const activity = ACTIVITY_BY_FAMILY[Math.floor((seed - 450000) / 100)]!;
  const difficulty = DIFFICULTY_BY_SUFFIX[seed % 100]!;
  const index = DIFFICULTY_INDEX[difficulty];
  const count = VERTEX_COUNTS[activity][index];
  return {
    seed,
    activity,
    difficulty,
    initialVertexCount: count,
    targetVertexCount: count,
    startsClosed: !["builder", "independent"].includes(activity),
    validityCase: VALIDITY_CASES[activity][index],
  };
}

export function polygonSeedFor(activity: PolygonLessonActivity, difficulty: LessonDifficulty): number {
  return POLYGON_LESSON_SEEDS[activity][difficulty];
}

export function polygonNameForSideCount(sideCount: number): string {
  return POLYGON_NAMES[sideCount] ?? `${sideCount}-kąt`;
}

export function createPublicPolygonTask(seed: number): PolygonPublicTask {
  const config = getPolygonSeedConfig(seed);
  return {
    generatorId: POLYGON_BUILDER_GENERATOR_ID,
    generatorVersion: 1,
    ...config,
    prompt: promptFor(config),
    skillIds: [
      "M5-4.5-polygon-recognition",
      "M5-4.5-polygon-elements",
      "M5-4.5-polygon-construction",
      "M5-4.5-polygon-perimeter",
    ],
    invariants: [
      "3-to-8-vertices",
      "closure-only-after-selecting-first-vertex",
      "open-curved-and-self-intersecting-figures-are-not-polygons",
      "unusual-diagonal-and-concave-valid-examples",
      "vertices-sides-and-perimeter-update-in-real-time",
      "touch-target-52-px",
      "keyboard-and-coordinate-alternative",
      "answer-spec-server-only",
    ],
  };
}

function applyCoordinates(state: GeometryLabState, coordinates: GeometryPointCoordinates[]): GeometryLabState {
  const ids = state.polygon.vertexIds;
  return {
    ...state,
    points: state.points.map((point) => {
      const index = ids.indexOf(point.id);
      return index >= 0 && coordinates[index] ? { ...point, ...coordinates[index] } : point;
    }),
  };
}

export function createPolygonGeometryState(seed: number, mode: GeometryLabMode = "practice"): GeometryLabState {
  const config = getPolygonSeedConfig(seed);
  let state = createDefaultGeometryState({ mode, vertexCount: config.initialVertexCount, seed });
  state = {
    ...state,
    viewport: { width: 640, height: 420, padding: 28, scale: 1 },
    grid: { visible: true, step: 20, snap: true },
    angles: [],
    polygon: {
      ...state.polygon,
      closed: config.startsClosed,
      showAngles: false,
      showClassification: false,
      showSideLengths: false,
    },
  };
  const coordinates = NAMED_COORDINATES[config.activity]?.[config.difficulty];
  return coordinates ? applyCoordinates(state, coordinates) : state;
}

export function createPolygonStateForValidityCase(
  seed: number,
  validityCase: PolygonValidityCase,
  mode: GeometryLabMode = "practice",
): GeometryLabState {
  const baseSeed = polygonSeedFor("validity", getPolygonSeedConfig(seed).difficulty);
  const state = createPolygonGeometryState(baseSeed, mode);
  if (validityCase === "open") return { ...state, polygon: { ...state.polygon, closed: false } };
  if (validityCase === "self-intersecting") {
    const four = createDefaultGeometryState({ mode, vertexCount: 4, seed: baseSeed });
    return applyCoordinates({
      ...four,
      grid: { visible: true, step: 20, snap: true },
      angles: [],
      polygon: { ...four.polygon, closed: true, showAngles: false, showClassification: false, showSideLengths: false },
    }, NAMED_COORDINATES.validity?.challenge ?? []);
  }
  if (validityCase === "valid-concave") {
    const five = createDefaultGeometryState({ mode, vertexCount: 5, seed: baseSeed });
    return applyCoordinates({
      ...five,
      grid: { visible: true, step: 20, snap: true },
      angles: [],
      polygon: { ...five.polygon, closed: true, showAngles: false, showClassification: false, showSideLengths: false },
    }, NAMED_COORDINATES.reshape?.core ?? []);
  }
  return { ...state, polygon: { ...state.polygon, closed: true } };
}

export function addPolygonVertex(state: GeometryLabState): GeometryLabState {
  const count = state.polygon.vertexIds.length;
  if (count >= 8) return state;
  const resized = resizeGeometryPolygon(state, count + 1);
  return {
    ...resized,
    angles: [],
    polygon: {
      ...resized.polygon,
      closed: state.polygon.closed,
      showAngles: false,
      showClassification: false,
      showSideLengths: false,
    },
  };
}

export function removePolygonVertex(state: GeometryLabState): GeometryLabState {
  const ids = state.polygon.vertexIds;
  if (ids.length <= 3) return state;
  const resized = resizeGeometryPolygon(state, ids.length - 1);
  return {
    ...resized,
    angles: [],
    polygon: {
      ...resized.polygon,
      closed: state.polygon.closed,
      showAngles: false,
      showClassification: false,
      showSideLengths: false,
    },
  };
}

export function setPolygonClosed(state: GeometryLabState, closed: boolean): GeometryLabState {
  return { ...state, polygon: { ...state.polygon, closed } };
}

export function movePolygonVertex(
  state: GeometryLabState,
  pointId: string,
  coordinates: GeometryPointCoordinates,
): GeometryLabState {
  return moveGeometryPoint(state, pointId, coordinates);
}

export function diagonalEndpointIds(state: GeometryLabState, fromPointId: string): string[] {
  const ids = state.polygon.vertexIds;
  const index = ids.indexOf(fromPointId);
  if (index < 0 || ids.length < 4) return [];
  const previous = ids[(index - 1 + ids.length) % ids.length];
  const next = ids[(index + 1) % ids.length];
  return ids.filter((id) => id !== fromPointId && id !== previous && id !== next);
}

export function isConcavePolygon(state: GeometryLabState): boolean {
  const analysis = analyzeGeometryPolygon({ ...state, polygon: { ...state.polygon, closed: true } });
  return analysis.status === "valid" && analysis.angleDegrees.some((angle) => angle > 180 + state.tolerance.angleDegrees);
}

export function analyzePolygonLessonState(
  state: GeometryLabState,
  options: { hasCurvedEdge?: boolean } = {},
): PolygonLessonAnalysis {
  const closed = state.polygon.closed;
  const hasCurvedEdge = options.hasCurvedEdge === true;
  const base = analyzeGeometryPolygon(state);
  const degenerate = base.errorCodes.includes("GEO_DEGENERATE");
  const selfIntersecting = base.errorCodes.includes("GEO_SELF_INTERSECTION");
  const validPolygon = closed && !hasCurvedEdge && base.status === "valid";
  const perimeter = validPolygon
    ? base.sideLengths.reduce((sum, side) => sum + side.value, 0)
    : null;
  const errorCodes = [
    ...(!closed ? ["POLYGON_NOT_CLOSED"] : []),
    ...(hasCurvedEdge ? ["POLYGON_CURVED_EDGE"] : []),
    ...base.errorCodes,
  ];
  const offendingEdgeIds = new Set<string>();
  base.intersections.forEach((intersection) => {
    offendingEdgeIds.add(intersection.firstObjectId);
    offendingEdgeIds.add(intersection.secondObjectId);
  });
  if (hasCurvedEdge) offendingEdgeIds.add(`${state.polygon.id}-edge-0`);
  const edges = polygonEdgeObjects(state);
  if (!closed && edges.length > 0) {
    offendingEdgeIds.add(edges[0].id);
    offendingEdgeIds.add(edges.at(-1)!.id);
  }
  return {
    vertexCount: base.vertexCount,
    drawnSegmentCount: Math.max(0, base.vertexCount - 1 + (closed ? 1 : 0)),
    sideCount: validPolygon ? base.vertexCount : 0,
    perimeter,
    closed,
    hasCurvedEdge,
    selfIntersecting,
    degenerate,
    concave: validPolygon && isConcavePolygon(state),
    validPolygon,
    polygonName: validPolygon ? polygonNameForSideCount(base.vertexCount) : null,
    errorCodes: Array.from(new Set(errorCodes)),
    offendingEdgeIds: [...offendingEdgeIds],
    offendingVertexIds: base.duplicatePointIds,
  };
}

export function polygonPoint(state: GeometryLabState, pointId: string): GeometryPoint | undefined {
  return pointById(state.points, pointId);
}
