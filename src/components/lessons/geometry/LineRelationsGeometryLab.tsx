"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import {
  commitGeometryHistory,
  createGeometryDiagnosticResult,
  createGeometryHistory,
  redoGeometryHistory,
  resetGeometryHistory,
  undoGeometryHistory,
} from "@/lib/math/geometry";
import {
  LINE_RELATION_LABELS,
  LINE_RELATION_LESSON_SEEDS,
  classifyLineRelation,
  configureLineRelationPreset,
  createLineRelationGeometryState,
  getLineRelationSeedConfig,
  lineDirectionDegrees,
  movableLineCenter,
  rotateMovableLine,
  setMovableLinePosition,
  translateMovableLine,
} from "@/lib/math/geometry/lineRelations";
import type {
  LineRelationDifficulty,
  LineRelationKind,
  LineRelationOrientation,
} from "@/lib/math/geometry/lineRelations";
import { GEOMETRY_FEEDBACK_CODES } from "@/types/geometry";
import type {
  GeometryHistoryState,
  GeometryLabMode,
  GeometryLabState,
  GeometryPointCoordinates,
} from "@/types/geometry";
import styles from "@/components/lessons/geometry/lineRelations.module.css";

const MODE_LABELS: Record<GeometryLabMode, string> = {
  demo: "Pokaz",
  guided: "Praca prowadzona",
  practice: "Ćwiczenie",
  assessment: "Ocenianie",
};

const DIFFICULTY_LABELS: Record<LineRelationDifficulty, string> = {
  support: "Przykład 1",
  core: "Przykład 2",
  challenge: "Przykład 3",
};

const ORIENTATION_LABELS: Record<LineRelationOrientation, string> = {
  horizontal: "Poziome",
  vertical: "Pionowe",
  diagonal: "Ukośne",
};

function pointFromPointer(
  event: PointerEvent<SVGElement>,
  state: GeometryLabState,
): GeometryPointCoordinates | null {
  const svg = event.currentTarget.ownerSVGElement;
  const bounds = svg?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
  return {
    x: (event.clientX - bounds.left) / bounds.width * state.viewport.width,
    y: (event.clientY - bounds.top) / bounds.height * state.viewport.height,
  };
}

function displayEndpoints(state: GeometryLabState, objectId: "line-a" | "line-b") {
  const object = state.objects.find((candidate) => candidate.id === objectId)!;
  const start = state.points.find((point) => point.id === object.startPointId)!;
  const end = state.points.find((point) => point.id === object.endPointId)!;
  const length = Math.hypot(end.x - start.x, end.y - start.y) || 1;
  const reach = 900;
  const unit = { x: (end.x - start.x) / length, y: (end.y - start.y) / length };
  return {
    start,
    end,
    center: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
    extendedStart: { x: start.x - unit.x * reach, y: start.y - unit.y * reach },
    extendedEnd: { x: end.x + unit.x * reach, y: end.y + unit.y * reach },
    unit,
  };
}

function clampCenter(state: GeometryLabState, point: GeometryPointCoordinates): GeometryPointCoordinates {
  return {
    x: Math.max(155, Math.min(state.viewport.width - 155, point.x)),
    y: Math.max(135, Math.min(state.viewport.height - 135, point.y)),
  };
}

function orientationFromState(state: GeometryLabState): LineRelationOrientation {
  const angle = lineDirectionDegrees(state, "line-a");
  if (Math.abs(angle - 90) <= 1) return "vertical";
  if (angle <= 1 || angle >= 179) return "horizontal";
  return "diagonal";
}

function rightAnglePath(state: GeometryLabState): string | null {
  const analysis = classifyLineRelation(state);
  if (analysis.kind !== "perpendicular" || !analysis.intersection) return null;
  const first = displayEndpoints(state, "line-a");
  const second = displayEndpoints(state, "line-b");
  const size = 17;
  const point = analysis.intersection.point;
  const firstCorner = { x: point.x + first.unit.x * size, y: point.y + first.unit.y * size };
  const opposite = {
    x: firstCorner.x + second.unit.x * size,
    y: firstCorner.y + second.unit.y * size,
  };
  const secondCorner = { x: point.x + second.unit.x * size, y: point.y + second.unit.y * size };
  return `M ${point.x} ${point.y} L ${firstCorner.x} ${firstCorner.y} L ${opposite.x} ${opposite.y} L ${secondCorner.x} ${secondCorner.y} Z`;
}

