import { Brain, LineChart, GraduationCap, ShieldCheck, Wrench, BookOpenCheck } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Chart Explainer", desc: "Upload any chart and get instant, plain-English breakdowns of patterns, signals, and support levels." },
  { icon: LineChart, title: "Interactive Playground", desc: "Practice trades on a realistic candlestick simulator with no real money at risk." },
  { icon: GraduationCap, title: "Step-by-Step Courses", desc: "Structured paths from absolute beginner to advanced multi-timeframe analysis." },
  { icon: ShieldCheck, title: "Risk Management", desc: "Position sizing, stop-loss, and reward calculators built into every lesson." },
  { icon: Wrench, title: "Strategy Builder", desc: "Drag-and-drop indicators to design and backtest your own systems visually." },
  { icon: BookOpenCheck, title: "AI Trading Journal", desc: "Log your trades and get psychological & technical feedback after every session." },
];

export function Features() {
  return (
    <section id="learn" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Platform</div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">Everything you need to <span className="text-gradient-gold">learn smart</span></h2>
          <p className="mt-4 text-muted-foreground">A complete trading education suite — visual, interactive, and powered by AI.</p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} className="group glass hover-lift relative overflow-hidden rounded-2xl p-6">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl  glow-gold" style={{ background: "var(--gradient-gold)" }}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="mt-5 text-xs font-medium uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">0{i + 1} →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
