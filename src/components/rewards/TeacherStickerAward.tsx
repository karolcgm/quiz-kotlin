"use client";

import { useState, useTransition } from "react";
import { awardStudentStickerAction } from "@/lib/actions/rewards";
import { STICKER_COLLECTIONS } from "@/lib/rewards/catalog";

export function TeacherStickerAward({
  studentId,
  studentName,
  sessionId,
  defaultReason = "Za zaangażowanie i pracę na lekcji",
  compact = false,
}: {
  studentId: string;
  studentName: string;
  sessionId?: string;
  defaultReason?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(defaultReason);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const award = (collectionId: number, collectionName: string) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await awardStudentStickerAction({ studentId, collectionId, reason, sessionId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(`Przyznano losową naklejkę z kolekcji „${collectionName}”. Uczeń zobaczy popup.`);
      setOpen(false);
    });
  };

  return <div className={compact ? "" : "min-w-[190px]"}>
    <button type="button" onClick={() => { setOpen(true); setError(null); setSuccess(null); }} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-fuchsia-600 px-3 text-xs font-black text-white shadow-sm hover:bg-fuchsia-700">
      🎁 Przyznaj naklejkę
    </button>
    {success ? <p className="mt-2 max-w-xs text-xs font-bold text-emerald-700" role="status">{success}</p> : null}
    {open ? <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="w-full max-w-md rounded-[2rem] border-4 border-white bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby={`award-title-${studentId}`}>
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-fuchsia-600">Nagroda od nauczyciela</p><h2 id={`award-title-${studentId}`} className="mt-1 text-2xl font-black text-slate-950">Naklejka dla {studentName}</h2></div><button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xl font-black" aria-label="Zamknij">×</button></div>
        <p className="mt-3 text-sm text-slate-600">Wybierz serię. System przyzna losowy okaz, którego uczeń jeszcze nie posiada — wygląd pozostanie niespodzianką.</p>
        <label className="mt-5 block text-xs font-black uppercase tracking-wide text-slate-600" htmlFor={`award-reason-${studentId}`}>Za co przyznajesz?</label>
        <input id={`award-reason-${studentId}`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={120} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-950" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{STICKER_COLLECTIONS.map((collection, collectionId) => { const premium = "premium" in collection && collection.premium; return <button key={collection.slug} type="button" disabled={pending || reason.trim().length < 3} onClick={() => award(collectionId, collection.name)} className={`min-h-24 rounded-2xl bg-gradient-to-br p-3 text-center font-black text-slate-950 ring-1 disabled:opacity-40 ${premium ? "from-amber-100 via-yellow-50 to-cyan-100 ring-amber-300" : "from-indigo-50 to-fuchsia-100 ring-fuchsia-200"}`}><span className="block text-4xl" aria-hidden>{collection.icon}</span><span className="mt-2 block text-xs">{collection.name}</span>{premium ? <span className="mt-1 block text-[9px] font-black uppercase tracking-wider text-amber-700">Rzadka · tylko nauczyciel lub cały dział</span> : null}</button>; })}</div>
        {pending ? <p className="mt-3 text-center text-sm font-bold text-indigo-700">Losuję nieposiadaną naklejkę…</p> : null}
        {error ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800" role="alert">{error}</p> : null}
      </section>
    </div> : null}
  </div>;
}
