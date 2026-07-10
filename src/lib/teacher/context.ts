"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const TEACHER_CONTEXT_COOKIE = "lekcjalab_teacher_context";

type TeacherClassRow = {
  id: string;
  school_id: string;
  name: string;
  group_name: string;
  school_grade: number;
  schools: { name: string } | null;
};

export type TeacherClassContext = {
  id: string;
  schoolId: string;
  schoolName: string;
  name: string;
  groupName: string;
  grade: number;
};

export type SelectedTeacherContext =
  | { mode: "general"; selectedByUser: boolean }
  | { mode: "class"; selectedByUser: boolean; class: TeacherClassContext };

function toClassContext(row: TeacherClassRow): TeacherClassContext {
  return {
    id: row.id,
    schoolId: row.school_id,
    schoolName: row.schools?.name ?? "Szkoła",
    name: row.name,
    groupName: row.group_name,
    grade: row.school_grade,
  };
}

async function getTeacherClassesForCurrentUser(): Promise<TeacherClassContext[]> {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teacher_classes")
    .select("id, school_id, name, group_name, school_grade, schools(name)")
    .eq("teacher_id", teacher.id)
    .order("school_grade")
    .order("name")
    .returns<TeacherClassRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(toClassContext);
}

export async function getTeacherContext(): Promise<{
  classes: TeacherClassContext[];
  selected: SelectedTeacherContext;
}> {
  const classes = await getTeacherClassesForCurrentUser();
  const cookieStore = await cookies();
  const stored = cookieStore.get(TEACHER_CONTEXT_COOKIE)?.value;

  if (stored === "general") {
    return { classes, selected: { mode: "general", selectedByUser: true } };
  }

  if (stored?.startsWith("class:")) {
    const classId = stored.slice("class:".length);
    const selectedClass = classes.find((item) => item.id === classId);
    if (selectedClass) {
      return { classes, selected: { mode: "class", selectedByUser: true, class: selectedClass } };
    }
  }

  return { classes, selected: { mode: "general", selectedByUser: false } };
}

export async function setTeacherContextAction(value: "general" | `class:${string}`) {
  await requireRole("teacher");

  if (value !== "general") {
    const classId = value.startsWith("class:") ? value.slice("class:".length) : "";
    const classes = await getTeacherClassesForCurrentUser();
    if (!classes.some((item) => item.id === classId)) {
      throw new Error("Nie masz dostępu do wybranej klasy.");
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(TEACHER_CONTEXT_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  revalidatePath("/nauczyciel", "layout");
}

export async function clearTeacherContextAction() {
  const cookieStore = await cookies();
  cookieStore.delete(TEACHER_CONTEXT_COOKIE);
}
