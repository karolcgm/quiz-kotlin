import { describe, expect, it } from "vitest";
import {
  DECIMAL_REVIEW_ACTIVITIES,
  createDecimalReviewTask,
  decimalReviewTaskCount,
} from "@/lib/math/decimals/decimalReview";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

describe("powtórzenie ułamków dziesiętnych", () => {
  it("obejmuje sześć różnych serii i 31 zadań", () => {
    expect(DECIMAL_REVIEW_ACTIVITIES).toHaveLength(6);
    expect(DECIMAL_REVIEW_ACTIVITIES.reduce((sum, activity) => sum + decimalReviewTaskCount(activity), 0)).toBe(31);
  });

  it("zawiera wszystkie cztery działania i zadania tekstowe", () => {
    const operationTasks = Array.from({ length: decimalReviewTaskCount("decimal-review-multiply-divide") }, (_, index) => createDecimalReviewTask("decimal-review-multiply-divide", index));
    const expressions = operationTasks.map((task) => task.kind === "numeric" ? task.expression : "").join(" ");
    expect(expressions).toContain("·");
    expect(expressions).toContain(":");

    const storyTasks = Array.from({ length: decimalReviewTaskCount("decimal-review-problems") }, (_, index) => createDecimalReviewTask("decimal-review-problems", index));
    expect(storyTasks.every((task) => task.kind === "story")).toBe(true);
    expect(new Set(storyTasks.map((task) => task.kind === "story" ? task.operator : ""))).toEqual(new Set([":", "+", "·", "−"]));
  });

  it("rozpoznaje aktywności po identyfikatorze slajdu", () => {
    for (const activity of DECIMAL_REVIEW_ACTIVITIES) {
      expect(decimalNotationL1ActivityFromStageId(`m5-5-r-${activity}`)).toBe(activity);
    }
  });
});
