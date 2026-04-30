export function AnimatedChart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 400" className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.82 0.14 86)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="oklch(0.88 0.13 90)" stopOpacity="1" />
          <stop offset="100%" stopColor="oklch(0.82 0.14 86)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="neonLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.78 0.16 235)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="oklch(0.78 0.16 235)" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.14 86)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="oklch(0.82 0.14 86)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* grid */}
      {[...Array(8)].map((_, i) => (
        <line key={i} x1="0" x2="800" y1={i * 50} y2={i * 50} stroke="oklch(1 0 0 / 0.04)" />
      ))}

      {/* area fill */}
      <path
        d="M0,280 C80,260 120,200 200,210 C280,220 320,160 400,150 C480,140 520,100 600,90 C680,80 740,120 800,110 L800,400 L0,400 Z"
        fill="url(#fillGrad)"
      />

      {/* main line */}
      <path
        d="M0,280 C80,260 120,200 200,210 C280,220 320,160 400,150 C480,140 520,100 600,90 C680,80 740,120 800,110"
        fill="none"
        stroke="url(#goldLine)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2000"
        style={{ animation: "chart-draw 8s ease-in-out infinite" }}
      />

      {/* secondary line */}
      <path
        d="M0,320 C100,300 180,280 260,260 C340,240 400,250 480,220 C560,190 640,200 720,170 C760,160 780,165 800,160"
        fill="none"
        stroke="url(#neonLine)"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        opacity="0.6"
      />

      {/* candlesticks */}
      {[
        { x: 60, h: 40, c: "up" },
        { x: 140, h: 30, c: "down" },
        { x: 220, h: 50, c: "up" },
        { x: 300, h: 25, c: "up" },
        { x: 380, h: 45, c: "down" },
        { x: 460, h: 60, c: "up" },
        { x: 540, h: 35, c: "up" },
        { x: 620, h: 28, c: "down" },
        { x: 700, h: 55, c: "up" },
      ].map((c, i) => {
        const color = c.c === "up" ? "oklch(0.78 0.18 160)" : "oklch(0.65 0.22 25)";
        const y = 200 - c.h / 2;
        return (
          <g key={i} opacity="0.7">
            <line x1={c.x} x2={c.x} y1={y - 10} y2={y + c.h + 10} stroke={color} strokeWidth="1" />
            <rect x={c.x - 5} y={y} width="10" height={c.h} fill={color} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}
