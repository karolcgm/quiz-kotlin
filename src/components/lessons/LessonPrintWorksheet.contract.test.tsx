// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";

afterEach(cleanup);

describe("WP-CONTEXT-04 — kontrakt renderera print", () => {
  it("zachowuje skillIds pozycji w semantycznym HTML arkusza", () => {
    const { container } = render(
      <LessonPrintWorksheet
        title="Karta pracy"
        instructions="Rozwiąż zadanie."
        items={[{
          id: "paper-1",
          expression: "1/2 + 1/4",
          prompt: "Oblicz i pokaż model.",
          skillIds: ["M5-3.6-common-denominator", "M5-3.6-add-fractions"],
        }]}
      />,
    );
    expect(container.querySelector("[data-skill-ids]"))
      .toHaveAttribute("data-skill-ids", "M5-3.6-common-denominator M5-3.6-add-fractions");
  });
});
