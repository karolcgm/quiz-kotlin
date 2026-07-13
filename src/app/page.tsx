import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSection, HomeSteps } from "@/components/home/HomeSections";
import { Card } from "@/components/ui/Card";

const TEACHER_BENEFITS = [
  { icon: "⚡", title: "Mniej przygotowań", text: "Wchodzisz w temat z gotową sekwencją slajdów, aktywności i krótkich sprawdzeń." },
  { icon: "🖥️", title: "Jedna lekcja, kilka ekranów", text: "Prowadzisz na tablicy, a uczniowie pracują na tabletach dokładnie wtedy, kiedy tego potrzebujesz." },
  { icon: "📈", title: "Wynik zamiast zgadywania", text: "Po lekcji widzisz odpowiedzi, postęp i miejsca, które warto powtórzyć." },
];

const STUDENT_BENEFITS = [
  "Konta uczniów są częścią pakietu nauczyciela — zapraszasz klasę jednym bezpiecznym linkiem.",
  "Uczeń wraca do poprawki we własnym tempie i nie traci rozpoczętej pracy.",
  "Nagrody, motywy i fanfary budują chęć do działania, a nie odciągają od lekcji.",
];

const EXPERIENCE_STEPS = [
  { number: "01", eyebrow: "Przed lekcją", title: "Wybierasz temat", text: "Otwierasz gotową sekwencję zgodną z programem, zamiast składać lekcję z przypadkowych plików.", color: "from-indigo-500 to-violet-600" },
  { number: "02", eyebrow: "W klasie", title: "Uczniowie działają", text: "Tablica prowadzi wspólną część, a tablety uruchamiają zadania dokładnie w odpowiednim momencie.", color: "from-cyan-500 to-teal-600" },
  { number: "03", eyebrow: "Po lekcji", title: "Widzisz, co poprawić", text: "Odpowiedzi, samoocena i wyniki pokazują braki, zanim zaczną przeszkadzać w kolejnych tematach.", color: "from-emerald-500 to-teal-700" },
];

