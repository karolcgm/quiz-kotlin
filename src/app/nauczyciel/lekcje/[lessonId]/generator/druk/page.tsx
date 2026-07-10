import { notFound } from "next/navigation";
import { AssessmentPrintDocument } from "@/components/assessment/AssessmentPrintDocument";
import { PrintPreviewToolbar } from "@/components/print/PrintPreviewToolbar";
import { getBlueprintById } from "@/lib/assessment/registry";
import {
  generateFrozenVersionSnapshot,
  resolveVersionSeed,
} from "@/lib/assessment/generateVersionSnapshot";
import type { AssessmentVersionCode } from "@/types/assessmentBlueprint";
import { getLessonPackageById } from "@/data/lessons/registry";
import { countPrintPages } from "@/lib/print/pagination";
import type { PrintViewMode } from "@/types/print";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ blueprint?: string; version?: string; view?: string; seed?: string }>;
}

function parseViewMode(view?: string): PrintViewMode {
  if (view === "key" || view === "key-separate" || view === "student") {
    return view;
  }
  return "student";
}

function parseVersionCode(version?: string): AssessmentVersionCode {
  if (version === "B" || version === "C") return version;
  return "A";
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);
  return { title: lesson ? `Druk A/B: ${lesson.title}` : "Druk z blueprintu" };
}

export default async function TeacherLessonGeneratorPrintPage({ params, searchParams }: PageProps) {
  const { lessonId } = await params;
  const { blueprint: blueprintId, version, view, seed } = await searchParams;
  const lesson = getLessonPackageById(lessonId);

  if (!lesson || lesson.status !== "published") {
    notFound();
  }

  const blueprint = blueprintId ? getBlueprintById(blueprintId) : undefined;
  if (!blueprint || blueprint.lessonPackageId !== lessonId) {
    notFound();
  }

  const versionCode = parseVersionCode(version);
  const viewMode = parseViewMode(view);
  const seedOverride = seed ? Number.parseInt(seed, 10) : undefined;
  const versionSeed = resolveVersionSeed(
    blueprint,
    versionCode,
    Number.isFinite(seedOverride) ? seedOverride : undefined,
  );

  const bundle = generateFrozenVersionSnapshot(blueprint, versionCode, versionSeed);
  const pageCount = countPrintPages(bundle.snapshot.items.length, viewMode);

  const versionOptions: AssessmentVersionCode[] = ["A", "B"];

  return (
    <div className="print-route space-y-4">
      <PrintPreviewToolbar
        lessonTitle={`${blueprint.title} · wersja ${versionCode}`}
        resourceId={blueprint.id}
        resourceOptions={versionOptions.map((code) => ({
          id: code,
          title: `Wersja ${code}`,
          href: `/nauczyciel/lekcje/${lessonId}/generator/druk?blueprint=${blueprint.id}&version=${code}&view=${viewMode}`,
        }))}
        viewMode={viewMode}
        viewOptions={(["student", "key", "key-separate"] as const).map((targetView) => ({
          id: targetView,
          href: `/nauczyciel/lekcje/${lessonId}/generator/druk?blueprint=${blueprint.id}&version=${versionCode}&view=${targetView}`,
        }))}
        prepHref={`/nauczyciel/lekcje/${lesson.id}/generator?blueprint=${blueprint.id}`}
        pageCount={pageCount}
        version={`${versionCode}/${versionSeed}`}
      />

      <AssessmentPrintDocument
        bundle={bundle}
        viewMode={viewMode}
        subtitle={blueprint.subtitle}
      />
    </div>
  );
}
