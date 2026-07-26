import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GEOMETRY_GAME_KEYS } from "@/components/materials/games/geometry-arcade/geometryGameKeys";
import { MATERIAL_CATALOG } from "./catalog";

const geometrySlugs = new Set<string>(GEOMETRY_GAME_KEYS);

function hasMaterialRoute(audience: "nauczyciel" | "uczen", slug: string) {
  return geometrySlugs.has(slug)
    || existsSync(join(process.cwd(), "src", "app", audience, "materialy", slug, "page.tsx"));
}

describe("trasy biblioteki materiałów", () => {
  it.each(["nauczyciel", "uczen"] as const)(
    "każda opublikowana gra ma działającą stronę dla profilu: %s",
    (audience) => {
      const missingRoutes = MATERIAL_CATALOG
        .filter((material) => material.published)
        .map((material) => material.slug)
        .filter((slug) => !hasMaterialRoute(audience, slug));

      expect(missingRoutes).toEqual([]);
    },
  );
});
