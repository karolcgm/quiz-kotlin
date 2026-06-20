/** Mapowanie działu programu → rodzaj zadań tekstowych (bez mieszania tematów). */
export type SectionKind =
  | "early_count"
  | "early_ops"
  | "early_measure"
  | "early_geometry"
  | "place_value"
  | "mul_div"
  | "word_ops"
  | "fractions"
  | "geometry_measure"
  | "geometry_shapes"
  | "geometry_advanced"
  | "units"
  | "decimals"
  | "divisibility"
  | "integers"
  | "percent"
  | "proportion"
  | "algebra"
  | "statistics"
  | "rational"
  | "equations"
  | "exam";

export const SECTION_KIND: Record<string, SectionKind> = {
  "numbers-grade-1": "early_count",
  "operations-grade-1": "early_ops",
  "measurement-grade-1": "early_measure",
  "geometry-grade-1": "early_geometry",

  "numbers-grade-2": "place_value",
  "operations-grade-2": "early_ops",
  "practical-grade-2": "early_measure",
  "geometry-grade-2": "early_geometry",

  "numbers-grade-3": "place_value",
  "operations-grade-3": "mul_div",
  "fractions-grade-3": "fractions",
  "geometry-measurement-grade-3": "geometry_measure",

  "numbers-grade-4": "word_ops",
  "fractions-grade-4": "fractions",
  "geometry-grade-4": "geometry_measure",

  "fractions-decimals-grade-5": "decimals",
  "divisibility-grade-5": "divisibility",
  "geometry-grade-5": "geometry_advanced",
  "units-grade-5": "units",

  "integers-grade-6": "integers",
  "percentages-grade-6": "percent",
  "proportions-grade-6": "proportion",
  "algebra-grade-6": "algebra",
  "solids-statistics-grade-6": "statistics",

  "rational-numbers-grade-7": "rational",
  "equations-grade-7": "equations",
  "geometry-grade-7": "geometry_advanced",
  "percent-proportions-grade-7": "percent",

  "exam-numbers-grade-8": "exam",
  "functions-grade-8": "algebra",
  "geometry-grade-8": "geometry_advanced",
  "statistics-probability-grade-8": "statistics",
};
