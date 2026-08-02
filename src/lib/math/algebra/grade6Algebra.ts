export type AlgebraActivity =
  | "meet-x"
  | "same-x"
  | "translate-words"
  | "build-expression"
  | "substitution-machine"
  | "evaluate-expression"
  | "like-terms"
  | "simplify-expression"
  | "equation-meaning"
  | "write-equation"
  | "test-solution"
  | "balance-solve"
  | "inverse-operation"
  | "story-equation"
  | "story-solve"
  | "review-mission";

export type AlgebraVisual = "box" | "machine" | "tiles" | "balance" | "story";

interface AlgebraTaskBase {
  id: string;
  prompt: string;
  explanation: string;
  visual: AlgebraVisual;
  expression?: string;
  leftX?: number;
  leftUnits?: number;
  rightX?: number;
  rightUnits?: number;
  xValue?: number;
}

export interface AlgebraChoiceTask extends AlgebraTaskBase {
  kind: "choice";
  options: string[];
  answer: string;
}

export interface AlgebraNumericTask extends AlgebraTaskBase {
  kind: "numeric";
  answer: number;
  suffix?: string;
}

export type AlgebraTask = AlgebraChoiceTask | AlgebraNumericTask;

const choices: Record<Exclude<AlgebraActivity, "meet-x" | "same-x" | "substitution-machine" | "equation-meaning" | "balance-solve" | "inverse-operation" | "evaluate-expression" | "simplify-expression" | "story-solve">, AlgebraChoiceTask[]> = {
  "translate-words": [
    { id: "t1", kind: "choice", prompt: "Ola ma x naklejek i dostaje jeszcze 4. Który zapis opisuje liczbę naklejek?", options: ["x + 4", "4x", "x − 4", "4 − x"], answer: "x + 4", explanation: "„Jeszcze 4” oznacza, że do liczby x dodajemy 4.", visual: "box" },
    { id: "t2", kind: "choice", prompt: "W pudełku jest x klocków. Trzy takie same pudełka mają razem…", options: ["3x", "x + 3", "x − 3", "3 − x"], answer: "3x", explanation: "Trzy jednakowe grupy po x to x + x + x, czyli 3x.", visual: "tiles" },
    { id: "t3", kind: "choice", prompt: "Tomek ma x złotych i wydaje 7 zł. Ile mu zostaje?", options: ["x − 7", "7 − x", "7x", "x + 7"], answer: "x − 7", explanation: "Wydana kwota zmniejsza początkowe x złotych.", visual: "box" },
    { id: "t4", kind: "choice", prompt: "Liczba o 5 większa od x to…", options: ["x + 5", "5x", "x − 5", "5 − x"], answer: "x + 5", explanation: "„O 5 większa” oznacza dodanie 5, a nie mnożenie.", visual: "box" },
    { id: "t5", kind: "choice", prompt: "Liczba 5 razy większa od x w tym zadaniu oznacza…", options: ["5x", "x + 5", "x − 5", "5 − x"], answer: "5x", explanation: "Pięć razy tyle to pięć jednakowych grup po x.", visual: "tiles" },
    { id: "t6", kind: "choice", prompt: "Mama ma x lat, a córka jest o 26 lat młodsza. Wiek córki opisuje…", options: ["x − 26", "26 − x", "26x", "x + 26"], answer: "x − 26", explanation: "Wiek córki jest mniejszy od wieku mamy o 26.", visual: "story" },
    { id: "t7", kind: "choice", prompt: "Jedna książka kosztuje x zł. Ile kosztują 4 książki?", options: ["4x", "x + 4", "x − 4", "4 − x"], answer: "4x", explanation: "Cztery jednakowe ceny po x zł dają 4x zł.", visual: "tiles" },
    { id: "t8", kind: "choice", prompt: "Z liczby 12 odejmujemy x. Który zapis jest poprawny?", options: ["12 − x", "x − 12", "12x", "x + 12"], answer: "12 − x", explanation: "Kolejność słów ma znaczenie: zaczynamy od 12 i odejmujemy x.", visual: "box" },
  ],
  "build-expression": [
    { id: "b1", kind: "choice", prompt: "Który zapis oznacza x + x + x + x?", options: ["4x", "x + 4", "x⁴", "4 + x"], answer: "4x", explanation: "Cztery składniki równe x zapisujemy krócej jako 4x.", visual: "tiles" },
    { id: "b2", kind: "choice", prompt: "Co oznacza zapis 6x?", options: ["Sześć grup po x", "x powiększone o 6", "x pomniejszone o 6", "Szósta potęga x"], answer: "Sześć grup po x", explanation: "Współczynnik 6 mówi, ile jednakowych grup po x mamy.", visual: "tiles" },
    { id: "b3", kind: "choice", prompt: "Obwód trójkąta o bokach x, x i 5 opisuje…", options: ["2x + 5", "x + 5", "2x · 5", "x² + 5"], answer: "2x + 5", explanation: "Dwa boki mają długość x, więc x + x + 5 = 2x + 5.", visual: "story" },
    { id: "b4", kind: "choice", prompt: "Na dwóch półkach stoi po x książek i dodatkowo 3 książki. Razem jest…", options: ["2x + 3", "2(x + 3)", "x + 5", "3x + 2"], answer: "2x + 3", explanation: "Dwie półki po x dają 2x, a trzy dodatkowe książki dodajemy osobno.", visual: "tiles" },
  ],
  "like-terms": [
    { id: "l1", kind: "choice", prompt: "Które dwa składniki są wyrazami podobnymi?", options: ["3x i 5x", "3x i 5", "x i x²", "2 i 2x"], answer: "3x i 5x", explanation: "Oba składniki mają dokładnie tę samą część literową: x.", visual: "tiles" },
    { id: "l2", kind: "choice", prompt: "Które elementy możemy połączyć w jedną grupę?", options: ["2x + 4x", "2x + 4", "x + 4²", "2 + 4x"], answer: "2x + 4x", explanation: "Łączymy jednakowe paczki x z innymi paczkami x.", visual: "tiles" },
    { id: "l3", kind: "choice", prompt: "Dlaczego 2x + 3 nie jest równe 5x?", options: ["Paczki x i jednostki to różne rodzaje", "Bo nie wolno dodawać", "Bo x zawsze jest zerem", "Bo 2 + 3 nie daje 5"], answer: "Paczki x i jednostki to różne rodzaje", explanation: "Nie znamy zawartości paczki x, więc nie zamieniamy trzech jednostek na trzy paczki x.", visual: "tiles" },
    { id: "l4", kind: "choice", prompt: "Który zapis jest równy x + x + 4 + 2?", options: ["2x + 6", "8x", "2x + 4", "x + 6"], answer: "2x + 6", explanation: "Łączymy dwa x oraz osobno liczby 4 i 2.", visual: "tiles" },
  ],
  "write-equation": [
    { id: "w1", kind: "choice", prompt: "W pudełku było x kulek. Po dołożeniu 4 jest ich 11. Które równanie opisuje sytuację?", options: ["x + 4 = 11", "x − 4 = 11", "4x = 11", "11 + 4 = x"], answer: "x + 4 = 11", explanation: "Początkowe x i dołożone 4 razem równają się 11.", visual: "balance", leftX: 1, leftUnits: 4, rightUnits: 11, xValue: 7 },
    { id: "w2", kind: "choice", prompt: "Trzy bilety po x zł kosztują razem 24 zł. Wybierz równanie.", options: ["3x = 24", "x + 3 = 24", "x − 3 = 24", "24x = 3"], answer: "3x = 24", explanation: "Trzy jednakowe ceny po x zł dają łącznie 24 zł.", visual: "balance", leftX: 3, rightUnits: 24, xValue: 8 },
    { id: "w3", kind: "choice", prompt: "Po wydaniu 6 zł z kwoty x zostało 15 zł. Wybierz równanie.", options: ["x − 6 = 15", "x + 6 = 15", "6 − x = 15", "6x = 15"], answer: "x − 6 = 15", explanation: "Od kwoty początkowej x odejmujemy wydane 6 zł.", visual: "story", xValue: 21 },
    { id: "w4", kind: "choice", prompt: "Liczbę x podzielono na 4 równe części. Jedna część ma wartość 5. Wybierz równanie.", options: ["x : 4 = 5", "4 : x = 5", "x − 4 = 5", "4x = 5"], answer: "x : 4 = 5", explanation: "Całą liczbę x dzielimy na cztery równe grupy.", visual: "story", xValue: 20 },
  ],
  "test-solution": [
    { id: "c1", kind: "choice", prompt: "Czy x = 5 spełnia równanie x + 3 = 8?", options: ["Tak, spełnia", "Nie spełnia"], answer: "Tak, spełnia", explanation: "Po podstawieniu: 5 + 3 = 8, więc obie strony mają wartość 8.", visual: "balance", expression: "x + 3 = 8", leftX: 1, leftUnits: 3, rightUnits: 8, xValue: 5 },
    { id: "c2", kind: "choice", prompt: "Czy x = 4 spełnia równanie 3x = 15?", options: ["Tak, spełnia", "Nie spełnia"], answer: "Nie spełnia", explanation: "Po podstawieniu lewa strona ma wartość 12, a prawa 15.", visual: "balance", expression: "3x = 15", leftX: 3, rightUnits: 15, xValue: 4 },
    { id: "c3", kind: "choice", prompt: "Czy x = 14 spełnia równanie x − 6 = 8?", options: ["Tak, spełnia", "Nie spełnia"], answer: "Tak, spełnia", explanation: "14 − 6 = 8, więc lewa i prawa strona są równe.", visual: "balance", expression: "x − 6 = 8", xValue: 14 },
    { id: "c4", kind: "choice", prompt: "Czy x = 24 spełnia równanie x : 6 = 5?", options: ["Tak, spełnia", "Nie spełnia"], answer: "Nie spełnia", explanation: "24 : 6 = 4, a nie 5, więc wartości stron są różne.", visual: "balance", expression: "x : 6 = 5", xValue: 24 },
  ],
  "story-equation": [
    { id: "s1", kind: "choice", prompt: "Kasia miała pewną liczbę koralików. Dostała 7 i ma teraz 19. Co oznacza x?", options: ["Liczbę koralików na początku", "Liczbę otrzymanych koralików", "Liczbę koralików na końcu", "Liczbę koleżanek"], answer: "Liczbę koralików na początku", explanation: "Pytamy o stan początkowy, więc właśnie tę liczbę oznaczamy przez x.", visual: "story", xValue: 12 },
    { id: "s2", kind: "choice", prompt: "Za 4 jednakowe zeszyty zapłacono 28 zł. Które równanie pomoże znaleźć cenę jednego zeszytu?", options: ["4x = 28", "x + 4 = 28", "x − 4 = 28", "28x = 4"], answer: "4x = 28", explanation: "Cztery jednakowe ceny x razem dają 28 zł.", visual: "story", xValue: 7 },
    { id: "s3", kind: "choice", prompt: "Po przejściu 5 km zostało jeszcze x km, a cała trasa ma 13 km. Wybierz równanie.", options: ["5 + x = 13", "5x = 13", "x − 5 = 13", "13 + x = 5"], answer: "5 + x = 13", explanation: "Droga przebyta i droga pozostała tworzą całą trasę.", visual: "story", xValue: 8 },
    { id: "s4", kind: "choice", prompt: "Liczba jest o 9 większa od 16. Jeśli oznaczymy ją przez x, które równanie jest poprawne?", options: ["x − 9 = 16", "x + 9 = 16", "9 − x = 16", "9x = 16"], answer: "x − 9 = 16", explanation: "Gdy od większej liczby x odejmiemy różnicę 9, otrzymamy 16.", visual: "story", xValue: 25 },
  ],
  "review-mission": [
    { id: "r1", kind: "choice", prompt: "Który zapis oznacza liczbę o 3 większą od x?", options: ["x + 3", "3x", "x − 3", "3 − x"], answer: "x + 3", explanation: "„O 3 większa” oznacza dodanie 3.", visual: "box" },
    { id: "r2", kind: "choice", prompt: "Uprość w pamięci: 2x + 5x + 1.", options: ["7x + 1", "8x", "7x", "6x + 1"], answer: "7x + 1", explanation: "Łączymy wyrazy z x, a jednostkę zostawiamy osobno.", visual: "tiles" },
    { id: "r3", kind: "choice", prompt: "Która liczba spełnia równanie x + 6 = 10?", options: ["4", "6", "10", "16"], answer: "4", explanation: "4 + 6 = 10.", visual: "balance", leftX: 1, leftUnits: 6, rightUnits: 10, xValue: 4 },
    { id: "r4", kind: "choice", prompt: "Trzy jednakowe torby ważą razem 18 kg. Które równanie znajdzie masę jednej torby?", options: ["3x = 18", "x + 3 = 18", "x − 3 = 18", "18x = 3"], answer: "3x = 18", explanation: "Trzy jednakowe masy x dają razem 18 kg.", visual: "story", xValue: 6 },
  ],
};

