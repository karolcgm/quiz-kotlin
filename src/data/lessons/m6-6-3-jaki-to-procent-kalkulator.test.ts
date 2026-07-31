import { describe, expect, it } from "vitest";
import { m663JakiToProcentKalkulatorV1 } from "@/data/lessons/m6-6-3-jaki-to-procent-kalkulator";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-6.3 Jaki to procent? — kalkulator", () => {
  it("zastępuje szkielet opublikowanym pakietem", () => {
    expect(getLessonPackageForTopic("M6-6.3")).toBe(m663JakiToProcentKalkulatorV1);
    expect(m663JakiToProcentKalkulatorV1.status).toBe("published");
  });

  it("ma przykład kalkulatorowy i jedną serię dziesięciu zadań", () => {
    const guide = m663JakiToProcentKalkulatorV1.stages.find((stage) => stage.id.includes("percent-calculator-guide"));
    const practice = m663JakiToProcentKalkulatorV1.stages.find((stage) => stage.id.includes("percent-calculator-practice"));
    expect(guide?.student?.modelId).toBe("calculator-lab");
    expect(practice?.questions).toHaveLength(10);
  });
});
