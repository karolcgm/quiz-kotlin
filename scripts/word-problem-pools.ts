import type { SectionKind } from "./section-kind-map.js";

export type Formula =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "sum3"
  | "missing_addend"
  | "groups"
  | "share"
  | "perimeter_rect"
  | "area_rect"
  | "percent_of"
  | "average3"
  | "chain_add_sub";

export type Skill =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "fractions"
  | "geometry"
  | "measurement"
  | "algebra"
  | "statistics";

export interface StoryDef {
  title: string;
  template: string;
  formula: Formula;
  skill: Skill;
  defaults: Record<string, number>;
  variableKeys: string[];
}

type Scale = { max: number; factor: number };

function scaleDefaults(defaults: Record<string, number>, scale: Scale): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(defaults)) {
    out[k] = Math.min(scale.max, Math.max(1, Math.round(v * scale.factor)));
  }
  return out;
}

function fixSubtract(a: Record<string, number>) {
  if (a.a !== undefined && a.b !== undefined && a.a <= a.b) [a.a, a.b] = [a.b + 3, a.a];
  if (a.a !== undefined && a.c !== undefined && a.c <= a.a) a.c = a.a + 5;
}

function fixDivide(a: Record<string, number>) {
  if (a.a !== undefined && a.b !== undefined && a.b > 0 && a.a % a.b !== 0) {
    a.a = a.b * Math.max(1, Math.round(a.a / a.b));
  }
}

function finalize(stories: StoryDef[], grade: number): StoryDef[] {
  const scale: Scale = {
    max: grade <= 2 ? 20 : grade <= 4 ? 100 : grade <= 6 ? 1000 : 10000,
    factor: grade <= 2 ? 0.35 : grade <= 4 ? 0.65 : grade <= 6 ? 1 : 1.4,
  };
  return stories.map((s) => {
    const defaults = scaleDefaults(s.defaults, scale);
    if (["subtract", "missing_addend", "chain_add_sub"].includes(s.formula)) fixSubtract(defaults);
    if (["divide", "share"].includes(s.formula)) fixDivide(defaults);
    return { ...s, defaults };
  });
}

