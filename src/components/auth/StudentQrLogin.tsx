"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { IScannerControls } from "@zxing/browser";
import { extractStudentQrToken } from "@/lib/auth/studentQr";
import {
  studentQrLoginAction,
  type StudentQrLoginState,
} from "@/lib/actions/studentQr";

const initialState: StudentQrLoginState = { status: "idle", message: "" };

export function StudentQrLogin() {
  const [state, formAction, pending] = useActionState(studentQrLoginAction, initialState);
  const [qrPayload, setQrPayload] = useState("");
  const [scannerMessage, setScannerMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    const clearSensitiveState = () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      formRef.current?.reset();
      setQrPayload("");
      setScannerMessage("");
      setScanning(false);
    };
    window.addEventListener("pageshow", clearSensitiveState);
    return () => {
      window.removeEventListener("pageshow", clearSensitiveState);
      controlsRef.current?.stop();
    };
  }, []);

  function stopScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }

  function acceptPayload(value: string): boolean {
    if (!extractStudentQrToken(value)) {
      setScannerMessage("To nie jest kod logowania ucznia z LekcjaLab.");
      return false;
    }

    setQrPayload(value.trim());
    setScannerMessage("Kod odczytany. Teraz wpisz swój czterocyfrowy PIN.");
    stopScanner();
    return true;
  }

  async function startScanner() {
    stopScanner();
    setQrPayload("");
    setScannerMessage("");
    setScanning(true);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 250,
      });
      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        },
        videoRef.current ?? undefined,
        (result, error, controls) => {
          void error;
          if (result && acceptPayload(result.getText())) {
            controls.stop();
          }
        },
      );
      controlsRef.current = controls;
    } catch (error) {
      setScanning(false);
      setScannerMessage(
        error instanceof Error && error.name === "NotAllowedError"
          ? "Aparat jest zablokowany. Zezwól na jego użycie albo wczytaj zdjęcie kodu QR."
          : "Nie udało się uruchomić aparatu. Możesz wczytać zdjęcie kodu QR.",
      );
    }
  }

  async function readQrImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    stopScanner();
    setQrPayload("");
    setScannerMessage("Odczytuję kod ze zdjęcia…");
    const objectUrl = URL.createObjectURL(file);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const result = await new BrowserQRCodeReader().decodeFromImageUrl(objectUrl);
      acceptPayload(result.getText());
    } catch {
      setScannerMessage("Nie znalazłem poprawnego kodu QR na tym zdjęciu.");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function resetCode() {
    stopScanner();
    setQrPayload("");
    setScannerMessage("");
  }

  return (
    <div>
      <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-950">
        <p className="font-bold">Jak to działa?</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Zeskanuj kod QR ze swojego zeszytu lub tornistra.</li>
          <li>Wpisz czterocyfrowy PIN ustawiony w koncie ucznia.</li>
          <li>Po poprawnym sprawdzeniu od razu przejdziesz do panelu.</li>
        </ol>
      </div>

      {!qrPayload ? (
        <div className="mt-5 space-y-3">
          <div className="overflow-hidden rounded-2xl bg-slate-950">
            <video
              ref={videoRef}
              className={`aspect-[4/3] w-full object-cover ${scanning ? "block" : "hidden"}`}
              muted
              playsInline
              aria-label="Podgląd aparatu do skanowania kodu QR"
            />
            {!scanning ? (
              <div className="grid aspect-[4/3] place-items-center p-8 text-center text-white">
                <div>
                  <span className="text-5xl" aria-hidden="true">▣</span>
                  <p className="mt-3 font-bold">Kod QR powinien znaleźć się w ramce aparatu</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={scanning ? stopScanner : startScanner}
              className="min-h-12 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700"
            >
              {scanning ? "Zatrzymaj aparat" : "Uruchom aparat"}
            </button>
            <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center font-bold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50">
              Wczytaj zdjęcie QR
              <input type="file" accept="image/*" onChange={readQrImage} className="sr-only" />
            </label>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-emerald-950">✓ Kod QR odczytany</p>
              <p className="mt-1 text-sm text-emerald-800">Możesz teraz podać PIN.</p>
            </div>
            <button
              type="button"
              onClick={resetCode}
              className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-emerald-800 shadow-sm"
            >
              Skanuj ponownie
            </button>
          </div>
        </div>
      )}

      {scannerMessage ? (
        <p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm font-medium text-slate-700" aria-live="polite">
          {scannerMessage}
        </p>
      ) : null}

      <form ref={formRef} action={formAction} autoComplete="off" className="mt-5 space-y-3">
        <input type="hidden" name="qrPayload" value={qrPayload} />
        <div className="space-y-2">
          <label htmlFor="student-qr-pin" className="text-sm font-bold text-slate-700">
            Twój PIN
          </label>
          <input
            id="student-qr-pin"
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            pattern="[0-9]{4}"
            maxLength={4}
            required
            disabled={!qrPayload || pending}
            placeholder="••••"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl font-black tracking-[0.7em] disabled:bg-slate-100"
          />
        </div>

        {state.status === "error" ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!qrPayload || pending}
          className="min-h-12 w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending ? "Sprawdzam…" : "Zaloguj kodem QR"}
        </button>
      </form>
    </div>
  );
}
