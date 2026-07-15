# WP-S5-F0 — API fundamentu liczb dziesiętnych

Status: fundament wspólny działu 5. Dokument nie opisuje ani nie publikuje pakietów `WP-S5-01+`.

## Granice modułów

- `src/types/decimals.ts` — serializowalne typy wartości, śladu zapisu, strategii, jednostek i pytań.
- `src/lib/math/decimals/decimalMath.ts` — parser, dokładne działania, jednostki oraz czyste modele działań pisemnych.
- `src/lib/math/decimals/decimalDiagnostics.ts` — teksty i warstwy podświetleń kodów `DEC_*`.
- `src/lib/math/decimals/decimalGeneratorCore.ts` — deterministyczny rdzeń generatora i jawna projekcja publiczna.
- `src/lib/math/decimals/decimalGenerator.server.ts` — pełne pytanie z `answerSpec`; moduł ma `import "server-only"`.
- `src/lib/math/decimals/decimalValidation.server.ts` — serwerowa bramka oceny wartości, jednostki i strategii.
- `src/components/lessons/decimals/` — komponenty współdzielone przez przyszłe tematy działu 5.

Import publicznej matematyki:

```ts
import {
  parseDecimalInput,
  formatDecimal,
  areEquivalentDecimals,
  buildDecimalWrittenMultiplyModel,
} from "@/lib/math/decimals";
```

Import komponentów:

```ts
import {
  DecimalDigitInput,
  DecimalPlaceValueGrid,
  DecimalWrittenAddSub,
  DecimalWrittenMultiply,
  DecimalWrittenDivide,
  DecimalNumberLine,
  DecimalHundredGrid,
} from "@/components/lessons/decimals";
```

## Wartość i ślad zapisu

`DecimalValue` nie używa zmiennoprzecinkowego `number`. Wartość ma znak, całkowity `coefficient` zapisany tekstowo oraz `scale`:

```ts
parseDecimalInput("2,50")
// value: { sign: 1, coefficient: "250", scale: 2 }
// trace: { display: "2,50", fractionDigits: "50", trailingZeroCount: 1, ... }
```

`2,5`, `2,50` i `2,500` są równoważne w `areEquivalentDecimals`, ale mają różne ślady. Pustka zwraca `DEC_EMPTY`; nigdy nie staje się zerem. Parser przyjmuje kropkę z fizycznej klawiatury i zwraca zapis z przecinkiem. Jednostka nie jest parsowana z tego samego niekontrolowanego ciągu — służy do tego `normalizeDecimalUnit`.

## Komponenty

### `DecimalDigitInput`

Kontrolowane pole `type="text"` z `inputMode="decimal"`. Ma klawiaturę ekranową (cyfry, przecinek, usuń, lewo, prawo, zatwierdź), zachowuje zera i wystawia poprawny `DecimalParseResult`. Nie używa natywnego `input type="number"`.

### `DecimalPlaceValueGrid`

Kontrolowany `DecimalPlaceValueState`. Obsługuje pozycje od tysięcy do części dziesięciotysięcznych, HTML drag oraz równoważne `wybierz cyfrę → umieść w kolumnie`. Każda kolumna ma też jednopunktowe pole cyfry i sterowanie strzałkami. Luki są pokazywane jako `□`, nie jako zero.

### `DecimalWrittenAddSub`

Buduje kolumny z danych operandów, umieszcza przecinki w osobnej pionowej prowadnicy i wystawia ślad `carry`/`borrow`. `activePower` wskazuje bieżącą wartość pozycyjną. Wynik można prowadzić przez kontrolowane `resultDigits`.

### `DecimalWrittenMultiply`

`buildDecimalWrittenMultiplyModel` wylicza:

- iloczyn kartezjański wszystkich cyfr obu czynników (`pairs`);
- symbol i docelową kolumnę każdej pary po skosie;
- iloczyny częściowe i przesunięcie każdego wiersza;
- każdą pionową kolumnę ich dodawania;
- `productPlaces` jako sumę faktycznych miejsc po przecinku w czynnikach.

Komponent ma osobne fazy `pairs`, `addition` i `decimal`. Kolor nigdy nie jest jedynym nośnikiem: para ma symbol, wzór łącznika, tekstowy opis SVG i tabelę danych.

### `DecimalWrittenDivide`

Pokazuje dzielną, dzielnik, iloraz, aktywną część dzielnej i odpowiadającą kratkę ilorazu. `buildDecimalWrittenDivideModel` wylicza potęgę potrzebną do naturalizacji dzielnika i skaluje obie liczby. `appendedZeros` przechowuje jawny ślad zer pomocniczych bez zmiany wartości.

### `DecimalNumberLine` i `DecimalHundredGrid`

Oś przyjmuje zapis tekstowy punktów, dzięki czemu równoważne zera końcowe trafiają dokładnie w to samo miejsce. SVG ma tytuł, opis i tekstową tabelę. Kratownica ma 100 dostępnych pól, malowanie wskaźnikiem oraz alternatywę liczbową; synchronizuje `n/100` z `0,nn`.

## Generator i bezpieczeństwo odpowiedzi

```ts
// wyłącznie kod serwerowy
const generated = createDecimalQuestionForServer({ seed, difficulty, config });
// generated.answerSpec pozostaje na serwerze

const payload = createPublicDecimalQuestion({ seed, difficulty, config });
// payload nie ma answerSpec ani oczekiwanej strategii
```

Identyczną instancję wyznacza `generatorId + generatorVersion + seed + config`. Generator nie używa `Math.random()` w renderze. Obsługiwane zadania fundamentu: `place-value`, `add`, `subtract`, `multiply`, `divide`, `unit`; liczby mają 1–4 miejsca po przecinku, mieszczą się w konfiguracji i nie tworzą okresowych ilorazów.

Walidator punktuje osobno:

1. dokładną wartość liczby;
2. wymagany zapis/strategię (kolumnę przecinka, pozycje, przesunięcia, liczbę miejsc iloczynu, wspólne skalowanie);
3. jednostkę.

Publiczny payload ma stały niezmiennik `answer-spec-server-only`. Test kontraktowy sprawdza też, że serializacja nie zawiera oczekiwanych iloczynów częściowych.

## Diagnostyka i dostępność

Obsługiwane kody planu: `DEC_EMPTY`, `DEC_COMMA_MISALIGNED`, `DEC_PLACE_VALUE`, `DEC_TRAILING_ZERO_VALUE`, `DEC_MISSING_ZERO`, `DEC_PRODUCT_PLACES`, `DEC_PARTIAL_PRODUCT_SHIFT`, `DEC_DIVISOR_SCALE`, `DEC_ESTIMATE_RANGE`, `DEC_UNIT_MISMATCH`.

Komponenty korzystają ze wspólnych `DiagnosticFeedbackPanel`, `AccessibleMathSvg` i `InteractionAlternativePanel`. Sterowania mają co najmniej 44×44 px (cyfry 52×52 px), widoczny focus, komunikaty `aria-live`, wzory/symbole niezależne od koloru, reguły `prefers-reduced-motion`, forced colors i wydruku. Szerokie siatki mają kontrolowany poziomy overflow dla tabletu pionowego i wysokiego zoomu.