const POOLS: Partial<Record<SectionKind, (grade: number) => StoryDef[]>> = {
  early_count: () =>
    finalize(
      [
        { title: "Jabłka na talerzu", template: "Na talerzu leżą {a} jabłka. Mama dokłada {b}. Ile jabłek jest teraz?", formula: "add", skill: "addition", defaults: { a: 4, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Ptaszki odleciały", template: "Na gałęzi siedziało {a} ptaków. {b} odleciało. Ile ptaków zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 9, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Kredki w piórniku", template: "Ania ma {a} kredek. Tomek ma {b}. Ile kredek mają razem?", formula: "add", skill: "addition", defaults: { a: 6, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Balony pękły", template: "Było {a} balonów. {b} pękło. Ile balonów zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 12, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Muszelki na plaży", template: "Ola zebrała {a} muszelek, potem jeszcze {b}. Ile ma muszelek?", formula: "add", skill: "addition", defaults: { a: 5, b: 7 }, variableKeys: ["a", "b"] },
        { title: "Cukierki zjedzone", template: "Filip miał {a} cukierków. Zjadł {b}. Ile mu zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 14, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Autobus", template: "W autobusie jest {a} osób. Wsiada {b}. Ile osób jedzie teraz?", formula: "add", skill: "addition", defaults: { a: 8, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Rybki w akwarium", template: "W akwarium pływa {a} rybek. {b} przeniesiono do innego zbiornika. Ile zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 11, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Trzy koszyki", template: "W koszykach jest {a}, {b} i {c} jabłek. Ile jabłek razem?", formula: "sum3", skill: "addition", defaults: { a: 3, b: 4, c: 5 }, variableKeys: ["a", "b", "c"] },
        { title: "Ile brakuje", template: "Zosia chce mieć {c} naklejek. Ma już {a}. Ile jej jeszcze brakuje?", formula: "missing_addend", skill: "subtraction", defaults: { a: 7, c: 12 }, variableKeys: ["a", "c"] },
        { title: "Klocki na podłodze", template: "Na podłodze leży {a} klocków. Kuba dokłada {b}. Ile klocków jest razem?", formula: "add", skill: "addition", defaults: { a: 9, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Naklejki rozdane", template: "Maja miała {a} naklejek. Dała koleżance {b}. Ile jej zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 15, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Kwiaty w wazonie", template: "W wazonie było {a} kwiatów. Dołożono {b}. Ile kwiatów jest teraz?", formula: "add", skill: "addition", defaults: { a: 5, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Ołówki zgubione", template: "W piórniku było {a} ołówków. {b} się zgubiło. Ile ołówków zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 13, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Motyle na łące", template: "Na łące lata {a} motyli. Doleciało {b}. Ile motyli jest na łące?", formula: "add", skill: "addition", defaults: { a: 4, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Ciastka na tacy", template: "Babcia upiekła {a} ciastek. Zjedzono {b}. Ile ciastek zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 16, b: 9 }, variableKeys: ["a", "b"] },
        { title: "Uczniowie w sali", template: "W sali jest {a} dziewczynek i {b} chłopców. Ile uczniów razem?", formula: "add", skill: "addition", defaults: { a: 11, b: 10 }, variableKeys: ["a", "b"] },
        { title: "Schody w górę", template: "Bartek wszedł na {a} stopni. Zszedł {b}. O ile stopni wyżej jest niż na początku?", formula: "subtract", skill: "subtraction", defaults: { a: 10, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Bilety do kina", template: "Rodzina kupiła {a} biletów. Znajomi dokupili {b}. Ile biletów mają razem?", formula: "add", skill: "addition", defaults: { a: 4, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Zdjęcia w albumie", template: "W albumie było {a} zdjęć. Wyrzucono {b} rozmazanych. Ile zdjęć zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 18, b: 7 }, variableKeys: ["a", "b"] },
      ],
      1,
    ),

  early_ops: (grade) =>
    finalize(
      [
        { title: "Owoce na stole", template: "Na stole leży {a} jabłek i {b} gruszek. Ile owoców razem?", formula: "add", skill: "addition", defaults: { a: 12, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Klocki zabrane", template: "Było {a} klocków. Ania zabrała {b}. Ile klocków zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 24, b: 9 }, variableKeys: ["a", "b"] },
        { title: "Rozkład liczby", template: "Liczba {c} składa się z {a} i drugiej liczby. Jaka to druga liczba?", formula: "missing_addend", skill: "subtraction", defaults: { a: 8, c: 15 }, variableKeys: ["a", "c"] },
        { title: "Zakupy w sklepie", template: "Mama kupiła {a} bułek i {b} rogali. Ile pieczywa razem?", formula: "add", skill: "addition", defaults: { a: 6, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Zużyte strony", template: "Z zeszytu z {a} kartek wykorzystano {b}. Ile kartek zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 32, b: 14 }, variableKeys: ["a", "b"] },
        { title: "Paczki naklejek", template: "Tomek ma {a} paczek po {b} naklejek. Ile naklejek ma razem?", formula: "groups", skill: "multiplication", defaults: { a: 4, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Równy podział", template: "{a} cukierków podzielono po równo między {b} dzieci. Ile dostało jedno dziecko?", formula: "share", skill: "division", defaults: { a: 20, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Wycieczka autobusem", template: "Autobus miał {a} pasażerów. Wsiadło {b}, wysiadło {c}. Ilu pasażerów jest teraz?", formula: "chain_add_sub", skill: "addition", defaults: { a: 25, b: 8, c: 5 }, variableKeys: ["a", "b", "c"] },
        { title: "Trzy pudełka", template: "W pudełkach jest {a}, {b} i {c} guzików. Ile guzików razem?", formula: "sum3", skill: "addition", defaults: { a: 12, b: 15, c: 18 }, variableKeys: ["a", "b", "c"] },
        { title: "Magazyn szkolny", template: "W magazynie było {a} ołówków. Dodano {b}. Ile jest teraz?", formula: "add", skill: "addition", defaults: { a: 45, b: 28 }, variableKeys: ["a", "b"] },
        { title: "Sprzedane gazety", template: "Kiosk miał {a} gazet. Sprzedano {b}. Ile zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 50, b: 23 }, variableKeys: ["a", "b"] },
        { title: "Rzędy krzeseł", template: "W sali jest {a} rzędów po {b} krzeseł. Ile krzeseł razem?", formula: "groups", skill: "multiplication", defaults: { a: 6, b: 7 }, variableKeys: ["a", "b"] },
        { title: "Grupy robocze", template: "{a} uczniów podzielono na {b} równych grup. Ile uczniów w jednej grupie?", formula: "share", skill: "division", defaults: { a: 28, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Brakująca składka", template: "Klasa ma zebrać {c} zł. Zebrano już {a} zł. Ile złotych jeszcze brakuje?", formula: "missing_addend", skill: "subtraction", defaults: { a: 35, c: 50 }, variableKeys: ["a", "c"] },
        { title: "Dwa sklepy", template: "W pierwszym sklepie jest {a} zabawek, w drugim {b}. Ile zabawek razem?", formula: "add", skill: "addition", defaults: { a: 34, b: 27 }, variableKeys: ["a", "b"] },
        { title: "Reszta z zakupów", template: "Pani miała {a} zł. Wydała {b} zł. Ile jej zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 40, b: 17 }, variableKeys: ["a", "b"] },
        { title: "Pudełka po jabłkach", template: "W {a} koszach leży po {b} jabłek. Ile jabłek razem?", formula: "groups", skill: "multiplication", defaults: { a: 5, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Rozdanie kart", template: "{a} kart rozdano po równo {b} graczom. Ile kart dostał jeden gracz?", formula: "share", skill: "division", defaults: { a: 36, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Trzy dni sprzedaży", template: "Sklep sprzedał {a}, {b} i {c} kg jabłek w trzech dniach. Ile kg razem?", formula: "sum3", skill: "addition", defaults: { a: 12, b: 15, c: 18 }, variableKeys: ["a", "b", "c"] },
        { title: "Biblioteka", template: "W bibliotece jest {a} książek dla dzieci i {b} dla dorosłych. Ile książek razem?", formula: "add", skill: "addition", defaults: { a: 120, b: 85 }, variableKeys: ["a", "b"] },
      ],
      grade,
    ),

  early_measure: (grade) =>
    finalize(
      [
        { title: "Długość ołówka", template: "Ołówek ma {a} cm, gumka ma {b} cm. O ile cm ołówek jest dłuższy?", formula: "subtract", skill: "measurement", defaults: { a: 12, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Wstążki razem", template: "Jedna wstążka ma {a} cm, druga {b} cm. Jaka jest łączna długość?", formula: "add", skill: "measurement", defaults: { a: 25, b: 18 }, variableKeys: ["a", "b"] },
        { title: "Reszta z monety", template: "Ania zapłaciła {a} zł za zeszyt za {b} zł. Ile groszy dostała reszty? (1 zł = 100 gr)", formula: "subtract", skill: "measurement", defaults: { a: 5, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Zakupy na targu", template: "Mama kupiła owoce za {a} zł i warzywa za {b} zł. Ile zapłaciła razem?", formula: "add", skill: "measurement", defaults: { a: 8, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Pełne godziny", template: "Lekcje trwają od {a}:00 do {b}:00. Ile godzin trwają lekcje?", formula: "subtract", skill: "measurement", defaults: { a: 8, b: 12 }, variableKeys: ["a", "b"] },
        { title: "Cięższa torba", template: "Torba waży {a} kg, plecak {b} kg. O ile kg torba jest cięższa?", formula: "subtract", skill: "measurement", defaults: { a: 5, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Waga razem", template: "Jabłka ważą {a} kg, gruszki {b} kg. Ile kg owoców razem?", formula: "add", skill: "measurement", defaults: { a: 2, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Linijka i zakładka", template: "Zakładka ma {a} cm, linijka {b} cm. Ile cm mają razem?", formula: "add", skill: "measurement", defaults: { a: 8, b: 15 }, variableKeys: ["a", "b"] },
        { title: "Reszta po zakupach", template: "Tata dał {a} zł. Syn kupił długopis za {b} zł. Ile złotych mu zostało?", formula: "subtract", skill: "measurement", defaults: { a: 10, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Dwa produkty", template: "Kredki kosztują {a} zł, zeszyt {b} zł. Ile trzeba zapłacić?", formula: "add", skill: "measurement", defaults: { a: 4, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Przerwa między lekcjami", template: "Pierwsza lekcja kończy się o {a}:00, druga zaczyna o {b}:00. Ile godzin przerwy?", formula: "subtract", skill: "measurement", defaults: { a: 9, b: 11 }, variableKeys: ["a", "b"] },
        { title: "Woda w butelkach", template: "Mała butelka ma {a} ml, duża {b} ml. Ile ml wody razem?", formula: "add", skill: "measurement", defaults: { a: 250, b: 500 }, variableKeys: ["a", "b"] },
        { title: "Różnica masy", template: "Paczka mąki waży {a} kg, paczka cukru {b} kg. O ile kg mąka jest cięższa?", formula: "subtract", skill: "measurement", defaults: { a: 5, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Obiad w stołówce", template: "Obiad kosztuje {a} zł, sok {b} zł. Ile kosztuje posiłek?", formula: "add", skill: "measurement", defaults: { a: 7, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Godziny nauki", template: "Uczeń uczył się od {a}:00 do {b}:00. Ile godzin trwała nauka?", formula: "subtract", skill: "measurement", defaults: { a: 15, b: 17 }, variableKeys: ["a", "b"] },
        { title: "Długość sznurka", template: "Ze sznurka o długości {a} cm odcięto {b} cm. Ile cm zostało?", formula: "subtract", skill: "measurement", defaults: { a: 30, b: 12 }, variableKeys: ["a", "b"] },
        { title: "Monety w skarbonce", template: "W skarbonce jest {a} zł i {b} zł w monetach. Ile złotych razem?", formula: "add", skill: "measurement", defaults: { a: 12, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Waga paczki", template: "Paczka waży {a} kg. Po dodaniu książki waży {b} kg. Ile kg waży książka?", formula: "subtract", skill: "measurement", defaults: { a: 5, b: 7 }, variableKeys: ["a", "b"] },
        { title: "Trzy zakupy", template: "Zeszyt kosztuje {a} zł, długopis {b} zł, gumka {c} zł. Ile kosztują razem?", formula: "sum3", skill: "measurement", defaults: { a: 3, b: 2, c: 1 }, variableKeys: ["a", "b", "c"] },
        { title: "Pomiar stołu", template: "Stół ma {a} cm długości. Krzesło ma {b} cm. O ile cm stół jest dłuższy?", formula: "subtract", skill: "measurement", defaults: { a: 120, b: 45 }, variableKeys: ["a", "b"] },
      ],
      grade,
    ),

  early_geometry: (grade) =>
    finalize(
      [
        { title: "Figury na kartce", template: "Na kartce narysowano {a} trójkątów i {b} kwadratów. Ile figur narysowano?", formula: "add", skill: "geometry", defaults: { a: 4, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Koła i prostokąty", template: "W wzorze jest {a} kół i {b} prostokątów. Ile figur w sumie?", formula: "add", skill: "geometry", defaults: { a: 5, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Elementy układanki", template: "Układanka ma {a} trójkątów i {b} kwadratów. Ile elementów trzeba ułożyć?", formula: "add", skill: "geometry", defaults: { a: 6, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Wzór kolorów", template: "Wzór ma {a} czerwonych i {b} niebieskich elementów. Ile elementów w jednym powtórzeniu?", formula: "add", skill: "geometry", defaults: { a: 3, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Powtórzenia wzoru", template: "Wzór składa się z {a} figur. Powtórzono go {b} razy. Ile figur narysowano?", formula: "groups", skill: "geometry", defaults: { a: 4, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Symetryczne połowy", template: "Obrazek ma {a} kratek po lewej stronie osi i tyle samo po prawej. Ile kratek ma cały obrazek?", formula: "groups", skill: "geometry", defaults: { a: 6, b: 2 }, variableKeys: ["a"] },
        { title: "Boki kwadratu", template: "Kwadrat ma {a} cm boku. Jaki jest obwód kwadratu?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 5, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Obwód prostokąta", template: "Prostokąt ma {a} cm długości i {b} cm szerokości. Jaki ma obwód?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 8, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Klocki w rzędzie", template: "W rzędzie leży {a} kwadratowych klocków. Każdy ma bok {b} cm. Jaka jest długość rzędu?", formula: "groups", skill: "geometry", defaults: { a: 5, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Trójkąty w domku", template: "Dom z klocków ma {a} trójkątów na dachu i {b} kwadratów w ścianach. Ile figur?", formula: "add", skill: "geometry", defaults: { a: 2, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Rytm figur — koła", template: "W każdym powtórzeniu wzoru są 2 koła. W {a} powtórzeniach ile kół?", formula: "groups", skill: "geometry", defaults: { a: 5, b: 2 }, variableKeys: ["a"] },
        { title: "Kolorowe kwadraty", template: "Na planszy jest {a} żółtych i {b} zielonych kwadratów. Ile kwadratów razem?", formula: "add", skill: "geometry", defaults: { a: 7, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Obwód tablicy", template: "Tablica ma kształt prostokąta {a} dm na {b} dm. Ile dm ma obwód?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 12, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Figury w koszyku", template: "W koszyku jest {a} kół, {b} trójkątów i {c} kwadratów. Ile figur?", formula: "sum3", skill: "geometry", defaults: { a: 3, b: 4, c: 5 }, variableKeys: ["a", "b", "c"] },
        { title: "Kratka na siatce", template: "Prostokąt na kratce ma {a} kratek długości i {b} kratek szerokości. Ile kratek zajmuje pole?", formula: "area_rect", skill: "geometry", defaults: { a: 6, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Ozdobna ramka", template: "Ramka ma kształt prostokąta o bokach {a} cm i {b} cm. Ile cm wstążki potrzeba na obwód?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 10, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Tangram", template: "Z tangramu złożono {a} dużych trójkątów i {b} małych kwadratów. Ile elementów?", formula: "add", skill: "geometry", defaults: { a: 2, b: 1 }, variableKeys: ["a", "b"] },
        { title: "Płot wokół grządki", template: "Grządka ma {a} m długości i {b} m szerokości. Ile metrów płotu trzeba?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 4, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Kwadraty w mozaice", template: "Mozaika ma {a} rzędów po {b} kwadratów. Ile kwadratów w mozaice?", formula: "groups", skill: "geometry", defaults: { a: 4, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Figury w plastelinie", template: "Uczeń ulepił {a} kulek i {b} wałków. Ile brył plastelinowych?", formula: "add", skill: "geometry", defaults: { a: 5, b: 3 }, variableKeys: ["a", "b"] },
      ],
      grade,
    ),

  place_value: (grade) =>
    finalize(
      [
        { title: "Setki i dziesiątki", template: "W liczbie {a} setek i {b} dziesiątkach ile jest dziesiątek razem?", formula: "add", skill: "addition", defaults: { a: 3, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Zaokrąglenie w górę", template: "Liczba {a} zaokrąglona do najbliższej dziesiątki daje {b}. Jaka była różnica?", formula: "subtract", skill: "subtraction", defaults: { a: 47, b: 50 }, variableKeys: ["a", "b"] },
        { title: "Porównanie liczebności", template: "W jednym słoiku {a} ziaren, w drugim {b}. O ile więcej w pierwszym?", formula: "subtract", skill: "subtraction", defaults: { a: 350, b: 280 }, variableKeys: ["a", "b"] },
        { title: "Suma liczb", template: "Pierwsza liczba to {a}, druga {b}. Jaka jest suma?", formula: "add", skill: "addition", defaults: { a: 245, b: 178 }, variableKeys: ["a", "b"] },
        { title: "Brakująca setka", template: "Do liczby {a} trzeba dodać tyle, by uzyskać {c}. Ile trzeba dodać?", formula: "missing_addend", skill: "subtraction", defaults: { a: 650, c: 1000 }, variableKeys: ["a", "c"] },
        { title: "Trzy liczby na osi", template: "Na osi zaznaczono {a}, {b} i {c}. Jaka jest suma tych liczb?", formula: "sum3", skill: "addition", defaults: { a: 100, b: 200, c: 300 }, variableKeys: ["a", "b", "c"] },
        { title: "Różnica liczb", template: "Większa liczba to {a}, mniejsza {b}. O ile się różnią?", formula: "subtract", skill: "subtraction", defaults: { a: 500, b: 327 }, variableKeys: ["a", "b"] },
        { title: "Liczenie co dziesiątki", template: "Od {a} do {b} licząc co 10 jest tyle kroków. Ile kroków? (({b}-{a})/10)", formula: "divide", skill: "division", defaults: { a: 120, b: 180 }, variableKeys: ["a", "b"] },
        { title: "Magazyn szkolny", template: "W magazynie było {a} zeszytów. Dodano {b}. Ile jest teraz?", formula: "add", skill: "addition", defaults: { a: 420, b: 185 }, variableKeys: ["a", "b"] },
        { title: "Sprzedaż w sklepie", template: "Sklep miał {a} produktów. Sprzedano {b}. Ile zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 800, b: 356 }, variableKeys: ["a", "b"] },
        { title: "Paczki po dziesiątki", template: "Spakowano {a} paczek po {b} książek. Ile książek?", formula: "groups", skill: "multiplication", defaults: { a: 12, b: 10 }, variableKeys: ["a", "b"] },
        { title: "Równy podział", template: "{a} klocków podzielono na {b} równych partii. Ile w jednej partii?", formula: "share", skill: "division", defaults: { a: 240, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Trzy magazyny", template: "W trzech magazynach jest {a}, {b} i {c} kg mąki. Ile kg razem?", formula: "sum3", skill: "addition", defaults: { a: 150, b: 200, c: 175 }, variableKeys: ["a", "b", "c"] },
        { title: "Do pełnej setki", template: "Mamy {a}. Ile brakuje do {c}?", formula: "missing_addend", skill: "subtraction", defaults: { a: 783, c: 900 }, variableKeys: ["a", "c"] },
        { title: "Suma zakupów", template: "Zakupiono towaru za {a} zł i {b} zł. Ile wydano?", formula: "add", skill: "addition", defaults: { a: 125, b: 89 }, variableKeys: ["a", "b"] },
        { title: "Reszta z budżetu", template: "Budżet to {a} zł. Wydano {b} zł. Ile zostało?", formula: "subtract", skill: "subtraction", defaults: { a: 500, b: 234 }, variableKeys: ["a", "b"] },
        { title: "Kartony w rzędzie", template: "Ułożono {a} kartonów po {b} kg. Ile kg razem?", formula: "groups", skill: "multiplication", defaults: { a: 8, b: 25 }, variableKeys: ["a", "b"] },
        { title: "Podział równy", template: "{a} uczniów podzielono na {b} grup. Ile uczniów w grupie?", formula: "share", skill: "division", defaults: { a: 32, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Średnia trzech liczb", template: "Trzy liczby to {a}, {b} i {c}. Jaka jest ich średnia?", formula: "average3", skill: "statistics", defaults: { a: 120, b: 150, c: 180 }, variableKeys: ["a", "b", "c"] },
        { title: "Przesunięcie na osi", template: "Z punktu {a} przesunięto się o {b} w prawo. Gdzie wylądowano?", formula: "add", skill: "addition", defaults: { a: 450, b: 75 }, variableKeys: ["a", "b"] },
      ],
      grade,
    ),

  fractions: (grade) =>
    finalize(
      [
        { title: "Połówka ciasta", template: "Ciasto podzielono na {b} równych kawałków. Zjedzono {a}. Ile kawałków zostało?", formula: "subtract", skill: "fractions", defaults: { a: 1, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Ćwiartki pizzy", template: "Pizza ma {b} kawałków. Zjedzono {a}. Ile kawałków zostało?", formula: "subtract", skill: "fractions", defaults: { a: 3, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Czekolada", template: "Tabliczka ma {b} kostek. Zjedzono {a}. Ile kostek zostało?", formula: "subtract", skill: "fractions", defaults: { a: 5, b: 12 }, variableKeys: ["a", "b"] },
        { title: "Kolorowe klocki", template: "Z {b} klocków {a} jest czerwonych. Ile klocków nie jest czerwonych?", formula: "subtract", skill: "fractions", defaults: { a: 3, b: 10 }, variableKeys: ["a", "b"] },
        { title: "Podział jabłek", template: "{a} jabłek podzielono po równo między {b} dzieci. Ile dostało jedno dziecko?", formula: "share", skill: "fractions", defaults: { a: 12, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Porcje soku", template: "Z {a} litrów soku nalewano po {b} litra do szklanek. Ile szklanek można napełnić?", formula: "share", skill: "fractions", defaults: { a: 6, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Ułamki w grupie", template: "W klasie {a} uczniów ma {b} braci i sióstr razem. Ile to dzieci w rodzinach?", formula: "groups", skill: "fractions", defaults: { a: 5, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Suma części", template: "Pierwsza część ma {a} elementów, druga {b}. Ile elementów razem?", formula: "add", skill: "fractions", defaults: { a: 2, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Różnica części", template: "Było {a} kawałków ciasta. Zjedzono {b}. Ile zostało?", formula: "subtract", skill: "fractions", defaults: { a: 8, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Równy podział tortu", template: "Tort podzielono na {b} kawałków. Każdy zjadł po {a} kawałku. Ile osób jadło?", formula: "share", skill: "fractions", defaults: { a: 2, b: 12 }, variableKeys: ["a", "b"] },
        { title: "Plastelina", template: "Kawał plasteliny waży {a} dag. Zużyto {b} dag. Ile dag zostało?", formula: "subtract", skill: "fractions", defaults: { a: 20, b: 7 }, variableKeys: ["a", "b"] },
        { title: "Książki na półkach", template: "Na {a} półkach leży po {b} książek. Ile książek razem?", formula: "groups", skill: "fractions", defaults: { a: 4, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Reszta z podziału", template: "Z {a} cukierków każde dziecko dostało {b}. Ilu było dzieci?", formula: "share", skill: "fractions", defaults: { a: 24, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Trzy porcje", template: "Zjedzono {a}, {b} i {c} kawałków ciasta. Ile kawałków zjedzono?", formula: "sum3", skill: "fractions", defaults: { a: 2, b: 1, c: 3 }, variableKeys: ["a", "b", "c"] },
        { title: "Porównanie ilości", template: "W pierwszym koszyku {a} jabłek, w drugim {b}. O ile więcej w drugim?", formula: "subtract", skill: "fractions", defaults: { a: 5, b: 9 }, variableKeys: ["a", "b"] },
        { title: "Dzielenie czekolady", template: "{a} tabliczek czekolady podzielono na {b} części każda. Ile części razem?", formula: "groups", skill: "fractions", defaults: { a: 3, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Nalewanie mleka", template: "W kartonie {a} litrów mleka. Wylało się {b} litrów. Ile zostało?", formula: "subtract", skill: "fractions", defaults: { a: 2, b: 1 }, variableKeys: ["a", "b"] },
        { title: "Kromki chleba", template: "Bochenek ma {b} kromek. Zjedzono {a}. Ile kromek zostało?", formula: "subtract", skill: "fractions", defaults: { a: 4, b: 10 }, variableKeys: ["a", "b"] },
        { title: "Podział naklejek", template: "{a} naklejek rozdzielono po równo między {b} uczniów. Ile dostał każdy?", formula: "share", skill: "fractions", defaults: { a: 30, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Suma dwóch porcji", template: "Ania zjadła {a} kawałków, Tomek {b}. Ile kawałków zjedli razem?", formula: "add", skill: "fractions", defaults: { a: 2, b: 3 }, variableKeys: ["a", "b"] },
      ],
      grade,
    ),

  geometry_measure: (grade) =>
    finalize(
      [
        { title: "Obwód ogrodzenia", template: "Działka ma {a} m długości i {b} m szerokości. Ile metrów siatki trzeba na ogrodzenie?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 15, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Pole dywanu", template: "Dywan ma kształt prostokąta {a} m na {b} m. Ile m² ma pole?", formula: "area_rect", skill: "geometry", defaults: { a: 4, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Obwód ramy", template: "Obraz w ramie prostokątnej ma boki {a} cm i {b} cm. Jaki jest obwód?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 30, b: 20 }, variableKeys: ["a", "b"] },
        { title: "Pole kratką", template: "Prostokąt na kratce ma {a} kratek długości i {b} szerokości. Ile kratek zajmuje?", formula: "area_rect", skill: "geometry", defaults: { a: 8, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Taśma wokół pudełka", template: "Pudełko ma {a} cm na {b} cm u góry. Ile cm taśmy na obwód?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 12, b: 7 }, variableKeys: ["a", "b"] },
        { title: "Wykładzina w pokoju", template: "Pokój ma {a} m na {b} m. Ile m² wykładziny potrzeba?", formula: "area_rect", skill: "geometry", defaults: { a: 5, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Płot wokół grządki", template: "Grządka: {a} m × {b} m. Ile metrów desek na płot?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 6, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Kafelki podłogowe", template: "Fragment podłogi {a} dm × {b} dm. Ile dm² powierzchni?", formula: "area_rect", skill: "geometry", defaults: { a: 10, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Obwód boiska", template: "Boisko szkolne ma {a} m długości i {b} m szerokości. Ile metrów ma obwód?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 40, b: 25 }, variableKeys: ["a", "b"] },
        { title: "Pole tablicy", template: "Tablica ma wymiary {a} dm i {b} dm. Ile dm² powierzchni?", formula: "area_rect", skill: "geometry", defaults: { a: 12, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Obramowanie kartki", template: "Kartka {a} cm × {b} cm. Ile cm wstążki na brzegi?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 21, b: 15 }, variableKeys: ["a", "b"] },
        { title: "Farba na ścianę", template: "Ściana {a} m wysoka i {b} m szeroka. Ile m² trzeba pomalować?", formula: "area_rect", skill: "geometry", defaults: { a: 3, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Obwód kwadratu", template: "Kwadratowy plac zabaw ma bok {a} m. Jaki ma obwód?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 12, b: 12 }, variableKeys: ["a", "b"] },
        { title: "Pole kwadratu", template: "Kwadratowa kratka ma bok {a} cm. Ile cm² ma pole?", formula: "area_rect", skill: "geometry", defaults: { a: 9, b: 9 }, variableKeys: ["a", "b"] },
        { title: "Dwa obwody", template: "Prostokąt A: {a}×{b} cm. Jaki ma obwód?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 14, b: 9 }, variableKeys: ["a", "b"] },
        { title: "Dwa pola", template: "Prostokąt ma {a} m i {b} m. Ile m²?", formula: "area_rect", skill: "geometry", defaults: { a: 7, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Chodnik wokół", template: "Kwadratowy dziedziniec {a} m boku. Ile m chodnika wokół?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 18, b: 18 }, variableKeys: ["a", "b"] },
        { title: "Trawnik", template: "Trawnik prostokątny {a} m × {b} m. Ile m²?", formula: "area_rect", skill: "geometry", defaults: { a: 12, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Listwy na ramę", template: "Rama {a} cm × {b} cm. Ile cm listwy?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 25, b: 18 }, variableKeys: ["a", "b"] },
        { title: "Szkło w oknie", template: "Okno {a} dm × {b} dm. Ile dm² szkła?", formula: "area_rect", skill: "geometry", defaults: { a: 15, b: 10 }, variableKeys: ["a", "b"] },
      ],
      grade,
    ),

  geometry_advanced: (grade) =>
    finalize(
      [
        { title: "Trójkąt prostokątny — bok", template: "Trójkąt prostokątny ma przyprostokątne {a} cm i {b} cm. Jaki jest obwód (trzeci bok {c} cm)?", formula: "sum3", skill: "geometry", defaults: { a: 3, b: 4, c: 5 }, variableKeys: ["a", "b", "c"] },
        { title: "Obwód koła", template: "Koło ma promień {a} cm. Obwód ≈ 2·π·r. Przy π≈3 oblicz obwód w cm.", formula: "groups", skill: "geometry", defaults: { a: 5, b: 6 }, variableKeys: ["a"] },
        { title: "Pole koła", template: "Koło ma promień {a} cm. Pole ≈ π·r². Przy π≈3 ile cm²?", formula: "area_rect", skill: "geometry", defaults: { a: 4, b: 4 }, variableKeys: ["a"] },
        { title: "Kąty w trójkącie", template: "W trójkącie dwa kąty mają {a}° i {b}°. Ile stopni ma trzeci kąt?", formula: "subtract", skill: "geometry", defaults: { a: 60, b: 70 }, variableKeys: ["a", "b"] },
        { title: "Obwód trójkąta", template: "Trójkąt ma boki {a} cm, {b} cm i {c} cm. Jaki obwód?", formula: "sum3", skill: "geometry", defaults: { a: 5, b: 6, c: 7 }, variableKeys: ["a", "b", "c"] },
        { title: "Pole prostokąta", template: "Prostokąt {a} cm × {b} cm. Ile cm²?", formula: "area_rect", skill: "geometry", defaults: { a: 12, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Obwód prostokąta", template: "Prostokąt {a} m × {b} m. Ile m obwodu?", formula: "perimeter_rect", skill: "geometry", defaults: { a: 9, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Wysokość trójkąta", template: "Pole trójkąta to (a·h)/2. Przy podstawie {a} cm i polu {c} cm², jaka wysokość h?", formula: "share", skill: "geometry", defaults: { a: 8, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Objętość prostopadłościanu", template: "Prostopadłościan ma {a} cm × {b} cm × {c} cm. Ile cm³ objętości?", formula: "groups", skill: "geometry", defaults: { a: 4, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Promień z średnicy", template: "Średnica koła to {a} cm. Ile cm ma promień?", formula: "share", skill: "geometry", defaults: { a: 12, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Suma kątów", template: "Kąty w wielokącie: {a}° i {b}°. Trzeci kąt?", formula: "subtract", skill: "geometry", defaults: { a: 45, b: 95 }, variableKeys: ["a", "b"] },
        { title: "Długość przekątnej", template: "Kwadrat ma bok {a} cm. Przekątna ≈ b·√2. Przy √2≈1,4 podaj długość w cm (zaokrąglij).", formula: "groups", skill: "geometry", defaults: { a: 5, b: 14 }, variableKeys: ["a", "b"] },
        { title: "Obwód wielokąta", template: "Pięciokąt foremny ma bok {a} cm. Jaki obwód?", formula: "groups", skill: "geometry", defaults: { a: 5, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Pole trapezu", template: "Trapez: podstawy {a} cm i {b} cm, wysokość {c} cm. Pole = ((a+b)·h)/2. Ile cm²?", formula: "average3", skill: "geometry", defaults: { a: 8, b: 12, c: 5 }, variableKeys: ["a", "b", "c"] },
        { title: "Odległość na mapie", template: "Skala 1:{a}. Na mapie {b} cm. Ile cm w rzeczywistości?", formula: "groups", skill: "geometry", defaults: { a: 10000, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Wysokość sześcianu", template: "Podstawa kwadratu {a} cm. Wysokość {b} cm. Ile cm² ma jedna ściana?", formula: "area_rect", skill: "geometry", defaults: { a: 6, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Obwód okręgu", template: "Okrąg ma średnicę {a} dm. Obwód ≈ π·d, π≈3. Ile dm?", formula: "groups", skill: "geometry", defaults: { a: 10, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Trójkąt równoramienny", template: "Dwa boki po {a} cm, trzeci {b} cm. Obwód?", formula: "add", skill: "geometry", defaults: { a: 7, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Pole kwadratu", template: "Kwadrat ma bok {a} cm. Pole?", formula: "area_rect", skill: "geometry", defaults: { a: 11, b: 11 }, variableKeys: ["a", "b"] },
        { title: "Brakujący bok", template: "Obwód trójkąta {c} cm. Dwa boki {a} cm i {b} cm. Ile cm ma trzeci?", formula: "subtract", skill: "geometry", defaults: { a: 5, b: 6, c: 18 }, variableKeys: ["a", "b", "c"] },
      ],
      grade,
    ),

  percent: (grade) =>
    finalize(
      [
        { title: "Obniżka", template: "Bluzka kosztuje {a} zł. Obniżka {b}%. O ile zł spadła cena?", formula: "percent_of", skill: "statistics", defaults: { a: 80, b: 10 }, variableKeys: ["a", "b"] },
        { title: "Podwyżka", template: "Cena {a} zł wzrosła o {b}%. O ile zł?", formula: "percent_of", skill: "statistics", defaults: { a: 200, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Procent z liczby", template: "Ile to {b}% z {a}?", formula: "percent_of", skill: "statistics", defaults: { a: 300, b: 20 }, variableKeys: ["a", "b"] },
        { title: "Rabat w sklepie", template: "Telefon {a} zł, rabat {b}%. Ile złotych taniej?", formula: "percent_of", skill: "statistics", defaults: { a: 500, b: 15 }, variableKeys: ["a", "b"] },
        { title: "VAT", template: "Netto {a} zł, VAT {b}%. Ile zł VAT?", formula: "percent_of", skill: "statistics", defaults: { a: 100, b: 23 }, variableKeys: ["a", "b"] },
        { title: "Odsetki proste", template: "Kapitał {a} zł, {b}% rocznie. Ile zł odsetek?", formula: "percent_of", skill: "statistics", defaults: { a: 1000, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Sukces na teście", template: "W teście {a} pytań. {b}% poprawnych. Ile pytań?", formula: "percent_of", skill: "statistics", defaults: { a: 20, b: 75 }, variableKeys: ["a", "b"] },
        { title: "Wypełnienie sali", template: "Sala na {a} osób. Zajęte {b}%. Ile osób?", formula: "percent_of", skill: "statistics", defaults: { a: 200, b: 60 }, variableKeys: ["a", "b"] },
        { title: "Tłuszcz w produkcie", template: "Opakowanie {a} g, {b}% tłuszczu. Ile gramów?", formula: "percent_of", skill: "statistics", defaults: { a: 250, b: 12 }, variableKeys: ["a", "b"] },
        { title: "Cena po obniżce", template: "Było {a} zł, obniżono o {b} zł. Ile zostało?", formula: "subtract", skill: "statistics", defaults: { a: 120, b: 24 }, variableKeys: ["a", "b"] },
        { title: "Cena po podwyżce", template: "Było {a} zł, podwyżka o {b} zł. Ile teraz?", formula: "add", skill: "statistics", defaults: { a: 50, b: 7 }, variableKeys: ["a", "b"] },
        { title: "Dwie obniżki", template: "Cena {a} zł, najpierw -{b} zł. Ile po obniżce?", formula: "subtract", skill: "statistics", defaults: { a: 400, b: 80 }, variableKeys: ["a", "b"] },
        { title: "Procent frekwencji", template: "W klasie {a} uczniów. Obecnych {b}%. Ile obecnych?", formula: "percent_of", skill: "statistics", defaults: { a: 28, b: 90 }, variableKeys: ["a", "b"] },
        { title: "Alkohol w płynie", template: "Butelka {a} ml, stężenie {b}%. Ile ml substancji?", formula: "percent_of", skill: "statistics", defaults: { a: 500, b: 40 }, variableKeys: ["a", "b"] },
        { title: "Zniżka sezonowa", template: "Kurtka {a} zł, -{b}%. O ile taniej?", formula: "percent_of", skill: "statistics", defaults: { a: 350, b: 30 }, variableKeys: ["a", "b"] },
        { title: "Podatek", template: "Zarobek {a} zł, podatek {b}%. Ile zł podatku?", formula: "percent_of", skill: "statistics", defaults: { a: 2500, b: 18 }, variableKeys: ["a", "b"] },
        { title: "Udział procentowy", template: "Z {a} głosów {b}% na „tak”. Ile głosów?", formula: "percent_of", skill: "statistics", defaults: { a: 400, b: 55 }, variableKeys: ["a", "b"] },
        { title: "Marża sklepu", template: "Zakup {a} zł, marża {b}%. Ile zł marży?", formula: "percent_of", skill: "statistics", defaults: { a: 150, b: 25 }, variableKeys: ["a", "b"] },
        { title: "Wzrost populacji", template: "Miasto {a} tys., wzrost {b}%. Ile tys. przybyło?", formula: "percent_of", skill: "statistics", defaults: { a: 50, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Napiwek", template: "Rachunek {a} zł, napiwek {b}%. Ile zł napiwku?", formula: "percent_of", skill: "statistics", defaults: { a: 80, b: 10 }, variableKeys: ["a", "b"] },
      ],
      grade,
    ),

  proportion: (grade) =>
    finalize(
      [
        { title: "Skala mapy", template: "Skala 1:{a}. Na mapie {b} cm. Ile cm w terenie?", formula: "groups", skill: "measurement", defaults: { a: 50000, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Przepis kulinarny", template: "Na {a} osób potrzeba {b} g mąki. Na {c} osób ile gramów?", formula: "groups", skill: "measurement", defaults: { a: 4, b: 300 }, variableKeys: ["a", "b"] },
        { title: "Prędkość", template: "Auto jedzie {a} km w {b} h. Ile km w 1 h?", formula: "share", skill: "measurement", defaults: { a: 120, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Cena za kg", template: "{a} kg kosztuje {b} zł. Ile kosztuje 1 kg?", formula: "share", skill: "measurement", defaults: { a: 5, b: 20 }, variableKeys: ["a", "b"] },
        { title: "Roboczogodziny", template: "{a} robotników robi robotę w {b} dni. Ile dni pracuje 1 robotnik?", formula: "groups", skill: "measurement", defaults: { a: 3, b: 12 }, variableKeys: ["a", "b"] },
        { title: "Stosunek mleka", template: "Do {a} filiżanek kawy: {b} ml mleka. Do {c} filiżanek ile ml?", formula: "groups", skill: "measurement", defaults: { a: 2, b: 100 }, variableKeys: ["a", "b"] },
        { title: "Zapotrzebowanie", template: "Fabryka zużywa {a} kg w {b} dni. Ile kg dziennie?", formula: "share", skill: "measurement", defaults: { a: 240, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Rozcieńczenie", template: "Koncentrat {a} ml na {b} l wody. Na {c} l ile ml?", formula: "groups", skill: "measurement", defaults: { a: 1, b: 10 }, variableKeys: ["a", "b"] },
        { title: "Paliwo", template: "Auto na {a} l jedzie {b} km. Ile km na 1 l?", formula: "share", skill: "measurement", defaults: { a: 8, b: 96 }, variableKeys: ["a", "b"] },
        { title: "Płatki", template: "Porcja {a} g na osobę. Dla {b} osób ile gramów?", formula: "groups", skill: "measurement", defaults: { a: 40, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Cegły", template: "{a} murarzy murowało {b} dni. Jeden murarz ile dni?", formula: "groups", skill: "measurement", defaults: { a: 4, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Farba", template: "Na {a} m² farby {b} l. Na {c} m² ile litrów?", formula: "groups", skill: "measurement", defaults: { a: 10, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Woda z kranu", template: "Kran leje {a} l w {b} min. Ile l w 1 min?", formula: "share", skill: "measurement", defaults: { a: 15, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Jabłka w koszyku", template: "{a} kg jabłek kosztuje {b} zł. Ile kg za {c} zł?", formula: "share", skill: "measurement", defaults: { a: 2, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Przewijanie taśmy", template: "Taśma {a} m w {b} s. Ile metrów w 1 s?", formula: "share", skill: "measurement", defaults: { a: 30, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Płatność za prąd", template: "Za {a} kWh płacisz {b} zł. Za {c} kWh ile?", formula: "groups", skill: "measurement", defaults: { a: 100, b: 45 }, variableKeys: ["a", "b"] },
        { title: "Pracownicy", template: "{a} pracowników kończy zadanie w {b} h. Ile h pracuje jeden?", formula: "groups", skill: "measurement", defaults: { a: 5, b: 8 }, variableKeys: ["a", "b"] },
        { title: "Cukier do dżemu", template: "Na {a} kg owoców {b} kg cukru. Na {c} kg owoców ile?", formula: "groups", skill: "measurement", defaults: { a: 2, b: 1 }, variableKeys: ["a", "b"] },
        { title: "Drukowanie", template: "Drukarka {a} stron w {b} min. Ile stron na minutę?", formula: "share", skill: "measurement", defaults: { a: 60, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Woda w basenie", template: "Basen napełnia się {a} l w {b} h. Ile l na godzinę?", formula: "share", skill: "measurement", defaults: { a: 1200, b: 3 }, variableKeys: ["a", "b"] },
      ],
      grade,
    ),

  algebra: (grade) =>
    finalize(
      [
        { title: "Równanie proste", template: "x + {a} = {c}. Ile wynosi x?", formula: "missing_addend", skill: "algebra", defaults: { a: 7, c: 15 }, variableKeys: ["a", "c"] },
        { title: "Odejmowanie w równaniu", template: "x − {a} = {b}. Ile wynosi x?", formula: "add", skill: "algebra", defaults: { a: 5, b: 12 }, variableKeys: ["a", "b"] },
        { title: "Mnożenie", template: "{a} · x = {c}. Ile wynosi x?", formula: "share", skill: "algebra", defaults: { a: 4, c: 28 }, variableKeys: ["a", "c"] },
        { title: "Dzielenie", template: "x : {b} = {a}. Ile wynosi x?", formula: "groups", skill: "algebra", defaults: { a: 6, b: 7 }, variableKeys: ["a", "b"] },
        { title: "Wyrażenie", template: "Oblicz {a} + {b} · 2.", formula: "add", skill: "algebra", defaults: { a: 5, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Podstawienie", template: "Dla x = {a} oblicz 2x + {b}.", formula: "groups", skill: "algebra", defaults: { a: 4, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Suma i różnica", template: "x + {a} = {c}. x = ?", formula: "missing_addend", skill: "algebra", defaults: { a: 12, c: 30 }, variableKeys: ["a", "c"] },
        { title: "Brakujący składnik", template: "{a} + x = {c}. x = ?", formula: "missing_addend", skill: "algebra", defaults: { a: 8, c: 20 }, variableKeys: ["a", "c"] },
        { title: "Podwójne x", template: "2x = {c}. x = ?", formula: "share", skill: "algebra", defaults: { c: 18, a: 2, b: 2 }, variableKeys: ["c"] },
        { title: "Trzy x", template: "3x = {c}. x = ?", formula: "share", skill: "algebra", defaults: { c: 24, a: 3, b: 3 }, variableKeys: ["c"] },
        { title: "Równanie z dwoma krokami", template: "x + {a} = {b}. x = ?", formula: "subtract", skill: "algebra", defaults: { a: 9, b: 25 }, variableKeys: ["a", "b"] },
        { title: "Funkcja liniowa", template: "y = {a}x. Dla x = {b}, y = ?", formula: "groups", skill: "algebra", defaults: { a: 3, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Tabela funkcji", template: "Do x = {a} dodaj {b}. Jaka wartość y?", formula: "add", skill: "algebra", defaults: { a: 4, b: 7 }, variableKeys: ["a", "b"] },
        { title: "Oblicz wyrażenie", template: "({a} + {b}) · 2 = ?", formula: "add", skill: "algebra", defaults: { a: 6, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Równanie z nawiasem", template: "x + x = {c}. x = ?", formula: "share", skill: "algebra", defaults: { c: 14, a: 2, b: 2 }, variableKeys: ["c"] },
        { title: "Różnica kwadratów uproszczona", template: "{c} − {a} = ?", formula: "subtract", skill: "algebra", defaults: { a: 17, c: 45 }, variableKeys: ["a", "c"] },
        { title: "Wartość wyrażenia", template: "5 · {a} + {b} = ?", formula: "groups", skill: "algebra", defaults: { a: 4, b: 6 }, variableKeys: ["a", "b"] },
        { title: "Równanie z ułamkiem", template: "Połowa liczby x to {a}. x = ?", formula: "groups", skill: "algebra", defaults: { a: 7, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Suma trzech wyrazów", template: "x + {a} + {b} = {c}. x = ?", formula: "subtract", skill: "algebra", defaults: { a: 5, b: 8, c: 30 }, variableKeys: ["a", "b", "c"] },
        { title: "Przesunięcie wykresu", template: "Punkt ma y = {a}. Po przesunięciu o {b} w górę: y = ?", formula: "add", skill: "algebra", defaults: { a: 3, b: 5 }, variableKeys: ["a", "b"] },
      ],
      grade,
    ),

  statistics: (grade) =>
    finalize(
      [
        { title: "Średnia ocen", template: "Oceny: {a}, {b}, {c}. Jaka średnia?", formula: "average3", skill: "statistics", defaults: { a: 4, b: 5, c: 6 }, variableKeys: ["a", "b", "c"] },
        { title: "Średnia wyników", template: "Wyniki testu: {a}, {b}, {c} pkt. Średnia?", formula: "average3", skill: "statistics", defaults: { a: 12, b: 15, c: 18 }, variableKeys: ["a", "b", "c"] },
        { title: "Suma punktów", template: "W trzech grach: {a}, {b}, {c} pkt. Ile razem?", formula: "sum3", skill: "statistics", defaults: { a: 8, b: 12, c: 10 }, variableKeys: ["a", "b", "c"] },
        { title: "Mediana — brak", template: "Trzy liczby: {a}, {b}, {c}. Jaka suma?", formula: "sum3", skill: "statistics", defaults: { a: 3, b: 7, c: 15 }, variableKeys: ["a", "b", "c"] },
        { title: "Frekwencja", template: "Obecnych {a} z {c} uczniów. Ilu nieobecnych?", formula: "subtract", skill: "statistics", defaults: { a: 24, c: 28 }, variableKeys: ["a", "c"] },
        { title: "Ankieta tak/nie", template: "Za głosowało {a}, przeciw {b}. Ile głosów?", formula: "add", skill: "statistics", defaults: { a: 35, b: 15 }, variableKeys: ["a", "b"] },
        { title: "Objętość kostek", template: "Prostopadłościan {a}×{b}×{c} kostek jednostkowych. Ile kostek?", formula: "groups", skill: "statistics", defaults: { a: 4, b: 3 }, variableKeys: ["a", "b"] },
        { title: "Warstwy kostek", template: "{a} warstw po {b} kostek. Ile kostek?", formula: "groups", skill: "statistics", defaults: { a: 5, b: 12 }, variableKeys: ["a", "b"] },
        { title: "Różnica wyników", template: "Najlepszy wynik {a}, najgorszy {b}. O ile różnią się?", formula: "subtract", skill: "statistics", defaults: { a: 48, b: 22 }, variableKeys: ["a", "b"] },
        { title: "Średnia temperatur", template: "Temperatury: {a}°C, {b}°C, {c}°C. Średnia?", formula: "average3", skill: "statistics", defaults: { a: 18, b: 22, c: 20 }, variableKeys: ["a", "b", "c"] },
        { title: "Suma sprzedaży", template: "Sprzedaż w 3 dniach: {a}, {b}, {c} zł. Suma?", formula: "sum3", skill: "statistics", defaults: { a: 120, b: 95, c: 110 }, variableKeys: ["a", "b", "c"] },
        { title: "Prawdopodobieństwo", template: "W urnie {a} kuli, {b} czerwonych. Ile nieczerwonych?", formula: "subtract", skill: "statistics", defaults: { a: 20, b: 7 }, variableKeys: ["a", "b"] },
        { title: "Losowanie", template: "Z {a} kart wylosowano {b}. Ile kart zostało?", formula: "subtract", skill: "statistics", defaults: { a: 52, b: 5 }, variableKeys: ["a", "b"] },
        { title: "Diagram słupkowy", template: "Słupki: {a}, {b}, {c}. Suma?", formula: "sum3", skill: "statistics", defaults: { a: 6, b: 9, c: 12 }, variableKeys: ["a", "b", "c"] },
        { title: "Średnia wag", template: "Paczki: {a} kg, {b} kg, {c} kg. Średnia?", formula: "average3", skill: "statistics", defaults: { a: 2, b: 5, c: 8 }, variableKeys: ["a", "b", "c"] },
        { title: "Udział w całości", template: "Z {c} uczniów {a} gra w piłkę. Ilu nie gra?", formula: "subtract", skill: "statistics", defaults: { a: 12, c: 30 }, variableKeys: ["a", "c"] },
        { title: "Wynik drużyny", template: "Drużyna zdobyła {a} i {b} pkt w dwóch meczach. Suma?", formula: "add", skill: "statistics", defaults: { a: 3, b: 2 }, variableKeys: ["a", "b"] },
        { title: "Kostki w pudle", template: "Pudełko {a}×{b} kostek, wysokość {c} warstw. Ile kostek?", formula: "groups", skill: "statistics", defaults: { a: 6, b: 4 }, variableKeys: ["a", "b"] },
        { title: "Ankieta smaków", template: "Lody: {a} głosów wanilia, {b} czekolada. Ile razem?", formula: "add", skill: "statistics", defaults: { a: 18, b: 22 }, variableKeys: ["a", "b"] },
        { title: "Średnia dzienna", template: "Punkty w 3 dniach: {a}, {b}, {c}. Średnia dzienna?", formula: "average3", skill: "statistics", defaults: { a: 10, b: 14, c: 16 }, variableKeys: ["a", "b", "c"] },
      ],
      grade,
    ),
};

const KIND_ALIASES: Partial<Record<SectionKind, SectionKind>> = {
  mul_div: "early_ops",
  word_ops: "early_ops",
  geometry_shapes: "geometry_measure",
  units: "early_measure",
  decimals: "fractions",
  divisibility: "early_ops",
  integers: "early_ops",
  rational: "early_ops",
  equations: "algebra",
  exam: "early_ops",
};

export function storiesForSection(kind: SectionKind, grade: number): StoryDef[] {
  const resolved = KIND_ALIASES[kind] ?? kind;
  const factory = POOLS[resolved];
  if (!factory) {
    throw new Error(`Brak puli zadań dla rodzaju: ${kind} (${resolved})`);
  }
  return factory(grade).slice(0, 20);
}
