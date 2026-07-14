"use client";

import { useActionState } from "react";
import {
  configureStudentQrAction,
  disableStudentQrAction,
  type StudentQrDisableState,
  type StudentQrSetupState,
} from "@/lib/actions/studentQr";

type StudentQrSettingsProps = {
  initialConfigured: boolean;
  configuredAt: string | null;
  lockedUntil: string | null;
};

const setupInitialState: StudentQrSetupState = { status: "idle", message: "" };
const disableInitialState: StudentQrDisableState = { status: "idle", message: "" };

export function StudentQrSettings({
  initialConfigured,
  configuredAt,
  lockedUntil,
}: StudentQrSettingsProps) {
  const [setupState, setupAction, setupPending] = useActionState(
    configureStudentQrAction,
    setupInitialState,
  );
  const [disableState, disableAction, disablePending] = useActionState(
    disableStudentQrAction,
    disableInitialState,
  );
  const setupChangedAt = setupState.status === "success" ? (setupState.changedAt ?? 0) : 0;
  const disabledChangedAt = disableState.status === "success" ? (disableState.changedAt ?? 0) : 0;
  const setupChanged = setupChangedAt > 0;
  const configured = Math.max(setupChangedAt, disabledChangedAt) > 0
    ? setupChangedAt > disabledChangedAt
    : initialConfigured;
  const setupSuccessIsCurrent = setupChangedAt > disabledChangedAt;
  const disableSuccessIsCurrent = disabledChangedAt > setupChangedAt;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-black uppercase tracking-wide text-indigo-700">Logowanie ucznia</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Mój kod QR i PIN</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Ustaw czterocyfrowy PIN, a potem pobierz swój unikalny kod QR. Możesz trzymać wydruk
          w zeszycie albo tornistrze i logować się bez wpisywania adresu e-mail.
        </p>

        <div className={`mt-5 rounded-2xl border p-4 ${configured ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <p className={`font-black ${configured ? "text-emerald-950" : "text-amber-950"}`}>
            {configured ? "✓ Logowanie QR jest aktywne" : "Logowanie QR nie jest jeszcze ustawione"}
          </p>
          {configuredAt && !setupChanged ? (
            <p className="mt-1 text-sm text-slate-600">
              Ostatnia zmiana: {new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(configuredAt))}
            </p>
          ) : null}
          {lockedUntil ? (
            <p className="mt-2 text-sm font-bold text-red-700">
              Logowanie jest chwilowo zablokowane po błędnych próbach. Wygenerowanie nowego kodu odblokuje je od razu.
            </p>
          ) : null}
        </div>

        <form action={setupAction} autoComplete="off" className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="qr-pin" className="text-sm font-bold text-slate-700">Nowy PIN</label>
              <input
                id="qr-pin"
                name="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                autoComplete="off"
                autoCorrect="off"
                data-1p-ignore="true"
                data-lpignore="true"
                data-bwignore="true"
                required
                placeholder="4 cyfry"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-xl font-black tracking-[0.45em]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="qr-pin-confirmation" className="text-sm font-bold text-slate-700">Powtórz PIN</label>
              <input
                id="qr-pin-confirmation"
                name="pinConfirmation"
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                autoComplete="off"
                autoCorrect="off"
                data-1p-ignore="true"
                data-lpignore="true"
                data-bwignore="true"
                required
                placeholder="4 cyfry"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-xl font-black tracking-[0.45em]"
              />
            </div>
          </div>

          <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
            Nowy kod automatycznie unieważni poprzedni. Nie zapisuj PIN-u na kartce obok kodu QR.
          </p>

          {setupState.message && (setupState.status === "error" || setupSuccessIsCurrent) ? (
            <p className={`rounded-xl p-3 text-sm font-bold ${setupState.status === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`} role={setupState.status === "error" ? "alert" : "status"}>
              {setupState.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={setupPending}
            className="min-h-12 w-full rounded-xl bg-indigo-600 px-5 py-3 font-black text-white transition hover:bg-indigo-700 disabled:bg-slate-300 sm:w-auto"
          >
            {setupPending ? "Tworzę kod…" : configured ? "Ustaw nowy PIN i wygeneruj nowy QR" : "Ustaw PIN i wygeneruj QR"}
          </button>
        </form>

        {disableSuccessIsCurrent ? (
          <p className="mt-6 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800" role="status">
            {disableState.message}
          </p>
        ) : null}

        {configured ? (
          <form action={disableAction} className="mt-6 border-t border-slate-200 pt-5">
            {disableState.message && disableState.status === "error" ? (
              <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">
                {disableState.message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={disablePending}
              className="rounded-xl border-2 border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              {disablePending ? "Wyłączam…" : "Wyłącz logowanie QR"}
            </button>
          </form>
        ) : null}
      </section>

      <aside className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-5 shadow-sm sm:p-6">
        {setupState.qrDataUrl && configured ? (
          <>
            <p className="text-sm font-black uppercase tracking-wide text-indigo-700">Twój nowy kod</p>
            <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              {/* Dane URL powstają na serwerze z właśnie wygenerowanego, losowego tokenu. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setupState.qrDataUrl} alt="Kod QR do logowania ucznia" className="aspect-square w-full" />
            </div>
            <a
              href={setupState.qrDataUrl}
              download={setupState.downloadName ?? "lekcjalab-uczen-qr.png"}
              className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-center font-black text-white transition hover:bg-emerald-700"
            >
              Pobierz kod QR
            </a>
            <p className="mt-3 text-sm font-medium text-slate-600">
              Pobierz go teraz. Ze względów bezpieczeństwa po odświeżeniu strony nie pokazujemy ponownie tego samego kodu.
            </p>
          </>
        ) : (
          <>
            <div className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-8 text-center">
              <div>
                <span className="text-6xl" aria-hidden="true">▦</span>
                <p className="mt-4 font-black text-slate-900">Tutaj pojawi się Twój kod QR</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <p><strong>1.</strong> Wymyśl cztery cyfry, które zapamiętasz.</p>
              <p><strong>2.</strong> Wygeneruj i pobierz kod.</p>
              <p><strong>3.</strong> Wydrukuj go lub zachowaj na bezpiecznym urządzeniu.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
