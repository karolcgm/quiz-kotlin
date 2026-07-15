import type { UnderstandingAssessmentResult, UnderstandingCriterionStatus } from "@/types/understanding";

const STATUS: Record<UnderstandingCriterionStatus, { label: string; icon: string; className: string }> = {
  mastered: { label: "opanowane", icon: "✓", className: "border-emerald-200 bg-emerald-50 text-emerald-950" },
  needs_work: { label: "do poprawy", icon: "↻", className: "border-amber-200 bg-amber-50 text-amber-950" },
  no_evidence: { label: "brak dowodu", icon: "—", className: "border-slate-200 bg-slate-50 text-slate-700" },
};

const SOURCE_LABELS = {
  live: "wynik z lekcji live",
  self_paced: "wynik z samodzielnej lekcji",
  paper_manual: "wynik papierowy wpisany przez nauczyciela",
} as const;

export function SkillAssessmentSummary({ assessment }: { assessment: UnderstandingAssessmentResult }) {
  return (
    <section className="space-y-4 rounded-[2rem] border border-indigo-100 bg-white p-5 sm:p-7" aria-labelledby="student-skill-assessment-title">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">Ocena umiejętności</p>
        <h2 id="student-skill-assessment-title" className="mt-2 text-2xl font-black text-slate-950">Ocena ucznia — co już potrafię?</h2>
        <p className="mt-2 text-sm font-bold text-slate-700">
          {assessment.maxScore > 0 ? `${assessment.score}/${assessment.maxScore} punkty` : "Brak wyniku ostatniej samodzielnej próby"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {assessment.source ? SOURCE_LABELS[assessment.source] : "Wynik zobaczysz po wykonaniu próby lub po wpisaniu pracy papierowej."}
        </p>
      </div>

      <ul className="space-y-2" aria-label="Status kryteriów sukcesu">
        {assessment.criteria.map((criterion) => {
          const status = STATUS[criterion.status];
          return (
            <li key={criterion.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${status.className}`}>
              <span className="font-bold">{criterion.label}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-black">
                <span aria-hidden>{status.icon}</span>{status.label}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <p className="rounded-xl bg-emerald-50 p-3 text-emerald-950">{assessment.correctFeedback}</p>
        <p className="rounded-xl bg-amber-50 p-3 text-amber-950">{assessment.improvementFeedback}</p>
        <p className="rounded-xl bg-indigo-50 p-3 text-indigo-950">{assessment.nextStep}</p>
      </div>
      <p className="text-center text-xs font-bold text-slate-500">Ten wynik jest prywatny. Nie jest porównywany z klasą.</p>
    </section>
  );
}
