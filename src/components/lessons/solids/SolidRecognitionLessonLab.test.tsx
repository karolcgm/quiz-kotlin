/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { SolidRecognitionLessonLab, solidRecognitionActivityFromStageId } from "@/components/lessons/solids/SolidRecognitionLessonLab";
import { m698RozpoznawanieFigurPrzestrzennychV1 } from "@/data/lessons/m6-9-8-rozpoznawanie-figur-przestrzennych";

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="solid-canvas" />,
}));

afterEach(cleanup);

describe("SolidRecognitionLessonLab", () => {
  it("pokazuje jedną bryłę i cztery nazwy do wyboru", () => {
    render(<SolidRecognitionLessonLab />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Model bryły przestrzennej do rozpoznania" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sześcian" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prostopadłościan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Walec" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ostrosłup czworokątny" })).toBeInTheDocument();
  });

  it("pozwala obrócić model i sprawdza dopasowanie", () => {
    render(<SolidRecognitionLessonLab />);

    expect(screen.getByRole("button", { name: "↶ Obróć" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Sześcian" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText("Brawo! To jest sześcian.")).toBeInTheDocument();
  });

  it("prosi o wybór, gdy uczeń nie zaznaczy nazwy", () => {
    render(<SolidRecognitionLessonLab />);

    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText("Wybierz nazwę bryły.")).toBeInTheDocument();
  });

  it("pozwala swobodnie przechodzić między zadaniami bez ich rozwiązywania", () => {
    render(<SolidRecognitionLessonLab />);

    fireEvent.click(screen.getByRole("button", { name: "Przejdź do zadania 4" }));
    expect(screen.getByText("Zadanie 4/10")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Poprzednie zadanie" }));
    expect(screen.getByText("Zadanie 3/10")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Następne zadanie →" }));
    expect(screen.getByText("Zadanie 4/10")).toBeInTheDocument();
  });

  it("zapamiętuje wybraną odpowiedź po przejściu do innego zadania", () => {
    render(<SolidRecognitionLessonLab />);

    fireEvent.click(screen.getByRole("button", { name: "Przejdź do zadania 4" }));
    fireEvent.click(screen.getByRole("button", { name: "Graniastosłup pięciokątny" }));
    expect(screen.getByRole("button", { name: "Graniastosłup pięciokątny" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Przejdź do zadania 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Przejdź do zadania 4" }));
    expect(screen.getByRole("button", { name: "Graniastosłup pięciokątny" })).toHaveAttribute("aria-pressed", "true");
  });

  it("w widoku prowadzącego pokazuje serię zamiast dodatkowej planszy", () => {
    const stage = m698RozpoznawanieFigurPrzestrzennychV1.stages.find((item) => item.id.includes("match-s1"));
    expect(stage).toBeDefined();
    render(<LessonStageView lessonId={m698RozpoznawanieFigurPrzestrzennychV1.id} stage={stage!} channel="board" revealIndex={0} />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    expect(screen.queryByText("Rozpoznaj bryłę")).not.toBeInTheDocument();
  });

  it("mapuje etap dopasowania", () => {
    expect(solidRecognitionActivityFromStageId()).toBe("match");
  });
});
