import { Sparkles, Compass, Target, Cpu } from "lucide-react";

const steps = [
  { icon: Sparkles, title: "Beginner", desc: "Forex basics, currency pairs, market hours, and how price moves.", duration: "2 weeks", bg: "var(--gradient-primary)" },
  { icon: Compass, title: "Chart Reading", desc: "Candlesticks, trends, support/resistance, and key indicators.", duration: "3 weeks", bg: "var(--gradient-bull)" },
  { icon: Target, title: "Strategy", desc: "Build, test, and refine repeatable strategies with proper risk.", duration: "4 weeks", bg: "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.4 0.18 290))" },
  { icon: Cpu, title: "AI Tools", desc: "Use AI tutors and journal analysis to compound your edge.", duration: "Ongoing", bg: "var(--gradient-gold)" },
];

export function LearningPath() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-block rounded-md border border-violet/40 bg-violet/5 px-3 py-1 text-xs uppercase tracking-widest text-violet">Roadmap</div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">Your path to <span className="text-gradient-gold">consistent trading</span></h2>
          <p className="mt-4 text-muted-foreground">A clear, gradual progression — no overwhelm, no skipping fundamentals.</p>
        </div>

        <div className="relative mt-20">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />

          <div className="grid gap-6 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-md text-white shadow-lg" style={{ background: s.bg }}>
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="glass hover-lift rounded-md p-6 text-center">
                  <div className="mb-1 text-xs uppercase tracking-widest text-primary">Step 0{i + 1}</div>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-bull" /> {s.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
