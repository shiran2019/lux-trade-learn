import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <nav className="glass-strong flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-md text-white" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-primary)" }}>
              <LineChart className="h-5 w-5" strokeWidth={2.5} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full" style={{ background: "var(--gradient-gold)" }} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold">AI Forex</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Academy</div>
            </div>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Learn", to: "/learn" },
              { label: "Tools", to: "/tools" },
              { label: "AI", to: "/ai" },
              { label: "Articles", to: "/articles" },
              { label: "About", to: "/about" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-primary" activeProps={{ className: "text-primary font-medium" }}>
                {l.label}
              </Link>
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
