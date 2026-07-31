import { describe, expect, it } from "vitest";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { m651PoleProstokataV1 } from "@/data/lessons/m6-5-1-pole-prostokata";

describe("m651PoleProstokataV1", () => {
  it("zastępuje szkielet opublikowaną lekcją z pełnym modelem interaktywnym", () => {
    expect(getLessonPackageForTopic("M6-5.1")?.id).toBe(m651PoleProstokataV1.id);
    expect(m651PoleProstokataV1.status).toBe("published");

    const rectangleStages = m651PoleProstokataV1.stages.filter((stage) => stage.board.modelId === "rectangle-square-area-lab");
    const unitStages = m651PoleProstokataV1.stages.filter((stage) => stage.board.modelId === "area-unit-conversion-lab");
    expect(rectangleStages).toHaveLength(4);
    expect(unitStages).toHaveLength(2);
    expect(m651PoleProstokataV1.stages.map((stage) => stage.title)).toEqual(expect.arrayContaining([
      "Pole prostokąta i kwadratu",
      "Zależności między jednostkami pola",
      "Zamiana arów i hektarów",
      "Pole figury złożonej z prostokątów",
      "Zadania tekstowe",
    ]));
  });
});
