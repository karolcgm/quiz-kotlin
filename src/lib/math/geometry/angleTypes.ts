import {
  angleBetweenPointsDegrees,
  geometryDistance,
  pointById,
} from "@/lib/math/geometry/geometryMath";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type {
  GeometryLabMode,
  GeometryLabState,
  GeometryPointCoordinates,
} from "@/types/geometry";

export const ANGLE_TYPES_GENERATOR_ID = "geometry-angle-types-l1-v1" as const;

export type AngleTypeKind = "acute" | "right" | "obtuse" | "straight";
export type AngleTypesActivity =
  | "predict"
  | "elements"
  | "length-invariance"
  | "gates"
  | "spotlights"
  | "independent";

export const ANGLE_TYPE_LABELS: Record<AngleTypeKind, string> = {
  acute: "kąt ostry",
  right: "kąt prosty",
  obtuse: "kąt rozwarty",
  straight: "kąt półpełny",
};

export const ANGLE_TYPES_LESSON_SEEDS = {
  predict: { support: 420101, core: 420102, challenge: 420103 },
  elements: { support: 420201, core: 420202, challenge: 420203 },
  "length-invariance": { support: 420301, core: 420302, challenge: 420303 },
  gates: { support: 420401, core: 420402, challenge: 420403 },
  spotlights: { support: 420501, core: 420502, challenge: 420503 },
  independent: { support: 420601, core: 420602, challenge: 420603 },
} as const satisfies Record<AngleTypesActivity, Record<LessonDifficulty, number>>;

export interface AngleTypesSeedConfig {
  seed: number;
  difficulty: LessonDifficulty;
  activity: AngleTypesActivity;
  angleDegrees: number;
  rotationDegrees: number;
  firstArmLength: number;
  secondArmLength: number;
  targetKind?: AngleTypeKind;
  scenarioLabel?: string;
}
export interface AngleTypesPublicTask extends AngleTypesSeedConfig {
  generatorId: typeof ANGLE_TYPES_GENERATOR_ID;
  generatorVersion: 1;
  prompt: string;
  skillIds: readonly ["M5-4.2-angle-types"];
  invariants: readonly string[];
}

const ACTIVITY_FROM_FAMILY: Record<number, AngleTypesActivity> = {
  1: "predict",
  2: "elements",
  3: "length-invariance",
  4: "gates",
  5: "spotlights",
  6: "independent",
};

const DIFFICULTY_FROM_SUFFIX: Record<number, LessonDifficulty> = {
  1: "support",
  2: "core",
  3: "challenge",
};

const DIFFICULTY_INDEX: Record<LessonDifficulty, number> = {
  support: 0,
  core: 1,
  challenge: 2,
};

const ANGLES: Record<AngleTypesActivity, readonly [number, number, number]> = {
  predict: [45, 89, 132],
  elements: [70, 115, 90],
  "length-invariance": [55, 90, 124],
  gates: [89, 90, 180],
  spotlights: [112, 58, 64],
  independent: [35, 91, 180],
};

const ROTATIONS: Record<AngleTypesActivity, readonly [number, number, number]> = {
  predict: [-8, 34, -42],
  elements: [12, -35, 48],
  "length-invariance": [28, -18, 57],
  gates: [4, 37, -26],
  spotlights: [-22, 43, 6],
  independent: [51, -31, 19],
};

const TARGETS: readonly AngleTypeKind[] = ["acute", "right", "obtuse"];
const SCENARIOS = [
  "Wąski snop światła — ustaw kąt ostry.",
  "Narożnik sceny — ustaw dokładnie kąt prosty.",
  "Szeroka kurtyna światła — ustaw kąt rozwarty.",
] as const;

function promptFor(config: AngleTypesSeedConfig): string {
  switch (config.activity) {
    case "predict":
      return "Najpierw przewidź rodzaj kąta. Nazwa i miara pojawią się dopiero po zatwierdzeniu przewidywania.";
    case "elements":
      return "Wybierz etykietę, a potem umieść ją na wierzchołku, ramieniu albo łuku kąta.";
    case "length-invariance":
      return "Zmień długości ramion i obróć całą figurę. Sprawdź, że miara oraz rodzaj kąta się nie zmieniają.";
    case "gates":
      return "Porównaj dokładnie 89°, 90°, 91° i 180°. Granice klasyfikacji wynikają z miary, nie z wyglądu.";
    case "spotlights":
      return config.scenarioLabel ?? "Ustaw wymagany rodzaj kąta reflektora.";
    case "independent":
      return "Samodzielnie sklasyfikuj kąt, wskaż jego elementy i uzasadnij odpowiedź miarą graniczną 90° lub 180°.";
  }
}

