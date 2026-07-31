import { describe, expect, it } from "vitest";

import { m662JakiToProcentV1 } from "@/data/lessons/m6-6-2-jaki-to-procent";

describe("m6-6-2 metoda ulamka", () => {
  it("zawiera slajd informacyjny i jedna serie dziesieciu zadan", () => {
    const example = m662JakiToProcentV1.stages.find((stage) => stage.id.includes("percent-six-what-fraction-example"));
    const practice = m662JakiToProcentV1.stages.find((stage) => stage.id.includes("percent-six-what-fraction-practice"));

    expect(example?.kind).toBe("worked-example");
    expect(practice?.kind).toBe("practice");
    expect(practice?.questions).toHaveLength(10);
    expect(practice?.board.modelId).toBe("decimal-notation-l1");
  });
});
