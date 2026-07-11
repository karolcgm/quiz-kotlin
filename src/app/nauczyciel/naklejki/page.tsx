import Link from "next/link";
import Image from "next/image";
import { AnimatedSticker } from "@/components/rewards/AnimatedSticker";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { getSticker, getStickerCatalog, STICKER_COUNT, STICKERS_PER_COLLECTION } from "@/lib/rewards/catalog";

export const dynamic = "force-dynamic";

export default async function TeacherStickerPreviewPage({ searchParams }: { searchParams: Promise<{ collection?: string; batch?: string }> }) {
  await requireRole("teacher");
  const query = await searchParams;
  const beaverBatch = query.batch === "beavers";
  if (beaverBatch) {
    const beavers = Array.from({ length: 20 }, (_, index) => index + 1);
    return <div className="space-y-6 pb-10"><section className="rounded-[2rem] bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-7 text-white"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-100">Podgląd nauczyciela · nowy batch</p><h1 className="mt-2 text-4xl font-black">Brygada Bobrów · 20 osobnych naklejek</h1><p className="mt-2 max-w-3xl text-amber-50">Każda grafika została wygenerowana osobno i zapisana jako natywny plik PNG 300 × 300. Ten podgląd nie jest dostępny dla ucznia.</p></section><Link href="/nauczyciel/naklejki" className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">← Wróć do poprzedniego katalogu</Link><section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{beavers.map((number) => <Card key={number} className="text-center"><Image src={`/rewards/stickers/beavers/beaver-${String(number).padStart(2, "0")}.png`} alt={`Naklejka bobra ${number}`} width={300} height={300} className="mx-auto aspect-square w-full rounded-2xl object-cover"/><p className="mt-2 text-xs font-black text-slate-700">Bóbr #{number}</p></Card>)}</section></div>;
  }
  const collectionId = Math.max(0, Math.min(Math.ceil(STICKER_COUNT / STICKERS_PER_COLLECTION) - 1, Number(query.collection ?? 0) || 0));
  const collectionNames = Array.from({ length: Math.ceil(STICKER_COUNT / STICKERS_PER_COLLECTION) }, (_, id) => getSticker(id * STICKERS_PER_COLLECTION).collectionName);
  const stickers = getStickerCatalog().filter((sticker) => sticker.collectionId === collectionId);
  return <div className="space-y-6 pb-10"><section className="rounded-[2rem] bg-gradient-to-br from-fuchsia-600 via-indigo-700 to-cyan-500 p-7 text-white"><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Podgląd nauczyciela</p><h1 className="mt-2 text-4xl font-black">Prawdziwe grafiki naklejek</h1><p className="mt-2 max-w-3xl text-indigo-100">Ten ekran nie jest dostępny dla ucznia. Tutaj możesz sprawdzić wszystkie bitmapowe ilustracje, zanim zostaną odkryte w klaserze.</p></section><Card className="overflow-x-auto"><div className="flex min-w-max gap-2">{collectionNames.map((name, id) => <Link key={name} href={`/nauczyciel/naklejki?collection=${id}`} className={`rounded-xl px-4 py-3 text-sm font-black ${id === collectionId ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>{name}</Link>)}</div></Card><section><h2 className="text-2xl font-black text-slate-950">{collectionNames[collectionId]} · 100 grafik</h2><div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8">{stickers.map((sticker) => <Card key={sticker.id} className="text-center"><div className="mx-auto w-fit"><AnimatedSticker stickerId={sticker.id} size="sm" /></div><p className="mt-2 text-[10px] font-black text-slate-700">#{sticker.id + 1}</p></Card>)}</div></section></div>;
}
