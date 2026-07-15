import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("kontrakty widoku tablet / zoom / reduced motion / druk", () => {
  const css = readFileSync("src/components/lessons/decimals/decimals.module.css", "utf8");

  it("utrzymuje pola cyfr 52 px i przewijanie szerokich siatek", () => {
    expect(css).toContain("min-width: 52px");
    expect(css).toContain("min-height: 52px");
    expect(css).toContain("overflow-x: auto");
  });

  it("ma jawne tryby reduced motion, forced colors i papier", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-duration: .001ms");
    expect(css).toContain("@media (forced-colors: active)");
    expect(css).toContain("@media print");
    expect(css).toContain(".interactiveOnly");
  });
});
