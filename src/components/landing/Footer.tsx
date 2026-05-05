import { Link } from "@tanstack/react-router";
import { LineChart, Twitter, Youtube, Github, Linkedin } from "lucide-react";

export function Footer() {
  const cols = [
    { t: "Learn", to: "/learn", l: ["Beginner Path", "Technical Analysis", "Risk Management", "Trading Psychology"] },
    { t: "Free Tools", to: "/tools", l: ["Live Trading Playground", "Risk Calculator", "Strategy Builder", "Trading Journal"] },
    { t: "AI Trading", to: "/ai", l: ["ChatGPT for Trading", "AI Bots", "Prompt Templates", "Forex Analysis"] },
    { t: "About", to: "/about", l: ["Our Mission", "Team", "Contact", "Blog"] },
  ] as const;
  return (
    <footer className="relative border-t border-border/60 pt-16 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-md text-white" style={{ background: "var(--gradient-primary)" }}>
                <LineChart className="h-5 w-5" strokeWidth={2.5} />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-md" style={{ background: "var(--gradient-gold)" }} />
              </div>
              <div>
                <div className="font-display font-bold text-sm">TradeMasteryAI</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">TradeMasteryAI.com</div>
              </div>
            </div>
            <p className="mt-4 sm:mt-5 max-w-sm text-xs sm:text-sm text-muted-foreground">Free forex trading education platform. Learn technical analysis, gold scalper strategies, and trading psychology with AI tutors, interactive simulators, and premium trading tools for US traders.</p>
            <div className="mt-4 sm:mt-6 flex gap-3">
              {[Twitter, Youtube, Github, Linkedin].map((I, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-md glass transition-colors hover:text-primary">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.t}>
              <Link to={c.to} className="font-display text-xs sm:text-sm font-semibold transition-colors hover:text-primary">{c.t}</Link>
              <ul className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm text-muted-foreground">
                {c.l.map((i) => (
                  <li key={i}><a href="#" className="transition-colors hover:text-primary">{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-4 sm:pt-6 text-[10px] sm:text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} TradeMasteryAI.com. All rights reserved.</span>
            <span className="text-muted-foreground/80">Version 2</span>
          </div>
          <div className="max-w-xl text-center sm:text-right">Risk warning: Trading foreign exchange carries a high level of risk and may not be suitable for all investors.</div>
        </div>
      </div>
    </footer>
  );
}
