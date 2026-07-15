import { useId, type ReactNode } from "react";

export interface AccessibleMathDataColumn {
  key: string;
  label: string;
}

export function AccessibleMathSvg({
  title,
  description,
  viewBox,
  columns,
  rows,
  children,
  className = "",
}: {
  title: string;
  description: string;
  viewBox: string;
  columns: AccessibleMathDataColumn[];
  rows: Array<Record<string, string | number>>;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <figure className="accessible-math-figure">
      <svg
        viewBox={viewBox}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        className={className}
      >
        <title id={titleId}>{title}</title>
        <desc id={descriptionId}>{description}</desc>
        {children}
      </svg>
      <details className="mt-2 text-sm">
        <summary className="min-h-11 cursor-pointer py-2 font-bold">Dane tekstowe modelu</summary>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{title} — bieżące wartości</caption>
            <thead>
              <tr>{columns.map((column) => <th key={column.key} scope="col" className="border p-2">{column.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => <td key={column.key} className="border p-2">{row[column.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
