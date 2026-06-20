export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return Math.max(x, 1);
}

export function simplifyRatio(partA: number, partB: number): { partA: number; partB: number } {
  const safeA = Math.max(1, Math.round(partA));
  const safeB = Math.max(1, Math.round(partB));
  const divisor = gcd(safeA, safeB);
  return { partA: safeA / divisor, partB: safeB / divisor };
}

export function formatRatio(partA: number, partB: number): string {
  return `${partA}:${partB}`;
}

export function hasReducibleRatio(partA: number, partB: number): boolean {
  const simplified = simplifyRatio(partA, partB);
  return simplified.partA !== partA || simplified.partB !== partB;
}
