export type DistanceActivity =
  | "distance-guide"
  | "distance-vehicles"
  | "distance-practice"
  | "speed-guide"
  | "speed-worked-example"
  | "speed-practice"
  | "time-guide"
  | "time-worked-example"
  | "time-practice";

export interface DistanceField {
  id: string;
  label: string;
  timeHours: number;
  answer: number;
}

export interface DistanceVehicleTask {
  id: string;
  vehicle: "car" | "train" | "bicycle" | "bus" | "scooter" | "plane" | "runner" | "swimmer" | "robot" | "ship";
  vehicleLabel: string;
  speed: number;
  fields: DistanceField[];
  hint: string;
}

export interface DistancePracticeTask {
  id: string;
  prompt: string;
  imageSrc: string;
  imageAlt: string;
  speed: number;
  timeLabel: string;
  timeHours: number;
  timeParts: Array<{
    id: string;
    value: number;
    unit: "h" | "min";
  }>;
  convertedTime:
    | { kind: "decimal"; value: number }
    | { kind: "fraction"; numerator: number; denominator: number };
  answer: number;
  hint: string;
}

export interface SpeedPracticeTask {
  id: string;
  title: string;
  prompt: string;
  imageSrc: string;
  imageAlt: string;
  distance: number;
  distanceUnit: "km" | "m";
  time: number;
  timeUnit: "h" | "min" | "s";
  answer: number;
  answerUnit: "km/h" | "m/min" | "m/s";
  hint: string;
}

export interface TimePracticeTask {
  id: string;
  title: string;
  prompt: string;
  imageSrc: string;
  imageAlt: string;
  distance: number;
  distanceUnit: "km" | "m";
  speed: number;
  speedUnit: "km/h" | "m/min" | "m/s";
  answer: number;
  answerUnit: "h" | "min" | "s";
  hint: string;
}

const field = (id: string, label: string, timeHours: number, speed: number): DistanceField => ({
  id,
  label,
  timeHours,
  answer: speed * timeHours,
});

export const DISTANCE_VEHICLE_TASKS: DistanceVehicleTask[] = [
  {
    id: "car-80",
    vehicle: "car",
    vehicleLabel: "samochód",
    speed: 80,
    fields: [
      field("one-hour", "1 godzina", 1, 80),
      field("two-hours", "2 godziny", 2, 80),
      field("half-hour", "30 minut", 0.5, 80),
      field("quarter-hour", "15 minut", 0.25, 80),
    ],
    hint: "Samodzielnie ustal, jaką częścią godziny jest podany czas.",
  },
  {
    id: "train-120",
    vehicle: "train",
    vehicleLabel: "pociąg",
    speed: 120,
    fields: [
      field("two-and-half-hours", "2,5 godziny", 2.5, 120),
      field("one-and-half-hours", "1,5 godziny", 1.5, 120),
      field("three-quarters-hour", "45 minut", 0.75, 120),
      field("three-hours", "3 godziny", 3, 120),
    ],
    hint: "Droga rośnie tyle razy, ile razy wydłuża się czas jazdy.",
  },
  {
    id: "bicycle-20",
    vehicle: "bicycle",
    vehicleLabel: "rower",
    speed: 20,
    fields: [
      field("half-hour", "30 minut", 0.5, 20),
      field("one-and-half-hours", "1,5 godziny", 1.5, 20),
      field("two-and-half-hours", "2,5 godziny", 2.5, 20),
      field("three-hours", "3 godziny", 3, 20),
    ],
    hint: "Porównaj każdy podany czas z jedną godziną.",
  },
  {
    id: "bus-60",
    vehicle: "bus",
    vehicleLabel: "autobus",
    speed: 60,
    fields: [
      field("twenty-minutes", "20 minut", 1 / 3, 60),
      field("forty-minutes", "40 minut", 2 / 3, 60),
      field("one-hour", "1 godzina", 1, 60),
      field("two-and-half-hours", "2,5 godziny", 2.5, 60),
    ],
    hint: "Ustal, jaką częścią godziny jest 20 minut i 40 minut.",
  },
  {
    id: "scooter-24",
    vehicle: "scooter",
    vehicleLabel: "hulajnoga",
    speed: 24,
    fields: [
      field("quarter-hour", "15 minut", 0.25, 24),
      field("three-quarters-hour", "45 minut", 0.75, 24),
      field("one-and-half-hours", "1,5 godziny", 1.5, 24),
      field("two-and-half-hours", "2,5 godziny", 2.5, 24),
    ],
    hint: "Samodzielnie zamień minuty na część godziny.",
  },
];

