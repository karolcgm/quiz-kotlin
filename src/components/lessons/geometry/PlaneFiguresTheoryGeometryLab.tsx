"use client";

import { useEffect, useMemo, useState } from "react";
import { RectangleSquareGeometryLab } from "@/components/lessons/geometry/RectangleSquareGeometryLab";
import { ParallelogramRhombusGeometryLab } from "@/components/lessons/geometry/ParallelogramRhombusGeometryLab";
import { TrapezoidGeometryLab } from "@/components/lessons/geometry/TrapezoidGeometryLab";
import { QuadrilateralOverviewGeometryLab } from "@/components/lessons/geometry/QuadrilateralOverviewGeometryLab";
import { SymmetryAxisGeometryLab } from "@/components/lessons/geometry/SymmetryAxisGeometryLab";
import {
  decodePlaneFiguresTheorySeed,
  PLANE_FIGURES_REVIEW_SEEDS,
  type PlaneFiguresTheoryActivity,
  type PlaneFiguresTheoryDifficulty,
} from "@/lib/math/geometry/planeFiguresTheory";
import type { GeometryLabMode } from "@/types/geometry";

interface TheoryTask {
  title: string;
  instruction: string;
  facts: string[];
  options: string[];
  correct: string;
  visual: "rectangle" | "parallelogram" | "trapezoid" | "family" | "symmetry" | "angle" | "lines" | "triangle";
}

