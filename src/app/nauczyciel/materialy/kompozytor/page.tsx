import { MaterialComposer } from "@/components/materials/MaterialComposer";
import { MATERIAL_CATALOG } from "@/data/materials/catalog";
import { requireRole } from "@/lib/auth/session";

interface MaterialComposerPageProps {
  searchParams: Promise<{ material?: string }>;
}

export default async function MaterialComposerPage({ searchParams }: MaterialComposerPageProps) {
  await requireRole("teacher");
  const { material } = await searchParams;

  return <MaterialComposer materials={MATERIAL_CATALOG} initialSlug={material} />;
}
