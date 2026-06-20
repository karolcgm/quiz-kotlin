import type { SectionKind } from "./section-kind-map.js";
import type { Formula, Skill, StoryDef } from "./word-problem-pools.js";

export type WordProblemDifficulty = "easy" | "medium" | "hard";

export interface AnswerPartDef {
  id: string;
  label: string;
  formula: Formula | "literal";
  literalKey?: string;
}

export interface EnrichedStory {
  title: string;
  difficulty: WordProblemDifficulty;
  template: string;
  formula: Formula;
  skill: Skill;
  defaults: Record<string, number>;
  variableKeys: string[];
  parts: AnswerPartDef[];
  partialCredit: boolean;
}

const DIFFICULTY_LABEL: Record<WordProblemDifficulty, string> = {
  easy: "Łatwe",
  medium: "Średnie",
  hard: "Trudne",
};

export function difficultyForIndex(index: number): WordProblemDifficulty {
  if (index < 8) return "easy";
  if (index < 15) return "medium";
  return "hard";
}

function introFor(sectionTitle: string, grade: number, difficulty: WordProblemDifficulty): string {
  if (difficulty === "easy") {
    return `Zadanie z działu „${sectionTitle}” (klasa ${grade}).\n\n`;
  }
  if (difficulty === "medium") {
    return `Historyia z lekcji matematyki — dział „${sectionTitle}” (klasa ${grade}).\n\n`;
  }
  return `Zadanie egzaminacyjne z wieloma pytaniami — „${sectionTitle}”, klasa ${grade}.\n\n`;
}

function ageSideStory(): string {
  return "Andrzej ma {a} lat, a jego młodszy brat Krystian {b} lat. Obaj chodzą do tej samej szkoły i pomagają mamie w sklepie po lekcjach.";
}

function buildMediumParts(story: StoryDef, kind: SectionKind): AnswerPartDef[] {
  if (kind === "geometry_measure" || kind === "geometry_advanced" || kind === "early_geometry") {
    return [
      { id: "perimeter", label: "Jaki jest obwód? (obwód)", formula: "perimeter_rect" },
      { id: "area", label: "Jakie jest pole? (pole)", formula: "area_rect" },
    ];
  }
  if (story.formula === "add" || story.formula === "sum3") {
    return [
      { id: "main", label: "Oblicz wynik główny z treści zadania.", formula: story.formula },
      { id: "diff", label: "O ile większa jest większa z podanych liczb?", formula: "subtract" },
    ];
  }
  if (story.formula === "groups" || story.formula === "multiply") {
    return [
      { id: "main", label: "Oblicz wynik mnożenia z zadania.", formula: story.formula },
      { id: "sum", label: "Ile wynosi suma obu liczb z zadania?", formula: "add" },
    ];
  }
  return [
    { id: "main", label: "Oblicz wynik z treści zadania.", formula: story.formula },
    { id: "extra", label: "Ile wynosi suma liczb a i b z zadania?", formula: "add" },
  ];
}

function buildHardParts(story: StoryDef, kind: SectionKind): AnswerPartDef[] {
  const a = story.defaults.a ?? 5;
  const b = story.defaults.b ?? 3;

  if (kind === "early_ops" || kind === "mul_div" || kind === "word_ops" || kind === "place_value") {
    return [
      { id: "andrzej", label: "Ile lat ma Andrzej?", formula: "literal", literalKey: "a" },
      { id: "krystian", label: "Ile lat ma Krystian?", formula: "literal", literalKey: "b" },
      { id: "razem", label: "Ile lat mają razem Andrzej i Krystian?", formula: "add" },
      { id: "roznica", label: "O ile lat Andrzej jest starszy od Krystiana?", formula: "subtract" },
    ];
  }

  if (kind === "geometry_measure" || kind === "geometry_advanced") {
    return [
      { id: "perimeter", label: "Oblicz obwód figury.", formula: "perimeter_rect" },
      { id: "area", label: "Oblicz pole figury.", formula: "area_rect" },
      { id: "sum", label: "Ile wynosi suma długości boków a + b?", formula: "add" },
      { id: "diff", label: "O ile dłuższy jest dłuższy bok od krótszego?", formula: "subtract" },
    ];
  }

  return [
    { id: "main", label: "Oblicz główny wynik zadania.", formula: story.formula },
    { id: "sum3", label: "Ile wynosi a + b + c?", formula: "sum3" },
    { id: "chain", label: "Ile wynosi a + b − c?", formula: "chain_add_sub" },
    { id: "diff", label: "O ile a jest większe od b?", formula: "subtract" },
  ];
}

