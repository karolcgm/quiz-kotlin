export type EverydayReviewActivity = "section-review-practical" | "section-review-data" | "section-review-challenge";

export interface EverydayReviewTask {
  id: string;
  title: string;
  prompt: string;
  answer: string;
  answerLabel: string;
  unit?: string;
  hint: string;
  choices?: string[];
  visual:
    | { kind: "clock"; start: string; end: string }
    | { kind: "calendar"; label: string }
    | { kind: "conversion"; from: string; to: string; factor: string }
    | { kind: "scale"; scale: string; distance: string }
    | { kind: "rounding"; value: string; place: string; markedIndex: number }
    | { kind: "table"; title: string; columns: string[]; rows: Array<{ label: string; values: number[] }> }
    | { kind: "bars"; title: string; labels: string[]; first: number[]; second: number[]; legends: [string, string] }
    | { kind: "line"; title: string; labels: string[]; values: number[] }
    | { kind: "story"; emoji: string; facts: string[] };
}

export const EVERYDAY_REVIEW_PRACTICAL: EverydayReviewTask[] = [
  { id: "time", title: "Czas przejazdu", prompt: "Pociąg odjechał o 13:48 i przyjechał o 16:25. Ile minut trwała podróż?", answer: "157", answerLabel: "157 min", unit: "min", hint: "Policz czas do pełnej godziny, pełne godziny i pozostałe minuty.", visual: { kind: "clock", start: "13:48", end: "16:25" } },
  { id: "century", title: "Wiek wydarzenia", prompt: "W którym wieku miało miejsce wydarzenie z 1863 roku?", answer: "XIX", answerLabel: "XIX wiek", choices: ["XVIII", "XIX", "XX", "XXI"], hint: "Lata od 1801 do 1900 należą do tego samego wieku.", visual: { kind: "calendar", label: "ROK 1863" } },
  { id: "length", title: "Jednostki długości", prompt: "Taśma ma 3,4 m długości. Doklejono jeszcze 85 cm. Ile centymetrów ma teraz cała taśma?", answer: "425", answerLabel: "425 cm", unit: "cm", hint: "Najpierw zamień metry na centymetry.", visual: { kind: "conversion", from: "3,4 m", to: "cm", factor: "· 100" } },
  { id: "mass", title: "Jednostki masy", prompt: "Paczka waży 2 kg 75 g. Ile to gramów?", answer: "2075", answerLabel: "2075 g", unit: "g", hint: "Jeden kilogram to 1000 gramów.", visual: { kind: "conversion", from: "2 kg 75 g", to: "g", factor: "2 · 1000 + 75" } },
  { id: "scale-distance", title: "Odległość w terenie", prompt: "Na mapie w skali 1 : 50 000 trasa ma 7 cm. Ile kilometrów ma w terenie?", answer: "3,5", answerLabel: "3,5 km", unit: "km", hint: "1 cm na tej mapie odpowiada 500 m w terenie.", visual: { kind: "scale", scale: "1 : 50 000", distance: "7 cm" } },
  { id: "scale-name", title: "Jaka to skala?", prompt: "Na planie 1 cm odpowiada 250 m w terenie. Jaki mianownik ma skala 1 : □?", answer: "25000", answerLabel: "1 : 25 000", hint: "Zamień 250 m na centymetry.", visual: { kind: "scale", scale: "1 cm → 250 m", distance: "1 : ?" } },
  { id: "rounding", title: "Zaokrąglanie", prompt: "Zaokrąglij liczbę 48,596 do części setnych.", answer: "48,60", answerLabel: "48,60", hint: "Zachowaj dwie cyfry po przecinku i spójrz na trzecią.", visual: { kind: "rounding", value: "48,596", place: "części setne", markedIndex: 4 } },
];

