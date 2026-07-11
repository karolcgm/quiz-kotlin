import Link from "next/link";
import { AnimatedSticker } from "@/components/rewards/AnimatedSticker";
import { AvatarFrame } from "@/components/rewards/AvatarFrame";
import { Card } from "@/components/ui/Card";
import { selectStudentAvatarFrameAction, selectStudentCosmeticsAction } from "@/lib/actions/rewards";
import { requireRole } from "@/lib/auth/session";
import {
  achievementPresentation,
  AVATAR_FRAMES,
  getSticker,
  getStickerCatalog,
  REWARD_THEMES,
  STICKER_COUNT,
  STICKER_MISSIONS,
  STICKERS_PER_COLLECTION,
} from "@/lib/rewards/catalog";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StickerAlbumPage({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const student = await requireRole("student");
  const query = await searchParams;
  const collectionCount = Math.ceil(STICKER_COUNT / STICKERS_PER_COLLECTION);
  const collectionId = Math.max(0, Math.min(collectionCount - 1, Number(query.collection ?? 0) || 0));
  const supabase = await createClient();
  const [{ data: profile }, { data: stickerRows }, { data: achievements }] = await Promise.all([
    supabase.from("student_reward_profiles").select("total_points, click_count, featured_sticker_id, theme_id, avatar_frame_id").eq("student_id", student.id).maybeSingle(),
    supabase.from("student_stickers").select("sticker_id, earned_at").eq("student_id", student.id).order("earned_at", { ascending: false }),
    supabase.from("student_achievements").select("achievement_id, tier, earned_at").eq("student_id", student.id).order("earned_at", { ascending: false }),
  ]);
  const earned = new Set((stickerRows ?? []).map((row) => Number(row.sticker_id)).filter((id) => id >= 0 && id < STICKER_COUNT));
  const totalPoints = Number(profile?.total_points ?? 0);
  const storedFeatured = profile?.featured_sticker_id == null ? null : Number(profile.featured_sticker_id);
  const newestSticker = Array.from(earned)[0] ?? null;
  const featured = storedFeatured != null && earned.has(storedFeatured) ? storedFeatured : newestSticker;
  const catalog = getStickerCatalog();
  const collection = catalog.filter((item) => item.collectionId === collectionId);
  const collectionNames = Array.from({ length: collectionCount }, (_, id) => getSticker(id * STICKERS_PER_COLLECTION).collectionName);

  return <div className="space-y-6 pb-10">
    <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-fuchsia-600 via-indigo-700 to-cyan-500 p-6 text-white shadow-2xl sm:p-9">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_320px]">
        <div>
          <p className="text-sm font-black uppercase tracking-[.2em] text-cyan-100">Mój klaser</p>
          <h1 className="mt-2 text-4xl font-black sm:text-6xl">{STICKER_COUNT} naklejek w wyjątkowych seriach</h1>
          <p className="mt-4 max-w-2xl text-lg text-indigo-100">Naklejkę otrzymasz od nauczyciela albo jednorazowo za 100% całego tematu lub pracy domowej. Jej wygląd pozostaje tajemnicą do chwili zdobycia.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-white px-4 py-2 font-black text-indigo-800">⭐ {totalPoints.toLocaleString("pl-PL")} punktów</span>
            <span className="rounded-full bg-slate-950/40 px-4 py-2 font-black">🎟️ {earned.size}/{STICKER_COUNT}</span>
            <span className="rounded-full bg-slate-950/40 px-4 py-2 font-black">🖱️ {Number(profile?.click_count ?? 0).toLocaleString("pl-PL")} kliknięć</span>
          </div>
        </div>
        <div className="mx-auto">{featured !== null
          ? <AvatarFrame frameId={profile?.avatar_frame_id}><AnimatedSticker stickerId={featured} size="xl" /></AvatarFrame>
          : <div className="grid h-[300px] w-[300px] place-items-center rounded-[30%] border-4 border-dashed border-white/50 bg-white/10 text-center font-black">Zdobądź pierwszą<br/>naklejkę!</div>}
        </div>
      </div>
    </section>

    <Card className="overflow-x-auto">
      <div className="flex min-w-max gap-2">{collectionNames.map((name, id) => {
        const count = Array.from(earned).filter((stickerId) => Math.floor(stickerId / STICKERS_PER_COLLECTION) === id).length;
        return <Link key={name} href={`/uczen/klaser?collection=${id}`} className={`rounded-2xl px-4 py-3 text-sm font-black ${id === collectionId ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>{name} <span className="ml-1 opacity-70">{count}/{STICKERS_PER_COLLECTION}</span></Link>;
      })}</div>
    </Card>

    <section>
      <h2 className="text-2xl font-black text-slate-950">{collectionNames[collectionId]}</h2>
      <p className="mt-1 text-sm text-slate-600">Każda seria zawiera {STICKERS_PER_COLLECTION} unikatowych, osobno wygenerowanych naklejek.</p>
      <Card className="mt-4 border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-cyan-50">
        <div className="flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-950 text-3xl">🎁</div><div>
          <p className="text-xs font-black uppercase tracking-wide text-fuchsia-700">Jak zdobyć kolejną?</p>
          <p className="mt-1 font-black text-slate-950">{STICKER_MISSIONS[collectionId]}</p>
          <p className="mt-1 text-xs text-slate-600">Wygląd pozostaje tajemnicą do chwili zdobycia. Masz {collection.filter((item) => earned.has(item.id)).length}/{STICKERS_PER_COLLECTION} w tej serii.</p>
        </div></div>
      </Card>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{collection.map((sticker) => {
        const unlocked = earned.has(sticker.id);
        return <Card key={sticker.id} id={`sticker-${sticker.id}`} className={`scroll-mt-24 text-center transition target:scale-[1.03] target:ring-4 target:ring-yellow-400 ${unlocked ? "bg-white" : "bg-slate-100 opacity-55 target:opacity-100"}`}>
          <div className="mx-auto w-fit">{unlocked ? <AnimatedSticker stickerId={sticker.id} size="sm" selected={featured === sticker.id} /> : <div className="grid h-20 w-20 place-items-center rounded-[30%] bg-slate-300 text-3xl grayscale">🔒</div>}</div>
          <p className="mt-2 min-h-10 text-xs font-black text-slate-800">{unlocked ? sticker.name : "Tajemnicza naklejka"}</p>
          {unlocked ? <form action={selectStudentCosmeticsAction}><input type="hidden" name="stickerId" value={sticker.id}/><button className="mt-2 min-h-10 w-full rounded-xl bg-indigo-600 px-2 text-xs font-black text-white">{featured === sticker.id ? "Wybrana" : "Pokaż na profilu"}</button></form> : null}
        </Card>;
      })}</div>
    </section>

    <section>
      <h2 className="text-2xl font-black text-slate-950">Ramki avatara</h2>
      <p className="mt-1 text-sm text-slate-600">15 ramek odblokowuje się wraz z łączną liczbą punktów.</p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{AVATAR_FRAMES.map((frame) => {
        const unlocked = totalPoints >= frame.points;
        return <Card key={frame.id} className={`text-center ${unlocked ? "bg-white" : "bg-slate-100 opacity-60"}`}>
          <div className="mx-auto grid h-24 w-24 place-items-center"><AvatarFrame frameId={frame.id} size="sm"><div className="grid h-20 w-20 place-items-center rounded-[30%] bg-gradient-to-br from-cyan-300 to-indigo-600 text-4xl">🙂</div></AvatarFrame></div>
          <p className="mt-3 text-sm font-black text-slate-900">{frame.name}</p><p className="text-xs text-slate-500">{frame.points} pkt</p>
          <form action={selectStudentAvatarFrameAction}><input type="hidden" name="frameId" value={frame.id}/><button disabled={!unlocked} className="mt-2 min-h-10 w-full rounded-xl bg-fuchsia-600 px-2 text-xs font-black text-white disabled:bg-slate-300 disabled:text-slate-600">{unlocked ? profile?.avatar_frame_id === frame.id ? "Wybrana" : "Wybierz ramkę" : `Brakuje ${frame.points - totalPoints} pkt`}</button></form>
        </Card>;
      })}</div>
    </section>

    <section>
      <h2 className="text-2xl font-black text-slate-950">Tła i zestawy kolorów</h2>
      <p className="mt-1 text-sm text-slate-600">Zmieniają cały panel ucznia. Odblokujesz je dzięki punktowym osiągnięciom.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-5">{REWARD_THEMES.map((theme) => {
        const unlocked = totalPoints >= theme.points;
        return <form action={selectStudentCosmeticsAction} key={theme.id} className={`overflow-hidden rounded-3xl border-4 bg-white ${profile?.theme_id === theme.id ? "border-yellow-300 shadow-xl" : "border-white"}`}>
          <input type="hidden" name="themeId" value={theme.id}/>
          <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(/rewards/themes/${theme.id}.jpg)` }} />
          <div className={`bg-gradient-to-br ${theme.colors} p-4 text-center text-white`}><div className="text-4xl">{theme.emoji}</div><p className="mt-1 font-black">{theme.name}</p><p className="text-xs">{theme.points} pkt</p>
            <button disabled={!unlocked} className="mt-3 min-h-10 w-full rounded-xl bg-white px-2 text-xs font-black text-slate-950 disabled:bg-slate-600 disabled:text-slate-300">{unlocked ? profile?.theme_id === theme.id ? "Aktywny" : "Wybierz" : `Brakuje ${theme.points - totalPoints} pkt`}</button>
          </div>
        </form>;
      })}</div>
    </section>

    <section><h2 className="text-2xl font-black text-slate-950">Osiągnięcia</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(achievements ?? []).map((row) => {
      const info = achievementPresentation(row.achievement_id);
      return <Card key={row.achievement_id} className="flex items-center gap-4"><span className="text-5xl">{info.emoji}</span><div><p className="font-black text-slate-950">{info.title}</p><p className="text-xs uppercase text-slate-500">ranga {row.tier}</p></div></Card>;
    })}{(achievements ?? []).length === 0 ? <Card>Zacznij rozwiązywać zadania — pierwsze osiągnięcie jest blisko!</Card> : null}</div></section>
  </div>;
}
