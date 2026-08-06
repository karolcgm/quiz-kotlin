/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { SolidReviewLessonLab, solidReviewActivityFromStageId } from "@/components/lessons/solids/SolidReviewLessonLab";
import { m699PowtorzenieFigurPrzestrzennychV1 } from "@/data/lessons/m6-9-9-powtorzenie-figur-przestrzennych";

afterEach(cleanup);

describe("SolidReviewLessonLab", () => {
  it("mapuje wszystkie etapy powtórzenia", () => {
    expect(solidReviewActivityFromStageId("m6-9-9-elements-s1")).toBe("elements");
    expect(solidReviewActivityFromStageId("m6-9-9-nets-s2")).toBe("nets");
    expect(solidReviewActivityFromStageId("m6-9-9-surface-s3")).toBe("surface");
    expect(solidReviewActivityFromStageId("m6-9-9-volume-s4")).toBe("volume");
    expect(solidReviewActivityFromStageId("m6-9-9-challenge-s5")).toBe("challenge");
  });

  it("pozwala swobodnie przechodzić między zadaniami", () => {
    render(<SolidReviewLessonLab activity="elements" />);

    fireEvent.click(screen.getByRole("button", { name: "Przejdź do zadania 4" }));
    expect(screen.getByText("Zadanie 4/4")).toBeInTheDocument();
    expect(screen.getByText("Czworościan jest szczególnym przykładem…")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Poprzednie zadanie" }));
    expect(screen.getByText("Zadanie 3/4")).toBeInTheDocument();
  });

  it("zachowuje neutralną informację po niepoprawnej odpowiedzi", () => {
    render(<SolidReviewLessonLab activity="elements" />);

    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));

    expect(screen.getByText("Spróbuj innym razem. Poprawny wynik to: 4. Dziś bez punktu.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Przejdź dalej bez punktu" })).toBeEnabled();
  });

  it("blokuje klawiaturę urządzenia w polach obliczeniowych i używa klawiatury lekcji", () => {
    render(<SolidReviewLessonLab activity="surface" />);

    const pp = screen.getByRole("textbox", { name: "Pp" });
    expect(pp).toHaveAttribute("inputmode", "none");
    expect(pp).toHaveAttribute("readonly");
    expect(screen.getByRole("region", { name: "Klawiatura do obliczeń" })).toBeInTheDocument();
  });

  it("zalicza zadanie z polem dopiero po uzupełnieniu wszystkich wyników", () => {
    render(<SolidReviewLessonLab activity="surface" />);

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Uzupełnij wszystkie wyniki.")).toBeInTheDocument();
  });

  it("renderuje etap powtórzenia w widoku prowadzącego", () => {
    const stage = m699PowtorzenieFigurPrzestrzennychV1.stages.find((item) => item.id.includes("nets-s2"));
    expect(stage).toBeDefined();
    render(<LessonStageView lessonId={m699PowtorzenieFigurPrzestrzennychV1.id} stage={stage!} channel="board" revealIndex={0} />);

    expect(screen.getByText("Siatki bez pułapek")).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
  });
});
