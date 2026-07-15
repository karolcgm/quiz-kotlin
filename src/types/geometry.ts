import type { DiagnosticHighlightTarget, LessonGradeResult } from "@/types/diagnosticFeedback";

export type GeometryLabMode = "demo" | "guided" | "practice" | "assessment";

export interface GeometryPointCoordinates {
  x: number;
  y: number;
}

export interface GeometryPoint extends GeometryPointCoordinates {
  id: string;
  label: string;
  locked?: boolean;
}

export type GeometryObjectKind = "segment" | "ray" | "line";

export interface GeometryObject {
  id: string;
  kind: GeometryObjectKind;
  startPointId: string;
  endPointId: string;
  label?: string;
  showLength?: boolean;
}

export interface GeometryAngle {
  id: string;
  startPointId: string;
  vertexPointId: string;
  endPointId: string;
  label?: string;
  showMeasure?: boolean;
  showArc?: boolean;
  showRightAngleTarget?: boolean;
}

export interface GeometryPolygon {
  id: string;
  vertexIds: string[];
  closed: boolean;
  showSideLengths: boolean;
  showAngles: boolean;
  showClassification: boolean;
}

export interface GeometryGridConfig {
  visible: boolean;
  step: number;
  snap: boolean;
}

export interface GeometryViewport {
  width: number;
  height: number;
  padding: number;
  scale: number;
}

export interface GeometryTolerance {
  /** Tolerancja surowych obliczeń wektorowych. Na siatce relacje są dokładne. */
  absolute: number;
  /** Maksymalna różnica kierunków w stopniach dla swobodnego rysowania. */
  angleDegrees: number;
  /** Maksymalna różnica długości w jednostkach modelu dla swobodnego rysowania. */
  length: number;
}

export interface GeometryProtractor {
  visible: boolean;
  center: GeometryPointCoordinates;
  rotationDegrees: number;
  radius: number;
  scale: "inner" | "outer";
}

export interface GeometryEqualLengthConstraint {
  id: string;
  kind: "equal-length";
  referenceObjectId: string;
  targetObjectIds: string[];
}

export interface GeometryParallelConstraint {
  id: string;
  kind: "parallel";
  referenceObjectId: string;
  targetObjectIds: string[];
}

export interface GeometryPerpendicularConstraint {
  id: string;
  kind: "perpendicular";
  referenceObjectId: string;
  targetObjectIds: string[];
}

export interface GeometryFixedRadiusConstraint {
  id: string;
  kind: "fixed-radius";
  centerPointId: string;
  pointIds: string[];
  radius: number;
}

export interface GeometrySymmetryConstraint {
  id: string;
  kind: "symmetry";
  axis: {
    anchor: GeometryPointCoordinates;
    direction: GeometryPointCoordinates;
  };
  pointPairs: Array<[string, string]>;
}

export type GeometryConstraint =
  | GeometryEqualLengthConstraint
  | GeometryParallelConstraint
  | GeometryPerpendicularConstraint
  | GeometryFixedRadiusConstraint
  | GeometrySymmetryConstraint;

/** W całości serializowalny kontrakt modelu. Nie zawiera funkcji ani elementów DOM. */
export interface GeometryLabState {
  version: 1;
  mode: GeometryLabMode;
  viewport: GeometryViewport;
  grid: GeometryGridConfig;
  tolerance: GeometryTolerance;
  points: GeometryPoint[];
  objects: GeometryObject[];
  angles: GeometryAngle[];
  polygon: GeometryPolygon;
  constraints: GeometryConstraint[];
  selectedPointId: string | null;
  protractor: GeometryProtractor;
}

export interface GeometryHistoryState {
  initial: GeometryLabState;
  past: GeometryLabState[];
  present: GeometryLabState;
  future: GeometryLabState[];
}

export interface GeometryExactLength {
  squared: number;
  value: number;
  exact: string;
}

export interface GeometryIntersection {
  point: GeometryPointCoordinates;
  firstObjectId: string;
  secondObjectId: string;
  kind: "proper" | "endpoint";
}

export type GeometryAnalysisStatus = "valid" | "invalid";

export interface GeometryPolygonAnalysis {
  status: GeometryAnalysisStatus;
  vertexCount: number;
  signedAreaTwice: number;
  orientation: "clockwise" | "counterclockwise" | "degenerate";
  sideLengths: GeometryExactLength[];
  angleDegrees: number[];
  intersections: GeometryIntersection[];
  duplicatePointIds: string[];
  classification: string[];
  primaryClassification: string;
  errorCodes: GeometryFeedbackCode[];
}

export const GEOMETRY_FEEDBACK_CODES = {
  degenerate: "GEO_DEGENERATE",
  selfIntersection: "GEO_SELF_INTERSECTION",
  notParallel: "GEO_NOT_PARALLEL",
  notPerpendicular: "GEO_NOT_PERPENDICULAR",
  wrongVertex: "GEO_WRONG_VERTEX",
  angleCenterMisaligned: "ANGLE_CENTER_MISALIGNED",
  angleWrongScale: "ANGLE_WRONG_SCALE",
  triangleInequality: "TRIANGLE_INEQUALITY",
  classificationEvidence: "GEO_CLASSIFICATION_EVIDENCE",
} as const;

export type GeometryFeedbackCode =
  (typeof GEOMETRY_FEEDBACK_CODES)[keyof typeof GEOMETRY_FEEDBACK_CODES];

export interface GeometryDiagnosticPresentation {
  result: LessonGradeResult;
  highlights: DiagnosticHighlightTarget[];
}

export interface GeometryPrintSnapshot {
  version: 1;
  createdFrom: "geometry-lab";
  state: GeometryLabState;
  includeHandles: false;
  title: string;
  description: string;
}
