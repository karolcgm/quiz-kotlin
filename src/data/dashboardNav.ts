export interface MainNavLink {
  href: string;
  label: string;
  description?: string;
}

/** Nawigacja nauczyciela — spec §8.1 (max 7 pozycji) */
export const teacherMainNav: MainNavLink[] = [
  { href: "/nauczyciel", label: "Dzisiaj", description: "Pulpit operacyjny" },
  { href: "/nauczyciel/program", label: "Program", description: "Mapa klasy V" },
  { href: "/nauczyciel/lekcje", label: "Lekcje", description: "Biblioteka pakietów" },
  { href: "/nauczyciel/prace", label: "Prace", description: "Testy, zadania, druk" },
  { href: "/nauczyciel/uczniowie", label: "Klasy", description: "Uczniowie i zaproszenia" },
  { href: "/nauczyciel/postepy", label: "Postępy", description: "Wyniki i dziennik" },
  { href: "/nauczyciel/powiadomienia", label: "Wiadomości", description: "Komunikacja" },
];

/** Nawigacja ucznia — spec §8.2 */
export const studentMainNav: MainNavLink[] = [
  { href: "/uczen", label: "Teraz", description: "Bieżące zadania" },
  { href: "/uczen/testy", label: "Do zrobienia", description: "Aktywne prace" },
  { href: "/uczen/szybki-test", label: "Ćwiczę", description: "Powtórki" },
  { href: "/uczen/postepy", label: "Moje postępy", description: "Mapa umiejętności" },
  { href: "/uczen/powiadomienia", label: "Wiadomości", description: "Powiadomienia" },
];

/** Stare trasy — mapa przejściowa (WP-060) */
export const teacherLegacyRoutes: Record<string, string> = {
  "/nauczyciel/testy": "/nauczyciel/prace",
  "/nauczyciel/zadania": "/nauczyciel/prace",
  "/nauczyciel/wyniki": "/nauczyciel/postepy",
  "/nauczyciel/dziennik": "/nauczyciel/postepy",
};