const evaluateTasks: AlgebraNumericTask[] = [
  { id: "e1", kind: "numeric", prompt: "Oblicz wartość 2x + 3 dla x = 4.", expression: "2 · 4 + 3", answer: 11, explanation: "Najpierw 2 · 4 = 8, potem 8 + 3 = 11.", visual: "machine", xValue: 4 },
  { id: "e2", kind: "numeric", prompt: "Oblicz wartość 5x − 2 dla x = 3.", expression: "5 · 3 − 2", answer: 13, explanation: "5 · 3 = 15, a 15 − 2 = 13.", visual: "machine", xValue: 3 },
  { id: "e3", kind: "numeric", prompt: "Oblicz wartość 4 + 3x dla x = 6.", expression: "4 + 3 · 6", answer: 22, explanation: "Najpierw mnożenie: 3 · 6 = 18, potem 4 + 18 = 22.", visual: "machine", xValue: 6 },
  { id: "e4", kind: "numeric", prompt: "Oblicz wartość 24 − 2x dla x = 7.", expression: "24 − 2 · 7", answer: 10, explanation: "2 · 7 = 14, a 24 − 14 = 10.", visual: "machine", xValue: 7 },
  { id: "e5", kind: "numeric", prompt: "Oblicz wartość 3(x + 2) dla x = 5.", expression: "3 · (5 + 2)", answer: 21, explanation: "Najpierw nawias: 5 + 2 = 7, potem 3 · 7 = 21.", visual: "machine", xValue: 5 },
];

