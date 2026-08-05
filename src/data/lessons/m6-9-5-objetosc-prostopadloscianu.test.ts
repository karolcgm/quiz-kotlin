import { describe, expect, it } from "vitest";
import { m695ObjetoscProstopadloscianuV1 } from "@/data/lessons/m6-9-5-objetosc-prostopadloscianu";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { litersMillilitersActivityFromStageId } from "@/components/lessons/volume";

describe("M6-9.5 — objętość prostopadłościanu", () => {
  it("zastępuje szkic opublikowanym tematem klasy VI", () => {
    expect(getLessonPackageForTopic("M6-9.5")?.id).toBe(m695ObjetoscProstopadloscianuV1.id);
    expect(m695ObjetoscProstopadloscianuV1.status).toBe("published");
    expect(m695ObjetoscProstopadloscianuV1.sectionId).toBe("M6-S9");
  });

  it("łączy model warstw, wzór, jednostki i zadania praktyczne", () => {
    expect(m695ObjetoscProstopadloscianuV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Co to jest objętość?",
      "Buduj bryłę warstwami",
      "Policz sześciany jednostkowe",
      "Wzór na objętość",
      "Odczytaj wymiary z bryły",
      "Objętość z podanych wymiarów",
      "Objętość, litry i mililitry",
      "Odczytaj pojemność z miarki",
      "Zamień jednostki objętości",
      "Objętość w zadaniach praktycznych",
      "Ocena umiejętności",
    ]);
    expect(m695ObjetoscProstopadloscianuV1.stages.filter((stage) => stage.board.modelId === "volume-units-lab")).toHaveLength(3);
    expect(m695ObjetoscProstopadloscianuV1.stages.filter((stage) => stage.board.modelId === "cuboid-volume-lab")).toHaveLength(4);
    expect(m695ObjetoscProstopadloscianuV1.stages.filter((stage) => stage.board.modelId === "liters-milliliters-lab")).toHaveLength(3);
    const measuringCup = m695ObjetoscProstopadloscianuV1.stages.find((stage) => stage.title === "Odczytaj pojemność z miarki");
    expect(measuringCup).toBeDefined();
    expect(litersMillilitersActivityFromStageId(measuringCup!.id)).toBe("measuring-cup");
  });

  it("ma trzy odrębne cele z obserwowalnymi kryteriami", () => {
    expect(m695ObjetoscProstopadloscianuV1.learningGoals).toHaveLength(3);
    expect(m695ObjetoscProstopadloscianuV1.learningGoals.every((goal) => goal.successCriteria.length >= 2)).toBe(true);
    expect(m695ObjetoscProstopadloscianuV1.successCriteria).toContain("Stosuję wzór V = a · b · c, a dla sześcianu V = a · a · a.");
  });
});
