import { cn } from "@/lib/cn";

interface PrintPageBreakProps {
  /** before = nowa strona przed elementem; after = po */
  position?: "before" | "after";
  className?: string;
}

export function PrintPageBreak({ position = "before", className }: PrintPageBreakProps) {
  return (
    <div
      className={cn(
        "print-page-break hidden h-0 print:block",
        position === "before" ? "print-break-before" : "print-break-after",
        className,
      )}
      aria-hidden
    />
  );
}
