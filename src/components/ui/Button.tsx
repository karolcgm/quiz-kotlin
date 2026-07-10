import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "learn" | "assess" | "print";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]",
  secondary: "border border-slate-200 bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-muted)]",
  ghost: "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
  danger: "bg-[var(--danger)] text-white hover:opacity-90",
  learn: "bg-[var(--learn)] text-white hover:opacity-90",
  assess: "bg-[var(--assess)] text-white hover:opacity-90",
  print: "bg-[var(--print)] text-white hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 text-sm rounded-[var(--radius-button)]",
  md: "min-h-12 px-4 text-sm font-semibold rounded-[var(--radius-button)]",
  lg: "min-h-14 px-6 text-base font-semibold rounded-[var(--radius-button)]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? "Ładowanie…" : children}
    </button>
  );
}
