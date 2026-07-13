import { getAgileGameTemplate } from "@/lib/agileGames/catalog";

export type EngineTask = { id: number; role: string; title: string; cost: number; visitors: number; good: string; bad?: string };
export type EngineCrisis = { id: string; title: string; body: string; fixes: number[]; penalty: number; consequence: string };

const content = {
  "mars-mission": {
    labels: { metric: "gotowość misji", people: "członków załogi" },
    tasks: [["Moduł tlenu", "Zapas filtrów", "Test szczelności"], ["Panel energii", "Akumulator burzowy", "Diagnostyka zasilania"], ["Szklarnia", "Recykling wody", "Zapasy żywności"], ["Schron burzowy", "Łącze z Ziemią", "Ćwiczenie ewakuacji"]],
    crises: ["Burza pyłowa zbliża się do bazy", "Spada poziom tlenu", "Łącze z Ziemią milczy", "Awaria energii ogranicza moduły"],
  },
  "game-studio": {
    labels: { metric: "aktywni gracze", people: "graczy" },
    tasks: [["Czytelny samouczek", "Test pierwszych 5 minut", "Przycisk pomocy"], ["Płynne sterowanie", "Naprawa błędów", "Szybkie ładowanie"], ["Poziom dla początkujących", "Balans punktów", "Dostępne opcje"], ["Test z graczami", "Odpowiedź na opinie", "Plan aktualizacji"]],
    crises: ["Gracze gubią się po starcie", "Nowa wersja ma poważny błąd", "Recenzje wskazują na nudę", "Serwery nie wytrzymują premiery"],
  },
  "future-city": {
    labels: { metric: "zadowoleni mieszkańcy", people: "mieszkańców" },
    tasks: [["Bezpieczne przejście", "Przystanek bez barier", "Oświetlenie ulic"], ["Park kieszonkowy", "Zielony dach", "Punkt wody"], ["Trasa rowerowa", "Biblioteka osiedlowa", "Punkt pomocy"], ["Konsultacje z mieszkańcami", "Mapa dostępności", "Dyżur projektanta"]],
    crises: ["Ulewa zalewa ważne przejście", "Seniorzy nie mogą dotrzeć do usług", "Mieszkańcy protestują przeciw hałasowi", "Fala upałów przeciąża osiedle"],
  },
} as const;

export function isEngineGame(templateId: string): templateId is keyof typeof content { return templateId in content; }

export function getEngineGame(templateId: string) {
  if (!isEngineGame(templateId)) return null;
  const source = content[templateId]; const template = getAgileGameTemplate(templateId)!;
  const tasks: EngineTask[] = source.tasks.flatMap((roleTasks, roleIndex) => Array.from({ length: 15 }, (_, index) => {
    const title = roleTasks[index % roleTasks.length]; const id = (Object.keys(content).indexOf(templateId) + 5) * 100 + roleIndex * 20 + index + 1;
    const visitors = [8, 5, 3, -2, 6][index % 5];
    return { id, role: template.roles[roleIndex], title, cost: [5, 8, 11, 4, 7][index % 5], visitors, good: `${title} dało zespołowi konkretny postęp i zwiększyło ${source.labels.metric}.`, bad: `${title} było drogą na skróty: zespół zapłacił zaufaniem odbiorców.` };
  }));
  const crises: EngineCrisis[] = source.crises.map((title, index) => ({ id: `${templateId}-${index + 1}`, title, body: "Zespół musi najpierw zabezpieczyć realną potrzebę, a dopiero potem rozwijać atrakcyjne dodatki.", fixes: tasks.filter(task => task.role === template.roles[index]).slice(0, 3).map(task => task.id), penalty: 12 + index * 2, consequence: `Pominięty kryzys: ${title.toLowerCase()}. Spadło ${source.labels.metric} i zaufanie do planu.` }));
  return { ...template, ...source.labels, tasks, crises, image: template.image };
}
