const WAYPOINTS = [
  { x: 54, y: 105, label: "Start" },
  { x: 230, y: 54, label: "Nawias" },
  { x: 430, y: 92, label: "Wynik" },
  { x: 666, y: 42, label: "Planeta" },
] as const;

const ROUTE_SEGMENTS = [
  "M 54 105 C 112 104, 162 61, 230 54",
  "M 230 54 C 300 42, 355 91, 430 92",
  "M 430 92 C 510 94, 582 43, 666 42",
] as const;

export function SpaceRouteMap({ completedSteps }: { completedSteps: number }) {
  const completed = Math.min(Math.max(completedSteps, 0), 3);
  const shipPosition = WAYPOINTS[completed];

  return <aside className="rounded-2xl border border-cyan-200/50 bg-slate-950/80 p-3 text-white shadow-xl backdrop-blur-md" aria-labelledby="space-route-how-title">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p id="space-route-how-title" className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Jak to działa?</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-200">Każda dobra karta zapala kolejny odcinek. Statek leci: <strong className="text-white">nawias → wynik → planeta</strong>.</p>
      </div>
      <span className="shrink-0 rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-indigo-950">{completed}/3</span>
    </div>

    <svg
      viewBox="0 0 720 150"
      className="mt-2 h-auto w-full overflow-visible rounded-xl"
      role="img"
      aria-label={`Mapa gwiezdna: ${completed === 0 ? "start trasy" : `statek przy punkcie ${completed}`}, ${completed} z 3 odcinków gotowych`}
      data-testid="space-route-map"
    >
      <defs>
        <linearGradient id="space-map-background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#172554" />
          <stop offset="0.55" stopColor="#312e81" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="space-map-route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#fde047" />
        </linearGradient>
        <filter id="space-map-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="720" height="150" rx="18" fill="url(#space-map-background)" />
      {[
        [92, 30], [152, 124], [285, 112], [350, 25], [505, 36], [570, 116], [625, 82], [690, 112],
      ].map(([x, y], index) => <circle key={`${x}-${y}`} cx={x} cy={y} r={index % 3 === 0 ? 2.4 : 1.5} fill="#e0f2fe" opacity={index % 2 === 0 ? 0.9 : 0.55} />)}

      {ROUTE_SEGMENTS.map((path, index) => <g key={path}>
        <path d={path} fill="none" stroke="#94a3b8" strokeWidth="5" strokeDasharray="10 10" opacity="0.38" />
        <path
          d={path}
          fill="none"
          stroke="url(#space-map-route)"
          strokeWidth="7"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={completed > index ? 0 : 1}
          className="space-map-route-segment"
          filter={completed > index ? "url(#space-map-glow)" : undefined}
        />
      </g>)}

      {WAYPOINTS.map((point, index) => {
        const reached = completed >= index;
        return <g key={point.label}>
          <circle cx={point.x} cy={point.y} r={index === 3 ? 22 : 14} fill={reached ? "#fde047" : "#334155"} stroke={reached ? "#cffafe" : "#64748b"} strokeWidth="4" filter={reached ? "url(#space-map-glow)" : undefined} />
          {index === 3 ? <circle cx={point.x - 7} cy={point.y - 5} r="4" fill="#f97316" opacity="0.8" /> : null}
          <text x={point.x} y={index % 2 === 0 ? point.y + 34 : point.y - 24} textAnchor="middle" fill={reached ? "#fef9c3" : "#cbd5e1"} fontSize="15" fontWeight="800">{point.label}</text>
        </g>;
      })}

      <g className="space-route-ship" style={{ transform: `translate(${shipPosition.x}px, ${shipPosition.y}px)` }} aria-hidden="true">
        <path d="M -7 -3 L 10 0 L -7 3 L -2 0 Z" fill="#f8fafc" stroke="#67e8f9" strokeWidth="2" />
        <path d="M -7 -2 L -15 0 L -7 2 Z" fill="#fb923c" />
      </g>
    </svg>

    <ol className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-black sm:text-xs">
      {["1. Policz nawias", "2. Użyj wyniku", "3. Dokończ"].map((label, index) => <li key={label} className={`rounded-lg px-2 py-2 ${completed > index ? "bg-emerald-300 text-emerald-950" : completed === index ? "bg-amber-200 text-amber-950 ring-2 ring-amber-100" : "bg-white/10 text-slate-300"}`}>{label}</li>)}
    </ol>
  </aside>;
}
