export type DistanceActivity =
  | "distance-guide"
  | "distance-vehicles"
  | "distance-practice"
  | "speed-guide"
  | "speed-worked-example"
  | "speed-practice";

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
  answer: number;
  hint: string;
}

export interface SpeedPracticeTask {
  id: string;
  vehicle: DistanceVehicleTask["vehicle"];
  vehicleLabel: string;
  prompt: string;
  distance: number;
  distanceUnit: "km" | "m";
  time: number;
  timeUnit: "h" | "min" | "s";
  answer: number;
  answerUnit: "km/h" | "m/min" | "m/s";
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
    answer: 24,
    hint: "Samodzielnie zamień minuty na część godziny.",
  },
];

export const SPEED_PRACTICE_TASKS: SpeedPracticeTask[] = [
  {
    id: "bus-420",
    vehicle: "bus",
    vehicleLabel: "autobus",
    prompt: "Autobus przejechał 420 km w ciągu 6 godzin. Z jaką prędkością jechał?",
    distance: 420,
    distanceUnit: "km",
    time: 6,
    timeUnit: "h",
    answer: 70,
    answerUnit: "km/h",
    hint: "Podziel 420 km przez 6 godzin.",
  },
  {
    id: "train-540",
    vehicle: "train",
    vehicleLabel: "pociąg",
    prompt: "Pociąg przejechał 540 km w ciągu 3 godzin. Oblicz jego prędkość.",
    distance: 540,
    distanceUnit: "km",
    time: 3,
    timeUnit: "h",
    answer: 180,
    answerUnit: "km/h",
    hint: "Prędkość to droga podzielona przez czas.",
  },
  {
    id: "cyclist-72",
    vehicle: "bicycle",
    vehicleLabel: "rowerzysta",
    prompt: "Rowerzysta pokonał 72 km w ciągu 4 godzin. Z jaką prędkością jechał?",
    distance: 72,
    distanceUnit: "km",
    time: 4,
    timeUnit: "h",
    answer: 18,
    answerUnit: "km/h",
    hint: "Oblicz 72 : 4.",
  },
  {
    id: "runner-600",
    vehicle: "runner",
    vehicleLabel: "biegacz",
    prompt: "Biegacz pokonał 600 m w ciągu 2 minut. Podaj jego prędkość w metrach na minutę.",
    distance: 600,
    distanceUnit: "m",
    time: 2,
    timeUnit: "min",
    answer: 300,
    answerUnit: "m/min",
    hint: "Podziel liczbę metrów przez liczbę minut.",
  },
  {
    id: "swimmer-100",
    vehicle: "swimmer",
    vehicleLabel: "pływak",
    prompt: "Pływak przepłynął 100 m w ciągu 50 sekund. Podaj jego prędkość w metrach na sekundę.",
    distance: 100,
    distanceUnit: "m",
    time: 50,
    timeUnit: "s",
    answer: 2,
    answerUnit: "m/s",
    hint: "Oblicz 100 : 50.",
  },
  {
    id: "robot-360",
    vehicle: "robot",
    vehicleLabel: "robot",
    prompt: "Robot przebył 360 m w ciągu 6 minut. Podaj jego prędkość w metrach na minutę.",
    distance: 360,
    distanceUnit: "m",
    time: 6,
    timeUnit: "min",
    answer: 60,
    answerUnit: "m/min",
    hint: "Oblicz, ile metrów robot pokonuje w jednej minucie.",
  },
  {
    id: "scooter-150",
    vehicle: "scooter",
    vehicleLabel: "hulajnoga",
    prompt: "Hulajnoga przejechała 150 m w ciągu 30 sekund. Podaj prędkość w metrach na sekundę.",
    distance: 150,
    distanceUnit: "m",
    time: 30,
    timeUnit: "s",
    answer: 5,
    answerUnit: "m/s",
    hint: "Podziel 150 m przez 30 s.",
  },
  {
    id: "ship-280",
    vehicle: "ship",
    vehicleLabel: "statek",
    prompt: "Statek przepłynął 280 km w ciągu 7 godzin. Z jaką prędkością płynął?",
    distance: 280,
    distanceUnit: "km",
    time: 7,
    timeUnit: "h",
    answer: 40,
    answerUnit: "km/h",
    hint: "Oblicz 280 : 7.",
  },
];

export function distanceActivityFromStageId(stageId: string): DistanceActivity {
  if (stageId.includes("speed-guide")) return "speed-guide";
  if (stageId.includes("speed-worked-example")) return "speed-worked-example";
  if (stageId.includes("speed-practice")) return "speed-practice";
  if (stageId.includes("triangle-guide")) return "distance-guide";
  if (stageId.includes("vehicle-series")) return "distance-vehicles";
  return "distance-practice";
}
