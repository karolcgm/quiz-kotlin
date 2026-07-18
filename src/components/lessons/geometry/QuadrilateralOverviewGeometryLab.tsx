"use client";

import styles from "@/components/lessons/geometry/quadrilateralOverview.module.css";

interface Props {
  seed: number;
}

type FigureKind = "general" | "trapezoid" | "isosceles-trapezoid" | "right-trapezoid" | "parallelogram" | "rectangle" | "rhombus" | "square";

const FIGURES: ReadonlyArray<{ kind: FigureKind; name: string; description: string }> = [
  { kind: "general", name: "Czworokąt", description: "Ma 4 boki, 4 wierzchołki i 4 kąty." },
  { kind: "trapezoid", name: "Trapez", description: "Ma parę boków równoległych. Są to jego podstawy." },
  { kind: "isosceles-trapezoid", name: "Trapez równoramienny", description: "Ma ramiona tej samej długości i równe kąty przy każdej podstawie." },
  { kind: "right-trapezoid", name: "Trapez prostokątny", description: "Ma dwa kąty proste." },
  { kind: "parallelogram", name: "Równoległobok", description: "Ma dwie pary boków równoległych." },
  { kind: "rectangle", name: "Prostokąt", description: "Ma cztery kąty proste." },
  { kind: "rhombus", name: "Romb", description: "Ma cztery boki tej samej długości." },
  { kind: "square", name: "Kwadrat", description: "Ma cztery równe boki i cztery kąty proste." },
];

const PROPERTIES = [
  { name: "Trapez", sides: "Ma parę boków równoległych — podstawy.", angles: "Kąty przy tym samym ramieniu mają razem 180°.", diagonals: "W trapezie równoramiennym przekątne są równe." },
  { name: "Równoległobok", sides: "Przeciwległe boki są równoległe i równe.", angles: "Przeciwległe kąty są równe, a sąsiednie mają razem 180°.", diagonals: "Przekątne przecinają się w połowie." },
  { name: "Prostokąt", sides: "Przeciwległe boki są równoległe i równe.", angles: "Wszystkie kąty są proste.", diagonals: "Przekątne są równe i przecinają się w połowie." },
  { name: "Romb", sides: "Wszystkie boki są równe. Przeciwległe boki są równoległe.", angles: "Przeciwległe kąty są równe.", diagonals: "Przekątne są prostopadłe i przecinają się w połowie." },
  { name: "Kwadrat", sides: "Wszystkie boki są równe. Przeciwległe boki są równoległe.", angles: "Wszystkie kąty są proste.", diagonals: "Przekątne są równe, prostopadłe i przecinają się w połowie." },
] as const;

function RightAngle({ x, y, directionX = 1, directionY = -1 }: { x: number; y: number; directionX?: 1 | -1; directionY?: 1 | -1 }) {
  return <g className={styles.rightAngle}>
    <path d={`M ${x + 25 * directionX} ${y} A 25 25 0 0 ${directionX === directionY ? 1 : 0} ${x} ${y + 25 * directionY}`} />
    <circle cx={x + 12 * directionX} cy={y + 12 * directionY} r="3.5" />
  </g>;
}

function FigureIcon({ kind, label }: { kind: FigureKind; label: string }) {
  return <svg viewBox="0 0 300 190" className={styles.figure} role="img" aria-label={label}>
    <rect className={styles.canvas} x="2" y="2" width="296" height="186" rx="18" />
    {kind === "general" ? <polygon className={styles.shape} points="55,145 75,48 225,38 255,150" /> : null}
    {kind === "trapezoid" ? <polygon className={styles.shape} points="48,150 92,48 218,48 260,150" /> : null}
    {kind === "isosceles-trapezoid" ? <polygon className={styles.warmShape} points="45,150 95,48 205,48 255,150" /> : null}
    {kind === "right-trapezoid" ? <><polygon className={styles.greenShape} points="62,150 62,48 215,48 258,150" /><RightAngle x={62} y={150} /><RightAngle x={62} y={48} directionY={1} /></> : null}
    {kind === "parallelogram" ? <polygon className={styles.shape} points="42,150 92,45 258,45 208,150" /> : null}
    {kind === "rectangle" ? <><rect className={styles.shape} x="48" y="45" width="204" height="108" rx="2" /><RightAngle x={48} y={153} /><RightAngle x={48} y={45} directionY={1} /><RightAngle x={252} y={153} directionX={-1} /><RightAngle x={252} y={45} directionX={-1} directionY={1} /></> : null}
    {kind === "rhombus" ? <polygon className={styles.warmShape} points="150,22 255,95 150,168 45,95" /> : null}
    {kind === "square" ? <><rect className={styles.greenShape} x="70" y="25" width="160" height="140" rx="2" /><RightAngle x={70} y={165} /><RightAngle x={70} y={25} directionY={1} /><RightAngle x={230} y={165} directionX={-1} /><RightAngle x={230} y={25} directionX={-1} directionY={1} /></> : null}
  </svg>;
}

