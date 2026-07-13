/** Stabilizuje ziarno całej serii, gdy generator zwiększa je razem z numerem pytania. */
export function stableSelectionSeed(seed: number, questionNumber: number | undefined) {
  return questionNumber === undefined ? seed : seed - questionNumber;
}

/**
 * Wybiera pozycję w puli tak, aby kolejne zadania w jednej stacji
 * przechodziły przez różne przykłady. Wywołuj z stableSelectionSeed(),
 * jeśli ziarna pytań są numerowane kolejno.
 */
export function distinctIndex(seed: number, questionNumber: number | undefined, length: number) {
  if (length <= 1) return 0;
  const salt = Math.abs(Math.trunc(seed)) % length;
  const ordinal = Math.max(0, (questionNumber ?? 1) - 1) % length;
  return (salt + ordinal) % length;
}

/** Wersja dla generatorów, które nadają pytaniom ziarna: baza + numer pytania. */
export function distinctSequenceIndex(seed: number, questionNumber: number | undefined, length: number) {
  return distinctIndex(stableSelectionSeed(seed, questionNumber), questionNumber, length);
}
