export type OperationSymbol = "+" | "-" | "×" | "÷";

export type ExpressionToken =
  | { type: "number"; value: number }
  | { type: "operator"; value: OperationSymbol }
  | { type: "paren"; value: "(" | ")" };

export interface OrderExpressionProblem {
  generatorId: "order-director-v1";
  generatorVersion: 1;
  seed: number;
  difficulty: "support" | "core" | "challenge";
  tokens: ExpressionToken[];
  /** Indeksy operatorów (w tokens) — poprawne następne kroki */
  validNextOperatorIndices: number[];
  /** Wynik końcowy po pełnym obliczeniu */
  finalValue: number;
}

export interface StepValidationResult {
  ok: boolean;
  errorCode?: "wrong-priority" | "not-allowed" | "already-done";
  message: string;
}
