import Link from "next/link";
import { AnimatedSticker } from "@/components/rewards/AnimatedSticker";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { getSticker, getStickerCatalog, STICKER_COUNT, STICKERS_PER_COLLECTION } from "@/lib/rewards/catalog";

export const dynamic = "force-dynamic";

export default async function TeacherStickerPreviewPage({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  await requireRole("teacher");
  const query = await searchParams;
  const collectionCount = Math.ceil(STICKER_COUNT / STICKERS_PER_COLLECTION);
  const collectionId = Math.max(0, Math.min(collectionCount - 1, Number(query.collection ?? 0) || 0));
  const premiumCollection = collectionId === 3;
  const collectionNames = Array.from({ length: collectionCount }, (_, id) => getSticker(id * STICKERS_PER_COLLECTION).collectionName);
  const stickers = getStickerCatalog().filter((sticker) => sticker.collectionId === collectionId);

  return <div className="space-y-6 pb-10">
    <section className={`rounded-[2rem] p-7 text-white ${premiumCollection ? "bg-gradient-to-br from-amber-500 via-teal-700 to-slate-950" : "bg-gradient-to-br from-fuchsia-600 via-indigo-700 to-cyan-500"}`}>
      <p className={`text-xs font-black uppercase tracking-[.2em] ${premiumCollection ? "text-amber-100" : "text-cyan-100"}`}>Podgląd nauczyciela</p>
      <h1 className="mt-2 text-4xl font-black">{premiumCollection ? "Legendarne Chrupki · kolekcja premium" : "Prawdziwe grafiki naklejek"}</h1>
      <p className="mt-2 max-w-3xl text-white/85">{premiumCollection ? "20 rzadkich wariantów oficjalnego bohatera LekcjaLab. Uczeń może je zdobyć tylko za ukończenie całego działu albo jako specjalną nagrodę od nauczyciela." : "Tutaj możesz sprawdzić bitmapowe ilustracje, zanim zostaną odkryte w klaserze ucznia."}</p>
    </section>

    <Card className="overflow-x-auto"><div className="flex min-w-max gap-2">{collectionNames.map((name, id) => <Link key={name} href={`/nauczyciel/naklejki?collection=${id}`} className={`rounded-xl px-4 py-3 text-sm font-black ${id === collectionId ? id === 3 ? "bg-amber-400 text-slate-950" : "bg-indigo-600 text-white" : id === 3 ? "bg-amber-50 text-amber-900" : "bg-slate-100 text-slate-700"}`}>{id === 3 ? "✨ " : ""}{name}</Link>)}</div></Card>

    <section>
      <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-black text-slate-950">{collectionNames[collectionId]} · 20 grafik</h2>{premiumCollection ? <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950">ID 61–80 · Rzadka</span> : null}</div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">{stickers.map((sticker) => <Card key={sticker.id} className={`text-center ${premiumCollection ? "border-amber-200 bg-gradient-to-b from-amber-50 to-white" : ""}`}><div className="mx-auto w-fit"><AnimatedSticker stickerId={sticker.id} size="sm" /></div><p className="mt-2 text-xs font-black text-slate-800">{sticker.name}</p><p className="mt-1 text-[10px] font-black text-slate-500">#{sticker.id + 1}</p></Card>)}</div>
    </section>
  </div>;
}
