import { allowRetakeAction, updateGradeAction } from "@/lib/actions/grades";

interface TeacherGradeEditorProps {
  submissionId: string;
  mark1To6: number;
  feedbackText: string;
  retakeAllowed: boolean;
}

export function TeacherGradeEditor({
  submissionId,
  mark1To6,
  feedbackText,
  retakeAllowed,
}: TeacherGradeEditorProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-2xl font-bold text-slate-900">Ręczna korekta nauczyciela</h2>
      <form action={updateGradeAction} className="space-y-4">
        <input type="hidden" name="submissionId" value={submissionId} />
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Ocena 1-6</span>
          <select
            name="mark1To6"
            defaultValue={mark1To6}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            {[1, 2, 3, 4, 5, 6].map((mark) => (
              <option key={mark} value={mark}>
                {mark}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Ocena opisowa</span>
          <textarea
            name="feedbackText"
            rows={6}
            defaultValue={feedbackText}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white">
          Zapisz korektę
        </button>
      </form>

      <form action={allowRetakeAction}>
        <input type="hidden" name="submissionId" value={submissionId} />
        <button
          disabled={retakeAllowed}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 font-semibold text-emerald-800 disabled:opacity-50"
        >
          {retakeAllowed ? "Poprawa już odblokowana" : "Odblokuj poprawę"}
        </button>
      </form>
    </div>
  );
}
