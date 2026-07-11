import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getTeacherLessonUnderstanding } from "@/lib/actions/lessonSessions";
import { getTeacherContext } from "@/lib/teacher/context";
import type { TeacherLessonUnderstandingRow, UnderstandingLevel } from "@/types/understanding";

export const dynamic = "force-dynamic";

export const metadata = { title: "Zrozumienie tematów" };

const LEVEL_LABELS: Record<UnderstandingLevel, string> = {
  understood: "Wszystko rozumiem",
  partial: "Rozumiem, ale nie wszystko",
  not_understood: "Nie rozumiem tematu",
};

type Group = {
  key: string;
  title: string;
  classLabel: string;
  total: number;
  understood: number;
  partial: number;
  notUnderstood: number;
  needsReviewPercent: number;
  needsReviewStudents: string[];
};

function latestPerStudent(rows: TeacherLessonUnderstandingRow[], groupKey: (row: TeacherLessonUnderstandingRow) => string) {
  const latest = new Map<string, TeacherLessonUnderstandingRow>();
  for (const row of rows) {
    const key = `${groupKey(row)}:${row.studentId}`;
    const previous = latest.get(key);
    if (!previous || new Date(row.checkedAt).getTime() > new Date(previous.checkedAt).getTime()) latest.set(key, row);
  }
  return Array.from(latest.values());
}

function buildGroups(rows: TeacherLessonUnderstandingRow[], kind: "section" | "topic"): Group[] {
  const keyFor = (row: TeacherLessonUnderstandingRow) => `${row.classId}:${kind === "section" ? row.sectionId : row.topicId}`;
  const latest = latestPerStudent(rows, keyFor);
  const grouped = new Map<string, TeacherLessonUnderstandingRow[]>();
  for (const row of latest) {
    const key = keyFor(row);
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }
  return Array.from(grouped.entries()).map(([key, values]) => {
    const understood = values.filter((row) => row.understandingLevel === "understood").length;
    const partial = values.filter((row) => row.understandingLevel === "partial").length;
    const notUnderstood = values.filter((row) => row.understandingLevel === "not_understood").length;
    const needsReview = values.filter((row) => row.understandingLevel !== "understood");
    return {
      key,
      title: kind === "section" ? values[0].sectionId : values[0].topicId,
      classLabel: `${values[0].className}${values[0].groupName ? ` ${values[0].groupName}` : ""}`,
      total: values.length,
      understood,
      partial,
      notUnderstood,
      needsReviewPercent: values.length ? Math.round(needsReview.length / values.length * 100) : 0,
      needsReviewStudents: needsReview.map((row) => row.displayName).sort((a, b) => a.localeCompare(b, "pl")),
    };
  }).sort((a, b) => b.needsReviewPercent - a.needsReviewPercent || a.title.localeCompare(b.title, "pl"));
}

function GroupList({ groups, emptyText }: { groups: Group[]; emptyText: string }) {
  if (groups.length === 0) return <Card className="py-8 text-center text-sm text-slate-600">{emptyText}</Card>;
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <Card key={group.key} className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-wide text-indigo-600">{group.classLabel}</p><h3 className="mt-1 text-lg font-black text-slate-950">{group.title}</h3></div>
            <div className={`rounded-2xl px-4 py-2 text-center ${group.needsReviewPercent >= 50 ? "bg-orange-100 text-orange-950" : "bg-indigo-100 text-indigo-950"}`}>
              <strong className="block text-2xl">{group.needsReviewPercent}%</strong><span className="text-xs font-bold">potrzebuje powtórki</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900"><span className="mx-auto mb-2 block h-5 w-5 rounded-full bg-emerald-500" />{group.understood} rozumie</div>
            <div className="rounded-xl bg-yellow-50 p-3 text-yellow-950"><span className="mx-auto mb-2 block h-5 w-5 rounded-full bg-yellow-400" />{group.partial} częściowo</div>
            <div className="rounded-xl bg-orange-50 p-3 text-orange-950"><span className="mx-auto mb-2 block h-5 w-5 rounded-full bg-orange-500" />{group.notUnderstood} nie rozumie</div>
          </div>
          {group.needsReviewStudents.length > 0 ? <p className="text-sm text-slate-600"><strong>Warto wrócić do tematu z:</strong> {group.needsReviewStudents.join(", ")}.</p> : <p className="text-sm font-bold text-emerald-700">Nikt nie zgłosił trudności w tym zakresie.</p>}
        </Card>
      ))}
    </div>
  );
}