export function isAngleTypesLessonSeed(seed: number): boolean {
  if (!Number.isSafeInteger(seed) || seed < 420101 || seed > 420603) return false;
  const family = Math.floor((seed - 420000) / 100);
  return Boolean(ACTIVITY_FROM_FAMILY[family] && DIFFICULTY_FROM_SUFFIX[seed % 100]);
}

export function getAngleTypesSeedConfig(seed: number): AngleTypesSeedConfig {
  if (!isAngleTypesLessonSeed(seed)) throw new Error(`Seed ${seed} nie należy do pakietu M5-4.2 L1.`);
  const family = Math.floor((seed - 420000) / 100);
  const activity = ACTIVITY_FROM_FAMILY[family]!;
  const difficulty = DIFFICULTY_FROM_SUFFIX[seed % 100]!;
  const index = DIFFICULTY_INDEX[difficulty];
  const targetKind = activity === "spotlights" ? TARGETS[index] : undefined;
  return {
    seed,
    difficulty,
    activity,
    angleDegrees: ANGLES[activity][index],
    rotationDegrees: ROTATIONS[activity][index],
    firstArmLength: [145, 185, 110][index]!,
    secondArmLength: [205, 125, 220][index]!,
    targetKind,
    scenarioLabel: activity === "spotlights" ? SCENARIOS[index] : undefined,
  };
}

export function angleTypesSeedFor(
  activity: AngleTypesActivity,
  difficulty: LessonDifficulty,
): number {
  return ANGLE_TYPES_LESSON_SEEDS[activity][difficulty];
}

export function createPublicAngleTypesTask(seed: number): AngleTypesPublicTask {
  const config = getAngleTypesSeedConfig(seed);
  return {
    generatorId: ANGLE_TYPES_GENERATOR_ID,
    generatorVersion: 1,
    ...config,
    prompt: promptFor(config),
    skillIds: ["M5-4.2-angle-types"],
    invariants: [
      "classification-from-current-coordinates",
      "whole-rotation-preserves-angle",
      "arm-length-preserves-angle",
      "exact-90-and-180-gates",
      "answer-spec-server-only",
    ],
  };
}

function normalizeDirection(value: number): number {
  return ((value % 360) + 360) % 360;
}

function pointAt(
  vertex: GeometryPointCoordinates,
  directionDegrees: number,
  length: number,
): GeometryPointCoordinates {
  const radians = directionDegrees * Math.PI / 180;
  return {
    x: vertex.x + Math.cos(radians) * length,
    y: vertex.y + Math.sin(radians) * length,
  };
}

function replacePoint(
  state: GeometryLabState,
  pointId: string,
  coordinates: GeometryPointCoordinates,
): GeometryLabState {
  return {
    ...state,
    points: state.points.map((point) => point.id === pointId ? { ...point, ...coordinates } : point),
  };
}

export function createAngleTypesGeometryState(
  seed: number,
  mode: GeometryLabMode = "practice",
): GeometryLabState {
  const config = getAngleTypesSeedConfig(seed);
  const vertex = { x: 355, y: 225 };
  const first = pointAt(vertex, config.rotationDegrees, config.firstArmLength);
  const second = pointAt(vertex, config.rotationDegrees + config.angleDegrees, config.secondArmLength);
  return {
    version: 1,
    mode,
    viewport: { width: 720, height: 460, padding: 30, scale: 1 },
    grid: { visible: true, step: 20, snap: false },
    tolerance: { absolute: 1e-7, angleDegrees: 0.01, length: 0.5 },
    points: [
      { id: "vertex-b", label: "B", ...vertex, locked: true },
      { id: "point-a", label: "A", ...first },
      { id: "point-c", label: "C", ...second },
      { id: "seed-marker", label: "seed", x: seed, y: 0, locked: true },
    ],
    objects: [
      { id: "ray-ba", kind: "ray", startPointId: "vertex-b", endPointId: "point-a", label: "ramię BA" },
      { id: "ray-bc", kind: "ray", startPointId: "vertex-b", endPointId: "point-c", label: "ramię BC" },
    ],
    angles: [{
      id: "angle-abc",
      startPointId: "point-a",
      vertexPointId: "vertex-b",
      endPointId: "point-c",
      label: "∠ABC",
      showArc: true,
      showMeasure: true,
    }],
    polygon: {
      id: "angle-placeholder",
      vertexIds: ["point-a", "vertex-b", "point-c"],
      closed: false,
      showSideLengths: false,
      showAngles: false,
      showClassification: false,
    },
    constraints: [],
    selectedPointId: "point-c",
    protractor: {
      visible: false,
      center: vertex,
      rotationDegrees: config.rotationDegrees,
      radius: 120,
      scale: "outer",
    },
  };
}

