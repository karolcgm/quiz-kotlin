import type {
  DecimalParseResult,
  DecimalPlaceDefinition,
  DecimalPlaceId,
  DecimalPlaceValueState,
  DecimalUnitDefinition,
  DecimalUnitId,
  DecimalUnitParseResult,
  DecimalValue,
  DecimalWrittenAddSubModel,
  DecimalWrittenDivideModel,
  DecimalWrittenMultiplyModel,
} from "@/types/decimals";

export const DECIMAL_PLACES: readonly DecimalPlaceDefinition[] = [
  { id: "thousands", label: "tysiące", shortLabel: "tys.", power: 3 },
  { id: "hundreds", label: "setki", shortLabel: "setki", power: 2 },
  { id: "tens", label: "dziesiątki", shortLabel: "dz.", power: 1 },
  { id: "ones", label: "jedności", shortLabel: "jedn.", power: 0 },
  { id: "tenths", label: "części dziesiąte", shortLabel: "dziesiąte", power: -1 },
  { id: "hundredths", label: "części setne", shortLabel: "setne", power: -2 },
  { id: "thousandths", label: "części tysięczne", shortLabel: "tysięczne", power: -3 },
  { id: "ten-thousandths", label: "części dziesięciotysięczne", shortLabel: "dziesięciotys.", power: -4 },
] as const;

export const DECIMAL_UNITS: readonly DecimalUnitDefinition[] = [
  { id: "none", label: "bez jednostki", dimension: "none", base10Exponent: 0, aliases: ["", "bez jednostki"] },
  { id: "mm", label: "milimetr", dimension: "length", base10Exponent: -3, aliases: ["mm"] },
  { id: "cm", label: "centymetr", dimension: "length", base10Exponent: -2, aliases: ["cm"] },
  { id: "dm", label: "decymetr", dimension: "length", base10Exponent: -1, aliases: ["dm"] },
  { id: "m", label: "metr", dimension: "length", base10Exponent: 0, aliases: ["m", "metr", "metry"] },
  { id: "km", label: "kilometr", dimension: "length", base10Exponent: 3, aliases: ["km"] },
  { id: "mg", label: "miligram", dimension: "mass", base10Exponent: -3, aliases: ["mg"] },
  { id: "g", label: "gram", dimension: "mass", base10Exponent: 0, aliases: ["g", "gram"] },
  { id: "dag", label: "dekagram", dimension: "mass", base10Exponent: 1, aliases: ["dag"] },
  { id: "kg", label: "kilogram", dimension: "mass", base10Exponent: 3, aliases: ["kg"] },
  { id: "t", label: "tona", dimension: "mass", base10Exponent: 6, aliases: ["t", "tona"] },
  { id: "ml", label: "mililitr", dimension: "volume", base10Exponent: -3, aliases: ["ml", "mL"] },
  { id: "l", label: "litr", dimension: "volume", base10Exponent: 0, aliases: ["l", "L", "litr"] },
  { id: "gr", label: "grosz", dimension: "currency", base10Exponent: -2, aliases: ["gr", "grosz"] },
  { id: "zł", label: "złoty", dimension: "currency", base10Exponent: 0, aliases: ["zł", "zl", "pln"] },
  { id: "mm²", label: "milimetr kwadratowy", dimension: "area", base10Exponent: -6, aliases: ["mm²", "mm2"] },
  { id: "cm²", label: "centymetr kwadratowy", dimension: "area", base10Exponent: -4, aliases: ["cm²", "cm2"] },
  { id: "dm²", label: "decymetr kwadratowy", dimension: "area", base10Exponent: -2, aliases: ["dm²", "dm2"] },
  { id: "m²", label: "metr kwadratowy", dimension: "area", base10Exponent: 0, aliases: ["m²", "m2"] },
] as const;

function parserError(input: string, code: "DEC_EMPTY" | "DEC_INVALID_FORMAT" | "DEC_MULTIPLE_SEPARATORS" | "DEC_UNSAFE_RANGE", message: string): DecimalParseResult {
  return { ok: false, error: { code, message, input } };
}

/**
 * Parser nie korzysta z locale urządzenia. Akceptuje polski przecinek i kropkę
 * z fizycznej klawiatury, lecz zawsze zwraca display z przecinkiem.
 */
