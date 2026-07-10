import { cn } from "@/lib/cn";
import type { SimulationStatus } from "@/types/simulation";

type BadgeVariant = "default" | "success" | "warning" | "muted";
type BadgeTone = "neutral" | "brand" | "learn" | "assess" | "success" | "warning" | "danger";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-indigo-100 text-indigo-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  muted: "bg-slate-100 text-slate-700",
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-indigo-50 text-indigo-800",
  learn: "bg-teal-50 text-teal-900",
  assess: "bg-violet-50 text-violet-900",
  success: "bg-emerald-50 text-emerald-900",
  warning: "bg-amber-50 text-amber-900",
  danger: "bg-red-50 text-red-900",
};

export function Badge({ children, variant, tone, className }: BadgeProps) {
  const styleClass = tone ? toneClasses[tone] : variantClasses[variant ?? "default"];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide sm:px-3 sm:py-1 sm:text-sm",
        styleClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: SimulationStatus): BadgeVariant {
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

export function topicStatusBadge(contentStatus: string) {
  switch (contentStatus) {
    case "published":
      return <Badge tone="success">Gotowa lekcja</Badge>;
    case "draft":
    case "review":
      return <Badge tone="warning">W przygotowaniu</Badge>;
    case "metadata-only":
    default:
      return <Badge tone="neutral">Metadane programu</Badge>;
  }
}
