import type {
  FractionParseResult,
  FractionParserError,
  FractionStackValue,
  FractionValue,
  MixedFractionValue,
  NormalizedFraction,
} from "@/types/fractions";

function assertSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${name} musi być bezpieczną liczbą całkowitą.`);
  }
}

export function greatestCommonDivisor(left: number, right: number): number {
  assertSafeInteger(left, "Pierwsza liczba");
  assertSafeInteger(right, "Druga liczba");
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function normalizeFraction(value: FractionValue): NormalizedFraction {
  assertSafeInteger(value.numerator, "Licznik");
  assertSafeInteger(value.denominator, "Mianownik");
  if (value.denominator === 0) {
    throw new Error("Mianownik nie może być równy zero.");
  }
  const sign = value.denominator < 0 ? -1 : 1;
  const numerator = value.numerator * sign;
  const denominator = value.denominator * sign;
  const divisor = greatestCommonDivisor(numerator, denominator) || 1;
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
    normalized: true,
  };
}

export function mixedToImproper(value: MixedFractionValue): FractionValue {
  assertSafeInteger(value.wholePart, "Część całkowita");
  assertSafeInteger(value.numerator, "Licznik");
  assertSafeInteger(value.denominator, "Mianownik");
  if (value.denominator <= 0) throw new Error("Mianownik liczby mieszanej musi być dodatni.");
  if (value.numerator < 0) throw new Error("Licznik części ułamkowej nie może być ujemny.");
  const sign = value.wholePart < 0 || Object.is(value.wholePart, -0) ? -1 : 1;
  return {
    numerator: sign * (Math.abs(value.wholePart) * value.denominator + value.numerator),
    denominator: value.denominator,
  };
}

export function toMixedFraction(value: FractionValue): MixedFractionValue {
  const normalized = normalizeFraction(value);
  const wholePart = Math.trunc(normalized.numerator / normalized.denominator);
  return {
    wholePart,
    numerator: Math.abs(normalized.numerator % normalized.denominator),
    denominator: normalized.denominator,
  };
}

export function areEquivalentFractions(left: FractionValue, right: FractionValue): boolean {
  if (left.denominator === 0 || right.denominator === 0) return false;
  if (![left.numerator, left.denominator, right.numerator, right.denominator].every(Number.isSafeInteger)) {
    return false;
  }
  return BigInt(left.numerator) * BigInt(right.denominator)
    === BigInt(right.numerator) * BigInt(left.denominator);
}

export function isFractionSimplified(value: FractionValue): boolean {
  if (value.denominator <= 0) return false;
  return greatestCommonDivisor(value.numerator, value.denominator) === 1;
}

function parserError(
  input: string,
  code: FractionParserError["code"],
  message: string,
  part?: FractionParserError["part"],
): FractionParseResult {
  return { ok: false, error: { code, message, part, input } };
}

function parseSafeInteger(input: string): number | null {
  if (!/^[+-]?\d+$/u.test(input)) return null;
  const value = Number(input);
  return Number.isSafeInteger(value) ? value : null;
}

/**
 * Parser szkolnego zapisu: `3/4`, `12 / 25`, `1 3/4` oraz liczby całkowitej.
 * Nie zgaduje znaczenia wejścia z kilkoma kreskami lub dodatkowymi tokenami.
 */
export function parseFractionInput(rawInput: string): FractionParseResult {
  const input = rawInput.trim().replace(/\u2044/gu, "/");
  if (!input) {
    return parserError(rawInput, "FRA_EMPTY_PART", "Uzupełnij licznik i mianownik.", "fraction");
  }

  const slashCount = (input.match(/\//gu) ?? []).length;
  if (slashCount > 1) {
    return parserError(
      rawInput,
      "FRA_AMBIGUOUS_INPUT",
      "Zapis ma więcej niż jedną kreskę ułamkową. Rozdziel liczby na część całkowitą, licznik i mianownik.",
      "fraction",
    );
  }

  if (slashCount === 0) {
    const integer = parseSafeInteger(input);
    if (integer !== null) {
      const normalized = normalizeFraction({ numerator: integer, denominator: 1 });
      return {
        ok: true,
        kind: "integer",
        input: rawInput,
        value: { numerator: integer, denominator: 1 },
        normalized,
      };
    }
    if (/\s/u.test(input)) {
      return parserError(
        rawInput,
        "FRA_AMBIGUOUS_INPUT",
        "Nie wiadomo, która liczba jest częścią całkowitą, a która częścią ułamkową.",
        "fraction",
      );
    }
    return parserError(rawInput, "FRA_INVALID_FORMAT", "Wpisz ułamek albo liczbę mieszaną.", "fraction");
  }

  const [leftRaw = "", denominatorRaw = ""] = input.split("/");
  const left = leftRaw.trim();
  const denominatorText = denominatorRaw.trim();
  if (!left) return parserError(rawInput, "FRA_EMPTY_PART", "Uzupełnij licznik.", "numerator");
  if (!denominatorText) return parserError(rawInput, "FRA_EMPTY_PART", "Uzupełnij mianownik.", "denominator");

  const denominator = parseSafeInteger(denominatorText);
  if (denominator === null) {
    return parserError(rawInput, "FRA_INVALID_FORMAT", "Mianownik musi być liczbą całkowitą.", "denominator");
  }
  if (denominator === 0) {
    return parserError(
      rawInput,
      "FRA_ZERO_DENOMINATOR",
      "Na zero części nie można podzielić całości.",
      "denominator",
    );
  }

  const mixedMatch = left.match(/^([+-]?\d+)\s+(\d+)$/u);
  if (mixedMatch) {
    const wholeText = mixedMatch[1];
    const numeratorText = mixedMatch[2];
    const wholePart = parseSafeInteger(wholeText);
    const numerator = parseSafeInteger(numeratorText);
    if (wholePart === null || numerator === null) {
      return parserError(rawInput, "FRA_UNSAFE_INTEGER", "Wpisane liczby są zbyt duże.", "fraction");
    }
    if (denominator < 0) {
      return parserError(rawInput, "FRA_INVALID_FORMAT", "Mianownik liczby mieszanej musi być dodatni.", "denominator");
    }
    const sign = wholeText.startsWith("-") ? -1 : 1;
    const value = {
      numerator: sign * (Math.abs(wholePart) * Math.abs(denominator) + numerator),
      denominator: Math.abs(denominator),
    };
    return { ok: true, kind: "mixed", input: rawInput, value, normalized: normalizeFraction(value) };
  }

  if (/\s/u.test(left)) {
    return parserError(
      rawInput,
      "FRA_AMBIGUOUS_INPUT",
      "Liczba mieszana może mieć tylko jedną część całkowitą i jeden licznik.",
      "fraction",
    );
  }

  const numerator = parseSafeInteger(left);
  if (numerator === null) {
    const code = /^[+-]?\d+$/u.test(left) ? "FRA_UNSAFE_INTEGER" : "FRA_INVALID_FORMAT";
    return parserError(rawInput, code, "Licznik musi być liczbą całkowitą.", "numerator");
  }
  const value = { numerator, denominator };
  return { ok: true, kind: "fraction", input: rawInput, value, normalized: normalizeFraction(value) };
}

function rowToText(row: FractionStackValue["numerator"]): string | null {
  if (row.length === 0 || row.some((digit) => digit === "")) return null;
  return row.join("");
}

/** Parser stanu kratek. Pusta kratka pozostaje brakiem danych, nigdy zerem. */
export function parseFractionStackValue(value: FractionStackValue): FractionParseResult {
  const numerator = rowToText(value.numerator);
  const denominator = rowToText(value.denominator);
  const whole = value.wholePart ? rowToText(value.wholePart) : undefined;
  if (numerator === null) return parserError("", "FRA_EMPTY_PART", "Uzupełnij licznik.", "numerator");
  if (denominator === null) return parserError("", "FRA_EMPTY_PART", "Uzupełnij mianownik.", "denominator");
  if (value.wholePart && whole === null) {
    return parserError("", "FRA_EMPTY_PART", "Uzupełnij część całkowitą.", "whole");
  }
  return parseFractionInput(`${whole === undefined ? "" : `${whole} `}${numerator}/${denominator}`);
}

export function formatFraction(value: FractionValue, mixed = false): string {
  if (!mixed) return `${value.numerator}/${value.denominator}`;
  const parts = toMixedFraction(value);
  if (parts.numerator === 0) return String(parts.wholePart);
  if (parts.wholePart === 0) return `${value.numerator < 0 ? "-" : ""}${parts.numerator}/${parts.denominator}`;
  return `${parts.wholePart} ${parts.numerator}/${parts.denominator}`;
}

export function fractionStackValueFromFraction(
  value: FractionValue,
  options: { mixed?: boolean } = {},
): FractionStackValue {
  const digits = (part: number): FractionStackValue["numerator"] => {
    return String(Math.abs(part)).split("") as FractionStackValue["numerator"];
  };
  if (options.mixed) {
    const mixed = toMixedFraction(value);
    return {
      wholePart: digits(mixed.wholePart),
      numerator: digits(mixed.numerator),
      denominator: digits(mixed.denominator),
    };
  }
  return { numerator: digits(value.numerator), denominator: digits(value.denominator) };
}
