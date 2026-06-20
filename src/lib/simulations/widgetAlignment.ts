import type { Simulation } from "@/types/simulation";
import type { TestWidgetDefinition } from "@/types/testWidget";

const ACCEPTABLE_GENERIC: Record<string, Set<string>> = {
  "arithmetic-basic": new Set(["game"]),
  "number-line-result": new Set(["number-line"]),
  "fraction-part": new Set(["fraction", "game"]),
  "rectangle-measure": new Set(["geometry"]),
  "unit-conversion": new Set(["measurement"]),
  "number-comparison": new Set(["game", "algebra"]),
  "ratio-bar": new Set(["chart", "measurement", "algebra"]),
};

/** Set via registry export — updated at module init from dedicated slugs list. */
let dedicatedSlugs = new Set<string>();

export function registerDedicatedWidgetSlugs(slugs: string[]) {
  dedicatedSlugs = new Set(slugs);
}

export function hasDedicatedAssessmentWidget(slug: string): boolean {
  return dedicatedSlugs.has(slug);
}

export function isMisalignedGenericWidget(
  slug: string,
  widget: TestWidgetDefinition | undefined,
  simulation: Simulation | undefined,
): boolean {
  if (!widget || !simulation || hasDedicatedAssessmentWidget(slug)) {
    return false;
  }

  const acceptable = ACCEPTABLE_GENERIC[widget.widgetKind];
  if (acceptable?.has(simulation.visualKind)) {
    return false;
  }

  if (widget.widgetKind === "arithmetic-basic") {
    return true;
  }

  if (widget.widgetKind === "unit-conversion") {
    const text = [simulation.title, simulation.shortDescription, ...simulation.tags].join(" ").toLowerCase();
    return /masa|waga|czas|skala|map|termometr|prędko|predk|droga/.test(text);
  }

  if (widget.widgetKind === "fraction-part") {
    const text = [simulation.title, simulation.shortDescription, ...simulation.tags].join(" ").toLowerCase();
    return /procent|obniż|podwyż|średni|mediana|diagram słup|wykres/.test(text);
  }

  return false;
}
