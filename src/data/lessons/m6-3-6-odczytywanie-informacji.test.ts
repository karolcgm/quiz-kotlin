import { describe, expect, it } from "vitest";
import { m636OdczytywanieInformacjiV1 } from "@/data/lessons/m6-3-6-odczytywanie-informacji";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-3.6 Odczytywanie informacji", () => {
  it("publikuje pełną lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-3.6")?.id).toBe(m636OdczytywanieInformacjiV1.id);
    expect(m636OdczytywanieInformacjiV1.status).toBe("published");
  });

  it("ma instrukcję i trzy serie interaktywnych zadań", () => {
    const stages = m636OdczytywanieInformacjiV1.stages.filter((stage) => stage.student?.modelId === "information-reading-lab");
    expect(stages).toHaveLength(4);
    expect(stages[0]?.questions).toHaveLength(0);
    expect(stages.slice(1).every((stage) => stage.questions.length === 1)).toBe(true);
  });

  it("obejmuje odczytywanie tabel, diagramów i budowanie diagramu", () => {
    const titles = m636OdczytywanieInformacjiV1.stages.map((stage) => stage.title).join(" ");
    expect(titles).toMatch(/Odczytywanie informacji z tabel/u);
    expect(titles).toMatch(/Odczytywanie diagramów słupkowych/u);
    expect(titles).toMatch(/Z tabeli do diagramu słupkowego/u);
  });
});
