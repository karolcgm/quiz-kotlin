/**
 * Audyt symulacji: dopasowanie widgetu do visualKind/tematu i sensowność zadań.
 */
import { simulations } from "../src/data/simulations.js";
import { getAssessmentWidget } from "../src/lib/simulations/registry.js";
import { isMisalignedGenericWidget } from "../src/lib/simulations/widgetAlignment.js";
import { buildRandomWidgetParams } from "../src/lib/simulations/registry.js";
import { numericExpected, isTopicExtendedParams } from "../src/lib/simulations/extendedWidgets.js";
import type { TestWidgetParams } from "../src/types/testWidget.js";

const ACCEPTABLE_WIDGET_FOR_VISUAL: Record<string, Set<string>> = {
  "number-line": new Set(["number-line-result", "fraction-number-line"]),
  fraction: new Set(["fraction-part", "fraction-number-line", "percent-calc"]),
  geometry: new Set([
    "rectangle-measure",
    "polygon-explore",
    "triangle-classification",
    "triangle-angle-sum",
    "angle-kind",
    "shape-sort",
    "shape-properties",
    "pythagoras",
    "circle-measure",
    "volume-cubes",
    "cylinder-volume",
    "solid-net",
    "line-geometry",
    "angle-measure",
  ]),
  measurement: new Set(["unit-conversion", "clock-read", "weight-comparison", "speed-distance-time"]),
  chart: new Set(["bar-chart", "statistics", "ratio-bar", "percent-calc", "linear-function", "prime-sieve", "multiples-grid"]),
  algebra: new Set([
    "number-bond",
    "ratio-bar",
    "number-comparison",
    "expression-eval",
    "substitute",
    "equation-balance",
    "like-terms",
    "power-eval",
    "linear-function",
    "divisibility",
  ]),
  game: new Set(["arithmetic-basic", "number-comparison", "shape-sort"]),
};

function topicKeywords(s: (typeof simulations)[0]) {
  return [s.title, s.shortDescription, ...s.tags].join(" ").toLowerCase();
}

function expectedWidgetFamilies(s: (typeof simulations)[0]): string[] {
  const text = topicKeywords(s);
  const families: string[] = [];

  if (/procent|obniż|podwyż|obniz|podwyz/.test(text)) families.push("percent-calc");
  if (/prędko|predk|droga.*czas|czas.*droga/.test(text)) families.push("speed-distance-time");
  if (/średni|sredni|mediana|dominanta|diagram|wykres|słupk|slupk|statyst|tabela funkcji|funkcj liniow/.test(text))
    families.push("bar-chart", "statistics", "linear-function");
  if (/pitagor|przeciwprostokąt/.test(text)) families.push("pythagoras");
  if (/promień|promien|średnic|srednic|koło|kolo/.test(text)) families.push("circle-measure");
  if (/objęto|objeto|kostek|walec|brył|bryl|siatk/.test(text)) families.push("volume-cubes", "cylinder-volume", "solid-net");
  if (/kątomierz|katomierz/.test(text)) families.push("angle-measure");
  if (/tangram|sortow|figury podstaw/.test(text)) families.push("shape-sort");
  if (/własności figur|wlasnosci figur|wierzchołk|wierzcholk|boków fig/.test(text)) families.push("shape-properties", "polygon-explore");
  if (/odcinek|prosta|półprosta|polprosta/.test(text)) families.push("line-geometry");
  if (/wielokrotno|sito|pierwsz/.test(text)) families.push("multiples-grid", "prime-sieve", "factor-tree");
  if (/podzielno|cechy pod/.test(text)) families.push("divisibility");
  if (/kolejność działań|kolejnosc dzialan|wyrażen|wyrazen|wzór|wzor|równan|rownan|redukcj|przekształc|przeksztalc|podstawian/.test(text))
    families.push("expression-eval", "substitute", "equation-balance", "like-terms");
  if (/potęg|poteg/.test(text)) families.push("power-eval");
  if (/zegar|godzin|czas/.test(text) && s.visualKind === "measurement") families.push("clock-read");
  if (/jednost|długość|dlugosc|mm|cm|km/.test(text) && !/droga.*czas/.test(text)) families.push("unit-conversion");
  if (/oś liczbow|os liczbow|liczbowa/.test(text)) families.push("number-line-result", "fraction-number-line");
  if (/ułam|ulam/.test(text) && !/procent/.test(text)) families.push("fraction-part", "fraction-number-line");
  if (/stosunek|proporcj|przepis/.test(text)) families.push("ratio-bar");
  if (/pole|obwód|obwod|prostokąt|prostokat/.test(text)) families.push("rectangle-measure");
  if (/wielokąt|wielokat/.test(text) && !/figur/.test(text)) families.push("polygon-explore");
  if (/trójkąt|trojkat|klasyfik/.test(text)) families.push("triangle-classification", "triangle-angle-sum");
  if (/kąt|kat/.test(text) && !/kątomierz|katomierz/.test(text)) families.push("angle-kind", "intersecting-angles", "triangle-angle-sum");
  if (/symetri/.test(text)) families.push("symmetry");
  if (/rozklad|czynnik|sito|pierwsz/.test(text)) families.push("factor-tree", "prime-sieve");
  if (/dom liczbow|liczby dom/.test(text)) families.push("number-bond");
  if (/liczman/.test(text)) families.push("arithmetic-basic");
  if (/porówn|porown|waga/.test(text)) families.push("weight-comparison", "number-comparison");
  if (/zadanie.*treś|zadanie.*tresc|tekstow/.test(text)) families.push("word-problem");

  if (families.length === 0) {
    const allowed = ACCEPTABLE_WIDGET_FOR_VISUAL[s.visualKind];
    if (allowed) return [...allowed];
  }
  return families;
}

