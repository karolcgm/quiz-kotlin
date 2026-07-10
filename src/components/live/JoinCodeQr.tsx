"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface JoinCodeQrProps {
  joinUrl: string;
  joinCode?: string | null;
  size?: number;
}

export function JoinCodeQr({ joinUrl, joinCode, size = 200 }: JoinCodeQrProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(joinUrl, {
      width: size,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [joinUrl, size]);

  return (
    <div className="flex flex-col items-center gap-4">
      {joinCode ? (
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Kod dołączenia</p>
          <p className="mt-2 font-mono text-5xl font-black tabular-nums tracking-[0.35em] text-white sm:text-6xl">
            {joinCode}
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl bg-white p-3 shadow-lg">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Kod QR do dołączenia do lekcji" width={size} height={size} />
        ) : (
          <div
            className="flex items-center justify-center bg-slate-100 text-sm text-slate-500"
            style={{ width: size, height: size }}
          >
            QR…
          </div>
        )}
      </div>

      <p className="max-w-xs text-center text-sm text-slate-400">
        Zeskanuj lub wejdź na stronę dołączenia i wpisz kod.
      </p>
    </div>
  );
}
