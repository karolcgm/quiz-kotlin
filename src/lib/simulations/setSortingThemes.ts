export type SetSortingThemeId =
  | "polygons-sides"
  | "number-sign"
  | "even-odd"
  | "multiples-of-3"
  | "prime-composite"
  | "fraction-whole"
  | "angle-size";

export interface SetBucketDef {
  id: string;
  label: string;
  hint: string;
  gradient: string;
}

export interface SetItemDef {
  id: string;
  label: string;
  correctBucketId: string;
  visual: "polygon" | "number" | "fraction" | "angle";
  sides?: number;
  accent?: string;
}

export interface SetSortingTheme {
  id: SetSortingThemeId;
  title: string;
  description: string;
  buckets: SetBucketDef[];
  items: SetItemDef[];
}

function polygon(sides: number, bucket: string, index: number, accent: string): SetItemDef {
  const names: Record<number, string> = {
    3: "Trójkąt",
    4: "Czworokąt",
    5: "Pięciokąt",
    6: "Sześciokąt",
    8: "Ośmiokąt",
  };
  return {
    id: `poly-${sides}-${index}`,
    label: names[sides] ?? `${sides} boków`,
    correctBucketId: bucket,
    visual: "polygon",
    sides,
    accent,
  };
}

export const SET_SORTING_THEMES: SetSortingTheme[] = [
  {
    id: "polygons-sides",
    title: "Wieloboki — liczba boków",
    description: "Przeciągnij figury do zbiorów: 3 boki, 4 boki albo 5 i więcej.",
    buckets: [
      { id: "tri", label: "3 boki", hint: "Trójkąty", gradient: "from-rose-500 to-orange-500" },
      { id: "quad", label: "4 boki", hint: "Czworokąty", gradient: "from-indigo-500 to-violet-600" },
      { id: "many", label: "5+ boków", hint: "Pięcio-, sześcio-…", gradient: "from-emerald-500 to-teal-600" },
    ],
    items: [
      polygon(3, "tri", 1, "#fb7185"),
      polygon(3, "tri", 2, "#f97316"),
      polygon(3, "tri", 3, "#fda4af"),
      polygon(4, "quad", 1, "#818cf8"),
      polygon(4, "quad", 2, "#6366f1"),
      polygon(4, "quad", 3, "#a5b4fc"),
      polygon(5, "many", 1, "#34d399"),
      polygon(6, "many", 1, "#2dd4bf"),
      polygon(8, "many", 2, "#10b981"),
    ],
  },
  {
    id: "number-sign",
    title: "Liczby dodatnie, zero, ujemne",
    description: "Posegreguj liczby według znaku.",
    buckets: [
      { id: "neg", label: "Ujemne", hint: "< 0", gradient: "from-sky-500 to-blue-700" },
      { id: "zero", label: "Zero", hint: "= 0", gradient: "from-slate-400 to-slate-600" },
      { id: "pos", label: "Dodatnie", hint: "> 0", gradient: "from-amber-400 to-orange-500" },
    ],
    items: [-8, -3, -15, 0, 4, 12, 7, 20, -1].map((value, index) => ({
      id: `sign-${index}`,
      label: String(value),
      correctBucketId: value < 0 ? "neg" : value === 0 ? "zero" : "pos",
      visual: "number" as const,
      accent: value < 0 ? "#38bdf8" : value === 0 ? "#94a3b8" : "#fbbf24",
    })),
  },
  {
    id: "even-odd",
    title: "Parzyste i nieparzyste",
    description: "Do którego zbioru należy liczba?",
    buckets: [
      { id: "even", label: "Parzyste", hint: "Podzielne przez 2", gradient: "from-violet-500 to-purple-600" },
      { id: "odd", label: "Nieparzyste", hint: "Reszta z dzielenia przez 2", gradient: "from-pink-500 to-rose-600" },
    ],
    items: [2, 5, 8, 11, 14, 17, 20, 23, 0, 9].map((value, index) => ({
      id: `parity-${index}`,
      label: String(value),
      correctBucketId: value % 2 === 0 ? "even" : "odd",
      visual: "number" as const,
      accent: value % 2 === 0 ? "#a78bfa" : "#fb7185",
    })),
  },
  {
    id: "multiples-of-3",
    title: "Wielokrotności 3",
    description: "Czy liczba jest podzielna przez 3?",
    buckets: [
      { id: "mul3", label: "Wielokrotności 3", hint: "3, 6, 9…", gradient: "from-cyan-500 to-teal-600" },
      { id: "other", label: "Pozostałe", hint: "Reszta", gradient: "from-slate-500 to-slate-700" },
    ],
    items: [3, 4, 6, 8, 9, 10, 12, 14, 15, 17].map((value, index) => ({
      id: `mul-${index}`,
      label: String(value),
      correctBucketId: value % 3 === 0 ? "mul3" : "other",
      visual: "number" as const,
      accent: value % 3 === 0 ? "#22d3ee" : "#64748b",
    })),
  },
  {
    id: "prime-composite",
    title: "Pierwsze i złożone",
    description: "Liczby pierwsze mają dokładnie dwa dzielniki.",
    buckets: [
      { id: "prime", label: "Pierwsze", hint: "2, 3, 5, 7…", gradient: "from-indigo-500 to-blue-600" },
      { id: "composite", label: "Złożone", hint: "Więcej dzielników", gradient: "from-orange-500 to-red-500" },
    ],
    items: [2, 4, 5, 6, 7, 9, 11, 12, 13, 15].map((value, index) => ({
      id: `prime-${index}`,
      label: String(value),
      correctBucketId: isPrime(value) ? "prime" : "composite",
      visual: "number" as const,
      accent: isPrime(value) ? "#6366f1" : "#f97316",
    })),
  },
  {
    id: "fraction-whole",
    title: "Ułamki i liczby całkowite",
    description: "Rozpoznaj, czy zapis to ułamek, czy liczba całkowita.",
    buckets: [
      { id: "whole", label: "Całkowite", hint: "Bez ułamka", gradient: "from-emerald-500 to-green-600" },
      { id: "frac", label: "Ułamki", hint: "Część całości", gradient: "from-amber-500 to-yellow-600" },
    ],
    items: [
      { label: "5", bucket: "whole", visual: "number" as const },
      { label: "−2", bucket: "whole", visual: "number" as const },
      { label: "0", bucket: "whole", visual: "number" as const },
      { label: "12", bucket: "whole", visual: "number" as const },
      { label: "½", bucket: "frac", visual: "fraction" as const },
      { label: "¾", bucket: "frac", visual: "fraction" as const },
      { label: "⅓", bucket: "frac", visual: "fraction" as const },
      { label: "2½", bucket: "frac", visual: "fraction" as const },
      { label: "⅕", bucket: "frac", visual: "fraction" as const },
    ].map((entry, index) => ({
      id: `frac-${index}`,
      label: entry.label,
      correctBucketId: entry.bucket,
      visual: entry.visual,
      accent: entry.bucket === "whole" ? "#34d399" : "#fbbf24",
    })),
  },
  {
    id: "angle-size",
    title: "Kąty: ostre, proste, rozwarte",
    description: "Dopasuj kąt do właściwego zbioru.",
    buckets: [
      { id: "acute", label: "Ostre", hint: "< 90°", gradient: "from-lime-500 to-green-600" },
      { id: "right", label: "Proste", hint: "= 90°", gradient: "from-blue-500 to-indigo-600" },
      { id: "obtuse", label: "Rozwarte", hint: "> 90°", gradient: "from-fuchsia-500 to-purple-600" },
    ],
    items: [
      { label: "45°", bucket: "acute" },
      { label: "90°", bucket: "right" },
      { label: "120°", bucket: "obtuse" },
      { label: "30°", bucket: "acute" },
      { label: "89°", bucket: "acute" },
      { label: "91°", bucket: "obtuse" },
      { label: "150°", bucket: "obtuse" },
      { label: "90°", bucket: "right", id: "right2" },
    ].map((entry, index) => ({
      id: `angle-${index}`,
      label: entry.label,
      correctBucketId: entry.bucket,
      visual: "angle" as const,
      accent: entry.bucket === "acute" ? "#84cc16" : entry.bucket === "right" ? "#3b82f6" : "#d946ef",
    })),
  },
];

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function getSetSortingTheme(id: SetSortingThemeId): SetSortingTheme {
  return SET_SORTING_THEMES.find((theme) => theme.id === id) ?? SET_SORTING_THEMES[0];
}

export function shuffleItems<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
