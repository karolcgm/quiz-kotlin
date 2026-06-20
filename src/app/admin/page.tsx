import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole("admin");

  return (
    <PageShell>
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Panel admina</h1>
        <p className="mt-3 text-slate-600">
          Admin aktywuje konta nauczycieli i może pilnować poprawnego przypisania szkół.
        </p>
        <Link
          href="/admin/nauczyciele"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          Aktywuj nauczycieli
        </Link>
      </Card>
    </PageShell>
  );
}
