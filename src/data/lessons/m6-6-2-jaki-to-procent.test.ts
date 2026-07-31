import { describe, expect, it } from "vitest";
import { m662JakiToProcentV1 } from "@/data/lessons/m6-6-2-jaki-to-procent";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-6.2 Jaki to procent?", () => {
  it("zastępuje szkielet opublikowanym pakietem", () => {
    expect(getLessonPackageForTopic("M6-6.2")).toBe(m662JakiToProcentV1);
    expect(m662JakiToProcentV1.status).toBe("published");
  });

  it("ma przykład proporcji i jedną serię dziesięciu zadań", () => {
    const example = m662JakiToProcentV1.stages.find((stage) => stage.id.includes("percent-six-what-example"));
    const practice = m662JakiToProcentV1.stages.find((stage) => stage.id.includes("percent-six-what-practice"));
    expect(example).toBeDefined();
    expect(practice?.questions).toHaveLength(10);
  });
});
