import { notFound } from "next/navigation";
import { countPrintPages, LessonPrintDocument } from "@/components/lessons/LessonPrintDocument";
import { PrintPreviewToolbar, type PrintViewMode } from "@/components/print/PrintPreviewToolbar";
import { getPrintableResource } from "@/data/lessons/m5-1-4-printables";
import { getLessonPackageById } from "@/data/lessons/registry";

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
      return item ? { id, title: item.title } : null;
    })
    .filter((item): item is { id: string; title: string } => Boolean(item));

  const pageCount = countPrintPages(printable.items.length, viewMode);

  return (
    <div className="print-route space-y-4">
      <PrintPreviewToolbar
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        resourceId={resourceId!}
        resourceOptions={resourceOptions}
        viewMode={viewMode}
        prepHref={`/nauczyciel/lekcje/${lesson.id}/przygotuj`}
        pageCount={pageCount}
        version={printable.version}
      />

      <LessonPrintDocument lessonId={lessonId} resourceId={resourceId} viewMode={viewMode} />
    </div>
  );
}
