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

export function getTeacherContextNav(classId?: string): MainNavLink[] {
  if (!classId) {
    return [
      { href: "/nauczyciel", label: "Start", description: "Przegląd pracy" },
      { href: "/nauczyciel/uczniowie", label: "Klasy", description: "Uczniowie i zaproszenia" },
      { href: "/nauczyciel/lekcje", label: "Materiały", description: "Prezentacje i wydruki" },
      { href: "/nauczyciel/gry-klasowe", label: "Gry klasowe", description: "Lobby i rozgrywki" },
      { href: "/nauczyciel/powiadomienia", label: "Wiadomości", description: "Komunikacja" },
    ];
  }

  const query = `?classId=${encodeURIComponent(classId)}`;
  return [
    { href: `/nauczyciel${query}`, label: "Dzisiaj", description: "Bieżąca klasa" },
    { href: `/nauczyciel/program${query}`, label: "Plan", description: "Tematy i realizacja" },
    { href: `/nauczyciel/uczniowie${query}`, label: "Uczniowie", description: "Klasa i postępy" },
    { href: `/nauczyciel/lekcje${query}`, label: "Aktywności", description: "Live, kartkówki, druk" },
    { href: `/nauczyciel/gry-klasowe${query}`, label: "Gry klasowe", description: "Uruchom grę dla klasy" },
  ];
}

/** Nawigacja ucznia — spec §8.2 */
export const studentMainNav: MainNavLink[] = [
  { href: "/uczen", label: "Teraz", description: "Bieżące zadania" },
  { href: "/uczen/plan", label: "Plan nauki", description: "Przerobione lekcje" },
  { href: "/uczen/testy", label: "Do zrobienia", description: "Aktywne prace" },
  { href: "/uczen/szybki-test", label: "Ćwiczę", description: "Powtórki" },
  { href: "/uczen/postepy", label: "Moje postępy", description: "Mapa umiejętności" },
  { href: "/uczen/klaser", label: "Klaser", description: "Naklejki i nagrody" },
  { href: "/uczen/powiadomienia", label: "Wiadomości", description: "Powiadomienia" },
];

/** Stare trasy — mapa przejściowa (WP-060) */
export const teacherLegacyRoutes: Record<string, string> = {
  "/nauczyciel/testy": "/nauczyciel/prace/testy",
  "/nauczyciel/zadania": "/nauczyciel/prace/zadania",
  "/nauczyciel/wyniki": "/nauczyciel/postepy/wyniki",
  "/nauczyciel/dziennik": "/nauczyciel/postepy/dziennik",
};
