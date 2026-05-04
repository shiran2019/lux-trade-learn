import { ShieldCheck, GraduationCap, Eye, Lock } from "lucide-react";

const items = [
  { icon: GraduationCap, title: "Education first", desc: "We teach skills, not shortcuts. No 'get rich' promises — ever." },
  { icon: ShieldCheck, title: "Honest about risk", desc: "Trading carries risk of loss. We make sure you understand it before you start." },
  { icon: Eye, title: "Transparent", desc: "Every lesson, tool, and AI response is auditable and explained." },
  { icon: Lock, title: "Secure platform", desc: "Bank-level encryption. Your journal and data are private by default." },
];

export function Trust() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="glass-strong rounded-md p-6 sm:p-10 lg:p-14">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-3 inline-block rounded-md border border-[oklch(0.78_0.18_160/0.4)] bg-[oklch(0.78_0.18_160/0.05)] px-3 py-1 text-xs uppercase tracking-widest text-[oklch(0.78_0.18_160)]">Trust & Safety</div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">Built for learning,<br />not for <span className="text-gradient-gold">gambling</span></h2>
              <p className="mt-4 sm:mt-5 max-w-md text-sm sm:text-base text-muted-foreground">Forex involves substantial risk and is not suitable for every investor. Our mission is to make sure you trade with knowledge, discipline, and a real edge.</p>

              <div className="mt-4 sm:mt-6 rounded-md border border-border/60 bg-background/40 p-3 sm:p-4 text-xs text-muted-foreground">
                <strong className="text-foreground">Risk disclaimer:</strong> Past performance is not indicative of future results. You should never trade with money you cannot afford to lose. 
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {items.map((it) => (
                <div key={it.title} className="rounded-md border border-border/60 bg-background/40 p-4 sm:p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <it.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-semibold">{it.title}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
