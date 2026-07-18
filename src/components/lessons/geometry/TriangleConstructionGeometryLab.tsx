"use client";

import { useEffect, useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { LessonTaskChoice } from "@/components/lessons/LessonTaskFrame";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import {
  analyzeTriangleSideLengths,
  createPublicTriangleConstructionTask,
  createTriangleConstructionGeometryState,
  triangleVertexFromSides,
} from "@/lib/math/geometry/triangleConstruction";
import type { DiagnosticFeedbackCopy, DiagnosticHighlightTarget, DiagnosticSolution } from "@/types/diagnosticFeedback";
import type { GeometryLabMode, GeometryLabState } from "@/types/geometry";
import styles from "@/components/lessons/geometry/triangleConstruction.module.css";

type ConstructionDiagnosticCode =
  | "TRIANGLE_DECISION_MISSING"
  | "TRIANGLE_DECISION_WRONG"
  | "TRIANGLE_CONSTRUCTION_ORDER"
  | "TRIANGLE_INEQUALITY_EVIDENCE_MISSING";

type ConstructionStep = 0 | 1 | 2 | 3 | 4;

const COPY: Record<ConstructionDiagnosticCode, DiagnosticFeedbackCopy> = {
  TRIANGLE_DECISION_MISSING: {
    area: "Nie wybrano jeszcze odpowiedzi.",
    guidingQuestion: "Czy dwa krótsze odcinki sięgają dalej niż najdłuższy?",
    visualHint: "Ułóż dwa krótsze odcinki jeden za drugim nad najdłuższym.",
    analogousExample: "Dla 3 cm, 4 cm i 5 cm dwa krótsze mają razem 7 cm, więc przechodzą poza koniec odcinka 5 cm.",
  },
  TRIANGLE_DECISION_WRONG: {
    area: "Decyzja nie zgadza się z widocznym domknięciem odcinków.",
    guidingQuestion: "Co widać przy prawym końcu najdłuższego odcinka: zapas, zetknięcie czy lukę?",
    visualHint: "Pomarańczowy nawias pokazuje dokładną różnicę długości.",
    analogousExample: "Jeśli 2 cm + 3 cm < 6 cm, pozostaje luka 1 cm i trójkąt nie może się zamknąć.",
  },
  TRIANGLE_CONSTRUCTION_ORDER: {
    area: "Konstrukcja nie została wykonana w wymaganej kolejności.",
    guidingQuestion: "Czy podstawa jest już narysowana i czy oba promienie pochodzą z jej końców?",
    visualHint: "Aktywny przycisk wskazuje następny dozwolony krok konstrukcji.",
    analogousExample: "Najpierw AB, potem łuk o środku A, następnie łuk o środku B, punkt C i boki AC, BC.",
  },
  TRIANGLE_INEQUALITY_EVIDENCE_MISSING: {
    area: "Decyzja jest poprawna, ale brakuje uzasadnienia.",
    guidingQuestion: "Jak zapisać porównanie sumy dwóch krótszych boków z najdłuższym?",
    visualHint: "Przepisz licznik długości z modelu, używając znaku >, = albo <.",
    analogousExample: "4 + 5 > 8, więc trójkąt można skonstruować.",
  },
};

const SOLUTIONS: Record<ConstructionDiagnosticCode, DiagnosticSolution> = {
  TRIANGLE_DECISION_MISSING: { steps: ["Ułóż odcinki na jednej prostej.", "Znajdź najdłuższy.", "Wybierz: można albo nie można."] },
  TRIANGLE_DECISION_WRONG: { steps: ["Dodaj dwa krótsze odcinki.", "Porównaj sumę z najdłuższym.", "Popraw decyzję."] },
  TRIANGLE_CONSTRUCTION_ORDER: { steps: ["Narysuj AB.", "Zakreśl łuk z A.", "Zakreśl łuk z B.", "Połącz punkt przecięcia z A i B."] },
  TRIANGLE_INEQUALITY_EVIDENCE_MISSING: { steps: ["Zapisz sumę dwóch krótszych.", "Wstaw właściwy znak.", "Dopisz wniosek o konstrukcji."] },
};

function feedbackFor(code: ConstructionDiagnosticCode) {
  const partial = code === "TRIANGLE_INEQUALITY_EVIDENCE_MISSING";
  const highlight: DiagnosticHighlightTarget = {
    id: `construction-${code.toLowerCase()}`,
    kind: code === "TRIANGLE_CONSTRUCTION_ORDER" ? "field" : "pair",
    memberIds: code === "TRIANGLE_CONSTRUCTION_ORDER" ? ["AB", "łuk A", "łuk B", "C"] : ["krótszy 1", "krótszy 2", "najdłuższy"],
    label: COPY[code].area,
    state: "attention",
    pattern: "dashed",
    symbol: code === "TRIANGLE_CONSTRUCTION_ORDER" ? "1 → 2 → 3 → 4" : "+ / >",
    accent: "amber",
  };
  return {
    result: createLessonGradeResult({ status: partial ? "partially-correct" : "incorrect", score: partial ? 1 : 0, maxScore: 2, errorCodes: [code], feedbackKey: `geometry.${code.toLowerCase()}` }),
    copy: COPY[code],
    highlights: [highlight],
    solution: SOLUTIONS[code],
  };
}

function scaleFor(sides: readonly number[]): number {
  return Math.min(48, 390 / Math.max(...sides));
}

export interface TriangleConstructionGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

const FEASIBILITY_TASKS = [
  { sides: [3, 4, 5] as const, possible: true },
  { sides: [2, 3, 6] as const, possible: false },
  { sides: [4, 5, 9] as const, possible: false },
  { sides: [5, 5, 8] as const, possible: true },
  { sides: [4, 7, 10] as const, possible: true },
  { sides: [3, 6, 10] as const, possible: false },
] as const;

function FeasibilitySegments({ sides }: { sides: readonly [number, number, number] }) {
  const rows = sides.map((length, index) => ({ segment: `odcinek ${index + 1}`, length: `${length} cm` }));
  return (
    <AccessibleMathSvg
      title="Trzy dane odcinki"
      description={`Odcinki mają długości ${sides.join(" cm, ")} cm.`}
      viewBox="0 0 600 240"
      className={styles.feasibilitySvg}
      columns={[{ key: "segment", label: "Odcinek" }, { key: "length", label: "Długość" }]}
      rows={rows}
    >
      {sides.map((length, index) => {
        const y = 55 + index * 70;
        return (
          <g key={`${length}-${index}`}>
            <line x1="105" y1={y} x2={105 + length * 38} y2={y} stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" />
            <line x1="105" y1={y - 11} x2="105" y2={y + 11} stroke="#1e3a8a" strokeWidth="4" />
            <line x1={105 + length * 38} y1={y - 11} x2={105 + length * 38} y2={y + 11} stroke="#1e3a8a" strokeWidth="4" />
            <text x="72" y={y + 7} textAnchor="middle" className={styles.segmentName}>{String.fromCharCode(97 + index)}</text>
            <text x={125 + length * 38} y={y + 7} className={styles.segmentLength}>{length} cm</text>
          </g>
        );
      })}
    </AccessibleMathSvg>
  );
}

function TriangleFeasibilitySeries({ readOnly = false, highContrast = false, onResultChange }: Pick<TriangleConstructionGeometryLabProps, "readOnly" | "highContrast" | "onResultChange">) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [finished, setFinished] = useState(false);
  const task = FEASIBILITY_TASKS[taskIndex]!;

  useEffect(() => {
    if (!correct || finished || taskIndex === FEASIBILITY_TASKS.length - 1) return;
    const timer = window.setTimeout(() => {
      setTaskIndex((current) => current + 1);
      setSelected(null);
      setCorrect(false);
      setFeedback("");
    }, 650);
    return () => window.clearTimeout(timer);
  }, [correct, finished, taskIndex]);

  const choose = (answer: boolean) => {
    if (readOnly || correct || finished) return;
    setSelected(answer);
    if (answer !== task.possible) {
      setFeedback("Sprawdź sumę dwóch krótszych boków. Musi być większa, a nie równa najdłuższemu bokowi.");
      onResultChange?.(false, answer ? "tak" : "nie");
      return;
    }
    setCorrect(true);
    if (taskIndex === FEASIBILITY_TASKS.length - 1) {
      setFinished(true);
      setFeedback("Dobrze. Poprawnie rozpoznajesz, kiedy można skonstruować trójkąt.");
      onResultChange?.(true, "ukończono sześć decyzji o możliwości konstrukcji");
      return;
    }
    setFeedback("Dobrze. Za chwilę pojawi się następny zestaw boków.");
    onResultChange?.(null);
  };

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-construction-lab data-triangle-feasibility-series>
      <div className={styles.ruleCard}>
        <strong>Trójkąt można skonstruować tylko wtedy, gdy suma długości dwóch krótszych boków jest większa od długości najdłuższego boku.</strong>
        <span>Jeżeli suma jest równa lub mniejsza — trójkąt nie powstanie.</span>
      </div>
      <div className={styles.seriesHeader}>
        <div>
          <p className={styles.eyebrow}>Warunek trójkąta</p>
          <h2>Czy z tych odcinków można zbudować trójkąt?</h2>
        </div>
        <b>Zadanie {taskIndex + 1}/{FEASIBILITY_TASKS.length}</b>
      </div>
      <div className={styles.feasibilityCard}>
        <FeasibilitySegments sides={task.sides} />
        <div className={styles.yesNoChoices} role="group" aria-label="Czy można zbudować trójkąt?">
          <LessonTaskChoice type="button" selected={selected === true} disabled={readOnly || correct} onClick={() => choose(true)}>Tak</LessonTaskChoice>
          <LessonTaskChoice type="button" selected={selected === false} disabled={readOnly || correct} onClick={() => choose(false)}>Nie</LessonTaskChoice>
        </div>
      </div>
      <p className={`${styles.seriesFeedback} ${correct ? styles.seriesFeedbackCorrect : ""}`} role="status" aria-live="polite">{feedback}</p>
    </section>
  );
}

