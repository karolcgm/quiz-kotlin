export interface DashboardNavLink {
  href?: string;
  label: string;
  description?: string;
  soon?: boolean;
}

export interface DashboardNavCategory {
  title: string;
  links: DashboardNavLink[];
}

export const teacherNavCategories: DashboardNavCategory[] = [
  {
    title: "Panel",
    links: [
      { href: "/nauczyciel", label: "Strona główna" },
      { href: "/nauczyciel/zadania", label: "Dzisiejsze zadania" },
      { href: "/nauczyciel/wyniki", label: "Ostatnie wyniki" },
      { href: "/nauczyciel/wyniki", label: "Prośby o poprawę" },
    ],
  },
  {
    title: "Skróty",
    links: [
      { href: "/nauczyciel/testy/nowy", label: "Nowy test" },
      { href: "/nauczyciel/powiadomienia/wyslij", label: "Wyślij wiadomość" },
      { href: "/nauczyciel/uczniowie", label: "Dodaj klasę" },
    ],
  },
  {
    title: "Materiały",
    links: [
      { href: "/symulacje", label: "Katalog symulacji" },
      { label: "Moje materiały", soon: true },
      { label: "Ulubione", soon: true },
      { label: "Scenariusze lekcji", soon: true },
    ],
  },
  {
    title: "Testy",
    links: [
      { href: "/nauczyciel/testy", label: "Wszystkie testy" },
      { href: "/nauczyciel/testy/nowy", label: "Nowy test" },
      { label: "Testy robocze", soon: true },
      { href: "/nauczyciel/testy", label: "Opublikowane" },
      { label: "Archiwum", soon: true },
    ],
  },
  {
    title: "Zadania",
    links: [
      { href: "/nauczyciel/zadania", label: "Przypisania" },
      { href: "/nauczyciel/zadania", label: "Wysłane klasom" },
      { href: "/nauczyciel/zadania", label: "Terminy" },
      { href: "/nauczyciel/wyniki", label: "Aktywne poprawy" },
    ],
  },
  {
    title: "Uczniowie",
    links: [{ href: "/nauczyciel/uczniowie", label: "Szkoły, klasy i uczniowie" }],
  },
  {
    title: "Wyniki",
    links: [
      { href: "/nauczyciel/wyniki", label: "Dziennik wyników" },
      { href: "/nauczyciel/wyniki", label: "Oceny i POPRAW" },
      { label: "Umiejętności", soon: true },
      { label: "Eksport PDF/CSV", soon: true },
    ],
  },
  {
    title: "Komunikacja",
    links: [
      { href: "/nauczyciel/powiadomienia", label: "Powiadomienia" },
      { href: "/nauczyciel/powiadomienia/wyslij", label: "Wyślij wiadomość" },
    ],
  },
];

export const studentNavCategories: DashboardNavCategory[] = [
  {
    title: "Panel",
    links: [
      { href: "/uczen", label: "Co mam zrobić?" },
      { href: "/uczen/wyniki", label: "Ostatnia ocena" },
      { href: "/uczen/powiadomienia", label: "Wiadomości od nauczyciela" },
    ],
  },
  {
    title: "Zadania",
    links: [{ href: "/uczen/testy", label: "Testy od nauczyciela" }],
  },
  {
    title: "Nauka",
    links: [
      { href: "/uczen/szybki-test", label: "Szybki test" },
      { href: "/symulacje", label: "Symulacje" },
    ],
  },
  {
    title: "Wyniki",
    links: [
      { href: "/uczen/wyniki", label: "Oceny" },
      { href: "/uczen/postepy", label: "Postęp i umiejętności" },
    ],
  },
  {
    title: "Wiadomości",
    links: [{ href: "/uczen/powiadomienia", label: "Powiadomienia" }],
  },
];
