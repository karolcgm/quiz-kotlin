export type AgileGameTemplate = {
  id: "zoo-sprint" | "mars-mission" | "game-studio" | "future-city";
  title: string;
  emoji: string;
  description: string;
  mission: string;
  roles: string[];
  cards: string[];
  image: string;
  finalImage?: string;
  successImage?: string;
  crisisImage?: string;
};

export const AGILE_GAME_TEMPLATES: AgileGameTemplate[] = [
  { id: "zoo-sprint", title: "Zoo Sprint", emoji: "🦁", description: "Zbuduj ogród zoologiczny, który zachwyci odwiedzających — mimo zmian planu.", mission: "W każdym sprincie wybierzcie, co dostarczacie najpierw: wybiegi, opiekę, trasy lub atrakcje.", roles: ["Afrykarium", "Akwarium", "Ptaszarnia", "Insektarium i media"], cards: ["Wybieg dla pingwinów", "Bezpieczna ścieżka", "Punkt karmienia", "Strefa ciszy", "Mapa dla rodzin", "Dom małp"], image: "/agile-games/zoo-sprint.png", finalImage: "/agile-games/zoo-success.png", successImage: "/agile-games/zoo-success.png", crisisImage: "/agile-games/zoo-crisis.png" },
  { id: "mars-mission", title: "Misja Mars", emoji: "🚀", description: "Zaprojektuj bazę na Marsie, dbając o energię, bezpieczeństwo i załogę.", mission: "Ustalcie najważniejszy element kolejnej wersji bazy i uzasadnijcie decyzję.", roles: ["Głos załogi", "Nawigator sprintu", "Inżynier", "Kontroler bezpieczeństwa"], cards: ["Moduł tlenu", "Panel energii", "Szklarnia", "Łazik", "Schron burzowy", "Łącze z Ziemią"], image: "/agile-games/mars-mission.png", finalImage: "/agile-games/mars-finale.png" },
  { id: "game-studio", title: "Studio Gier", emoji: "🎮", description: "Stwórzcie grę, do której chce się wracać — testując pomysły małymi krokami.", mission: "Wybierzcie funkcję gry na sprint i przygotujcie krótkie wyjaśnienie, dla kogo ją robicie.", roles: ["Głos gracza", "Reżyser sprintu", "Twórca", "Tester zabawy"], cards: ["Poziom startowy", "Bohater", "Zasada punktów", "Przeciwnik", "Muzyka", "Samouczek"], image: "/agile-games/game-studio.png", finalImage: "/agile-games/game-studio-finale.png" },
  { id: "future-city", title: "Miasto Przyszłości", emoji: "🏙️", description: "Zaprojektuj miasto wygodne dla mieszkańców, a nie tylko efektowne na plakacie.", mission: "Ustalcie, która potrzeba mieszkańców ma pierwszeństwo w tym sprincie.", roles: ["Głos mieszkańców", "Koordynator sprintu", "Projektant", "Audytor dostępności"], cards: ["Park kieszonkowy", "Bezpieczne przejście", "Biblioteka", "Trasa rowerowa", "Punkt pomocy", "Zielony dach"], image: "/agile-games/future-city.png", finalImage: "/agile-games/future-city-finale.png" },
];

export function getAgileGameTemplate(id: string) {
  return AGILE_GAME_TEMPLATES.find((template) => template.id === id) ?? null;
}
