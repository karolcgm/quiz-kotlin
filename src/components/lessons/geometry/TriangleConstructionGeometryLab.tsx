"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
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

export function TriangleConstructionGeometryLab({ seed, mode = "practice", readOnly = false, highContrast = false, assessmentSubmitted = false, onStateChange, onResultChange }: TriangleConstructionGeometryLabProps) {
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
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-construction-lab data-activity={task.activity}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Konstrukcja trójkąta · boki {sides.join(" · ")} cm</p>
          <h2>{task.activity === "bridge" ? "Most linowy" : task.activity === "inequality" || task.activity === "close-segments" ? "Czy odcinki się zamkną?" : "Dwa okręgi możliwości"}</h2>
          <p>{task.prompt}</p>
        </div>
        <div className={styles.compass} aria-hidden="true"><span>◯</span><small>linijka + cyrkiel</small></div>
      </header>

      <div className={styles.workspace}>
        <div className={styles.canvas}>
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

        <aside className={styles.panel}>
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
