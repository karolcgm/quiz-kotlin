import { getAssessmentWidget } from "@/lib/simulations/registry";
import { SHAPE_LABELS, type BasicShapeKind } from "@/lib/math/basicShapes";
import { ANGLE_KIND_LABELS, type AngleKind } from "@/lib/math/angles";
import { isTriangleClassLabel, TRIANGLE_CLASS_LABELS } from "@/lib/math/triangleClassification";
import type {
  ArithmeticQuestionParams,
  ClockQuestionParams,
  ComparisonQuestionParams,
  ShapeSortQuestionParams,
  SymmetryAxisQuestionParams,
  SymmetryPictureQuestionParams,
  TestWidgetAnswer,
  TestWidgetParams,
} from "@/types/testWidget";

function isNumberBondParams(params: TestWidgetParams) {
  return "whole" in params && "partA" in params && "partB" in params && "ask" in params;
}

function isShapeSortParams(params: TestWidgetParams): params is ShapeSortQuestionParams {
  return "shape" in params && !("sides" in params) && !("width" in params) && !("hour" in params) && !("variant" in params);
}

function isClockParams(params: TestWidgetParams): params is ClockQuestionParams {
  return (
    "hour" in params &&
    "minute" in params &&
    "ask" in params &&
    !("whole" in params) &&
    !("sides" in params) &&
    !("width" in params) &&
    !("partA" in params)
  );
}

function isComparisonParams(params: TestWidgetParams): params is ComparisonQuestionParams {
  return "left" in params && "right" in params && !("operation" in params);
}

function isSymmetryPictureParams(params: TestWidgetParams): params is SymmetryPictureQuestionParams {
  return "variant" in params && params.variant === "picture";
}

function isSymmetryAxisParams(params: TestWidgetParams): params is SymmetryAxisQuestionParams {
  return "variant" in params && params.variant === "axis";
}

