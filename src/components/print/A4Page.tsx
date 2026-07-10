import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface A4PageProps {
  children: ReactNode;
  className?: string;
  pageNumber?: number;
  totalPages?: number;
  version?: string;
  documentId?: string;
}

export function A4Page({
  children,
  className,
  pageNumber,
  totalPages,
  version,
  documentId,
}: A4PageProps) {
  return (
    <section
      className={cn(
        "a4-page print-break-after mx-auto box-border w-full max-w-[210mm] bg-white px-[16mm] py-[14mm] text-black shadow-sm",
        className,
      )}
      data-print-page={pageNumber}
    >
      {children}
      <footer className="a4-page-footer mt-auto border-t border-slate-300 pt-2 text-center text-[10px] text-slate-500">
        <span>LekcjaLab</span>
        {documentId ? <span className="mx-2 font-mono">· {documentId}</span> : null}
        {version ? <span className="font-mono">· v{version}</span> : null}
        {pageNumber !== undefined ? (
          <span className="ml-2 tabular-nums">
            · strona {pageNumber}
            {totalPages ? ` / ${totalPages}` : ""}
          </span>
        ) : null}
      </footer>
    </section>
  );
}
