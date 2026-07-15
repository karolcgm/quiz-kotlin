import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { GEOMETRY_FEEDBACK_CODES } from "@/types/geometry";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightTarget,
  DiagnosticSolution,
  LessonGradeResult,
} from "@/types/diagnosticFeedback";
import type { GeometryFeedbackCode } from "@/types/geometry";

const COPY: Record<GeometryFeedbackCode, DiagnosticFeedbackCopy> = {
  GEO_DEGENERATE: {
    area: "Co najmniej dwa wierzchołki zlały się albo figura ma zerowy wymiar.",
    guidingQuestion: "Które punkty trzeba rozdzielić, aby każdy bok miał dodatnią długość?",
    visualHint: "Punkty wymagające rozdzielenia mają symbol ostrzegawczy △ i gruby, przerywany obrys.",
    analogousExample: "Gdy punkty P i Q leżą w tym samym miejscu, odcinek PQ ma długość zero; przesuń jeden z nich.",
  },
  GEO_SELF_INTERSECTION: {
    area: "Dwa niekolejne boki przecinają się wewnątrz rysunku.",
    guidingQuestion: "Który wierzchołek można przesunąć, aby wskazane boki przestały się krzyżować?",
    visualHint: "Miejsce przecięcia ma znak ×, a oba boki ten sam symbol ostrzegawczy.",
    analogousExample: "W czworokącie ABCD boki AB i CD nie mogą przecinać się w środku figury bazowej.",
  },
  GEO_NOT_PARALLEL: {
    area: "Wymagana para boków ma różne kierunki.",
    guidingQuestion: "Jak przesunąć koniec drugiego odcinka bez zmiany jego kierunku względem pierwszego?",
    visualHint: "Porównaj identyczne groty ∥ na obu bokach i odczytaj różnicę kierunków.",
    analogousExample: "Odcinki o wektorach (4, 2) i (8, 4) są równoległe, bo ich kierunki są proporcjonalne.",
  },
  GEO_NOT_PERPENDICULAR: {
    area: "Wskazany kąt nie ma 90°.",
    guidingQuestion: "W którą stronę przesunąć koniec ramienia, aby pojawił się kwadrat kąta prostego?",
    visualHint: "Kwadrat □ pokazuje cel 90°, a etykieta obok podaje aktualną miarę.",
    analogousExample: "Wektory (3, 0) i (0, 5) są prostopadłe, bo tworzą kąt 90°.",
  },
  GEO_WRONG_VERTEX: {
    area: "Poruszono inny wierzchołek niż wskazany w poleceniu.",
    guidingQuestion: "Która litera znajduje się przy uchwycie, który masz teraz przesunąć?",
    visualHint: "Właściwy uchwyt ma obrys i etykietę z literą; dotychczasowy stan figury został zachowany.",
    analogousExample: "Jeśli polecenie mówi „przesuń C”, wybierz punkt C, a nie sąsiedni punkt B.",
  },
  ANGLE_CENTER_MISALIGNED: {
    area: "Środek kątomierza nie leży na wierzchołku mierzonego kąta.",
    guidingQuestion: "Gdzie powinien znaleźć się punkt środkowy kątomierza?",
    visualHint: "Krótka linia prowadzi od środka kątomierza do właściwego wierzchołka.",
    analogousExample: "Aby zmierzyć ∠PQR, środek kątomierza ustaw dokładnie na punkcie Q.",
  },
  ANGLE_WRONG_SCALE: {
    area: "Odczyt pochodzi z drugiej skali kątomierza.",
    guidingQuestion: "Przy którym zerze leży ramię początkowe kąta?",
    visualHint: "Podświetlone zero i ramię początkowe wskazują właściwą skalę wewnętrzną albo zewnętrzną.",
    analogousExample: "Jeśli ramię zaczyna się po prawej stronie, czytaj skalę rozpoczynającą się tam od 0°.",
  },
  TRIANGLE_INEQUALITY: {
    area: "Dwa krótsze boki nie są razem dłuższe od najdłuższego.",
    guidingQuestion: "Czy końce dwóch krótszych odcinków spotkają się po ułożeniu wzdłuż najdłuższego?",
    visualHint: "Dwa krótsze odcinki są ułożone kolejno przy najdłuższym, dzięki czemu widać brak domknięcia.",
    analogousExample: "Odcinki 3, 4 i 8 nie tworzą trójkąta, bo 3 + 4 nie jest większe od 8.",
  },
  GEO_CLASSIFICATION_EVIDENCE: {
    area: "Nazwa figury jest poprawna, ale brakuje wskazania cechy, która ją uzasadnia.",
    guidingQuestion: "Które boki, kąty albo przekątne potwierdzają podaną nazwę?",
    visualHint: "Zaznacz odpowiednią parę boków lub kątów wspólnym symbolem i wzorem linii.",
    analogousExample: "Dla prostokąta wskaż cztery kąty proste; sama nazwa bez tej cechy nie jest pełnym dowodem.",
  },
};

