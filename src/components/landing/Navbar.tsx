import { Link, useLocation } from "@tanstack/react-router";
import { LineChart, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useState, useEffect } from "react";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Learning Lab", to: "/tools" },
    { label: "Free Tools", to: "/free-tools" },
    { label: "AI", to: "/ai" },
    { label: "About", to: "/about" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="glass-strong flex items-center justify-between rounded-md px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-md text-white" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-primary)" }}>
              <LineChart className="h-5 w-5" strokeWidth={2.5} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-md" style={{ background: "var(--gradient-gold)" }} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold">TradeMastery</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI.com</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-primary" activeProps={{ className: "text-primary font-medium" }}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen((o) => !o)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="md:hidden mt-2 glass-strong rounded-md px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