export const DISTANCE_PRACTICE_TASKS: DistancePracticeTask[] = [
  {
    id: "mountain-rescue",
    prompt: "Pojazd ratownictwa górskiego jedzie ze stałą prędkością 42 kilometrów na godzinę. Ile kilometrów pokona w ciągu 2,5 godziny?",
    imageSrc: "/images/lessons/class6/distance/mountain-rescue.webp",
    imageAlt: "Pojazd ratownictwa górskiego na ośnieżonej trasie",
    speed: 42,
    timeLabel: "2,5 h",
    timeHours: 2.5,
    timeParts: [{ id: "hours", value: 2.5, unit: "h" }],
    convertedTime: { kind: "decimal", value: 2.5 },
    answer: 105,
    hint: "Pomnóż prędkość przez 2,5 godziny.",
  },
  {
    id: "research-boat",
    prompt: "Łódź badawcza płynie ze stałą prędkością 36 kilometrów na godzinę. Jaką drogę pokona podczas 45-minutowego pomiaru zatoki?",
    imageSrc: "/images/lessons/class6/distance/research-boat.webp",
    imageAlt: "Łódź badawcza płynąca od boi pomiarowej do stacji morskiej",
    speed: 36,
    timeLabel: "45 min",
    timeHours: 0.75,
    timeParts: [{ id: "minutes", value: 45, unit: "min" }],
    convertedTime: { kind: "decimal", value: 0.75 },
    answer: 27,
    hint: "Samodzielnie zamień minuty na część godziny.",
  },
  {
    id: "forest-train",
    prompt: "Leśna kolejka jedzie ze stałą prędkością 48 kilometrów na godzinę. Ile kilometrów przejedzie od stacji do obserwatorium w ciągu 1 godziny i 30 minut?",
    imageSrc: "/images/lessons/class6/distance/forest-train.webp",
    imageAlt: "Kolorowa kolejka jadąca przez las do obserwatorium",
    speed: 48,
    timeLabel: "1 h 30 min",
    timeHours: 1.5,
    timeParts: [
      { id: "hours", value: 1, unit: "h" },
      { id: "minutes", value: 30, unit: "min" },
    ],
    convertedTime: { kind: "decimal", value: 1.5 },
    answer: 72,
    hint: "Ustal, jaką częścią godziny jest 30 minut.",
  },
  {
    id: "bike-courier",
    prompt: "Kurierka rowerowa jedzie ze stałą prędkością 18 kilometrów na godzinę. Jaką drogę pokona podczas trasy trwającej 2 godziny i 30 minut?",
    imageSrc: "/images/lessons/class6/distance/bike-courier.webp",
    imageAlt: "Kurierka rowerowa z paczką na miejskiej drodze rowerowej",
    speed: 18,
    timeLabel: "2 h 30 min",
    timeHours: 2.5,
    timeParts: [
      { id: "hours", value: 2, unit: "h" },
      { id: "minutes", value: 30, unit: "min" },
    ],
    convertedTime: { kind: "decimal", value: 2.5 },
    answer: 45,
    hint: "Zamień 2 godziny i 30 minut na liczbę godzin.",
  },
  {
    id: "medical-drone",
    prompt: "Dron z lekarstwami leci ze stałą prędkością 72 kilometrów na godzinę. Jaką drogę pokona w ciągu 20 minut?",
    imageSrc: "/images/lessons/class6/distance/medical-drone.webp",
    imageAlt: "Dron transportujący lekarstwa do przychodni w dolinie",
    speed: 72,
    timeLabel: "20 min",
    timeHours: 1 / 3,
    timeParts: [{ id: "minutes", value: 20, unit: "min" }],
    convertedTime: { kind: "fraction", numerator: 1, denominator: 3 },
    answer: 24,
    hint: "Samodzielnie zamień minuty na część godziny.",
  },
];

export const SPEED_PRACTICE_TASKS: SpeedPracticeTask[] = [
  {
    id: "express-train",
    title: "Ekspres przez góry",
    prompt: "Pociąg przejechał 720 km w ciągu 4 godzin. Z jaką prędkością jechał?",
    imageSrc: "/images/lessons/class6/speed/train.webp",
    imageAlt: "Pociąg wyjeżdżający z górskiego tunelu",
    distance: 720,
    distanceUnit: "km",
    time: 4,
    timeUnit: "h",
    answer: 180,
    answerUnit: "km/h",
    hint: "W pierwszym zadaniu ustaw działanie: drogę podziel przez czas.",
  },
  {
    id: "rescue-helicopter",
    title: "Lot ratunkowy",
    prompt: "Śmigłowiec ratowniczy pokonał 450 km w ciągu 3 godzin. Oblicz jego prędkość.",
    imageSrc: "/images/lessons/class6/speed/rescue-helicopter.webp",
    imageAlt: "Śmigłowiec ratowniczy lecący nad ośnieżonymi górami",
    distance: 450,
    distanceUnit: "km",
    time: 3,
    timeUnit: "h",
    answer: 150,
    answerUnit: "km/h",
    hint: "Ustal, ile kilometrów przypada na jedną godzinę lotu.",
  },
  {
    id: "pool-race",
    title: "Wyścig na basenie",
    prompt: "Pływaczka przepłynęła 200 m w ciągu 100 sekund. Podaj jej prędkość w metrach na sekundę.",
    imageSrc: "/images/lessons/class6/speed/swimmer.webp",
    imageAlt: "Pływaczka podczas wyścigu na basenie",
    distance: 200,
    distanceUnit: "m",
    time: 100,
    timeUnit: "s",
    answer: 2,
    answerUnit: "m/s",
    hint: "Ustal, ile metrów pływaczka pokonywała w każdej sekundzie.",
  },
  {
    id: "planetary-rover",
    title: "Łazik badawczy",
    prompt: "Łazik przejechał 480 m w ciągu 8 minut. Podaj jego prędkość w metrach na minutę.",
    imageSrc: "/images/lessons/class6/speed/rover.webp",
    imageAlt: "Łazik badawczy jadący po czerwonej planecie",
    distance: 480,
    distanceUnit: "m",
    time: 8,
    timeUnit: "min",
    answer: 60,
    answerUnit: "m/min",
    hint: "Odczytaj drogę i czas, a następnie samodzielnie wybierz działanie.",
  },
  {
    id: "lake-regatta",
    title: "Regaty na jeziorze",
    prompt: "Żaglówka przepłynęła 144 km w ciągu 6 godzin. Z jaką prędkością płynęła?",
    imageSrc: "/images/lessons/class6/speed/sailboat.webp",
    imageAlt: "Żaglówka podczas regat na jeziorze",
    distance: 144,
    distanceUnit: "km",
    time: 6,
    timeUnit: "h",
    answer: 24,
    answerUnit: "km/h",
    hint: "Samodzielnie wybierz działanie i podaj wynik w kilometrach na godzinę.",
  },
];

