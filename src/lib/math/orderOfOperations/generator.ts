import { evaluateTokens, getValidNextOperatorIndices } from "@/lib/math/orderOfOperations/evaluate";
import { createSeededRng, pickInt, pickOne } from "@/lib/math/orderOfOperations/seededRng";
import type {
  ExpressionToken,
  OperationSymbol,
  OrderExpressionProblem,
  StepValidationResult,
} from "@/lib/math/orderOfOperations/types";

const ADD_OPS: OperationSymbol[] = ["+", "-"];
const MUL_OPS: OperationSymbol[] = ["×", "÷"];

export function generateOrderExpression(seed: number, difficulty: OrderExpressionProblem["difficulty"]): OrderExpressionProblem {
  const rng = createSeededRng(seed);

  let tokens: ExpressionToken[];
  if (difficulty === "support") {
    tokens = buildSupportExpression(rng);
  } else if (difficulty === "challenge") {
    tokens = buildChallengeExpression(rng);
  } else {
    tokens = buildCoreExpression(rng);
  }

  const finalValue = evaluateTokens(tokens);
  if (finalValue === null) {
    return generateOrderExpression(seed + 1, difficulty);
  }

  const validNextOperatorIndices = getValidNextOperatorIndices(tokens);

  return {
    generatorId: "order-director-v1",
    generatorVersion: 1,
    seed,
    difficulty,
    tokens,
    validNextOperatorIndices,
    finalValue,
  };
}

function buildSupportExpression(rng: ReturnType<typeof createSeededRng>): ExpressionToken[] {
  const a = pickInt(rng, 2, 12);
  const b = pickInt(rng, 2, 9);
  const c = pickInt(rng, 2, 9);
  const mulOp = pickOne(rng, MUL_OPS);
  const addOp = pickOne(rng, ADD_OPS);

  if (mulOp === "÷" && a % b !== 0) {
    return [
      { type: "number", value: a * b },
      { type: "operator", value: "÷" },
      { type: "number", value: b },
      { type: "operator", value: addOp },
      { type: "number", value: c },
    ];
  }

  return [
    { type: "number", value: a },
    { type: "operator", value: addOp },
    { type: "number", value: b },
    { type: "operator", value: mulOp },
    { type: "number", value: c },
  ];
}

function buildCoreExpression(rng: ReturnType<typeof createSeededRng>): ExpressionToken[] {
  const a = pickInt(rng, 3, 18);
  const b = pickInt(rng, 2, 9);
  const c = pickInt(rng, 2, 9);
  const d = pickInt(rng, 2, 12);
  const op1 = pickOne(rng, ADD_OPS);
  const op2 = pickOne(rng, MUL_OPS);
  const op3 = pickOne(rng, ADD_OPS);

  const inner: ExpressionToken[] =
    op2 === "÷" && (a * b) % b === 0
      ? [
          { type: "number", value: a * b },
          { type: "operator", value: "÷" },
          { type: "number", value: b },
        ]
      : [
          { type: "number", value: a },
          { type: "operator", value: op2 },
          { type: "number", value: b },
        ];

  return [
    ...inner,
    { type: "operator", value: op1 },
    { type: "number", value: c },
    { type: "operator", value: op3 },
    { type: "number", value: d },
  ];
}

function buildChallengeExpression(rng: ReturnType<typeof createSeededRng>): ExpressionToken[] {
  const a = pickInt(rng, 4, 20);
  const b = pickInt(rng, 2, 8);
  const c = pickInt(rng, 2, 8);
  const d = pickInt(rng, 2, 10);
  const opOuter = pickOne(rng, ADD_OPS);
  const opInner = pickOne(rng, MUL_OPS);

  const innerRight: ExpressionToken[] =
    opInner === "÷" && (c * d) % d === 0
      ? [
          { type: "number", value: c * d },
          { type: "operator", value: "÷" },
          { type: "number", value: d },
        ]
      : [
          { type: "number", value: c },
          { type: "operator", value: opInner },
          { type: "number", value: d },
        ];

  return [
    { type: "number", value: a },
    { type: "operator", value: opOuter },
    { type: "paren", value: "(" },
    ...innerRight,
    { type: "paren", value: ")" },
    { type: "operator", value: "×" },
    { type: "number", value: b },
  ];
}

export function validateNextStep(
  problem: OrderExpressionProblem,
  selectedOperatorIndex: number,
): StepValidationResult {
  if (!problem.validNextOperatorIndices.includes(selectedOperatorIndex)) {
    if (problem.validNextOperatorIndices.length === 0) {
      return { ok: false, errorCode: "already-done", message: "Wyrażenie jest już uproszczone." };
    }
    return {
      ok: false,
      errorCode: "wrong-priority",
      message: "Najpierw wykonaj działanie o wyższym priorytecie (mnożenie lub dzielenie przed dodawaniem).",
    };
  }
  return { ok: true, message: "Dobry wybór — to właściwy następny krok." };
}

/** Szybki test deterministyczny — min. 1000 seedów bez błędów (WP-021 odbiór). */
export function auditOrderGenerator(sampleSize = 1000): { ok: boolean; failures: number[] } {
  const failures: number[] = [];
  for (let seed = 1; seed <= sampleSize; seed += 1) {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      const problem = generateOrderExpression(seed * 3 + difficulty.length, difficulty);
      if (problem.finalValue === null || !Number.isFinite(problem.finalValue)) {
        failures.push(seed);
        break;
      }
      if (problem.validNextOperatorIndices.length === 0 && problem.tokens.some((t) => t.type === "operator")) {
        failures.push(seed);
        break;
      }
    }
  }
  return { ok: failures.length === 0, failures };
}
