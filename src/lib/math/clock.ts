export type ClockAsk = "hour" | "minute";

export function normalizeHour(hour: number): number {
  const wrapped = ((Math.round(hour) - 1) % 12 + 12) % 12 + 1;
  return wrapped;
}

export function normalizeMinute(minute: number, step = 1): number {
  const rounded = Math.round(minute / step) * step;
  return ((rounded % 60) + 60) % 60;
}

export function hourHandAngle(hour: number, minute: number): number {
  const h = normalizeHour(hour);
  const m = normalizeMinute(minute);
  return (h % 12) * 30 + m * 0.5;
}

export function minuteHandAngle(minute: number): number {
  return normalizeMinute(minute) * 6;
}

export function formatDigitalTime(hour: number, minute: number): string {
  const h = normalizeHour(hour);
  const m = normalizeMinute(minute);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function clockMinuteStep(slug: string): number {
  if (slug.includes("polowki") || slug.includes("kwadrans")) return 15;
  return 60;
}

export function allowedMinutes(slug: string): number[] {
  if (slug.includes("polowki") || slug.includes("kwadrans")) return [0, 15, 30, 45];
  return [0];
}
