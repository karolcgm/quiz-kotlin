import { normalizeFraction, toMixedFraction } from "@/lib/math/fractions/fractionMath";
import type {
  FractionGeneratorConfig,
  FractionPublicQuestion,
  FractionValue,
  GeneratedFractionQuestion,
} from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

const GENERATOR_ID = "fraction-foundation" as const;
const GENERATOR_VERSION = 1 as const;

function integerInRange(value: number, name: string, minimum: number, maximum: number): number {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} musi być liczbą całkowitą od ${minimum} do ${maximum}.`);
  }
  return value;
}

/** Mały PRNG oparty na 32-bitowym seedzie; render nigdy nie używa Math.random(). */
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

function assertConfig(config: FractionGeneratorConfig): void {
  integerInRange(config.denominatorMin, "Najmniejszy mianownik", 2, 99);
  integerInRange(config.denominatorMax, "Największy mianownik", config.denominatorMin, 99);
  integerInRange(config.wholeMax ?? 3, "Największa część całkowita", 1, 20);
  integerInRange(config.equivalentMultiplierMax ?? 5, "Największy mnożnik", 2, 12);
  if (config.skillIds.length === 0 || config.skillIds.some((skillId) => !skillId.trim())) {
    throw new Error("Generator ułamków wymaga co najmniej jednego skillId.");
  }
}

function digitLimitFor(maximum: number): number {
  return Math.max(1, String(Math.abs(maximum)).length);
}

/**
 * Czysty rdzeń generatora używany przez testy seedów i moduł serwerowy.
 * Konsument klientowy powinien otrzymać wyłącznie `publicQuestion`.
 */
export function buildGeneratedFractionQuestion(input: {
  seed: number;
  difficulty: LessonDifficulty;
  config: FractionGeneratorConfig;
}): GeneratedFractionQuestion {
  const seed = integerInRange(input.seed, "Seed", 0, 0xffffffff);
  assertConfig(input.config);
  const random = seededRandom(seed);
  const denominator = drawInteger(
    random,
    input.config.denominatorMin,
    input.config.denominatorMax,
  );
  const wholeMax = input.config.wholeMax ?? 3;
  const multiplierMax = input.config.equivalentMultiplierMax ?? 5;
  const properNumerator = drawInteger(random, 1, denominator - 1);
  let source = { numerator: properNumerator, denominator };
  let expected: FractionValue = normalizeFraction(source);
  let sourceLabel = `${source.numerator}/${source.denominator}`;
  let prompt = "Zapisz wartość w kratkach ułamka.";
  let responseFormat: FractionPublicQuestion["params"]["responseFormat"] = "fraction";
  let showWholePart = false;
  let allowEquivalent = true;

  if (input.config.task === "simplify") {
    const multiplier = drawInteger(random, 2, multiplierMax);
    source = {
      numerator: properNumerator * multiplier,
      denominator: denominator * multiplier,
    };
    expected = normalizeFraction(source);
    sourceLabel = `${source.numerator}/${source.denominator}`;
    prompt = "Skróć ułamek do postaci nieskracalnej.";
    allowEquivalent = false;
  } else if (input.config.task === "convert-to-mixed") {
    const whole = drawInteger(random, 1, wholeMax);
    source = { numerator: whole * denominator + properNumerator, denominator };
    expected = normalizeFraction(source);
    sourceLabel = `${source.numerator}/${source.denominator}`;
    prompt = "Zapisz ułamek niewłaściwy jako liczbę mieszaną.";
    responseFormat = "mixed-or-improper";
    showWholePart = true;
  } else if (input.config.task === "write-equivalent") {
    source = { numerator: properNumerator, denominator };
    expected = normalizeFraction(source);
    sourceLabel = `${source.numerator}/${source.denominator}`;
    prompt = "Zapisz ułamek równoważny. Zachowaj tę samą wartość.";
  }

  const mixed = toMixedFraction(source);
  const publicQuestion: FractionPublicQuestion = {
    generatorId: GENERATOR_ID,
    generatorVersion: GENERATOR_VERSION,
    seed,
    difficulty: input.difficulty,
    params: {
      source,
      sourceLabel,
      prompt,
      responseFormat,
      showWholePart,
      digitLimit: digitLimitFor(Math.max(
        source.numerator,
        source.denominator,
        mixed.wholePart,
        input.config.denominatorMax * multiplierMax,
      )),
    },
    skillIds: [...input.config.skillIds],
    renderMode: "fraction-stack",
    invariants: [
      "positive-non-zero-denominator",
      "value-preserved-between-representations",
      "empty-is-not-zero",
    ],
  };

  return {
    publicQuestion,
    answerSpec: {
      expected,
      allowEquivalent,
      requireSimplified: input.config.requireSimplified ?? input.config.task === "simplify",
      expectedFormat: responseFormat,
      maxScore: input.config.requireSimplified || input.config.task === "simplify" ? 2 : 1,
    },
  };
}

/** Jawna bramka serializacji: zwracany obiekt nie może zawierać answerSpec. */
export function toFractionPublicQuestion(
  generated: GeneratedFractionQuestion,
): FractionPublicQuestion {
  return {
    ...generated.publicQuestion,
    params: {
      ...generated.publicQuestion.params,
      source: { ...generated.publicQuestion.params.source },
    },
    skillIds: [...generated.publicQuestion.skillIds],
    invariants: [...generated.publicQuestion.invariants],
  };
}