const VISUAL_STEPS = [
  "Dane: trzy odcinki",
  "Narysuj podstawę AB",
  "Zakreśl łuk z A",
  "Zakreśl łuk z B",
  "Zaznacz punkt C",
  "Połącz A–C i B–C",
] as const;

function ConstructionCompass({ center }: { center: "A" | "B" }) {
  const hinge = center === "A" ? { x: 260, y: 298 } : { x: 413, y: 207 };
  const needle = center === "A" ? { x: 140, y: 350 } : { x: 470, y: 350 };
  const pencil = { x: 264, y: 168 };
  return (
    <g data-construction-compass aria-label={`Cyrkiel ustawiony w punkcie ${center}`}>
      <line x1={hinge.x} y1={hinge.y} x2={needle.x} y2={needle.y} stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      <line x1={hinge.x} y1={hinge.y} x2={pencil.x} y2={pencil.y} stroke="#0e7490" strokeWidth="8" strokeLinecap="round" />
      <circle cx={hinge.x} cy={hinge.y} r="13" fill="#f8fafc" stroke="#334155" strokeWidth="6" />
      <path d={`M ${needle.x - 5} ${needle.y + 12} L ${needle.x} ${needle.y} L ${needle.x + 5} ${needle.y + 12}`} fill="none" stroke="#334155" strokeWidth="4" />
      <path d={`M ${pencil.x - 5} ${pencil.y - 7} L ${pencil.x} ${pencil.y + 7} L ${pencil.x + 5} ${pencil.y - 7}`} fill="#fbbf24" stroke="#92400e" strokeWidth="3" />
    </g>
  );
}

