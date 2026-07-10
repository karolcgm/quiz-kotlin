import type { LessonPackage } from "@/types/lessonPackage";
import { LESSON_STAGE_KIND_LABELS } from "@/types/lessonPackage";
import { Card } from "@/components/ui/Card";

interface TeacherGuidePanelProps {
  lesson: LessonPackage;
  activeStageId?: string;
}

export function TeacherGuidePanel({ lesson, activeStageId }: TeacherGuidePanelProps) {
  const guide = lesson.teacherGuide;

  return (
    <div className="space-y-4">
      <Card muted className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Przewodnik nauczyciela</p>
        <p className="text-sm leading-relaxed text-slate-800">{guide.overview}</p>
        <p className="text-xs text-slate-600">{guide.timingNotes}</p>
      </Card>

      <Card className="space-y-2 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start lekcji</p>
        <p className="text-slate-700">{guide.openingScript}</p>
      </Card>

      <Card className="space-y-2 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Materiały</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          {guide.materials.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card muted className="space-y-2 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Typowe błędy</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          {guide.commonMisconceptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notatki etapów</p>
        <ul className="space-y-2 text-sm">
          {lesson.stages.map((stage) => {
            const note = guide.stageNotes[stage.id];
            if (!note) return null;
            const isActive = stage.id === activeStageId;
            return (
              <li
                key={stage.id}
                className={`rounded-lg border px-3 py-2 ${isActive ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}
              >
                <p className="text-xs font-bold text-slate-500">
                  {LESSON_STAGE_KIND_LABELS[stage.kind]} · {stage.title}
                </p>
                <p className="mt-1 text-slate-700">{note}</p>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="space-y-2 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bilet wyjścia — rubryka</p>
        <p className="text-slate-700">{guide.exitTicketRubric}</p>
      </Card>

      <Card muted className="space-y-2 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Karta bez urządzeń</p>
        <p className="text-slate-700">{guide.paperWithoutDevices}</p>
      </Card>

      <Card className="space-y-2 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Zakończenie</p>
        <p className="text-slate-700">{guide.closingScript}</p>
      </Card>
    </div>
  );
}
