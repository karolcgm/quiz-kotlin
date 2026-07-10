import type { M514QuestionInstance } from "@/data/lessons/m5-1-4-instances";

interface PrintKeySheetProps {
  title: string;
  version?: string;
  items: M514QuestionInstance[];
  startIndex?: number;
}

export function PrintKeySheet({ title, version, items, startIndex = 0 }: PrintKeySheetProps) {
  return (
    <div className="print-key-sheet space-y-4 text-black">
      <header className="border-b border-slate-400 pb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Tylko dla nauczyciela</p>
        <h2 className="text-lg font-bold">{title} — klucz</h2>
        {version ? <p className="font-mono text-xs text-slate-500">Wersja {version}</p> : null}
      </header>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-400 text-left text-xs uppercase tracking-wide">
            <th className="py-2 pr-4">Nr</th>
            <th className="py-2 pr-4">Wyrażenie</th>
            <th className="py-2 pr-4">Pierwszy krok</th>
            <th className="py-2">Wynik</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="border-b border-slate-200">
              <td className="py-2 pr-4 tabular-nums">{startIndex + index + 1}</td>
              <td className="py-2 pr-4 font-mono font-semibold">{item.expression}</td>
              <td className="py-2 pr-4">{item.firstStepLabel}</td>
              <td className="py-2 tabular-nums">{item.finalValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
