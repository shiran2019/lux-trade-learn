import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Link } from "@tanstack/react-router";

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
    <section className="dark relative flex min-h-screen flex-col overflow-hidden px-4 pt-28 pb-12 sm:px-6 sm:pt-32 sm:pb-14 lg:px-8">
      {/* Video background */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/Bg-Video.mp4" type="video/mp4" />
      </video>

      {/* Readability overlays */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%),linear-gradient(to_bottom,rgba(8,14,28,0.35),rgba(8,14,28,0.82))]" />

      <div className="relative z-10 mx-auto my-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
        

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.45)] sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="relative inline-block px-2 sm:px-3 py-0.5">
              <span className="absolute inset-0 rounded-lg bg-[oklch(0.1_0.022_268/0.40)] backdrop-blur-sm" />
              <span className="relative">Forex Trading</span>
            </span>
            <br />
            <span className="relative mt-1 inline-block px-2 sm:px-3 py-0.5">
              <span className="absolute inset-0 rounded-lg bg-[oklch(0.1_0.022_268/0.35)] backdrop-blur-sm" />
              <span className="relative bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, oklch(0.65 0.18 268) 0%, oklch(0.72 0.2 295) 45%, oklch(0.78 0.17 78) 100%)" }}>with AI</span>
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 animate-fade-up sm:mt-6 sm:text-lg" style={{ animationDelay: "0.2s" }}>
            Master forex trading with AI-powered tools and expert guides. Learn how to leverage AI for smarter trading decisions with free access to premium simulators, gold scalper strategies and real-time analysis
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/free-tools">
              <Button variant="hero" size="xl">
                Free Tools <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/tools">
              <Button variant="gold" size="xl">
                <Play className="h-4 w-4" /> Open Learning Lab
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/75 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1">★ 4.9 from 12,400+ learners</span>
            <span className="hidden rounded-full border border-white/20 bg-black/25 px-3 py-1 sm:inline">No credit card required</span>
          </div>
        </div>
      </div>

      {/* Live ticker */}
      <div  className="relative z-10 mt-10 overflow-hidden rounded-xl border border-white/15 bg-black/35 py-3 backdrop-blur-sm sm:mt-14">
        <div className="flex w-max gap-12 animate-ticker">
          {[...ticker, ...ticker].map((t, i) => (
            <div key={i} className="flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="font-display font-semibold tracking-wide text-white">{t.p}</span>
              <span className="text-white/70">{t.v}</span>
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
