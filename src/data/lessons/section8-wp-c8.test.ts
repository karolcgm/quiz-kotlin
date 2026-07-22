import { describe, expect, it } from "vitest";
import { section8LessonsWpC8 } from "@/data/lessons/section8-wp-c8";

describe("jednostki objętości", () => {
  const lesson = section8LessonsWpC8.find((item) => item.topicId === "M5-8.1");
  const stages = lesson?.stages.filter((stage) => stage.board.modelId === "volume-units-lab") ?? [];

  it("prowadzi ucznia od definicji przez bryłę z klocków do doboru jednostek", () => {
    expect(lesson?.title).toBe("Jednostki objętości");
    expect(stages.map((stage) => stage.title)).toEqual([
      "Co to jest objętość?",
      "Bryła z sześcianów",
      "Ile sześcianów?",
      "Dopasuj jednostkę",
    ]);
  });

  it("udostępnia ten sam model na tablicy i tablecie", () => {
    for (const stage of stages) {
      expect(stage.student?.modelId).toBe("volume-units-lab");
      expect(stage.board.modelId).toBe("volume-units-lab");
    }
  });
});

describe("objętość prostopadłościanu i sześcianu", () => {
  const lesson = section8LessonsWpC8.find((item) => item.topicId === "M5-8.2");
  const stages = lesson?.stages.filter((stage) => stage.board.modelId === "cuboid-volume-lab") ?? [];

  it("prowadzi od wzorów przez bryły i wymiary do zadań tekstowych", () => {
    expect(lesson?.title).toBe("Objętość prostopadłościanu i sześcianu");
    expect(stages.map((stage) => stage.title)).toEqual([
      "Wzory na objętość",
      "Bryły z opisanymi krawędziami",
      "Wymiary bez rysunku",
      "Zadania tekstowe",
    ]);
  });

  it("udostępnia ten sam model na tablicy i tablecie", () => {
    for (const stage of stages) {
      expect(stage.student?.modelId).toBe("cuboid-volume-lab");
      expect(stage.board.modelId).toBe("cuboid-volume-lab");
    }
  });
});

describe("litry i mililitry", () => {
  const lesson = section8LessonsWpC8.find((item) => item.topicId === "M5-8.3");
  const stages = lesson?.stages.filter((stage) => stage.board.modelId === "liters-milliliters-lab") ?? [];

  it("łączy pojęcie objętości z miarką, zamianami i zadaniami praktycznymi", () => {
    expect(lesson?.title).toBe("Litry i mililitry");
    expect(stages.map((stage) => stage.title)).toEqual([
      "Objętość a pojemność",
      "Obrazowa miarka",
      "Zamiana jednostek",
      "Zadania praktyczne",
    ]);
  });

  it("udostępnia ten sam model na tablicy i tablecie", () => {
    for (const stage of stages) {
      expect(stage.student?.modelId).toBe("liters-milliliters-lab");
      expect(stage.board.modelId).toBe("liters-milliliters-lab");
    }
  });
});

describe("powtórzenie wiadomości o objętości", () => {
  const lesson = section8LessonsWpC8.find((item) => item.topicId === "M5-8.R");
  const stages = lesson?.stages.filter((stage) => stage.board.modelId === "volume-review-lab") ?? [];

  it("zawiera pięć serii zadań obejmujących cały dział", () => {
    expect(lesson?.title).toBe("Powtórzenie wiadomości — objętość");
    expect(stages.map((stage) => stage.title)).toEqual([
      "Bryły z kostek jednostkowych",
      "Objętość sześcianu i prostopadłościanu",
      "Litry, mililitry i jednostki objętości",
      "Zadania z treścią",
      "Misja objętości",
    ]);
  });

  it("udostępnia ten sam model powtórzenia na tablicy i tablecie", () => {
    for (const stage of stages) {
      expect(stage.student?.modelId).toBe("volume-review-lab");
      expect(stage.board.modelId).toBe("volume-review-lab");
    }
  });
});
