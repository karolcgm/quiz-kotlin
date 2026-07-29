export type CalendarTimeActivity =
  | "calendar-guide"
  | "calendar"
  | "centuries"
  | "weekdays"
  | "conversions"
  | "elapsed";

export interface CalendarChoiceTask {
  id: string;
  prompt: string;
  detail?: string;
  choices: string[];
  answer: string;
  hint: string;
}

export interface CalendarNumericTask {
  id: string;
  prompt: string;
  detail?: string;
  fields: Array<{
    id: string;
    label: string;
    unit?: string;
    answer: number;
  }>;
  hint: string;
}

export const MONTHS = [
  { name: "styczeń", days: 31 },
  { name: "luty", days: 28, leapDays: 29 },
  { name: "marzec", days: 31 },
  { name: "kwiecień", days: 30 },
  { name: "maj", days: 31 },
  { name: "czerwiec", days: 30 },
  { name: "lipiec", days: 31 },
  { name: "sierpień", days: 31 },
  { name: "wrzesień", days: 30 },
  { name: "październik", days: 31 },
  { name: "listopad", days: 30 },
  { name: "grudzień", days: 31 },
] as const;

export const CALENDAR_TASKS: CalendarChoiceTask[] = [
  { id: "month-april", prompt: "Ile dni ma kwiecień?", choices: ["28", "29", "30", "31"], answer: "30", hint: "Kwiecień należy do miesięcy mających 30 dni." },
  { id: "month-july", prompt: "Ile dni ma lipiec?", choices: ["30", "31", "28", "29"], answer: "31", hint: "Lipiec ma 31 dni." },
  { id: "leap-days", prompt: "Ile dni ma rok przestępny?", choices: ["365", "366", "364", "367"], answer: "366", hint: "W roku przestępnym luty ma 29 dni." },
  { id: "leap-2028", prompt: "Ile dni ma luty w roku 2028?", detail: "Rok 2028 jest podzielny przez 4 i nie jest rokiem kończącym wiek.", choices: ["28", "30", "31", "29"], answer: "29", hint: "Rok 2028 jest przestępny." },
  { id: "leap-2100", prompt: "Czy rok 2100 będzie przestępny?", detail: "Rok kończący wiek jest przestępny tylko wtedy, gdy dzieli się przez 400.", choices: ["tak", "nie"], answer: "nie", hint: "2100 nie dzieli się przez 400." },
  { id: "month-november", prompt: "Ile dni ma listopad?", choices: ["31", "28", "30", "29"], answer: "30", hint: "Listopad ma 30 dni." },
];

export const CENTURY_TASKS: CalendarChoiceTask[] = [
  { id: "century-1410", prompt: "W którym wieku był rok 1410?", choices: ["XIV", "XVI", "XV", "XIII"], answer: "XV", hint: "Lata 1401–1500 tworzą XV wiek." },
  { id: "century-1791", prompt: "W którym wieku był rok 1791?", choices: ["XVII", "XVIII", "XIX", "XVI"], answer: "XVIII", hint: "Lata 1701–1800 tworzą XVIII wiek." },
  { id: "century-2001", prompt: "W którym wieku był rok 2001?", choices: ["XX", "XXI", "XIX", "XXII"], answer: "XXI", hint: "Pierwszy rok XXI wieku to 2001." },
  { id: "century-1500", prompt: "W którym wieku był rok 1500?", choices: ["XVI", "XIV", "XV", "XVII"], answer: "XV", hint: "Rok kończący się na 00 jest ostatnim rokiem danego wieku." },
  { id: "century-966", prompt: "W którym wieku był rok 966?", choices: ["VIII", "X", "IX", "XI"], answer: "X", hint: "Lata 901–1000 tworzą X wiek." },
];

export const WEEKDAY_TASKS: CalendarChoiceTask[] = [
  { id: "weekday-10", prompt: "Dziś jest poniedziałek. Jaki dzień tygodnia będzie za 10 dni?", detail: "Najpierw odrzuć pełny tydzień.", choices: ["środa", "czwartek", "piątek", "sobota"], answer: "czwartek", hint: "10 dni to tydzień i jeszcze 3 dni." },
  { id: "weekday-17", prompt: "Dziś jest piątek. Jaki dzień tygodnia będzie za 17 dni?", choices: ["poniedziałek", "wtorek", "środa", "niedziela"], answer: "poniedziałek", hint: "17 dni to dwa tygodnie i jeszcze 3 dni." },
  { id: "weekday-30", prompt: "Dziś jest wtorek. Jaki dzień tygodnia będzie za 30 dni?", choices: ["czwartek", "piątek", "środa", "sobota"], answer: "czwartek", hint: "Po odjęciu czterech pełnych tygodni zostają 2 dni." },
  { id: "weekday-before", prompt: "Dziś jest niedziela. Jaki dzień tygodnia był 9 dni temu?", choices: ["sobota", "piątek", "czwartek", "środa"], answer: "piątek", hint: "9 dni temu to tydzień i jeszcze 2 dni wstecz." },
  { id: "weekday-100", prompt: "Dziś jest środa. Jaki dzień tygodnia będzie za 100 dni?", choices: ["czwartek", "piątek", "sobota", "niedziela"], answer: "piątek", hint: "100 : 7 daje resztę 2." },
];

