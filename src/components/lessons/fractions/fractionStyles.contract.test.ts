import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./fractions.module.css", import.meta.url), "utf8");

describe("kontrakt zoomu, ruchu i druku modeli ułamkowych", () => {
  it("skaluje kratki w rem i zachowuje minimalny obszar dotyku klawiatury w komponencie", () => {
    expect(css).toMatch(/\.digitCell\s*\{[\s\S]*inline-size:\s*3\.25rem/u);
    expect(css).toMatch(/\.digitCell\s*\{[\s\S]*block-size:\s*3\.25rem/u);
  });

  it("ma jawne reguły prefers-reduced-motion oraz zatrzymania runtime", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain('[data-motion-paused="true"] .wave');
    expect(css).toContain("animation: none");
  });

  it("drukuje duże pionowe kratki i usuwa kontrolki ekranowe", () => {
    expect(css).toContain("@media print");
    expect(css).toMatch(/\.digitCell\s*\{[\s\S]*inline-size:\s*12mm/u);
    expect(css).toContain(".keypad");
    expect(css).toContain("display: none !important");
  });
});
