import { describe, expect, it } from "vitest";
import { m638PowtorzenieV1 } from "@/data/lessons/m6-3-8-powtorzenie";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-3.8 Powtórzenie wiadomości", () => {
  it("zastępuje szkielet opublikowanym pakietem", () => {
    expect(getLessonPackageForTopic("M6-3.8")?.id).toBe(m638PowtorzenieV1.id);
    expect(m638PowtorzenieV1.status).toBe("published");
  });

  it("obejmuje praktyczne rachunki, analizę danych i trudniejsze zadania", () => {
    const stages = m638PowtorzenieV1.stages.filter((stage) => stage.student?.modelId === "information-reading-lab");
    expect(stages).toHaveLength(3);
    expect(stages.map((stage) => stage.title)).toEqual([
      "Kalendarz, jednostki, skala i zaokrąglanie",
      "Tabele, diagramy i wykresy",
      "Zadania łączące wiadomości",
    ]);
    expect(stages.every((stage) => stage.questions.length === 1)).toBe(true);
  });
});
