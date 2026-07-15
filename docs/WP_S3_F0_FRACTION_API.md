# WP-S3-F0 — API inteligentnego zapisu i modeli ułamków

Fundament nie jest pakietem tematycznym. Paczki `WP-S3-01*` i kolejne składają
z poniższych elementów własny model lekcyjny, zachowując ten sam stan
matematyczny w widoku tablicy, ucznia, live i druku.

## Matematyka i parser

Publiczny punkt wejścia: `src/lib/math/fractions/index.ts`.

- `parseFractionInput(text)` obsługuje ułamek, odstępy, ukośnik ułamkowy,
  liczbę mieszaną i liczbę całkowitą. Wynik jest sumą rozłączną `ok: true/false`;
  błąd zawiera `code`, `part`, `message` i surowe `input`.
- `parseFractionStackValue(value)` zachowuje pustą kratkę jako brak danych.
- `normalizeFraction`, `mixedToImproper`, `toMixedFraction`,
  `areEquivalentFractions` i `isFractionSimplified` są czystymi funkcjami.
- `buildFractionBarSegments` i `buildFractionCircleSectors` są wspólnym źródłem
  geometrii dla renderu i testów niezmienników.

Mianownik znormalizowanej wartości jest zawsze dodatni. Mianownik zero zwraca
`FRA_ZERO_DENOMINATOR`; niepełny zapis zwraca `FRA_EMPTY_PART` i nigdy nie jest
traktowany jak poprawne zero.

## `FractionStackInput`

Import z `@/components/lessons/fractions`.

Najważniejsze propsy:

- `value: FractionStackValue` — kontrolowane tablice cyfr; jedna pozycja to
  jedna kratka;
- `onChange(value)` — wspólny stan modelu i zapisu;
- `showWholePart` — dodaje osobny blok części całkowitej po lewej;
- `digitLimit` i `initialDigitCells` — limit oraz początkowy rozmiar, bez
  zmniejszania liczby widocznych kratek podczas edycji;
- `onSubmit(parsed)` — wywoływane dopiero po poprawnym parsowaniu;
- `diagnosticCode` / `diagnosticMemberIds` — podłączenie zewnętrznej diagnozy.

Klawiatura: strzałki poziome przechodzą po kratkach, pionowe łączą licznik
z mianownikiem, `Backspace` cofa bez utraty focusu, a `Enter` zatwierdza.
Klawiatura ekranowa używa obszarów co najmniej 52×52 px. Widok drukowany
pozostawia kratki 12 mm i wyłącza kontrolki ekranowe.

## Modele SVG

- `FractionBarModel({ bars, overlay, showCommonAxis })` — wszystkie paski mają
  identyczną długość jednej całości; `overlay` nakłada reprezentacje na tę samą
  oś.
- `FractionCircleModel({ value, variant: "circle" | "pizza" })` — sektory
  powstają z jednego środka i kąta `360 / denominator`; ułamki niewłaściwe
  automatycznie używają kolejnych kół.
- `FractionGlassModel({ glasses, pour })` — identyczne pojemności, podziałka
  rysowana nad wodą, płynna zmiana poziomu oraz fala SVG o amplitudzie 2,5 px
  i okresie 3,6 s. Przycisk i `prefers-reduced-motion` zatrzymują ruch.

Każdy model używa `AccessibleMathSvg`: ma `title`, `desc` oraz rozwijaną tabelę
bieżących wartości. Kolor jest uzupełniony wzorem, symbolem, obrysem albo
tekstem.

## `FractionOperationDirector`

`items` opisują ułamki i stabilne identyfikatory pól, np.
`left-numerator`. Każdy element `steps` może zawierać:

- `highlights` zgodne z `DiagnosticHighlightTarget`;
- `connectors` z odrębnym symbolem, wzorem linii i akcentem;
- `crossOuts` ze starą i nową wartością;
- `feedbackCode` oraz `feedbackMemberIds`.

Zmiana kroku przenosi focus do nagłówka. Przyciski poprzedni/następny/reset są
alternatywą dla gestu. Feedback korzysta ze wspólnego
`DiagnosticFeedbackPanel`.

## Generator i granica bezpieczeństwa

Pełne tworzenie pytania jest dostępne wyłącznie z
`fractionGenerator.server.ts`, który importuje `server-only`.

```ts
const generated = createFractionQuestionForServer({ seed, difficulty, config });
// generated.publicQuestion -> snapshot klienta
// generated.answerSpec     -> wyłącznie serwerowy klucz/walidator
```

`createPublicFractionQuestion` wykonuje jawną projekcję i nie zwraca
`answerSpec`. Czysty `fractionGeneratorCore.ts` służy wyłącznie modułowi
serwerowemu i testom deterministyczności; nie wolno importować go do komponentu
klientowego. Ten sam `generatorId + generatorVersion + seed + config` daje te
same parametry i nie używa `Math.random()`.

## Kody diagnostyczne fundamentu

`FRA_EMPTY_PART`, `FRA_ZERO_DENOMINATOR`, `FRA_NUM_DEN_SWAPPED`,
`FRA_NOT_EQUIVALENT`, `FRA_NOT_SIMPLIFIED` i `FRA_WRONG_OPERATION_PAIR` mają
pełną sekwencję czterech poziomów pomocy oraz wskazania pól/par. Rozwiązanie
pozostaje objęte zasadami wspólnego `DiagnosticFeedbackPanel` i nie jest
dostarczane przed oddaniem w trybie oceniania.