export default function HomePage() {
  return (
    <main className="home-page mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <HomeHero />

      <HomeSection id="jak-dziala" title="Od wyjaśnienia do prawdziwego działania" description="Uczeń nie ogląda pobazgranej kartki. Ponownie rozwiązuje, wybiera, sprawdza i myśli." accent="emerald">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr] xl:items-stretch">
          <div className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-cyan-100 bg-slate-950 shadow-2xl shadow-cyan-900/15 sm:min-h-[470px]">
            <Image src="/materials/beaver-dam/v1/beaver-dam-game-scene-v1.png" alt="Chrupek nad rzeką podczas matematycznej misji budowania tamy" fill sizes="(min-width: 1280px) 62vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/5 to-transparent" />
            <span className="absolute left-5 top-5 rounded-full bg-cyan-300 px-4 py-2 text-[10px] font-black uppercase tracking-[.16em] text-cyan-950 shadow-lg sm:text-xs">Pierwsza misja animowana</span>
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-slate-950/75 p-5 text-white shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:max-w-md">
              <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-300">Chrupek i Tama Liczb</p>
              <h3 className="mt-1 text-2xl font-black sm:text-3xl">Dobra odpowiedź naprawdę buduje tamę.</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Pięć różnych rund, podpowiedzi po błędzie i żadnych zdublowanych działań w tej samej sesji.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {EXPERIENCE_STEPS.map((step) => <Card key={step.number} className="group relative overflow-hidden border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-xl"><div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${step.color}`} /><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-500">{step.eyebrow}</p><h3 className="mt-1 text-xl font-black text-slate-950">{step.title}</h3></div><span className={`bg-gradient-to-br bg-clip-text text-3xl font-black text-transparent ${step.color}`}>{step.number}</span></div><p className="mt-3 text-sm leading-relaxed text-slate-600">{step.text}</p></Card>)}
          </div>
        </div>
      </HomeSection>

      <HomeSection title="Konto nauczyciela, które od razu daje narzędzia" description="LekcjaLab porządkuje przygotowanie, prowadzenie lekcji i sprawdzanie efektów w jednym miejscu." accent="indigo">
        <div className="grid gap-4 md:grid-cols-3">
          {TEACHER_BENEFITS.map((benefit) => <Card key={benefit.title} className="group relative overflow-hidden border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70 p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/70"><span className="text-4xl">{benefit.icon}</span><h3 className="mt-4 text-xl font-black text-slate-950">{benefit.title}</h3><p className="mt-2 leading-relaxed text-slate-600">{benefit.text}</p><div className="absolute -right-10 -top-10 size-28 rounded-full bg-indigo-300/20 blur-2xl transition group-hover:bg-violet-300/35" /></Card>)}
        </div>
      </HomeSection>

      <HomeSection title="Twoja klasa dostaje konta w pakiecie" description="Nauczyciel zakłada klasę, wysyła zaproszenia i od razu otwiera uczniom bezpieczną przestrzeń do pracy." accent="emerald">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-7"><p className="text-sm font-black uppercase tracking-[.16em] text-emerald-700">Dla każdego ucznia</p><h3 className="mt-2 text-3xl font-black text-slate-950">Nie kupujesz osobnych kont dla dzieci.</h3><p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">Konto nauczyciela pozwala stworzyć klasę i zaprosić do niej uczniów. Każdy ma własne odpowiedzi, poprawki i nagrody — nauczyciel zachowuje pełny obraz postępów.</p><Link href="/rejestracja?role=teacher" className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-700">Załóż konto nauczyciela →</Link></Card>
          <div className="space-y-3">{STUDENT_BENEFITS.map((item, index) => <div key={item} className="flex gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-100 font-black text-emerald-800">{index + 1}</span><p className="pt-1 font-semibold leading-relaxed text-slate-700">{item}</p></div>)}</div>
        </div>
      </HomeSection>

      <HomeSection title="Lekcja bez chaosu" description="Różnicę widać zarówno podczas przygotowania, jak i po dzwonku." accent="violet">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
          <div className="grid grid-cols-[1fr_1fr] text-sm font-black sm:grid-cols-[1.15fr_1fr_1fr]"><div className="hidden bg-slate-950 p-5 text-white sm:block">Moment lekcji</div><div className="bg-slate-100 p-5 text-slate-700">Bez platformy</div><div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">Z LekcjaLab</div></div>
          {[['Przygotowanie', 'Pliki, linki i materiały w kilku miejscach.', 'Scenariusz, slajdy i aktywności są gotowe w jednym przepływie.'], ['Praca uczniów', 'Trudno zobaczyć, kto już rozumie temat.', 'Odpowiedzi i sygnał zrozumienia spływają podczas lekcji.'], ['Po lekcji', 'Ręczne zbieranie wyników i poprawki poza klasą.', 'Uczeń może wrócić do poprawki, a nauczyciel widzi wynik.']].map(([stage, without, withPlatform]) => <div key={stage} className="grid grid-cols-[1fr_1fr] border-t border-slate-100 text-sm sm:grid-cols-[1.15fr_1fr_1fr]"><div className="col-span-2 bg-slate-50 px-5 pt-4 font-black text-slate-950 sm:col-span-1 sm:bg-white sm:py-5">{stage}</div><div className="border-l border-slate-100 px-5 py-4 leading-relaxed text-slate-600">{without}</div><div className="border-l border-indigo-100 bg-indigo-50/60 px-5 py-4 font-semibold leading-relaxed text-indigo-950">{withPlatform}</div></div>)}
        </div>
      </HomeSection>

      <HomeSection id="dla-szkoly" title="Dla dyrektora: nowoczesna szkoła, która działa" description="LekcjaLab pomaga wprowadzać cyfrowe narzędzia w sposób, który wspiera nauczyciela, ucznia i organizację pracy szkoły." accent="indigo">
        <div className="grid gap-4 md:grid-cols-3"><Card className="bg-slate-950 text-white"><p className="text-3xl">🏫</p><h3 className="mt-4 text-xl font-black">Jedna przestrzeń dla szkoły</h3><p className="mt-2 leading-relaxed text-slate-300">Dane klas i uczniów są rozdzielone między szkołami, a nauczyciel może pracować w kilku kontekstach.</p></Card><Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white"><p className="text-3xl">✨</p><h3 className="mt-4 text-xl font-black">Widoczna innowacja</h3><p className="mt-2 leading-relaxed text-indigo-100">Tablica, tablety i aktywna lekcja tworzą doświadczenie, które uczniowie i rodzice naprawdę zauważają.</p></Card><Card className="bg-gradient-to-br from-cyan-50 to-emerald-50"><p className="text-3xl">🤝</p><h3 className="mt-4 text-xl font-black text-slate-950">Wsparcie dla zespołu</h3><p className="mt-2 leading-relaxed text-slate-600">Gotowe materiały ułatwiają nauczycielom wspólny start i konsekwentną pracę z klasami.</p></Card></div>
      </HomeSection>

      <HomeSteps steps={["Załóż konto nauczyciela.", "Poczekaj na aktywację konta przez administratora.", "Utwórz klasę i wyślij uczniom zaproszenia.", "Prowadź lekcję, obserwuj postęp i wracaj do trudnych tematów."]} />

      <section className="home-section-reveal my-16 overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 p-7 text-center text-white shadow-2xl shadow-indigo-200 sm:p-11">
        <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-100">Pierwszy krok jest prosty</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-5xl">Zabierz gotową matematykę na najbliższą lekcję.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">Załóż konto nauczyciela. Po aktywacji utworzysz klasę, zaprosisz uczniów i poprowadzisz pierwszą cyfrową lekcję.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/rejestracja?role=teacher" className="rounded-2xl bg-white px-6 py-3.5 font-black text-indigo-700 shadow-xl transition hover:-translate-y-1">Załóż konto nauczyciela →</Link><Link href="/logowanie" className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 font-black text-white transition hover:bg-white/20">Mam już konto</Link></div>
      </section>
    </main>
  );
}
