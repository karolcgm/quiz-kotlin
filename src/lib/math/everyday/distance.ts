export type DistanceActivity =
  | "distance-guide"
  | "distance-vehicles"
  | "distance-practice"
  | "speed-guide"
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

const distanceFields = (speed: number): DistanceField[] => [
  { id: "one-hour", label: "1 godzina", timeHours: 1, answer: speed },
  { id: "two-hours", label: "2 godziny", timeHours: 2, answer: speed * 2 },
  { id: "half-hour", label: "30 minut = 0,5 godziny", timeHours: 0.5, answer: speed / 2 },
  { id: "quarter-hour", label: "15 minut = 0,25 godziny", timeHours: 0.25, answer: speed / 4 },
];

export const DISTANCE_VEHICLE_TASKS: DistanceVehicleTask[] = [
  {
    id: "car-80",
    vehicle: "car",
    vehicleLabel: "samochód",
    speed: 80,
    fields: distanceFields(80),
    hint: "Dla 30 minut weź połowę drogi z jednej godziny, a dla 15 minut — jedną czwartą.",
  },
  {
    id: "train-120",
    vehicle: "train",
    vehicleLabel: "pociąg",
    speed: 120,
    fields: distanceFields(120),
    hint: "Droga rośnie tyle razy, ile razy wydłuża się czas jazdy.",
  },
  {
    id: "bicycle-20",
    vehicle: "bicycle",
    vehicleLabel: "rower",
    speed: 20,
    fields: distanceFields(20),
    hint: "W kwadrans rower pokona jedną czwartą drogi przebywanej w godzinę.",
  },
  {
    id: "bus-60",
    vehicle: "bus",
    vehicleLabel: "autobus",
    speed: 60,
    fields: distanceFields(60),
    hint: "Najpierw ustal drogę w godzinę, a potem odpowiednią część tej drogi.",
  },
  {
    id: "scooter-24",
    vehicle: "scooter",
    vehicleLabel: "hulajnoga",
    speed: 24,
    fields: distanceFields(24),
    hint: "30 minut to połowa godziny, a 15 minut to ćwierć godziny.",
  },
];

export const DISTANCE_PRACTICE_TASKS: DistancePracticeTask[] = [
  {
    id: "coach-trip",
    prompt: "Autokar jedzie ze stałą prędkością 70 km/h przez 3 godziny. Jaką drogę pokona?",
    speed: 70,
    timeLabel: "3 h",
    timeHours: 3,
    answer: 210,
    hint: "Pomnóż 70 przez 3.",
  },
  {
    id: "rescue-boat",
    prompt: "Łódź ratownicza płynie z prędkością 36 km/h przez 30 minut. Jaką drogę pokona?",
    speed: 36,
    timeLabel: "30 min = 0,5 h",
    timeHours: 0.5,
    answer: 18,
    hint: "W pół godziny łódź pokona połowę drogi z jednej godziny.",
  },
  {
    id: "tram-quarter",
    prompt: "Tramwaj jedzie z prędkością 40 km/h przez kwadrans. Jaką drogę pokona?",
    speed: 40,
    timeLabel: "15 min = 0,25 h",
    timeHours: 0.25,
    answer: 10,
    hint: "Kwadrans to jedna czwarta godziny.",
  },
  {
    id: "cyclist-long",
    prompt: "Rowerzysta jedzie z prędkością 18 km/h przez 2 godziny. Jaką drogę pokona?",
    speed: 18,
    timeLabel: "2 h",
    timeHours: 2,
    answer: 36,
    hint: "Pomnóż prędkość przez czas.",
  },
  {
    id: "express-half",
    prompt: "Pociąg ekspresowy jedzie z prędkością 160 km/h przez pół godziny. Jaką drogę pokona?",
    speed: 160,
    timeLabel: "30 min = 0,5 h",
    timeHours: 0.5,
    answer: 80,
    hint: "Pół godziny oznacza połowę drogi przebywanej w godzinę.",
  },
];

export const SPEED_PRACTICE_TASKS: SpeedPracticeTask[] = [
  {
    id: "plane-2400",
    vehicle: "plane",
    vehicleLabel: "samolot",
    prompt: "Samolot przeleciał 2400 km w ciągu 4 godzin. Z jaką prędkością leciał?",
    distance: 2400,
    distanceUnit: "km",
    time: 4,
    timeUnit: "h",
    answer: 600,
    answerUnit: "km/h",
    hint: "Podziel 2400 km przez 4 godziny.",
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
  if (stageId.includes("speed-practice")) return "speed-practice";
  if (stageId.includes("triangle-guide")) return "distance-guide";
  if (stageId.includes("vehicle-series")) return "distance-vehicles";
  return "distance-practice";
}