function FamilyMap() {
  return <div className={styles.familyMap} data-quadrilateral-family-map>
    <div className={`${styles.familyNode} ${styles.rootNode}`}>CZWOROKĄTY<span>4 boki · 4 wierzchołki · 4 kąty</span></div>
    <div className={styles.connector} aria-hidden="true" />
    <div className={`${styles.familyNode} ${styles.trapezoidNode}`}>TRAPEZY<span>mają parę boków równoległych</span></div>
    <div className={styles.connector} aria-hidden="true" />
    <div className={`${styles.familyNode} ${styles.parallelogramNode}`}>RÓWNOLEGŁOBOKI<span>mają dwie pary boków równoległych</span></div>
    <div className={styles.split} aria-hidden="true"><i /><i /></div>
    <div className={styles.twoBranches}>
      <div className={`${styles.familyNode} ${styles.rectangleNode}`}>PROSTOKĄTY<span>mają 4 kąty proste</span></div>
      <div className={`${styles.familyNode} ${styles.rhombusNode}`}>ROMBY<span>mają 4 równe boki</span></div>
    </div>
    <div className={styles.join} aria-hidden="true"><i /><i /></div>
    <div className={`${styles.familyNode} ${styles.squareNode}`}>KWADRATY<span>są jednocześnie prostokątami i rombami</span></div>
  </div>;
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className={styles.header}><p>Dział 4 · Figury na płaszczyźnie</p><h2>{title}</h2><span>{subtitle}</span></header>;
}

export function QuadrilateralOverviewGeometryLab({ seed }: Props) {
  const view = Math.abs(Math.trunc(seed)) % 100;

  if (view === 1) return <section className={styles.lab} data-quadrilateral-overview data-view="family">
    <Header title="Mapa czworokątów" subtitle="Nazwy figur tworzą rodziny. Figura może należeć do kilku rodzin jednocześnie." />
    <FamilyMap />
    <p className={styles.important}>Każdy kwadrat jest prostokątem i rombem. Każdy prostokąt i każdy romb są równoległobokami.</p>
  </section>;

  if (view === 2) return <section className={styles.lab} data-quadrilateral-overview data-view="gallery">
    <Header title="Jak wyglądają czworokąty?" subtitle="Rozpoznawaj figurę po jej bokach, kątach i równoległości — nie po ustawieniu rysunku." />
    <div className={styles.gallery}>{FIGURES.map((figure) => <article className={styles.figureCard} key={figure.kind} data-figure={figure.kind}>
      <FigureIcon kind={figure.kind} label={figure.name} />
      <h3>{figure.name}</h3><p>{figure.description}</p>
    </article>)}</div>
  </section>;

  return <section className={styles.lab} data-quadrilateral-overview data-view="properties">
    <Header title="Własności potrzebne do rozpoznawania" subtitle="Najpierw sprawdź boki i kąty. Przekątne pozwalają rozróżnić figury o podobnym wyglądzie." />
    <div className={styles.propertyGrid}>{PROPERTIES.map((item) => <article className={styles.propertyCard} key={item.name} data-property-card>
      <h3>{item.name}</h3>
      <dl><div><dt>Boki</dt><dd>{item.sides}</dd></div><div><dt>Kąty</dt><dd>{item.angles}</dd></div><div><dt>Przekątne</dt><dd>{item.diagonals}</dd></div></dl>
    </article>)}</div>
    <p className={styles.important}>Czworokąt ma zawsze tyle samo boków, wierzchołków i kątów: po 4.</p>
  </section>;
}
