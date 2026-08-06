/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { PrismVolumeLessonLab, prismVolumeActivityFromStageId } from "@/components/lessons/solids/PrismVolumeLessonLab";
import { m696ObjetoscGraniastoslupaProstegoV1 } from "@/data/lessons/m6-9-6-objetosc-graniastoslupa-prostego";

afterEach(cleanup);

describe("PrismVolumeLessonLab", () => {
  it("pokazuje bryłę, osobną podstawę i wzór na objętość", () => {
    render(<PrismVolumeLessonLab activity="formula" />);

    expect(screen.getByText("V = Pp · H")).toBeInTheDocument();
    expect(screen.getByText("BRYŁA")).toBeInTheDocument();
    expect(screen.getByText("PODSTAWA")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "trapez" }));
    expect(screen.getByRole("img", { name: /podstawie: trapez/u })).toBeInTheDocument();
  });

  it("w jednej karcie wymaga obliczenia Pp i V", () => {
    render(<PrismVolumeLessonLab activity="calculate" />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    const pp = screen.getByLabelText("Pp — pole podstawy");
    const volume = screen.getByLabelText("V — objętość");
    expect(pp).toHaveAttribute("inputmode", "none");
    expect(pp).toHaveAttribute("readonly");
    expect(volume).toHaveAttribute("inputmode", "none");
    expect(volume).toHaveAttribute("readonly");

    const keypad = screen.getByLabelText("Kalkulator do objętości graniastosłupa");
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Uzupełnij Pp oraz V.")).toBeInTheDocument();

    fireEvent.click(pp);
    for (const digit of ["2", "0"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(volume);
    for (const digit of ["1", "4", "0"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Brawo! Pole podstawy i objętość są obliczone poprawnie.")).toBeInTheDocument();
  });

  it("pokazuje zadania tekstowe z danymi i osobnym rysunkiem podstawy", () => {
    render(<PrismVolumeLessonLab activity="stories" />);

    expect(screen.getByText(/Tunel ma kształt graniastosłupa trójkątnego/u)).toBeInTheDocument();
    expect(screen.getByText("Dane")).toBeInTheDocument();
    expect(screen.getByText("PODSTAWA")).toBeInTheDocument();
  });

  it("w widoku prowadzącego od razu pokazuje właściwy model", () => {
    const stage = m696ObjetoscGraniastoslupaProstegoV1.stages.find((item) => item.id.includes("calculate-s2"));
    expect(stage).toBeDefined();
    render(<LessonStageView lessonId={m696ObjetoscGraniastoslupaProstegoV1.id} stage={stage!} channel="board" revealIndex={0} />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    expect(screen.queryByText("Najpierw Pp, potem V")).not.toBeInTheDocument();
  });

  it("mapuje trzy etapy tematu", () => {
    expect(prismVolumeActivityFromStageId("m6-9-6-formula-s1")).toBe("formula");
    expect(prismVolumeActivityFromStageId("m6-9-6-calculate-s2")).toBe("calculate");
    expect(prismVolumeActivityFromStageId("m6-9-6-stories-s3")).toBe("stories");
  });
});
