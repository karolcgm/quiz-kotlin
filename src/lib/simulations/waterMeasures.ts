export type VolumeDisplayMode = "ml" | "percent" | "fraction";

export interface BeakerDef {
  id: string;
  label: string;
  capacityMl: number;
  volumeMl: number;
  liquidColor: string;
}

export const DEFAULT_BEAKERS: BeakerDef[] = [
  { id: "small", label: "Miarka 100 ml", capacityMl: 100, volumeMl: 40, liquidColor: "#22d3ee" },
  { id: "medium", label: "Miarka 250 ml", capacityMl: 250, volumeMl: 125, liquidColor: "#38bdf8" },
  { id: "large", label: "Miarka 500 ml", capacityMl: 500, volumeMl: 200, liquidColor: "#6366f1" },
];

export function clampVolume(volume: number, capacity: number): number {
  return Math.max(0, Math.min(capacity, Math.round(volume)));
}

export function fillPercent(volume: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.round((volume / capacity) * 100);
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

export function volumeFraction(volume: number, capacity: number): string {
  if (capacity <= 0) return "0";
  const num = volume;
  const den = capacity;
  const g = gcd(num, den);
  if (g === den) return "1";
  if (num === 0) return "0";
  return `${num / g}/${den / g}`;
}

export function formatVolumeDisplay(
  volume: number,
  capacity: number,
  mode: VolumeDisplayMode,
): string {
  switch (mode) {
    case "ml":
      return `${volume} ml`;
    case "percent":
      return `${fillPercent(volume, capacity)}%`;
    case "fraction":
      return volumeFraction(volume, capacity);
  }
}

export function pourAmountFromInput(
  input: number,
  unit: "ml" | "percent",
  source: BeakerDef,
): number {
  if (unit === "ml") return input;
  return Math.round((source.volumeMl * input) / 100);
}

export function howManyFit(outerCapacity: number, innerCapacity: number): number {
  if (innerCapacity <= 0) return 0;
  return Math.floor(outerCapacity / innerCapacity);
}

export function equalizeVolumes(beakers: BeakerDef[]): BeakerDef[] {
  const total = beakers.reduce((sum, beaker) => sum + beaker.volumeMl, 0);
  const totalCapacity = beakers.reduce((sum, beaker) => sum + beaker.capacityMl, 0);
  if (totalCapacity === 0) return beakers;

  let remaining = total;
  return beakers.map((beaker, index) => {
    if (index === beakers.length - 1) {
      return { ...beaker, volumeMl: clampVolume(remaining, beaker.capacityMl) };
    }
    const share = Math.round((total * beaker.capacityMl) / totalCapacity);
    const assigned = Math.min(share, beaker.capacityMl, remaining);
    remaining -= assigned;
    return { ...beaker, volumeMl: assigned };
  });
}

export function equalizePercent(beakers: BeakerDef[]): BeakerDef[] {
  const avgPercent =
    beakers.reduce((sum, b) => sum + fillPercent(b.volumeMl, b.capacityMl), 0) / beakers.length;
  return beakers.map((beaker) => ({
    ...beaker,
    volumeMl: clampVolume(Math.round((avgPercent / 100) * beaker.capacityMl), beaker.capacityMl),
  }));
}

export interface MeasureTask {
  beakerId: string;
  targetPercent: number;
  tolerance: number;
}

export function buildRandomMeasureTask(beakers: BeakerDef[]): MeasureTask {
  const beaker = beakers[Math.floor(Math.random() * beakers.length)];
  const targetPercent = [25, 50, 75, 100][Math.floor(Math.random() * 4)];
  return { beakerId: beaker.id, targetPercent, tolerance: 5 };
}

export function gradeMeasureTask(beakers: BeakerDef[], task: MeasureTask): boolean {
  const beaker = beakers.find((b) => b.id === task.beakerId);
  if (!beaker) return false;
  const current = fillPercent(beaker.volumeMl, beaker.capacityMl);
  return Math.abs(current - task.targetPercent) <= task.tolerance;
}
