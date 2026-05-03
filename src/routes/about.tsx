import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/landing/PageShell";
import { Trust } from "@/components/landing/Trust";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About TradeMasteryAI | Mission, Team & Vision" },
      { name: "description", content: "TradeMasteryAI mission: teach forex trading with honesty, clarity, and AI tools. Learn from experienced traders and educators. US-based trading education platform." },
      { name: "keywords", content: "about trading education, forex platform, trading school, forex education mission, trading community, traders team, learning platform" },
      { property: "og:title", content: "About TradeMasteryAI" },
      { property: "og:description", content: "Learn our mission: honest, clear forex education with AI tools. Built by traders for traders." },
    ],
  }),
});

function AboutPage() {
  return (
    <PageShell
      eyebrow="Our Mission"
      title={<>Built for learning, not for <span className="text-gradient-gold">gambling</span></>}
      description="We're a small team of traders, educators, and engineers building the school we wish we had."
    >
      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3">
          {[
            { n: "12,400+", l: "Active learners" },
            { n: "4.9/5", l: "Avg. rating" },
            { n: "120+", l: "Lessons & tools" },
          ].map((s) => (
            <div key={s.l} className="glass-strong rounded-md p-8 text-center">
              <div className="font-display text-4xl font-bold text-gradient-gold">{s.n}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
      <Trust />
    </PageShell>
  );
}
