import Link from "next/link";
import { ExpeditionNwdNwwGame } from "@/components/materials/games/expedition-nwd-nww/ExpeditionNwdNwwGame";
import { requireRole } from "@/lib/auth/session";

export default async function StudentExpeditionPage() {
  await requireRole("student");
  return (
    <div className="space-y-5 pb-10">
      <Link
        href="/uczen/materialy"
        className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200"
      >
        ← Strefa Misji
      </Link>
      <ExpeditionNwdNwwGame rewardEnabled />
    </div>
  );
}
