import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getAgileGameTemplate } from "@/lib/agileGames/catalog";

export default async function StudentAgileGamesPage() {
  const student = await requireRole("student");
  const supabase = await createClient();
  const { data: memberships } = await supabase.from("class_members").select("class_id").eq("student_id", student.id);
  const classIds = (memberships ?? []).map((row) => row.class_id);
  const { data: games } = classIds.length ? await supabase.from("agile_game_sessions").select("id, title, template_id, status, sprint_number, teacher_classes(name, group_name)").in("class_id", classIds).in("status", ["lobby", "active", "finished"]).order("created_at", { ascending: false }) : { data: [] };
  return <main><section className="rounded-[2rem] bg-gradient-to-br from-cyan-500 to-indigo-700 p-7 text-white sm:p-9"><p className="text-sm font-black uppercase tracking-[.16em] text-cyan-100">Gry zespołowe</p><h1 className="mt-2 text-4xl font-black">Dołącz do zespołu i działaj sprintami</h1><p className="mt-3 text-indigo-100">W lobby wybierasz zespół. W małym składzie możesz dostać więcej niż jedną rolę — liczy się wspólny efekt.</p></section><div className="mt-6 grid gap-4 md:grid-cols-2">{(games ?? []).map((game) => { const template = getAgileGameTemplate(game.template_id); return <Link key={game.id} href={`/uczen/gry-agile/${game.id}`}><Card className="h-full border-cyan-100 transition hover:-translate-y-1 hover:border-cyan-300"><span className="text-4xl">{template?.emoji ?? "🎯"}</span><p className="mt-3 text-xs font-black uppercase text-cyan-700">{game.status === "lobby" ? "Wybór zespołów" : `Sprint ${game.sprint_number}`}</p><h2 className="mt-1 text-2xl font-black text-slate-950">{game.title}</h2><p className="mt-2 text-slate-600">{template?.description}</p></Card></Link>; })}{!games?.length ? <Card><p className="font-bold text-slate-700">Nauczyciel nie uruchomił teraz gry dla Twojej klasy.</p></Card> : null}</div></main>;
}
