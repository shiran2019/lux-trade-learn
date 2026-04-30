import { Sparkles, MessageSquare, BookOpen, AlertTriangle } from "lucide-react";

const tools = [
  { icon: Sparkles, title: "Explain this chart", color: "primary" },
  { icon: MessageSquare, title: "AI Trading Tutor", color: "neon" },
  { icon: BookOpen, title: "Journal Analyzer", color: "primary" },
  { icon: AlertTriangle, title: "Mistake Detector", color: "neon" },
];

export function AITools() {
  return (
    <section id="ai" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-3 inline-block rounded-full border border-[oklch(0.78_0.16_235/0.4)] bg-[oklch(0.78_0.16_235/0.05)] px-3 py-1 text-xs uppercase tracking-widest text-[oklch(0.78_0.16_235)]">AI Suite</div>
            <h2 className="font-display text-4xl font-bold sm:text-5xl">An AI tutor that <span className="text-gradient-gold">trades alongside you</span></h2>
            <p className="mt-4 text-muted-foreground">Ask questions in plain English, paste screenshots of your trades, and get personalized feedback in seconds.</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {tools.map((t) => (
                <button key={t.title} className={`group glass hover-lift flex items-center gap-3 rounded-xl p-4 text-left ${t.color === "neon" ? "hover:border-[oklch(0.78_0.16_235/0.6)]" : ""}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${t.color === "primary" ? "bg-primary/15 text-primary" : "bg-[oklch(0.78_0.16_235/0.15)] text-[oklch(0.78_0.16_235)]"}`}>
                    <t.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{t.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mock AI chat */}
          <div className="glass-strong relative rounded-3xl p-6 glow-gold">
            <div className="absolute -top-3 left-6 rounded-full bg-[var(--gradient-gold)] px-3 py-1 text-xs font-semibold text-primary-foreground">AI Tutor · Live</div>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-secondary" />
                <div className="rounded-2xl rounded-tl-sm bg-secondary/50 px-4 py-3 text-sm">
                  Hey! I just opened a long on EUR/USD at 1.0820. What do you think?
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <div className="rounded-2xl rounded-tr-sm bg-[oklch(0.82_0.14_86/0.15)] border border-primary/30 px-4 py-3 text-sm">
                  Looking at the 15M chart — you entered right at a clean support flip with bullish momentum. Solid setup. 👌
                  <div className="mt-2 text-xs text-muted-foreground">Suggest a stop at 1.0795 (25 pip risk) for a 1:3 R:R targeting 1.0895.</div>
                </div>
                <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--gradient-gold)] glow-gold" />
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-secondary" />
                <div className="rounded-2xl rounded-tl-sm bg-secondary/50 px-4 py-3 text-sm">
                  What if price breaks below 1.0795?
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <div className="rounded-2xl rounded-tr-sm bg-[oklch(0.82_0.14_86/0.15)] border border-primary/30 px-4 py-3 text-sm">
                  Then the bullish thesis is invalidated. Close it, journal it, move on. <span className="text-primary">No revenge trades.</span>
                </div>
                <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--gradient-gold)] glow-gold" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-4 py-3">
              <input placeholder="Ask anything about your trade…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <button className="rounded-lg bg-[var(--gradient-gold)] px-3 py-1.5 text-xs font-semibold text-primary-foreground">Send</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
