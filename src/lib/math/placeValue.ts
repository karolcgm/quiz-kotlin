export interface PlaceValueParts {
  hundreds: number;
  tens: number;
  ones: number;
  total: number;
}

export function decomposeNumber(value: number): PlaceValueParts {
  const total = Math.max(0, Math.round(value));
  const hundreds = Math.floor(total / 100);
  const tens = Math.floor((total % 100) / 10);
  const ones = total % 10;
  return { hundreds, tens, ones, total };
}

export function usesCompactPlaceValue(value: number): boolean {
  return Math.abs(Math.round(value)) > 20;
}

export function formatPlaceValueSummary(value: number): string {
  const { hundreds, tens, ones, total } = decomposeNumber(value);
  const parts: string[] = [];
  if (hundreds > 0) parts.push(`${hundreds}×100`);
  if (tens > 0) parts.push(`${tens}×10`);
  if (ones > 0) parts.push(`${ones}×1`);
  if (parts.length === 0) return "0";
  return `${total} = ${parts.join(" + ")}`;
}
