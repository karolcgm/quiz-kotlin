import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const solidModel = "cuboid-cube-lab" as const;

export const m691ProstopadloscianyISzescianyV1 = buildLessonPackage({
  id: "m6-9-1-prostopadlosciany-i-szesciany-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S9",
  topicId: "M6-9.1",
  lessonNumber: 1,
  title: "Prostopadłościan i sześcian",
  studentGoal: "Poznam budowę prostopadłościanu i sześcianu, rozłożę bryłę do siatki oraz obliczę sumę długości krawędzi i pole powierzchni.",
  successCriteria: [
    "Rozpoznaję prostopadłościan i sześcian oraz wskazuję ich ściany, krawędzie i wierzchołki.",
    "Znajduję krawędzie równoległe i prostopadłe do wskazanej krawędzi.",
    "Obliczam sumę długości wszystkich krawędzi prostopadłościanu i sześcianu.",
    "Stosuję wzory na pole powierzchni prostopadłościanu i sześcianu.",
  ],
  learningGoals: [
    {
      id: "m6-9-1-goal-solid",
      studentGoal: "Nauczę się rozpoznawać budowę prostopadłościanu i sześcianu.",
      successCriteria: [
        "Potrafię obrócić model i rozłożyć jego ściany do siatki.",
        "Potrafię wskazać ścianę, krawędź i wierzchołek oraz podać ich liczbę.",
        "Potrafię znaleźć krawędzie równoległe i prostopadłe do wskazanej krawędzi.",
      ],
      curriculumReferences: [],
    },
    {
      id: "m6-9-1-goal-edges",
      studentGoal: "Nauczę się obliczać łączną długość krawędzi bryły.",
      successCriteria: [
        "Potrafię pogrupować krawędzie o tej samej długości.",
        "Potrafię zastosować zapis 4(a + b + c) dla prostopadłościanu i 12a dla sześcianu.",
        "Potrafię obliczyć długość drutu potrzebnego do wykonania szkieletu bryły.",
      ],
      curriculumReferences: [],
    },
    {
      id: "m6-9-1-goal-area",
      studentGoal: "Nauczę się obliczać pole powierzchni prostopadłościanu i sześcianu.",
      successCriteria: [
        "Potrafię odczytać z siatki pary jednakowych ścian.",
        "Potrafię zastosować wzory P = 2ab + 2ac + 2bc oraz P = 6a².",
        "Potrafię zapisać wynik pola z jednostką kwadratową.",
      ],
      curriculumReferences: [],
    },
  ],
  skillIds: ["M6-9.1-solid-elements", "M6-9.1-edge-relations", "M6-9.1-edge-sum", "M6-9.1-surface-area"],
  prerequisiteSkillIds: ["M6-2.1-parallel-perpendicular", "M6-5.1-rectangle-area"],
  estimatedMinutes: 95,
  coreLesson: "Budowa prostopadłościanu i sześcianu, ich siatki, położenie krawędzi, suma długości krawędzi oraz pole powierzchni.",
  paperEvidence: "Zeszyt ucznia: podpisany szkic bryły, wzory na sumę krawędzi i pole powierzchni oraz pełne obliczenia do dwóch zadań.",
  overview: "Lekcja prowadzi od swobodnego oglądania i rozkładania brył 3D do samodzielnych obliczeń długości drutu oraz pola powierzchni.",
  openingScript: "Pozwól uczniom najpierw swobodnie obracać oba modele. Zapytaj, co pozostaje takie samo, gdy patrzymy na bryłę z innej strony.",
  closingScript: "Poproś ucznia, aby jednym zdaniem odróżnił sześcian od prostopadłościanu i podał po jednym wzorze, który dziś stosował.",
  commonMisconceptions: [
    "Uczeń widzi tylko krawędzie z przodu i pomija krawędzie ukryte z tyłu bryły.",
    "Uczeń nazywa krawędzie równoległe prostopadłymi, ponieważ na rysunku perspektywicznym wyglądają na zbliżające się.",
    "Uczeń dodaje trzy wymiary tylko raz, zamiast uwzględnić po cztery krawędzie każdej długości.",
    "Uczeń oblicza objętość zamiast pola powierzchni albo zapisuje jednostkę liniową zamiast kwadratowej.",
  ],
  stageBlueprints: [
    {
      suffix: "explore-s1", kind: "explore", title: "Obejrzyj obie bryły", minutes: 8,
      headline: "Prostopadłościan i sześcian w 3D", body: "Obracaj bryły palcem lub myszą. Porównaj kształt i długości ich krawędzi.",
      modelId: solidModel, modelSeed: 69101, preserveTaskTitle: true,
      studentInstruction: "Obróć prostopadłościan i sześcian. Obejrzyj także ściany znajdujące się z tyłu i od spodu.",
    },
    {
      suffix: "net-s2", kind: "explore", title: "Rozłóż bryłę do siatki", minutes: 10,
      headline: "Sześć ścian tworzy siatkę", body: "Przesuwaj suwak i obserwuj, jak ściany bryły układają się na płaszczyźnie.",
      modelId: solidModel, modelSeed: 69102, preserveTaskTitle: true,
      studentInstruction: "Rozłóż do siatki najpierw prostopadłościan, a potem sześcian. W obu przypadkach policz ściany.",
    },
    {
      suffix: "elements-s3", kind: "explore", title: "Ściany, krawędzie i wierzchołki", minutes: 10,
      headline: "Nazwij element bryły", body: "Podświetl ścianę, krawędź i wierzchołek. Sprawdź, ile takich elementów ma każda bryła.",
      modelId: solidModel, modelSeed: 69103, preserveTaskTitle: true,
      studentInstruction: "Wskaż kolejno ścianę, krawędź i wierzchołek. Zapamiętaj liczby: 6 ścian, 12 krawędzi, 8 wierzchołków.",
    },
    {
      suffix: "relations-s4", kind: "practice", title: "Położenie krawędzi", minutes: 12,
      headline: "Równoległe czy prostopadłe do AB?", body: "Obróć model i wybierz wszystkie krawędzie o wskazanym położeniu względem czerwonej krawędzi AB.",
      modelId: solidModel, modelSeed: 69104, preserveTaskTitle: true,
      studentInstruction: "Znajdź wszystkie krawędzie równoległe, a potem wszystkie krawędzie prostopadłe do AB.",
    },
    {
      suffix: "edge-formulas-s5", kind: "worked-example", title: "Suma długości krawędzi", minutes: 10,
      headline: "Ile drutu potrzeba na szkielet bryły?", body: "Pogrupuj krawędzie o tej samej długości i zastosuj odpowiedni wzór.",
      modelId: solidModel, modelSeed: 69105, preserveTaskTitle: true,
      studentInstruction: "Obróć model i odszukaj po cztery krawędzie długości a, b i c. Porównaj wzór prostopadłościanu ze wzorem sześcianu.",
    },
    {
      suffix: "edge-practice-s6", kind: "practice", title: "Oblicz długość drutu", minutes: 15,
      headline: "Suma długości wszystkich krawędzi", body: "Rozwiąż całą serię w jednym układzie. Uwzględnij wszystkie dwanaście krawędzi bryły.",
      modelId: solidModel, modelSeed: 69106, preserveTaskTitle: true,
      studentInstruction: "Oblicz wynik i wpisz go kalkulatorem lekcyjnym. Jednostka jest już podana.",
    },
    {
      suffix: "area-formulas-s7", kind: "worked-example", title: "Pole powierzchni", minutes: 10,
      headline: "Dodaj pola sześciu ścian", body: "Rozłóż bryłę do siatki. Zobacz pary jednakowych ścian i odczytaj oba najważniejsze wzory.",
      modelId: solidModel, modelSeed: 69107, preserveTaskTitle: true,
      studentInstruction: "Porównaj siatkę prostopadłościanu z siatką sześcianu. Wyjaśnij, skąd we wzorach biorą się liczby 2 i 6.",
    },
    {
      suffix: "area-practice-s8", kind: "practice", title: "Oblicz pole powierzchni", minutes: 15,
      headline: "Pole prostopadłościanu i sześcianu", body: "Dobierz wzór, wykonaj mnożenie i dodawanie, a wynik zapisz w jednostce kwadratowej.",
      modelId: solidModel, modelSeed: 69108, preserveTaskTitle: true,
      studentInstruction: "Rozwiąż serię przykładów. Zwróć uwagę, czy bryła jest sześcianem, czy prostopadłościanem.",
    },
    {
      suffix: "mixed-practice-s9", kind: "exit-ticket", title: "Znajdź długość krawędzi", minutes: 12,
      headline: "Zastosuj wzór w odwrotną stronę", body: "Na podstawie sumy krawędzi albo pola powierzchni oblicz brakującą długość.",
      modelId: solidModel, modelSeed: 69109, preserveTaskTitle: true,
      studentInstruction: "Zapisz poznany wzór, podstaw dane i oblicz brakującą długość krawędzi.",
    },
  ],
  status: "published",
});