export function getStudentSteps(params: TestWidgetParams, slug: string): string[] {
  if (isSymmetryPictureParams(params) || slug === "symetria-obrazka") {
    return [
      "Obrazek jest podzielony pionową osią symetrii.",
      "Lewa połowa jest gotowa — klikaj kwadraty po prawej, aby dorysować lustrzane odbicie.",
      "W zadaniu uzupełnij brakującą połowę, potem użyj „Sprawdź”.",
    ];
  }

  if (isSymmetryAxisParams(params) || slug === "os-symetrii-figury") {
    return [
      "Przesuń linię osi na figurze.",
      "Zastanów się: czy obie strony są takie same?",
      "Wybierz „Tak, symetria” albo „Nie, brak symetrii”.",
    ];
  }

  if (isNumberBondParams(params)) {
    return [
      "Spójrz na domek — na dachu jest całość, u dołu dwa składniki.",
      "Setki, dziesiątki i jedności pomagają zobaczyć wielkość liczb bez liczenia klocków.",
      params.ask === "whole"
        ? "Dodaj oba składniki — to liczba na dachu."
        : "Uzupełnij brakujący składnik tak, aby suma była równa dachowi.",
      "Użyj +1 / +10 / +100 (i minusów), żeby szybko wpisać liczbę — np. 140 to +100, +10, +10, +10, +10.",
    ];
  }

  if (isShapeSortParams(params)) {
    return [
      "Spójrz na figurę — koło, trójkąt, kwadrat czy prostokąt?",
      "W trybie prezentacji: kliknij figurę z mieszanki, potem właściwy koszyk.",
      "W zadaniu: wybierz koszyk, do którego należy wyróżniona figura.",
    ];
  }

  if (isClockParams(params)) {
    return [
      "Spójrz na tarczę zegara — krótka wskazówka to godzina, długa to minuty.",
      params.minute === 0
        ? "Przy pełnych godzinach długa wskazówka stoi na 12."
        : "Przy kwadransach i połówkach licz minuty: 15, 30 lub 45.",
      params.ask === "minute"
        ? "Użyj + / −, aby wpisać liczbę minut."
        : "Użyj + / −, aby wpisać godzinę (1–12).",
    ];
  }

  if (isComparisonParams(params)) {
    if (params.ask === "missingDigit") {
      return [
        "Spójrz na wagę — która szalka opada?",
        "Jedna liczba ma lukę: krokodyl zjadł cyfrę.",
        "Użyj + / −, aby wpisać brakującą cyfrę (0–9).",
      ];
    }
    if (slug === "porownywanie-liczb-waga") {
      return [
        "Spójrz na wagę — która szalka opada? To większa liczba.",
        "Krokodyl zawsze zjada większą liczbę — jego paszcza to znak < lub >.",
        "Otwarta strona < lub > wskazuje większą liczbę. Wybierz właściwy znak między liczbami.",
      ];
    }
  }

  if ("partA" in params && "partB" in params && "ask" in params && !("width" in params) && !("sides" in params)) {
    if (params.ask === "simplify") {
      return [
        "Znajdź największy wspólny dzielnik obu liczb.",
        "Podziel lewą i prawą liczbę przez ten sam dzielnik.",
        "Wpisz uproszczony stosunek przyciskami + / −.",
      ];
    }
    return [
      "Spójrz na pasek podzielony na dwie kolorowe części.",
      "Policz części po lewej (niebieska) i po prawej (zielona).",
      params.ask === "total"
        ? "Dodaj obie liczby — to liczba wszystkich części całości."
        : params.ask === "left"
          ? "Wpisz, ile części ma lewa strona paska."
          : "Wpisz, ile części ma prawa strona paska.",
    ];
  }

  if ("start" in params) {
    return [
      "Znajdź liczbę startową na osi.",
      params.change >= 0 ? "Przesuń się w prawo o podaną liczbę kroków." : "Przesuń się w lewo o podaną liczbę kroków.",
      "Wpisz liczbę, na której kończy się ruch.",
    ];
  }

  if ("operation" in params) {
    const arithmetic = params as ArithmeticQuestionParams;
    if (arithmetic.operation === "multiply") {
      return ["Zobacz, ile jest grup.", "Policz, ile kropek jest w jednej grupie.", "Pomnóż grupy razy kropki w grupie."];
    }
    if (arithmetic.operation === "divide") {
      return ["Zobacz, ile elementów mamy razem.", "Podziel je na równe grupy.", "Wpisz, ile elementów trafia do jednej grupy."];
    }
    return ["Przeczytaj działanie od lewej do prawej.", "Policz spokojnie na liczbach lub obrazku.", "Wpisz wynik: +1 / +10 / +100 (lub minusy), np. do 140 dodaj +100, potem +10 cztery razy."];
  }

  if (slug === "suma-katow-w-trojkacie" || (params && "variant" in params && params.variant === "triangle-angle-sum")) {
    return [
      "Przeciągnij wierzchołki A, B lub C — obserwuj trzy kąty.",
      "Dodaj je mentalnie: czy zawsze wychodzi 180°?",
      "W zadaniu znajdź brakujący kąt i wpisz go przyciskami + / −.",
    ];
  }

  if (slug === "katy-rodzaje" || (params && "variant" in params && params.variant === "angle-kind")) {
    return [
      "Przeciągnij zielony punkt — zmieniaj wielkość kąta.",
      "Ostry < 90°, prosty = 90°, rozwarty > 90°, półpełny = 180°.",
      "Wybierz właściwą nazwę i użyj „Sprawdź”.",
    ];
  }

  if (slug === "katy-przylegle-wierzcholkowe" || (params && "variant" in params && params.variant === "intersecting-angles")) {
    return [
      "Dwie proste tworzą cztery kąty wokół punktu przecięcia.",
      "Przyległe kąty sumują się do 180°. Wierzchołkowe są równe.",
      "Wpisz szukany kąt przyciskami + / −.",
    ];
  }

  if (slug === "trojkaty-klasyfikacja" || (params && "variant" in params && params.variant === "triangle-classify")) {
    const ask = "ask" in params ? params.ask : "bySides";
    return ask === "bySides"
      ? [
          "Porównaj długości trzech boków trójkąta.",
          "Czy wszystkie boki są równe? Dwa równe? Żaden nie równa się pozostałym?",
          "Wybierz: równoboczny, równoramienny albo różnoboczny. Potem użyj „Sprawdź”.",
        ]
      : [
          "Spójrz na miary kątów w wierzchołkach trójkąta.",
          "Czy któryś kąt ma 90°? Czy któryś jest większy niż 90°?",
          "Wybierz: ostrokątny, prostokątny albo rozwartokątny. Potem użyj „Sprawdź”.",
        ];
  }

  if (slug === "rozklad-na-czynniki" || (params && "variant" in params && params.variant === "factor-tree")) {
    return [
      `Zacznij od liczby ${"number" in params ? params.number : "?"}.`,
      "Kliknij liczbę złożoną na drzewku i wybierz dzielnik — powstaną dwa gałęzie.",
      "Dziel dalej, aż wszystkie liście będą liczbami pierwszymi. Potem użyj „Sprawdź”.",
    ];
  }

  if ("numerator" in params && slug === "ulamki-na-osi") {
    return [
      `Przeczytaj ułamek ${params.numerator}/${params.denominator} — licznik to część, mianownik to liczba podziałek.`,
      `Oś między 0 a 1 jest podzielona na ${params.denominator} równych odcinków.`,
      "Kliknij miejsce na osi (lub podziałkę), gdzie powinien stać ułamek. Potem użyj „Sprawdź”.",
    ];
  }

  if ("numerator" in params) {
    return [
      `Podziel całość na ${params.denominator} równych kawałków.`,
      `Pokoloruj dokładnie ${params.numerator} kawałki — to licznik ułamka ${params.numerator}/${params.denominator}.`,
      "Klikaj kawałki ciasta od lewej, aż liczba pokolorowanych zgadza się z zadaniem. Potem użyj „Sprawdź”.",
    ];
  }

  if ("sides" in params && "sideLength" in params && "ask" in params) {
    if (params.ask === "name") {
      return [
        "Policz boki figury na rysunku.",
        "Policz wierzchołki (oznaczone W1, W2…).",
        "Wybierz poprawną nazwę wielokąta.",
      ];
    }
    if (params.ask === "perimeter") {
      return [
        "Sprawdź długość jednego boku.",
        "Policz, ile razy taki bok powtarza się dookoła figury.",
        "Użyj + / −, aby wpisać obwód.",
      ];
    }
    if (params.ask === "vertices") {
      return ["Policz rogi (wierzchołki) figury.", "Każdy róg to jeden wierzchołek.", "Użyj + / −, aby wpisać liczbę."];
    }
    return [
      "Zobacz kąt wewnętrzny przy wierzchołku.",
      "We wielokącie foremnym wszystkie kąty są równe.",
      "Użyj + / −, aby wpisać miarę w stopniach.",
    ];
  }

  if ("width" in params && "height" in params && "ask" in params) {
    return params.ask === "area"
      ? ["Zobacz długość i wysokość prostokąta.", "Pole to liczba kratek w środku.", "Pomnóż bok razy bok."]
      : ["Zobacz długość i wysokość prostokąta.", "Obwód to droga dookoła figury.", "Dodaj wszystkie boki."];
  }

  if ("fromUnit" in params && "toUnit" in params && "value" in params) {
    return [
      "Sprawdź wartość startową i jednostkę (np. cm).",
      "Sprawdź, na jaką jednostkę przeliczasz (np. m).",
      "Użyj + / −, aby wpisać wynik — także +0.1 / −0.1 dla ułamków.",
    ];
  }

  return ["Obserwuj schemat powyżej.", "Wykonaj zadanie na interaktywnym modelu.", "Użyj „Sprawdź”, gdy skończysz."];
}

