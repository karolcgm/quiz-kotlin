"use client";

import Link from "next/link";
import { deleteTestAction, publishTestAction } from "@/lib/actions/tests";

interface TestListActionsProps {
  testId: string;
  status: string;
}

export function TestListActions({ testId, status }: TestListActionsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link
        href={`/nauczyciel/testy/${testId}/rozwiaz`}
        className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-100"
      >
        Rozwiąż test
      </Link>
      <Link
        href={`/nauczyciel/testy/${testId}/edytuj`}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Edytuj
      </Link>
      {status !== "published" && (
        <form action={publishTestAction}>
          <input type="hidden" name="testId" value={testId} />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Opublikuj
          </button>
        </form>
      )}
      <form
        action={deleteTestAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              "Usunąć ten test? Jeśli był przypisany uczniom, przypisania też znikną.",
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="testId" value={testId} />
        <button
          type="submit"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Usuń
        </button>
      </form>
    </div>
  );
}