const TASKS: Record<Exclude<PlaneFiguresTheoryActivity, "review">, Record<PlaneFiguresTheoryDifficulty, TheoryTask>> = {
  "angle-range": {
    theory: { title: "Pełna rodzina kątów", instruction: "Który opis poprawnie klasyfikuje kąt 0°?", facts: ["Kąt zerowy ma 0°.", "Kąt ostry ma więcej niż 0° i mniej niż 90°.", "Kąt prosty ma 90°, rozwarty — więcej niż 90° i mniej niż 180°.", "Kąt półpełny ma 180°, wklęsły — więcej niż 180° i mniej niż 360°, a pełny — 360°."], options: ["Kąt zerowy", "Kąt ostry", "Kąt pełny"], correct: "Kąt zerowy", visual: "angle" },
    practice: { title: "Kąt wklęsły", instruction: "Kąt ma 225°. Jakiego jest rodzaju?", facts: ["225° jest większe od 180°.", "225° jest mniejsze od 360°."], options: ["Wklęsły", "Rozwarty", "Półpełny"], correct: "Wklęsły", visual: "angle" },
    challenge: { title: "Granice bez zgadywania", instruction: "Który zestaw zawiera kolejno kąt półpełny, wklęsły i pełny?", facts: ["Granice 180° i 360° należą do osobnych rodzajów.", "Kąt wklęsły leży ściśle między tymi granicami."], options: ["180°, 270°, 360°", "179°, 180°, 359°", "90°, 180°, 270°"], correct: "180°, 270°, 360°", visual: "angle" },
  },
  "parallel-angle-pairs": {
    theory: { title: "Proste równoległe i sieczna", instruction: "Które kąty leżą w takim samym położeniu przy obu przecięciach?", facts: ["Sieczna przecina dwie proste równoległe.", "Kąty odpowiadające zajmują takie samo położenie przy obu przecięciach i mają równe miary.", "Kąty naprzemianległe leżą między prostymi, po przeciwnych stronach siecznej, i też są równe."], options: ["Odpowiadające", "Przyległe", "Wierzchołkowe przy jednym punkcie"], correct: "Odpowiadające", visual: "lines" },
    practice: { title: "Kąty odpowiadające", instruction: "Jeden z kątów odpowiadających ma 68°. Ile ma drugi?", facts: ["Proste a i b są równoległe.", "Kąty odpowiadające przy prostych równoległych są równe."], options: ["68°", "112°", "22°"], correct: "68°", visual: "lines" },
    challenge: { title: "Kąty naprzemianległe", instruction: "Kąt naprzemianległy ma 117°. Ile ma kąt przyległy do niego?", facts: ["Najpierw przenieś miarę dzięki równości kątów naprzemianległych.", "Następnie użyj sumy 180° kątów przyległych."], options: ["63°", "117°", "73°"], correct: "63°", visual: "lines" },
  },
  "rectangle-square": {
    theory: { title: "Prostokąt i kwadrat", instruction: "Wybierz cechę wspólną obu figur.", facts: ["Każdy kąt ma 90°.", "Przeciwległe boki prostokąta są równe i równoległe.", "Kwadrat ma dodatkowo cztery równe boki.", "Każdy kwadrat jest prostokątem."], options: ["Cztery kąty proste", "Tylko dwa równe boki", "Brak boków równoległych"], correct: "Cztery kąty proste", visual: "rectangle" },
    practice: { title: "Rozpoznaj po własnościach", instruction: "Figura ma cztery równe boki i cztery kąty proste. Jak nazywa się najdokładniej?", facts: ["Nie kieruj się położeniem rysunku.", "Najdokładniejsza nazwa wykorzystuje wszystkie podane cechy."], options: ["Kwadrat", "Tylko prostokąt", "Trapez równoramienny"], correct: "Kwadrat", visual: "rectangle" },
    challenge: { title: "Obwód prostokąta", instruction: "Jeden bok ma 68 cm, a obwód 304 cm. Oblicz drugi bok.", facts: ["P = 2 · a + 2 · b", "Najpierw oblicz połowę obwodu: a + b."], options: ["84 cm", "76 cm", "168 cm"], correct: "84 cm", visual: "rectangle" },
  },
  "parallelogram-rhombus": {
    theory: { title: "Równoległobok i romb", instruction: "Wybierz zdanie prawdziwe o obu figurach.", facts: ["Przeciwległe boki są równe i równoległe.", "Przeciwległe kąty są równe.", "Kąty przy jednym boku mają razem 180°.", "Romb ma dodatkowo cztery równe boki."], options: ["Przeciwległe boki są równoległe", "Wszystkie kąty mają 90°", "Przekątne zawsze są równe"], correct: "Przeciwległe boki są równoległe", visual: "parallelogram" },
    practice: { title: "Kąty równoległoboku", instruction: "Jeden kąt ma 35°. Jakie są trzy pozostałe?", facts: ["Kąt naprzeciwko ma tę samą miarę.", "Kąt obok uzupełnia go do 180°."], options: ["35°, 145°, 145°", "35°, 35°, 145°", "55°, 125°, 145°"], correct: "35°, 145°, 145°", visual: "parallelogram" },
    challenge: { title: "Ten sam obwód", instruction: "Równoległobok o bokach 7 cm i 11 cm ma taki sam obwód jak romb. Jaką długość ma bok rombu?", facts: ["Obwód równoległoboku: 2 · 7 + 2 · 11.", "Romb ma cztery równe boki."], options: ["9 cm", "18 cm", "7 cm"], correct: "9 cm", visual: "parallelogram" },
  },
  trapezoid: {
    theory: { title: "Trapez", instruction: "Które boki trapezu nazywamy podstawami?", facts: ["Podstawy są równoległe.", "Pozostałe dwa boki to ramiona.", "Trapez prostokątny ma dwa kąty proste.", "Trapez równoramienny ma równe ramiona."], options: ["Boki równoległe", "Zawsze boki najdłuższe", "Boki prostopadłe"], correct: "Boki równoległe", visual: "trapezoid" },
    practice: { title: "Kąty przy ramieniu", instruction: "Jeden kąt przy lewym ramieniu ma 64°. Ile ma drugi kąt przy tym samym ramieniu?", facts: ["Podstawy są równoległe.", "Kąty przy jednym ramieniu mają razem 180°."], options: ["116°", "64°", "26°"], correct: "116°", visual: "trapezoid" },
    challenge: { title: "Ramię trapezu równoramiennego", instruction: "Podstawy mają 42 cm i 18 cm, a obwód wynosi 104 cm. Oblicz długość ramienia.", facts: ["Oba ramiona mają tę samą długość.", "Od obwodu odejmij długości obu podstaw, a resztę podziel przez 2."], options: ["22 cm", "44 cm", "26 cm"], correct: "22 cm", visual: "trapezoid" },
  },
  "quadrilateral-family": {
    theory: { title: "Rodzina czworokątów", instruction: "Wybierz wszystkie rodziny, do których należy kwadrat.", facts: ["Kwadrat ma cechy prostokąta i rombu.", "Prostokąt i romb są równoległobokami.", "Nazwa szczegółowa nie usuwa nazw ogólniejszych."], options: ["Prostokąty, romby i równoległoboki", "Tylko kwadraty", "Wyłącznie romby"], correct: "Prostokąty, romby i równoległoboki", visual: "family" },
    practice: { title: "Najdokładniejsza nazwa", instruction: "Czworokąt ma cztery kąty proste, ale sąsiednie boki mają różne długości. Co to za figura?", facts: ["Cztery kąty proste wystarczają do rozpoznania prostokąta.", "Różne sąsiednie boki wykluczają kwadrat."], options: ["Prostokąt niebędący kwadratem", "Romb", "Dowolny trapez"], correct: "Prostokąt niebędący kwadratem", visual: "family" },
    challenge: { title: "Kontrprzykład", instruction: "Która figura pokazuje, że nie każdy romb jest kwadratem?", facts: ["Kontrprzykład musi spełniać warunek „jest rombem”.", "Jednocześnie nie może mieć wszystkich cech kwadratu."], options: ["Romb z kątami 60° i 120°", "Kwadrat o boku 5 cm", "Prostokąt o bokach 4 cm i 7 cm"], correct: "Romb z kątami 60° i 120°", visual: "family" },
  },
  symmetry: {
    theory: { title: "Oś symetrii", instruction: "Co musi się wydarzyć po złożeniu figury wzdłuż osi symetrii?", facts: ["Obie części figury nakładają się.", "Odpowiadające punkty leżą w tej samej odległości od osi.", "Odcinek łączący parę punktów jest prostopadły do osi."], options: ["Obie części dokładnie się pokrywają", "Figura zmienia obwód", "Punkty przesuwają się wzdłuż osi"], correct: "Obie części dokładnie się pokrywają", visual: "symmetry" },
    practice: { title: "Ile osi?", instruction: "Ile osi symetrii ma prostokąt, który nie jest kwadratem?", facts: ["Jedna oś przechodzi przez środki dłuższych boków.", "Druga przechodzi przez środki krótszych boków.", "Przekątne nie są osiami takiego prostokąta."], options: ["2", "4", "1"], correct: "2", visual: "symmetry" },
    challenge: { title: "Punkt po odbiciu", instruction: "Punkt leży 3 kratki na lewo od pionowej osi. Gdzie znajdzie się jego odbicie?", facts: ["Wysokość punktu się nie zmienia.", "Odległość od osi pozostaje taka sama."], options: ["3 kratki na prawo", "6 kratek na prawo", "Na osi"], correct: "3 kratki na prawo", visual: "symmetry" },
  },
};