const simplifyTasks: AlgebraNumericTask[] = [
  { id: "u1", kind: "numeric", prompt: "Uprość 3x + 2x. Wpisz współczynnik stojący przy x.", expression: "3x + 2x = □x", answer: 5, suffix: "x", explanation: "Trzy paczki x i dwie paczki x dają pięć paczek x.", visual: "tiles", leftX: 3, rightX: 2 },
  { id: "u2", kind: "numeric", prompt: "Uprość 7x − 4x. Wpisz współczynnik stojący przy x.", expression: "7x − 4x = □x", answer: 3, suffix: "x", explanation: "Z siedmiu paczek x zabieramy cztery, zostają trzy.", visual: "tiles", leftX: 7, rightX: 4 },
  { id: "u3", kind: "numeric", prompt: "Uprość x + x + x + x + x. Wpisz współczynnik.", expression: "x + x + x + x + x = □x", answer: 5, suffix: "x", explanation: "Widzimy pięć jednakowych składników x.", visual: "tiles", leftX: 5 },
  { id: "u4", kind: "numeric", prompt: "Uprość 8x − 3x + 2x. Wpisz współczynnik.", expression: "8x − 3x + 2x = □x", answer: 7, suffix: "x", explanation: "8 − 3 + 2 = 7, więc zostaje 7x.", visual: "tiles", leftX: 7 },
];

