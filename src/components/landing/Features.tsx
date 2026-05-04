import { LineChart, GraduationCap, Bot } from "lucide-react";

const features = [
  {
    icon: LineChart,
    label: "01",
    title: "Interactive Trading Playground",
    desc: "Free forex trading simulator with live candlestick charts. Get instant technical analysis, pattern recognition, support/resistance levels, and AI-powered explanations.",
    tone: "bull" as const,
    accent: "var(--gradient-bull)",
    glow: "var(--shadow-glow-bull)",
    border: "oklch(0.65 0.22 142 / 0.25)",
  },
  {
    icon: GraduationCap,
    label: "02",
    title: "Structured Forex Courses",
    desc: "Complete trading education from beginner to advanced. Multi-timeframe analysis, technical indicators, risk management, and gold scalper strategies.",
    tone: "violet" as const,
    accent: "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.4 0.18 290))",
    glow: "0 10px 40px -10px oklch(0.55 0.22 295 / 0.5)",
    border: "oklch(0.55 0.22 295 / 0.25)",
  },
  {
    icon: Bot,
    label: "03",
    title: "AI Trading Tools & Bots",
    desc: "Free AI-powered trading analysis and premium trading bots. Use ChatGPT, Claude, Gemini for forex analysis. Download automated scalper bots for MT5.",
    tone: "primary" as const,
    accent: "var(--gradient-primary)",
    glow: "var(--shadow-glow-primary)",
    border: "oklch(0.55 0.22 262 / 0.25)",
  },
];

export function Features() {
  return (
    <section id="learn" className="relative py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8" aria-label="Platform Features">
      {/* subtle radial background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,oklch(0.18_0.06_262/0.35),transparent)]" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-block rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Trading Platform</div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
            Free Forex Trading <span className="text-gradient-gold">Education Platform</span>
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">Complete trading education suite — interactive simulators, AI tutors, technical analysis tools, and premium trading bots. Everything you need for US-based traders.</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-xl border bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ borderColor: f.border }}
            >
              {/* top accent bar */}
              <div className="absolute inset-x-0 top-0 h-[2px] opacity-60" style={{ background: f.accent }} />

              {/* icon */}
              <div
                className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg"
                style={{ background: f.accent, boxShadow: f.glow }}
              >
                <f.icon className="h-7 w-7" />
              </div>

              {/* label */}
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">{f.label}</div>

              <h3 className="font-display text-2xl font-bold leading-tight">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>

              {/* hover arrow */}
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/0 transition-all duration-300 group-hover:text-primary group-hover:text-muted-foreground/100">
                <span>Explore</span>
                <span className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>

              {/* bottom-right glow blob */}
              <div
                className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                style={{ background: f.accent }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
