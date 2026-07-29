import { describe, expect, it } from "vitest";
import { m637OdczytywanieDanychZWykresowV1 } from "@/data/lessons/m6-3-7-odczytywanie-danych-z-wykresow";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-3.7 Odczytywanie danych z wykresów", () => {
  it("jest opublikowanym pakietem właściwego tematu", () => {
    expect(getLessonPackageForTopic("M6-3.7")?.id).toBe(m637OdczytywanieDanychZWykresowV1.id);
    expect(m637OdczytywanieDanychZWykresowV1.status).toBe("published");
  });

  it("zawiera wprowadzenie, budowanie wykresu i serię odczytywania", () => {
    const stages = m637OdczytywanieDanychZWykresowV1.stages.filter((stage) => stage.student?.modelId === "information-reading-lab");
    expect(stages).toHaveLength(3);
    expect(stages.map((stage) => stage.title)).toEqual([
      "Od tabeli do wykresu",
      "Rysowanie wykresu na podstawie tabeli",
      "Odczytywanie danych z wykresu",
    ]);
  });
});
