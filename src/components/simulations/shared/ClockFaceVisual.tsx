"use client";

import { formatDigitalTime, hourHandAngle, minuteHandAngle, normalizeHour } from "@/lib/math/clock";

interface ClockFaceVisualProps {
  hour: number;
  minute: number;
  showDigital?: boolean;
  hideHourHand?: boolean;
  size?: "md" | "lg";
}

export function ClockFaceVisual({
  hour,
  minute,
  showDigital = true,
  hideHourHand = false,
  size = "lg",
}: ClockFaceVisualProps) {
  const hourAngle = hourHandAngle(hour, minute);
  const minuteAngle = minuteHandAngle(minute);
  const maxClass = size === "lg" ? "max-w-md" : "max-w-xs";

  return (
    <div className="mx-auto w-full space-y-3">
      <svg
        viewBox="0 0 240 240"
        className={`mx-auto w-full ${maxClass}`}
        role="img"
        aria-label={`Zegar wskazuje ${formatDigitalTime(hour, minute)}`}
      >
        <defs>
          <radialGradient id="clockFace" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fffef7" />
            <stop offset="100%" stopColor="#fef3c7" />
          </radialGradient>
        </defs>

        <circle cx="120" cy="120" r="108" fill="url(#clockFace)" stroke="#d97706" strokeWidth="6" />
        <circle cx="120" cy="120" r="100" fill="none" stroke="#fde68a" strokeWidth="2" />

        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index + 1) * 30 * (Math.PI / 180);
          const outerX = 120 + Math.sin(angle) * 92;
          const outerY = 120 - Math.cos(angle) * 92;
          const innerX = 120 + Math.sin(angle) * 82;
          const innerY = 120 - Math.cos(angle) * 82;
          const labelX = 120 + Math.sin(angle) * 72;
          const labelY = 120 - Math.cos(angle) * 72;
          const number = index + 1;

          return (
            <g key={number}>
              <line x1={innerX} y1={innerY} x2={outerX} y2={outerY} stroke="#92400e" strokeWidth={number % 3 === 0 ? 4 : 2} strokeLinecap="round" />
              <text x={labelX} y={labelY + 5} textAnchor="middle" className="fill-amber-950 text-lg font-black">
                {number}
              </text>
            </g>
          );
        })}

        {Array.from({ length: 60 }).map((_, index) => {
          if (index % 5 === 0) return null;
          const angle = index * 6 * (Math.PI / 180);
          const x1 = 120 + Math.sin(angle) * 88;
          const y1 = 120 - Math.cos(angle) * 88;
          const x2 = 120 + Math.sin(angle) * 92;
          const y2 = 120 - Math.cos(angle) * 92;
          return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fcd34d" strokeWidth="1" />;
        })}

        <g transform={`rotate(${minuteAngle} 120 120)`}>
          <line x1="120" y1="120" x2="120" y2="42" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <circle cx="120" cy="42" r="4" fill="#334155" />
        </g>

        {!hideHourHand && (
          <g transform={`rotate(${hourAngle} 120 120)`}>
            <line x1="120" y1="120" x2="120" y2="62" stroke="#4338ca" strokeWidth="6" strokeLinecap="round" />
            <circle cx="120" cy="62" r="5" fill="#4338ca" />
          </g>
        )}

        <circle cx="120" cy="120" r="8" fill="#d97706" stroke="#92400e" strokeWidth="2" />
        <circle cx="120" cy="120" r="3" fill="#fffef7" />
      </svg>

      {showDigital && (
        <p className="text-center font-mono text-4xl font-black tracking-wider text-slate-800">
          {formatDigitalTime(hour, minute)}
        </p>
      )}
    </div>
  );
}

export function hourLabel(hour: number): string {
  return `${normalizeHour(hour)}`;
}
