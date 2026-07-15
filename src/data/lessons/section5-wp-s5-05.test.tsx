/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalPowerTenL1Lab } from "@/components/lessons/decimals/DecimalPowerTenL1Lab";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m555DecimalPowerTenL1V1, section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

afterEach(cleanup);

describe("WP-S5-05 — mnożenie ułamków dziesiętnych przez 10, 100 i 1000", () => {
  it("zachowuje pełną nazwę programu na slajdzie 0 i kończy oceną ucznia", () => {
    const lesson = m555DecimalPowerTenL1V1;
    expect(lesson.id).toBe("m5-5-5-zmiana-wartosci-pozycji-l1-v1");
    expect(lesson.title).toBe("Mnożenie ułamków dziesiętnych przez 10, 100, 1000…");
    expect(lesson.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Cyfry zmieniają wartość",
      "×10, ×100, ×1000",
      "Zera tworzą potrzebne miejsca",
      "Skala mikroskopu",
      "Ćwiczenia — 5 przykładów",
      "Ocena umiejętności",
    ]);
    expect(lesson.stages[0]).toMatchObject({
      id: "m5-5-5-trace-0",
      board: { headline: "Mnożenie ułamków dziesiętnych przez 10, 100, 1000…" },
    });
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences).join(" ");
    expect(references).toContain("V.2");
    expect(references).toContain("V.6");
    expect(references).toContain("XII.6–7");
    expect(lesson.stages.at(-1)?.kind).toBe("understanding");
    expect(section5LessonsWpC5.filter((item) => item.topicId === "M5-5.5")).toEqual([lesson]);
  });

  it("ma pięć modeli treści i pięć osobnych zadań na jednym slajdzie", () => {
    expect(lessonChannelContractIssues(m555DecimalPowerTenL1V1)).toEqual([]);
    const modelStages = m555DecimalPowerTenL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "power10-position-shift",
      "power10-predict",
      "power10-missing-zero",
      "power10-microscope",
      "power10-practice",
    ]);
    const practice = modelStages.at(-1)!;
    expect(practice.questions).toHaveLength(5);
    expect(practice.print?.items).toHaveLength(5);
    expect(practice.board.bullets).toBeUndefined();
    expect(practice.questions.map((question) => question.seed)).toEqual([555500, 555501, 555502, 555503, 555504]);
    expect(practice.questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);
    expect(practice.understanding).toBeUndefined();
    expect(m555DecimalPowerTenL1V1.stages.at(-1)?.understanding?.evidenceStageId).toBe(practice.id);
  });

  it("nie wysyła klucza w publicznym snapshocie i zachowuje pięć dowodów", () => {
    const built = buildLessonSessionSnapshot(m555DecimalPowerTenL1V1);
    const practice = built.stageSnapshot.stages.find((stage) => stage.id.endsWith("-power10-practice"))!;
    expect(practice.questions).toHaveLength(5);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions).toHaveLength(5);
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
    expect(built.stageSnapshot.stages[0]?.curriculumCodes).toEqual(["V.2", "V.6", "XII.6–7 (konteksty jednostek)"]);
  });

  it("pokazuje ruch cyfr przy nieruchomym przecinku", () => {
    render(<DecimalPowerTenL1Lab activity="power10-position-shift" seed={555510} />);
    expect(screen.getByText("Przecinek nie wędruje. To cyfry zajmują pozycje o wartości 10 razy większej.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pokaż zmianę wartości cyfr" }));
    expect(screen.getByText("Cyfra 3: jedności → dziesiątki")).toBeInTheDocument();
    expect(screen.getByText("Cyfra 4: części dziesiąte → jedności")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Stała prowadnica przecinka")).toHaveLength(2);
  });

  it("diagnozuje brak zera, a potem zachowuje poprawiony tok", () => {
    render(<DecimalPowerTenL1Lab activity="power10-missing-zero" seed={555530} />);
    const input = screen.getByRole("textbox", { name: "Twój wynik" });
    fireEvent.change(input, { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość cyfr" }));
    expect(screen.getByText("Brakuje zera wiodącego albo zera pomocniczego w zapisie działania.")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "80" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość cyfr" }));
    expect(screen.getAllByText(/0,08 × 1000 = 80/)).toHaveLength(2);
    expect(document.querySelector("[data-required-zero='true']")).not.toBeNull();
  });

  it("ocenia liczbę i jednostkę osobno w zadaniu 5/5", () => {
    const onResultChange = vi.fn();
    render(<DecimalPowerTenL1Lab activity="power10-practice" seed={555504} taskSeed={555504} questionNumber={5} questionCount={5} onResultChange={onResultChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Twój wynik" }), { target: { value: "1200" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Jednostka wyniku" }), { target: { value: "m" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość cyfr" }));
    expect(onResultChange).toHaveBeenLastCalledWith(false, "1200 m");
    expect(screen.getByText("Wartość liczby może być poprawna, ale wybrano jednostkę innego wymiaru albo inną niż wymagana.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Jednostka wyniku" }), { target: { value: "mm" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość cyfr" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "1200 mm");
  });

  it("drukuje pięć przykładów bez cyfrowych kontrolek", () => {
    const practice = m555DecimalPowerTenL1V1.stages.find((stage) => stage.id.endsWith("-power10-practice"))!;
    const { container } = render(<LessonPrintWorksheet title={practice.print!.worksheetTitle} instructions={practice.print!.instructions} items={practice.print!.items ?? []} />);
    expect(screen.getByText("3,45 × 10")).toBeInTheDocument();
    expect(screen.getByText("0,34 × □ = 34")).toBeInTheDocument();
    expect(screen.getByText("1,2 m = □ mm")).toBeInTheDocument();
    expect(container.querySelector("button, input, select, textarea, [role='slider']")).toBeNull();
  });
});
