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
  it("ma dwa slajdy treści: zasadę i serię 10 działań", () => {
    const lesson = m555DecimalPowerTenL1V1;
    expect(lesson.title).toBe("Mnożenie ułamków dziesiętnych przez 10, 100, 1000…");
    expect(lesson.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Mnożenie przez 10, 100 i 1000",
      "Ćwiczenia — 10 działań",
      "Ocena umiejętności",
    ]);
    expect(lesson.learningGoals).toHaveLength(1);
    expect(lesson.learningGoals[0]?.studentGoal).toBe("Nauczę się mnożyć ułamki dziesiętne przez 10, 100 i 1000.");
    expect(lesson.learningGoals[0]?.successCriteria).toHaveLength(3);
    expect(JSON.stringify(lesson.learningGoals)).not.toMatch(/zamianie jednostek/u);
    expect(section5LessonsWpC5.filter((item) => item.topicId === "M5-5.5")).toEqual([lesson]);
  });

  it("ma obrazowy przykład i 10 pytań przekazywanych po kolei", () => {
    expect(lessonChannelContractIssues(m555DecimalPowerTenL1V1)).toEqual([]);
    const modelStages = m555DecimalPowerTenL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "power10-position-shift",
      "power10-practice",
    ]);
    expect(modelStages.at(-1)?.questions).toHaveLength(10);
    expect(modelStages.at(-1)?.print?.items).toHaveLength(10);
  });

  it("przechowuje 10 kluczy poza publicznym snapshocie", () => {
    const built = buildLessonSessionSnapshot(m555DecimalPowerTenL1V1);
    const practice = built.stageSnapshot.stages.find((stage) => stage.id.endsWith("-power10-practice"))!;
    expect(practice.questions).toHaveLength(10);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions).toHaveLength(10);
  });

  it("pokazuje zasadę na trzech przykładach mnożenia przez potęgi 10", () => {
    render(<DecimalPowerTenL1Lab activity="power10-position-shift" seed={555510} />);
    expect(screen.getByText(/Przesuwamy przecinek w prawo/u)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "1,5 · 10 = 15,0")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "1,5 · 100 = 150,0")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "1,5 · 1000 = 1500,0")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "Trzy zera w mnożniku — przecinek przechodzi przez trzy miejsca.")).toBeInTheDocument();
  });

  it("ocenia samodzielnie wpisany wynik działania", () => {
    const onResultChange = vi.fn();
    render(<DecimalPowerTenL1Lab activity="power10-practice" seed={555500} taskSeed={555500} questionNumber={1} questionCount={10} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Przesuń przecinek o jedno miejsce w prawo" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Zatwierdź" }).at(-1)!);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "34,5");
  });

  it("drukuje 10 działań bez elementów interaktywnych", () => {
    const practice = m555DecimalPowerTenL1V1.stages.find((stage) => stage.id.endsWith("-power10-practice"))!;
    const { container } = render(<LessonPrintWorksheet title={practice.print!.worksheetTitle} instructions={practice.print!.instructions} items={practice.print!.items ?? []} />);
    expect(screen.getByText("3,45 · 10")).toBeInTheDocument();
    expect(screen.getByText("7,008 · 1000")).toBeInTheDocument();
    expect(container.querySelector("button, input, select, textarea, [role='slider']")).toBeNull();
  });
});
