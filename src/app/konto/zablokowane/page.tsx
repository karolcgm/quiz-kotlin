import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { signOutAction } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Konto zablokowane",
  description: "Informacja o zablokowanym koncie LekcjaLab.",
};

export default function BlockedAccountPage() {
  return (
    <PageShell className="max-w-2xl">
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Konto jest zablokowane</h1>
        <p className="mt-3 text-slate-600">
          Dostęp do panelu został wstrzymany. Skontaktuj się z administratorem szkoły lub
          administratorem LekcjaLab, aby wyjaśnić status konta.
        </p>
        <form action={signOutAction} className="mt-6">
          <button className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">
            Wyloguj
          </button>
        </form>
      </Card>
    </PageShell>
  );
}
