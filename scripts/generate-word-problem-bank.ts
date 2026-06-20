/**
 * Generuje bank zadań tekstowych (~16 na dział programu nauczania).
 * Uruchom: npx tsx scripts/generate-word-problem-bank.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { mathCurriculum } from "../src/data/mathCurriculum.js";

type Formula =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "sum3"
  | "missing_addend"
  | "groups"
  | "share"
  | "perimeter_rect"
  | "area_rect"
  | "percent_of"
  | "average3"
  | "chain_add_sub";

type Skill =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "fractions"
  | "geometry"
  | "measurement"
  | "algebra"
  | "statistics";

interface StoryDef {
  title: string;
  template: string;
  formula: Formula;
  skill: Skill;
  defaults: Record<string, number>;
  variableKeys: string[];
}

const STORIES_BY_SECTION: Record<string, StoryDef[]> = {
  "numbers-grade-1": [
    { title: "Liczenie zabawek", template: "{name} ma {a} {item}. Dostał jeszcze {b}. Ile ma teraz?", formula: "add", skill: "addition", defaults: { a: 5, b: 3 }, variableKeys: ["a", "b"] },
    { title: "Mniej po rozdaniu", template: "{name} miał(a) {a} {item}. Rozdał(a) {b} kolegom. Ile zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 12, b: 4 }, variableKeys: ["a", "b"] },
    { title: "Na półce", template: "Na półce leżą {a} książek. Nauczyciel dokłada {b}. Ile książek jest na półce?", formula: "add", skill: "addition", defaults: { a: 7, b: 5 }, variableKeys: ["a", "b"] },
    { title: "Ptaszki na gałęzi", template: "Na gałęzi siedziało {a} ptaków. {b} odleciało. Ile ptaków zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 9, b: 3 }, variableKeys: ["a", "b"] },
    { title: "Kredki w piórniku", template: "{name} ma {a} kredek. {name2} ma {b}. Ile mają razem?", formula: "add", skill: "addition", defaults: { a: 6, b: 8 }, variableKeys: ["a", "b"] },
    { title: "Balony", template: "Mama kupiła {a} balonów. {b} pękło. Ile balonów zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 10, b: 3 }, variableKeys: ["a", "b"] },
    { title: "Kwiaty w wazonie", template: "W wazonie było {a} kwiatów. Dokładamy {b}. Ile jest kwiatów?", formula: "add", skill: "addition", defaults: { a: 4, b: 6 }, variableKeys: ["a", "b"] },
    { title: "Cukierki", template: "{name} zjadł(a) {b} z {a} cukierków. Ile cukierków zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 15, b: 7 }, variableKeys: ["a", "b"] },
    { title: "Autobus", template: "W autobusie jedzie {a} osób. Wsiada {b}. Ile osób jest teraz?", formula: "add", skill: "addition", defaults: { a: 8, b: 4 }, variableKeys: ["a", "b"] },
    { title: "Schody", template: "{name} wszedł(a) na {a} stopni. Zszedł(a) {b}. Na ilu stopniach jest teraz (licząc od dołu)?", formula: "subtract", skill: "subtraction", defaults: { a: 10, b: 3 }, variableKeys: ["a", "b"] },
    { title: "Muszelki", template: "Na plaży {name} zebrał(a) {a} muszelek, potem jeszcze {b}. Ile muszelek ma?", formula: "add", skill: "addition", defaults: { a: 6, b: 7 }, variableKeys: ["a", "b"] },
    { title: "Rybki w akwarium", template: "W akwarium pływa {a} rybek. {b} przeniesiono do innego. Ile zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 11, b: 5 }, variableKeys: ["a", "b"] },
    { title: "Trzy koszyki", template: "W trzech koszykach jest {a}, {b} i {c} jabłek. Ile jabłek razem?", formula: "sum3", skill: "addition", defaults: { a: 3, b: 4, c: 5 }, variableKeys: ["a", "b", "c"] },
    { title: "Ile brakuje", template: "{name} chce mieć {c} {item}. Ma już {a}. Ile jeszcze potrzebuje?", formula: "missing_addend", skill: "subtraction", defaults: { a: 7, c: 12 }, variableKeys: ["a", "c"] },
    { title: "Motyle", template: "Na łące lata {a} motyli. Doleciało {b}. Ile motyli jest na łące?", formula: "add", skill: "addition", defaults: { a: 5, b: 6 }, variableKeys: ["a", "b"] },
    { title: "Ołówki", template: "W piórniku było {a} ołówków. {b} się zgubiło. Ile ołówków zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 14, b: 6 }, variableKeys: ["a", "b"] },
  ],
  "operations-grade-1": [
    { title: "Dodawanie owoców", template: "{name} ma {a} jabłek i {b} gruszek. Ile owoców razem?", formula: "add", skill: "addition", defaults: { a: 8, b: 5 }, variableKeys: ["a", "b"] },
    { title: "Zabieranie", template: "Było {a} klocków. {name} zabrał(a) {b}. Ile klocków zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 15, b: 7 }, variableKeys: ["a", "b"] },
    { title: "Rozkład liczby", template: "{name} ma {a} {item}. {b} leży osobno. Ile jest w drugiej grupie, jeśli razem ma {c}?", formula: "missing_addend", skill: "subtraction", defaults: { a: 6, c: 14 }, variableKeys: ["a", "c"] },
    { title: "Na dwóch talerzach", template: "Na talerzu A jest {a} ciastek, na B jest {b}. Ile ciastek razem?", formula: "add", skill: "addition", defaults: { a: 9, b: 6 }, variableKeys: ["a", "b"] },
    { title: "Po podzieleniu", template: "{name} miał(a) {a} naklejek. Dał(a) siostrze {b}. Ile zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 18, b: 9 }, variableKeys: ["a", "b"] },
    { title: "W ogrodzie", template: "W ogrodzie rośnie {a} róż i {b} tulipanów. Ile kwiatów razem?", formula: "add", skill: "addition", defaults: { a: 7, b: 8 }, variableKeys: ["a", "b"] },
    { title: "W klasie", template: "W klasie jest {a} dziewczynek i {b} chłopców. Ile uczniów razem?", formula: "add", skill: "addition", defaults: { a: 12, b: 11 }, variableKeys: ["a", "b"] },
    { title: "Po wypiciu soku", template: "Było {a} szklanek soku. Wypito {b}. Ile szklanek zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 10, b: 4 }, variableKeys: ["a", "b"] },
    { title: "Do domu", template: "{name} idzie do domu z {a} książkami. Spotyka kolegę i dostaje {b}. Ile ma książek?", formula: "add", skill: "addition", defaults: { a: 3, b: 2 }, variableKeys: ["a", "b"] },
    { title: "Zniknęły", template: "Na stole leżało {a} kart. {b} wiatr zdmuchnął. Ile kart zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 12, b: 5 }, variableKeys: ["a", "b"] },
    { title: "Trzy pudełka", template: "W pudełkach jest {a}, {b} i {c} guzików. Ile guzików razem?", formula: "sum3", skill: "addition", defaults: { a: 4, b: 5, c: 6 }, variableKeys: ["a", "b", "c"] },
    { title: "Brakująca część", template: "Liczba {c} składa się z {a} i jakiejś liczby. Jaka to liczba?", formula: "missing_addend", skill: "subtraction", defaults: { a: 8, c: 15 }, variableKeys: ["a", "c"] },
    { title: "Przyjazd gości", template: "Było {a} krzeseł. Postawiono {b} dodatkowych. Ile krzeseł jest teraz?", formula: "add", skill: "addition", defaults: { a: 10, b: 5 }, variableKeys: ["a", "b"] },
    { title: "Rozdawanie cukierków", template: "{name} miał(a) {a} cukierków. Rozdał(a) {b} kolegom. Ile cukierków zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 20, b: 8 }, variableKeys: ["a", "b"] },
    { title: "Na wycieczce", template: "Na wycieczce jest {a} uczniów z klasy 1a i {b} z 1b. Ile uczniów razem?", formula: "add", skill: "addition", defaults: { a: 14, b: 13 }, variableKeys: ["a", "b"] },
    { title: "Po zjedzeniu", template: "Tata upiekł {a} bułeczek. Zjedzono {b}. Ile bułeczek zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 16, b: 9 }, variableKeys: ["a", "b"] },
  ],
};

// Generic fallback generator for sections without explicit stories
function genericStories(sectionId: string, grade: number, sectionTitle: string): StoryDef[] {
  const max = grade <= 2 ? 20 : grade <= 4 ? 100 : grade <= 6 ? 1000 : 10000;
  const stories: StoryDef[] = [];
  const bases: Omit<StoryDef, "title">[] = [
    { template: "{name} kupił(a) {a} {item} i {b} {item2}. Ile sztuk razem?", formula: "add", skill: "addition", defaults: { a: 12, b: 8 }, variableKeys: ["a", "b"] },
    { template: "W sklepie było {a} produktów. Sprzedano {b}. Ile zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 45, b: 17 }, variableKeys: ["a", "b"] },
    { template: "{name} ma {a} paczek po {b} {item}. Ile {item} razem?", formula: "groups", skill: "multiplication", defaults: { a: 6, b: 4 }, variableKeys: ["a", "b"] },
    { template: "{a} {item} rozdano po równo {b} dzieciom. Ile dostało jedno dziecko?", formula: "share", skill: "division", defaults: { a: 24, b: 6 }, variableKeys: ["a", "b"] },
    { template: "Prostokątna kartka ma {a} cm długości i {b} cm szerokości. Jaki ma obwód?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 8, b: 5 }, variableKeys: ["a", "b"] },
    { template: "Prostokątna działka ma {a} m długości i {b} m szerokości. Jakie ma pole?", formula: "area_rect", skill: "geometry", defaults: { a: 12, b: 7 }, variableKeys: ["a", "b"] },
    { template: "W trzech klasach jest {a}, {b} i {c} uczniów. Ile uczniów razem?", formula: "sum3", skill: "addition", defaults: { a: 22, b: 24, c: 23 }, variableKeys: ["a", "b", "c"] },
    { template: "{name} chce mieć {c} {item}. Ma {a}. Ile musi jeszcze dostać?", formula: "missing_addend", skill: "subtraction", defaults: { a: 35, c: 50 }, variableKeys: ["a", "c"] },
    { template: "Autobus miał {a} pasażerów. Wsiadło {b}, wysiadło {c}. Ilu jest teraz?", formula: "chain_add_sub", skill: "addition", defaults: { a: 28, b: 12, c: 9 }, variableKeys: ["a", "b", "c"] },
    { template: "Cena {a} zł podwyższono o {b}%. O ile złotych wzrosła cena? (podaj liczbę całkowitą)", formula: "percent_of", skill: "statistics", defaults: { a: 200, b: 10 }, variableKeys: ["a", "b"] },
    { template: "Trzy liczby to {a}, {b} i {c}. Jaka jest ich średnia arytmetyczna?", formula: "average3", skill: "statistics", defaults: { a: 12, b: 15, c: 18 }, variableKeys: ["a", "b", "c"] },
    { template: "{name} przeczytał(a) {a} stron w poniedziałek i {b} we wtorek. Ile stron razem?", formula: "add", skill: "addition", defaults: { a: 18, b: 22 }, variableKeys: ["a", "b"] },
    { template: "Magazyn miał {a} kg mąki. Zużyto {b} kg. Ile kg zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 150, b: 67 }, variableKeys: ["a", "b"] },
    { template: "Każdy z {a} rzędów ma {b} krzeseł. Ile krzeseł razem?", formula: "groups", skill: "multiplication", defaults: { a: 8, b: 7 }, variableKeys: ["a", "b"] },
    { template: "{a} uczniów podzielono na {b} równych grup. Ile uczniów w jednej grupie?", formula: "share", skill: "division", defaults: { a: 32, b: 4 }, variableKeys: ["a", "b"] },
    { template: "Tablica ma wymiary {a} dm na {b} dm. Jaki jest obwód tablicy w dm?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 12, b: 8 }, variableKeys: ["a", "b"] },
  ];

  // Scale defaults by grade
  const scale = grade <= 2 ? 0.3 : grade <= 4 ? 0.6 : grade <= 6 ? 1 : 1.5;

  for (let i = 0; i < 16; i++) {
    const base = bases[i % bases.length]!;
    const scaledDefaults: Record<string, number> = {};
    for (const [k, v] of Object.entries(base.defaults)) {
      scaledDefaults[k] = Math.min(max, Math.max(1, Math.round(v * scale)));
    }
    if (base.formula === "subtract" || base.formula === "missing_addend") {
      if (scaledDefaults.a !== undefined && scaledDefaults.b !== undefined && scaledDefaults.a <= scaledDefaults.b) {
        [scaledDefaults.a, scaledDefaults.b] = [scaledDefaults.b + 5, scaledDefaults.a];
      }
      if (scaledDefaults.c !== undefined && scaledDefaults.a !== undefined && scaledDefaults.c <= scaledDefaults.a) {
        scaledDefaults.c = scaledDefaults.a + Math.round(5 * scale);
      }
    }
    if (base.formula === "divide" || base.formula === "share") {
      if (scaledDefaults.a !== undefined && scaledDefaults.b !== undefined && scaledDefaults.a % scaledDefaults.b !== 0) {
        scaledDefaults.a = scaledDefaults.b * Math.round(scaledDefaults.a / scaledDefaults.b);
      }
    }

    stories.push({
      title: `${sectionTitle} — zadanie ${i + 1}`,
      ...base,
      defaults: scaledDefaults,
    });
  }

  return stories;
}

interface BankEntry {
  id: string;
  grade: number;
  sectionId: string;
  sectionTitle: string;
  title: string;
  template: string;
  formula: Formula;
  skill: Skill;
  defaults: Record<string, number>;
  variableKeys: string[];
}

const bank: BankEntry[] = [];

for (const section of mathCurriculum) {
  const explicit = STORIES_BY_SECTION[section.id];
  const stories = explicit ?? genericStories(section.id, section.grade, section.title);

  stories.forEach((story, index) => {
    bank.push({
      id: `${section.id}-${index + 1}`,
      grade: section.grade,
      sectionId: section.id,
      sectionTitle: section.title,
      title: story.title,
      template: story.template,
      formula: story.formula,
      skill: story.skill,
      defaults: story.defaults,
      variableKeys: story.variableKeys,
    });
  });
}

const output = `// AUTO-GENERATED — nie edytuj ręcznie. Uruchom: npx tsx scripts/generate-word-problem-bank.ts
import type { WordProblemTemplate } from "@/lib/wordProblems/types";

export const wordProblemBank: WordProblemTemplate[] = ${JSON.stringify(bank, null, 2)} as WordProblemTemplate[];

export const wordProblemCount = ${bank.length};
`;

mkdirSync("src/data/wordProblems", { recursive: true });
writeFileSync("src/data/wordProblems/bank.ts", output, "utf8");
console.log(`Generated ${bank.length} word problems in src/data/wordProblems/bank.ts`);