const REVIEW_TASKS: TheoryTask[] = [
  { title: "Proste równoległe i prostopadłe", instruction: "Prosta a jest równoległa do b, a prosta c jest prostopadła do b. Jaka jest relacja prostych a i c?", facts: [], options: ["a ⟂ c", "a ∥ c", "a i c pokrywają się"], correct: "a ⟂ c", visual: "lines" },
  { title: "Odległość punktu od prostej", instruction: "Który odcinek wyznacza odległość punktu P od prostej a?", facts: [], options: ["Najkrótszy odcinek prostopadły do a", "Dowolny odcinek łączący P z a", "Najdłuższy odcinek równoległy do a"], correct: "Najkrótszy odcinek prostopadły do a", visual: "lines" },
  { title: "Rodzaj kąta", instruction: "Kąt ma 136°. Jaki to kąt?", facts: [], options: ["Rozwarty", "Ostry", "Wklęsły"], correct: "Rozwarty", visual: "angle" },
  { title: "Zapis kąta", instruction: "W zapisie ∠ABC która litera oznacza wierzchołek kąta?", facts: [], options: ["B", "A", "C"], correct: "B", visual: "angle" },
  { title: "Pomiar kąta", instruction: "Środek kątomierza leży na wierzchołku, a ramię bazowe zaczyna się przy 0°. Drugie ramię wskazuje 74°. Jaka jest miara kąta?", facts: [], options: ["74°", "106°", "90°"], correct: "74°", visual: "angle" },
  { title: "Kąty przyległe", instruction: "Jeden kąt ma 127°. Ile ma kąt przyległy do niego?", facts: [], options: ["53°", "127°", "63°"], correct: "53°", visual: "lines" },
  { title: "Rozpoznawanie wielokąta", instruction: "Która figura jest wielokątem?", facts: [], options: ["Zamknięta figura z odcinków bez skrzyżowań", "Otwarta łamana", "Zamknięta figura z jednym łukiem"], correct: "Zamknięta figura z odcinków bez skrzyżowań", visual: "family" },
  { title: "Obwód wielokąta", instruction: "Boki sześciokąta mają 25 cm, 23 cm, 19 cm, 20 cm, 27 cm i 21 cm. Jaki jest obwód?", facts: [], options: ["135 cm", "115 cm", "155 cm"], correct: "135 cm", visual: "family" },
  { title: "Dwie klasyfikacje trójkąta", instruction: "Trójkąt ma kąty 45°, 45° i 90°. Jak go nazwiesz według boków i kątów?", facts: [], options: ["Równoramienny prostokątny", "Różnoboczny prostokątny", "Równoboczny ostrokątny"], correct: "Równoramienny prostokątny", visual: "triangle" },
  { title: "Czy trójkąt istnieje?", instruction: "Czy odcinki 7 cm, 9 cm i 17 cm utworzą trójkąt?", facts: [], options: ["Nie", "Tak", "Tylko prostokątny"], correct: "Nie", visual: "triangle" },
  { title: "Konstrukcja trójkąta", instruction: "Wybierz poprawną kolejność konstrukcji trójkąta o danych bokach.", facts: [], options: ["Podstawa → dwa łuki → punkt przecięcia → połączenie boków", "Dwa łuki → podstawa → pomiar kąta", "Dowolny trójkąt → dopisanie długości"], correct: "Podstawa → dwa łuki → punkt przecięcia → połączenie boków", visual: "triangle" },
  { title: "Suma kątów trójkąta", instruction: "Dwa kąty trójkąta mają 52° i 68°. Ile ma trzeci kąt?", facts: [], options: ["60°", "70°", "80°"], correct: "60°", visual: "triangle" },
  { title: "Kąty trójkąta równoramiennego", instruction: "Kąt przy wierzchołku trójkąta równoramiennego ma 44°. Ile ma każdy kąt przy podstawie?", facts: [], options: ["68°", "72°", "44°"], correct: "68°", visual: "triangle" },
  { title: "Przekątne prostokąta", instruction: "Które zdanie jest zawsze prawdziwe o przekątnych prostokąta?", facts: [], options: ["Są równe i przecinają się w połowie", "Są zawsze prostopadłe", "Jedna jest dwa razy dłuższa"], correct: "Są równe i przecinają się w połowie", visual: "rectangle" },
  { title: "Obwód prostokąta", instruction: "Jeden bok prostokąta ma 68 cm, a obwód 304 cm. Ile ma drugi bok?", facts: [], options: ["84 cm", "76 cm", "168 cm"], correct: "84 cm", visual: "rectangle" },
  { title: "Przekątne rombu", instruction: "Która własność odróżnia przekątne rombu od przekątnych zwykłego równoległoboku?", facts: [], options: ["Są prostopadłe", "Nie przecinają się", "Zawsze są równe"], correct: "Są prostopadłe", visual: "parallelogram" },
  { title: "Kąty równoległoboku", instruction: "Jeden kąt równoległoboku ma 35°. Wybierz miary trzech pozostałych kątów.", facts: [], options: ["35°, 145°, 145°", "35°, 35°, 145°", "55°, 125°, 145°"], correct: "35°, 145°, 145°", visual: "parallelogram" },
  { title: "Obwód rombu", instruction: "Równoległobok o bokach 7 cm i 11 cm ma taki sam obwód jak romb. Ile ma bok rombu?", facts: [], options: ["9 cm", "18 cm", "7 cm"], correct: "9 cm", visual: "parallelogram" },
  { title: "Kąty trapezu", instruction: "Jeden kąt przy ramieniu trapezu ma 64°. Ile ma drugi kąt przy tym samym ramieniu?", facts: [], options: ["116°", "64°", "26°"], correct: "116°", visual: "trapezoid" },
  { title: "Obwód trapezu równoramiennego", instruction: "Podstawy trapezu mają 42 cm i 18 cm, a obwód wynosi 104 cm. Ile ma każde ramię?", facts: [], options: ["22 cm", "44 cm", "26 cm"], correct: "22 cm", visual: "trapezoid" },
  { title: "Rodzina czworokątów", instruction: "Do których rodzin należy każdy kwadrat?", facts: [], options: ["Do prostokątów, rombów i równoległoboków", "Tylko do kwadratów", "Wyłącznie do rombów"], correct: "Do prostokątów, rombów i równoległoboków", visual: "family" },
  { title: "Osie symetrii", instruction: "Ile osi symetrii ma prostokąt, który nie jest kwadratem?", facts: [], options: ["2", "4", "1"], correct: "2", visual: "symmetry" },
];

