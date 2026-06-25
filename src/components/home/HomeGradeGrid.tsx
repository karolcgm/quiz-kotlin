import Link from "next/link";
import { grades } from "@/data/grades";

export function HomeGradeGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {grades.map((grade, index) => (
        <Link
          key={grade.id}
          href={`/klasy/${grade.id}`}
          className="home-card-reveal group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-indigo-100/0 blur-2xl transition duration-300 group-hover:bg-indigo-200/60" />
          <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
            SP
          </span>
          <h3 className="mt-3 text-xl font-black text-slate-900 transition group-hover:text-indigo-800">
            {grade.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{grade.description}</p>
          <p className="mt-4 text-sm font-bold text-indigo-600 opacity-0 transition group-hover:opacity-100">
            Zobacz symulacje →
          </p>
        </Link>
      ))}
    </div>
  );
}
