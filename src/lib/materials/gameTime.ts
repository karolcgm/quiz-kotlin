export function formatMissionTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.trunc(seconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}
