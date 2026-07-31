import { describe, expect, it } from "vitest";

import { m665ObliczeniaProcentoweV1 } from "@/data/lessons/m6-6-5-obliczenia-procentowe";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";
import { createPercentOfNumberTask } from "@/lib/math/decimals/percentOfNumber";

describe("M6-6.5 Obliczenia procentowe", () => {
  it("zastępuje szkielet opublikowanym pakietem", () => {
    expect(getLessonPackageForTopic("M6-6.5")).toBe(m665ObliczeniaProcentoweV1);
    expect(m665ObliczeniaProcentoweV1.status).toBe("published");
  });

  it("zawiera przykład oraz trzy serie zadań", () => {
    const example = m665ObliczeniaProcentoweV1.stages.find((stage) => stage.id.includes("percent-six-of-example"));
    const practice = m665ObliczeniaProcentoweV1.stages.find((stage) => stage.id.includes("percent-six-of-practice"));
    const table = m665ObliczeniaProcentoweV1.stages.find((stage) => stage.id.includes("percent-six-of-table"));
    const stories = m665ObliczeniaProcentoweV1.stages.find((stage) => stage.id.endsWith("percent-six-of-story"));

    expect(example?.student?.modelId).toBe("decimal-notation-l1");
    expect(practice?.questions).toHaveLength(10);
    expect(table?.questions).toHaveLength(4);
    expect(stories?.questions).toHaveLength(6);
    expect(decimalNotationL1ActivityFromStageId(practice!.id)).toBe("percent-six-of-practice");
    expect(decimalNotationL1ActivityFromStageId(table!.id)).toBe("percent-six-of-table");
  });

  it("obejmuje procent większy od całości oraz tabelę obliczeń pamięciowych", () => {
    const overOneHundred = createPercentOfNumberTask({ activity: "percent-six-of-practice", seed: 665104 });
    const table = createPercentOfNumberTask({ activity: "percent-six-of-table", seed: 665200 });

    expect(overOneHundred.percent).toBe(150);
    expect(overOneHundred.answer).toBe(27);
    expect(table.tableRows?.map((row) => row.percent)).toEqual([1, 10, 30, 70, 90]);
  });
});
