"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

interface LekcjaLabLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "color";
  showTagline?: boolean;
  animated?: boolean;
}

const sizeMap = {
  sm: { mark: 36, text: "text-lg", tagline: "text-[10px]" },
  md: { mark: 48, text: "text-xl", tagline: "text-xs" },
  lg: { mark: 64, text: "text-2xl", tagline: "text-sm" },
  xl: { mark: 88, text: "text-4xl", tagline: "text-sm" },
};

export function LekcjaLabLogo({
  className,
  size = "md",
  variant = "color",
  showTagline = false,
  animated = true,
}: LekcjaLabLogoProps) {
  const uid = useId().replace(/:/g, "");
  const gradOuter = `ll-grad-outer-${uid}`;
  const gradInner = `ll-grad-inner-${uid}`;
  const glow = `ll-glow-${uid}`;
  const dims = sizeMap[size];
  const textClass =
    variant === "light"
      ? "text-white"
      : variant === "dark"
        ? "text-slate-900"
        : "bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent";

  const taglineClass =
    variant === "light" ? "text-white/70" : variant === "dark" ? "text-slate-500" : "text-slate-500";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn("relative shrink-0", animated && "lekcjalab-logo-float")}
        style={{ width: dims.mark, height: dims.mark }}
        aria-hidden
      >
        <svg viewBox="0 0 88 88" fill="none" className="size-full">
          <defs>
            <linearGradient id={gradOuter} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="45%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id={gradInner} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            x="4"
            y="4"
            width="80"
            height="80"
            rx="22"
            stroke={`url(#${gradOuter})`}
            strokeWidth="2.5"
            className={animated ? "lekcjalab-logo-ring" : undefined}
            fill={variant === "light" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.95)"}
          />

          <g filter={`url(#${glow})`}>
            <path
              d="M18 58 L18 30 L38 30 L38 42 L28 42 L28 58 Z"
              fill={`url(#${gradOuter})`}
              className={animated ? "lekcjalab-logo-letter" : undefined}
            />
            <path
              d="M44 58 L44 30 L64 30 L64 42 L54 42 L54 58 Z"
              fill={`url(#${gradInner})`}
              className={animated ? "lekcjalab-logo-letter-delayed" : undefined}
            />
          </g>

          <path
            d="M14 68 C28 52, 38 72, 52 58 S72 48, 74 38"
            stroke={`url(#${gradInner})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className={animated ? "lekcjalab-logo-curve" : undefined}
          />

          <circle
            cx="74"
            cy="38"
            r="4"
            fill="#22d3ee"
            className={animated ? "lekcjalab-logo-dot" : undefined}
          />

          {[18, 44, 70].map((cx, index) => (
            <circle
              key={cx}
              cx={cx}
              cy={14 + index * 2}
              r="2"
              fill={index === 0 ? "#6366f1" : index === 1 ? "#8b5cf6" : "#22d3ee"}
              className={animated ? "lekcjalab-logo-spark" : undefined}
              style={{ animationDelay: `${index * 0.4}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="min-w-0">
        <p className={cn("font-black tracking-tight", dims.text, textClass, animated && "lekcjalab-logo-shimmer")}>
          LekcjaLab
        </p>
        {showTagline && (
          <p className={cn("font-medium tracking-wide", dims.tagline, taglineClass)}>
            matematyka, którą widać
          </p>
        )}
      </div>
    </div>
  );
}
