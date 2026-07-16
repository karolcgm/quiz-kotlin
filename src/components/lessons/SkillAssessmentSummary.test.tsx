// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SkillAssessmentSummary } from "@/components/lessons/SkillAssessmentSummary";
import type { UnderstandingAssessmentResult } from "@/types/understanding";

afterEach(cleanup);

const emptyAssessment: UnderstandingAssessmentResult = {
  source: null,
  score: 0,
  maxScore: 0,
  criteria: [{ id: "fraction-kind", skillId: "fraction-kind", label: "Rozpoznaję ułamki", status: "no_evidence", score: 0, maxScore: 0 }],
  correctFeedback: "Nie ma jeszcze potwierdzonego kryterium.",
  improvementFeedback: "Brakuje wyniku.",
  nextStep: "Wykonaj zadanie.",
};

describe("SkillAssessmentSummary", () => {
  it("nie pokazuje uczniowi technicznego braku dowodu, gdy nie zapisano jeszcze ćwiczenia", () => {
    render(<SkillAssessmentSummary assessment={emptyAssessment} />);

    expect(screen.getByText("Podsumowanie pojawi się po samodzielnym zadaniu")).toBeInTheDocument();
    expect(screen.getByText(/Najpierw rozwiąż i wyślij zadanie sprawdzające/u)).toBeInTheDocument();
    expect(screen.queryByText("brak dowodu")).not.toBeInTheDocument();
  });
});
