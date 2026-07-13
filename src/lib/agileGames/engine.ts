import { getAgileGameTemplate } from "@/lib/agileGames/catalog";

export type EngineTask = { id: number; role: string; title: string; cost: number; visitors: number; good: string; bad?: string };
export type EngineCrisis = { id: string; title: string; body: string; fixes: number[]; penalty: number; consequence: string };

const content = {
  "mars-mission": {
    labels: { metric: "gotowość misji", people: "członków załogi" },
    tasks: [["Rozmowa z załogą", "Dziennik samopoczucia", "Plan snu na stacji", "Strefa odpoczynku", "Posiłek na zmianie", "Łącze z rodzinami", "Wspólne ćwiczenia", "Plan dyżurów", "Wsparcie psychologiczne", "Zgłoszenie potrzeb", "Próba komunikacji", "Kącik prywatności", "Instrukcja dla nowych osób", "Ocena obciążenia pracą", "Retrospektywa załogi"], ["Plan kolejnego dnia", "Kolejność zadań", "Tablica misji", "Rezerwa czasowa", "Odprawa poranna", "Podział zmian", "Mapa priorytetów", "Przegląd ryzyka", "Plan lądowania", "Konsultacja z Ziemią", "Lista zależności", "Komunikat dla zespołu", "Próba procedury", "Przegląd postępu", "Podsumowanie sprintu"], ["Moduł tlenu", "Zapas filtrów", "Test szczelności", "Panel energii", "Akumulator burzowy", "Diagnostyka zasilania", "Szklarnia", "Recykling wody", "Zapasy żywności", "Naprawa łazika", "Czujnik temperatury", "System odzysku wody", "Kalibracja anteny", "Oświetlenie upraw", "Zapas części"], ["Schron burzowy", "Ćwiczenie ewakuacji", "Alarm pyłowy", "Kontrola kombinezonów", "Zamknięcie śluzy", "Apteczka misji", "Próbny alarm pożarowy", "Zabezpieczenie zapasów", "Kontrola promieniowania", "Trasa ewakuacyjna", "Przegląd gaśnic", "Bezpieczny magazyn", "Checklista startowa", "Test łączności awaryjnej", "Raport bezpieczeństwa"]],
    crises: ["Burza pyłowa zbliża się do bazy", "Spada poziom tlenu", "Łącze z Ziemią milczy", "Awaria energii ogranicza moduły"],
  },
  "game-studio": {
    labels: { metric: "aktywni gracze", people: "graczy" },
    tasks: [["Wywiad z graczem", "Ankieta po rozgrywce", "Mapa potrzeb gracza", "Opis grupy docelowej", "Sesja obserwacji", "Pytanie o trudność", "Pytanie o ulubiony moment", "Zbieranie opinii", "Test pierwszych pięciu minut", "Wywiad z nowym graczem", "Analiza rezygnacji", "Karta persony", "Porównanie oczekiwań", "Lista barier", "Podsumowanie feedbacku"], ["Plan sprintu", "Tablica zadań", "Kolejność funkcji", "Rezerwa na poprawki", "Przegląd celu wersji", "Spotkanie zespołu", "Harmonogram testów", "Decyzja o zakresie", "Opis wersji demo", "Przegląd postępu", "Lista ryzyk", "Plan premiery", "Priorytet dla błędów", "Retrospektywa zespołu", "Plan aktualizacji"], ["Czytelny samouczek", "Płynne sterowanie", "Poziom dla początkujących", "Balans punktów", "Projekt bohatera", "Zasada nagród", "Pierwszy przeciwnik", "Wybór muzyki", "Ekran pauzy", "Mapa poziomu", "Tryb współpracy", "Dostępne opcje", "Szybkie ładowanie", "Efekty dźwiękowe", "Finał poziomu"], ["Zgłoszenie błędu", "Test z graczami", "Sprawdzenie wydajności", "Test sterowania", "Test samouczka", "Test dostępności", "Test na telefonie", "Próba serwera", "Odtworzenie błędu", "Lista poprawek", "Kontrola balansu", "Test poziomu", "Przegląd opinii", "Kontrola wersji", "Raport jakości"]],
    crises: ["Gracze gubią się po starcie", "Nowa wersja ma poważny błąd", "Recenzje wskazują na nudę", "Serwery nie wytrzymują premiery"],
  },
  "future-city": {
    labels: { metric: "zadowoleni mieszkańcy", people: "mieszkańców" },
    tasks: [["Spotkanie z mieszkańcami", "Ankieta osiedlowa", "Spacer badawczy", "Rozmowa z seniorami", "Głos dzieci", "Mapa codziennych tras", "Dyżur konsultacyjny", "Skrzynka pomysłów", "Wywiad z rodzicem", "Zgłoszenie przeszkody", "Pytanie o bezpieczeństwo", "Ocena hałasu", "Przegląd potrzeb", "Konsultacje online", "Podsumowanie głosów"], ["Plan dzielnicy", "Tablica inwestycji", "Kolejność prac", "Harmonogram remontu", "Rezerwa na pogodę", "Odprawa zespołu", "Mapa priorytetów", "Plan komunikacji", "Uzgodnienie z mieszkańcami", "Przegląd budżetu", "Lista ryzyk", "Podział etapów", "Przegląd postępu", "Plan otwarcia", "Retrospektywa projektu"], ["Park kieszonkowy", "Bezpieczne przejście", "Przystanek bez barier", "Oświetlenie ulic", "Trasa rowerowa", "Biblioteka osiedlowa", "Punkt pomocy", "Zielony dach", "Punkt wody", "Ławki w cieniu", "Ogród społeczny", "Stojaki rowerowe", "Plac zabaw", "Ścieżka spacerowa", "Miejska toaleta"], ["Mapa dostępności", "Test przejścia z wózkiem", "Audyt chodnika", "Pomiar hałasu", "Kontrola oświetlenia", "Próba dojścia do biblioteki", "Ocena przystanku", "Test trasy rowerowej", "Zgłoszenie bariery", "Przegląd oznaczeń", "Test przejścia dla seniora", "Sprawdzenie rampy", "Ocena zieleni", "Kontrola bezpieczeństwa", "Raport dostępności"]],
    crises: ["Ulewa zalewa ważne przejście", "Seniorzy nie mogą dotrzeć do usług", "Mieszkańcy protestują przeciw hałasowi", "Fala upałów przeciąża osiedle"],
  },
} as const;

