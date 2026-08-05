import { describe, expect, it } from "vitest";
import { m691ProstopadloscianyISzescianyV1 } from "@/data/lessons/m6-9-1-prostopadlosciany-i-szesciany";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-9.1 — Prostopadłościan i sześcian", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-9.1")?.id).toBe(m691ProstopadloscianyISzescianyV1.id);
    expect(m691ProstopadloscianyISzescianyV1.status).toBe("published");
  });

  it("prowadzi przez model, siatkę, elementy, krawędzie i pole powierzchni", () => {
    const titles = m691ProstopadloscianyISzescianyV1.stages.map((stage) => stage.title);
    expect(titles).toEqual([
      "Cele lekcji (slajd 0)",
      "Obejrzyj obie bryły",
      "Rozłóż bryłę do siatki",
      "Ściany, krawędzie i wierzchołki",
      "Położenie krawędzi",
      "Suma długości krawędzi",
      "Oblicz długość drutu",
      "Pole powierzchni",
      "Oblicz pole powierzchni",
      "Znajdź długość krawędzi",
      "Ocena umiejętności",
    ]);
    expect(m691ProstopadloscianyISzescianyV1.stages.filter((stage) => stage.board.modelId === "cuboid-cube-lab")).toHaveLength(9);
  });

  it("ma osobne, mierzalne cele dla budowy bryły, krawędzi i pola", () => {
    expect(m691ProstopadloscianyISzescianyV1.learningGoals).toHaveLength(3);
    expect(m691ProstopadloscianyISzescianyV1.successCriteria).toContain("Stosuję wzory na pole powierzchni prostopadłościanu i sześcianu.");
    expect(m691ProstopadloscianyISzescianyV1.successCriteria).toContain("Znajduję krawędzie równoległe i prostopadłe do wskazanej krawędzi.");
  });
});