export function parseDecimalInput(rawInput: string): DecimalParseResult {
  const input = rawInput.trim();
  if (!input) return parserError(rawInput, "DEC_EMPTY", "Uzupełnij liczbę. Puste pole nie oznacza zera.");
  if (/\s/u.test(input)) return parserError(rawInput, "DEC_INVALID_FORMAT", "Wewnątrz liczby nie może być spacji.");
  const separators = input.match(/[,.]/gu) ?? [];
  if (separators.length > 1) {
    return parserError(rawInput, "DEC_MULTIPLE_SEPARATORS", "W liczbie może wystąpić tylko jeden przecinek.");
  }
  const match = input.match(/^([+-]?)(\d*)([,.]?)(\d*)$/u);
  if (!match) return parserError(rawInput, "DEC_INVALID_FORMAT", "Wpisz cyfry i co najwyżej jeden przecinek.");
  const [, signText, integerRaw, separator = "", fractionDigits = ""] = match;
  if (!integerRaw && !fractionDigits) return parserError(rawInput, "DEC_EMPTY", "Uzupełnij cyfry liczby.");
  if (separator && !fractionDigits) return parserError(rawInput, "DEC_EMPTY", "Uzupełnij cyfry po przecinku.");
  if (integerRaw.length + fractionDigits.length > 100) {
    return parserError(rawInput, "DEC_UNSAFE_RANGE", "Liczba ma zbyt wiele cyfr.");
  }
  const integerDigits = integerRaw || "0";
  const coefficient = `${integerDigits}${fractionDigits}`.replace(/^0+(?=\d)/u, "") || "0";
  const sign: -1 | 1 = signText === "-" && coefficient !== "0" ? -1 : 1;
  const normalizedSign = sign === -1 ? "-" : signText === "+" ? "+" : "";
  return {
    ok: true,
    value: { sign, coefficient, scale: fractionDigits.length },
    trace: {
      rawInput,
      display: `${normalizedSign}${integerDigits}${separator ? `,${fractionDigits}` : ""}`,
      separator: separator ? separator as "," | "." : null,
      integerDigits,
      fractionDigits,
      leadingZeroCount: (integerDigits.match(/^0+/u)?.[0].length ?? 0),
      trailingZeroCount: (fractionDigits.match(/0+$/u)?.[0].length ?? 0),
    },
  };
}

function assertValue(value: DecimalValue): void {
  if (!/^[0-9]+$/u.test(value.coefficient) || !Number.isInteger(value.scale) || value.scale < 0) {
    throw new Error("Niepoprawny dokładny zapis liczby dziesiętnej.");
  }
}

export function formatDecimal(value: DecimalValue, options: { minimumFractionDigits?: number; trimTrailingZeros?: boolean } = {}): string {
  assertValue(value);
  let coefficient = value.coefficient.replace(/^0+(?=\d)/u, "") || "0";
  let scale = value.scale;
  if (options.trimTrailingZeros) {
    while (scale > 0 && coefficient.endsWith("0")) {
      coefficient = coefficient.slice(0, -1) || "0";
      scale -= 1;
    }
  }
  const minimum = Math.max(0, options.minimumFractionDigits ?? 0);
  if (scale < minimum) {
    coefficient += "0".repeat(minimum - scale);
    scale = minimum;
  }
  coefficient = coefficient.padStart(scale + 1, "0");
  const integer = scale === 0 ? coefficient : coefficient.slice(0, -scale);
  const fraction = scale === 0 ? "" : coefficient.slice(-scale);
  return `${value.sign < 0 && coefficient !== "0" ? "-" : ""}${integer}${scale ? `,${fraction}` : ""}`;
}

function scaledCoefficient(value: DecimalValue, targetScale: number): bigint {
  assertValue(value);
  const coefficient = BigInt(value.coefficient) * (value.sign < 0 ? BigInt(-1) : BigInt(1));
  return coefficient * (BigInt(10) ** BigInt(targetScale - value.scale));
}

export function compareDecimalValues(left: DecimalValue, right: DecimalValue): -1 | 0 | 1 {
  const scale = Math.max(left.scale, right.scale);
  const a = scaledCoefficient(left, scale);
  const b = scaledCoefficient(right, scale);
  return a < b ? -1 : a > b ? 1 : 0;
}

export function areEquivalentDecimals(left: DecimalValue, right: DecimalValue): boolean {
  return compareDecimalValues(left, right) === 0;
}

