import type { ExpressionToken, OperationSymbol } from "@/lib/math/orderOfOperations/types";

const PRECEDENCE: Record<OperationSymbol, number> = {
  "+": 1,
  "-": 1,
  "×": 2,
  "÷": 2,
};

function applyOp(a: number, b: number, op: OperationSymbol): number | null {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      if (b === 0 || a % b !== 0) return null;
      return a / b;
    default:
      return null;
  }
}

/** Oblicza wartość wyrażenia z nawiasami (pełna redukcja). */
export function evaluateTokens(tokens: ExpressionToken[]): number | null {
  const values: number[] = [];
  const ops: (OperationSymbol | "(")[] = [];

  const flushOps = (until?: "(") => {
    while (ops.length > 0) {
      const top = ops[ops.length - 1];
      if (until && top === until) {
        ops.pop();
        return;
      }
      if (top === "(") return;
      const op = ops.pop() as OperationSymbol;
      const b = values.pop();
      const a = values.pop();
      if (a === undefined || b === undefined) return;
      const result = applyOp(a, b, op);
      if (result === null) return;
      values.push(result);
    }
  };

  for (const token of tokens) {
    if (token.type === "number") {
      values.push(token.value);
      continue;
    }
    if (token.type === "paren") {
      if (token.value === "(") {
        ops.push("(");
      } else {
        flushOps("(");
      }
      continue;
    }
    const op = token.value;
    while (ops.length > 0) {
      const top = ops[ops.length - 1];
      if (top === "(") break;
      if (PRECEDENCE[top as OperationSymbol] >= PRECEDENCE[op]) {
        const prevOp = ops.pop() as OperationSymbol;
        const b = values.pop();
        const a = values.pop();
        if (a === undefined || b === undefined) return null;
        const result = applyOp(a, b, prevOp);
        if (result === null) return null;
        values.push(result);
      } else {
        break;
      }
    }
    ops.push(op);
  }

  flushOps();
  if (values.length !== 1) return null;
  return values[0]!;
}

function findInnermostParenRange(tokens: ExpressionToken[]): [number, number] | null {
  let best: [number, number] | null = null;
  const stack: number[] = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type === "paren" && token.value === "(") {
      stack.push(i);
    } else if (token.type === "paren" && token.value === ")") {
      const start = stack.pop();
      if (start !== undefined) {
        const span = i - start;
        if (!best || span < best[1] - best[0]) {
          best = [start, i];
        }
      }
    }
  }

  return best;
}

function operatorIndices(tokens: ExpressionToken[]): number[] {
  return tokens.flatMap((token, index) => (token.type === "operator" ? [index] : []));
}

/** Następny krok: najpierw wewnętrzny nawias, potem ×÷, potem +- (od lewej). */
export function getValidNextOperatorIndices(tokens: ExpressionToken[]): number[] {
  const ops = operatorIndices(tokens);
  if (ops.length === 0) return [];

  const parenRange = findInnermostParenRange(tokens);
  if (parenRange) {
    const [start, end] = parenRange;
    const inner = tokens.slice(start + 1, end);
    if (inner.some((t) => t.type === "operator")) {
      return getValidNextOperatorIndices(inner).map((idx) => start + 1 + idx);
    }
  }

  let maxPrec = 0;
  for (const index of ops) {
    const token = tokens[index];
    if (token.type !== "operator") continue;
    maxPrec = Math.max(maxPrec, PRECEDENCE[token.value]);
  }

  for (const index of ops) {
    const token = tokens[index];
    if (token.type === "operator" && PRECEDENCE[token.value] === maxPrec) {
      return [index];
    }
  }

  return [];
}

export function tokensToDisplay(tokens: ExpressionToken[]): string {
  return tokens
    .map((t) => {
      if (t.type === "number") return String(t.value);
      if (t.type === "operator") return ` ${t.value} `;
      return t.value;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