export interface LineRelationsGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
}

function SimpleLineRelationsLesson({
  mode,
  highContrast,
}: Pick<LineRelationsGeometryLabProps, "mode" | "highContrast">) {
  const lineColor = highContrast ? "#000" : "#1e3a8a";
  const accentColor = highContrast ? "#000" : "#be123c";

  return (
    <section
      className={`${styles.lab} ${styles.simpleLab} ${highContrast ? styles.highContrast : ""}`}
      data-geometry-lab
      data-line-relations-lab
      data-simple-line-relations
      data-mode={mode}
      data-difficulty="support"
    >
      <header className={styles.simpleHeader}>
        <p className={styles.eyebrow}>Dwa przypadki</p>
        <h2 className={styles.title}>Proste równoległe i prostopadłe</h2>
        <p className={styles.description}>Sprawdź, czy proste się przecinają.</p>
      </header>

      <div className={styles.simpleExamples}>
        <article className={styles.simpleCard}>
          <svg className={styles.simpleDiagram} viewBox="0 0 420 220" role="img" aria-label="Proste a i b są równoległe">
            <line x1="52" y1="72" x2="368" y2="72" stroke={lineColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="52" y1="154" x2="368" y2="154" stroke={lineColor} strokeWidth="5" strokeLinecap="round" />
            <text x="378" y="80" className={styles.simpleLineLabel}>a</text>
            <text x="378" y="162" className={styles.simpleLineLabel}>b</text>
          </svg>
          <h3>Proste równoległe</h3>
          <strong className={styles.simpleNotation}>a ∥ b</strong>
          <p>Nie przecinają się.</p>
        </article>

        <article className={styles.simpleCard}>
          <svg className={styles.simpleDiagram} viewBox="0 0 420 220" role="img" aria-label="Proste a i b są prostopadłe">
            <line x1="48" y1="110" x2="372" y2="110" stroke={lineColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="210" y1="28" x2="210" y2="192" stroke={lineColor} strokeWidth="5" strokeLinecap="round" />
            <path d="M 210 145 A 35 35 0 0 1 175 110" fill="none" stroke={accentColor} strokeWidth="4" />
            <circle cx="185" cy="135" r="5" fill={accentColor} />
            <text x="380" y="118" className={styles.simpleLineLabel}>a</text>
            <text x="222" y="36" className={styles.simpleLineLabel}>b</text>
          </svg>
          <h3>Proste prostopadłe</h3>
          <strong className={styles.simpleNotation}>a ⟂ b</strong>
          <p>Przecinają się pod kątem prostym.</p>
        </article>
      </div>

      <p className={styles.simpleRule}>
        <strong>Zapamiętaj:</strong> proste oznaczamy małymi literami, np. <strong>a</strong> i <strong>b</strong>.
      </p>
    </section>
  );
}

export function LineRelationsGeometryLab({
  seed,
  mode = "practice",
  readOnly = false,
  highContrast = false,
  assessmentSubmitted = false,
  onStateChange,
}: LineRelationsGeometryLabProps) {
  const seedConfig = getLineRelationSeedConfig(seed);
  const [history, setHistory] = useState<GeometryHistoryState>(() => (
    createGeometryHistory(createLineRelationGeometryState(seed, mode))
  ));
  const state = history.present;
  const analysis = useMemo(() => classifyLineRelation(state), [state]);
  const relation = LINE_RELATION_LABELS[analysis.kind];
  const locked = readOnly || (mode === "assessment" && assessmentSubmitted);
  const [difficulty, setDifficulty] = useState<LineRelationDifficulty>(seedConfig.difficulty);
  const [orientation, setOrientation] = useState<LineRelationOrientation>(seedConfig.orientation);
  const [answer, setAnswer] = useState<LineRelationKind | null>(null);
  const [announcement, setAnnouncement] = useState(`Model gotowy. ${relation.notation}: ${relation.label}.`);
  const center = movableLineCenter(state);
  const angle = lineDirectionDegrees(state, "line-b");
  const [draft, setDraft] = useState(() => ({ x: String(Math.round(center.x)), y: String(Math.round(center.y)), angle: String(Math.round(angle)) }));
  const dragKind = useRef<"translate" | "rotate" | null>(null);
  const dragStart = useRef<GeometryLabState | null>(null);
  const dragOffset = useRef<GeometryPointCoordinates>({ x: 0, y: 0 });

  const publish = (next: GeometryLabState) => {
    const nextCenter = movableLineCenter(next);
    setDraft({
      x: String(Math.round(nextCenter.x)),
      y: String(Math.round(nextCenter.y)),
      angle: String(Math.round(lineDirectionDegrees(next, "line-b"))),
    });
    onStateChange?.(next);
  };

  const commit = (next: GeometryLabState, message: string) => {
    const normalized = { ...next, mode };
    setHistory((current) => commitGeometryHistory(current, normalized));
    setAnswer(null);
    setAnnouncement(message);
    publish(normalized);
  };

  const changeHistory = (next: GeometryHistoryState, message: string) => {
    setHistory(next);
    setAnswer(null);
    setOrientation(orientationFromState(next.present));
    setAnnouncement(message);
    publish(next.present);
  };

  const chooseDifficulty = (nextDifficulty: LineRelationDifficulty) => {
    const nextSeed = LINE_RELATION_LESSON_SEEDS[nextDifficulty];
    const next = createLineRelationGeometryState(nextSeed, mode);
    setDifficulty(nextDifficulty);
    setOrientation(getLineRelationSeedConfig(nextSeed).orientation);
    commit(next, `Poziom ${DIFFICULTY_LABELS[nextDifficulty]}. Układ został ustawiony deterministycznie.`);
  };

  const chooseOrientation = (nextOrientation: LineRelationOrientation) => {
    const next = configureLineRelationPreset(state, nextOrientation, analysis.kind);
    setOrientation(nextOrientation);
    commit(next, `${ORIENTATION_LABELS[nextOrientation]} położenie. Relacja nie zależy od obrotu całego układu.`);
  };

  const choosePreset = (kind: LineRelationKind) => {
    const next = configureLineRelationPreset(state, orientation, kind);
    commit(next, `Przykład: ${LINE_RELATION_LABELS[kind].notation}, proste ${LINE_RELATION_LABELS[kind].label}.`);
  };

  const moveBy = (dx: number, dy: number) => {
    if (locked) return;
    const next = translateMovableLine(state, dx, dy);
    const nextRelation = classifyLineRelation(next);
    commit(next, `Przesunięto drogę b. Relacja: ${LINE_RELATION_LABELS[nextRelation.kind].label}.`);
  };

  const rotateBy = (delta: number) => {
    if (locked) return;
    const next = rotateMovableLine(state, angle + delta);
    const nextRelation = classifyLineRelation(next);
    commit(next, `Obrócono drogę b do ${Math.round(lineDirectionDegrees(next, "line-b"))}°. Relacja: ${LINE_RELATION_LABELS[nextRelation.kind].label}.`);
  };

  const handleLineKeyDown = (event: KeyboardEvent<SVGLineElement>) => {
    const step = event.shiftKey ? 5 : 1;
    const movement: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const offset = movement[event.key];
    if (!offset) return;
    event.preventDefault();
    moveBy(offset[0], offset[1]);
  };

  const handleRotationKeyDown = (event: KeyboardEvent<SVGCircleElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    rotateBy(event.key === "ArrowRight" || event.key === "ArrowUp" ? step : -step);
  };

  const startDrag = (kind: "translate" | "rotate", event: PointerEvent<SVGElement>) => {
    if (locked) return;
    const point = pointFromPointer(event, state);
    if (!point) return;
    dragKind.current = kind;
    dragStart.current = state;
    const currentCenter = movableLineCenter(state);
    dragOffset.current = { x: currentCenter.x - point.x, y: currentCenter.y - point.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const continueDrag = (event: PointerEvent<SVGElement>) => {
    if (!dragKind.current || locked) return;
    const point = pointFromPointer(event, state);
    if (!point) return;
    let next: GeometryLabState;
    if (dragKind.current === "translate") {
      const nextCenter = clampCenter(state, {
        x: point.x + dragOffset.current.x,
        y: point.y + dragOffset.current.y,
      });
      next = setMovableLinePosition(state, nextCenter, lineDirectionDegrees(state, "line-b"));
    } else {
      const currentCenter = movableLineCenter(state);
      next = rotateMovableLine(state, Math.atan2(point.y - currentCenter.y, point.x - currentCenter.x) * 180 / Math.PI);
    }
    setHistory((current) => ({ ...current, present: next, future: [] }));
    setAnswer(null);
    publish(next);
    const nextRelation = classifyLineRelation(next);
    setAnnouncement(`Relacja aktualna: ${LINE_RELATION_LABELS[nextRelation.kind].notation}, ${LINE_RELATION_LABELS[nextRelation.kind].label}.`);
  };

  const finishDrag = (event: PointerEvent<SVGElement>) => {
    if (!dragKind.current) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const start = dragStart.current;
    setHistory((current) => start ? {
      ...current,
      past: [...current.past, start].slice(-100),
      future: [],
    } : current);
    dragKind.current = null;
    dragStart.current = null;
  };

  const applyDraft = () => {
    const x = Number(draft.x);
    const y = Number(draft.y);
    const nextAngle = Number(draft.angle);
    if (![x, y, nextAngle].every(Number.isFinite)) {
      setAnnouncement("Uzupełnij środek x, środek y i kąt liczbami.");
      return;
    }
    const next = setMovableLinePosition(state, clampCenter(state, { x, y }), nextAngle);
    const nextRelation = classifyLineRelation(next);
    commit(next, `Zastosowano położenie drogi b. ${LINE_RELATION_LABELS[nextRelation.kind].notation}: ${LINE_RELATION_LABELS[nextRelation.kind].label}.`);
  };

  const selectAnswer = (kind: LineRelationKind) => {
    setAnswer(kind);
    if (kind === analysis.kind) {
      setAnnouncement(`✓ Poprawnie: ${relation.notation}, proste są ${relation.label}.`);
    } else {
      setAnnouncement(`Sprawdź kierunki i punkt przecięcia. Wybrano: ${LINE_RELATION_LABELS[kind].label}.`);
    }
  };

  const wrongDiagnosticCode = answer && answer !== analysis.kind
    ? answer === "parallel"
      ? GEOMETRY_FEEDBACK_CODES.notParallel
      : answer === "perpendicular"
        ? GEOMETRY_FEEDBACK_CODES.notPerpendicular
        : null
    : null;
  const diagnostic = wrongDiagnosticCode
    ? createGeometryDiagnosticResult(wrongDiagnosticCode, { memberIds: ["line-a", "line-b"] })
    : null;

  if (seed === LINE_RELATION_LESSON_SEEDS.support) {
    return <SimpleLineRelationsLesson mode={mode} highContrast={highContrast} />;
  }

  const first = displayEndpoints(state, "line-a");
  const second = displayEndpoints(state, "line-b");
  const squarePath = rightAnglePath(state);
  const gridLines = Array.from({ length: Math.floor(state.viewport.width / 40) + 1 }, (_, index) => index * 40);
  const textRows = [
    { element: "Prosta a", value: `${lineDirectionDegrees(state, "line-a").toFixed(1)}°`, property: "niebieska • a" },
    { element: "Prosta b", value: `${lineDirectionDegrees(state, "line-b").toFixed(1)}°`, property: "fioletowa ◆ b" },
    { element: "Relacja", value: relation.notation, property: relation.label },
    { element: "Mniejszy kąt", value: `${analysis.angleDegrees.toFixed(1)}°`, property: analysis.kind === "perpendicular" ? "kąt prosty □" : "odczyt z kierunków" },
  ];

  return (
    <section
      className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`}
      data-geometry-lab
      data-line-relations-lab
      data-mode={mode}
      data-difficulty={difficulty}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>geometry-lab · {MODE_LABELS[mode]} · {DIFFICULTY_LABELS[difficulty]}</p>
          <h2 className={styles.title}>Miasto linii</h2>
          <p className={styles.description}>Przesuwaj i obracaj drogę b. Klasyfikacja, symbol relacji, kąt i tabela tekstowa aktualizują się z bieżących współrzędnych.</p>
        </div>
        <span className={styles.relationBadge} data-relation={analysis.kind} data-relation-symbol={relation.symbol}>
          <span aria-hidden>{relation.symbol}</span> {relation.notation} · {relation.label}
        </span>
      </header>

      <div className={`${styles.controls} ${styles.interactiveOnly}`} aria-label="Deterministyczne konfiguracje Miasta linii">
        <div className={styles.controlGroup}>
          <span className={styles.groupLabel}>Poziom</span>
          {(Object.keys(DIFFICULTY_LABELS) as LineRelationDifficulty[]).map((item) => (
            <button key={item} type="button" disabled={locked} aria-pressed={difficulty === item} onClick={() => chooseDifficulty(item)}>{DIFFICULTY_LABELS[item]}</button>
          ))}
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.groupLabel}>Nie ufaj położeniu</span>
          {(Object.keys(ORIENTATION_LABELS) as LineRelationOrientation[]).map((item) => (
            <button key={item} type="button" disabled={locked} aria-pressed={orientation === item} onClick={() => chooseOrientation(item)}>{ORIENTATION_LABELS[item]}</button>
          ))}
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.groupLabel}>Przykład relacji</span>
          {(Object.keys(LINE_RELATION_LABELS) as LineRelationKind[]).map((item) => (
            <button key={item} type="button" disabled={locked} onClick={() => choosePreset(item)}>{LINE_RELATION_LABELS[item].symbol} {LINE_RELATION_LABELS[item].label}</button>
          ))}
        </div>
      </div>

      <div className={`${styles.history} ${styles.interactiveOnly}`}>
        <button type="button" disabled={locked || history.past.length === 0} onClick={() => changeHistory(undoGeometryHistory(history), "Cofnięto zmianę.")}>↶ Cofnij</button>
        <button type="button" disabled={locked || history.future.length === 0} onClick={() => changeHistory(redoGeometryHistory(history), "Ponowiono zmianę.")}>↷ Ponów</button>
        <button type="button" disabled={locked} onClick={() => changeHistory(resetGeometryHistory(history), "Przywrócono konfigurację początkową.")}>Reset</button>
        <button type="button" disabled={locked} aria-label="Obróć w lewo o 1 stopień" onClick={() => rotateBy(-1)}>−1°</button>
        <button type="button" disabled={locked} aria-label="Obróć w prawo o 1 stopień" onClick={() => rotateBy(1)}>+1°</button>
      </div>

      <div className={styles.canvas}>
        <AccessibleMathSvg
          title="Miasto linii — proste a i b"
          description={`${relation.notation}. Proste są ${relation.label}. Mniejszy kąt ma ${analysis.angleDegrees.toFixed(1)} stopnia.`}
          viewBox={`0 0 ${state.viewport.width} ${state.viewport.height}`}
          className={styles.svg}
          columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }, { key: "property", label: "Własność" }]}
          rows={textRows}
        >
          <defs>
            <pattern id="line-city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={highContrast ? "#000" : "#cbd5e1"} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="640" height="420" fill={highContrast ? "#fff" : "#f8fafc"} />
          <rect width="640" height="420" fill="url(#line-city-grid)" opacity={highContrast ? .35 : .7} />
          {gridLines.map((value) => <circle key={value} cx={value} cy="24" r="2" fill="#64748b" opacity=".45" />)}
          <line x1={first.extendedStart.x} y1={first.extendedStart.y} x2={first.extendedEnd.x} y2={first.extendedEnd.y} stroke={highContrast ? "#000" : "#075985"} strokeWidth="12" strokeLinecap="round" data-line="a" />
          <line x1={second.extendedStart.x} y1={second.extendedStart.y} x2={second.extendedEnd.x} y2={second.extendedEnd.y} stroke={highContrast ? "#555" : "#7c3aed"} strokeWidth="9" strokeDasharray="20 9" strokeLinecap="round" data-line="b" />
          <text x={first.end.x + 15} y={first.end.y - 12} fill="#075985" fontSize="22" fontWeight="900">• a</text>
          <text x={second.end.x + 15} y={second.end.y + 24} fill="#6d28d9" fontSize="22" fontWeight="900">◆ b</text>
          {analysis.kind === "parallel" ? (
            <g data-parallel-markers fill="#0f766e" fontSize="25" fontWeight="900">
              <text x={first.center.x} y={first.center.y - 14} textAnchor="middle">≫ ∥</text>
              <text x={second.center.x} y={second.center.y - 14} textAnchor="middle">≫ ∥</text>
            </g>
          ) : null}
          {analysis.kind === "collinear" ? <text x="320" y="190" textAnchor="middle" fill="#334155" fontSize="26" fontWeight="900" data-collinear-marker>≡ współliniowe</text> : null}
          {analysis.kind === "intersecting" && analysis.intersection ? <text x={analysis.intersection.point.x + 18} y={analysis.intersection.point.y - 18} fill="#9a3412" fontSize="28" fontWeight="900" data-intersection-marker>×</text> : null}
          {squarePath ? <path d={squarePath} fill="none" stroke="#5b21b6" strokeWidth="4" data-right-angle-marker aria-label="Kwadrat kąta prostego" /> : null}
          {!locked ? (
            <>
              <line
                x1={second.extendedStart.x}
                y1={second.extendedStart.y}
                x2={second.extendedEnd.x}
                y2={second.extendedEnd.y}
                stroke="transparent"
                strokeWidth="52"
                role="button"
                tabIndex={0}
                aria-label={`Przesuń drogę b. Środek x ${Math.round(center.x)}, y ${Math.round(center.y)}`}
                data-line-drag-handle
                onKeyDown={handleLineKeyDown}
                onPointerDown={(event) => startDrag("translate", event)}
                onPointerMove={continueDrag}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                style={{ cursor: "grab", touchAction: "none" }}
              />
              <circle
                cx={second.end.x}
                cy={second.end.y}
                r="26"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="4"
                role="slider"
                tabIndex={0}
                aria-label="Obrót drogi b"
                aria-valuemin={0}
                aria-valuemax={179}
                aria-valuenow={Math.round(angle)}
                data-line-rotation-handle
                onKeyDown={handleRotationKeyDown}
                onPointerDown={(event) => startDrag("rotate", event)}
                onPointerMove={continueDrag}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                style={{ cursor: "crosshair", touchAction: "none" }}
              />
            </>
          ) : null}
        </AccessibleMathSvg>
      </div>

      <div className={styles.interactiveOnly}>
        <InteractionAlternativePanel
          title="Ustaw drogę bez przeciągania"
          instruction="Wpisz środek i kąt drogi b. Na uchwycie: strzałka obraca lub przesuwa o 1, Shift + strzałka o 5."
        >
          <div className={styles.alternative}>
            <label>Środek x <input type="number" inputMode="numeric" value={draft.x} disabled={locked} onChange={(event) => setDraft((current) => ({ ...current, x: event.target.value }))} /></label>
            <label>Środek y <input type="number" inputMode="numeric" value={draft.y} disabled={locked} onChange={(event) => setDraft((current) => ({ ...current, y: event.target.value }))} /></label>
            <label>Kąt prostej b <input type="number" inputMode="numeric" min="0" max="179" value={draft.angle} disabled={locked} onChange={(event) => setDraft((current) => ({ ...current, angle: event.target.value }))} /></label>
            <button type="button" disabled={locked} onClick={applyDraft}>Zastosuj położenie</button>
            <button type="button" disabled={locked} onClick={() => moveBy(-1, 0)}>← 1</button>
            <button type="button" disabled={locked} onClick={() => moveBy(1, 0)}>1 →</button>
            <button type="button" disabled={locked} onClick={() => moveBy(0, -1)}>↑ 1</button>
            <button type="button" disabled={locked} onClick={() => moveBy(0, 1)}>1 ↓</button>
          </div>
        </InteractionAlternativePanel>
      </div>

      <div className={`${styles.answerGrid} ${styles.interactiveOnly}`} aria-label="Samodzielne rozpoznawanie relacji">
        <strong>Moja odpowiedź:</strong>
        {(Object.keys(LINE_RELATION_LABELS) as LineRelationKind[]).map((kind) => (
          <button key={kind} type="button" aria-pressed={answer === kind} onClick={() => selectAnswer(kind)}>
            {LINE_RELATION_LABELS[kind].symbol} {LINE_RELATION_LABELS[kind].label}
          </button>
        ))}
      </div>

      <p className={`${styles.feedback} ${answer === analysis.kind ? styles.correct : ""}`} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {diagnostic ? (
        <div className={styles.interactiveOnly}>
          <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted solution={diagnostic.solution} />
        </div>
      ) : null}

      {answer && answer !== analysis.kind && !diagnostic ? (
        <p className={`${styles.feedback} ${styles.interactiveOnly}`}>△ Porównaj kierunki obu prostych i sprawdź, czy mają jeden punkt wspólny, żadnego, czy wszystkie.</p>
      ) : null}

      <p className={styles.printOnly}>Na wydruku: nazwij relację prostych a i b, wpisz właściwy symbol ∥ lub ⟂, a przy prostopadłości zaznacz kwadrat kąta prostego.</p>
    </section>
  );
}
