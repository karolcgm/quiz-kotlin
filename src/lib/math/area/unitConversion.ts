export type AreaUnitConversionActivity =
  | "length-relations"
  | "area-relations"
  | "length-conversions"
  | "area-conversions";

export interface UnitConversionTask {
  id: string;
  value: string;
  fromUnit: string;
  toUnit: string;
  answer: number;
  explanation: string;
}

export const LENGTH_CONVERSION_TASKS: UnitConversionTask[] = [
  { id: "m-cm", value: "3", fromUnit: "m", toUnit: "cm", answer: 300, explanation: "1 m = 100 cm, więc 3 · 100 = 300." },
  { id: "cm-mm", value: "45", fromUnit: "cm", toUnit: "mm", answer: 450, explanation: "1 cm = 10 mm, więc 45 · 10 = 450." },
  { id: "dm-cm", value: "7", fromUnit: "dm", toUnit: "cm", answer: 70, explanation: "1 dm = 10 cm, więc 7 · 10 = 70." },
  { id: "km-m", value: "2", fromUnit: "km", toUnit: "m", answer: 2000, explanation: "1 km = 1000 m, więc 2 · 1000 = 2000." },
  { id: "cm-m", value: "560", fromUnit: "cm", toUnit: "m", answer: 5.6, explanation: "100 cm = 1 m, więc 560 : 100 = 5,6." },
  { id: "m-km", value: "3500", fromUnit: "m", toUnit: "km", answer: 3.5, explanation: "1000 m = 1 km, więc 3500 : 1000 = 3,5." },
  { id: "mm-cm", value: "84", fromUnit: "mm", toUnit: "cm", answer: 8.4, explanation: "10 mm = 1 cm, więc 84 : 10 = 8,4." },
  { id: "decimal-m-dm", value: "6,2", fromUnit: "m", toUnit: "dm", answer: 62, explanation: "1 m = 10 dm, więc 6,2 · 10 = 62." },
  { id: "decimal-km-m", value: "0,7", fromUnit: "km", toUnit: "m", answer: 700, explanation: "1 km = 1000 m, więc 0,7 · 1000 = 700." },
  { id: "mm-m", value: "1250", fromUnit: "mm", toUnit: "m", answer: 1.25, explanation: "1000 mm = 1 m, więc 1250 : 1000 = 1,25." },
];

export const AREA_CONVERSION_TASKS: UnitConversionTask[] = [
  { id: "m2-dm2", value: "3", fromUnit: "m²", toUnit: "dm²", answer: 300, explanation: "1 m² = 100 dm², więc 3 · 100 = 300." },
  { id: "dm2-cm2", value: "5", fromUnit: "dm²", toUnit: "cm²", answer: 500, explanation: "1 dm² = 100 cm², więc 5 · 100 = 500." },
  { id: "cm2-mm2", value: "8", fromUnit: "cm²", toUnit: "mm²", answer: 800, explanation: "1 cm² = 100 mm², więc 8 · 100 = 800." },
  { id: "a-m2", value: "4", fromUnit: "a", toUnit: "m²", answer: 400, explanation: "1 a = 100 m², więc 4 · 100 = 400." },
  { id: "ha-a", value: "2", fromUnit: "ha", toUnit: "a", answer: 200, explanation: "1 ha = 100 a, więc 2 · 100 = 200." },
  { id: "m2-a", value: "350", fromUnit: "m²", toUnit: "a", answer: 3.5, explanation: "100 m² = 1 a, więc 350 : 100 = 3,5." },
  { id: "a-ha", value: "750", fromUnit: "a", toUnit: "ha", answer: 7.5, explanation: "100 a = 1 ha, więc 750 : 100 = 7,5." },
  { id: "m2-cm2", value: "6", fromUnit: "m²", toUnit: "cm²", answer: 60000, explanation: "To dwa kroki po · 100: 6 · 100 · 100 = 60 000." },
  { id: "mm2-dm2", value: "120000", fromUnit: "mm²", toUnit: "dm²", answer: 12, explanation: "To dwa kroki po : 100: 120 000 : 100 : 100 = 12." },
  { id: "decimal-ha-a", value: "0,6", fromUnit: "ha", toUnit: "a", answer: 60, explanation: "1 ha = 100 a, więc 0,6 · 100 = 60." },
  { id: "m2-ha", value: "25000", fromUnit: "m²", toUnit: "ha", answer: 2.5, explanation: "1 ha = 10 000 m², więc 25 000 : 10 000 = 2,5." },
  { id: "km2-ha", value: "3", fromUnit: "km²", toUnit: "ha", answer: 300, explanation: "1 km² = 100 ha, więc 3 · 100 = 300." },
];

export function areaUnitConversionActivityFromStageId(stageId: string): AreaUnitConversionActivity {
  if (stageId.endsWith("-s1")) return "length-relations";
  if (stageId.endsWith("-s2")) return "area-relations";
  if (stageId.endsWith("-s3")) return "length-conversions";
  return "area-conversions";
}

export function parsePolishDecimal(value: string): number | null {
  const normalized = value.trim().replace(/\s+/gu, "").replace(",", ".");
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/u.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPolishDecimal(value: number): string {
  return String(value).replace(".", ",");
}