function GeometryVisual({ type }: { type: TheoryTask["visual"] }) {
  if (type === "family") return <div className="grid gap-2 text-center text-sm font-black"><div className="rounded-2xl border-2 border-slate-400 bg-slate-50 p-3">CZWOROKĄTY<div className="mt-2 grid grid-cols-2 gap-2"><div className="rounded-xl border-2 border-cyan-400 bg-cyan-50 p-2">RÓWNOLEGŁOBOKI<div className="mt-2 grid grid-cols-2 gap-1"><span className="rounded-lg bg-white p-2">PROSTOKĄTY</span><span className="rounded-lg bg-white p-2">ROMBY</span></div><div className="mx-auto mt-2 w-28 rounded-lg bg-indigo-600 p-2 text-white">KWADRATY</div></div><div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-2">TRAPEZY</div></div></div></div>;
  const common = { fill: "#e0e7ff", stroke: "#3730a3", strokeWidth: 5 };
  return <svg viewBox="0 0 520 260" className="mx-auto h-auto w-full max-w-xl" role="img" aria-label="Model własności figury">
    <rect width="520" height="260" rx="24" fill="#f8fafc" />
    {type === "rectangle" ? <><rect x="55" y="70" width="180" height="120" rx="4" {...common} /><path d="M65 70v14h14 M225 70v14h-14 M65 190v-14h14 M225 190v-14h-14" fill="none" stroke="#dc2626" strokeWidth="4" /><rect x="330" y="70" width="120" height="120" rx="4" {...common} /><path d="M340 70v14h14 M440 70v14h-14 M340 190v-14h14 M440 190v-14h-14" fill="none" stroke="#dc2626" strokeWidth="4" /></> : null}
    {type === "parallelogram" ? <><polygon points="90,185 150,65 405,65 345,185" {...common} /><path d="M122 125l18 8 M357 125l18 8 M245 65v12 M250 173v12" stroke="#dc2626" strokeWidth="5" /><text x="117" y="170" fontSize="22" fontWeight="900">35°</text><text x="336" y="91" fontSize="22" fontWeight="900">35°</text></> : null}
    {type === "trapezoid" ? <><polygon points="80,190 155,65 370,65 445,190" {...common} /><path d="M210 55h100 M155 205h215" stroke="#0891b2" strokeWidth="5" markerEnd="url(#arrow)" /><text x="250" y="48" textAnchor="middle" fontSize="18" fontWeight="900">podstawa</text><text x="260" y="235" textAnchor="middle" fontSize="18" fontWeight="900">podstawa</text><text x="96" y="120" fontSize="16" fontWeight="800">ramię</text><text x="383" y="120" fontSize="16" fontWeight="800">ramię</text></> : null}
    {type === "symmetry" ? <><path d="M260 35v195" stroke="#7c3aed" strokeWidth="4" strokeDasharray="10 8" /><polygon points="90,205 155,80 225,125 205,205" {...common} /><polygon points="430,205 365,80 295,125 315,205" fill="#fce7f3" stroke="#be185d" strokeWidth="5" /><path d="M225 125h70 M155 80h210" stroke="#0f766e" strokeWidth="2" strokeDasharray="5 5" /></> : null}
    {type === "angle" ? <><path d="M100 200h320 M260 200L110 60" stroke="#1e3a8a" strokeWidth="7" strokeLinecap="round" /><path d="M330 200 A70 70 0 0 0 209 135" fill="none" stroke="#dc2626" strokeWidth="6" /><text x="275" y="125" fontSize="28" fontWeight="900">136°</text></> : null}
    {type === "lines" ? <><path d="M55 85h410 M55 195h410 M130 235L390 40" stroke="#1e3a8a" strokeWidth="6" /><text x="420" y="75" fontSize="22" fontWeight="900">a</text><text x="420" y="185" fontSize="22" fontWeight="900">b</text><text x="250" y="142" fontSize="22" fontWeight="900">α</text></> : null}
    {type === "triangle" ? <><polygon points="85,205 260,45 440,205" {...common} /><path d="M245 61l15 15 15-15" fill="none" stroke="#dc2626" strokeWidth="4" /><text x="140" y="195" fontSize="20" fontWeight="900">45°</text><text x="340" y="195" fontSize="20" fontWeight="900">45°</text></> : null}
    <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#0891b2" /></marker></defs>
  </svg>;
}

export interface PlaneFiguresTheoryGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  assessmentSubmitted?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export function PlaneFiguresTheoryGeometryLab({ seed, mode = "practice", readOnly = false, assessmentSubmitted = false, onResultChange }: PlaneFiguresTheoryGeometryLabProps) {
  const decoded = decodePlaneFiguresTheorySeed(seed);
  const isReview = decoded.activity === "review";
  const task = useMemo(() => {
    if (decoded.activity !== "review") return TASKS[decoded.activity][decoded.difficulty];
    const index = PLANE_FIGURES_REVIEW_SEEDS.indexOf(seed as typeof PLANE_FIGURES_REVIEW_SEEDS[number]);
    return REVIEW_TASKS[Math.max(0, index)] ?? REVIEW_TASKS[0]!;
  }, [decoded.activity, decoded.difficulty, seed]);
  const [selectionState, setSelectionState] = useState<{ seed: number; value: string | null }>({ seed, value: null });
  const [feedbackState, setFeedbackState] = useState<{ seed: number; value: string | null }>({ seed, value: null });
  const selected = selectionState.seed === seed ? selectionState.value : null;
  const feedback = feedbackState.seed === seed ? feedbackState.value : null;
  const locked = readOnly || mode === "assessment" && assessmentSubmitted;

  useEffect(() => {
    onResultChange?.(null);
  }, [seed, onResultChange]);

