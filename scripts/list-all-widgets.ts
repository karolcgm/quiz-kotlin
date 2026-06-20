import { simulations } from "../src/data/simulations.js";
import { getAssessmentWidget } from "../src/lib/simulations/registry.js";
import { isMisalignedGenericWidget } from "../src/lib/simulations/widgetAlignment.js";

for (const s of simulations.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const w = getAssessmentWidget(s.slug);
  const mis = isMisalignedGenericWidget(s.slug, w, s) ? " MISALIGNED" : "";
  console.log(`${s.slug.padEnd(35)} | ${s.visualKind.padEnd(12)} | ${(w?.widgetKind ?? "?").padEnd(22)} | ${s.title}${mis}`);
}