export function angleMeasureDegrees(state: GeometryLabState): number {
  const start = pointById(state.points, "point-a")!;
  const vertex = pointById(state.points, "vertex-b")!;
  const end = pointById(state.points, "point-c")!;
  const raw = angleBetweenPointsDegrees(start, vertex, end);
  return Math.round(raw * 1_000_000) / 1_000_000;
}

export function angleRotationDegrees(state: GeometryLabState): number {
  const vertex = pointById(state.points, "vertex-b")!;
  const start = pointById(state.points, "point-a")!;
  return Math.round(normalizeDirection(Math.atan2(start.y - vertex.y, start.x - vertex.x) * 180 / Math.PI) * 1_000_000) / 1_000_000;
}

export function angleArmLengths(state: GeometryLabState): { first: number; second: number } {
  const vertex = pointById(state.points, "vertex-b")!;
  return {
    first: geometryDistance(vertex, pointById(state.points, "point-a")!),
    second: geometryDistance(vertex, pointById(state.points, "point-c")!),
  };
}

export function setAngleMeasure(state: GeometryLabState, requestedDegrees: number): GeometryLabState {
  const degrees = Math.max(1, Math.min(180, requestedDegrees));
  const vertex = pointById(state.points, "vertex-b")!;
  const rotation = angleRotationDegrees(state);
  const lengths = angleArmLengths(state);
  return replacePoint(state, "point-c", pointAt(vertex, rotation + degrees, lengths.second));
}

export function rotateWholeAngleTo(state: GeometryLabState, requestedDegrees: number): GeometryLabState {
  const rotation = normalizeDirection(requestedDegrees);
  const vertex = pointById(state.points, "vertex-b")!;
  const measure = angleMeasureDegrees(state);
  const lengths = angleArmLengths(state);
  const firstMoved = replacePoint(state, "point-a", pointAt(vertex, rotation, lengths.first));
  return replacePoint(firstMoved, "point-c", pointAt(vertex, rotation + measure, lengths.second));
}

export function rotateWholeAngleBy(state: GeometryLabState, deltaDegrees: number): GeometryLabState {
  return rotateWholeAngleTo(state, angleRotationDegrees(state) + deltaDegrees);
}

export function setAngleArmLength(
  state: GeometryLabState,
  arm: "first" | "second",
  requestedLength: number,
): GeometryLabState {
  const length = Math.max(70, Math.min(240, requestedLength));
  const vertex = pointById(state.points, "vertex-b")!;
  const rotation = angleRotationDegrees(state);
  const direction = arm === "first" ? rotation : rotation + angleMeasureDegrees(state);
  return replacePoint(state, arm === "first" ? "point-a" : "point-c", pointAt(vertex, direction, length));
}

export function classifyAngleDegrees(degrees: number): AngleTypeKind {
  if (!Number.isFinite(degrees) || degrees <= 0 || degrees > 180) {
    throw new Error("Miara kąta musi należeć do przedziału (0°, 180°].");
  }
  const normalized = Math.round(degrees * 1_000_000) / 1_000_000;
  if (normalized === 90) return "right";
  if (normalized === 180) return "straight";
  return normalized < 90 ? "acute" : "obtuse";
}

export function classifyAngleState(state: GeometryLabState): AngleTypeKind {
  return classifyAngleDegrees(angleMeasureDegrees(state));
}

export function angleMatchesTarget(state: GeometryLabState, target: AngleTypeKind): boolean {
  return classifyAngleState(state) === target;
}
