import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-2-9-${suffix}-${index + 1}`,
    generatorId: "grade4-clock-time-l1-v1",
    seed: seed + index,
    difficulty: index >= count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m429GodzinyNaZegarachV1 = buildLessonPackage({
  id: "m4-2-9-godziny-na-zegarach-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S2",
  topicId: "M4-2.9",
  lessonNumber: 1,
  title: "Godziny na zegarach",
  studentGoal: "Nauczę się odczytywać godziny, zamieniać jednostki czasu i obliczać czas trwania wydarzeń.",
  successCriteria: [
    "Odczytuję godzinę na zegarze analogowym i zapisuję ją w systemie 24-godzinnym.",
    "Zamieniam sekundy, minuty, godziny, kwadranse i doby.",
    "Obliczam, ile czasu upłynęło między dwiema godzinami.",
  ],
  learningGoals: [
    { id: "m4-2-9-goal-1", studentGoal: "Nauczę się odczytywać czas na różnych zegarach.", successCriteria: ["Odczytuję wskazówki zegara i zapisuję pełną godzinę oraz minuty."], curriculumReferences: [] },
    { id: "m4-2-9-goal-2", studentGoal: "Poznam jednostki czasu i ich zależności.", successCriteria: ["Zamieniam sekundy, minuty, godziny, kwadranse i doby."], curriculumReferences: [] },
    { id: "m4-2-9-goal-3", studentGoal: "Nauczę się obliczać czas trwania.", successCriteria: ["Obliczam, przez ile godzin i minut otwarte jest wskazane miejsce."], curriculumReferences: [] },
  ],
  skillIds: ["M4-2.9-clock", "M4-2.9-convert-time", "M4-2.9-duration"],
  prerequisiteSkillIds: ["M4-1.1-add-sub", "M4-1.4-multiply-divide-by-powers-of-ten"],
  estimatedMinutes: 45,
  coreLesson: "Zegar analogowy i cyfrowy, system 24-godzinny, sekundy, minuty, godziny, kwadranse, doby oraz obliczanie czasu trwania.",
  paperEvidence: "Karta ucznia: tarcze zegarowe, tabela zamiany jednostek czasu oraz przedziały godzin otwarcia.",
  overview: "Lekcja łączy czytelny model zegara z trzema seriami ćwiczeń: odczytywaniem czasu, zamianą jednostek i obliczaniem czasu otwarcia.",
  openingScript: "Pokaż uczniom zegar analogowy i cyfrowy wskazujące tę samą godzinę. Zapytaj, co oznacza każda wskazówka i dwukropek w zapisie cyfrowym.",
  closingScript: "Poproś ucznia o podanie jednej zależności między jednostkami czasu i obliczenie, ile minut trwa półtorej godziny.",
  commonMisconceptions: [
    "Uczeń traktuje godzinę jak 100 minut zamiast 60 minut.",
    "Uczeń myli wskazówkę godzinową z minutową.",
    "Uczeń zapisuje godzinę popołudniową bez uwzględnienia systemu 24-godzinnego.",
    "Uczeń przyjmuje, że kwadrans ma 25 minut zamiast 15 minut.",
    "Uczeń odejmuje same liczby godzin i pomija minuty albo przejście przez północ.",
  ],
  stageBlueprints: [
    { suffix: "information", kind: "explore", title: "Zegar analogowy i cyfrowy", minutes: 7, headline: "Dwa sposoby zapisywania czasu", body: "Porównaj tarczę zegara z zapisem cyfrowym i poznaj podstawowe jednostki czasu.", modelId: "grade4-clock-time-lab", modelSeed: 4291, studentInstruction: "Wskaż krótką i długą wskazówkę oraz odczytaj godzinę cyfrową.", teacherInstruction: "Podkreśl, że godzina ma 60 minut, a minuta 60 sekund." },
    { suffix: "quarters-day", kind: "worked-example", title: "Kwadranse, godziny i doby", minutes: 7, headline: "Cztery kwadranse tworzą godzinę", body: "Porównaj pełną godzinę, kwadrans, pół godziny oraz trzy kwadranse.", modelId: "grade4-clock-time-lab", modelSeed: 4292, studentInstruction: "Obserwuj położenie długiej wskazówki po kolejnych kwadransach.", teacherInstruction: "Zestaw zapis poranny i wieczorny tej samej godziny na tarczy." },
    { suffix: "read-clock", kind: "practice", title: "Odczytaj godzinę", minutes: 10, headline: "Wskazówki pokazują czas", body: "Odczytaj zegar i wpisz godzinę oraz minuty.", modelId: "grade4-clock-time-lab", modelSeed: 4293, questions: questions("read-clock", 5, "M4-2.9-clock", 429100), preserveTaskTitle: true, studentInstruction: "Uwzględnij informację, czy jest rano, w południe, czy po południu.", teacherInstruction: "Przy godzinach popołudniowych przypomnij o zapisie 13–23." },
    { suffix: "convert", kind: "practice", title: "Zamień jednostkę czasu", minutes: 10, headline: "Sekundy, minuty, godziny, kwadranse i doby", body: "Wpisz wynik zamiany w podanej jednostce.", modelId: "grade4-clock-time-lab", modelSeed: 4294, questions: questions("convert", 6, "M4-2.9-convert-time", 429200), preserveTaskTitle: true, studentInstruction: "Najpierw wybierz właściwą zależność między jednostkami.", teacherInstruction: "Poproś uczniów o uzasadnianie, czy należy mnożyć, czy dzielić." },
    { suffix: "opening-hours", kind: "challenge", title: "Ile czasu jest otwarte?", minutes: 11, headline: "Oblicz czas od otwarcia do zamknięcia", body: "Podaj pełne godziny i pozostałe minuty.", modelId: "grade4-clock-time-lab", modelSeed: 4295, questions: questions("opening-hours", 6, "M4-2.9-duration", 429300), preserveTaskTitle: true, studentInstruction: "Możesz najpierw dojść do pełnej godziny, a potem policzyć pozostały czas.", teacherInstruction: "Ostatnie zadanie przechodzi przez północ; wykorzystaj zależność 1 doba = 24 h." },
  ],
  status: "published",
});
