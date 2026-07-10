import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  muted?: boolean;
}

export function Card({ children, className, muted = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-slate-200/80 p-4 shadow-sm sm:p-5",
        muted ? "bg-[var(--surface-muted)]" : "bg-[var(--surface)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "brand" | "learn" | "assess" | "neutral";
}

const accentBorder = {
  brand: "border-l-[var(--brand-600)]",
  learn: "border-l-[var(--learn)]",
  assess: "border-l-[var(--assess)]",
  neutral: "border-l-slate-300",
};

export function StatCard({ label, value, hint, accent = "neutral" }: StatCardProps) {
  return (
    <Card className={cn("border-l-4", accentBorder[accent])}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--ink)]">{value}</p>
      {hint ? <p className="mt-1 text-sm text-[var(--ink-muted)]">{hint}</p> : null}
    </Card>
  );
}
