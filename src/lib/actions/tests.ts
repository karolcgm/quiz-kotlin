"use server";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { GradeLevel } from "@/types/curriculum";
import type { TestItem } from "@/types/test";

export interface SaveTestActionResult {
  ok: boolean;
  error?: string;
}

function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${key}`);
  }
  return value.trim();
}

export async function saveTestAction(formData: FormData): Promise<SaveTestActionResult> {
  try {
    await requireRole("teacher");
    const supabase = await createClient();
    const title = requiredString(formData, "title");
    const schoolId = requiredString(formData, "schoolId");
    const classLevel = Number(requiredString(formData, "classLevel")) as GradeLevel;
    const description = formData.get("description")?.toString() ?? "";
    const instruction = formData.get("instruction")?.toString() ?? "";
    const intent = formData.get("intent")?.toString();
    const itemsJson = requiredString(formData, "itemsJson");
    let items: Omit<TestItem, "id">[];

    try {
      const parsedItems = JSON.parse(itemsJson);
      if (!Array.isArray(parsedItems)) {
        throw new Error("Items payload is not an array.");
      }
      items = parsedItems as Omit<TestItem, "id">[];
    } catch {
      return {
        ok: false,
        error: "Nie udało się odczytać pytań testu. Odśwież stronę i spróbuj ponownie.",
      };
    }

    if (items.length === 0) {
      return { ok: false, error: "Dodaj przynajmniej jedno pytanie do testu." };
    }

    const { error } = await supabase.rpc("create_teacher_test", {
      target_school_id: schoolId,
      test_title: title,
      test_description: description,
      test_instruction: instruction,
      target_class_level: classLevel,
      target_status: intent === "publish" ? "published" : "draft",
      items,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nie udało się zapisać testu.",
    };
  }
}
