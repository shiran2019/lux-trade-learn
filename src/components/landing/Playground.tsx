import { useState } from "react";
import { AnimatedChart } from "./AnimatedChart";
import { TrendingUp, TrendingDown } from "lucide-react";

export function Playground() {
  const [risk, setRisk] = useState(2);
  const balance = 10000;
  const stopPips = 25;
  const positionSize = ((balance * (risk / 100)) / stopPips).toFixed(2);

  return (
    <section id="tools" className="relative py-28">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Hands-on</div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">Practice in our <span className="text-gradient-gold">live playground</span></h2>
          <p className="mt-4 text-muted-foreground">Real charts, real mechanics, zero risk. Learn by doing.</p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {/* Chart sim */}
          <div className="glass-strong relative overflow-hidden rounded-2xl p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-display text-lg font-semibold">EUR/USD</div>
                <span className="rounded bg-[oklch(0.78_0.18_160/0.15)] px-2 py-0.5 text-xs text-[oklch(0.78_0.18_160)]">+0.42%</span>
                <span className="text-xs text-muted-foreground">15M · Live</span>
              </div>
              <div className="hidden gap-1 sm:flex">
                {["1M", "5M", "15M", "1H", "4H", "1D"].map((t) => (
                  <button key={t} className={`rounded-md px-2.5 py-1 text-xs transition-colors ${t === "15M" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-[oklch(0.13_0.02_260)] p-2">
              <AnimatedChart className="h-72 w-full" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center gap-2 rounded-lg bg-[oklch(0.78_0.18_160/0.15)] py-2.5 text-sm font-medium text-[oklch(0.78_0.18_160)] transition-all hover:bg-[oklch(0.78_0.18_160/0.25)]">
                <TrendingUp className="h-4 w-4" /> Buy
              </button>
              <button className="rounded-lg glass py-2.5 text-sm">Close</button>
              <button className="flex items-center justify-center gap-2 rounded-lg bg-[oklch(0.7_0.2_25/0.15)] py-2.5 text-sm font-medium text-[oklch(0.7_0.2_25)] transition-all hover:bg-[oklch(0.7_0.2_25/0.25)]">
                <TrendingDown className="h-4 w-4" /> Sell
              </button>
            </div>
          </div>

          {/* Risk calc */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="mb-1 text-xs uppercase tracking-widest text-primary">Risk Calculator</div>
            <h3 className="font-display text-xl font-semibold">Plan every trade</h3>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Account</span><span>${balance.toLocaleString()}</span></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Risk per trade</span><span className="text-primary">{risk}%</span></div>
                <input type="range" min="0.5" max="5" step="0.5" value={risk} onChange={(e) => setRisk(+e.target.value)}
                  className="mt-2 w-full accent-[oklch(0.82_0.14_86)]" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Stop loss</span><span>{stopPips} pips</span></div>
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-[var(--gradient-gold)]" style={{ width: "40%" }} />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="text-xs text-muted-foreground">Suggested position</div>
                <div className="font-display text-3xl font-bold text-gradient-gold">{positionSize}</div>
                <div className="text-xs text-muted-foreground">lots · max loss ${(balance * risk / 100).toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Pair visualizer */}
          <div className="glass-strong rounded-2xl p-5 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary">Strength Meter</div>
                <h3 className="font-display text-xl font-semibold">Currency strength right now</h3>
              </div>
              <span className="text-xs text-muted-foreground">Updated 14s ago</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {[
                { c: "USD", s: 78 }, { c: "EUR", s: 62 }, { c: "GBP", s: 55 }, { c: "JPY", s: 41 },
                { c: "AUD", s: 48 }, { c: "CAD", s: 52 }, { c: "CHF", s: 67 }, { c: "NZD", s: 35 },
              ].map((c) => (
                <div key={c.c} className="rounded-xl border border-border/60 bg-secondary/30 p-3">
                  <div className="flex justify-between text-xs"><span className="font-display font-semibold">{c.c}</span><span className="text-muted-foreground">{c.s}</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-background overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${c.s}%`,
                      background: c.s > 60 ? "var(--gradient-gold)" : c.s > 45 ? "oklch(0.78 0.16 235)" : "oklch(0.5 0.05 260)"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
