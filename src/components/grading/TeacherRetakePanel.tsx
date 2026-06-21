import { allowRetakeAction } from "@/lib/actions/grades";
import type { RetakeRequest } from "@/types/notification";

interface TeacherRetakePanelProps {
  submissionId: string;
  retakeAllowed: boolean;
  pendingRequests: RetakeRequest[];
}

export function TeacherRetakePanel({
  submissionId,
  retakeAllowed,
  pendingRequests,
}: TeacherRetakePanelProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-2xl font-bold text-slate-900">Poprawa testu</h2>

      {pendingRequests.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-bold text-amber-950">Prośby ucznia</p>
          {pendingRequests.map((request) => (
            <div key={request.id} className="rounded-xl bg-white p-4">
              <p className="text-sm text-slate-600">
                {new Intl.DateTimeFormat("pl-PL", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(request.createdAt))}
              </p>
              {request.message && (
                <p className="mt-2 text-slate-800">{request.message}</p>
              )}
              <form action={allowRetakeAction} className="mt-3">
                <input type="hidden" name="submissionId" value={submissionId} />
                <input type="hidden" name="requestId" value={request.id} />
                <button className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700">
                  POPRAW — zezwól na ponowny test
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={allowRetakeAction}>
        <input type="hidden" name="submissionId" value={submissionId} />
        <button
          disabled={retakeAllowed}
          className="w-full rounded-xl border border-emerald-300 bg-emerald-600 px-5 py-4 text-lg font-bold text-white hover:bg-emerald-700 disabled:border-emerald-200 disabled:bg-emerald-100 disabled:text-emerald-800"
        >
          {retakeAllowed ? "Poprawa już odblokowana" : "POPRAW — odblokuj ponowny test"}
        </button>
      </form>
      <p className="text-sm text-slate-600">
        Uczeń wykona test ponownie, a nowy wynik zastąpi poprzedni.
      </p>
    </div>
  );
}
