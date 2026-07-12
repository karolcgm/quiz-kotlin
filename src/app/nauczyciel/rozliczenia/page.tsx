import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BillingUpgradeForm } from "@/components/teacher/BillingUpgradeForm";

type StudentRow = { student_id: string };

export default async function BillingPage() {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_teacher_students");
  const students = new Set(((data ?? []) as StudentRow[]).map((row) => row.student_id)).size;
  const included = 20;
  const extra = Math.max(0, students - included);
  const annualPrice = 240 + extra * 2;

  return <main className="space-y-6"><section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-7 text-white sm:p-9"><p className="text-sm font-black uppercase tracking-[.16em] text-cyan-200">Rozliczenia</p><h1 className="mt-2 text-4xl font-black">Twój pakiet LekcjaLab</h1><p className="mt-3 max-w-2xl text-indigo-100">Dostęp nauczyciela z miejscami dla uczniów. Cena rośnie wyłącznie wtedy, gdy klasa przekracza pakiet podstawowy.</p></section><div className="grid gap-4 md:grid-cols-3"><Card><p className="text-sm font-bold text-slate-500">Uczniowie w Twoich klasach</p><p className="mt-1 text-4xl font-black text-slate-950">{students}</p></Card><Card><p className="text-sm font-bold text-slate-500">W pakiecie podstawowym</p><p className="mt-1 text-4xl font-black text-emerald-700">{included}</p></Card><Card><p className="text-sm font-bold text-slate-500">Szacowana cena roczna</p><p className="mt-1 text-4xl font-black text-indigo-700">{annualPrice} zł</p></Card></div><Card className="border-indigo-200 bg-indigo-50"><h2 className="text-2xl font-black text-slate-950">Potrzebujesz więcej miejsc?</h2><p className="mt-2 text-slate-700">Masz obecnie {extra} dodatkowych miejsc ponad pakiet podstawowy. Każde kolejne miejsce kosztuje 2 zł rocznie.</p><BillingUpgradeForm currentStudents={students} /><div className="mt-5 flex flex-wrap gap-3"><Link href="/nauczyciel/uczniowie" className="rounded-xl bg-indigo-600 px-5 py-3 font-black text-white">Dodaj uczniów / wyślij zaproszenia</Link><Link href="/konto/oferta" className="rounded-xl border border-indigo-200 bg-white px-5 py-3 font-black text-indigo-700">Zobacz ofertę</Link></div><p className="mt-4 text-sm text-slate-600">Zakup online wymaga jeszcze podłączenia operatora płatności. Zgłoszenie pakietu zapisuje wybraną liczbę miejsc i cenę do dalszej obsługi.</p></Card></main>;
}