function TriangleConstructionVisual({ readOnly = false, highContrast = false, onResultChange }: Pick<TriangleConstructionGeometryLabProps, "readOnly" | "highContrast" | "onResultChange">) {
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const a = { x: 140, y: 350 };
  const b = { x: 470, y: 350 };
  const c = { x: 264, y: 168 };

  const selectStep = (nextStep: number) => {
    if (readOnly || nextStep > furthestStep + 1) return;
    setStep(nextStep);
    setFurthestStep((current) => Math.max(current, nextStep));
    onResultChange?.(nextStep === VISUAL_STEPS.length - 1 ? true : null, nextStep === VISUAL_STEPS.length - 1 ? "obejrzano pełną konstrukcję" : undefined);
  };

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-construction-lab data-triangle-construction-visual>
      <div className={styles.visualHeader}>
        <div>
          <p className={styles.eyebrow}>Konstrukcja linijką i cyrklem</p>
          <h2>Trójkąt o bokach 6 cm, 5 cm i 4 cm</h2>
          <p>Cyrkiel nie mierzy od nowa — przenosi długości danych odcinków na rysunek.</p>
        </div>
        <b>Krok {step + 1}/{VISUAL_STEPS.length}</b>
      </div>
      <div className={styles.visualCanvas}>
        <AccessibleMathSvg
          title="Konstrukcja trójkąta o trzech danych bokach"
          description={`Aktualny etap: ${VISUAL_STEPS[step]}. Najpierw rysujemy podstawę, potem dwa łuki o promieniach równych pozostałym bokom, zaznaczamy ich przecięcie i łączymy wierzchołki.`}
          viewBox="0 0 620 430"
          className={styles.constructionSvg}
          columns={[{ key: "step", label: "Krok" }, { key: "action", label: "Czynność" }]}
          rows={VISUAL_STEPS.slice(1).map((action, index) => ({ step: index + 1, action }))}
        >
          <g data-three-source-segments>
            <text x="35" y="38" className={styles.sourceTitle}>Dane odcinki</text>
            <line x1="160" y1="34" x2="340" y2="34" className={styles.sourceSegment} /><path d="M160 25 V43 M340 25 V43" className={styles.sourceEndMarks} /><text x="355" y="40" className={styles.sourceLabel}>6 cm</text>
            <line x1="160" y1="68" x2="310" y2="68" className={styles.sourceSegment} /><path d="M160 59 V77 M310 59 V77" className={styles.sourceEndMarks} /><text x="325" y="74" className={styles.sourceLabel}>5 cm</text>
            <line x1="160" y1="102" x2="280" y2="102" className={styles.sourceSegment} /><path d="M160 93 V111 M280 93 V111" className={styles.sourceEndMarks} /><text x="295" y="108" className={styles.sourceLabel}>4 cm</text>
          </g>
          {step >= 1 ? <g data-base-ab><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#172554" strokeWidth="5" /><text x="305" y="382" textAnchor="middle" className={styles.constructionLabel}>AB = 6 cm</text><text x="120" y="358" className={styles.pointLabel}>A</text><text x="482" y="358" className={styles.pointLabel}>B</text></g> : null}
          {step >= 2 ? <circle cx={a.x} cy={a.y} r="220" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="8 7" data-arc-a /> : null}
          {step >= 3 ? <circle cx={b.x} cy={b.y} r="275" fill="none" stroke="#7c3aed" strokeWidth="4" strokeDasharray="5 8" data-arc-b /> : null}
          {step === 2 ? <ConstructionCompass center="A" /> : null}
          {step === 3 ? <ConstructionCompass center="B" /> : null}
          {step >= 4 ? <g data-point-c><circle cx={c.x} cy={c.y} r="8" fill="#ea580c" /><text x={c.x + 14} y={c.y - 12} className={styles.pointLabel}>C</text></g> : null}
          {step >= 5 ? <g data-completed-triangle><line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke="#2563eb" strokeWidth="6" /><line x1={b.x} y1={b.y} x2={c.x} y2={c.y} stroke="#7c3aed" strokeWidth="6" /><text x="175" y="245" className={styles.constructionLabel}>4 cm</text><text x="390" y="245" className={styles.constructionLabel}>5 cm</text></g> : null}
        </AccessibleMathSvg>
      </div>
      <p className={styles.currentStep} role="status" aria-live="polite"><strong>{VISUAL_STEPS[step]}</strong>{step === 2 ? " — ustaw ostrze cyrkla w A i promień równy odcinkowi 4 cm." : step === 3 ? " — ustaw ostrze w B i promień równy odcinkowi 5 cm." : step === 4 ? " — przecięcie łuków wyznacza wierzchołek C." : ""}</p>
      <div className={styles.visualSteps} aria-label="Etapy konstrukcji">
        {VISUAL_STEPS.map((label, index) => (
          <button key={label} type="button" aria-pressed={step === index} disabled={readOnly || index > furthestStep + 1} onClick={() => selectStep(index)}>{index + 1}. {label}</button>
        ))}
      </div>
    </section>
  );
}

