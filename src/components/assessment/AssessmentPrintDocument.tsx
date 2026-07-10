"use client";

import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { A4Page } from "@/components/print/A4Page";
import { A4PagePreview } from "@/components/print/A4PagePreview";
import { PrintKeySheet } from "@/components/print/PrintKeySheet";
import type { PrintViewMode } from "@/types/print";
import { PrintShell } from "@/components/shells/AppShells";
import type { AssessmentVersionBundle } from "@/types/assessmentBlueprint";
import { paginateItems, PRINT_ITEMS_PER_PAGE } from "@/lib/print/paginateItems";
import type { PrintWorksheetItem } from "@/types/lessonPackage";

interface AssessmentPrintDocumentProps {
  bundle: AssessmentVersionBundle;
  viewMode: PrintViewMode;
  subtitle?: string;
  instructions?: string;
}

function toWorksheetItems(bundle: AssessmentVersionBundle): PrintWorksheetItem[] {
  return bundle.snapshot.items.map((item) => ({
    id: item.slotId,
    questionId: item.slotId,
    expression: item.expression,
    prompt: `${item.prompt} (${item.maxScore} pkt)`,
  }));
}

export function AssessmentPrintDocument({
  bundle,
  viewMode,
  subtitle,
  instructions,
}: AssessmentPrintDocumentProps) {
  const { snapshot, answerKey } = bundle;
  const worksheetItems = toWorksheetItems(bundle);
  const itemPages = paginateItems(worksheetItems, PRINT_ITEMS_PER_PAGE);
  const showInlineKey = viewMode === "key";
  const showSeparateKey = viewMode === "key-separate";
  const studentPages = itemPages.length;
  const keyPages = showSeparateKey ? 1 : 0;
  const totalPages = studentPages + keyPages;

  const keyItems = answerKey.map((entry, index) => {
    const item = snapshot.items[index]!;
    return {
      id: entry.slotId,
      seed: item.seed,
      difficulty: item.difficulty,
      expression: item.expression,
      firstStepLabel: entry.answerSpec.firstStepLabel,
      finalValue: entry.answerSpec.finalValue,
      stageIds: [] as string[],
    };
  });

  const defaultInstructions =
    instructions ??
    "W każdym wyrażeniu wskaż pierwsze działanie zgodnie z regułą kolejności. Przy zadaniu z nawiasem uzasadnij wybór jednym słowem.";

  return (
    <A4PagePreview>
      <PrintShell>
        {itemPages.map((pageItems, pageIndex) => (
          <A4Page
            key={`page-${pageIndex}`}
            pageNumber={pageIndex + 1}
            totalPages={totalPages}
            version={`${snapshot.versionCode}/${snapshot.versionSeed}`}
            documentId={snapshot.assessmentId}
            className={pageIndex < itemPages.length - 1 || showSeparateKey ? "print-break-after" : ""}
          >
            <LessonPrintWorksheet
              title={pageIndex === 0 ? snapshot.title : `${snapshot.title} (cd.)`}
              subtitle={
                pageIndex === 0
                  ? `${subtitle ?? `Wersja ${snapshot.versionCode}`} · max ${snapshot.maxScore} pkt`
                  : undefined
              }
              instructions={pageIndex === 0 ? defaultInstructions : "Kontynuacja zadań."}
              items={pageItems}
              version={`bp${snapshot.blueprintVersion}-${snapshot.versionCode}`}
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
            version={`${snapshot.versionCode}/${snapshot.versionSeed}`}
            documentId={`${snapshot.assessmentId}-key`}
          >
            <PrintKeySheet
              title={`${snapshot.title} — klucz`}
              version={`${snapshot.versionCode}/${snapshot.versionSeed}`}
              items={keyItems}
            />
          </A4Page>
        ) : null}
      </PrintShell>
    </A4PagePreview>
  );
}
