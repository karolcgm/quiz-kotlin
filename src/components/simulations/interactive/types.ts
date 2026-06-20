import type { SimulatorMode } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

export type FractionShape = "rect" | "circle";

export interface InteractiveVisualProps {
  slug: string;
  visualKind: string;
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: SimulatorMode;
  showSolution: boolean;
  compactChrome?: boolean;
  fractionShape: FractionShape;
  onFractionShapeChange: (shape: FractionShape) => void;
  onChange: (params: TestWidgetParams) => void;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  comparisonSign: "<" | "=" | ">" | null;
  onComparisonSignChange: (value: "<" | "=" | ">") => void;
  selectedLabel: string | null;
  onSelectedLabelChange: (value: string) => void;
  ratioPair: { partA: number; partB: number };
  onRatioPairChange: (value: { partA: number; partB: number }) => void;
}