function fromSignedCoefficient(coefficient: bigint, scale: number): DecimalValue {
  return { sign: coefficient < BigInt(0) ? -1 : 1, coefficient: (coefficient < BigInt(0) ? -coefficient : coefficient).toString(), scale };
}

export function addDecimalValues(left: DecimalValue, right: DecimalValue): DecimalValue {
  const scale = Math.max(left.scale, right.scale);
  return fromSignedCoefficient(scaledCoefficient(left, scale) + scaledCoefficient(right, scale), scale);
}

export function subtractDecimalValues(left: DecimalValue, right: DecimalValue): DecimalValue {
  const scale = Math.max(left.scale, right.scale);
  return fromSignedCoefficient(scaledCoefficient(left, scale) - scaledCoefficient(right, scale), scale);
}

export function multiplyDecimalValues(left: DecimalValue, right: DecimalValue): DecimalValue {
  const signed = BigInt(left.coefficient) * BigInt(right.coefficient) * BigInt(left.sign * right.sign);
  return fromSignedCoefficient(signed, left.scale + right.scale);
}

export function scaleDecimalByPower10(value: DecimalValue, power: number): DecimalValue {
  if (!Number.isInteger(power) || Math.abs(power) > 100) throw new Error("Skala musi być całkowitą potęgą 10.");
  if (power <= value.scale) return { ...value, scale: value.scale - power };
  return { ...value, coefficient: `${value.coefficient}${"0".repeat(power - value.scale)}`, scale: 0 };
}

export function divideDecimalValues(dividend: DecimalValue, divisor: DecimalValue, maximumFractionDigits = 12): DecimalValue | null {
  if (BigInt(divisor.coefficient) === BigInt(0)) return null;
  const sign = dividend.sign * divisor.sign as -1 | 1;
  const numerator = BigInt(dividend.coefficient) * (BigInt(10) ** BigInt(divisor.scale));
  const denominator = BigInt(divisor.coefficient) * (BigInt(10) ** BigInt(dividend.scale));
  const integer = numerator / denominator;
  let remainder = numerator % denominator;
  let fraction = "";
  while (remainder !== BigInt(0) && fraction.length < maximumFractionDigits) {
    remainder *= BigInt(10);
    fraction += (remainder / denominator).toString();
    remainder %= denominator;
  }
  if (remainder !== BigInt(0)) return null;
  const coefficient = `${integer}${fraction}`.replace(/^0+(?=\d)/u, "") || "0";
  return { sign, coefficient, scale: fraction.length };
}

export function normalizeDecimalUnit(rawUnit: string, allowedUnits?: readonly DecimalUnitId[]): DecimalUnitParseResult {
  const input = rawUnit.trim().toLocaleLowerCase("pl-PL");
  const unit = DECIMAL_UNITS.find((candidate) => candidate.aliases.some((alias) => alias.toLocaleLowerCase("pl-PL") === input));
  if (!unit || (allowedUnits && !allowedUnits.includes(unit.id))) {
    return { ok: false, error: { code: "DEC_UNIT_MISMATCH", message: "Wybierz jednostkę zgodną z wielkością w zadaniu.", input: rawUnit } };
  }
  return { ok: true, unit };
}

export function convertDecimalUnit(value: DecimalValue, from: DecimalUnitId, to: DecimalUnitId): DecimalValue {
  const fromUnit = DECIMAL_UNITS.find((unit) => unit.id === from);
  const toUnit = DECIMAL_UNITS.find((unit) => unit.id === to);
  if (!fromUnit || !toUnit || fromUnit.dimension !== toUnit.dimension) throw new Error("Jednostki mają różne wymiary.");
  return scaleDecimalByPower10(value, fromUnit.base10Exponent - toUnit.base10Exponent);
}

export function decimalPlaceStateFromInput(input: string): DecimalPlaceValueState {
  const parsed = parseDecimalInput(input);
  if (!parsed.ok) throw new Error(parsed.error.message);
  const integer = parsed.trace.integerDigits;
  const fraction = parsed.trace.fractionDigits;
  const state: DecimalPlaceValueState = {};
  for (const place of DECIMAL_PLACES) {
    const digit = place.power >= 0
      ? integer[integer.length - 1 - place.power]
      : fraction[-place.power - 1];
    state[place.id] = (digit ?? "") as DecimalPlaceValueState[DecimalPlaceId];
  }
  return state;
}

