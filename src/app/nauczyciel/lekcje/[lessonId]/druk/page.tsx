import { notFound } from "next/navigation";
import { LessonPrintDocument } from "@/components/lessons/LessonPrintDocument";
import { PrintPreviewToolbar } from "@/components/print/PrintPreviewToolbar";
import { getPrintableResource } from "@/data/lessons/m5-1-4-printables";
import { getLessonPackageById } from "@/data/lessons/registry";
import { countPrintPages } from "@/lib/print/pagination";
import type { PrintViewMode } from "@/types/print";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ resource?: string; view?: string; key?: string }>;
}

function parseViewMode(view?: string, legacyKey?: string): PrintViewMode {
  if (view === "key" || view === "key-separate" || view === "student") {
    return view;
  }
  if (legacyKey === "1") return "key";
  return "student";
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);
  return { title: lesson ? `Druk: ${lesson.title}` : "Materiały drukowane" };
}

export default async function TeacherLessonPrintPage({ params, searchParams }: PageProps) {
  const { lessonId } = await params;
  const { resource, view, key } = await searchParams;
  const lesson = getLessonPackageById(lessonId);

  if (!lesson || lesson.status !== "published") {
    notFound();
  }

  const resourceId = resource ?? lesson.printableResourceIds[0];
  const printable = resourceId ? getPrintableResource(resourceId) : undefined;
  const viewMode = parseViewMode(view, key);

  if (!printable) {
    notFound();
  }

  const resourceOptions = lesson.printableResourceIds
    .map((id) => {
      const item = getPrintableResource(id);
      return item
        ? {
            id,
            title: item.title,
            href: `/nauczyciel/lekcje/${lesson.id}/druk?resource=${id}&view=${viewMode}`,
          }
        : null;
    })
    .filter((item): item is { id: string; title: string; href: string } => Boolean(item));

  const pageCount = countPrintPages(printable.items.length, viewMode);

  return (
    <div className="print-route space-y-4">
      <PrintPreviewToolbar
        lessonTitle={lesson.title}
        resourceId={resourceId!}
        resourceOptions={resourceOptions}
        viewMode={viewMode}
        viewOptions={(["student", "key", "key-separate"] as const).map((targetView) => ({
          id: targetView,
          href: `/nauczyciel/lekcje/${lesson.id}/druk?resource=${resourceId}&view=${targetView}`,
        }))}
        prepHref={`/nauczyciel/lekcje/${lesson.id}/przygotuj`}
        pageCount={pageCount}
        version={printable.version}
      />

      <LessonPrintDocument lessonId={lessonId} resourceId={resourceId} viewMode={viewMode} />
    </div>
  );
}