export function formatExpectedAnswer(expected: TestWidgetAnswer): string {
  if ("result" in expected) return String(expected.result);
  if ("label" in expected) {
    const label = expected.label;
    if (label.includes("|") && label.split("|").every((part) => /^\d+$/.test(part))) {
      return label.split("|").join(" × ");
    }
    if (isTriangleClassLabel(label)) return TRIANGLE_CLASS_LABELS[label];
    if (label in ANGLE_KIND_LABELS) return ANGLE_KIND_LABELS[label as AngleKind];
    if (label === "yes") return "Tak — figura jest symetryczna";
    if (label === "no") return "Nie — brak symetrii";
    if (label in SHAPE_LABELS) return SHAPE_LABELS[label as BasicShapeKind];
    if (label.includes(",")) return "Uzupełniona połowa obrazka";
    return label;
  }
  if ("comparison" in expected) return expected.comparison;
  if ("partA" in expected && "partB" in expected && !("numerator" in expected)) {
    return `${expected.partA}:${expected.partB}`;
  }
  if ("numerator" in expected && "denominator" in expected) {
    return `${expected.numerator}/${expected.denominator}`;
  }
  return "?";
}

export function getExpectedAnswer(slug: string, params: TestWidgetParams): TestWidgetAnswer | null {
  const widget = getAssessmentWidget(slug);
  if (!widget) return null;

  const placeholder =
    "variant" in params && params.variant === "triangle-classify"
      ? { label: "" }
      : "variant" in params && params.variant === "factor-tree"
        ? { label: "" }
        : "numerator" in params
        ? { numerator: 0, denominator: 1 }
        : isComparisonParams(params) && params.ask !== "missingDigit"
          ? { comparison: "=" as const }
          : { result: 0 };

  return widget.grade(params, placeholder, 1).expectedAnswer;
}

export function usesDedicatedInteractiveVisual(slug: string, params: TestWidgetParams): boolean {
  if (slug === "symetria-obrazka" || slug === "os-symetrii-figury") return true;
  if (isSymmetryPictureParams(params) || isSymmetryAxisParams(params)) return true;
  if (slug === "suma-katow-w-trojkacie") return true;
  if (slug === "katy-rodzaje") return true;
  if (slug === "katy-przylegle-wierzcholkowe") return true;
  if (slug === "trojkaty-klasyfikacja") return true;
  if (slug === "rozklad-na-czynniki") return true;
  if (slug === "ulamki-na-osi") return true;
  if ("numerator" in params || slug === "ulamki-ciasto") return true;
  if ("start" in params) return true;
  if ("whole" in params && "partA" in params) return true;
  if (slug.startsWith("liczmany-") && "operation" in params) return true;
  if ("operation" in params) return true;
  if (slug === "porownywanie-liczb-waga" && isComparisonParams(params)) return true;
  if (isComparisonParams(params)) return true;
  if ("partA" in params && "partB" in params && "ask" in params && !("whole" in params)) return true;
  if ("sides" in params && "sideLength" in params) return true;
  if (isShapeSortParams(params) || slug === "figury-podstawowe-sortowanie") return true;
  if ("width" in params && "height" in params && "ask" in params) return true;
  if (isClockParams(params) || slug.startsWith("zegar-")) return true;
  if ("value" in params && "fromUnit" in params) return true;
  if (slug === "jednostki-dlugosci") return true;
  return false;
}
