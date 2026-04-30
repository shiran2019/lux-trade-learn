import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

interface PageShellProps {
  children: React.ReactNode;
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
}

export function PageShell({ children, eyebrow, title, description }: PageShellProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute inset-0 grid-bg opacity-30 -z-10" />
          <div className="mx-auto max-w-5xl px-4 text-center">
            {eyebrow && (
              <div className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">
                {eyebrow}
              </div>
            )}
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">{title}</h1>
            {description && (
              <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{description}</p>
            )}
          </div>
        </section>
        {children}
      </main>
      <Footer />
    </div>
  );
}
