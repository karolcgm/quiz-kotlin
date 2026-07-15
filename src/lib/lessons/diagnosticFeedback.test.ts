import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertDiagnosticMessage,
  buildDiagnosticFeedbackDelivery,
  createLessonGradeResult,
  isStandaloneForbiddenFeedback,
  toPublicLessonGradeResult,
} from "@/lib/lessons/diagnosticFeedback";
import type { LessonGradeResult } from "@/types/diagnosticFeedback";

const copy = {
  area: "Sprawdź ustawienie cyfr w kolumnach.",
  guidingQuestion: "Od której kolumny zaczynasz obliczenie?",
  visualHint: "Porównaj nagłówki obu aktywnych kolumn.",
  analogousExample: "W przykładzie 23 + 14 najpierw połącz jedności.",
};

describe("diagnostyczny kontrakt wyniku", () => {
  it.each<LessonGradeResult>([
    { status: "correct", score: 2, maxScore: 2, errorCodes: [], feedbackKey: "answer.correct" },
    { status: "partially-correct", score: 1, maxScore: 2, errorCodes: ["UNIT_MISSING"], feedbackKey: "answer.partial" },
    { status: "incorrect", score: 0, maxScore: 2, errorCodes: ["VALUE_WRONG"], feedbackKey: "answer.incorrect" },
    { status: "manual-review", score: 0, maxScore: 2, errorCodes: ["OPEN_REASONING"], feedbackKey: "answer.manual-review" },
  ])("akceptuje status $status z poprawnymi niezmiennikami", (result) => {
    expect(createLessonGradeResult(result)).toEqual(result);
  });

  it("odrzuca częściowy status bez częściowego wyniku", () => {
    expect(() => createLessonGradeResult({
      status: "partially-correct",
      score: 2,
      maxScore: 2,
      errorCodes: ["UNIT_MISSING"],
      feedbackKey: "answer.partial",
    })).toThrow(/partially-correct/);
  });

  it("usuwa normalizedAnswer z publicznego wyniku", () => {
    const publicResult = toPublicLessonGradeResult({
      status: "incorrect",
      score: 0,
      maxScore: 1,
      errorCodes: ["DEC_PLACE_VALUE"],
      feedbackKey: "decimal.place-value",
      normalizedAnswer: { expected: "2,50" },
    });

    expect(publicResult).not.toHaveProperty("normalizedAnswer");
    expect(JSON.stringify(publicResult)).not.toContain("2,50");
  });

  it("usuwa rozwiązanie z payloadu oceniania przed oddaniem", () => {
    const delivery = buildDiagnosticFeedbackDelivery({
      result: {
        status: "incorrect",
        score: 0,
        maxScore: 1,
        errorCodes: ["DEC_PLACE_VALUE"],
        feedbackKey: "decimal.place-value",
        normalizedAnswer: "2,50",
      },
      copy,
      solution: { steps: ["Poprawna odpowiedź to 2,50."] },
      mode: "assessment",
      submitted: false,
    });

    expect(delivery).not.toHaveProperty("solution");
    expect(JSON.stringify(delivery)).not.toContain("2,50");
  });

  it("udostępnia rozwiązanie po oddaniu ocenianej odpowiedzi", () => {
    const delivery = buildDiagnosticFeedbackDelivery({
      result: {
        status: "incorrect",
        score: 0,
        maxScore: 1,
        errorCodes: ["DEC_PLACE_VALUE"],
        feedbackKey: "decimal.place-value",
      },
      copy,
      solution: { steps: ["Ustaw cyfrę w kolumnie części dziesiątych."] },
      mode: "assessment",
      submitted: true,
    });

    expect(delivery.solution?.steps).toHaveLength(1);
  });
});

describe("zakaz samotnych komunikatów", () => {
  it.each(["Źle", "Źle!", "Błąd", "Błąd.", "Spróbuj ponownie", "Spróbuj jeszcze raz!"])(
    "odrzuca komunikat %s",
    (message) => {
      expect(isStandaloneForbiddenFeedback(message)).toBe(true);
      expect(() => assertDiagnosticMessage(message)).toThrow(/musi wskazywać obszar/);
    },
  );

  it("dopuszcza komunikat, który diagnozuje i podaje następny krok", () => {
    expect(isStandaloneForbiddenFeedback("Sprawdź mianownik i porównaj wielkość części.")).toBe(false);
  });

  it("nie pozwala wprowadzić zakazanych samotnych tekstów do UI lekcji i live", () => {
    const roots = [
      path.resolve(process.cwd(), "src/components/lessons"),
      path.resolve(process.cwd(), "src/components/live"),
    ];
    const forbiddenLiteral = /(["'`])(Źle|Błąd|Spróbuj ponownie|Spróbuj jeszcze raz)[.!?…]*\1/giu;
    const violations: string[] = [];

    const visit = (entryPath: string) => {
      for (const entry of fs.readdirSync(entryPath, { withFileTypes: true })) {
        const fullPath = path.join(entryPath, entry.name);
        if (entry.isDirectory()) visit(fullPath);
        else if (/\.tsx?$/u.test(entry.name) && !/\.test\.tsx?$/u.test(entry.name)) {
          if (forbiddenLiteral.test(fs.readFileSync(fullPath, "utf8"))) violations.push(fullPath);
          forbiddenLiteral.lastIndex = 0;
        }
      }
    };

    roots.forEach(visit);
    expect(violations).toEqual([]);
  });
});
