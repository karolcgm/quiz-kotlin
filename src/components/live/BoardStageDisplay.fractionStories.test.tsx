// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m615DzialaniaUlamkiZwykleV1 } from "@/data/lessons/m6-1-5-dzialania-ulamki-zwykle";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";

afterEach(cleanup);

describe("BoardStageDisplay - zadania tekstowe z ulamkow", () => {
  it("pozwala nauczycielowi przechodzic w obie strony bez dokladania drugiego zadania pod pierwszym", () => {
    const stage = buildLessonSessionSnapshot(m615DzialaniaUlamkiZwykleV1).stageSnapshot.stages.find(
      (item) => item.id.endsWith("m5-3-r-mixed-stories"),
    );
    if (!stage) throw new Error("Brak slajdu z zadaniami tekstowymi o ulamkach.");

    render(<BoardStageDisplay stage={stage} stageIndex={10} stageCount={11} solutionRevealed={false} />);

    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(screen.getByText(/Do mieszanki wsypano/u)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Następne zadanie/u }));
    expect(screen.getByText("Zadanie 2/5")).toBeInTheDocument();
    expect(screen.getByText(/Trasa miała długość/u)).toBeInTheDocument();
    expect(screen.queryByText(/Do mieszanki wsypano/u)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Poprzednie zadanie/u }));
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(screen.getByText(/Do mieszanki wsypano/u)).toBeInTheDocument();
  });
});
