import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { studentNavCategories } from "@/data/dashboardNav";
import { Card } from "@/components/ui/Card";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/notifications";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentNotificationsPage() {
  await requireRole("student");
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, kind, title, body, link_href, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <PageShell>
      <DashboardNav categories={studentNavCategories} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Powiadomienia</h1>
            <p className="mt-2 text-slate-600">
              Nowe testy, decyzje o poprawie i wiadomości od nauczyciela.
            </p>
          </div>
          <form action={markAllNotificationsReadAction}>
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
              Oznacz wszystkie jako przeczytane
            </button>
          </form>
        </div>
        <div className="mt-6 space-y-3">
          {(data ?? []).length === 0 && (
            <p className="text-slate-600">Brak powiadomień.</p>
          )}
          {(data ?? []).map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 ${notification.read_at ? "border-slate-200 bg-white" : "border-indigo-200 bg-indigo-50"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-slate-700">{notification.body}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Intl.DateTimeFormat("pl-PL", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(notification.created_at))}
                  </p>
                  {notification.link_href && (
                    <Link
                      href={notification.link_href}
                      className="mt-3 inline-block font-semibold text-indigo-700 hover:text-indigo-900"
                    >
                      Otwórz
                    </Link>
                  )}
                </div>
                {!notification.read_at && (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="notificationId" value={notification.id} />
                    <button className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm">
                      Przeczytane
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
