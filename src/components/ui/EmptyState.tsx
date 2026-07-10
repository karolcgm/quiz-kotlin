import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, actionHref, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-panel)] border border-dashed border-slate-300 bg-[var(--surface-muted)] px-6 py-12 text-center">
      {icon ? <div className="mb-4 text-3xl text-[var(--ink-muted)]">{icon}</div> : null}
      <h3 className="text-lg font-bold text-[var(--ink)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--ink-muted)]">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="mt-6">
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
