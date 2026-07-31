import { describe, expect, it } from "vitest";

import { m667LiczbaGdyDanyProcentV1 } from "@/data/lessons/m6-6-7-liczba-gdy-dany-procent";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";
import { createWholeFromPercentTask } from "@/lib/math/decimals/wholeFromPercent";

describe("M6-6.7 Obliczanie liczby, gdy dany jest jej procent", () => {
  it("zastępuje szkielet opublikowanym pakietem", () => {
    expect(getLessonPackageForTopic("M6-6.7")).toBe(m667LiczbaGdyDanyProcentV1);
    expect(m667LiczbaGdyDanyProcentV1.status).toBe("published");
  });

  it("ma przykład i jedną krótką serię sześciu zadań", () => {
    const example = m667LiczbaGdyDanyProcentV1.stages.find((stage) => stage.id.includes("whole-from-percent-example"));
    const practice = m667LiczbaGdyDanyProcentV1.stages.find((stage) => stage.id.includes("whole-from-percent-practice"));

    expect(example?.student?.modelId).toBe("decimal-notation-l1");
    expect(practice?.questions).toHaveLength(6);
    expect(decimalNotationL1ActivityFromStageId(example!.id)).toBe("whole-from-percent-example");
    expect(decimalNotationL1ActivityFromStageId(practice!.id)).toBe("whole-from-percent-practice");
  });

  it("zaczyna od prostych procentów i kończy zadaniami dwuetapowymi", () => {
    const tasks = Array.from({ length: 6 }, (_, index) => createWholeFromPercentTask({
      activity: "whole-from-percent-practice",
      seed: 667200 + index,
    }));

    expect(tasks.slice(0, 4).map((task) => task.knownPercent)).toEqual([50, 25, 10, 20]);
    expect(tasks.slice(0, 4).map((task) => task.answer)).toEqual([70, 72, 120, 170]);
    expect(tasks.slice(4).every((task) => task.intermediatePercent !== undefined)).toBe(true);
  });
});
