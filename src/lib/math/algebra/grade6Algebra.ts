export type AlgebraActivity =
  | "meet-x"
  | "same-x"
  | "translate-words"
  | "write-story-expression"
  | "build-expression"
  | "substitution-machine"
  | "evaluate-expression"
  | "write-substitution"
  | "like-terms"
  | "simplify-expression"
  | "simplify-multiply-divide"
  | "simplify-mixed"
  | "equation-meaning"
  | "write-equation"
  | "scale-to-equation"
  | "equation-to-scale"
  | "write-basic-equation"
  | "write-story-equation"
  | "test-solution"
  | "balance-solve"
  | "inverse-operation"
  | "story-equation"
  | "story-solve"
  | "review-mission";

export type AlgebraVisual = "box" | "machine" | "tiles" | "balance" | "balance-equation" | "story" | "relationship" | "operation-words" | "word-problem" | "simplify-work" | "like-terms";

interface AlgebraTaskBase {
  id: string;
  prompt: string;
  explanation: string;
  visual: AlgebraVisual;
  expression?: string;
  sourceExpression?: string;
  leftX?: number;
  leftUnits?: number;
  rightX?: number;
  rightUnits?: number;
  xValue?: number;
  xDisplay?: string;
  facts?: string[];
  sought?: string;
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
  substitutionAnswer?: string;
}

export interface AlgebraWrittenTask extends AlgebraTaskBase {
  kind: "written";
  answer: string;
  acceptedAnswers?: string[];
  xMeaningOptions?: string[];
  xMeaningAnswer?: string;
}

export interface AlgebraBalanceBuildTask extends AlgebraTaskBase {
  kind: "balance-builder";
  answer: string;
  targetLeftX: number;
  targetLeftUnits: number;
  targetRightX: number;
  targetRightUnits: number;
}

export type AlgebraTask = AlgebraChoiceTask | AlgebraNumericTask | AlgebraWrittenTask | AlgebraBalanceBuildTask;

