import { Link } from "@tanstack/react-router";
import { LineChart, Twitter, Youtube, Github, Linkedin } from "lucide-react";

export function Footer() {
  const cols = [
    { t: "Learn", to: "/learn", l: ["Beginner Path", "Technical Analysis", "Risk Management", "Psychology"] },
    { t: "Tools", to: "/tools", l: ["Playground", "Risk Calculator", "Strategy Builder", "Journal"] },
    { t: "Articles", to: "/articles", l: ["Latest", "Basics", "Advanced", "Glossary"] },
    { t: "About", to: "/about", l: ["Mission", "Team", "Careers", "Contact"] },
  ] as const;
  return (
    <footer className="relative border-t border-border/60 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gradient-gold)] glow-gold">
                <LineChart className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display font-bold">AI Forex Academy</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trade with knowledge</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground">A premium education platform combining AI tutors, interactive tools, and structured courses to teach forex the right way.</p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Youtube, Github, Linkedin].map((I, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg glass transition-colors hover:text-primary">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.t}>
              <div className="font-display text-sm font-semibold">{c.t}</div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {c.l.map((i) => (
                  <li key={i}><a href="#" className="transition-colors hover:text-primary">{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} AI Forex Academy. All rights reserved.</div>
          <div className="max-w-xl text-center sm:text-right">Risk warning: Trading foreign exchange carries a high level of risk and may not be suitable for all investors.</div>
        </div>
      </div>
    </footer>
  );
}