export const EVERYDAY_REVIEW_DATA: EverydayReviewTask[] = [
  { id: "table-total", title: "Tabela frekwencji", prompt: "Ilu uczniów łącznie było obecnych w klasach VI A i VI B we wtorek?", answer: "49", answerLabel: "49 uczniów", unit: "uczniów", hint: "Odczytaj dwie wartości z kolumny „Wtorek” i dodaj je.", visual: { kind: "table", title: "Obecni uczniowie", columns: ["Poniedziałek", "Wtorek", "Środa"], rows: [{ label: "VI A", values: [23, 24, 22] }, { label: "VI B", values: [24, 25, 23] }] } },
  { id: "bars-difference", title: "Dwa słupki dla kategorii", prompt: "O ile więcej punktów zdobyła drużyna Niebieskich niż Zielonych w rundzie 3?", answer: "7", answerLabel: "7 punktów", unit: "punktów", hint: "Porównaj dwa słupki nad etykietą „Runda 3”.", visual: { kind: "bars", title: "Punkty w turnieju", labels: ["R1", "R2", "R3", "R4"], first: [18, 26, 31, 24], second: [20, 21, 24, 29], legends: ["Niebiescy", "Zieloni"] } },
  { id: "line-rise", title: "Zmiana na wykresie", prompt: "O ile wzrosła liczba wypożyczeń między wtorkiem a czwartkiem?", answer: "18", answerLabel: "18 wypożyczeń", unit: "wypożyczeń", hint: "Odczytaj wartości dla wtorku i czwartku, a potem oblicz różnicę.", visual: { kind: "line", title: "Wypożyczenia hulajnóg", labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."], values: [28, 34, 41, 52, 45] } },
  { id: "table-comparison", title: "Kilka informacji w tabeli", prompt: "O ile większa była łączna sprzedaż w środę niż w poniedziałek?", answer: "17", answerLabel: "17 produktów", unit: "produktów", hint: "Najpierw zsumuj oba rodzaje produktów dla każdego z dwóch dni.", visual: { kind: "table", title: "Sprzedaż w sklepiku", columns: ["Poniedziałek", "Wtorek", "Środa"], rows: [{ label: "Kanapki", values: [34, 42, 47] }, { label: "Soki", values: [21, 26, 25] }] } },
  { id: "line-lowest", title: "Najniższa wartość", prompt: "Którego dnia pomiar był najniższy?", answer: "czwartek", answerLabel: "czwartek", choices: ["poniedziałek", "wtorek", "środa", "czwartek", "piątek"], hint: "Znajdź punkt położony najniżej na wykresie.", visual: { kind: "line", title: "Zużycie energii", labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."], values: [42, 37, 40, 31, 36] } },
];

export const EVERYDAY_REVIEW_CHALLENGE: EverydayReviewTask[] = [
  { id: "trip", title: "Wycieczka na mapie", prompt: "Na mapie w skali 1 : 200 000 odcinki trasy mają 3,5 cm i 4 cm. Ile kilometrów ma cała trasa?", answer: "15", answerLabel: "15 km", unit: "km", hint: "Dodaj długości na mapie. W tej skali 1 cm odpowiada 2 km.", visual: { kind: "story", emoji: "🗺️", facts: ["Skala 1 : 200 000", "Odcinek A: 3,5 cm", "Odcinek B: 4 cm"] } },
  { id: "shopping", title: "Zakupy z kalkulatorem", prompt: "Kilogram orzechów kosztuje 48 zł. Ile kosztuje 375 g orzechów?", answer: "18", answerLabel: "18 zł", unit: "zł", hint: "375 g to 0,375 kg. Pomnóż masę w kilogramach przez cenę za kilogram.", visual: { kind: "story", emoji: "🥜", facts: ["1 kg → 48 zł", "kupiono 375 g"] } },
  { id: "schedule", title: "Plan dnia", prompt: "Zajęcia zaczęły się o 9:35. Trwały 1 godz. 45 min, potem była przerwa 20 min. O której rozpoczęła się następna lekcja?", answer: "11:40", answerLabel: "11:40", choices: ["11:20", "11:40", "11:45", "12:00"], hint: "Dodaj kolejno czas zajęć i czas przerwy.", visual: { kind: "story", emoji: "🕘", facts: ["start: 9:35", "zajęcia: 1 godz. 45 min", "przerwa: 20 min"] } },
  { id: "rounding-estimate", title: "Zaokrąglenie wyniku", prompt: "Kalkulator pokazał 127,846. Zaokrąglij wynik do części dziesiętnych.", answer: "127,8", answerLabel: "127,8", hint: "Zostaw jedną cyfrę po przecinku i sprawdź cyfrę setnych.", visual: { kind: "rounding", value: "127,846", place: "części dziesiętne", markedIndex: 4 } },
  { id: "data-story", title: "Dane i czas", prompt: "W pierwszej godzinie bibliotekę odwiedziło 18 osób, w drugiej 27, a w trzeciej o 9 mniej niż w drugiej. Ile osób odwiedziło bibliotekę w ciągu trzech godzin?", answer: "63", answerLabel: "63 osoby", unit: "osoby", hint: "Najpierw oblicz liczbę osób w trzeciej godzinie.", visual: { kind: "story", emoji: "📚", facts: ["1. godzina: 18", "2. godzina: 27", "3. godzina: o 9 mniej niż w 2."] } },
];

export function everydayReviewTasks(activity: EverydayReviewActivity): EverydayReviewTask[] {
  if (activity === "section-review-practical") return EVERYDAY_REVIEW_PRACTICAL;
  if (activity === "section-review-data") return EVERYDAY_REVIEW_DATA;
  return EVERYDAY_REVIEW_CHALLENGE;
}