export function decimalInputFromPlaceState(state: DecimalPlaceValueState): string {
  const integerPlaces = DECIMAL_PLACES.filter((place) => place.power >= 0);
  const fractionPlaces = DECIMAL_PLACES.filter((place) => place.power < 0);
  const firstInteger = integerPlaces.findIndex((place) => Boolean(state[place.id]));
  const integer = firstInteger < 0
    ? "0"
    : integerPlaces.slice(firstInteger).map((place) => state[place.id] || "□").join("");
  const fraction = fractionPlaces.map((place) => state[place.id] || "□").join("");
  const lastFilled = Math.max(...fractionPlaces.map((place, index) => state[place.id] !== "" && state[place.id] !== undefined ? index : -1));
  return lastFilled >= 0 ? `${integer},${fraction.slice(0, lastFilled + 1)}` : integer;
}

function requireParsed(input: string): DecimalParseResult & { ok: true } {
  const parsed = parseDecimalInput(input);
  if (!parsed.ok) throw new Error(parsed.error.message);
  if (parsed.value.sign < 0) throw new Error("Szkolna siatka fundamentu obsługuje liczby nieujemne.");
  return parsed;
}

function digitAtPower(parsed: DecimalParseResult & { ok: true }, power: number): string {
  if (power >= 0) return parsed.trace.integerDigits[parsed.trace.integerDigits.length - 1 - power] ?? "";
  return parsed.trace.fractionDigits[-power - 1] ?? "";
}

export function buildDecimalWrittenAddSubModel(leftInput: string, rightInput: string, operation: "add" | "subtract"): DecimalWrittenAddSubModel {
  const left = requireParsed(leftInput);
  const right = requireParsed(rightInput);
  const resultValue = operation === "add" ? addDecimalValues(left.value, right.value) : subtractDecimalValues(left.value, right.value);
  if (resultValue.sign < 0) throw new Error("W tym modelu odjemna nie może być mniejsza od odjemnika.");
  const resultDisplay = formatDecimal(resultValue);
  const resultParsed = requireParsed(resultDisplay);
  const integerCount = Math.max(left.trace.integerDigits.length, right.trace.integerDigits.length, resultParsed.trace.integerDigits.length);
  const fractionCount = Math.max(left.value.scale, right.value.scale, resultValue.scale);
  const columns = Array.from({ length: integerCount + fractionCount }, (_, index) => integerCount - 1 - index);
  const rows = [left, right].map((operand, rowIndex) => columns.map((power) => ({
    id: `operand-${rowIndex}-${power}`,
    digit: digitAtPower(operand, power) as "" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9",
    placePower: power,
  })));
  const result = columns.map((power) => ({
    id: `result-${power}`,
    digit: digitAtPower(resultParsed, power) as "" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9",
    placePower: power,
  }));
  const exchanges: DecimalWrittenAddSubModel["exchanges"] = [];
  let carryOrBorrow = 0;
  for (const power of [...columns].reverse()) {
    const top = Number(digitAtPower(left, power) || 0);
    const bottom = Number(digitAtPower(right, power) || 0);
    if (operation === "add") {
      const sum = top + bottom + carryOrBorrow;
      if (sum >= 10) exchanges.push({ columnPower: power, kind: "carry", from: 10, to: 1, label: `10 w kolumnie ${power} wymieniam na 1 w następnej kolumnie.` });
      carryOrBorrow = sum >= 10 ? 1 : 0;
    } else {
      const current = top - carryOrBorrow;
      if (current < bottom) exchanges.push({ columnPower: power, kind: "borrow", from: 1, to: 10, label: `Pożyczam 1 z następnej kolumny jako 10 w kolumnie ${power}.` });
      carryOrBorrow = current < bottom ? 1 : 0;
    }
  }
  return { operation, operands: [left, right], columns, rows, result, commaAfterPower: 0, exchanges };
}

function absoluteIntegerDigits(parsed: DecimalParseResult & { ok: true }): string {
  return `${parsed.trace.integerDigits}${parsed.trace.fractionDigits}`.replace(/^0+(?=\d)/u, "") || "0";
}

