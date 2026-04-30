import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <nav className="glass-strong flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gradient-gold)] glow-gold">
              <LineChart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold">AI Forex</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Academy</div>
            </div>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {["Learn", "Tools", "AI", "Articles"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
            <Button variant="hero" size="sm">Get started</Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
