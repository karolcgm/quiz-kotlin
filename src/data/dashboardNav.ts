export interface DashboardNavLink {
  href: string;
  label: string;
  description?: string;
}

export interface DashboardNavCategory {
  title: string;
  links: DashboardNavLink[];
}

export const teacherNavCategories: DashboardNavCategory[] = [
  {
    title: "Panel",
    links: [{ href: "/nauczyciel", label: "Strona główna", description: "Podsumowanie i skróty" }],
  },
  {
    title: "Testy",
    links: [
      { href: "/nauczyciel/testy", label: "Lista testów", description: "Opublikowane sprawdziany" },
      { href: "/nauczyciel/testy/nowy", label: "Nowy test", description: "Composer widgetów" },
      { href: "/nauczyciel/zadania", label: "Przypisania", description: "Wysłane zadania uczniom" },
    ],
  },
  {
    title: "Uczniowie",
    links: [
      { href: "/nauczyciel/uczniowie", label: "Klasy i zaproszenia", description: "Grupy i linki" },
      { href: "/nauczyciel/wyniki", label: "Wyniki i POPRAW", description: "Oceny i poprawy" },
    ],
  },
  {
    title: "Komunikacja",
    links: [
      { href: "/nauczyciel/powiadomienia", label: "Powiadomienia", description: "Dzwonek i historia" },
      {
        href: "/nauczyciel/powiadomienia/wyslij",
        label: "Wyślij wiadomość",
        description: "Do grupy lub ucznia",
      },
    ],
  },
];

export const studentNavCategories: DashboardNavCategory[] = [
  {
    title: "Panel",
    links: [{ href: "/uczen", label: "Strona główna", description: "Twój panel ucznia" }],
  },
  {
    title: "Nauka",
    links: [
      { href: "/uczen/testy", label: "Testy od nauczyciela", description: "Zadania do wykonania" },
      { href: "/uczen/szybki-test", label: "Szybki test", description: "Samodzielne ćwiczenia" },
    ],
  },
  {
    title: "Wyniki",
    links: [
      { href: "/uczen/wyniki", label: "Moje oceny", description: "Oceny i prośby o poprawę" },
      { href: "/uczen/postepy", label: "Postępy", description: "Umiejętności krok po kroku" },
    ],
  },
  {
    title: "Komunikacja",
    links: [
      { href: "/uczen/powiadomienia", label: "Powiadomienia", description: "Wiadomości od nauczyciela" },
    ],
  },
];
