import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatedChart } from "./AnimatedChart";
import { TrendingUp, TrendingDown, BarChart2, ShieldCheck, Layers } from "lucide-react";

export function Playground() {
  const [risk, setRisk] = useState(2);
  const balance = 10000;
  const stopPips = 25;
  const positionSize = ((balance * (risk / 100)) / stopPips).toFixed(2);

  return (
    <section id="tools" className="relative py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-block rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Hands-on</div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">Practice in our <span className="text-gradient-gold">live playground</span></h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
            Real charts, real mechanics, zero risk. Learn by doing — simulate trades, manage position sizing, and read live currency strength, all in one place.
          </p>

          {/* feature pills */}
          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
            {[
              { icon: BarChart2, label: "Live candlestick simulator" },
              { icon: ShieldCheck, label: "Risk & position sizing" },
              { icon: Layers, label: "Currency strength meter" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 sm:px-4 py-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden text-[10px]">{label.split(" ")[0]}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)] transition-all hover:opacity-90 hover:shadow-lg"
            >
              Go to Learning Lab →
            </Link>
          </div>
        </div>

        <div className="mt-10 sm:mt-16 grid gap-4 sm:gap-5 lg:grid-cols-3">
          {/* Chart sim */}
          <div className="glass-strong relative overflow-hidden rounded-md p-3 sm:p-5 lg:col-span-2">
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="font-display text-base sm:text-lg font-semibold">EUR/USD</div>
                <span className="rounded bg-[oklch(0.78_0.18_160/0.15)] px-2 py-0.5 text-xs text-[oklch(0.78_0.18_160)]">+0.42%</span>
                <span className="text-xs text-muted-foreground">15M · Live</span>
              </div>
              <div className="hidden gap-1 sm:flex">
                {["1M", "5M", "15M", "1H", "4H", "1D"].map((t) => (
                  <button key={t} className={`rounded-md px-2.5 py-1 text-xs transition-colors ${t === "15M" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-secondary/40 p-2">
              <AnimatedChart className="h-48 sm:h-72 w-full" />
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center gap-2 rounded-md bg-bull/15 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-bull transition-all hover:bg-bull/25 hover:shadow-[var(--shadow-glow-bull)]">
                <TrendingUp className="h-4 w-4" /> <span className="hidden sm:inline">Buy</span><span className="sm:hidden">B</span>
              </button>
              <button className="rounded-md glass py-2 sm:py-2.5 text-xs sm:text-sm font-medium">Close</button>
              <button className="flex items-center justify-center gap-2 rounded-md bg-bear/15 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-bear transition-all hover:bg-bear/25">
                <TrendingDown className="h-4 w-4" /> <span className="hidden sm:inline">Sell</span><span className="sm:hidden">S</span>
              </button>
            </div>
          </div>

          {/* Risk calc */}
          <div className="glass-strong rounded-md p-3 sm:p-5">
            <div className="mb-1 text-xs uppercase tracking-widest text-primary">Risk Calculator</div>
            <h3 className="font-display text-lg sm:text-xl font-semibold">Plan every trade</h3>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Account</span><span>${balance.toLocaleString()}</span></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Risk per trade</span><span className="text-primary">{risk}%</span></div>
                <input type="range" min="0.5" max="5" step="0.5" value={risk} onChange={(e) => setRisk(+e.target.value)}
                  className="mt-2 w-full accent-[oklch(0.32_0.13_268)]" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Stop loss</span><span>{stopPips} pips</span></div>
                <div className="mt-2 h-1.5 rounded-md bg-secondary overflow-hidden">
                  <div className="h-full" style={{ width: "40%", background: "var(--gradient-gold)" }} />
                </div>
              </div>

              <div className="mt-4 sm:mt-6 rounded-md border border-primary/30 bg-primary/5 p-3 sm:p-4">
                <div className="text-xs text-muted-foreground">Suggested position</div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-gradient-gold">{positionSize}</div>
                <div className="text-xs text-muted-foreground">lots · max loss ${(balance * risk / 100).toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Pair visualizer */}
          <div className="glass-strong rounded-md p-3 sm:p-5 lg:col-span-3">
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary">Strength Meter</div>
                <h3 className="font-display text-lg sm:text-xl font-semibold">Currency strength right now</h3>
              </div>
              <span className="text-xs text-muted-foreground">Updated 14s ago</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {[
                { c: "USD", s: 78 }, { c: "EUR", s: 62 }, { c: "GBP", s: 55 }, { c: "JPY", s: 41 },
                { c: "AUD", s: 48 }, { c: "CAD", s: 52 }, { c: "CHF", s: 67 }, { c: "NZD", s: 35 },
              ].map((c) => (
                <div key={c.c} className="rounded-md border border-border/60 bg-secondary/30 p-2 sm:p-3">
                  <div className="flex justify-between text-xs"><span className="font-display font-semibold text-sm">{c.c}</span><span className="text-muted-foreground text-xs">{c.s}</span></div>
                  <div className="mt-2 h-1.5 rounded-md bg-background overflow-hidden">
                    <div className="h-full rounded-md" style={{
                      width: `${c.s}%`,
                      background: c.s > 60 ? "var(--gradient-gold)" : c.s > 45 ? "var(--gradient-bull)" : "var(--gradient-bear)"
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
