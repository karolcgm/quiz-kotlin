import type { Subject } from "@/types/curriculum";

export const subjects: Subject[] = [
  {
    id: "early-education",
    name: "Edukacja wczesnoszkolna",
    description: "Zintegrowane pomoce dla klas 1-3.",
    grades: [1, 2, 3],
  },
  {
    id: "math",
    name: "Matematyka",
    description: "Interaktywne symulacje matematyczne dla klas 1-8.",
    grades: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: "science",
    name: "Przyroda",
    description: "Podstawowe doświadczenia i wizualizacje przyrodnicze.",
    grades: [4],
  },
  {
    id: "biology",
    name: "Biologia",
    description: "Modele organizmów, układów i procesów biologicznych.",
    grades: [5, 6, 7, 8],
  },
  {
    id: "geography",
    name: "Geografia",
    description: "Mapy, skale, kierunki, klimat i zjawiska geograficzne.",
    grades: [5, 6, 7, 8],
  },
  {
    id: "physics",
    name: "Fizyka",
    description: "Symulacje ruchu, sił, energii, światła i elektryczności.",
    grades: [7, 8],
  },
  {
    id: "chemistry",
    name: "Chemia",
    description: "Modele cząsteczek, reakcje i podstawowe obliczenia chemiczne.",
    grades: [7, 8],
  },
  {
    id: "history",
    name: "Historia",
    description: "Osie czasu, mapy historyczne i wydarzenia.",
    grades: [4, 5, 6, 7, 8],
  },
  {
    id: "polish",
    name: "Język polski",
    description: "Narzędzia do gramatyki, ortografii, części mowy i analizy tekstu.",
    grades: [4, 5, 6, 7, 8],
  },
];
