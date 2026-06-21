import { requestRetakeAction } from "@/lib/actions/retakeRequests";

interface StudentRetakeRequestPanelProps {
  submissionId: string;
  assignmentId: string;
  retakeAllowed: boolean;
  canRequestRetake: boolean;
  pendingRequest: boolean;
}

export function StudentRetakeRequestPanel({
  submissionId,
  assignmentId,
  retakeAllowed,
  canRequestRetake,
  pendingRequest,
}: StudentRetakeRequestPanelProps) {
  if (retakeAllowed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-bold text-emerald-900">Poprawa odblokowana</p>
        <p className="mt-2 text-sm text-emerald-800">
          Możesz ponownie wykonać test. Nowy wynik zastąpi poprzedni.
        </p>
        <a
          href={`/uczen/testy/${assignmentId}`}
          className="mt-4 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          Rozpocznij poprawę testu
        </a>
      </div>
    );
  }

  if (pendingRequest) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-bold text-amber-950">Prośba wysłana</p>
        <p className="mt-2 text-sm text-amber-900">
          Nauczyciel otrzymał prośbę o poprawę. Poczekaj na decyzję.
        </p>
      </div>
    );
  }

  if (!canRequestRetake) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="font-semibold text-slate-800">Poprawa niedostępna</p>
        <p className="mt-2 text-sm text-slate-600">
          Masz jeszcze dostępne próby albo nauczyciel nie zezwolił na poprawę.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <p className="font-bold text-indigo-950">Poproś o poprawę</p>
      <p className="mt-2 text-sm text-indigo-900">
        Wykorzystałeś wszystkie próby. Możesz poprosić nauczyciela o ponowne wykonanie testu.
      </p>
      <form action={requestRetakeAction} className="mt-4 space-y-3">
        <input type="hidden" name="submissionId" value={submissionId} />
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-indigo-900">Wiadomość (opcjonalnie)</span>
          <textarea
            name="message"
            rows={3}
            placeholder="Np. chciałbym poprawić błędy z zadań tekstowych..."
            className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3"
          />
        </label>
        <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">
          Wyślij prośbę o poprawę
        </button>
      </form>
    </div>
  );
}
