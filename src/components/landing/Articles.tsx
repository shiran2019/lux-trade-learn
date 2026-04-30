import { AnimatedChart } from "./AnimatedChart";

const articles = [
  { cat: "Basics", title: "What actually moves currency prices?", time: "6 min", color: "oklch(0.68 0.18 75)" },
  { cat: "Technical", title: "Reading candlestick patterns the right way", time: "9 min", color: "oklch(0.55 0.2 245)" },
  { cat: "Risk", title: "Position sizing for small accounts", time: "5 min", color: "oklch(0.6 0.23 25)" },
  { cat: "Psychology", title: "Why your best setups still lose", time: "8 min", color: "oklch(0.28 0.08 255)" },
  { cat: "Technical", title: "Multi-timeframe analysis in 4 steps", time: "11 min", color: "oklch(0.55 0.2 245)" },
  { cat: "Basics", title: "A complete glossary for new traders", time: "4 min", color: "oklch(0.62 0.18 155)" },
];

export function Articles() {
  return (
    <section id="articles" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-block rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Learning Hub</div>
            <h2 className="font-display text-4xl font-bold sm:text-5xl">Fresh, focused <span className="text-gradient-gold">articles</span></h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Basics", "Technical", "Risk", "Psychology"].map((c, i) => (
              <button key={c} className={`rounded-md px-4 py-1.5 text-xs transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <article key={a.title} className="group glass hover-lift overflow-hidden rounded-md">
              <div className="relative h-40 overflow-hidden border-b border-border/60" style={{ background: `linear-gradient(135deg, ${a.color}/0.2, transparent)` }}>
                <div className="absolute inset-0 grid-bg opacity-50" />
                <AnimatedChart className="absolute inset-0 h-full w-full opacity-70 transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="text-xs uppercase tracking-widest" style={{ color: a.color }}>{a.cat}</div>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">{a.title}</h3>
                <div className="mt-3 text-xs text-muted-foreground">{a.time} read</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
