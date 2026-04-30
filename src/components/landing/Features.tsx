import { Brain, LineChart, GraduationCap, ShieldCheck, Wrench, BookOpenCheck } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Chart Explainer", desc: "Upload any chart and get instant, plain-English breakdowns of patterns, signals, and support levels.", tone: "primary" },
  { icon: LineChart, title: "Interactive Playground", desc: "Practice trades on a realistic candlestick simulator with no real money at risk.", tone: "bull" },
  { icon: GraduationCap, title: "Step-by-Step Courses", desc: "Structured paths from absolute beginner to advanced multi-timeframe analysis.", tone: "violet" },
  { icon: ShieldCheck, title: "Risk Management", desc: "Position sizing, stop-loss, and reward calculators built into every lesson.", tone: "gold" },
  { icon: Wrench, title: "Strategy Builder", desc: "Drag-and-drop indicators to design and backtest your own systems visually.", tone: "neon" },
  { icon: BookOpenCheck, title: "AI Trading Journal", desc: "Log your trades and get psychological & technical feedback after every session.", tone: "primary" },
] as const;

const toneStyles = {
  primary: { bg: "var(--gradient-primary)", glow: "var(--shadow-glow-primary)", chip: "border-primary/30 bg-primary/5 text-primary" },
  gold: { bg: "var(--gradient-gold)", glow: "var(--shadow-glow-gold)", chip: "border-[oklch(0.74_0.17_78/0.4)] bg-[oklch(0.74_0.17_78/0.08)] text-[oklch(0.55_0.15_60)]" },
  violet: { bg: "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.4 0.18 290))", glow: "0 10px 40px -10px oklch(0.55 0.22 295 / 0.5)", chip: "border-violet/30 bg-violet/5 text-violet" },
  bull: { bg: "var(--gradient-bull)", glow: "var(--shadow-glow-bull)", chip: "border-bull/30 bg-bull/5 text-bull" },
  neon: { bg: "linear-gradient(135deg, oklch(0.65 0.22 258), oklch(0.45 0.2 260))", glow: "var(--shadow-glow-neon)", chip: "border-neon/30 bg-neon/5 text-neon" },
} as const;

export function Features() {
  return (
    <section id="learn" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-block rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Platform</div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">Everything you need to <span className="text-gradient-gold">learn smart</span></h2>
          <p className="mt-4 text-muted-foreground">A complete trading education suite — visual, interactive, and powered by AI.</p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const t = toneStyles[f.tone];
            return (
              <div key={f.title} className="group glass hover-lift relative overflow-hidden rounded-md p-6">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md text-white" style={{ background: t.bg, boxShadow: t.glow }}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <div className="mt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary">0{i + 1} →</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