const SOLUTIONS: Record<GeometryFeedbackCode, DiagnosticSolution> = {
  GEO_DEGENERATE: { steps: ["Wybierz jeden ze złączonych punktów.", "Przesuń go co najmniej o jeden krok siatki.", "Sprawdź, czy każdy bok ma dodatnią długość."] },
  GEO_SELF_INTERSECTION: { steps: ["Znajdź znak ×.", "Odczytaj nazwy dwóch wskazanych boków.", "Przesuń ich wspólny sąsiedni wierzchołek tak, aby boki już się nie przecinały."] },
  GEO_NOT_PARALLEL: { steps: ["Odczytaj kierunek boku wzorcowego.", "Zachowaj ten sam stosunek zmiany x do zmiany y.", "Przesuń koniec drugiego boku i sprawdź symbol ∥."] },
  GEO_NOT_PERPENDICULAR: { steps: ["Znajdź wierzchołek kąta.", "Ustaw drugie ramię pod kątem 90° do pierwszego.", "Sprawdź, czy pojawił się symbol □."] },
  GEO_WRONG_VERTEX: { steps: ["Odczytaj literę w poleceniu.", "Wybierz uchwyt z tą samą literą.", "Wykonaj ruch strzałkami albo przyciskiem „Umieść”."] },
  ANGLE_CENTER_MISALIGNED: { steps: ["Wskaż wierzchołek kąta.", "Przesuń środek kątomierza na ten punkt.", "Dopiero potem wyrównaj linię bazową z ramieniem."] },
  ANGLE_WRONG_SCALE: { steps: ["Znajdź ramię początkowe.", "Wybierz zero po tej samej stronie.", "Czytaj wartości rosnące od wybranego zera."] },
  TRIANGLE_INEQUALITY: { steps: ["Uporządkuj boki od najkrótszego.", "Dodaj długości dwóch krótszych.", "Trójkąt istnieje tylko wtedy, gdy suma jest większa od najdłuższego boku."] },
  GEO_CLASSIFICATION_EVIDENCE: { steps: ["Wypisz cechę potrzebną dla nazwy figury.", "Wskaż konkretne boki lub kąty, które ją spełniają.", "Połącz nazwę z tym dowodem w jednym zdaniu."] },
};

function highlight(
  id: string,
  memberIds: string[],
  label: string,
  options: Pick<DiagnosticHighlightTarget, "kind" | "pattern" | "symbol" | "accent">,
): DiagnosticHighlightTarget {
  return { id, memberIds, label, state: "attention", ...options };
}

export function geometryDiagnosticCopy(code: GeometryFeedbackCode): DiagnosticFeedbackCopy {
  return COPY[code];
}

export function geometryDiagnosticSolution(code: GeometryFeedbackCode): DiagnosticSolution {
  return SOLUTIONS[code];
}

export function geometryDiagnosticHighlights(
  code: GeometryFeedbackCode,
  memberIds: string[] = [],
): DiagnosticHighlightTarget[] {
  const members = memberIds.length > 0 ? memberIds : ["geometry-model"];
  switch (code) {
    case GEOMETRY_FEEDBACK_CODES.degenerate:
      return [highlight("geometry-degenerate", members, "Złączone albo zerowe wierzchołki", { kind: "vertex", pattern: "dashed", symbol: "△", accent: "amber" })];
    case GEOMETRY_FEEDBACK_CODES.selfIntersection:
      return [highlight("geometry-self-intersection", members, "Przecinające się boki", { kind: "edge", pattern: "double", symbol: "×", accent: "amber" })];
    case GEOMETRY_FEEDBACK_CODES.notParallel:
      return [highlight("geometry-parallel-pair", members, "Para boków, która ma być równoległa", { kind: "pair", pattern: "double", symbol: "∥", accent: "violet" })];
    case GEOMETRY_FEEDBACK_CODES.notPerpendicular:
      return [highlight("geometry-perpendicular-pair", members, "Para boków, która ma tworzyć 90°", { kind: "pair", pattern: "solid", symbol: "□", accent: "cyan" })];
    case GEOMETRY_FEEDBACK_CODES.wrongVertex:
      return [highlight("geometry-right-vertex", members, "Właściwy wierzchołek do przesunięcia", { kind: "vertex", pattern: "solid", symbol: memberIds[0]?.slice(0, 1).toUpperCase() || "A", accent: "indigo" })];
    case GEOMETRY_FEEDBACK_CODES.angleCenterMisaligned:
      return [highlight("geometry-protractor-center", members, "Środek kątomierza i wierzchołek kąta", { kind: "pair", pattern: "dashed", symbol: "⊙", accent: "cyan" })];
    case GEOMETRY_FEEDBACK_CODES.angleWrongScale:
      return [highlight("geometry-protractor-scale", members, "Ramię początkowe i właściwe zero", { kind: "pair", pattern: "dotted", symbol: "0°", accent: "violet" })];
    case GEOMETRY_FEEDBACK_CODES.triangleInequality:
      return [highlight("geometry-triangle-sides", members, "Dwa krótsze boki i najdłuższy bok", { kind: "edge", pattern: "dashed", symbol: ">", accent: "amber" })];
    default:
      return [highlight("geometry-classification-evidence", members, "Cecha uzasadniająca klasyfikację", { kind: "pair", pattern: "double", symbol: "?", accent: "indigo" })];
  }
}

export function createGeometryDiagnosticResult(
  code: GeometryFeedbackCode,
  options: { memberIds?: string[]; maxScore?: number } = {},
): {
  result: LessonGradeResult;
  copy: DiagnosticFeedbackCopy;
  highlights: DiagnosticHighlightTarget[];
  solution: DiagnosticSolution;
} {
  const partial = code === GEOMETRY_FEEDBACK_CODES.classificationEvidence;
  const maxScore = partial ? Math.max(2, options.maxScore ?? 2) : (options.maxScore ?? 1);
  return {
    result: createLessonGradeResult({
      status: partial ? "partially-correct" : "incorrect",
      score: partial ? Math.max(1, maxScore - 1) : 0,
      maxScore,
      errorCodes: [code],
      feedbackKey: `geometry.${code.toLocaleLowerCase("en-US")}`,
    }),
    copy: COPY[code],
    highlights: geometryDiagnosticHighlights(code, options.memberIds),
    solution: SOLUTIONS[code],
  };
}
