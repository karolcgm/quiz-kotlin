import { describe, expect, it } from "vitest";

import { m664DiagramyProcentoweV1 } from "@/data/lessons/m6-6-4-diagramy-procentowe";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

describe("M6-6.4 Diagramy procentowe", () => {
  it("zastępuje szkielet opublikowanym pakietem", () => {
    expect(getLessonPackageForTopic("M6-6.4")).toBe(m664DiagramyProcentoweV1);
    expect(m664DiagramyProcentoweV1.status).toBe("published");
  });

  it("ma instrukcję oraz dwie serie po cztery diagramy", () => {
    const guide = m664DiagramyProcentoweV1.stages.find((stage) => stage.id.includes("percent-diagrams-guide"));
    const pie = m664DiagramyProcentoweV1.stages.find((stage) => stage.id.includes("percent-diagrams-pie"));
    const bars = m664DiagramyProcentoweV1.stages.find((stage) => stage.id.includes("percent-diagrams-bars"));

    expect(guide?.student?.modelId).toBe("decimal-notation-l1");
    expect(pie?.questions).toHaveLength(4);
    expect(bars?.questions).toHaveLength(4);
    expect(decimalNotationL1ActivityFromStageId(pie!.id)).toBe("percent-diagrams-pie");
    expect(decimalNotationL1ActivityFromStageId(bars!.id)).toBe("percent-diagrams-bars");
  });
});
