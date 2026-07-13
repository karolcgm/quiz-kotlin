/**
 * Wybiera pozycję w puli tak, aby kolejne zadania w jednej stacji
 * przechodziły przez różne przykłady zamiast zależeć od reszty losowego ziarna.
 * Ziarno miesza kolejność, a numer zadania gwarantuje brak powtórzeń w cyklu.
 */
export function distinctIndex(seed: number, questionNumber: number | undefined, length: number) {
  if (length <= 1) return 0;
  const salt = Math.abs(Math.trunc(seed)) % length;
  const ordinal = Math.max(0, (questionNumber ?? 1) - 1) % length;
  return (salt + ordinal) % length;
}
