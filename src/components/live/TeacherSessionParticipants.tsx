import type { LessonSessionParticipantRow } from "@/types/lessonSession";

const STATUS_LABELS: Record<LessonSessionParticipantRow["responseStatus"], string> = {
  waiting: "Czeka / pracuje",
  submitted: "Wysłano",
};

interface TeacherSessionParticipantsProps {
  participants: LessonSessionParticipantRow[];
  participantCount: number;
}

export function TeacherSessionParticipants({
  participants,
  participantCount,
}: TeacherSessionParticipantsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Uczestnicy</h3>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-800">
          {participantCount} online
        </span>
      </div>

      {participants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Nikt jeszcze nie dołączył. Kod i QR są na tablicy.
        </p>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {participants.map((participant) => (
            <li
              key={participant.participantId}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span className="truncate text-sm font-medium text-slate-900">{participant.displayName}</span>
              <div className="flex shrink-0 items-center gap-1">
                {participant.helpStatus === "requested" ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                    Pomoc
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    participant.responseStatus === "submitted"
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {STATUS_LABELS[participant.responseStatus]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
