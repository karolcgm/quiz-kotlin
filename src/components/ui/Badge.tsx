import { cn } from "@/lib/cn";
import type { SimulationStatus } from "@/types/simulation";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "muted";
  className?: string;
}

const variantClasses = {
  default: "bg-indigo-100 text-indigo-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  muted: "bg-slate-100 text-slate-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide sm:text-sm",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: SimulationStatus): BadgeProps["variant"] {
  switch (status) {
    case "ready":
      return "success";
    case "mvp":
      return "default";
    case "planned":
      return "warning";
    default:
      return "muted";
  }
}

export function statusLabel(status: SimulationStatus): string {
  switch (status) {
    case "ready":
      return "Gotowa";
    case "mvp":
      return "MVP";
    case "planned":
      return "Planowana";
    default:
      return status;
  }
}
