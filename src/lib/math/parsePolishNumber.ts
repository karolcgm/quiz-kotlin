export type ParsePolishNumberResult =
  | { ok: true; value: number }
  | { ok: false; reason: "empty" | "invalid" };

/**
 * Parsuje liczbę wpisaną w polskim formacie (przecinek dziesiętny, spacje jako separator).
 * Puste pole nie jest traktowane jako zero.
 */
export function parsePolishNumber(raw: string): ParsePolishNumberResult {
  const trimmed = raw.trim();

  if (trimmed === "" || trimmed === "-") {
    return { ok: false, reason: "empty" };
  }

  const normalized = trimmed.replace(/\s+/g, "").replace(",", ".");
  const value = Number(normalized);

  if (!Number.isFinite(value)) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, value };
}

/** Wersja zwracająca null zamiast wyniku discriminated union — wygodna w formularzach. */
export function parsePolishNumberOrNull(raw: string): number | null {
  const result = parsePolishNumber(raw);
  return result.ok ? result.value : null;
}
