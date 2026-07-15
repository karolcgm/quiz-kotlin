import {
  buildDecimalWrittenAddSubModel,
  buildDecimalWrittenMultiplyModel,
  convertDecimalUnit,
  decimalPlaceStateFromInput,
  formatDecimal,
  multiplyDecimalValues,
  parseDecimalInput,
} from "@/lib/math/decimals/decimalMath";
import type {
  DecimalGeneratorConfig,
  DecimalPublicQuestion,
  DecimalStrategyTrace,
  DecimalUnitId,
  DecimalValue,
  GeneratedDecimalQuestion,
} from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

function integerInRange(value: number, name: string, minimum: number, maximum: number): number {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} musi być liczbą całkowitą od ${minimum} do ${maximum}.`);
  }
  return value;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function drawInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function assertConfig(config: DecimalGeneratorConfig): void {
  integerInRange(config.decimalPlacesMin, "Najmniejsza liczba miejsc", 1, 4);
  integerInRange(config.decimalPlacesMax, "Największa liczba miejsc", config.decimalPlacesMin, 4);
  integerInRange(config.integerDigitsMax, "Liczba cyfr części całkowitej", 1, 4);
  integerInRange(config.maximumValue, "Maksymalna wartość", 1, 9999);
  if (!config.skillIds.length || config.skillIds.some((id) => !id.trim())) throw new Error("Generator wymaga skillId.");
  if (config.task === "unit" && (!config.units || config.units.length < 2)) throw new Error("Generator jednostek wymaga co najmniej dwóch jednostek.");
}

function decimalFromCoefficient(coefficient: number, scale: number): DecimalValue {
  return { sign: 1, coefficient: String(coefficient), scale };
}

function drawDecimal(random: () => number, config: DecimalGeneratorConfig, options: { nonZero?: boolean; maximumCoefficient?: number } = {}): { value: DecimalValue; display: string } {
  const scale = drawInteger(random, config.decimalPlacesMin, config.decimalPlacesMax);
  const hardMaximum = Math.min(
    options.maximumCoefficient ?? Number.MAX_SAFE_INTEGER,
    config.maximumValue * (10 ** scale),
    (10 ** (config.integerDigitsMax + scale)) - 1,
  );
  const coefficient = drawInteger(random, options.nonZero === false ? 0 : 1, Math.max(1, Math.floor(hardMaximum)));
  const value = decimalFromCoefficient(coefficient, scale);
  return { value, display: formatDecimal(value, { minimumFractionDigits: scale }) };
}

function unitPair(random: () => number, units: DecimalUnitId[]): [DecimalUnitId, DecimalUnitId] {
  const definitions: Record<DecimalUnitId, string> = {
    none: "none", mm: "length", cm: "length", dm: "length", m: "length", km: "length",
    mg: "mass", g: "mass", dag: "mass", kg: "mass", t: "mass", ml: "volume", l: "volume",
    gr: "currency", zł: "currency", "mm²": "area", "cm²": "area", "dm²": "area", "m²": "area",
  };
  const compatible = units.flatMap((from) => units.filter((to) => to !== from && definitions[to] === definitions[from]).map((to) => [from, to] as [DecimalUnitId, DecimalUnitId]));
  if (!compatible.length) throw new Error("Lista jednostek nie zawiera zgodnej pary tego samego wymiaru.");
  return compatible[drawInteger(random, 0, compatible.length - 1)];
}

export function buildGeneratedDecimalQuestion(input: {
  seed: number;
  difficulty: LessonDifficulty;
  config: DecimalGeneratorConfig;
}): GeneratedDecimalQuestion {
  const seed = integerInRange(input.seed, "Seed", 0, 0xffffffff);
  assertConfig(input.config);
  const random = seededRandom(seed);
  let left = drawDecimal(random, input.config);
  let right = drawDecimal(random, input.config);
  let expected = left.value;
  let operator: DecimalPublicQuestion["params"]["operator"] = "place";
  let prompt = "Umieść cyfry liczby w tabeli wartości pozycyjnych.";
  let sourceUnit: DecimalUnitId = "none";
  let requiredUnit: DecimalUnitId = "none";
  let strategy: DecimalStrategyTrace = input.config.task === "place-value"
    ? { placedDigits: decimalPlaceStateFromInput(left.display) }
    : {};

  if (input.config.task === "add") {
    const addendConfig = { ...input.config, maximumValue: Math.max(1, Math.floor(input.config.maximumValue / 2)) };
    left = drawDecimal(random, addendConfig);
    right = drawDecimal(random, addendConfig);
    operator = "+";
    expected = {
      sign: 1,
      coefficient: (BigInt(left.value.coefficient) * BigInt(10) ** BigInt(Math.max(0, right.value.scale - left.value.scale))
        + BigInt(right.value.coefficient) * BigInt(10) ** BigInt(Math.max(0, left.value.scale - right.value.scale))).toString(),
      scale: Math.max(left.value.scale, right.value.scale),
    };
    prompt = "Dodaj liczby pisemnie. Ustaw przecinki w jednej kolumnie.";
    const model = buildDecimalWrittenAddSubModel(left.display, right.display, "add");
    strategy = { commaAligned: true, exchanges: model.exchanges.map(({ columnPower, kind }) => ({ columnPower, kind })) };
  } else if (input.config.task === "subtract") {
    operator = "−";
    const scale = Math.max(left.value.scale, right.value.scale);
    const a = BigInt(left.value.coefficient) * BigInt(10) ** BigInt(scale - left.value.scale);
    const b = BigInt(right.value.coefficient) * BigInt(10) ** BigInt(scale - right.value.scale);
    if (a < b) [left, right] = [right, left];
    const top = BigInt(left.value.coefficient) * BigInt(10) ** BigInt(scale - left.value.scale);
    const bottom = BigInt(right.value.coefficient) * BigInt(10) ** BigInt(scale - right.value.scale);
    expected = { sign: 1, coefficient: (top - bottom).toString(), scale };
    prompt = "Odejmij liczby pisemnie i zaznacz pożyczanie, gdy jest potrzebne.";
    const model = buildDecimalWrittenAddSubModel(left.display, right.display, "subtract");
    strategy = { commaAligned: true, exchanges: model.exchanges.map(({ columnPower, kind }) => ({ columnPower, kind })) };
  } else if (input.config.task === "multiply") {
    operator = "×";
    const factorConfig = { ...input.config, maximumValue: Math.max(1, Math.floor(Math.sqrt(input.config.maximumValue))) };
    left = drawDecimal(random, factorConfig);
    right = drawDecimal(random, factorConfig);
    expected = multiplyDecimalValues(left.value, right.value);
    const model = buildDecimalWrittenMultiplyModel(left.display, right.display);
    prompt = "Oblicz iloczyny częściowe, dodaj kolumny i na końcu ustal przecinek.";
    strategy = {
      productPlaces: model.productPlaces,
      partialProductShifts: model.partialProducts.map((partial) => partial.shift),
      partialProducts: model.partialProducts.map((partial) => partial.digits),
      additionColumns: model.additionColumns.map(({ column, resultDigit, carryOut }) => ({ column, resultDigit, carryOut })),
    };
  } else if (input.config.task === "divide") {
    operator = ":";
    const factorMaximum = Math.max(1, Math.floor(Math.sqrt(input.config.maximumValue)));
    const divisor = drawDecimal(random, { ...input.config, maximumValue: factorMaximum });
    const quotientCoefficient = drawInteger(random, 1, factorMaximum);
    const quotient = { value: decimalFromCoefficient(quotientCoefficient, 0), display: String(quotientCoefficient) };
    const dividendValue = multiplyDecimalValues(divisor.value, quotient.value);
    left = { value: dividendValue, display: formatDecimal(dividendValue, { minimumFractionDigits: dividendValue.scale }) };
    right = divisor;
    expected = quotient.value;
    const scalePower = divisor.value.scale;
    prompt = "Przeskaluj dzielną i dzielnik przez tę samą potęgę 10, a potem podziel.";
    strategy = {
      divisionScalePower: scalePower,
      scaledDividend: formatDecimal({ ...dividendValue, scale: Math.max(0, dividendValue.scale - scalePower), coefficient: scalePower > dividendValue.scale ? `${dividendValue.coefficient}${"0".repeat(scalePower - dividendValue.scale)}` : dividendValue.coefficient }),
      scaledDivisor: formatDecimal({ ...divisor.value, scale: 0 }),
    };
  } else if (input.config.task === "unit") {
    operator = "convert";
    [sourceUnit, requiredUnit] = unitPair(random, input.config.units ?? []);
    expected = convertDecimalUnit(left.value, sourceUnit, requiredUnit);
    const maximumAllowed = parseDecimalInput(String(input.config.maximumValue));
    if (maximumAllowed.ok && BigInt(expected.coefficient) * BigInt(10) ** BigInt(Math.max(0, maximumAllowed.value.scale - expected.scale))
      > BigInt(maximumAllowed.value.coefficient) * BigInt(10) ** BigInt(Math.max(0, expected.scale - maximumAllowed.value.scale))) {
      [sourceUnit, requiredUnit] = [requiredUnit, sourceUnit];
      expected = convertDecimalUnit(left.value, sourceUnit, requiredUnit);
    }
    prompt = `Zamień wartość z ${sourceUnit} na ${requiredUnit}. Liczbę i jednostkę wpisz osobno.`;
  }

  const expectedDisplay = formatDecimal(expected, { minimumFractionDigits: expected.scale });
  const publicQuestion: DecimalPublicQuestion = {
    generatorId: "decimal-foundation",
    generatorVersion: 1,
    seed,
    difficulty: input.difficulty,
    params: {
      operands: input.config.task === "place-value" || input.config.task === "unit" ? [left.display] : [left.display, right.display],
      operator,
      prompt,
      sourceUnit,
      requiredUnit,
      decimalPlaces: input.config.task === "place-value" || input.config.task === "unit"
        ? [left.value.scale]
        : [left.value.scale, right.value.scale],
      maximumValue: input.config.maximumValue,
    },
    skillIds: [...input.config.skillIds],
    renderMode: input.config.task === "place-value" ? "decimal-place-grid" : "decimal-written-operation",
    invariants: [
      "comma-independent-of-locale",
      "trailing-zero-trace-preserved",
      "empty-is-not-zero",
      "answer-spec-server-only",
    ],
  };
  const zero = parseDecimalInput("0");
  const maximum = parseDecimalInput(String(input.config.maximumValue));
  if (!zero.ok || !maximum.ok) throw new Error("Błąd stałych generatora.");
  return {
    publicQuestion,
    answerSpec: {
      expected,
      expectedDisplay,
      expectedUnit: requiredUnit,
      strategy,
      allowEquivalentTrailingZeros: true,
      minimum: zero.value,
      maximum: maximum.value,
      maxScore: input.config.task === "unit" ? 2 : input.config.task === "place-value" ? 2 : 3,
    },
  };
}

/** Jawna bramka serializacji; kopiuje wyłącznie publiczne pola. */
export function toDecimalPublicQuestion(generated: GeneratedDecimalQuestion): DecimalPublicQuestion {
  return {
    ...generated.publicQuestion,
    params: { ...generated.publicQuestion.params, operands: [...generated.publicQuestion.params.operands], decimalPlaces: [...generated.publicQuestion.params.decimalPlaces] },
    skillIds: [...generated.publicQuestion.skillIds],
    invariants: [...generated.publicQuestion.invariants],
  };
}
