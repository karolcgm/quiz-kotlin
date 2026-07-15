import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { GeometryScene } from "@/components/lessons/geometry/GeometryScene";
import { analyzeGeometryPolygon, pointById } from "@/lib/math/geometry";
import type { GeometryLabState, GeometryPrintSnapshot } from "@/types/geometry";
import styles from "@/components/lessons/geometry/geometry.module.css";

export function GeometryPrintModel({
  snapshot,
  state,
  title,
  description,
}: {
  snapshot?: GeometryPrintSnapshot;
  state?: GeometryLabState;
  title?: string;
  description?: string;
}) {
  const printableState = snapshot?.state ?? state;
  if (!printableState) throw new Error("Wersja drukowa wymaga stanu albo migawki geometrii.");
  const analysis = analyzeGeometryPolygon(printableState);
  const resolvedTitle = snapshot?.title ?? title ?? "Model geometryczny do druku";
  const resolvedDescription = snapshot?.description ?? description
    ?? `${analysis.primaryClassification}; ${analysis.vertexCount} wierzchołki.`;

  return (
    <section className={`${styles.printModel} break-inside-avoid`} data-geometry-print>
      <AccessibleMathSvg
        title={resolvedTitle}
        description={resolvedDescription}
        viewBox={`0 0 ${printableState.viewport.width} ${printableState.viewport.height}`}
        className="h-auto w-full"
        columns={[
          { key: "point", label: "Punkt" },
          { key: "x", label: "Współrzędna x" },
          { key: "y", label: "Współrzędna y" },
        ]}
        rows={printableState.polygon.vertexIds.map((pointId) => {
          const point = pointById(printableState.points, pointId);
          return { point: point?.label ?? "?", x: point?.x ?? "—", y: point?.y ?? "—" };
        })}
      >
        <GeometryScene state={printableState} showHandles={false} highContrast />
      </AccessibleMathSvg>
      <p className="mt-2 text-center text-xs font-bold text-slate-700">
        Klasyfikacja: {analysis.primaryClassification}. Orientacja: {analysis.orientation === "clockwise" ? "zgodna z ruchem wskazówek zegara" : analysis.orientation === "counterclockwise" ? "przeciwna do ruchu wskazówek zegara" : "figura zdegenerowana"}.
      </p>
    </section>
  );
}