export function buildDecimalWrittenMultiplyModel(topInput: string, bottomInput: string): DecimalWrittenMultiplyModel {
  const top = requireParsed(topInput);
  const bottom = requireParsed(bottomInput);
  const integerTop = absoluteIntegerDigits(top);
  const integerBottom = absoluteIntegerDigits(bottom);
  const pairs: DecimalWrittenMultiplyModel["pairs"] = [];
  for (let bottomIndex = integerBottom.length - 1; bottomIndex >= 0; bottomIndex -= 1) {
    for (let topIndex = integerTop.length - 1; topIndex >= 0; topIndex -= 1) {
      const sequence = pairs.length;
      pairs.push({
        id: `pair-${bottomIndex}-${topIndex}`,
        symbol: String.fromCharCode(65 + (sequence % 26)),
        topDigit: integerTop[topIndex],
        bottomDigit: integerBottom[bottomIndex],
        topIndex,
        bottomIndex,
        topPower: integerTop.length - 1 - topIndex,
        bottomPower: integerBottom.length - 1 - bottomIndex,
        targetColumn: integerTop.length - 1 - topIndex + integerBottom.length - 1 - bottomIndex,
        product: Number(integerTop[topIndex]) * Number(integerBottom[bottomIndex]),
      });
    }
  }
  const partialProducts = [...integerBottom].reverse().map((digit, shift) => ({
    id: `partial-${shift}`,
    multiplierDigit: digit,
    shift,
    digits: `${BigInt(integerTop) * BigInt(digit)}${"0".repeat(shift)}`,
  }));
  const maxColumns = Math.max(...partialProducts.map((partial) => partial.digits.length));
  const additionColumns: DecimalWrittenMultiplyModel["additionColumns"] = [];
  let carry = 0;
  for (let column = 0; column < maxColumns; column += 1) {
    const digits = partialProducts.map((partial) => Number(partial.digits[partial.digits.length - 1 - column] ?? 0));
    const total = digits.reduce((sum, digit) => sum + digit, carry);
    additionColumns.push({ column, digits, carryIn: carry, resultDigit: total % 10, carryOut: Math.floor(total / 10) });
    carry = Math.floor(total / 10);
  }
  while (carry > 0) {
    additionColumns.push({ column: additionColumns.length, digits: partialProducts.map(() => 0), carryIn: carry, resultDigit: carry % 10, carryOut: Math.floor(carry / 10) });
    carry = Math.floor(carry / 10);
  }
  const product = multiplyDecimalValues(top.value, bottom.value);
  const productPlaces = top.trace.fractionDigits.length + bottom.trace.fractionDigits.length;
  return {
    top,
    bottom,
    integerTop,
    integerBottom,
    pairs,
    partialProducts,
    additionColumns,
    product,
    productDisplay: formatDecimal(product, { minimumFractionDigits: productPlaces }),
    productPlaces,
  };
}

export function buildDecimalWrittenDivideModel(dividendInput: string, divisorInput: string, appendedZeros = 0): DecimalWrittenDivideModel {
  const dividend = requireParsed(dividendInput);
  const divisor = requireParsed(divisorInput);
  if (BigInt(divisor.value.coefficient) === BigInt(0)) throw new Error("Dzielnik nie może być zerem.");
  if (!Number.isInteger(appendedZeros) || appendedZeros < 0 || appendedZeros > 8) throw new Error("Liczba dopisanych zer musi mieścić się od 0 do 8.");
  const scalePower = divisor.trace.fractionDigits.length;
  const scaledDividend = scaleDecimalByPower10(dividend.value, scalePower);
  const scaledDivisor = scaleDecimalByPower10(divisor.value, scalePower);
  const extendedDividend = appendedZeros > 0
    ? { ...scaledDividend, coefficient: `${scaledDividend.coefficient}${"0".repeat(appendedZeros)}`, scale: scaledDividend.scale + appendedZeros }
    : scaledDividend;
  const quotient = divideDecimalValues(extendedDividend, scaledDivisor);
  return {
    dividend,
    divisor,
    scalePower,
    scaledDividend,
    scaledDivisor,
    scaledDividendDisplay: formatDecimal(scaledDividend),
    scaledDivisorDisplay: formatDecimal(scaledDivisor),
    quotient,
    quotientDisplay: quotient ? formatDecimal(quotient, { trimTrailingZeros: true }) : null,
    appendedZeros,
  };
}
