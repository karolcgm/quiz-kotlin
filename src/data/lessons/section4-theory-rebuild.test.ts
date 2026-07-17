import { describe, expect, it } from "vitest";
import {
  m541KonstrukcjeProstychL2V1,
  m542RozchylRamionaV1,
  m543RysowanieKatowL2V1,
  m544SkrzyzowanieProstychV1,
  m549LaboratoriumWlasnosciV1,
  m5410PrzesunWierzcholekV1,
  m5411TrapezyV1,
  m5412MapaRodzinFigurV1,
  m5413LustroFigurV1,
  m54rBiuroProjektoweV1,
} from "@/data/lessons/section4-wp-c4";
import { PLANE_FIGURES_THEORY_GENERATOR_ID } from "@/lib/math/geometry/planeFiguresTheory";

describe("Dział 4 — przebudowa teoretyczna", () => {
  it("obejmuje kąty od 0° do 360° oraz pary przy prostych równoległych", () => {
    expect(m542RozchylRamionaV1.stages.some((stage) => stage.title === "Zmieniaj rozwartość kąta")).toBe(true);
    expect(m542RozchylRamionaV1.stages.some((stage) => stage.title === "Pokoloruj kąty według rodzaju")).toBe(true);
    expect(m544SkrzyzowanieProstychV1.stages.some((stage) => stage.title === "Sieczna i proste równoległe")).toBe(true);
  });

  it("zastępuje generyczne późne tematy modelem teorii i trzema zadaniami", () => {
    const lessons = [m549LaboratoriumWlasnosciV1, m5410PrzesunWierzcholekV1, m5411TrapezyV1, m5412MapaRodzinFigurV1, m5413LustroFigurV1];
    lessons.forEach((lesson) => {
      const practice = lesson.stages.find((stage) => stage.title === "Ćwiczenia — 3 zadania");
      expect(practice?.questions).toHaveLength(3);
      expect(practice?.questions?.every((question) => question.generatorId === PLANE_FIGURES_THEORY_GENERATOR_ID)).toBe(true);
      expect(practice?.print?.items).toHaveLength(3);
    });
  });

  it("utrzymuje czas każdego przebudowanego tematu zgodny z planem lekcji", () => {
    const lessons = [m549LaboratoriumWlasnosciV1, m5410PrzesunWierzcholekV1, m5411TrapezyV1, m5412MapaRodzinFigurV1, m5413LustroFigurV1, m54rBiuroProjektoweV1];
    lessons.forEach((lesson) => {
      expect(lesson.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0), lesson.topicId).toBe(lesson.estimatedMinutes);
    });
  });

  it("ma dziesięć autorskich zadań powtórzeniowych w układzie 4 + 3 + 3", () => {
    const questionCounts = m54rBiuroProjektoweV1.stages
      .filter((stage) => stage.questions.length > 0)
      .map((stage) => stage.questions.length);
    expect(questionCounts).toEqual([4, 3, 3]);
    expect(questionCounts.reduce((sum, count) => sum + count, 0)).toBe(10);
  });

  it("opisuje konstrukcje na tablecie jako pokaz kroków", () => {
    const tabletText = [m541KonstrukcjeProstychL2V1, m543RysowanieKatowL2V1]
      .flatMap((lesson) => lesson.stages)
      .map((stage) => `${stage.student?.instruction ?? ""} ${stage.board.body ?? ""}`)
      .join(" ");
    expect(tabletText).not.toContain("Narysuj b wzdłuż ekierki");
    expect(tabletText).toContain("nie rysujesz kąta palcem");
  });
});
