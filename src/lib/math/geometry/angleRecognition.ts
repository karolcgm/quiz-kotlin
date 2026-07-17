export type AngleRecognitionActivity =
  | "anatomy"
  | "openness"
  | "greek"
  | "notation"
  | "measures"
  | "color-types"
  | "figure"
  | "point-cloud";

export type CompleteAngleType =
  | "zero"
  | "acute"
  | "right"
  | "obtuse"
  | "straight"
  | "reflex"
  | "full";

export const COMPLETE_ANGLE_LABELS: Record<CompleteAngleType, string> = {
  zero: "kąt zerowy",
  acute: "kąt ostry",
  right: "kąt prosty",
  obtuse: "kąt rozwarty",
  straight: "kąt półpełny",
  reflex: "kąt wklęsły",
  full: "kąt pełny",
};

export const ANGLE_RECOGNITION_SEEDS = {
  anatomy: 421101,
  openness: 421201,
  greek: 421301,
  notation: 421401,
  measures: 421501,
  "color-types": 421601,
  figure: 421701,
  "point-cloud": 421801,
} as const satisfies Record<AngleRecognitionActivity, number>;

const ACTIVITY_BY_SEED = new Map<number, AngleRecognitionActivity>(
  Object.entries(ANGLE_RECOGNITION_SEEDS).map(([activity, seed]) => [seed, activity as AngleRecognitionActivity]),
);

export function isAngleRecognitionSeed(seed: number): boolean {
  return ACTIVITY_BY_SEED.has(seed);
}

export function getAngleRecognitionActivity(seed: number): AngleRecognitionActivity {
  const activity = ACTIVITY_BY_SEED.get(seed);
  if (!activity) throw new Error(`Seed ${seed} nie należy do tematu o rozpoznawaniu kątów.`);
  return activity;
}

export function classifyCompleteAngle(measure: number): CompleteAngleType {
  if (!Number.isFinite(measure) || measure < 0 || measure > 360) {
    throw new Error("Miara kąta musi należeć do przedziału od 0° do 360°.");
  }
  if (measure === 0) return "zero";
  if (measure < 90) return "acute";
  if (measure === 90) return "right";
  if (measure < 180) return "obtuse";
  if (measure === 180) return "straight";
  if (measure < 360) return "reflex";
  return "full";
}

export function isConvexAngle(measure: number): boolean {
  return measure >= 0 && measure <= 180;
}
