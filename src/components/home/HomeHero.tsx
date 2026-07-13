"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const FLOW_STEPS: Array<{ label: string; color: string; delay: string }> = [
  { label: "Gotowa lekcja", color: "from-indigo-500 to-violet-600", delay: ".5s" },
  { label: "Aktywna klasa", color: "from-cyan-500 to-teal-600", delay: ".65s" },
  { label: "Czytelny wynik", color: "from-emerald-500 to-teal-600", delay: ".8s" },
];

const FLOATING_SYMBOLS = [
  { symbol: "π", className: "home-hero-symbol-pi", delay: "0s" },
  { symbol: "×", className: "home-hero-symbol-times", delay: "1.2s" },
  { symbol: "√", className: "home-hero-symbol-root", delay: "2.4s" },
  { symbol: "÷", className: "home-hero-symbol-divide", delay: "3.1s" },
  { symbol: "△", className: "home-hero-symbol-triangle", delay: "1.8s" },
  { symbol: "∞", className: "home-hero-symbol-infinity", delay: "3.7s" },
];

function HeroChrupekShowcase() {
  return (
    <div className="home-chrupek-hero relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-[2rem] border border-white/15 bg-cyan-900/30 shadow-2xl" aria-label="Chrupek w trzech wariantach: z tabletem, wskazujący i świętujący sukces">
      <div className="absolute inset-0 z-0 bg-cyan-300/10 blur-3xl" aria-hidden />
      <Image src="/materials/characters/chrupek/chrupek-home-hero-variants-v1.png" alt="Chrupek — bohater LekcjaLab — z tabletem, wskazujący materiał i świętujący sukces" fill sizes="(min-width: 1024px) 48vw, 90vw" className="z-0 object-cover object-center" priority />
      <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
        <span className="rounded-full border border-white/25 bg-slate-950/65 px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] text-cyan-100 shadow-lg backdrop-blur-md sm:px-4 sm:text-xs">Poznaj Chrupka</span>
        <span className="home-hero-badge rounded-2xl border border-amber-200/50 bg-amber-300 px-3 py-2 text-right text-[10px] font-black uppercase tracking-[.1em] text-amber-950 shadow-xl sm:px-4 sm:text-xs">20 rzadkich<br />naklejek</span>
      </div>
      <span className="absolute right-4 top-4 z-10 hidden rounded-full border border-cyan-100/25 bg-cyan-950/65 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-white backdrop-blur-md sm:block">Bohater LekcjaLab</span>
    </div>
  );
}

export function HomeHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="home-hero relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
      <div className="home-hero-aurora pointer-events-none absolute inset-0" aria-hidden />
      <div className="home-hero-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -left-20 top-10 size-72 rounded-full bg-violet-500/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 size-80 rounded-full bg-cyan-400/25 blur-3xl animate-float-delayed" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {FLOATING_SYMBOLS.map((item) => <span key={item.symbol} className={`home-hero-symbol ${item.className}`} style={{ animationDelay: item.delay }}>{item.symbol}</span>)}
        <span className="home-hero-orbit-line home-hero-orbit-line-one" />
        <span className="home-hero-orbit-line home-hero-orbit-line-two" />
      </div>

      <div className="relative z-10 grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-10">
        <div className="space-y-6">
          <div
            className={`space-y-4 transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-100 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Lekcja · tablica · tablet · dom
            </span>

            <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="home-hero-word inline-block" style={{ animationDelay: "0.15s" }}>
                Matematyka,
              </span>{" "}
              <span className="home-hero-word inline-block" style={{ animationDelay: "0.3s" }}>
                która
              </span>{" "}
              <span
                className="home-hero-word inline-block bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent"
                style={{ animationDelay: "0.45s" }}
              >
                wciąga klasę
              </span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-indigo-100/90 sm:text-xl">
              Gotowe lekcje na tablicę, aktywne zadania na tablety, powtórki w domu i informacja
              zwrotna w jednym miejscu. <strong className="font-bold text-white">Ty prowadzisz — LekcjaLab angażuje i porządkuje pracę.</strong>
            </p>
          </div>

          <div
            className={`flex flex-wrap gap-2 transition-all duration-700 delay-200 sm:gap-3 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            {FLOW_STEPS.map((step, index) => (
              <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`home-flow-chip rounded-xl bg-gradient-to-br px-3 py-2 text-xs font-bold text-white shadow-lg sm:px-4 sm:text-sm ${step.color}`}
                  style={{ animationDelay: step.delay }}
                >
                  {step.label}
                </span>
                {index < FLOW_STEPS.length - 1 && (
                  <span className="hidden text-white/40 sm:inline" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>

          <div
            className={`flex flex-wrap gap-3 pt-2 transition-all duration-700 delay-200 sm:gap-4 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <Link
              href="/rejestracja?role=teacher"
              className="home-cta-primary group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-indigo-700 shadow-xl shadow-indigo-900/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Załóż konto nauczyciela
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#jak-dziala"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              Zobacz, jak działa <span aria-hidden>↓</span>
            </a>
          </div>
        </div>

        <div
          className={`transition-all duration-1000 delay-200 ${visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"}`}
        >
          <HeroChrupekShowcase />
        </div>
      </div>
    </section>
  );
}