function tryGrade(slug: string, params: TestWidgetParams) {
  const widget = getAssessmentWidget(slug);
  if (!widget) return { ok: false, reason: "brak widgetu" };

  try {
    const result = widget.grade(params, { result: Number.NaN }, 1);
    if (isTopicExtendedParams(params)) {
      const expected = numericExpected(params);
      const graded = widget.grade(params, { result: expected }, 1);
      if (!graded.isCorrect) return { ok: false, reason: `extended: expected ${expected} not accepted` };
    }
    if ("result" in result.expectedAnswer && !Number.isFinite(result.expectedAnswer.result as number)) {
      return { ok: false, reason: "expectedAnswer not finite" };
    }
    return { ok: true, expected: result.expectedAnswer };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

interface Issue {
  slug: string;
  title: string;
  visualKind: string;
  widgetKind: string;
  problems: string[];
}

const issues: Issue[] = [];

for (const s of simulations) {
  const w = getAssessmentWidget(s.slug);
  if (!w) {
    issues.push({ slug: s.slug, title: s.title, visualKind: s.visualKind, widgetKind: "?", problems: ["brak widgetu"] });
    continue;
  }

  const problems: string[] = [];

  if (isMisalignedGenericWidget(s.slug, w, s)) {
    problems.push("MISALIGNED (stary baner)");
  }

  const allowed = ACCEPTABLE_WIDGET_FOR_VISUAL[s.visualKind];
  if (allowed && !allowed.has(w.widgetKind) && w.widgetKind !== "word-problem") {
    problems.push(`widget ${w.widgetKind} nie pasuje do visualKind=${s.visualKind}`);
  }

  const expectedFamilies = expectedWidgetFamilies(s);
  if (expectedFamilies.length > 0 && !expectedFamilies.includes(w.widgetKind)) {
    problems.push(`temat sugeruje [${expectedFamilies.join("|")}], jest ${w.widgetKind}`);
  }

  if (w.widgetKind === "arithmetic-basic" && s.visualKind !== "game") {
    problems.push("generyczne arithmetic-basic poza grą");
  }

  if (w.widgetKind === "fraction-part" && /procent|wykres|diagram|średni|sredni/.test(topicKeywords(s))) {
    problems.push("fraction-part zamiast procentów/statystyki");
  }

  if (w.widgetKind === "unit-conversion" && /prędko|predk|droga.*czas/.test(topicKeywords(s))) {
    problems.push("unit-conversion zamiast SDT");
  }

  if (w.widgetKind === "rectangle-measure" && !/pole|obwód|obwod|prostokąt|prostokat|kratk/.test(topicKeywords(s))) {
    problems.push("rectangle-measure na niepasującym temacie");
  }

  const params = w.buildRandomParams();
  const gradeCheck = tryGrade(s.slug, params);
  if (!gradeCheck.ok) {
    problems.push(`grading: ${gradeCheck.reason}`);
  }

  // Sprawdź czy prompt ma sens
  const prompt = w.buildPrompt(params);
  if (prompt.length < 10) problems.push("za krótki prompt");

  if (problems.length > 0) {
    issues.push({ slug: s.slug, title: s.title, visualKind: s.visualKind, widgetKind: w.widgetKind, problems });
  }
}

console.log(`\n=== AUDYT: ${issues.length} / ${simulations.length} symulacji z problemami ===\n`);
for (const i of issues) {
  console.log(`${i.slug}`);
  console.log(`  ${i.title} | ${i.visualKind} | ${i.widgetKind}`);
  for (const p of i.problems) console.log(`  - ${p}`);
  console.log("");
}
