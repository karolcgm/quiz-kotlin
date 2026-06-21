import { skillLabels } from "@/lib/grading/progress";

export interface ResultsStatsData {
  submissionCount: number;
  averagePercentage: number;
  averageMark: number | null;
  pendingRetakes: number;
  gradeDistribution: { mark: number; count: number }[];
  skills: {
    skill: string;
    label: string;
    percentage: number;
    score: number;
    maxScore: number;
  }[];
  weakSkills: string[];
}

interface ResultsStatsDashboardProps {
  stats: ResultsStatsData;
  scopeLabel: string;
}

function toneForPercentage(value: number): string {
  if (value >= 85) return "bg-emerald-500";
  if (value >= 60) return "bg-amber-400";
  return "bg-rose-500";
}

export function ResultsStatsDashboard({ stats, scopeLabel }: ResultsStatsDashboardProps) {
  const topSkills = stats.skills.slice(0, 4);
  const weakSkills = stats.skills.filter((skill) => skill.percentage < 60).slice(0, 4);

  return (
    <section className="overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-6 text-white shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
            Pulpit wyników
          </p>
          <h2 className="mt-2 text-2xl font-bold">{scopeLabel}</h2>
          <p className="mt-1 text-sm text-indigo-100">
            {stats.submissionCount} oddanych testów · {stats.pendingRetakes} próśb o poprawę
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Średni wynik" value={`${stats.averagePercentage}%`} accent="text-sky-200" />
          <StatTile
            label="Średnia ocena"
            value={stats.averageMark !== null ? stats.averageMark.toFixed(1) : "—"}
            accent="text-emerald-200"
          />
          <StatTile label="Testy" value={String(stats.submissionCount)} accent="text-violet-200" />
          <StatTile label="Do poprawy" value={String(stats.pendingRetakes)} accent="text-amber-200" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <h3 className="font-bold text-indigo-100">Rozkład ocen 1–6</h3>
          <div className="mt-4 space-y-2">
            {stats.gradeDistribution.map(({ mark, count }) => {
              const width =
                stats.submissionCount > 0 ? Math.round((count / stats.submissionCount) * 100) : 0;

              return (
                <div key={mark} className="grid grid-cols-[2rem_1fr_2rem] items-center gap-2 text-sm">
                  <span className="font-bold">{mark}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-indigo-400"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-right text-indigo-100">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <h3 className="font-bold text-indigo-100">Najmocniejsze działy</h3>
          <div className="mt-4 space-y-3">
            {topSkills.length === 0 && (
              <p className="text-sm text-indigo-200">Brak danych o umiejętnościach.</p>
            )}
            {topSkills.map((skill) => (
              <SkillBar key={skill.skill} label={skill.label} percentage={skill.percentage} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <h3 className="font-bold text-amber-100">Do poprawienia</h3>
          <div className="mt-4 space-y-3">
            {weakSkills.length === 0 && stats.weakSkills.length === 0 && (
              <p className="text-sm text-emerald-200">Brak wyraźnych słabych obszarów — super!</p>
            )}
            {weakSkills.map((skill) => (
              <SkillBar
                key={skill.skill}
                label={skill.label}
                percentage={skill.percentage}
                tone="weak"
              />
            ))}
            {stats.weakSkills.map((label) => (
              <p key={label} className="rounded-xl bg-amber-500/20 px-3 py-2 text-sm font-semibold text-amber-100">
                {label}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function SkillBar({
  label,
  percentage,
  tone = "strong",
}: {
  label: string;
  percentage: number;
  tone?: "strong" | "weak";
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold">{label}</span>
        <span className={tone === "weak" ? "text-amber-200" : "text-emerald-200"}>
          {percentage}%
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${tone === "weak" ? "bg-amber-400" : toneForPercentage(percentage)}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function buildResultsStats(input: {
  submissions: { id: string; percentage: number }[];
  marks: { submission_id: string; mark_1_6: number }[];
  answers: { skill: string; score: number; max_score: number }[];
  pendingRetakeSubmissionIds: Set<string>;
}): ResultsStatsData {
  const submissionCount = input.submissions.length;
  const averagePercentage =
    submissionCount > 0
      ? Math.round(
          input.submissions.reduce((sum, row) => sum + row.percentage, 0) / submissionCount,
        )
      : 0;

  const marks = input.marks.map((row) => row.mark_1_6);
  const averageMark =
    marks.length > 0
      ? Math.round((marks.reduce((sum, mark) => sum + mark, 0) / marks.length) * 10) / 10
      : null;

  const gradeDistribution = [6, 5, 4, 3, 2, 1].map((mark) => ({
    mark,
    count: marks.filter((value) => value === mark).length,
  }));

  const skillMap = new Map<string, { score: number; maxScore: number }>();
  for (const answer of input.answers) {
    const current = skillMap.get(answer.skill) ?? { score: 0, maxScore: 0 };
    current.score += Number(answer.score);
    current.maxScore += Number(answer.max_score);
    skillMap.set(answer.skill, current);
  }

  const skills = Array.from(skillMap.entries())
    .map(([skill, value]) => ({
      skill,
      label: skillLabels[skill as keyof typeof skillLabels] ?? skill,
      score: value.score,
      maxScore: value.maxScore,
      percentage:
        value.maxScore > 0 ? Math.round((value.score / value.maxScore) * 100) : 0,
    }))
    .sort((left, right) => right.percentage - left.percentage);

  const pendingRetakes = input.submissions.filter((row) =>
    input.pendingRetakeSubmissionIds.has(row.id),
  ).length;

  const weakSkills = skills
    .filter((skill) => skill.percentage < 60)
    .map((skill) => `${skill.label} (${skill.percentage}%)`);

  return {
    submissionCount,
    averagePercentage,
    averageMark,
    pendingRetakes,
    gradeDistribution,
    skills,
    weakSkills,
  };
}