export function isEngineGame(templateId: string): templateId is keyof typeof content { return templateId in content; }

export function getEngineGame(templateId: string) {
  if (!isEngineGame(templateId)) return null;
  const source = content[templateId]; const template = getAgileGameTemplate(templateId)!;
  const tasks: EngineTask[] = source.tasks.flatMap((roleTasks, roleIndex) => Array.from({ length: 15 }, (_, index) => {
    const title = roleTasks[index]; const id = (Object.keys(content).indexOf(templateId) + 5) * 100 + roleIndex * 20 + index + 1;
    const visitors = [8, 5, 3, -2, 6][index % 5];
    return { id, role: template.roles[roleIndex], title, cost: [5, 8, 11, 4, 7][index % 5], visitors, good: `${title} dało zespołowi konkretny postęp i zwiększyło ${source.labels.metric}.`, bad: `${title} było drogą na skróty: zespół zapłacił zaufaniem odbiorców.` };
  }));
  const crises: EngineCrisis[] = source.crises.map((title, index) => ({ id: `${templateId}-${index + 1}`, title, body: "Zespół musi najpierw zabezpieczyć realną potrzebę, a dopiero potem rozwijać atrakcyjne dodatki.", fixes: tasks.filter(task => task.role === template.roles[index]).slice(0, 3).map(task => task.id), penalty: 12 + index * 2, consequence: `Pominięty kryzys: ${title.toLowerCase()}. Spadło ${source.labels.metric} i zaufanie do planu.` }));
  return { ...template, ...source.labels, tasks, crises, image: template.image };
}
