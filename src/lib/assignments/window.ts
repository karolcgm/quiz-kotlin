export type AssignmentKind = "classwork" | "homework";

export type AssignmentWindowState = "planned" | "active" | "overdue" | "closed";

export function getAssignmentWindowState(input: {
  status: string;
  starts_at: string | null;
  due_at: string | null;
  now?: Date;
}): AssignmentWindowState {
  const now = input.now ?? new Date();

  if (input.status === "closed") {
    return "closed";
  }

  if (input.starts_at && new Date(input.starts_at) > now) {
    return "planned";
  }

  if (input.due_at && new Date(input.due_at) < now) {
    return "overdue";
  }

  return "active";
}

export function canStudentOpenAssignment(
  state: AssignmentWindowState,
  options?: { inProgress?: boolean; retakeAllowed?: boolean },
): boolean {
  if (options?.inProgress) {
    return true;
  }

  if (state === "active") {
    return true;
  }

  if (state === "overdue" && options?.retakeAllowed) {
    return true;
  }

  return false;
}

export function windowStateLabel(state: AssignmentWindowState): string {
  switch (state) {
    case "planned":
      return "Zaplanowany";
    case "active":
      return "Aktywny";
    case "overdue":
      return "Po terminie";
    case "closed":
      return "Zamknięty";
  }
}

export function kindLabel(kind: AssignmentKind): string {
  return kind === "homework" ? "Praca domowa" : "Sprawdzian";
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

export function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return startOfDay(monday);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}
