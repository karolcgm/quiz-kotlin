"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile, requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AppNotification } from "@/types/notification";

type NotificationRow = {
  id: string;
  kind: AppNotification["kind"];
  title: string;
  body: string;
  link_href: string | null;
  read_at: string | null;
  created_at: string;
};

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    linkHref: row.link_href,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function getNotificationSummary() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { unreadCount: 0, recent: [] as AppNotification[] };
  }

  const supabase = await createClient();
  const [{ count }, { data }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", profile.id)
      .is("read_at", null),
    supabase
      .from("notifications")
      .select("id, kind, title, body, link_href, read_at, created_at")
      .eq("recipient_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<NotificationRow[]>(),
  ]);

  return {
    unreadCount: count ?? 0,
    recent: (data ?? []).map(mapNotification),
  };
}

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = formData.get("notificationId")?.toString();
  if (!notificationId) {
    return;
  }

  await getCurrentProfile();
  const supabase = await createClient();
  await supabase.rpc("mark_notification_read", {
    target_notification_id: notificationId,
  });

  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  await getCurrentProfile();
  const supabase = await createClient();
  await supabase.rpc("mark_all_notifications_read");
  revalidatePath("/", "layout");
}

export async function sendTeacherNotificationAction(formData: FormData) {
  await requireRole("teacher");
  const supabase = await createClient();

  const title = formData.get("title")?.toString().trim() ?? "";
  const body = formData.get("body")?.toString().trim() ?? "";
  const linkHref = formData.get("linkHref")?.toString().trim() || null;
  const scope = formData.get("scope")?.toString() ?? "class";
  const classId = formData.get("classId")?.toString() ?? null;
  const studentIds =
    scope === "selected"
      ? formData
          .getAll("studentIds")
          .map((value) => value.toString())
          .filter(Boolean)
      : null;

  const { data: sentCount, error } = await supabase.rpc("send_teacher_notifications", {
    notification_title: title,
    notification_body: body,
    target_class_id: scope === "class" ? classId : null,
    target_student_ids: studentIds,
    link_href: linkHref,
  });

  if (error) {
    redirect(`/nauczyciel/powiadomienia/wyslij?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/nauczyciel/powiadomienia");
  redirect(
    `/nauczyciel/powiadomienia?sent=${encodeURIComponent(String(sentCount ?? 0))}`,
  );
}

export async function notifyTeacherOfSubmission(
  supabase: Awaited<ReturnType<typeof createClient>>,
  submissionId: string,
) {
  await supabase.rpc("notify_test_submitted", {
    target_submission_id: submissionId,
  });
}
