"use client";

import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { A4Page } from "@/components/print/A4Page";
import { A4PagePreview } from "@/components/print/A4PagePreview";
import { PrintKeySheet } from "@/components/print/PrintKeySheet";
import type { PrintViewMode } from "@/types/print";
import { PrintShell } from "@/components/shells/AppShells";
import { M514_QUESTION_INSTANCES } from "@/data/lessons/m5-1-4-instances";
import { getPrintableResource } from "@/data/lessons/m5-1-4-printables";
import { getLessonPackageById } from "@/data/lessons/registry";
import { paginateItems, PRINT_ITEMS_PER_PAGE } from "@/lib/print/paginateItems";

interface LessonPrintDocumentProps {
  lessonId: string;
  resourceId?: string;
  viewMode: PrintViewMode;
}

export function LessonPrintDocument({ lessonId, resourceId, viewMode }: LessonPrintDocumentProps) {
  const lesson = getLessonPackageById(lessonId);
  const resolvedResourceId = resourceId ?? lesson?.printableResourceIds[0];
  const resource = resolvedResourceId ? getPrintableResource(resolvedResourceId) : undefined;

  if (!lesson || !resource) {
    return <p className="text-sm text-slate-600">Nie znaleziono materiału do druku.</p>;
  }

  const keyItems = resource.items
    .map((item) => M514_QUESTION_INSTANCES.find((q) => q.id === item.questionId))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  const itemPages = paginateItems(resource.items, PRINT_ITEMS_PER_PAGE);
  const showInlineKey = viewMode === "key";
  const showSeparateKey = viewMode === "key-separate";
  const studentPages = itemPages.length;
  const keyPages = showSeparateKey ? 1 : 0;
  const totalPages = studentPages + keyPages;

  return (
    <A4PagePreview>
      <PrintShell>
        {itemPages.map((pageItems, pageIndex) => (
          <A4Page
            key={`page-${pageIndex}`}
            pageNumber={pageIndex + 1}
            totalPages={totalPages}
            version={resource.version}
            documentId={resource.id}
            className={pageIndex < itemPages.length - 1 || showSeparateKey ? "print-break-after" : ""}
          >
            <LessonPrintWorksheet
              title={pageIndex === 0 ? resource.title : `${resource.title} (cd.)`}
              subtitle={pageIndex === 0 ? resource.subtitle : undefined}
              instructions={pageIndex === 0 ? resource.instructions : "Kontynuacja zadań."}
              items={pageItems}
              version={resource.version}
              itemNumberOffset={pageIndex * PRINT_ITEMS_PER_PAGE}
              showInlineKey={showInlineKey && pageIndex === itemPages.length - 1}
              keyItems={showInlineKey ? keyItems : undefined}
            />
          </A4Page>
        ))}

        {showSeparateKey ? (
          <A4Page
            pageNumber={totalPages}
            totalPages={totalPages}
            version={resource.version}
            documentId={`${resource.id}-key`}
          >
            <PrintKeySheet title={resource.title} version={resource.version} items={keyItems} />
          </A4Page>
        ) : null}
      </PrintShell>
    </A4PagePreview>
  );
}
