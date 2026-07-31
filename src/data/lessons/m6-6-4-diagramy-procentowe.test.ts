import { describe, expect, it } from "vitest";

import { m664DiagramyProcentoweV1 } from "@/data/lessons/m6-6-4-diagramy-procentowe";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";
import { percentDiagramTask } from "@/lib/math/decimals/percentDiagram";

describe("M6-6.4 Diagramy procentowe", () => {
  it("zastępuje szkielet opublikowanym pakietem", () => {
    expect(getLessonPackageForTopic("M6-6.4")).toBe(m664DiagramyProcentoweV1);
    expect(m664DiagramyProcentoweV1.status).toBe("published");
  });

  it("ma instrukcję oraz serie kolorowych diagramów", () => {
    const guide = m664DiagramyProcentoweV1.stages.find((stage) => stage.id.includes("percent-diagrams-guide"));
    const pie = m664DiagramyProcentoweV1.stages.find((stage) => stage.id.includes("percent-diagrams-pie"));
    const bars = m664DiagramyProcentoweV1.stages.find((stage) => stage.id.includes("percent-diagrams-bars"));

    expect(guide?.student?.modelId).toBe("decimal-notation-l1");
    expect(pie?.questions).toHaveLength(6);
    expect(bars?.questions).toHaveLength(5);
    expect(decimalNotationL1ActivityFromStageId(pie!.id)).toBe("percent-diagrams-pie");
    expect(decimalNotationL1ActivityFromStageId(bars!.id)).toBe("percent-diagrams-bars");
  });

  it("zawiera nowe inspiracje oraz podwójny diagram owoców", () => {
    expect(percentDiagramTask("percent-diagrams-pie", 664104).title).toBe("Wyniki szkolnego projektu");
    expect(percentDiagramTask("percent-diagrams-pie", 664105).title).toBe("Udział klas w szkolnym kiermaszu");

    const fruitBars = percentDiagramTask("percent-diagrams-bars", 664204);
    expect(fruitBars.title).toBe("Ulubione owoce w klasach 6A i 6B");
    expect(fruitBars.series).toHaveLength(2);
    expect(fruitBars.categories.every((category) => category.values.length === 2)).toBe(true);
  });
});
