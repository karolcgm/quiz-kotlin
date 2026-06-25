"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LekcjaLabLogo } from "@/components/brand/LekcjaLabLogo";

const FLOW_STEPS = [
  { label: "Symulacja", color: "from-indigo-400 to-violet-500", delay: "0ms" },
  { label: "Pytanie", color: "from-violet-400 to-purple-500", delay: "120ms" },
  { label: "Test", color: "from-purple-400 to-fuchsia-500", delay: "240ms" },
  { label: "Wynik", color: "from-fuchsia-400 to-pink-500", delay: "360ms" },
  { label: "Poprawa", color: "from-pink-400 to-rose-500", delay: "480ms" },
];

function HeroMathCanvas() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl home-hero-pulse" />
      <svg viewBox="0 0 400 400" className="relative size-full drop-shadow-2xl">
        <defs>
          <linearGradient id="home-axis-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="home-curve-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" className="home-hero-spin-slow" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="8 12" className="home-hero-spin-reverse" />

        <line x1="60" y1="320" x2="340" y2="320" stroke="url(#home-axis-grad)" strokeWidth="2" opacity="0.6" />
        <line x1="80" y1="340" x2="80" y2="60" stroke="url(#home-axis-grad)" strokeWidth="2" opacity="0.6" />

        <path
          d="M80 280 C130 80, 270 360, 340 120"
          fill="none"
          stroke="url(#home-curve-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          className="home-hero-curve"
        />

        <circle cx="340" cy="120" r="8" fill="#22d3ee" className="home-hero-orbit-dot" />

        <polygon
          points="280,90 310,150 250,150"
          fill="rgba(167,139,250,0.35)"
          stroke="#c4b5fd"
          strokeWidth="2"
          className="home-hero-float-a"
        />
        <rect
          x="110"
          y="100"
          width="48"
          height="48"
          rx="10"
          fill="rgba(52,211,153,0.25)"
          stroke="#6ee7b7"
          strokeWidth="2"
          className="home-hero-float-b"
        />
        <text x="128" y="132" fill="#ecfdf5" fontSize="22" fontWeight="700" className="home-hero-float-b">
          π
        </text>

        {[
          { x: 160, y: 200, t: "½" },
          { x: 240, y: 260, t: "×" },
          { x: 300, y: 200, t: "=" },
        ].map((item, index) => (
          <text
            key={item.t}
            x={item.x}
            y={item.y}
            fill="rgba(255,255,255,0.5)"
            fontSize="28"
            fontWeight="800"
            className="home-hero-spark"
            style={{ animationDelay: `${index * 0.6}s` }}
          >
            {item.t}
          </text>
        ))}
      </svg>
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

      <div className="relative z-10 grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-14">
        <div className="space-y-6">
          <div
            className={`transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            <LekcjaLabLogo size="lg" variant="light" showTagline animated />
          </div>

          <div
            className={`space-y-4 transition-all duration-700 delay-100 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-100 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Klasy 1–8 · tablica i tablet
            </span>

            <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="home-hero-word inline-block" style={{ animationDelay: "0.15s" }}>
                Matematyka,
              </span>{" "}
              <span className="home-hero-word inline-block" style={{ animationDelay: "0.3s" }}>
                którą
              </span>{" "}
              <span
                className="home-hero-word inline-block bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent"
                style={{ animationDelay: "0.45s" }}
              >
                widać
              </span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-indigo-100/90 sm:text-xl">
              Interaktywne symulacje na lekcję — uczniowie{" "}
              <strong className="font-bold text-white">widzą</strong>,{" "}
              <strong className="font-bold text-white">dotykają</strong> i{" "}
              <strong className="font-bold text-white">rozumieją</strong>, zanim otworzą zeszyt.
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
            className={`flex flex-wrap gap-3 pt-2 transition-all duration-700 delay-300 sm:gap-4 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <Link
              href="/symulacje"
              className="home-cta-primary group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-indigo-700 shadow-xl shadow-indigo-900/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Otwórz pomoce na lekcję
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/klasy"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              Wybierz klasę
            </Link>
          </div>
        </div>

        <div
          className={`transition-all duration-1000 delay-200 ${visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"}`}
        >
          <HeroMathCanvas />
        </div>
      </div>
    </section>
  );
}