const solveTasks: AlgebraNumericTask[] = [
  { id: "q1", kind: "numeric", prompt: "Rozwiąż równanie x + 4 = 11.", expression: "x + 4 = 11", answer: 7, explanation: "Zdejmujemy 4 z obu stron. Zostaje x = 7. Sprawdzenie: 7 + 4 = 11.", visual: "balance", leftX: 1, leftUnits: 4, rightUnits: 11, xValue: 7 },
  { id: "q2", kind: "numeric", prompt: "Rozwiąż równanie x − 5 = 8.", expression: "x − 5 = 8", answer: 13, explanation: "Dodajemy 5 po obu stronach. Otrzymujemy x = 13.", visual: "balance", xValue: 13 },
  { id: "q3", kind: "numeric", prompt: "Rozwiąż równanie 3x = 18.", expression: "3x = 18", answer: 6, explanation: "Dzielimy obie strony na trzy równe grupy. Jedna paczka x ma wartość 6.", visual: "balance", leftX: 3, rightUnits: 18, xValue: 6 },
  { id: "q4", kind: "numeric", prompt: "Rozwiąż równanie x : 4 = 6.", expression: "x : 4 = 6", answer: 24, explanation: "Mnożymy obie strony przez 4. Otrzymujemy x = 24.", visual: "balance", xValue: 24 },
  { id: "q5", kind: "numeric", prompt: "Rozwiąż równanie 2x + 3 = 15.", expression: "2x + 3 = 15", answer: 6, explanation: "Najpierw odejmujemy 3 po obu stronach, potem dzielimy obie strony przez 2.", visual: "balance", leftX: 2, leftUnits: 3, rightUnits: 15, xValue: 6 },
  { id: "q6", kind: "numeric", prompt: "Rozwiąż równanie 4x − 8 = 20.", expression: "4x − 8 = 20", answer: 7, explanation: "Dodajemy 8 po obu stronach, a następnie dzielimy obie strony przez 4.", visual: "balance", xValue: 7 },
];