export default async function TeacherUnderstandingPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const [{ classId }, context] = await Promise.all([searchParams, getTeacherContext()]);
  const contextClassId = context.selected.mode === "class" ? context.selected.class.id : undefined;
  const selectedClassId = classId === "all"
    ? undefined
    : context.classes.some((item) => item.id === classId) ? classId : contextClassId;
  const rows = await getTeacherLessonUnderstanding(selectedClassId);
  const sectionGroups = buildGroups(rows, "section");
  const topicGroups = buildGroups(rows, "topic");
  const latestStudents = latestPerStudent(rows, (row) => row.classId);
  const weakCount = latestStudents.filter((row) => row.understandingLevel !== "understood").length;
  const weakPercent = latestStudents.length ? Math.round(weakCount / latestStudents.length * 100) : 0;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap gap-2"><Badge tone="assess">Statystyka obowiązkowa</Badge><Badge tone="brand">Samoocena uczniów</Badge></div>
        <h1 className="text-3xl font-black text-slate-950">Zrozumienie tematów</h1>
        <p className="max-w-3xl text-sm text-slate-600">Najnowsza odpowiedź każdego ucznia jest liczona osobno dla klasy, działu i tematu. Żółta oraz pomarańczowa odpowiedź oznaczają potrzebę powtórki.</p>
      </header>

      <Card className="space-y-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Klasa</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/nauczyciel/postepy/zrozumienie?classId=all" className={`rounded-full px-4 py-2 text-sm font-bold ${!selectedClassId ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-700"}`}>Wszystkie klasy</Link>
          {context.classes.map((teacherClass) => <Link key={teacherClass.id} href={`/nauczyciel/postepy/zrozumienie?classId=${teacherClass.id}`} className={`rounded-full px-4 py-2 text-sm font-bold ${selectedClassId === teacherClass.id ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-700"}`}>{teacherClass.name} {teacherClass.groupName}</Link>)}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center"><strong className="text-4xl text-slate-950">{latestStudents.length}</strong><p className="mt-1 text-sm text-slate-600">uczniów z samooceną</p></Card>
        <Card className="text-center"><strong className="text-4xl text-orange-700">{weakCount}</strong><p className="mt-1 text-sm text-slate-600">zgłasza trudność</p></Card>
        <Card className="bg-indigo-700 text-center text-white"><strong className="text-4xl">{weakPercent}%</strong><p className="mt-1 text-sm text-indigo-100">warto objąć powtórką</p></Card>
      </div>

      <section className="space-y-3"><div><h2 className="text-2xl font-black text-slate-950">Według działów</h2><p className="text-sm text-slate-600">Najnowsza samoocena każdego ucznia w danym dziale.</p></div><GroupList groups={sectionGroups} emptyText="Brak samoocen dla wybranej klasy." /></section>
      <section className="space-y-3"><div><h2 className="text-2xl font-black text-slate-950">Według tematów</h2><p className="text-sm text-slate-600">Tu najszybciej znajdziesz konkretny temat wymagający powtórki.</p></div><GroupList groups={topicGroups} emptyText="Brak samoocen tematów dla wybranej klasy." /></section>

      {rows.length > 0 ? <Card className="space-y-3"><h2 className="text-lg font-black text-slate-950">Ostatnie odpowiedzi</h2><div className="divide-y divide-slate-100">{rows.slice(0, 30).map((row) => <div key={row.checkId} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><div><strong className="text-slate-950">{row.displayName}</strong><p className="text-xs text-slate-500">{row.lessonTitle} · {row.sourceType === "live" ? "lekcja live" : "powtórka samodzielna"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${row.understandingLevel === "understood" ? "bg-emerald-100 text-emerald-900" : row.understandingLevel === "partial" ? "bg-yellow-100 text-yellow-950" : "bg-orange-100 text-orange-950"}`}>{LEVEL_LABELS[row.understandingLevel]}</span></div>)}</div></Card> : null}
    </div>
  );
}
