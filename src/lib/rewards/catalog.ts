export interface StickerDefinition {
  id: number;
  collectionId: number;
  collectionName: string;
  name: string;
  emoji: string;
  accent: string;
  sparkle: string;
}

export const STICKERS_PER_COLLECTION = 20;

export const STICKER_COLLECTIONS = [
  { name: "Brygada Bobrów", slug: "beavers", filePrefix: "beaver", icon: "🦫" },
  { name: "Absurdalne memy", slug: "brainrot", filePrefix: "brainrot", icon: "🤪" },
  { name: "Kocie Liczydła", slug: "cats", filePrefix: "cat", icon: "🐱" },
] as const;

const ADJECTIVES = ["Błyskawiczny", "Wesoły", "Kosmiczny", "Sprytny", "Odważny", "Tęczowy", "Złoty", "Skoczny", "Super", "Tajemniczy"];
const ACCENTS = ["#06b6d4", "#8b5cf6", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#84cc16", "#f97316", "#6366f1"];

export const STICKER_COUNT = STICKER_COLLECTIONS.length * STICKERS_PER_COLLECTION;

export function getStickerImage(stickerId: number) {
  const id = Math.max(0, Math.min(STICKER_COUNT - 1, Math.trunc(stickerId)));
  const collectionId = Math.floor(id / STICKERS_PER_COLLECTION);
  const local = id % STICKERS_PER_COLLECTION;
  const collection = STICKER_COLLECTIONS[collectionId]!;
  return `/rewards/stickers/${collection.slug}/${collection.filePrefix}-${String(local + 1).padStart(2, "0")}.png`;
}

export function getSticker(stickerId: number): StickerDefinition {
  const id = Math.max(0, Math.min(STICKER_COUNT - 1, Math.trunc(stickerId)));
  const collectionId = Math.floor(id / STICKERS_PER_COLLECTION);
  const local = id % STICKERS_PER_COLLECTION;
  const adjective = ADJECTIVES[local % ADJECTIVES.length]!;
  const collection = STICKER_COLLECTIONS[collectionId]!;
  return {
    id,
    collectionId,
    collectionName: collection.name,
    name: `${adjective} ${collection.icon} · ${collection.name} ${local + 1}`,
    emoji: collection.icon,
    accent: ACCENTS[(local + collectionId * 3) % ACCENTS.length]!,
    sparkle: ACCENTS[(local * 7 + collectionId + 4) % ACCENTS.length]!,
  };
}

export function getStickerCatalog() {
  return Array.from({ length: STICKER_COUNT }, (_, id) => getSticker(id));
}

export const REWARD_THEMES = [
  { id: "sky", name: "Błękitna Przygoda", points: 0, colors: "from-cyan-400 via-sky-500 to-indigo-600", emoji: "☁️" },
  { id: "forest", name: "Leśna Kryjówka", points: 100, colors: "from-lime-400 via-emerald-500 to-teal-700", emoji: "🌲" },
  { id: "sunset", name: "Zachód Słońca", points: 250, colors: "from-amber-400 via-orange-500 to-fuchsia-600", emoji: "🌅" },
  { id: "space", name: "Kosmiczna Misja", points: 1000, colors: "from-slate-950 via-indigo-950 to-violet-700", emoji: "🪐" },
  { id: "aurum", name: "Złote Aurum", points: 5000, colors: "from-yellow-300 via-amber-500 to-orange-800", emoji: "👑" },
] as const;

export const AVATAR_FRAMES = [
  { id: "frame-0", name: "Startowa", points: 0, className: "ring-8 ring-white shadow-xl" },
  { id: "frame-1", name: "Miętowa", points: 50, className: "ring-8 ring-emerald-300 shadow-[0_0_28px_#6ee7b7]" },
  { id: "frame-2", name: "Błękitna", points: 100, className: "ring-8 ring-cyan-300 shadow-[0_0_30px_#67e8f9]" },
  { id: "frame-3", name: "Fioletowy błysk", points: 175, className: "ring-8 ring-violet-400 shadow-[0_0_32px_#a78bfa]" },
  { id: "frame-4", name: "Zachód słońca", points: 250, className: "ring-8 ring-orange-400 shadow-[0_0_34px_#fb7185]" },
  { id: "frame-5", name: "Leśny liść", points: 400, className: "ring-[10px] ring-lime-400 shadow-[0_0_35px_#84cc16]" },
  { id: "frame-6", name: "Kocie łapki", points: 600, className: "ring-[10px] ring-pink-400 shadow-[0_0_36px_#f472b6]" },
  { id: "frame-7", name: "Bobrowa tama", points: 850, className: "ring-[10px] ring-amber-600 shadow-[0_0_38px_#d97706]" },
  { id: "frame-8", name: "Galaktyka", points: 1200, className: "ring-[11px] ring-indigo-500 shadow-[0_0_42px_#6366f1]" },
  { id: "frame-9", name: "Tęczowa", points: 1700, className: "ring-[11px] ring-fuchsia-400 shadow-[0_0_45px_#22d3ee]" },
  { id: "frame-10", name: "Srebrna", points: 2300, className: "ring-[12px] ring-slate-300 shadow-[0_0_45px_#cbd5e1]" },
  { id: "frame-11", name: "Ognista", points: 3000, className: "ring-[12px] ring-red-500 shadow-[0_0_48px_#f97316]" },
  { id: "frame-12", name: "Diamentowa", points: 4000, className: "ring-[13px] ring-cyan-100 shadow-[0_0_52px_#a5f3fc]" },
  { id: "frame-13", name: "Mistrzowska", points: 5500, className: "ring-[13px] ring-yellow-300 shadow-[0_0_55px_#fde047]" },
  { id: "frame-14", name: "Legendarna korona", points: 7500, className: "ring-[14px] ring-amber-300 shadow-[0_0_65px_#f59e0b]" },
] as const;

export const STICKER_MISSIONS = [
  "Rozwiąż poprawnie zadanie z powtórki materiału klasy IV.",
  "Rozwiąż poprawnie zadanie z działu Liczby i działania.",
  "Rozwiąż poprawnie zadanie z działu Podzielność liczb.",
  "Rozwiąż poprawnie zadanie z działu Ułamki.",
  "Rozwiąż poprawnie zadanie z działu Geometria.",
  "Rozwiąż poprawnie zadanie dotyczące jednostek i pomiarów.",
  "Rozwiąż poprawnie zadanie z danymi, tabelą lub wykresem.",
  "Zdobądź punkty w pracy lub sprawdzianie od nauczyciela.",
  "Wykonaj samodzielną powtórkę w domu i zapisz wynik.",
  "Wykonaj pracę domową oznaczoną jako misja domowa.",
] as const;

export function achievementPresentation(id: string) {
  const map: Record<string, { title: string; emoji: string; color: string }> = {
    "click-100": { title: "Brązowy Klikacz", emoji: "🥉", color: "from-amber-500 to-orange-800" },
    "click-1000": { title: "Srebrny Klikacz", emoji: "🥈", color: "from-slate-300 to-slate-600" },
    "click-10000": { title: "Złoty Klikacz", emoji: "🥇", color: "from-yellow-300 to-amber-600" },
    "points-250": { title: "250 punktów", emoji: "🌅", color: "from-orange-400 to-fuchsia-600" },
    "points-1000": { title: "1000 punktów", emoji: "🪐", color: "from-indigo-600 to-violet-900" },
    "points-5000": { title: "Legenda LekcjaLab", emoji: "👑", color: "from-yellow-300 to-orange-600" },
    "home-review-first": { title: "Domowy Odkrywca", emoji: "🏠", color: "from-emerald-400 to-cyan-700" },
    "homework-first": { title: "Pierwsza misja domowa", emoji: "🎒", color: "from-pink-500 to-violet-700" },
    "lesson-review-first": { title: "Samodzielny Powtórkowicz", emoji: "📚", color: "from-cyan-500 to-indigo-700" },
  };
  if (id.startsWith("section-")) {
    const section = id.slice(8);
    return { title: section === "0" ? "Pamiętam klasę IV!" : `Odznaka działu ${section}`, emoji: section === "0" ? "🧠" : "🛡️", color: "from-cyan-400 to-indigo-700" };
  }
  return map[id] ?? { title: "Specjalne osiągnięcie", emoji: "🏅", color: "from-cyan-500 to-indigo-700" };
}
