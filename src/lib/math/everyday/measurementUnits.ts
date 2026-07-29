export type MeasurementUnitsActivity =
  | "units-guide"
  | "length-conversions"
  | "mass-conversions"
  | "price-per-kilogram";

export interface MeasurementNumericField {
  id: string;
  label: string;
  unit?: string;
  answer: number;
}

export interface MeasurementNumericTask {
  id: string;
  prompt: string;
  detail?: string;
  equation?: {
    value: string;
    fromUnit: string;
    toUnit: string;
  };
  fields: MeasurementNumericField[];
  hint: string;
  image?: {
    src: string;
    alt: string;
  };
}

export const LENGTH_CONVERSION_TASKS: MeasurementNumericTask[] = [
  {
    id: "length-km-m",
    prompt: "Zamień 3,4 km na metry.",
    equation: { value: "3,4", fromUnit: "km", toUnit: "m" },
    fields: [{ id: "result", label: "Wynik", unit: "m", answer: 3400 }],
    hint: "Z kilometrów na metry mnożymy przez 1000.",
  },
  {
    id: "length-m-cm",
    prompt: "Zamień 2,75 m na centymetry.",
    equation: { value: "2,75", fromUnit: "m", toUnit: "cm" },
    fields: [{ id: "result", label: "Wynik", unit: "cm", answer: 275 }],
    hint: "Z metrów na centymetry mnożymy przez 100.",
  },
  {
    id: "length-dm-m",
    prompt: "Zamień 68 dm na metry.",
    equation: { value: "68", fromUnit: "dm", toUnit: "m" },
    fields: [{ id: "result", label: "Wynik", unit: "m", answer: 6.8 }],
    hint: "Z decymetrów na metry dzielimy przez 10.",
  },
  {
    id: "length-mm-m",
    prompt: "Zamień 4500 mm na metry.",
    equation: { value: "4500", fromUnit: "mm", toUnit: "m" },
    fields: [{ id: "result", label: "Wynik", unit: "m", answer: 4.5 }],
    hint: "W jednym metrze jest 1000 milimetrów.",
  },
  {
    id: "length-m-mm",
    prompt: "Zamień 0,42 m na milimetry.",
    equation: { value: "0,42", fromUnit: "m", toUnit: "mm" },
    fields: [{ id: "result", label: "Wynik", unit: "mm", answer: 420 }],
    hint: "Z metrów na milimetry mnożymy przez 1000.",
  },
  {
    id: "length-cm-m",
    prompt: "Zamień 735 cm na metry.",
    equation: { value: "735", fromUnit: "cm", toUnit: "m" },
    fields: [{ id: "result", label: "Wynik", unit: "m", answer: 7.35 }],
    hint: "Z centymetrów na metry dzielimy przez 100.",
  },
  {
    id: "length-mixed",
    prompt: "Zamień 2 km 35 m na metry.",
    detail: "Najpierw zamień kilometry, potem dodaj pozostałe metry.",
    fields: [{ id: "result", label: "Razem", unit: "m", answer: 2035 }],
    hint: "2 km to 2000 m. Dodaj jeszcze 35 m.",
  },
];