const storySolveTasks: AlgebraNumericTask[] = [
  { id: "ss1", kind: "numeric", prompt: "Kasia miała x koralików. Dostała 7 i ma teraz 19. Ile koralików miała na początku?", expression: "x + 7 = 19", answer: 12, suffix: "koralików", explanation: "Odejmujemy 7 od obu stron: x = 12. Sprawdzenie: 12 + 7 = 19.", visual: "story", xValue: 12 },
  { id: "ss2", kind: "numeric", prompt: "Cztery jednakowe zeszyty kosztują 28 zł. Ile kosztuje jeden zeszyt?", expression: "4x = 28", answer: 7, suffix: "zł", explanation: "Dzielimy obie strony przez 4: x = 7. Cztery zeszyty po 7 zł kosztują 28 zł.", visual: "story", xValue: 7 },
  { id: "ss3", kind: "numeric", prompt: "Cała trasa ma 13 km. Po przejściu 5 km zostało x km. Ile kilometrów zostało?", expression: "5 + x = 13", answer: 8, suffix: "km", explanation: "Odejmujemy 5 od obu stron: x = 8. Przebyte 5 km i pozostałe 8 km dają 13 km.", visual: "story", xValue: 8 },
  { id: "ss4", kind: "numeric", prompt: "Liczba x jest o 9 większa od 16. Znajdź tę liczbę.", expression: "x − 9 = 16", answer: 25, explanation: "Dodajemy 9 po obu stronach: x = 25. Sprawdzenie: 25 − 9 = 16.", visual: "story", xValue: 25 },
  { id: "ss5", kind: "numeric", prompt: "W trzech pudełkach jest po tyle samo piłek. Razem jest ich 21. Ile piłek jest w jednym pudełku?", expression: "3x = 21", answer: 7, suffix: "piłek", explanation: "Dzielimy obie strony przez 3: x = 7.", visual: "story", xValue: 7 },
];

export function algebraActivityFromStageId(stageId: string): AlgebraActivity {
  const matchers: Array<[string, AlgebraActivity]> = [
    ["meet-x", "meet-x"], ["same-x", "same-x"], ["translate", "translate-words"], ["build-expression", "build-expression"],
    ["machine-intro", "substitution-machine"], ["evaluate", "evaluate-expression"], ["like-terms", "like-terms"], ["simplify", "simplify-expression"],
    ["equation-meaning", "equation-meaning"], ["write-equation", "write-equation"], ["test-solution", "test-solution"],
    ["balance-solve", "balance-solve"], ["inverse", "inverse-operation"], ["story-solve", "story-solve"], ["story", "story-equation"], ["review", "review-mission"],
  ];
  return matchers.find(([fragment]) => stageId.includes(fragment))?.[1] ?? "meet-x";
}

export function algebraTopicNumberFromStageId(stageId: string): number {
  return Number(/^m6-8-(\d+)-/u.exec(stageId)?.[1] ?? 1);
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(seed) % items.length]!;
}

export function generateAlgebraTask(activity: AlgebraActivity, seed: number): AlgebraTask | null {
  if (activity === "evaluate-expression") return pick(evaluateTasks, seed);
  if (activity === "simplify-expression") return pick(simplifyTasks, seed);
  if (activity === "balance-solve" || activity === "inverse-operation") return pick(solveTasks, seed);
  if (activity === "story-solve") return pick(storySolveTasks, seed);
  if (activity in choices) return pick(choices[activity as keyof typeof choices], seed);
  return null;
}
