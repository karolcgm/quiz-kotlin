export function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function describeMovement(change: number): string {
  if (change > 0) {
    return `Ruch w prawo o ${change} ${change === 1 ? "jednostkę" : "jednostek"}.`;
  }
  if (change < 0) {
    const steps = Math.abs(change);
    return `Ruch w lewo o ${steps} ${steps === 1 ? "jednostkę" : "jednostek"}.`;
  }
  return "Brak ruchu — punkt pozostaje w tym samym miejscu.";
}

export function buildEquation(start: number, change: number, result: number): string {
  const changeLabel = change >= 0 ? `+ ${change}` : `- ${Math.abs(change)}`;
  return `${start} ${changeLabel} = ${result}`;
}
