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

describe("Dział 4 — przebudowa teoretyczna", () => {
  it("obejmuje kąty od 0° do 360° oraz pary przy prostych równoległych", () => {
    expect(m542RozchylRamionaV1.stages.some((stage) => stage.title === "Rodzaj kąta a jego rozwartość")).toBe(true);
    expect(m542RozchylRamionaV1.stages.some((stage) => stage.title === "Pokoloruj kąty według rodzaju")).toBe(true);
    expect(m544SkrzyzowanieProstychV1.stages.some((stage) => stage.title === "Kąty utworzone przez trzy proste")).toBe(true);
  });

  it("zastępuje generyczne późne tematy właściwymi modelami", () => {
    expect(m549LaboratoriumWlasnosciV1.stages.map((stage) => stage.title)).toEqual(expect.arrayContaining([
      "Własności prostokąta i kwadratu",
      "Przekątne prostokąta i kwadratu",
      "Obwód prostokąta i kwadratu",
    ]));
    expect(m5410PrzesunWierzcholekV1.stages.map((stage) => stage.title)).toEqual(expect.arrayContaining([
      "Własności równoległoboku i rombu",
      "Przekątne równoległoboku i rombu",
      "Obwód równoległoboku i rombu",
    ]));
    expect(m5411TrapezyV1.stages.map((stage) => stage.title)).toEqual(expect.arrayContaining([
      "Podstawy i ramiona trapezu",
      "Rodzaje trapezów",
      "Kąty w trapezie",
      "Obliczanie kątów trapezu",
      "Obwód trapezu i brakujący bok",
    ]));
    expect(m5411TrapezyV1.stages.find((stage) => stage.title === "Obwód trapezu i brakujący bok")?.print?.items).toHaveLength(5);
    const quadrilateralStages = m5412MapaRodzinFigurV1.stages.filter((stage) => [
      "Mapa rodzin czworokątów",
      "Jak wyglądają czworokąty?",
      "Własności potrzebne do rozpoznawania",
    ].includes(stage.title));
    expect(quadrilateralStages.map((stage) => stage.title)).toEqual([
      "Mapa rodzin czworokątów",
      "Jak wyglądają czworokąty?",
      "Własności potrzebne do rozpoznawania",
    ]);
    expect(quadrilateralStages.every((stage) => stage.questions.length === 0)).toBe(true);
    const symmetryStages = m5413LustroFigurV1.stages.filter((stage) => [
      "Co to jest oś symetrii?",
      "Osie symetrii różnych figur",
      "Ile osi symetrii ma figura?",
    ].includes(stage.title));
    expect(symmetryStages.map((stage) => stage.title)).toEqual([
      "Co to jest oś symetrii?",
      "Osie symetrii różnych figur",
      "Ile osi symetrii ma figura?",
    ]);
    expect(symmetryStages.every((stage) => stage.questions.length === 0)).toBe(true);
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
