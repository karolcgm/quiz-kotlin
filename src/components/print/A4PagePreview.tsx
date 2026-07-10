import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface A4PagePreviewProps {
  children: ReactNode;
  className?: string;
}

/** Podgląd ekranowy strony A4 (spec §16 — A4PagePreview) */
export function A4PagePreview({ children, className }: A4PagePreviewProps) {
  return (
    <div className={cn("a4-page-preview mx-auto w-full max-w-[220mm] space-y-6 pb-8", className)}>
      {children}
    </div>
  );
}
