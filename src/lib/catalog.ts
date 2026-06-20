import { mathCurriculum } from "@/data/mathCurriculum";
import { simulations } from "@/data/simulations";

export interface CatalogIssue {
  type: "duplicate-slug" | "missing-section" | "missing-topic";
  simulationSlug: string;
  message: string;
}

export function validateCatalog(): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const seenSlugs = new Set<string>();
  const sections = new Map(mathCurriculum.map((section) => [section.id, section]));

  for (const simulation of simulations) {
    if (seenSlugs.has(simulation.slug)) {
      issues.push({
        type: "duplicate-slug",
        simulationSlug: simulation.slug,
        message: `Duplikat sluga symulacji: ${simulation.slug}`,
      });
    }

    seenSlugs.add(simulation.slug);

    const section = sections.get(simulation.sectionId);
    if (!section) {
      issues.push({
        type: "missing-section",
        simulationSlug: simulation.slug,
        message: `Symulacja ${simulation.slug} wskazuje nieistniejący dział ${simulation.sectionId}.`,
      });
      continue;
    }

    if (!section.topics.some((topic) => topic.id === simulation.topicId)) {
      issues.push({
        type: "missing-topic",
        simulationSlug: simulation.slug,
        message: `Symulacja ${simulation.slug} wskazuje temat ${simulation.topicId}, którego nie ma w dziale ${section.id}.`,
      });
    }
  }

  return issues;
}