  if (decoded.activity === "rectangle-square") return <RectangleSquareGeometryLab key={seed} seed={seed} mode={mode} readOnly={readOnly} assessmentSubmitted={assessmentSubmitted} onResultChange={onResultChange} />;
  if (decoded.activity === "parallelogram-rhombus") return <ParallelogramRhombusGeometryLab key={seed} seed={seed} mode={mode} readOnly={readOnly} assessmentSubmitted={assessmentSubmitted} onResultChange={onResultChange} />;
  if (decoded.activity === "trapezoid") return <TrapezoidGeometryLab key={seed} seed={seed} mode={mode} readOnly={readOnly} assessmentSubmitted={assessmentSubmitted} onResultChange={onResultChange} />;
  if (decoded.activity === "quadrilateral-family") return <QuadrilateralOverviewGeometryLab key={seed} seed={seed} />;
  if (decoded.activity === "symmetry") return <SymmetryAxisGeometryLab key={seed} seed={seed} mode={mode} readOnly={readOnly} assessmentSubmitted={assessmentSubmitted} onResultChange={onResultChange} />;

  const confirm = () => {
    if (!selected) {
      setFeedbackState({ seed, value: "Najpierw wybierz odpowiedź." });
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    if (selected !== task.correct) {
      setFeedbackState({ seed, value: "Sprawdź zaznaczone własności figury i spróbuj ponownie." });
      onResultChange?.(false, selected);
      return;
    }
    setFeedbackState({ seed, value: "Dobrze. Odpowiedź wynika z zaznaczonej własności figury." });
    onResultChange?.(true, selected);
  };

  return <section className="grid gap-5" data-plane-figures-theory data-activity={decoded.activity} data-difficulty={decoded.difficulty}>
    {!isReview ? <div className="grid gap-4 rounded-3xl border-2 border-indigo-200 bg-white p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,.85fr)]"><GeometryVisual type={task.visual} /><aside className="rounded-2xl bg-indigo-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-indigo-700">Najpierw poznaj własności</p><h3 className="mt-2 text-xl font-black text-slate-950">{task.title}</h3><ul className="mt-3 grid gap-2 text-sm font-bold text-slate-800">{task.facts.map((fact) => <li key={fact} className="rounded-xl bg-white px-3 py-2">• {fact}</li>)}</ul></aside></div> : null}
    <div className="grid gap-4 rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4">{isReview ? <><p className="text-xs font-black uppercase tracking-wide text-cyan-800">Zadanie powtórzeniowe</p><h3 className="text-xl font-black text-slate-950">{task.title}</h3></> : null}<p className="text-lg font-black text-slate-950">{task.instruction}</p><div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Wybierz odpowiedź">{task.options.map((option) => <button key={option} type="button" disabled={locked} aria-pressed={selected === option} onClick={() => { setSelectionState({ seed, value: option }); setFeedbackState({ seed, value: null }); }} className={`min-h-14 rounded-2xl border-2 px-3 py-2 text-sm font-black ${selected === option ? "border-indigo-700 bg-indigo-700 text-white" : "border-indigo-300 bg-white text-indigo-950"}`}>{option}</button>)}</div>{!locked ? <button type="button" onClick={confirm} className="min-h-14 rounded-2xl bg-cyan-300 px-5 font-black text-cyan-950">Zatwierdź</button> : null}{feedback ? <p role="status" className={`rounded-xl p-3 font-black ${selected === task.correct ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>{feedback}</p> : null}</div>
  </section>;
}
