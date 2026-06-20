import { simulations } from "../src/data/simulations.js";
import { getAssessmentWidget } from "../src/lib/simulations/registry.js";

// Slugs with dedicated widgets are registered first; check prompt sensibility
const suspicious: string[] = [];

for (const s of simulations) {
  const w = getAssessmentWidget(s.slug)!;
  const params = w.buildRandomParams();
  const prompt = w.buildPrompt(params);
  const text = [s.title, s.shortDescription, ...s.tags].join(" ").toLowerCase();

  // Prompt mentions wrong operation
  if (/koło|kolo|obwód koła|pole koła/.test(text) && w.widgetKind === "rectangle-measure") {
    suspicious.push(`${s.slug}: koło → rectangle-measure`);
  }
  if (/trójkąt|trojkat/.test(text) && /pole/.test(text) && w.widgetKind === "rectangle-measure") {
    suspicious.push(`${s.slug}: pole trójkąta → rectangle`);
  }
  if (/procent|diagram kołowy/.test(text) && w.widgetKind === "fraction-part") {
    suspicious.push(`${s.slug}: procent → fraction-part`);
  }
  if (/prawdopodob|losow/.test(text) && w.widgetKind === "arithmetic-basic") {
    suspicious.push(`${s.slug}: prawdopodobieństwo → arithmetic`);
  }
  if (/dzielnik/.test(text) && w.widgetKind === "rectangle-measure") {
    suspicious.push(`${s.slug}: dzielniki → rectangle`);
  }
  if (/porówn|porown/.test(text) && s.interactionKind === "compare" && w.widgetKind === "number-line-result") {
    suspicious.push(`${s.slug}: porównywanie → number-line`);
  }
  if (/zadanie.*tekst|model zadania/.test(text) && w.widgetKind === "arithmetic-basic") {
    suspicious.push(`${s.slug}: zadanie tekstowe → arithmetic`);
  }
  if (/wymiern/.test(text) && w.widgetKind === "number-line-result") {
    suspicious.push(`${s.slug}: wymierne → number-line`);
  }
  if (/notacja wykładnicza|notacja wykladnicza/.test(text) && w.widgetKind === "number-line-result") {
    suspicious.push(`${s.slug}: potęgi → number-line`);
  }
  if (/termometr/.test(text) && w.widgetKind === "unit-conversion") {
    suspicious.push(`${s.slug}: termometr → unit-conversion`);
  }
  if (/graniastosłup|graniastoslup/.test(text) && w.widgetKind === "rectangle-measure") {
    suspicious.push(`${s.slug}: graniastosłup → rectangle`);
  }
  if (/pitagor|układ współ|uklad wspol|odległość/.test(text) && w.widgetKind === "rectangle-measure") {
    suspicious.push(`${s.slug}: odległość/Pitagoras → rectangle`);
  }
  if (/pierwiastek/.test(text) && w.widgetKind === "rectangle-measure") {
    suspicious.push(`${s.slug}: pierwiastek → rectangle`);
  }
  if (/trapez/.test(text) && w.widgetKind === "rectangle-measure") {
    suspicious.push(`${s.slug}: trapez → rectangle`);
  }
  if (/równoległoboc|rownolegloboc/.test(text) && w.widgetKind === "rectangle-measure") {
    suspicious.push(`${s.slug}: równoległobok → rectangle (maybe OK)`);
  }
  if (/tabliczka mnożenia|tabliczka mnozenia/.test(text) && w.widgetKind === "rectangle-measure") {
    suspicious.push(`${s.slug}: tabliczka → rectangle`);
  }
  if (prompt.includes("prostokąt") && !/prostokąt|prostokat|kwadrat|kratk|pole prost|obwód prost/.test(text)) {
    suspicious.push(`${s.slug}: prompt mówi prostokąt ale temat nie (${w.widgetKind})`);
  }
}

console.log(`SUSPICIOUS: ${suspicious.length}\n`);
for (const line of suspicious) console.log(line);
