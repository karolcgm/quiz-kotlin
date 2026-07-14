"use client";

import { useEffect, useRef } from "react";
import { signInAction } from "@/lib/actions/auth";

type SharedDevicePasswordLoginProps = {
  nextPath?: string;
  error?: string;
};

/** Formularz do urządzeń współdzielonych — czyści pola także po użyciu „Wstecz”. */
export function SharedDevicePasswordLogin({ nextPath, error }: SharedDevicePasswordLoginProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const clearCredentials = () => formRef.current?.reset();
    clearCredentials();
    window.addEventListener("pageshow", clearCredentials);
    return () => window.removeEventListener("pageshow", clearCredentials);
  }, []);

  return (
    <>
      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <form ref={formRef} action={signInAction} autoComplete="off" className="mt-6 space-y-4">
        <input type="hidden" name="next" value={nextPath ?? ""} />
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Hasło
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </div>
        <button
          type="submit"
          className="min-h-12 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Zaloguj emailem
        </button>
      </form>
    </>
  );
}
