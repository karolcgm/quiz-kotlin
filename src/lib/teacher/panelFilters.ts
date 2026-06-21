export type TestListFilter = "all" | "published" | "draft" | "archived";
export type AssignmentListFilter = "all" | "published" | "closed";
export type ResultsViewFilter = "all" | "retake";

export function buildPanelUrl(
  basePath: string,
  params: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all") {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function parseTestFilter(value: string | undefined): TestListFilter {
  if (value === "published" || value === "draft" || value === "archived") {
    return value;
  }

  return "all";
}

export function parseAssignmentFilter(value: string | undefined): AssignmentListFilter {
  if (value === "published" || value === "closed") {
    return value;
  }

  return "all";
}

export function parseResultsViewFilter(value: string | undefined): ResultsViewFilter {
  return value === "retake" ? "retake" : "all";
}

export function testFilterLabel(filter: TestListFilter): string {
  switch (filter) {
    case "published":
      return "Opublikowane";
    case "draft":
      return "Robocze";
    case "archived":
      return "Archiwum";
    default:
      return "Wszystkie";
  }
}

export function assignmentFilterLabel(filter: AssignmentListFilter): string {
  switch (filter) {
    case "published":
      return "Aktywne";
    case "closed":
      return "Zakończone";
    default:
      return "Wszystkie";
  }
}

export function formatSubmittedAt(value: string | null): string {
  if (!value) {
    return "Data niedostępna";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function studentDisplayName(input: {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  fallbackId: string;
}): string {
  return (
    input.display_name ??
    [input.first_name, input.last_name].filter(Boolean).join(" ") ??
    `Uczeń ${input.fallbackId.slice(0, 8)}`
  );
}

export function classDisplayName(input: {
  name: string;
  group_name: string;
  schools?: { name: string } | null;
}): string {
  const school = input.schools?.name;
  return school
    ? `${input.name} ${input.group_name} · ${school}`
    : `${input.name} ${input.group_name}`;
}