function TriangleConstructionLegacyLab({ seed, mode = "practice", readOnly = false, highContrast = false, assessmentSubmitted = false, onStateChange, onResultChange }: TriangleConstructionGeometryLabProps) {
  const task = useMemo(() => createPublicTriangleConstructionTask(seed), [seed]);
  const [sides, setSides] = useState<[number, number, number]>([...task.sideLengths]);
  const [step, setStep] = useState<ConstructionStep>(task.activity === "close-segments" || task.activity === "inequality" ? 0 : 1);
  const [decision, setDecision] = useState<"possible" | "impossible" | null>(null);
  const [evidenceConfirmed, setEvidenceConfirmed] = useState(false);
  const [diagnosticCode, setDiagnosticCode] = useState<ConstructionDiagnosticCode | null>(null);
  const [announcement, setAnnouncement] = useState("Model gotowy. Zmieniaj długości albo wykonuj konstrukcję krok po kroku.");
  const analysis = useMemo(() => analyzeTriangleSideLengths(sides), [sides]);
  const scale = scaleFor(sides);
  const vertices = triangleVertexFromSides(sides, scale, { x: 100, y: 305 });
  const locked = readOnly || assessmentSubmitted;
  const feedback = diagnosticCode ? feedbackFor(diagnosticCode) : null;
  const [shortA, shortB, longest] = analysis.sorted;
  const layoutStart = 90;
  const shortEnd = layoutStart + analysis.shortSum * scale;
  const longestEnd = layoutStart + longest * scale;
  const relationSymbol = analysis.relation === "greater" ? ">" : analysis.relation === "equal" ? "=" : "<";

  const publish = (nextSides: readonly [number, number, number]) => {
    onStateChange?.(createTriangleConstructionGeometryState(seed, mode, nextSides));
  };

  const updateSide = (index: number, raw: number) => {
    if (locked || !Number.isFinite(raw)) return;
    const next = [...sides] as [number, number, number];
    next[index] = Math.max(1, Math.min(9, Math.round(raw * 2) / 2));
    setSides(next);
    setDecision(null);
    setEvidenceConfirmed(false);
    setDiagnosticCode(null);
    onResultChange?.(null);
    setStep(task.activity === "close-segments" || task.activity === "inequality" ? 0 : 1);
    setAnnouncement(`Długości zmienione: ${next.join(" cm, ")} cm. Rysunek zaktualizowano.`);
    publish(next);
  };

  const advance = (expected: ConstructionStep, next: ConstructionStep, message: string) => {
    if (locked) return;
    if (step !== expected) {
      setDiagnosticCode("TRIANGLE_CONSTRUCTION_ORDER");
      setAnnouncement("Wykonaj poprzedni krok konstrukcji.");
      return;
    }
    setStep(next);
    setDiagnosticCode(null);
    onResultChange?.(null);
    setAnnouncement(message);
  };

  const check = () => {
    if (!decision) {
      setDiagnosticCode("TRIANGLE_DECISION_MISSING");
      onResultChange?.(null);
      return;
    }
    const correct = decision === (analysis.possible ? "possible" : "impossible");
    if (!correct) {
      setDiagnosticCode("TRIANGLE_DECISION_WRONG");
      onResultChange?.(false, decision);
      setAnnouncement("Spójrz na zapas albo lukę między sumą krótszych boków a najdłuższym.");
      return;
    }
    if (!evidenceConfirmed) {
      setDiagnosticCode("TRIANGLE_INEQUALITY_EVIDENCE_MISSING");
      onResultChange?.(false, `${decision}; brak uzasadnienia`);
      setAnnouncement("Decyzja jest poprawna. Dodaj jeszcze zapis porównania długości.");
      return;
    }
    if (analysis.possible && (task.activity === "construction-steps" || task.activity === "independent") && step < 4) {
      setDiagnosticCode("TRIANGLE_CONSTRUCTION_ORDER");
      onResultChange?.(null);
      setAnnouncement("Warunek jest spełniony. Dokończ jeszcze konstrukcję linijką i cyrklem.");
      return;
    }
    setDiagnosticCode(null);
    onResultChange?.(true, `${decision}; ${shortA} + ${shortB} ${relationSymbol} ${longest}`);
    setAnnouncement(analysis.possible ? "Poprawnie: odcinki zamykają się, a dwa okręgi mają dwa punkty przecięcia." : "Poprawnie: model pokazuje brak domknięcia, więc trójkąta nie można skonstruować.");
  };

  const tableRows = [
    { element: "Dwa krótsze", value: `${shortA} cm + ${shortB} cm = ${analysis.shortSum} cm`, property: "układane końcami do siebie" },
    { element: "Najdłuższy", value: `${longest} cm`, property: "bok porównywany" },
    { element: "Domknięcie", value: analysis.relation === "greater" ? `zapas ${analysis.closureDifference} cm` : analysis.relation === "equal" ? "tylko jeden punkt — odcinek prosty" : `luka ${analysis.closureDifference} cm`, property: analysis.possible ? "możliwy trójkąt" : "brak trójkąta" },
  ];

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""} ${task.activity === "bridge" ? styles.bridgeSlide : ""}`} data-triangle-construction-lab data-activity={task.activity} data-compact-buttons={task.activity === "bridge" ? "true" : undefined}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Konstrukcja trójkąta · boki {sides.join(" · ")} cm</p>
          <h2>{task.activity === "bridge" ? "Most linowy" : task.activity === "inequality" || task.activity === "close-segments" ? "Czy odcinki się zamkną?" : "Dwa okręgi możliwości"}</h2>
          <p>{task.prompt}</p>
        </div>
        <div className={styles.compass} aria-hidden="true"><span>◯</span><small>linijka + cyrkiel</small></div>
      </header>

      <div className={`${styles.workspace} ${task.activity === "bridge" ? styles.bridgeWorkspace : ""}`} data-layout={task.activity === "bridge" ? "triangle-above-controls" : "side-by-side"}>
        <div className={styles.canvas} data-bridge-triangle={task.activity === "bridge" ? "true" : undefined}>
          <AccessibleMathSvg title="Konstrukcja trójkąta o danych bokach" description="Model pokazuje porównanie odcinków oraz kolejne kroki konstrukcji przy użyciu dwóch okręgów." viewBox="0 0 640 430" className={styles.svg} columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }, { key: "property", label: "Znaczenie" }]} rows={tableRows}>
            <rect width="640" height="430" rx="18" fill={highContrast ? "#fff" : "#f8fafc"} />
            {!highContrast && task.activity === "bridge" ? <g aria-hidden="true" opacity=".34"><path d="M0 365 L105 270 L185 365 Z M455 365 L535 255 L640 365 Z" fill="#a7f3d0" /><path d="M0 365 H640" stroke="#0f766e" strokeWidth="7" /><path d="M70 325 Q320 135 570 325" fill="none" stroke="#475569" strokeWidth="5" /></g> : null}
            {step === 0 ? <g data-segment-comparison>
              <text x="90" y="88" fill="#334155" fontSize="16" fontWeight="800">Dwa krótsze: {shortA} cm + {shortB} cm</text>
              <line x1={layoutStart} y1="125" x2={layoutStart + shortA * scale} y2="125" stroke="#2563eb" strokeWidth="16" strokeLinecap="round" />
              <line x1={layoutStart + shortA * scale} y1="125" x2={shortEnd} y2="125" stroke="#7c3aed" strokeWidth="16" strokeLinecap="round" />
              <circle cx={layoutStart + shortA * scale} cy="125" r="6" fill="#fff" stroke="#172554" strokeWidth="3" />
              <text x="90" y="235" fill="#334155" fontSize="16" fontWeight="800">Najdłuższy: {longest} cm</text>
              <line x1={layoutStart} y1="272" x2={longestEnd} y2="272" stroke="#0f766e" strokeWidth="16" strokeLinecap="round" />
              <line x1={Math.min(shortEnd, longestEnd)} y1="180" x2={Math.max(shortEnd, longestEnd)} y2="180" stroke="#c2410c" strokeWidth="3" />
              <line x1={shortEnd} y1="166" x2={shortEnd} y2="194" stroke="#c2410c" strokeWidth="3" />
              <line x1={longestEnd} y1="166" x2={longestEnd} y2="194" stroke="#c2410c" strokeWidth="3" />
              <text x={(shortEnd + longestEnd) / 2} y="163" textAnchor="middle" fill="#9a3412" fontSize="15" fontWeight="900">{analysis.relation === "greater" ? "zapas" : analysis.relation === "equal" ? "styk" : "luka"} {analysis.closureDifference} cm</text>
              <text x="320" y="350" textAnchor="middle" fill="#172554" fontSize="25" fontWeight="900">{shortA} + {shortB} {relationSymbol} {longest}</text>
            </g> : <g data-compass-construction>
              <line x1={vertices.a.x} y1={vertices.a.y} x2={vertices.b.x} y2={vertices.b.y} stroke="#172554" strokeWidth="5" strokeLinecap="round" />
              <text x={(vertices.a.x + vertices.b.x) / 2} y={vertices.a.y + 28} textAnchor="middle" fill="#172554" fontSize="15" fontWeight="900">AB = {sides[0]} cm</text>
              {step >= 2 ? <circle cx={vertices.a.x} cy={vertices.a.y} r={sides[2] * scale} fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="7 6" data-arc-a /> : null}
              {step >= 3 ? <circle cx={vertices.b.x} cy={vertices.b.y} r={sides[1] * scale} fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray="3 6" data-arc-b /> : null}
              {step >= 3 && vertices.upper ? <><circle cx={vertices.upper.x} cy={vertices.upper.y} r="8" fill="#ea580c" /><text x={vertices.upper.x + 15} y={vertices.upper.y - 12} fill="#9a3412" fontSize="17" fontWeight="900">C</text></> : null}
              {step >= 3 && vertices.lower ? <circle cx={vertices.lower.x} cy={vertices.lower.y} r="6" fill="#ea580c" opacity=".7" data-second-intersection /> : null}
              {step >= 4 && vertices.upper ? <><line x1={vertices.a.x} y1={vertices.a.y} x2={vertices.upper.x} y2={vertices.upper.y} stroke="#2563eb" strokeWidth="5" /><line x1={vertices.b.x} y1={vertices.b.y} x2={vertices.upper.x} y2={vertices.upper.y} stroke="#7c3aed" strokeWidth="5" /></> : null}
              {!analysis.possible && step >= 3 ? <g data-no-intersection><text x="320" y="105" textAnchor="middle" fill="#9a3412" fontSize="19" fontWeight="900">Okręgi nie wyznaczają trzeciego wierzchołka</text><text x="320" y="132" textAnchor="middle" fill="#9a3412" fontSize="15">Dwa krótsze boki nie przechodzą poza najdłuższy.</text></g> : null}
              <text x={vertices.a.x - 18} y={vertices.a.y + 7} fill="#172554" fontSize="18" fontWeight="900">A</text>
              <text x={vertices.b.x + 12} y={vertices.b.y + 7} fill="#172554" fontSize="18" fontWeight="900">B</text>
            </g>}
          </AccessibleMathSvg>
          <p className={styles.live} role="status" aria-live="polite">{announcement}</p>
        </div>

        <aside className={styles.panel} data-bridge-controls={task.activity === "bridge" ? "true" : undefined}>
          <div className={styles.steps}>
            <h3>Konstrukcja krok po kroku</h3>
            <button type="button" aria-pressed={step === 0} disabled={locked} onClick={() => { setStep(0); setDiagnosticCode(null); setAnnouncement("Dwa krótsze odcinki ułożono nad najdłuższym."); }}>Ułóż odcinki na prostej</button>
            <button type="button" aria-pressed={step === 1} disabled={locked} onClick={() => { setStep(1); setDiagnosticCode(null); setAnnouncement("Narysowano podstawę AB."); }}>Narysuj podstawę AB</button>
            <button type="button" aria-pressed={step === 2} disabled={locked || step !== 1} onClick={() => advance(1, 2, "Zakreślono łuk o środku A i promieniu AC.")}>Zakreśl łuk z A</button>
            <button type="button" aria-pressed={step === 3} disabled={locked || step !== 2} onClick={() => advance(2, 3, analysis.possible ? "Drugi łuk przeciął pierwszy w dwóch punktach." : "Łuki nie wyznaczyły trzeciego wierzchołka.")}>Zakreśl łuk z B</button>
            <button type="button" aria-pressed={step === 4} disabled={locked || step !== 3 || !analysis.possible} onClick={() => advance(3, 4, "Połączono C z A i B. Konstrukcja jest gotowa.")}>Połącz A–C i B–C</button>
          </div>

          <div className={styles.decision}>
            <h3>Czy można zbudować trójkąt?</h3>
            <div><button type="button" aria-pressed={decision === "possible"} disabled={locked} onClick={() => { setDecision("possible"); setDiagnosticCode(null); onResultChange?.(null); }}>Można</button><button type="button" aria-pressed={decision === "impossible"} disabled={locked} onClick={() => { setDecision("impossible"); setDiagnosticCode(null); onResultChange?.(null); }}>Nie można</button></div>
            <label><input type="checkbox" checked={evidenceConfirmed} disabled={locked} onChange={(event) => { setEvidenceConfirmed(event.target.checked); onResultChange?.(null); }} /> Zapisałem porównanie dwóch krótszych boków z najdłuższym.</label>
            <button type="button" className={styles.check} disabled={locked} onClick={check}>Sprawdź decyzję i dowód</button>
          </div>

          <div className={styles.counter} aria-live="polite">
            <span>Dwa krótsze</span><strong>{shortA} + {shortB} = {analysis.shortSum} cm</strong>
            <span>Najdłuższy</span><strong>{longest} cm</strong>
            <p data-relation={analysis.relation}>{analysis.relation === "greater" ? `Zapas ${analysis.closureDifference} cm` : analysis.relation === "equal" ? "Odcinki tylko się stykają" : `Brakuje ${analysis.closureDifference} cm`}</p>
          </div>
        </aside>
      </div>

      <InteractionAlternativePanel title="Zmień długości bez przeciągania" instruction="Każda zmiana natychmiast aktualizuje odcinki, okręgi, punkty przecięcia i licznik domknięcia.">
        {sides.map((value, index) => <label key={index}>Bok {index + 1}: {value} cm<input aria-label={`Długość boku ${index + 1}`} type="range" min="1" max="9" step="0.5" value={value} disabled={locked} onChange={(event) => updateSide(index, Number(event.target.value))} /></label>)}
        <button type="button" disabled={locked} onClick={() => { const next = [...task.sideLengths] as [number, number, number]; setSides(next); setStep(task.activity === "close-segments" || task.activity === "inequality" ? 0 : 1); setDecision(null); setEvidenceConfirmed(false); setDiagnosticCode(null); publish(next); setAnnouncement("Przywrócono długości z zadania."); }}>Przywróć dane zadania</button>
      </InteractionAlternativePanel>

      {feedback ? mode === "assessment"
        ? assessmentSubmitted
          ? <DiagnosticFeedbackPanel {...feedback} mode="assessment" submitted />
          : <DiagnosticFeedbackPanel result={feedback.result} copy={feedback.copy} highlights={feedback.highlights} mode="assessment" submitted={false} />
        : <DiagnosticFeedbackPanel {...feedback} mode="practice" submitted solution={feedback.solution} />
        : null}
    </section>
  );
}

export function TriangleConstructionGeometryLab(props: TriangleConstructionGeometryLabProps) {
  const activity = createPublicTriangleConstructionTask(props.seed).activity;
  const locked = props.readOnly || props.assessmentSubmitted;
  if (activity === "feasibility-series") {
    return <TriangleFeasibilitySeries readOnly={locked} highContrast={props.highContrast} onResultChange={props.onResultChange} />;
  }
  if (activity === "visual-construction") {
    return <TriangleConstructionVisual readOnly={locked} highContrast={props.highContrast} onResultChange={props.onResultChange} />;
  }
  return <TriangleConstructionLegacyLab {...props} />;
}
