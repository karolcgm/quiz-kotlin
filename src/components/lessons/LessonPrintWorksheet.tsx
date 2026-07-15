import { AnswerSpace } from "@/components/print/AnswerSpace";
import type { M514QuestionInstance } from "@/data/lessons/m5-1-4-instances";
import type { M514PrintableResource } from "@/data/lessons/m5-1-4-printables";
import type { PrintWorksheetItem } from "@/types/lessonPackage";

interface LessonPrintWorksheetProps {
  title: string;
  subtitle?: string;
  instructions: string;
  items: PrintWorksheetItem[];
  version?: string;
  showInlineKey?: boolean;
  keyItems?: M514QuestionInstance[];
  itemNumberOffset?: number;
}

export function LessonPrintWorksheet({
  title,
  subtitle,
  instructions,
  items,
  version,
  showInlineKey = false,
  keyItems,
  itemNumberOffset = 0,
}: LessonPrintWorksheetProps) {
  return (
    <div className="lesson-print-worksheet flex min-h-[250mm] flex-col space-y-5 text-[var(--print)]">
      <header className="border-b border-slate-400 pb-4">
        <h2 className="text-xl font-bold leading-tight">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-slate-700">{subtitle}</p> : null}
        {version ? <p className="mt-1 font-mono text-[10px] text-slate-500">Wersja arkusza {version}</p> : null}
      </header>

      <p className="text-sm leading-relaxed text-slate-800">{instructions}</p>

      <ol className="flex-1 space-y-5" start={itemNumberOffset + 1}>
        {items.map((item, index) => (
          <li
            key={item.id}
            className="worksheet-item break-inside-avoid"
            data-skill-ids={item.skillIds?.join(" ") || undefined}
          >
            <p className="text-sm font-semibold text-slate-900">
              {itemNumberOffset + index + 1}.{" "}
              <span className="font-mono text-base font-black tabular-nums">{item.expression}</span>
            </p>
            {item.answerLayout === "fraction-stack" ? (
              <div className="mt-3 flex items-center gap-5" aria-label={item.prompt} data-fraction-stack-answer>
                <div className="grid w-24 grid-cols-3 gap-1" aria-label="Pionowy zapis ułamka">
                  {[0, 1, 2].map((cell) => <span key={`n-${cell}`} className="h-8 border border-slate-500" />)}
                  <span className="col-span-3 border-t-2 border-slate-900" />
                  {[0, 1, 2].map((cell) => <span key={`d-${cell}`} className="h-8 border border-slate-500" />)}
                </div>
                <div className="flex-1 border-b border-dashed border-slate-400 pb-10 text-xs text-slate-600">{item.prompt}</div>
              </div>
            ) : item.answerLayout === "fraction-axis" ? (
              <div className="mt-5 space-y-2" aria-label={item.prompt} data-fraction-axis-answer>
                <div className="flex items-end justify-between border-b-2 border-slate-800 px-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((tick) => <span key={tick} className="h-3 border-l border-slate-800" />)}
                </div>
                <p className="text-xs text-slate-600">{item.prompt}</p>
              </div>
            ) : (
              <AnswerSpace label={item.prompt} rows={2} />
            )}
          </li>
        ))}
      </ol>

      {showInlineKey && keyItems && keyItems.length > 0 ? (
        <section className="key-inline break-inside-avoid border-t border-dashed border-slate-400 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">Klucz nauczyciela</h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-800">
            {keyItems.map((item, index) => (
              <li key={item.id}>
                {itemNumberOffset + index + 1}. {item.expression} → {item.firstStepLabel} (wynik:{" "}
                {item.finalValue})
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function printableToWorksheetProps(
  resource: M514PrintableResource,
  options?: {
    showInlineKey?: boolean;
    keyItems?: M514QuestionInstance[];
    itemNumberOffset?: number;
    items?: PrintWorksheetItem[];
  },
): LessonPrintWorksheetProps {
  return {
    title: resource.title,
    subtitle: resource.subtitle,
    instructions: resource.instructions,
    items: options?.items ?? resource.items,
    version: resource.version,
    showInlineKey: options?.showInlineKey,
    keyItems: options?.keyItems,
    itemNumberOffset: options?.itemNumberOffset,
  };
}
