export type DistanceActivity = "distance-guide" | "distance-vehicles" | "distance-practice";

export interface DistanceField {
  id: string;
  label: string;
  timeHours: number;
  answer: number;
}

export interface DistanceVehicleTask {
  id: string;
  vehicle: "car" | "train" | "bicycle" | "bus" | "scooter";
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

export function distanceActivityFromStageId(stageId: string): DistanceActivity {
  if (stageId.includes("triangle-guide")) return "distance-guide";
  if (stageId.includes("vehicle-series")) return "distance-vehicles";
  return "distance-practice";
}