export const TIME_PRACTICE_TASKS: TimePracticeTask[] = [
  {
    id: "mountain-cable-car",
    title: "Kolejka nad doliną",
    prompt: "Kolejka linowa ma do pokonania 18 km i porusza się z prędkością 6 kilometrów na godzinę. Ile godzin potrwa przejazd?",
    imageSrc: "/images/lessons/class6/time/cable-car.webp",
    imageAlt: "Kolejka linowa między dwiema górskimi stacjami",
    distance: 18,
    distanceUnit: "km",
    speed: 6,
    speedUnit: "km/h",
    answer: 3,
    answerUnit: "h",
    hint: "W pierwszym zadaniu ustaw działanie: drogę podziel przez prędkość.",
  },
  {
    id: "island-ferry",
    title: "Prom między wyspami",
    prompt: "Prom ma do przepłynięcia 96 km. Płynie z prędkością 32 kilometrów na godzinę. Ile godzin potrwa rejs?",
    imageSrc: "/images/lessons/class6/time/ferry.webp",
    imageAlt: "Prom płynący między dwiema wyspami",
    distance: 96,
    distanceUnit: "km",
    speed: 32,
    speedUnit: "km/h",
    answer: 3,
    answerUnit: "h",
    hint: "Samodzielnie zdecyduj, jak wykorzystać podaną drogę i prędkość.",
  },
  {
    id: "bike-delivery",
    title: "Kurierska trasa",
    prompt: "Kurier ma do przejechania 24 km i jedzie z prędkością 16 kilometrów na godzinę. Ile godzin zajmie mu trasa?",
    imageSrc: "/images/lessons/class6/time/bike-courier.webp",
    imageAlt: "Kurier rowerowy jadący w stronę centrum miasta",
    distance: 24,
    distanceUnit: "km",
    speed: 16,
    speedUnit: "km/h",
    answer: 1.5,
    answerUnit: "h",
    hint: "Wynik może być liczbą dziesiętną. Użyj przecinka.",
  },
  {
    id: "medical-drone",
    title: "Dostawa lekarstw",
    prompt: "Dron ma pokonać 1500 m i leci z prędkością 25 metrów na sekundę. Ile sekund potrwa lot?",
    imageSrc: "/images/lessons/class6/time/medical-drone.webp",
    imageAlt: "Dron medyczny lecący z przychodni do wioski",
    distance: 1500,
    distanceUnit: "m",
    speed: 25,
    speedUnit: "m/s",
    answer: 60,
    answerUnit: "s",
    hint: "Jednostka prędkości podpowiada, w jakiej jednostce zapisać czas.",
  },
  {
    id: "research-submarine",
    title: "Misja pod wodą",
    prompt: "Łódź podwodna ma przepłynąć 4200 m z prędkością 70 metrów na minutę. Ile minut potrwa misja?",
    imageSrc: "/images/lessons/class6/time/submarine.webp",
    imageAlt: "Żółta łódź podwodna między stacją badawczą a punktem obserwacyjnym",
    distance: 4200,
    distanceUnit: "m",
    speed: 70,
    speedUnit: "m/min",
    answer: 60,
    answerUnit: "min",
    hint: "Odczytaj dane i samodzielnie wybierz działanie.",
  },
];

export function distanceActivityFromStageId(stageId: string): DistanceActivity {
  if (stageId.includes("time-guide")) return "time-guide";
  if (stageId.includes("time-worked-example")) return "time-worked-example";
  if (stageId.includes("time-practice")) return "time-practice";
  if (stageId.includes("speed-guide")) return "speed-guide";
  if (stageId.includes("speed-worked-example")) return "speed-worked-example";
  if (stageId.includes("speed-practice")) return "speed-practice";
  if (stageId.includes("triangle-guide")) return "distance-guide";
  if (stageId.includes("vehicle-series")) return "distance-vehicles";
  return "distance-practice";
}