export const CONVERSION_TASKS: CalendarNumericTask[] = [
  { id: "convert-2h", prompt: "Zamień 2 godziny 35 minut na minuty.", fields: [{ id: "minutes", label: "Razem", unit: "min", answer: 155 }], hint: "2 godziny to 120 minut." },
  { id: "convert-185", prompt: "Zamień 185 minut na godziny i minuty.", fields: [{ id: "hours", label: "Godziny", unit: "h", answer: 3 }, { id: "minutes", label: "Minuty", unit: "min", answer: 5 }], hint: "W 185 minutach mieszczą się 3 pełne godziny i 5 minut." },
  { id: "convert-quarter", prompt: "Ile minut trwają 3 kwadranse?", fields: [{ id: "minutes", label: "Czas", unit: "min", answer: 45 }], hint: "Kwadrans trwa 15 minut." },
  { id: "convert-day", prompt: "Ile godzin mają 2 doby i 6 godzin?", fields: [{ id: "hours", label: "Razem", unit: "h", answer: 54 }], hint: "Jedna doba ma 24 godziny." },
  { id: "convert-425", prompt: "Zamień 425 minut na godziny i minuty.", fields: [{ id: "hours", label: "Godziny", unit: "h", answer: 7 }, { id: "minutes", label: "Minuty", unit: "min", answer: 5 }], hint: "7 godzin to 420 minut." },
];

export const ELAPSED_TASKS: CalendarNumericTask[] = [
  { id: "elapsed-school", prompt: "Lekcja rozpoczęła się o 8:15, a skończyła o 9:00. Ile trwała?", detail: "Najpierw policz do pełnej godziny.", fields: [{ id: "minutes", label: "Czas trwania", unit: "min", answer: 45 }], hint: "Od 8:15 do 9:00 upływa 45 minut." },
  { id: "elapsed-train", prompt: "Pociąg odjechał o 13:47 i przyjechał o 16:12. Ile trwała podróż?", fields: [{ id: "hours", label: "Godziny", unit: "h", answer: 2 }, { id: "minutes", label: "Minuty", unit: "min", answer: 25 }], hint: "Od 13:47 do 14:00 jest 13 minut, potem 2 godziny i jeszcze 12 minut." },
  { id: "elapsed-cinema", prompt: "Film zaczął się o 17:35 i trwał 1 godzinę 48 minut. O której się skończył?", fields: [{ id: "hours", label: "Godzina", answer: 19 }, { id: "minutes", label: "Minuta", answer: 23 }], hint: "Dodaj najpierw 1 godzinę, a następnie 48 minut." },
  { id: "elapsed-overnight", prompt: "Nocna podróż rozpoczęła się o 22:50 i skończyła następnego dnia o 1:20. Ile trwała?", fields: [{ id: "hours", label: "Godziny", unit: "h", answer: 2 }, { id: "minutes", label: "Minuty", unit: "min", answer: 30 }], hint: "Od 22:50 do północy jest 1 godzina 10 minut." },
  { id: "elapsed-gap", prompt: "Zajęcia trwają od 10:25 do 12:05, ale obejmują 15 minut przerwy. Ile minut trwa sama nauka?", fields: [{ id: "minutes", label: "Czas nauki", unit: "min", answer: 85 }], hint: "Całość trwa 100 minut. Odejmij przerwę." },
  { id: "elapsed-start", prompt: "Spektakl skończył się o 20:10 i trwał 2 godziny 25 minut. O której się rozpoczął?", fields: [{ id: "hours", label: "Godzina", answer: 17 }, { id: "minutes", label: "Minuta", answer: 45 }], hint: "Cofnij się najpierw o 2 godziny, potem o 25 minut." },
];

export function calendarTimeActivityFromStageId(stageId: string): CalendarTimeActivity {
  if (stageId.includes("calendar-guide")) return "calendar-guide";
  if (stageId.includes("calendar-facts")) return "calendar";
  if (stageId.includes("centuries")) return "centuries";
  if (stageId.includes("weekdays")) return "weekdays";
  if (stageId.includes("conversions")) return "conversions";
  return "elapsed";
}
