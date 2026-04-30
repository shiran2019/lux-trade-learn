import { Sparkles, Compass, Target, Cpu } from "lucide-react";

const steps = [
  { icon: Sparkles, title: "Beginner", desc: "Forex basics, currency pairs, market hours, and how price moves.", duration: "2 weeks" },
  { icon: Compass, title: "Chart Reading", desc: "Candlesticks, trends, support/resistance, and key indicators.", duration: "3 weeks" },
  { icon: Target, title: "Strategy", desc: "Build, test, and refine repeatable strategies with proper risk.", duration: "4 weeks" },
  { icon: Cpu, title: "AI Tools", desc: "Use AI tutors and journal analysis to compound your edge.", duration: "Ongoing" },
];

export function LearningPath() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-block rounded-full border border-[oklch(0.78_0.16_235/0.4)] bg-[oklch(0.78_0.16_235/0.05)] px-3 py-1 text-xs uppercase tracking-widest text-[oklch(0.78_0.16_235)]">Roadmap</div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">Your path to <span className="text-gradient-gold">consistent trading</span></h2>
          <p className="mt-4 text-muted-foreground">A clear, gradual progression — no overwhelm, no skipping fundamentals.</p>
        </div>

        <div className="relative mt-20">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent lg:block" />

          <div className="grid gap-6 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl glass-strong glow-gold">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="glass hover-lift rounded-2xl p-6 text-center">
                  <div className="mb-1 text-xs uppercase tracking-widest text-primary">Step 0{i + 1}</div>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.18_160)]" /> {s.duration}
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