function mediumStoryWrap(story: StoryDef, kind: SectionKind, sectionTitle: string, grade: number): string {
  const base = story.template;
  if (kind === "early_ops" || kind === "word_ops" || kind === "place_value") {
    return `${introFor(sectionTitle, grade, "medium")}${ageSideStory()}\n\nW sklepie mama poprosiła chłopców o pomoc: ${base}\n\nNa koniec dnia pani wychowawczyna prosi uczniów o zapisanie wyników w zeszytach.`;
  }
  if (kind === "geometry_measure" || kind === "geometry_advanced") {
    return `${introFor(sectionTitle, grade, "medium")}Pan Jan planuje remont sali. ${base}\n\nNajpierw chce ogrodzić pomieszczenie taśmą (obwód), potem kupić panele podłogowe (pole).`;
  }
  return `${introFor(sectionTitle, grade, "medium")}W drodze do domu uczniowie rozwiązują zadanie:\n\n${base}\n\nNastępnie porównują liczby z zadania i szukają dodatkowej odpowiedzi.`;
}

function hardStoryWrap(story: StoryDef, kind: SectionKind, sectionTitle: string, grade: number): string {
  const base = story.template;

  if (kind === "early_ops" || kind === "word_ops" || kind === "place_value" || kind === "mul_div") {
    return `${introFor(sectionTitle, grade, "hard")}W sobotę rodzina Kowalskich poszła na festyn szkolny. ${ageSideStory()} Na stoisku z grami Andrzej wygrał {a} punktów, a Krystian {b}.\n\nPotem razem liczyli swoje zdobycze: ${base}\n\nOdpowiedz na wszystkie pytania poniżej — za każdą poprawną część dostaniesz część punktów.`;
  }

  if (kind === "geometry_measure" || kind === "geometry_advanced" || kind === "early_geometry") {
    return `${introFor(sectionTitle, grade, "hard")}Szkoła modernizuje boisko i salę lekcyjną. ${base}\n\nGeodeta zmierzył wymiary i poprosił uczniów klas ${grade} o obliczenie obwodu, pola oraz porównanie boków prostokąta. Zapisz wszystkie wyniki w tabeli.`;
  }

  return `${introFor(sectionTitle, grade, "hard")}Na konkursie matematycznym uczestnicy dostali zadanie wieloetapowe:\n\n${base}\n\nRozwiązanie wymaga kilku obliczeń — sumy, różnicy i wyniku głównego. Czytelnie zapisz każdą odpowiedź osobno.`;
}

function ensureAgeDefaults(defaults: Record<string, number>, grade: number): Record<string, number> {
  const out = { ...defaults };
  if (out.a === undefined) out.a = Math.max(6, grade + 3);
  if (out.b === undefined) out.b = Math.max(2, Math.min(out.a - 2, grade - 2));
  if (out.a <= out.b) out.a = out.b + Math.max(3, Math.floor(grade / 2));
  if (out.c === undefined) out.c = out.a + out.b;
  return out;
}

export function enrichStory(
  story: StoryDef,
  index: number,
  kind: SectionKind,
  sectionTitle: string,
  grade: number,
): EnrichedStory {
  const difficulty = difficultyForIndex(index);
  const defaults = ensureAgeDefaults(story.defaults, grade);

  if (difficulty === "easy") {
    return {
      title: `${story.title} (${DIFFICULTY_LABEL.easy})`,
      difficulty,
      template: `${introFor(sectionTitle, grade, "easy")}${story.template}`,
      formula: story.formula,
      skill: story.skill,
      defaults,
      variableKeys: story.variableKeys,
      parts: [{ id: "main", label: "Oblicz wynik zadania.", formula: story.formula }],
      partialCredit: true,
    };
  }

  if (difficulty === "medium") {
    const parts = buildMediumParts(story, kind);
    const keys = new Set([...story.variableKeys, "a", "b", "c"]);
    return {
      title: `${story.title} (${DIFFICULTY_LABEL.medium})`,
      difficulty,
      template: mediumStoryWrap({ ...story, defaults }, kind, sectionTitle, grade),
      formula: story.formula,
      skill: story.skill,
      defaults,
      variableKeys: Array.from(keys),
      parts,
      partialCredit: true,
    };
  }

  const parts = buildHardParts(story, kind);
  const keys = new Set([...story.variableKeys, "a", "b", "c"]);
  return {
    title: `${story.title} (${DIFFICULTY_LABEL.hard})`,
    difficulty,
    template: hardStoryWrap({ ...story, defaults }, kind, sectionTitle, grade),
    formula: story.formula,
    skill: story.skill,
    defaults,
    variableKeys: Array.from(keys),
    parts,
    partialCredit: true,
  };
}
