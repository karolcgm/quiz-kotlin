export interface MainNavLink {
  href: string;
  label: string;
}

export const teacherMainNav: MainNavLink[] = [
  { href: "/nauczyciel", label: "Panel" },
  { href: "/symulacje", label: "Materiały" },
  { href: "/nauczyciel/testy", label: "Testy" },
  { href: "/nauczyciel/zadania", label: "Zadania" },
  { href: "/nauczyciel/uczniowie", label: "Uczniowie" },
  { href: "/nauczyciel/wyniki", label: "Wyniki" },
  { href: "/nauczyciel/dziennik", label: "Dziennik" },
  { href: "/nauczyciel/powiadomienia", label: "Komunikacja" },
];

export const studentMainNav: MainNavLink[] = [
  { href: "/uczen", label: "Panel" },
  { href: "/uczen/testy", label: "Zadania" },
  { href: "/uczen/szybki-test", label: "Nauka" },
  { href: "/uczen/wyniki", label: "Wyniki" },
  { href: "/uczen/powiadomienia", label: "Wiadomości" },
];
