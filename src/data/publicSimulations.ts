import type { Simulation } from "@/types/simulation";
import { simulations } from "@/data/simulations";

/** Symulacje widoczne w katalogu publicznym — reszta zostaje w kodzie do dalszej pracy. */
export const PUBLIC_SIMULATION_SLUGS = ["os-liczbowa", "waga", "memory-figury"] as const;

export type PublicSimulationSlug = (typeof PUBLIC_SIMULATION_SLUGS)[number];

const publicSlugSet = new Set<string>(PUBLIC_SIMULATION_SLUGS);

export function isCatalogVisible(simulation: Simulation): boolean {
  return publicSlugSet.has(simulation.slug);
}

export function isCatalogVisibleSlug(slug: string): boolean {
  return publicSlugSet.has(slug);
}

export function getPublicSimulations(): Simulation[] {
  return simulations.filter(isCatalogVisible);
}

export const PREMIUM_SIMULATION_SLUGS = new Set<string>(PUBLIC_SIMULATION_SLUGS);
