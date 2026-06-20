import Link from "next/link";
import { startTestAction } from "@/lib/actions/submissions";

interface StartTestPanelProps {
  assignmentId: string;
  title: string;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  completedAttempts: number;
  dueAt: string | null;
}

function formatDueAt(dueAt: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dueAt));
}

export function StartTestPanel({
  assignmentId,
  title,
  timeLimitMinutes,
  maxAttempts,
  completedAttempts,
  dueAt,
}: StartTestPanelProps) {
  const attemptsLeft = Math.max(0, maxAttempts - completedAttempts);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Przed startem</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
      </div>

      <ul className="space-y-2 text-sm text-slate-700">
        {timeLimitMinutes ? (
          <li>
            <strong>Limit czasu:</strong> {timeLimitMinutes} min — licznik startuje po kliknięciu
            „Rozpocznij test”.
          </li>
        ) : (
          <li>
            <strong>Limit czasu:</strong> brak — możesz pracować bez pośpiechu.
          </li>
        )}
        <li>
          <strong>Pozostałe próby:</strong> {attemptsLeft} z {maxAttempts}
        </li>
        {dueAt && (
          <li>
            <strong>Termin oddania:</strong> {formatDueAt(dueAt)}
          </li>
        )}
        <li>Test kończy się po kliknięciu „Koniec” albo automatycznie po upływie czasu.</li>
      </ul>

      <form action={startTestAction}>
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-700"
        >
          Rozpocznij test
        </button>
      </form>
    </div>
  );
}

interface CompletedTestPanelProps {
  assignmentId: string;
  title: string;
  latestSubmissionId: string;
  percentage: number;
  submittedAt: string | null;
  timedOut?: boolean;
  canRetry: boolean;
}

export function CompletedTestPanel({
  assignmentId,
  title,
  latestSubmissionId,
  percentage,
  submittedAt,
  timedOut = false,
  canRetry,
}: CompletedTestPanelProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Rozwiązano</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-lg font-semibold text-emerald-900">
          Wynik: {Math.round(percentage)}%
          {timedOut && " · czas minął, test oddany automatycznie"}
        </p>
        {submittedAt && (
          <p className="mt-1 text-sm text-slate-600">
            Oddano: {formatDueAt(submittedAt)}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/uczen/wyniki/${latestSubmissionId}`}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Zobacz wynik
        </Link>
        {canRetry && (
          <Link
            href={`/uczen/testy/${assignmentId}`}
            className="rounded-xl border border-emerald-300 bg-white px-5 py-3 font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            Ponów test
          </Link>
        )}
      </div>
    </div>
  );
}
