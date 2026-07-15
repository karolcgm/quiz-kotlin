import type { LessonDifficulty } from "@/types/lessonPackage";

/** L2 korzysta z już zarejestrowanego lokalnego adaptera i jego serwerowego answerSpec. */
export const DECIMAL_NOTATION_L2_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_NOTATION_L2_SKILL_ID = "M5-5.1-decimal-notation" as const;

export type DecimalNotationL2Activity =
  | "thousandths-table"
  | "zoom-axis"
  | "representation-bridge"
  | "dye-lab-l2"
  | "independent-l2";

export interface DecimalNotationL2PublicTask {
  generatorId: typeof DECIMAL_NOTATION_L2_GENERATOR_ID;
  generatorVersion: 2;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNotationL2Activity;
  prompt: string;
  targetThousandths: number;
  decimalDisplay: string;
  fractionDisplay: string;
  words: string;
  skillIds: readonly [typeof DECIMAL_NOTATION_L2_SKILL_ID];
  invariants: readonly [
    "comma-independent-of-locale",
    "integer-thousandths-no-float",
    "answer-spec-server-only",
  ];
}

const TARGETS: Record<LessonDifficulty, readonly number[]> = {
  support: [200, 300, 400, 500],
  core: [125, 248, 375, 632, 824],
  challenge: [4, 9, 19, 40, 54],
};

const ONES = [
  "zero", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć",
] as const;
const TEENS = [
  "dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście", "piętnaście", "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście",
] as const;
const TENS = [
  "", "", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt",
] as const;
const HUNDREDS = [
  "", "sto", "dwieście", "trzysta", "czterysta", "pięćset", "sześćset", "siedemset", "osiemset", "dziewięćset",
] as const;

function assertThousandths(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0 || value > 1000) {
    throw new Error("Liczba tysięcznych musi być liczbą całkowitą od 0 do 1000.");
  }
}

function wordsBelowThousand(value: number): string {
  if (value < 10) return ONES[value]!;
  if (value < 20) return TEENS[value - 10]!;
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return `${TENS[tens]}${ones ? ` ${ONES[ones]}` : ""}`;
  }
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  return `${HUNDREDS[hundreds]}${rest ? ` ${wordsBelowThousand(rest)}` : ""}`;
}

function namedParts(value: number, place: "dziesiąta" | "setna" | "tysięczna"): string {
  if (value === 1) return `jedna ${place}`;
  if (value === 2) return `dwie ${place === "dziesiąta" ? "dziesiąte" : place === "setna" ? "setne" : "tysięczne"}`;
  if (value === 3 || value === 4) {
    const plural = place === "dziesiąta" ? "dziesiąte" : place === "setna" ? "setne" : "tysięczne";
    return `${ONES[value]} ${plural}`;
  }
  const plural = place === "dziesiąta" ? "dziesiątych" : place === "setna" ? "setnych" : "tysięcznych";
  return `${wordsBelowThousand(value)} ${plural}`;
}

/** Zapis jest wyliczany z całkowitej liczby tysięcznych, bez arytmetyki float. */
export function decimalThousandthsDisplay(value: number): string {
  assertThousandths(value);
  if (value === 1000) return "1";
  const digits = String(value).padStart(3, "0").replace(/0+$/u, "");
  return `0,${digits || "0"}`;
}

export function decimalThousandthsWords(value: number): string {
  assertThousandths(value);
  if (value === 1000) return "jedna całość";
  if (value > 0 && value % 100 === 0) return namedParts(value / 100, "dziesiąta");
  if (value > 0 && value % 10 === 0) return namedParts(value / 10, "setna");
  return namedParts(value, "tysięczna");
}

function promptFor(activity: DecimalNotationL2Activity, targetThousandths: number): string {
  switch (activity) {
    case "thousandths-table":
      return "Umieść cyfry liczby 0,375 w kolumnach jedności, części dziesiątych, setnych i tysięcznych.";
    case "zoom-axis":
      return "Powiększaj kolejne odcinki osi: od dziesiątych przez setne aż do tysięcznych, a następnie zaznacz 0,375.";
    case "representation-bridge":
      return "Zamień 375/1000 na zapis dziesiętny i niezależnie zamień 0,375 na ułamek o mianowniku 1000.";
    case "dye-lab-l2":
      return "Odmierz 0,4 l, 0,04 l i 0,004 l barwnika. Porównaj poziomy oraz pozycję cyfry 4.";
    case "independent-l2":
      return `Samodzielnie połącz ${targetThousandths}/1000 z zapisem ${decimalThousandthsDisplay(targetThousandths)} i właściwym punktem osi.`;
  }
}

/** Publiczny, deterministyczny wariant L2. Nie zawiera answerSpec ani rubryki. */
export function createPublicDecimalNotationL2Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNotationL2Activity;
}): DecimalNotationL2PublicTask {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0) {
    throw new Error("Seed zadania dziesiętnego musi być nieujemną liczbą całkowitą.");
  }
  const targets = TARGETS[input.difficulty];
  const generatedTarget = targets[input.seed % targets.length]!;
  const targetThousandths = input.activity === "independent-l2" ? generatedTarget : 375;

  return {
    generatorId: DECIMAL_NOTATION_L2_GENERATOR_ID,
    generatorVersion: 2,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity, targetThousandths),
    targetThousandths,
    decimalDisplay: decimalThousandthsDisplay(targetThousandths),
    fractionDisplay: `${targetThousandths}/1000`,
    words: decimalThousandthsWords(targetThousandths),
    skillIds: [DECIMAL_NOTATION_L2_SKILL_ID],
    invariants: [
      "comma-independent-of-locale",
      "integer-thousandths-no-float",
      "answer-spec-server-only",
    ],
  };
}

const L2_ACTIVITIES: readonly DecimalNotationL2Activity[] = [
  "thousandths-table", "zoom-axis", "representation-bridge", "dye-lab-l2", "independent-l2",
];

export function isDecimalNotationL2Activity(value: string): value is DecimalNotationL2Activity {
  return L2_ACTIVITIES.includes(value as DecimalNotationL2Activity);
}