export const MASS_CONVERSION_TASKS: MeasurementNumericTask[] = [
  {
    id: "mass-kg-g",
    prompt: "Zamień 2,4 kg na gramy.",
    equation: { value: "2,4", fromUnit: "kg", toUnit: "g" },
    fields: [{ id: "result", label: "Wynik", unit: "g", answer: 2400 }],
    hint: "Z kilogramów na gramy mnożymy przez 1000.",
  },
  {
    id: "mass-g-kg",
    prompt: "Zamień 3750 g na kilogramy.",
    equation: { value: "3750", fromUnit: "g", toUnit: "kg" },
    fields: [{ id: "result", label: "Wynik", unit: "kg", answer: 3.75 }],
    hint: "Z gramów na kilogramy dzielimy przez 1000.",
  },
  {
    id: "mass-dag-g",
    prompt: "Zamień 6 dag na gramy.",
    equation: { value: "6", fromUnit: "dag", toUnit: "g" },
    fields: [{ id: "result", label: "Wynik", unit: "g", answer: 60 }],
    hint: "Jeden dekagram to 10 gramów.",
  },
  {
    id: "mass-g-mg",
    prompt: "Zamień 4,2 g na miligramy.",
    equation: { value: "4,2", fromUnit: "g", toUnit: "mg" },
    fields: [{ id: "result", label: "Wynik", unit: "mg", answer: 4200 }],
    hint: "Jeden gram to 1000 miligramów.",
  },
  {
    id: "mass-mg-g",
    prompt: "Zamień 6500 mg na gramy.",
    equation: { value: "6500", fromUnit: "mg", toUnit: "g" },
    fields: [{ id: "result", label: "Wynik", unit: "g", answer: 6.5 }],
    hint: "Z miligramów na gramy dzielimy przez 1000.",
  },
  {
    id: "mass-kg-g-small",
    prompt: "Zamień 0,08 kg na gramy.",
    equation: { value: "0,08", fromUnit: "kg", toUnit: "g" },
    fields: [{ id: "result", label: "Wynik", unit: "g", answer: 80 }],
    hint: "Przesuń przecinek o trzy miejsca w prawo.",
  },
  {
    id: "mass-t-kg",
    prompt: "Zamień 1,25 t na kilogramy.",
    equation: { value: "1,25", fromUnit: "t", toUnit: "kg" },
    fields: [{ id: "result", label: "Wynik", unit: "kg", answer: 1250 }],
    hint: "Jedna tona to 1000 kilogramów.",
  },
];

export const PRICE_PER_KILOGRAM_TASKS: MeasurementNumericTask[] = [
  {
    id: "price-blueberries",
    prompt: "Jagody kosztują 4 zł za 100 g. Ile kosztuje 1 kg jagód?",
    detail: "Najpierw ustal, ile porcji po 100 g mieści się w kilogramie.",
    fields: [
      { id: "portions", label: "Liczba porcji w 1 kg", answer: 10 },
      { id: "price", label: "Cena 1 kg", unit: "zł", answer: 40 },
    ],
    hint: "1 kg to 1000 g. Podziel 1000 przez 100, a potem pomnóż liczbę porcji przez 4 zł.",
    image: { src: "/lessons/m6/everyday-units/blueberries.png", alt: "Łubianka świeżych jagód" },
  },
  {
    id: "price-ham",
    prompt: "Szynka kosztuje 7,50 zł za 25 g. Ile kosztuje 1 kg szynki?",
    detail: "Oblicz liczbę porcji po 25 g w kilogramie, a następnie cenę wszystkich porcji.",
    fields: [
      { id: "portions", label: "Liczba porcji w 1 kg", answer: 40 },
      { id: "price", label: "Cena 1 kg", unit: "zł", answer: 300 },
    ],
    hint: "1000 : 25 = 40. Cenę jednej porcji pomnóż przez 40.",
    image: { src: "/lessons/m6/everyday-units/ham.png", alt: "Plastry szynki na tacce" },
  },
  {
    id: "price-cheese",
    prompt: "Ser kosztuje 8,40 zł za 200 g. Ile kosztuje 1 kg sera?",
    detail: "Kilogram podziel na porcje po 200 g.",
    fields: [
      { id: "portions", label: "Liczba porcji w 1 kg", answer: 5 },
      { id: "price", label: "Cena 1 kg", unit: "zł", answer: 42 },
    ],
    hint: "W kilogramie mieści się 5 porcji po 200 g.",
    image: { src: "/lessons/m6/everyday-units/cheese.png", alt: "Kawałek żółtego sera" },
  },
  {
    id: "price-walnuts",
    prompt: "Orzechy włoskie kosztują 6,25 zł za 125 g. Ile kosztuje 1 kg orzechów?",
    detail: "Ustal, ile porcji po 125 g tworzy 1000 g.",
    fields: [
      { id: "portions", label: "Liczba porcji w 1 kg", answer: 8 },
      { id: "price", label: "Cena 1 kg", unit: "zł", answer: 50 },
    ],
    hint: "1000 : 125 = 8. Pomnóż 6,25 zł przez 8.",
    image: { src: "/lessons/m6/everyday-units/walnuts.png", alt: "Papierowa torba z orzechami włoskimi" },
  },
];

export function measurementUnitsActivityFromStageId(stageId: string): MeasurementUnitsActivity {
  if (stageId.includes("units-guide")) return "units-guide";
  if (stageId.includes("length-conversions")) return "length-conversions";
  if (stageId.includes("mass-conversions")) return "mass-conversions";
  return "price-per-kilogram";
}
