import { Card } from "@/components/ui/Card";
import type { SkillProgress } from "@/lib/grading/progress";

interface SkillProgressPanelProps {
  title: string;
  description: string;
  progress: SkillProgress[];
}

function toneForPercentage(percentage: number) {
  if (percentage >= 85) return "bg-emerald-500";
  if (percentage >= 60) return "bg-indigo-500";
  if (percentage >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export function SkillProgressPanel({ title, description, progress }: SkillProgressPanelProps) {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{description}</p>

      <div className="mt-6 space-y-4">
        {progress.length === 0 && (
          <p className="rounded-xl bg-slate-50 p-4 text-slate-600">
            Brakuje jeszcze danych. Postępy pojawią się po pierwszej klasówce albo szybkim teście.
          </p>
        )}

        {progress.map((skill) => (
          <div key={skill.skill} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">{skill.label}</h3>
                <p className="text-sm text-slate-600">
                  Razem: {skill.score}/{skill.maxScore} pkt · klasówki: {skill.classworkScore}/
                  {skill.classworkMaxScore} · ćwiczenia: {skill.practiceScore}/{skill.practiceMaxScore}
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 font-bold text-indigo-700">
                {skill.percentage}%
              </span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full ${toneForPercentage(skill.percentage)}`}
                style={{ width: `${Math.min(skill.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
