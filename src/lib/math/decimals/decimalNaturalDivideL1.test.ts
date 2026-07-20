import { describe, expect, it } from "vitest";
import { createPublicDecimalNaturalDivideL1Task } from "@/lib/math/decimals/decimalNaturalDivideL1";

describe("M5-5.9 — dzielenie dziesiętne przez naturalne", () => {
  it("tworzy 10 zadań pisemnych bez reszty, także z dopisywaniem zer", () => {
    const tasks = Array.from({ length: 10 }, (_, index) => createPublicDecimalNaturalDivideL1Task({ seed: 559200 + index, difficulty: "core", activity: "decimal-natural-divide-written" }));
    expect(tasks.map((task) => task.result)).toEqual(["0,525", "0,84", "1,875", "0,45", "1,05", "0,48", "1,2", "0,45", "0,45", "1,5625"]);
    expect(tasks.some((task) => task.appendedZeros > 0)).toBe(true);
  });
});
