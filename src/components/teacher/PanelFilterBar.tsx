import Link from "next/link";

export interface PanelFilterOption {
  id: string;
  label: string;
  href: string;
  count?: number;
}

interface PanelFilterBarProps {
  options: PanelFilterOption[];
  activeId: string;
  ariaLabel: string;
}

export function PanelFilterBar({ options, activeId, ariaLabel }: PanelFilterBarProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.id === activeId;

        return (
          <Link
            key={option.id}
            href={option.href}
            role="tab"
            aria-selected={active}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-indigo-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`ml-1.5 ${active ? "text-indigo-100" : "text-slate-400"}`}>
                ({option.count})
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
