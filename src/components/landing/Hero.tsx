import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { AnimatedChart } from "./AnimatedChart";

const ticker = [
  { p: "EUR/USD", v: "1.0823", d: "+0.42%", up: true },
  { p: "GBP/USD", v: "1.2675", d: "-0.18%", up: false },
  { p: "USD/JPY", v: "151.32", d: "+0.65%", up: true },
  { p: "AUD/USD", v: "0.6584", d: "+0.21%", up: true },
  { p: "USD/CAD", v: "1.3712", d: "-0.09%", up: false },
  { p: "NZD/USD", v: "0.5961", d: "+0.34%", up: true },
  { p: "EUR/GBP", v: "0.8542", d: "-0.12%", up: false },
  { p: "XAU/USD", v: "2387.4", d: "+1.05%", up: true },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* Background chart */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-x-0 top-20 -z-10 opacity-30">
        <AnimatedChart className="h-[500px] w-full" />
      </div>
      <div className="absolute -left-32 top-40 h-72 w-72 rounded-md bg-[oklch(0.82_0.14_86/0.25)] blur-3xl animate-glow-pulse" />
      <div className="absolute -right-32 top-60 h-96 w-96 rounded-md bg-[oklch(0.78_0.16_235/0.2)] blur-3xl animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs animate-fade-up">
            <span className="flex h-2 w-2 rounded-md bg-bull animate-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">AI-powered learning · Markets open</span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Learn Forex Trading
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-gold-shine)" }}>Visually with AI</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Master trading step-by-step with interactive charts, an AI tutor, and real-time playgrounds — no jargon, no gimmicks.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl">
              Start Learning <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="neon" size="xl">
              <Play className="h-4 w-4" /> Open Trading Playground
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <span>★ 4.9 from 12,400+ learners</span>
            <span className="hidden sm:inline">· No credit card required</span>
          </div>
        </div>
      </div>

      {/* Live ticker */}
      <div className="relative mt-20 overflow-hidden border-y border-border/60 bg-secondary/40 py-3 backdrop-blur">
        <div className="flex w-max gap-12 animate-ticker">
          {[...ticker, ...ticker].map((t, i) => (
            <div key={i} className="flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="font-display font-semibold tracking-wide">{t.p}</span>
              <span className="text-muted-foreground">{t.v}</span>
              <span className={`flex items-center gap-1 font-semibold ${t.up ? "text-bull" : "text-bear"}`}>
                <span>{t.d}</span>
                <span className="text-[10px]">{t.up ? "▲" : "▼"}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
