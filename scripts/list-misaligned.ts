import { simulations } from "../src/data/simulations.js";
import { getAssessmentWidget } from "../src/lib/simulations/registry.js";
import { isMisalignedGenericWidget } from "../src/lib/simulations/widgetAlignment.js";

const misaligned = simulations.filter((s) => {
  const w = getAssessmentWidget(s.slug);
  return isMisalignedGenericWidget(s.slug, w, s);
});

console.log("MISALIGNED:", misaligned.length);
for (const s of misaligned) {
  const w = getAssessmentWidget(s.slug);
  console.log(`${s.slug} | ${s.visualKind} | ${w?.widgetKind} | ${s.title}`);
}
