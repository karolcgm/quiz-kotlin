import Link from "next/link";
import { grades } from "@/data/grades";
import { Card } from "@/components/ui/Card";

export function GradeGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {grades.map((grade) => (
        <Link key={grade.id} href={`/klasy/${grade.id}`} className="group">
          <Card className="h-full transition group-hover:border-indigo-300 group-hover:shadow-md">
            <h3 className="text-xl font-bold text-slate-900">{grade.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{grade.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