const choices: Record<Exclude<AlgebraActivity, "meet-x" | "same-x" | "write-story-expression" | "substitution-machine" | "equation-meaning" | "scale-to-equation" | "equation-to-scale" | "write-basic-equation" | "write-story-equation" | "balance-solve" | "inverse-operation" | "evaluate-expression" | "write-substitution" | "simplify-expression" | "simplify-multiply-divide" | "simplify-mixed" | "story-solve">, AlgebraChoiceTask[]> = {
  "translate-words": [
    { id: "t1", kind: "choice", prompt: "Który zapis oznacza liczbę o 2 większą od x?", options: ["x + 2", "2x", "x − 2", "2 − x"], answer: "x + 2", explanation: "„O 2 większa” oznacza, że do liczby x dodajemy 2.", visual: "relationship" },
    { id: "t2", kind: "choice", prompt: "Który zapis oznacza liczbę o 2 mniejszą od x?", options: ["x − 2", "2 − x", "2x", "x + 2"], answer: "x − 2", explanation: "„O 2 mniejsza od x” oznacza, że od liczby x odejmujemy 2.", visual: "relationship" },
    { id: "t3", kind: "choice", prompt: "Który zapis oznacza liczbę 2 razy większą od x?", options: ["2x", "x + 2", "x/2", "2 − x"], answer: "2x", explanation: "Dwa razy tyle co x to dwie jednakowe liczby x, czyli 2x.", visual: "relationship" },
    { id: "t4", kind: "choice", prompt: "Który zapis oznacza liczbę 2 razy mniejszą od x?", options: ["x/2", "2x", "x − 2", "2/x"], answer: "x/2", explanation: "Dwa razy mniej oznacza połowę liczby x, więc dzielimy x przez 2.", visual: "relationship" },
    { id: "t5", kind: "choice", prompt: "Liczba o 3 większa od a — wybierz poprawny zapis.", options: ["a + 3", "3a", "a − 3", "3 − a"], answer: "a + 3", explanation: "Zwrot „o 3 większa” prowadzi do dodawania: a + 3.", visual: "relationship" },
    { id: "t6", kind: "choice", prompt: "Liczba o 3 mniejsza od a — wybierz poprawny zapis.", options: ["a − 3", "3 − a", "a + 3", "3a"], answer: "a − 3", explanation: "Zaczynamy od liczby a i zmniejszamy ją o 3.", visual: "relationship" },
    { id: "t7", kind: "choice", prompt: "Liczba 3 razy większa od a — wybierz poprawny zapis.", options: ["3a", "a + 3", "a/3", "a − 3"], answer: "3a", explanation: "Trzy razy tyle co a zapisujemy jako 3a.", visual: "relationship" },
    { id: "t8", kind: "choice", prompt: "Liczba 3 razy mniejsza od a — wybierz poprawny zapis.", options: ["a/3", "3a", "a − 3", "3/a"], answer: "a/3", explanation: "Trzy razy mniej oznacza trzecią część liczby a.", visual: "relationship" },
    { id: "t9", kind: "choice", prompt: "Wybierz zapis sumy liczb 6 i x.", options: ["6 + x", "6 − x", "6x", "6/x"], answer: "6 + x", explanation: "Suma oznacza dodawanie, dlatego zapisujemy 6 + x.", visual: "operation-words" },
    { id: "t10", kind: "choice", prompt: "Wybierz zapis różnicy liczb 6 i x.", options: ["6 − x", "x − 6", "6 + x", "6x"], answer: "6 − x", explanation: "W różnicy zachowujemy kolejność podanych liczb: od 6 odejmujemy x.", visual: "operation-words" },
    { id: "t11", kind: "choice", prompt: "Wybierz zapis iloczynu liczb 6 i x.", options: ["6x", "6 + x", "6 − x", "6/x"], answer: "6x", explanation: "Iloczyn oznacza mnożenie. Znak mnożenia między liczbą i literą pomijamy.", visual: "operation-words" },
    { id: "t12", kind: "choice", prompt: "Wybierz zapis ilorazu liczb 6 i x.", options: ["6/x", "x/6", "6x", "6 − x"], answer: "6/x", explanation: "Iloraz liczb 6 i x oznacza, że liczbę 6 dzielimy przez x.", visual: "operation-words" },
    { id: "t13", kind: "choice", prompt: "Który zapis oznacza podwojoną liczbę y?", options: ["2y", "y + 2", "y²", "y/2"], answer: "2y", explanation: "Podwojona liczba y to dwa razy y, czyli 2y.", visual: "operation-words" },
    { id: "t14", kind: "choice", prompt: "Który zapis oznacza połowę liczby y?", options: ["y/2", "2y", "y − 2", "2/y"], answer: "y/2", explanation: "Połowę otrzymujemy, dzieląc liczbę y przez 2.", visual: "operation-words" },
    { id: "t15", kind: "choice", prompt: "Który zapis oznacza kwadrat liczby y?", options: ["y²", "2y", "y + 2", "y/2"], answer: "y²", explanation: "Kwadrat liczby y to iloczyn y · y, który zapisujemy jako y².", visual: "operation-words" },
    { id: "t16", kind: "choice", prompt: "Który zapis oznacza podwojoną liczbę y zmniejszoną o 2?", options: ["2y − 2", "2(y − 2)", "y − 2", "2y + 2"], answer: "2y − 2", explanation: "Najpierw podwajamy y, otrzymując 2y, a potem odejmujemy 2.", visual: "operation-words" },
  ],
  "build-expression": [
    { id: "b1", kind: "choice", prompt: "Który zapis oznacza x + x + x + x?", options: ["4x", "x + 4", "x⁴", "4 + x"], answer: "4x", explanation: "Cztery składniki równe x zapisujemy krócej jako 4x.", visual: "tiles" },
    { id: "b2", kind: "choice", prompt: "Co oznacza zapis 6x?", options: ["Sześć grup po x", "x powiększone o 6", "x pomniejszone o 6", "Szósta potęga x"], answer: "Sześć grup po x", explanation: "Współczynnik 6 mówi, ile jednakowych grup po x mamy.", visual: "tiles" },
    { id: "b3", kind: "choice", prompt: "Obwód trójkąta o bokach x, x i 5 opisuje…", options: ["2x + 5", "x + 5", "2x · 5", "x² + 5"], answer: "2x + 5", explanation: "Dwa boki mają długość x, więc x + x + 5 = 2x + 5.", visual: "story" },
    { id: "b4", kind: "choice", prompt: "Na dwóch półkach stoi po x książek i dodatkowo 3 książki. Razem jest…", options: ["2x + 3", "2(x + 3)", "x + 5", "3x + 2"], answer: "2x + 3", explanation: "Dwie półki po x dają 2x, a trzy dodatkowe książki dodajemy osobno.", visual: "tiles" },
  ],
  "like-terms": [
    { id: "l1", kind: "choice", prompt: "Które dwa składniki są wyrazami podobnymi?", options: ["3x i 5x", "3x i 5", "x i x²", "2 i 2x"], answer: "3x i 5x", explanation: "Oba składniki mają dokładnie tę samą część literową: x.", visual: "like-terms" },
    { id: "l2", kind: "choice", prompt: "Które elementy możemy połączyć w jedną grupę?", options: ["2x + 4x", "2x + 4", "x + 4²", "2 + 4x"], answer: "2x + 4x", explanation: "Wyrazy 2x i 4x mają taką samą literę x, dlatego możemy je połączyć.", visual: "like-terms" },
    { id: "l3", kind: "choice", prompt: "Dlaczego 2x + 3 nie jest równe 5x?", options: ["Wyrazy z x i liczby to różne rodzaje", "Bo nie wolno dodawać", "Bo x zawsze jest zerem", "Bo 2 + 3 nie daje 5"], answer: "Wyrazy z x i liczby to różne rodzaje", explanation: "Wyrazów z x nie łączymy bezpośrednio z liczbami bez x, tak jak kwiatków nie łączymy z innymi przedmiotami.", visual: "like-terms" },
    { id: "l4", kind: "choice", prompt: "Który zapis jest równy x + x + 4 + 2?", options: ["2x + 6", "8x", "2x + 4", "x + 6"], answer: "2x + 6", explanation: "Łączymy dwa x oraz osobno liczby 4 i 2.", visual: "like-terms" },
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

const writtenExpressionTasks: AlgebraWrittenTask[] = [
  { id: "wt1", kind: "written", prompt: "W dużym opakowaniu jest 12 jaj, a w małym 6 jaj. Ile jaj jest w x dużych opakowaniach i 7 małych opakowaniach? Zapisz wyrażenie i oblicz część bez x.", facts: ["duże opakowanie: 12 jaj", "małe opakowanie: 6 jaj", "liczba dużych opakowań: x", "liczba małych opakowań: 7"], answer: "12x+42", explanation: "W x dużych opakowaniach jest 12x jaj. W siedmiu małych jest 7 · 6 = 42 jaj, więc razem mamy 12x + 42.", visual: "word-problem" },
  { id: "wt2", kind: "written", prompt: "W jednym pudełku jest 8 flamastrów. Ania kupiła x takich pudełek i jeszcze 5 pojedynczych flamastrów. Zapisz wyrażenie opisujące liczbę wszystkich flamastrów.", facts: ["jedno pudełko: 8 flamastrów", "liczba pudełek: x", "pojedyncze flamastry: 5"], answer: "8x+5", explanation: "Pudełka zawierają razem 8x flamastrów, a pięć pojedynczych dodajemy osobno: 8x + 5.", visual: "word-problem" },
  { id: "wt3", kind: "written", prompt: "Bilet dla osoby dorosłej kosztuje 18 zł, a bilet ulgowy 9 zł. Do kina idzie x dorosłych i 4 uczniów. Zapisz wyrażenie opisujące koszt wszystkich biletów.", facts: ["bilet dla dorosłego: 18 zł", "liczba dorosłych: x", "bilet ulgowy: 9 zł", "liczba uczniów: 4"], answer: "18x+36", explanation: "Bilety dorosłych kosztują 18x zł, a cztery bilety ulgowe 4 · 9 = 36 zł. Razem: 18x + 36.", visual: "word-problem" },
  { id: "wt4", kind: "written", prompt: "Na każdej z x półek stoi po 25 książek. Wypożyczono 12 książek. Zapisz wyrażenie opisujące liczbę książek, które zostały na półkach.", facts: ["liczba półek: x", "książek na półce: 25", "wypożyczone książki: 12"], answer: "25x−12", explanation: "Na półkach było 25x książek. Po wypożyczeniu 12 zostaje 25x − 12.", visual: "word-problem" },
  { id: "wt5", kind: "written", prompt: "W ogrodzie posadzono x rzędów po 6 czerwonych tulipanów oraz 3 rzędy po 4 żółte tulipany. Zapisz wyrażenie opisujące liczbę wszystkich tulipanów.", facts: ["czerwone tulipany: x rzędów po 6", "żółte tulipany: 3 rzędy po 4"], answer: "6x+12", explanation: "Czerwonych tulipanów jest 6x, a żółtych 3 · 4 = 12. Razem: 6x + 12.", visual: "word-problem" },
  { id: "wt6", kind: "written", prompt: "Na dużej tacy mieści się 15 bułek, a na małej 8. Piekarz przygotował x dużych tac i 4 małe. Zapisz wyrażenie opisujące liczbę wszystkich bułek.", facts: ["duża taca: 15 bułek", "liczba dużych tac: x", "mała taca: 8 bułek", "liczba małych tac: 4"], answer: "15x+32", explanation: "Na dużych tacach jest 15x bułek, a na czterech małych 4 · 8 = 32. Razem: 15x + 32.", visual: "word-problem" },
];

const evaluateTasks: AlgebraNumericTask[] = [
  { id: "e1", kind: "numeric", prompt: "Oblicz wartość 2x + 3 dla x = 4.", sourceExpression: "2x + 3", expression: "2 · 4 + 3", answer: 11, explanation: "Najpierw 2 · 4 = 8, potem 8 + 3 = 11.", visual: "machine", xValue: 4 },
  { id: "e2", kind: "numeric", prompt: "Oblicz wartość 5x − 2 dla x = 3.", sourceExpression: "5x − 2", expression: "5 · 3 − 2", answer: 13, explanation: "5 · 3 = 15, a 15 − 2 = 13.", visual: "machine", xValue: 3 },
  { id: "e3", kind: "numeric", prompt: "Oblicz wartość 4 + 3x dla x = 6.", sourceExpression: "4 + 3x", expression: "4 + 3 · 6", answer: 22, explanation: "Najpierw mnożenie: 3 · 6 = 18, potem 4 + 18 = 22.", visual: "machine", xValue: 6 },
  { id: "e4", kind: "numeric", prompt: "Oblicz wartość 24 − 2x dla x = 7.", sourceExpression: "24 − 2x", expression: "24 − 2 · 7", answer: 10, explanation: "2 · 7 = 14, a 24 − 14 = 10.", visual: "machine", xValue: 7 },
  { id: "e5", kind: "numeric", prompt: "Oblicz wartość 3x + 4 dla x = −2.", sourceExpression: "3x + 4", expression: "3 · (−2) + 4", answer: -2, explanation: "Najpierw 3 · (−2) = −6, potem −6 + 4 = −2.", visual: "machine", xValue: -2, xDisplay: "−2" },
  { id: "e6", kind: "numeric", prompt: "Oblicz wartość 5 − 2x dla x = −4.", sourceExpression: "5 − 2x", expression: "5 − 2 · (−4)", answer: 13, explanation: "2 · (−4) = −8, więc 5 − (−8) = 13.", visual: "machine", xValue: -4, xDisplay: "−4" },
  { id: "e7", kind: "numeric", prompt: "Oblicz wartość 4x + 1 dla x = 1/2.", sourceExpression: "4x + 1", expression: "4 · (1/2) + 1", answer: 3, explanation: "Cztery razy jedna druga to 2, a 2 + 1 = 3.", visual: "machine", xValue: 0.5, xDisplay: "1/2" },
  { id: "e8", kind: "numeric", prompt: "Oblicz wartość 8x − 1 dla x = 3/4.", sourceExpression: "8x − 1", expression: "8 · (3/4) − 1", answer: 5, explanation: "Osiem razy trzy czwarte to 6, a 6 − 1 = 5.", visual: "machine", xValue: 0.75, xDisplay: "3/4" },
];

const writtenSubstitutionTasks: AlgebraNumericTask[] = [
  { id: "ws1", kind: "numeric", prompt: "Oblicz wartość wyrażenia 2x + 1 dla x = −4.", sourceExpression: "2x + 1", expression: "2 · (−4) + 1", substitutionAnswer: "2 · (−4) + 1", answer: -7, explanation: "Po podstawieniu zapisujemy 2 · (−4) + 1. Następnie −8 + 1 = −7.", visual: "machine", xValue: -4, xDisplay: "−4" },
  { id: "ws2", kind: "numeric", prompt: "Oblicz wartość wyrażenia 5 − 3x dla x = −2.", sourceExpression: "5 − 3x", expression: "5 − 3 · (−2)", substitutionAnswer: "5 − 3 · (−2)", answer: 11, explanation: "Po podstawieniu zapisujemy 5 − 3 · (−2). Następnie 5 − (−6) = 11.", visual: "machine", xValue: -2, xDisplay: "−2" },
  { id: "ws3", kind: "numeric", prompt: "Oblicz wartość wyrażenia 4x − 3 dla x = −3.", sourceExpression: "4x − 3", expression: "4 · (−3) − 3", substitutionAnswer: "4 · (−3) − 3", answer: -15, explanation: "Po podstawieniu zapisujemy 4 · (−3) − 3. Następnie −12 − 3 = −15.", visual: "machine", xValue: -3, xDisplay: "−3" },
  { id: "ws4", kind: "numeric", prompt: "Oblicz wartość wyrażenia 2(x + 5) dla x = −1.", sourceExpression: "2(x + 5)", expression: "2 · (−1 + 5)", substitutionAnswer: "2 · (−1 + 5)", answer: 8, explanation: "Po podstawieniu zapisujemy 2 · (−1 + 5). Najpierw obliczamy nawias: −1 + 5 = 4, a potem 2 · 4 = 8.", visual: "machine", xValue: -1, xDisplay: "−1" },
];

const scaleToEquationTasks: AlgebraWrittenTask[] = [
  { id: "se1", kind: "written", prompt: "Na lewej szalce znajduje się x i 3, a na prawej 8. Zapisz równanie przedstawione na wadze.", answer: "x+3=8", acceptedAnswers: ["8=x+3"], explanation: "Lewa szalka przedstawia x + 3, a prawa liczbę 8, dlatego zapisujemy x + 3 = 8.", visual: "balance-equation", leftX: 1, leftUnits: 3, rightUnits: 8, xValue: 5 },
  { id: "se2", kind: "written", prompt: "Na lewej szalce znajdują się dwa x, a na prawej 12. Zapisz równanie przedstawione na wadze.", answer: "2x=12", acceptedAnswers: ["12=2x"], explanation: "Dwa jednakowe x mają razem taką samą wartość jak 12, więc 2x = 12.", visual: "balance-equation", leftX: 2, rightUnits: 12, xValue: 6 },
  { id: "se3", kind: "written", prompt: "Na lewej szalce znajduje się 15, a na prawej x i 4. Zapisz równanie przedstawione na wadze.", answer: "15=x+4", acceptedAnswers: ["x+4=15"], explanation: "Lewa szalka ma wartość 15, a prawa x + 4, dlatego 15 = x + 4.", visual: "balance-equation", leftUnits: 15, rightX: 1, rightUnits: 4, xValue: 11 },
  { id: "se4", kind: "written", prompt: "Na lewej szalce znajdują się trzy x i 2, a na prawej 17. Zapisz równanie przedstawione na wadze.", answer: "3x+2=17", acceptedAnswers: ["17=3x+2"], explanation: "Trzy x oraz 2 równoważą 17, więc zapisujemy 3x + 2 = 17.", visual: "balance-equation", leftX: 3, leftUnits: 2, rightUnits: 17, xValue: 5 },
];

const equationToScaleTasks: AlgebraBalanceBuildTask[] = [
  { id: "es1", kind: "balance-builder", prompt: "Ułóż na wadze równanie x + 4 = 11.", expression: "x + 4 = 11", answer: "x+4=11", explanation: "Na lewej szalce powinny znaleźć się x i 4, a na prawej 11.", visual: "balance-equation", targetLeftX: 1, targetLeftUnits: 4, targetRightX: 0, targetRightUnits: 11, xValue: 7 },
  { id: "es2", kind: "balance-builder", prompt: "Ułóż na wadze równanie 3x = 18.", expression: "3x = 18", answer: "3x=18", explanation: "Na lewej szalce powinny znaleźć się trzy x, a na prawej 18.", visual: "balance-equation", targetLeftX: 3, targetLeftUnits: 0, targetRightX: 0, targetRightUnits: 18, xValue: 6 },
  { id: "es3", kind: "balance-builder", prompt: "Ułóż na wadze równanie 14 = x + 5.", expression: "14 = x + 5", answer: "14=x+5", explanation: "Na lewej szalce powinna znaleźć się liczba 14, a na prawej x i 5.", visual: "balance-equation", targetLeftX: 0, targetLeftUnits: 14, targetRightX: 1, targetRightUnits: 5, xValue: 9 },
  { id: "es4", kind: "balance-builder", prompt: "Ułóż na wadze równanie 2x + 3 = 13.", expression: "2x + 3 = 13", answer: "2x+3=13", explanation: "Na lewej szalce powinny znaleźć się dwa x i 3, a na prawej 13.", visual: "balance-equation", targetLeftX: 2, targetLeftUnits: 3, targetRightX: 0, targetRightUnits: 13, xValue: 5 },
];

const basicEquationTasks: AlgebraWrittenTask[] = [
  { id: "be1", kind: "written", prompt: "Liczba 18 jest 2 razy większa od x. Zapisz równanie.", answer: "18=2x", acceptedAnswers: ["2x=18"], explanation: "Dwa razy x to 2x, a jego wartość wynosi 18, dlatego 18 = 2x.", visual: "relationship" },
  { id: "be2", kind: "written", prompt: "Liczba x powiększona o 5 jest równa 12. Zapisz równanie.", answer: "x+5=12", acceptedAnswers: ["12=x+5"], explanation: "Powiększamy x o 5 i otrzymujemy 12, więc x + 5 = 12.", visual: "relationship" },
  { id: "be3", kind: "written", prompt: "Liczba 20 jest o 4 większa od x. Zapisz równanie.", answer: "20=x+4", acceptedAnswers: ["x+4=20"], explanation: "Liczba o 4 większa od x to x + 4, dlatego 20 = x + 4.", visual: "relationship" },
  { id: "be4", kind: "written", prompt: "Liczba x pomniejszona o 3 jest równa 9. Zapisz równanie.", answer: "x−3=9", acceptedAnswers: ["9=x−3"], explanation: "Od x odejmujemy 3 i otrzymujemy 9, więc x − 3 = 9.", visual: "relationship" },
  { id: "be5", kind: "written", prompt: "Trzykrotność liczby x jest równa 24. Zapisz równanie.", answer: "3x=24", acceptedAnswers: ["24=3x"], explanation: "Trzykrotność x zapisujemy jako 3x, dlatego 3x = 24.", visual: "relationship" },
  { id: "be6", kind: "written", prompt: "Liczba 14 jest równa podwojonej liczbie x powiększonej o 4. Zapisz równanie.", answer: "14=2x+4", acceptedAnswers: ["2x+4=14"], explanation: "Podwojona liczba x to 2x. Po powiększeniu o 4 otrzymujemy 14, więc 14 = 2x + 4.", visual: "relationship" },
];

const storyEquationWriteTasks: AlgebraWrittenTask[] = [
  { id: "swe1", kind: "written", prompt: "Kasia miała pewną liczbę koralików. Dostała 7 koralików i ma teraz 19. Zapisz równanie opisujące tę sytuację.", facts: ["Kasia dostała 7 koralików", "Teraz ma 19 koralików"], sought: "Liczba koralików Kasi na początku", xMeaningOptions: ["liczbę koralików Kasi na początku", "liczbę otrzymanych koralików", "liczbę koralików na końcu"], xMeaningAnswer: "liczbę koralików Kasi na początku", answer: "x+7=19", acceptedAnswers: ["19=x+7"], explanation: "x oznacza liczbę koralików na początku. Po dodaniu 7 otrzymujemy 19, więc x + 7 = 19.", visual: "word-problem" },
  { id: "swe2", kind: "written", prompt: "Cztery jednakowe zeszyty kosztują razem 28 zł. Zapisz równanie, które pozwala obliczyć cenę jednego zeszytu.", facts: ["Liczba zeszytów: 4", "Łączny koszt: 28 zł"], sought: "Cena jednego zeszytu", xMeaningOptions: ["cenę jednego zeszytu", "liczbę zeszytów", "łączny koszt zakupów"], xMeaningAnswer: "cenę jednego zeszytu", answer: "4x=28", acceptedAnswers: ["28=4x"], explanation: "x oznacza cenę jednego zeszytu. Cztery ceny x dają razem 28 zł, więc 4x = 28.", visual: "word-problem" },
  { id: "swe3", kind: "written", prompt: "Cała trasa ma 13 km. Po przejściu 5 km zostało jeszcze kilka kilometrów. Zapisz równanie opisujące tę sytuację.", facts: ["Cała trasa: 13 km", "Przebyta droga: 5 km"], sought: "Liczba kilometrów pozostałych do przejścia", xMeaningOptions: ["liczbę kilometrów pozostałych do przejścia", "długość całej trasy", "liczbę przebytych kilometrów"], xMeaningAnswer: "liczbę kilometrów pozostałych do przejścia", answer: "5+x=13", acceptedAnswers: ["x+5=13", "13=5+x", "13=x+5"], explanation: "x oznacza pozostałą drogę. Droga przebyta i pozostała tworzą całą trasę, więc 5 + x = 13.", visual: "word-problem" },
  { id: "swe4", kind: "written", prompt: "Mama ma 40 lat i jest o 28 lat starsza od Oli. Zapisz równanie, które pozwala obliczyć wiek Oli.", facts: ["Wiek mamy: 40 lat", "Mama jest starsza od Oli o 28 lat"], sought: "Wiek Oli", xMeaningOptions: ["wiek Oli", "wiek mamy", "różnicę wieku mamy i Oli"], xMeaningAnswer: "wiek Oli", answer: "x+28=40", acceptedAnswers: ["40=x+28"], explanation: "x oznacza wiek Oli. Po dodaniu 28 otrzymujemy wiek mamy, więc x + 28 = 40.", visual: "word-problem" },
];

const simplifyTasks: AlgebraWrittenTask[] = [
  { id: "u1", kind: "written", prompt: "Uprość wyrażenie 3x + 2x. Wpisz całe uproszczone wyrażenie.", sourceExpression: "3x + 2x", answer: "5x", explanation: "Dodajemy współczynniki: 3 + 2 = 5, a litera x pozostaje.", visual: "simplify-work" },
  { id: "u2", kind: "written", prompt: "Uprość wyrażenie 9x − 4x. Wpisz całe uproszczone wyrażenie.", sourceExpression: "9x − 4x", answer: "5x", explanation: "Odejmujemy współczynniki: 9 − 4 = 5, więc otrzymujemy 5x.", visual: "simplify-work" },
  { id: "u3", kind: "written", prompt: "Uprość wyrażenie x + 6x. Wpisz całe uproszczone wyrażenie.", sourceExpression: "x + 6x", answer: "7x", explanation: "Przy pierwszym x stoi współczynnik 1. Zatem 1x + 6x = 7x.", visual: "simplify-work" },
  { id: "u4", kind: "written", prompt: "Uprość wyrażenie 12x − 7x + 2x. Wpisz całe uproszczone wyrażenie.", sourceExpression: "12x − 7x + 2x", answer: "7x", explanation: "Obliczamy współczynniki od lewej: 12 − 7 + 2 = 7.", visual: "simplify-work" },
  { id: "u5", kind: "written", prompt: "Uprość wyrażenie 4x + 3 − 2x. Wpisz całe uproszczone wyrażenie.", sourceExpression: "4x + 3 − 2x", answer: "2x+3", explanation: "Łączymy 4x i −2x, otrzymując 2x. Liczba 3 pozostaje osobno.", visual: "simplify-work" },
  { id: "u6", kind: "written", prompt: "Uprość wyrażenie 10x − 3x − 2. Wpisz całe uproszczone wyrażenie.", sourceExpression: "10x − 3x − 2", answer: "7x−2", explanation: "10x − 3x = 7x, a liczby −2 nie łączymy z wyrazem zawierającym x.", visual: "simplify-work" },
];

const simplifyMultiplyDivideTasks: AlgebraWrittenTask[] = [
  { id: "md1", kind: "written", prompt: "Uprość wyrażenie (−3) · 2x.", sourceExpression: "(−3) · 2x", answer: "−6x", explanation: "Mnożymy liczby −3 i 2. Litera x pozostaje, więc otrzymujemy −6x.", visual: "simplify-work" },
  { id: "md2", kind: "written", prompt: "Uprość wyrażenie 4x · (−2).", sourceExpression: "4x · (−2)", answer: "−8x", explanation: "Iloczyn liczby dodatniej i ujemnej jest ujemny. 4 · (−2) = −8, więc wynik to −8x.", visual: "simplify-work" },
  { id: "md3", kind: "written", prompt: "Uprość wyrażenie 12x/3.", sourceExpression: "12x/3", answer: "4x", explanation: "Dzielimy współczynnik 12 przez 3. Litera x pozostaje, więc wynik to 4x.", visual: "simplify-work" },
  { id: "md4", kind: "written", prompt: "Uprość wyrażenie −18x/6.", sourceExpression: "−18x/6", answer: "−3x", explanation: "Dzielimy −18 przez 6 i otrzymujemy −3. Litera x pozostaje, więc wynik to −3x.", visual: "simplify-work" },
  { id: "md5", kind: "written", prompt: "Uprość wyrażenie 1/2 · 8x.", sourceExpression: "1/2 · 8x", answer: "4x", explanation: "Połowa z 8x to 4x.", visual: "simplify-work" },
  { id: "md6", kind: "written", prompt: "Uprość wyrażenie 3/4 · 8x.", sourceExpression: "3/4 · 8x", answer: "6x", explanation: "Jedna czwarta z 8x to 2x, więc trzy czwarte z 8x to 6x.", visual: "simplify-work" },
];

const simplifyMixedTasks: AlgebraWrittenTask[] = [
  { id: "mx1", kind: "written", prompt: "Uprość wyrażenie 2 · 3x + x. Pamiętaj o kolejności działań.", sourceExpression: "2 · 3x + x", answer: "7x", explanation: "Najpierw 2 · 3x = 6x, a następnie 6x + x = 7x.", visual: "simplify-work" },
  { id: "mx2", kind: "written", prompt: "Uprość wyrażenie 5x + 12x/3. Pamiętaj o kolejności działań.", sourceExpression: "5x + 12x/3", answer: "9x", explanation: "Najpierw dzielimy 12x przez 3 i otrzymujemy 4x, a potem 5x + 4x = 9x.", visual: "simplify-work" },
  { id: "mx3", kind: "written", prompt: "Uprość wyrażenie 4 · 2x − 3x. Pamiętaj o kolejności działań.", sourceExpression: "4 · 2x − 3x", answer: "5x", explanation: "Najpierw 4 · 2x = 8x, następnie 8x − 3x = 5x.", visual: "simplify-work" },
  { id: "mx4", kind: "written", prompt: "Uprość wyrażenie 18x/3 + 2x. Pamiętaj o kolejności działań.", sourceExpression: "18x/3 + 2x", answer: "8x", explanation: "Najpierw dzielimy 18x przez 3 i otrzymujemy 6x, potem 6x + 2x = 8x.", visual: "simplify-work" },
  { id: "mx5", kind: "written", prompt: "Uprość wyrażenie 3 · 4x − 8x/2. Pamiętaj o kolejności działań.", sourceExpression: "3 · 4x − 8x/2", answer: "8x", explanation: "Mnożenie i dzielenie wykonujemy najpierw: otrzymujemy 12x − 4x = 8x.", visual: "simplify-work" },
  { id: "mx6", kind: "written", prompt: "Uprość wyrażenie 24x/6 + 2 · 3x − x. Pamiętaj o kolejności działań.", sourceExpression: "24x/6 + 2 · 3x − x", answer: "9x", explanation: "Najpierw otrzymujemy 4x + 6x − x, a następnie 9x.", visual: "simplify-work" },
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
    ["meet-x", "meet-x"], ["same-x", "same-x"], ["write-story-expression", "write-story-expression"], ["translate", "translate-words"], ["build-expression", "build-expression"],
    ["machine-intro", "substitution-machine"], ["evaluate-exit", "write-substitution"], ["evaluate", "evaluate-expression"], ["like-terms", "like-terms"], ["simplify-multiply-divide", "simplify-multiply-divide"], ["simplify-mixed", "simplify-mixed"], ["simplify", "simplify-expression"],
    ["equation-meaning", "equation-meaning"], ["scale-to-equation", "scale-to-equation"], ["equation-to-scale", "equation-to-scale"], ["basic-equation", "write-basic-equation"], ["story-equation-write", "write-story-equation"], ["write-equation", "write-equation"], ["test-solution", "test-solution"],
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
  if (activity === "write-story-expression") return pick(writtenExpressionTasks, seed);
  if (activity === "evaluate-expression") return pick(evaluateTasks, seed);
  if (activity === "write-substitution") return pick(writtenSubstitutionTasks, seed);
  if (activity === "scale-to-equation") return pick(scaleToEquationTasks, seed);
  if (activity === "equation-to-scale") return pick(equationToScaleTasks, seed);
  if (activity === "write-basic-equation") return pick(basicEquationTasks, seed);
  if (activity === "write-story-equation") return pick(storyEquationWriteTasks, seed);
  if (activity === "simplify-expression") return pick(simplifyTasks, seed);
  if (activity === "simplify-multiply-divide") return pick(simplifyMultiplyDivideTasks, seed);
  if (activity === "simplify-mixed") return pick(simplifyMixedTasks, seed);
  if (activity === "balance-solve" || activity === "inverse-operation") return pick(solveTasks, seed);
  if (activity === "story-solve") return pick(storySolveTasks, seed);
  if (activity in choices) return pick(choices[activity as keyof typeof choices], seed);
  return null;
}
